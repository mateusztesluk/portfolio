FROM golang:1.23-alpine AS builder

WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .
RUN go mod tidy && CGO_ENABLED=0 GOOS=linux go build -o website-monitor ./cmd/server

FROM alpine:3.20

WORKDIR /app

# Needed for HTTPS certificate verification (x509) in Go.
RUN apk add --no-cache ca-certificates

COPY --from=builder /app/website-monitor ./website-monitor

EXPOSE 8085

CMD ["./website-monitor"]
