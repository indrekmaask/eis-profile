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

Below, `<postgres>`, `<backend>`, `<mock-api>`, `<profile-mfe>` are the **names
you give each service** in Railway. Substitute them in the `${{ ... }}` references.

## 1. Database — one Postgres instance, TWO databases

Deploy a single Postgres service `<postgres>` from image `postgres:18-alpine`
with a volume at `/var/lib/postgresql/data`. Variables:

- `POSTGRES_USER` = `eis`
- `POSTGRES_PASSWORD` = *(a generated secret)*
- `POSTGRES_DB` = `eis_profile`   ← created on first init (backend's DB)
- `PGDATA` = `/var/lib/postgresql/data/pgdata`

Both apps share this one instance but use **separate databases** (isolated by
DB, and internally by schema):

- `eis_profile` — backend/BLL (schema `profile`, Flyway migrates+seeds on boot).
- `business_profile` — mock-api (schema `business_registry`).

**Manual one-time step (required):** the vendored mock-api's first migration runs
`ALTER DATABASE business_profile …` (hard-coded DB name in
`external/business-profile-mock-api/src/db/migrations/001-initial-schema.sql`),
so a database literally named `business_profile` must exist — pointing mock-api at
`eis_profile` fails. `POSTGRES_DB` only creates one DB at init, so create the
second manually once (it persists on the volume). Add a temporary TCP proxy to
`<postgres>` (Settings → Networking → TCP Proxy, target port 5432), then:

```sh
psql "postgresql://eis:<password>@<proxy-host>:<proxy-port>/eis_profile" \
  -c "CREATE DATABASE business_profile OWNER eis;"
```

Remove the TCP proxy afterwards. mock-api creates its own `business_registry`
schema + seed data on boot.

## 2. `<mock-api>` — external register mock (private only)

- **Root Directory:** `external/business-profile-mock-api`
- **Dockerfile:** auto-detected (`Dockerfile` in root dir)
- **Variables:**
  - `DATABASE_URL` = `postgresql://eis:<password>@${{<postgres>.RAILWAY_PRIVATE_DOMAIN}}:5432/business_profile`
  - `PORT` = `3000`
- No public domain. Reads `PORT` + `DATABASE_URL`; binds all interfaces.

## 3. `<backend>` — Spring Boot BLL (private only)

- **Root Directory:** `backend`
- **Dockerfile:** auto-detected (`backend/Dockerfile`)
- **Variables:**
  - `POSTGRES_HOST` = `${{<postgres>.RAILWAY_PRIVATE_DOMAIN}}`
  - `POSTGRES_PORT` = `5432`
  - `POSTGRES_DB` = `eis_profile`
  - `POSTGRES_USER` = `eis`
  - `POSTGRES_PASSWORD` = *(same secret as `<postgres>`)*
  - `REGISTRY_API_BASE_URL` = `http://${{<mock-api>.RAILWAY_PRIVATE_DOMAIN}}:3000`
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
