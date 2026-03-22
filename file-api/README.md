# file-api

REST API w **Play Framework 3** (Scala 3) + **AWS SDK v2 (S3)** — zapis i odczyt plików w buckecie zgodnym z S3 (np. MinIO).

Konfiguracja jest w pliku **`.env.cfg`** (jak w `account/`, `blog/`, `monitor/`): zmienne z prefiksem `FILE_API_`. Obraz Dockera kopiuje ten plik do `/opt/file-api/.env.cfg` i **`entrypoint.sh`** wczytuje go przed startem JVM (`set -a` / `set +a`).

## MinIO (lokalne repozytorium S3)

```bash
cd file-api

docker run -d \
  --name minio \
  --network portfolio-net \
  -p 9000:9000 \
  -p 9001:9001 \
  --env-file minio.env.cfg \
  -v minio-data:/data \
  quay.io/minio/minio server /data --console-address ":9001"
```

- Endpoint S3 z hosta: `http://127.0.0.1:9000`

## `.env.cfg` — zmienne

| Zmienna | Opis | Przykład |
|---------|------|----------|
| `FILE_API_S3_ENDPOINT` | URL API S3 | `http://minio:9000` (Docker) / `http://127.0.0.1:9000` (lokalnie) |
| `FILE_API_S3_REGION` | Region (SDK) | `us-east-1` |
| `FILE_API_S3_ACCESS_KEY` | Klucz | `minioadmin` |
| `FILE_API_S3_SECRET_KEY` | Sekret | `minioadmin` |
| `FILE_API_S3_BUCKET` | Bucket (tworzony przy starcie, jeśli brak) | `files` |
| `FILE_API_HTTP_PORT` | Port HTTP Play | `8080` |
| `FILE_API_HTTP_HOST` | Adres nasłuchu | `0.0.0.0` |
| `FILE_API_PLAY_HTTP_SECRET` | Sekret Play (JWT/HS256) — **min. ~256 bitów entropii** (np. `openssl rand -hex 32`) | patrz `.env.cfg` |

Dostosuj **`FILE_API_S3_ENDPOINT`** w `.env.cfg` do sieci (np. `http://minio:9000` w tej samej sieci Docker co MinIO).

## Uruchomienie lokalnie

```bash
cd file-api
set -a && . ./.env.cfg && set +a
sbt run
```

## Docker (obraz z `sbt stage`; `.env.cfg` w obrazie)

Build musi widzieć **`.env.cfg`** w katalogu kontekstu (jest kopiowany do obrazu).

```bash
docker build -t file-api:latest .

docker run --rm -p 8080:8080 file-api:latest
```

Nadpisanie konfiguracji bez przebudowy obrazu — podmień plik w kontenerze (ma pierwszeństwo względem wbudowanego):

```bash
docker run --rm -p 8080:8080 \
  -v "$(pwd)/.env.cfg:/opt/file-api/.env.cfg:ro" \
  file-api:latest
```

(`entrypoint.sh` wczytuje `/opt/file-api/.env.cfg` przy każdym starcie.)

Na Linuxie, gdy MinIO działa na hoście, a API w Dockerze, w `.env.cfg` ustaw np. `FILE_API_S3_ENDPOINT=http://172.17.0.1:9000` albo użyj `host.docker.internal` tam, gdzie jest dostępne.

## API

Obiekt w S3 jest zapisywany pod **kluczem = UUID** (bez folderów w ścieżce). Oryginalna nazwa pliku trafia w **metadane** S3 (`original-filename`).

- **POST** `/files` lub `/files/` — upload; odpowiedź JSON: `{"id":"<uuid>","name":"..."}`  
  - **Multipart:** część **`file`** (nazwa z pola pliku / `filename` w multipart).  
  - **Raw:** nagłówek **`X-Original-Filename`** (opcjonalnie), treść = surowe bajty.
- **GET** `/files/{uuid}` — pobranie; nagłówek `Content-Disposition: inline; filename="..."` żeby **obrazy otwierały się w przeglądarce**, a nie jako plik do zapisu.
- **DELETE** `/files/{uuid}` — usunięcie.

```bash
# upload (multipart — nazwa z pliku)
curl -sS -X POST -F "file=@photo.jpg" http://localhost:8080/files/
# {"id":"550e8400-e29b-41d4-a716-446655440000","name":"photo.jpg"}

# upload (raw + nazwa w nagłówku)
curl -sS -X POST --data-binary @photo.jpg \
  -H "Content-Type: image/jpeg" \
  -H "X-Original-Filename: photo.jpg" \
  http://localhost:8080/files

ID=550e8400-e29b-41d4-a716-446655440000

curl -sS -O -J "http://localhost:8080/files/$ID"

curl -sS -X DELETE -w "\n%{http_code}\n" "http://localhost:8080/files/$ID"
```
