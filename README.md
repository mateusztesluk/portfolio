# Portfolio

**Strona:** [http://31.3.218.11/](http://31.3.218.11/)

Projekt do nauki Reacta i mikroserwisów po stronie backendu.

## Stack (Docker Compose)

| Serwis | Rola | Język / runtime | Wersja (Dockerfile / moduł) | Krótko |
|--------|------|-----------------|----------------------------|--------|
| **client** | GUI (SPA + nginx) | TypeScript, React | Node 20 (build SPA), nginx 1.27 | Frontend portfolio; reverse proxy do API pod `/blogs`, `/account`, `/file-api`, `/monitor-api` |
| **account** | Backend | Python, Django REST | Python 3.12, Django 4.2 | Autoryzacja, użytkownicy, JWT |
| **blog** | Backend | Python, Flask | Python 3.12, Flask 3.0 | API bloga |
| **file-api** | Backend | Scala, Play | Scala 3.3, JVM 21 | Serwis plików (S3 przez MinIO) |
| **website-monitor** | Backend | Go | Go 1.23 | API monitorów / health-checków |
| **portfolio-postgres** | Infra | PostgreSQL | 16 (Alpine) | Wspólna baza dla account, blog, monitor |
| **minio** | Infra | MinIO | obraz `latest` | Object storage (pliki dla file-api) |

Konfiguracja frontu w runtime: `client/public/config.js` (montowany do kontenera `client`).

### Uruchomienie całego stacku

Z katalogu głównego repozytorium (wymagane pliki `account/.env.cfg`, `blog/.env.cfg`, `monitor/.env.cfg`, `file-api/.env.cfg`):

```bash
docker compose up --build
```

Aplikacja pod **http://localhost** (port 80).

### Pull obrazów i start (np. na serwerze)

```bash
docker compose pull && docker compose up -d
```


