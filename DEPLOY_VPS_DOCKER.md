# Deploy To VPS With Docker (CVBuilder)

## 1. Prepare environment files

You can deploy in 2 ways:

1. Manual deploy on VPS:

```bash
git pull --ff-only origin main
# create and edit:
# - .env
# - cv-backend/.env
# - cv-frontend/.env
```

2. GitHub Actions deploy (recommended):

- Workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) will generate:
  - root `.env` for `docker compose`
  - `cv-backend/.env`
  - `cv-frontend/.env`

## 1.1 Required GitHub secrets

### VPS access

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`
- `VPS_PORT` (optional, default `22`)
- `VPS_APP_DIR` (example: `/var/www/cvbuilder`)
- `VPS_REPO_URL` (example: `git@github.com:org/repo.git`)

### Database and ports

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DB_PORT` (optional, default `5432`)
- `API_PORT` (optional, default `3001`)
- `HTTP_PORT` (optional, default `3000`)

### App URLs

- `FRONTEND_URL` (example: `https://cvbuilder.your-domain.com`)
- `API_BASE_URL` (example: `https://api.cvbuilder.your-domain.com`)
- `NEXT_PUBLIC_SITE_URL` (usually same as `FRONTEND_URL`)
- `NEXT_PUBLIC_API_URL` (usually same as `API_BASE_URL`)
- `API_SERVER_URL` (optional, default `http://backend:3001`)
- `FRONTEND_EXPORT_URL` (optional, default `http://frontend:3000`)

### Application secrets

- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `EXPORT_RENDER_KEY`
- `REVALIDATE_SECRET`
- `GOOGLE_CLIENT_ID` (required if using Google login)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (optional, defaults to `GOOGLE_CLIENT_ID`)
- `GROQ_API_KEY` (optional, required if using AI features)
- `REQUEST_BODY_LIMIT` (optional, default `20mb`)
- `PDF_MAX_CONCURRENT` (optional, default `3`)

## 2. Run locally or on VPS

```bash
docker compose build --pull
docker compose up -d --remove-orphans
```

When database is empty, service `db-seed` automatically imports `cv-backend/cvonline.sql`.
If database already has tables, import is skipped.

## 3. Verify

- Frontend: `http://YOUR_HOST:HTTP_PORT` (default `3000`)
- Backend API: `http://YOUR_HOST:API_PORT` (default `3001`)
- DB container: `docker compose ps db`
- DB seed logs: `docker compose logs --tail 50 db-seed`

Apply database migrations (recommended after first deploy or schema changes):

```bash
docker compose exec -T db sh -c 'until pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do sleep 2; done'
docker compose run --rm backend npx prisma migrate deploy
```

## 4. Update after new push

```bash
git pull --ff-only origin main
docker compose build --pull
docker compose up -d --remove-orphans
docker compose exec -T db sh -c 'until pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do sleep 2; done'
docker compose run --rm backend npx prisma migrate deploy
```

## 5. Stop services

```bash
docker compose down
```

PostgreSQL data is persisted in Docker volume `postgres_data`.
