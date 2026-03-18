#!/bin/sh
set -e

# If DATABASE_URL points to localhost inside Docker, rewrite to host gateway.
if [ -n "$DATABASE_URL" ]; then
  case "$DATABASE_URL" in
    *@localhost:*|*@127.0.0.1:*)
      DATABASE_URL="$(printf '%s' "$DATABASE_URL" | sed -e 's/@localhost:/@host.docker.internal:/g' -e 's/@127.0.0.1:/@host.docker.internal:/g')"
      export DATABASE_URL
      echo "[entrypoint] DATABASE_URL host adjusted to host.docker.internal"
      ;;
  esac
fi

exec "$@"
