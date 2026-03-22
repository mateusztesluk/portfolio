# syntax=docker/dockerfile:1
FROM eclipse-temurin:21-jdk-jammy AS builder

ARG SBT_VERSION=1.10.7
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && curl -fsSL "https://github.com/sbt/sbt/releases/download/v${SBT_VERSION}/sbt-${SBT_VERSION}.tgz" \
    | tar xz -C /usr/local \
  && ln -sf /usr/local/sbt/bin/sbt /usr/local/bin/sbt

WORKDIR /app
COPY project project
COPY build.sbt .
COPY conf conf
COPY app app

RUN sbt -batch -Dsbt.rootdir=true stage

FROM eclipse-temurin:21-jre-jammy

RUN groupadd --system app && useradd --system --gid app --no-create-home app
WORKDIR /opt/file-api

COPY --from=builder /app/target/universal/stage/ ./

COPY .env.cfg /opt/file-api/.env.cfg
COPY entrypoint.sh /opt/file-api/entrypoint.sh
RUN chmod +x /opt/file-api/entrypoint.sh

RUN chown -R app:app /opt/file-api
USER app

EXPOSE 8080

ENTRYPOINT ["/opt/file-api/entrypoint.sh"]
