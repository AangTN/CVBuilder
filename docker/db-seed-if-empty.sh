#!/bin/sh
set -e

echo "[db-seed] Checking database state..."

# Wait until PostgreSQL is ready.
until PGPASSWORD="$POSTGRES_PASSWORD" pg_isready -h db -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; do
  sleep 2
done

TABLE_COUNT="$(PGPASSWORD="$POSTGRES_PASSWORD" psql -h db -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';" | tr -d '[:space:]')"

if [ "$TABLE_COUNT" = "0" ]; then
  echo "[db-seed] Empty database detected. Importing /seed/cvonline.sql ..."

  # Remove owner reassignment lines to avoid role mismatch issues on new servers.
  sed '/^SET transaction_timeout = /d; /^ALTER TABLE .* OWNER TO /d; /^ALTER SEQUENCE .* OWNER TO /d' /seed/cvonline.sql \
    | PGPASSWORD="$POSTGRES_PASSWORD" psql -v ON_ERROR_STOP=1 -h db -U "$POSTGRES_USER" -d "$POSTGRES_DB"

  echo "[db-seed] Import completed."
else
  echo "[db-seed] Database already has $TABLE_COUNT table(s). Skipping import."
fi
