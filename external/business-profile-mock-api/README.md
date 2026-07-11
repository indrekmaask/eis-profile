# Business Profile Mock API

A small read-only REST API that returns Estonian company profile data from a PostgreSQL database.

No authentication. Only `GET` endpoints.

---

## Tech stack

| Component   | Version          | Source                       |
|-------------|------------------|------------------------------|
| Node.js     | 22 (alpine)      | `Dockerfile`                 |
| TypeScript  | ^5.7.2           | `package.json`               |
| Express     | ^5.1.0           | `package.json`               |
| pg (driver) | ^8.13.1          | `package.json`               |
| PostgreSQL  | 18 (alpine)      | `docker/postgres/Dockerfile` |
| Vitest      | ^2.1.8           | `package.json`               |

## Prerequisites

- Docker + Docker Compose
- Node.js 22 and npm (only if you want to run the API outside Docker)

---

## Quick start

```bash
docker compose up --build
```

That's it. After the containers report healthy:

- API → http://localhost:3000
- Swagger UI → http://localhost:3000/api/docs
- OpenAPI JSON → http://localhost:3000/api/openapi.json
- Health check → http://localhost:3000/health

The database, the schema, and the seed data are all set up automatically on first start. There is no separate `migrate` or `seed` command — read the next section for why.

---

## How the database gets set up

On startup, `initializeDatabase()` (`src/db/database.ts`) does the following:

1. Creates a `schema_history` table if it does not exist (tracks what has already run).
2. Runs every `*.sql` file in `src/db/migrations/` in alphabetical order, inside a transaction.
3. Runs every `*.sql` file in `src/db/seeds/` the same way.
4. Records each applied filename in `schema_history` so it is not run again on the next start.

All tables live in the `business_registry` schema. The migration sets the default `search_path` for the database, and the pg pool also sets it on every new connection — repository queries can use unqualified table names like `FROM companies`.

### Adding new migrations or seeds

Create a new file with the next number, e.g. `002-add-foo.sql`. Never edit an existing applied file — it will not re-run.

### Resetting the database from scratch

If you change an existing migration or seed file and want it re-applied:

```bash
docker compose down -v   # -v drops the pgdata volume
docker compose up --build
```

---

## Sample data

Seed file: `src/db/seeds/001-sample-company.sql`. It loads three companies you can hit directly:

| Registry code | Company         |
|---------------|-----------------|
| `10966560`    | Biomarket OÜ    |
| `16789012`    | Porgand OÜ      |
| `16890123`    | Karu Koobas OÜ  |

Try it:

```bash
curl http://localhost:3000/api/v1/companies/10966560
```
`registryCode` must be exactly 8 digits.

---


## Running outside Docker (optional)

If you prefer to run the Node app on the host and only the DB in Docker:

```bash
docker compose up db        # start Postgres only
npm install
npm run dev                 # tsx watch mode on port 3000
```

The default `DATABASE_URL` in `.env.example` already points at `localhost:5432`.

---

## Scripts

| Command            | What it does                              |
|--------------------|-------------------------------------------|
| `npm run dev`      | Start the API in watch mode (`tsx watch`) |
| `npm test`         | Run the Vitest suite (no DB needed)       |
| `npm run typecheck`| Run `tsc --noEmit`                        |
| `npm run build`    | Compile TypeScript to `dist/`             |
| `npm start`        | Run the compiled `dist/index.js`          |

The tests use an in-memory fake `CompanyReader`, so you can run `npm test` without any database or containers running.

---

## Project layout

```text
src/
  index.ts           # entry — boots DB, then starts Express
  app.ts             # Express app factory
  config/            # env parsing
  db/
    database.ts      # migration/seed runner
    pool.ts          # pg Pool, sets search_path on connect
    migrations/      # *.sql, applied in order, once each
    seeds/           # *.sql, applied in order, once each
  middleware/        # error handler, request logger
  openapi/           # OpenAPI 3.0.3 document
  repositories/      # SQL queries
  routes/            # Express routers
  services/          # business logic
  types/             # shared TS types
  __tests__/         # Vitest specs
docker/postgres/     # Postgres 18 image
docs/                # design + runbook docs
```

---

## Environment variables

| Name           | Default                                                                        | Notes                                            |
|----------------|--------------------------------------------------------------------------------|--------------------------------------------------|
| `PORT`         | `3000`                                                                         | HTTP port                                        |
| `DATABASE_URL` | `postgresql://business_profile:business_profile@localhost:5432/business_profile` | Inside Compose the host becomes `db`             |
| `CORS_ORIGIN`  | `http://localhost:5173,http://localhost:3000`                                  | Comma-separated allowlist of CORS origins        |

`docker-compose.yml` overrides `DATABASE_URL` so the `api` container talks to the `db` container — you don't need to change anything in `.env` to make Compose work.
