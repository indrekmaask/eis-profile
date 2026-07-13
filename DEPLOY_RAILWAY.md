# Deploying to Railway

The stack runs as **6 Railway services** in one project/environment: two managed
Postgres databases plus four services built from the Dockerfiles already in this
repo. Services talk to each other over Railway's private network
(`*.railway.internal`) using reference variables; only `shell` and `profile-mfe`
get public domains.

> Why the code changed for Railway: locally the stack relies on Docker Compose
> (fixed ports `80`/`8080`, Docker DNS `127.0.0.11`, service name `backend`, and a
> `localhost:4201` MF manifest). On Railway each service listens on the injected
> `$PORT`, resolves peers via `*.railway.internal`, and the browser must fetch the
> MF remote from a **public** URL. The nginx configs are now envsubst templates
> (`${PORT}`, `${BACKEND_URL}`, `${RESOLVER}`) with Dockerfile `ENV` defaults that
> keep `docker compose up` working unchanged.

## Service reference-variable placeholders

Below, `<backend-db>`, `<mock-db>`, `<backend>`, `<mock-api>`, `<profile-mfe>`
are the **names you give each service** in Railway. Substitute them in the
`${{ ... }}` references.

## 1. Databases (managed)

Add two Postgres via **New → Database → Add PostgreSQL**:

- `<backend-db>` — schema/seed applied automatically by the backend's Flyway on boot.
- `<mock-db>` — schema/seed applied automatically by the mock-api on boot.

No config needed; each exposes `PGDATABASE/PGUSER/PGPASSWORD`,
`DATABASE_PRIVATE_URL`, and `RAILWAY_PRIVATE_DOMAIN`.

## 2. `<mock-api>` — external register mock (private only)

- **Root Directory:** `external/business-profile-mock-api`
- **Dockerfile:** auto-detected (`Dockerfile` in root dir)
- **Variables:**
  - `DATABASE_URL` = `${{<mock-db>.DATABASE_PRIVATE_URL}}`
- No public domain. Listens on `$PORT` automatically.

## 3. `<backend>` — Spring Boot BLL (private only)

- **Root Directory:** `backend`
- **Dockerfile:** auto-detected (`backend/Dockerfile`)
- **Variables:**
  - `POSTGRES_HOST` = `${{<backend-db>.RAILWAY_PRIVATE_DOMAIN}}`
  - `POSTGRES_PORT` = `5432`
  - `POSTGRES_DB` = `${{<backend-db>.PGDATABASE}}`
  - `POSTGRES_USER` = `${{<backend-db>.PGUSER}}`
  - `POSTGRES_PASSWORD` = `${{<backend-db>.PGPASSWORD}}`
  - `REGISTRY_API_BASE_URL` = `http://${{<mock-api>.RAILWAY_PRIVATE_DOMAIN}}:${{<mock-api>.PORT}}`
  - `CRM_ENABLED` = `false`
- No public domain (only the frontends call it, privately). Listens on `$PORT`
  (`application.yml` reads `${PORT:...}`).

## 4. `<profile-mfe>` — MF remote (PUBLIC)

Build context must be the **repo root** (the Dockerfile copies `libs/`, `apps/`,
`package.json`), so keep Root Directory at `/` and point at the nested Dockerfile:

- **Root Directory:** `/`
- **Variables:**
  - `RAILWAY_DOCKERFILE_PATH` = `apps/profile-mfe/Dockerfile`
  - `BACKEND_URL` = `http://${{<backend>.RAILWAY_PRIVATE_DOMAIN}}:${{<backend>.PORT}}`
- **Networking:** click **Generate Domain** (the shell's browser fetches
  `remoteEntry.js` from here cross-origin).

## 5. `shell` — MF host / entry point (PUBLIC)

- **Root Directory:** `/`
- **Variables:**
  - `RAILWAY_DOCKERFILE_PATH` = `apps/shell/Dockerfile`
  - `BACKEND_URL` = `http://${{<backend>.RAILWAY_PRIVATE_DOMAIN}}:${{<backend>.PORT}}`
  - `PROFILE_MFE_URL` = `https://${{<profile-mfe>.RAILWAY_PUBLIC_DOMAIN}}`
- **Networking:** click **Generate Domain** — this is the app URL users open.

## Notes

- Deploy order doesn't matter for config (reference vars resolve at deploy time),
  but the databases should exist before backend/mock-api first boot.
- `BACKEND_URL` must be set on **both** frontends — the nginx `/api/` proxy block
  is invalid if it renders empty.
- `PROFILE_MFE_URL` has **no trailing slash** (the manifest appends `/remoteEntry.js`).
- The backend and mock-api need no public domain; keep them private to reduce surface.
