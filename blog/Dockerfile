FROM python:3.12-alpine

WORKDIR /app

RUN apk update
RUN apk add --no-cache bash
RUN apk add --no-cache gcc musl-dev linux-headers libpq python3-dev postgresql-dev libffi-dev openssl-dev

COPY . .
RUN pip install -r requirements.txt

RUN chmod +x /app/entrypoint.sh

CMD ["/app/entrypoint.sh"]