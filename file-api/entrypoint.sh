#!/bin/sh
set -e
if [ -f /opt/file-api/.env.cfg ]; then
  set -a
  # shellcheck disable=SC1091
  . /opt/file-api/.env.cfg
  set +a
fi
exec /opt/file-api/bin/file-api "$@"
