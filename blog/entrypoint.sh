#!/bin/sh
set -e

flask db upgrade

exec gunicorn --bind 0.0.0.0:"${PORT:-8000}" app.wsgi:app --reload

