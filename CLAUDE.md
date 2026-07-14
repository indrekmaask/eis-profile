# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

EIS Central Customer Profile (procurement trial work): a cross-application company profile built on the once-only principle. An Angular Module Federation shell + profile remote, a Spring Boot BLL, and a vendored external-register mock API. See `docs/IMPLEMENTATION_PLAN.md` (full plan) and `docs/TASKS.md` (phase tasks, IDs like `P4-2` referenced in commits).

**Language convention:** UI strings are Estonian (product language); code, docs and commit messages are in English.

**Comments:** keep them minimal — only for hacks, workarounds, or non-obvious/complex logic (the *why*). Do not add comments that narrate what the code already says.

## Commands

### Full stack (Docker, the canonical way to run)

```bash
docker compose up --build
```

Services: shell http://localhost:4200 (entry point), profile-mfe :4201, backend :8080 (`/actuator/health`), mock API :3000 (Swagger at `/api/docs`), backend PostgreSQL on host port **5433** (db/user/pass `eis_profile`/`eis`/`eis`).

### Frontend (repo root)

```bash
npm run run:all        # MF dev server: shell (4200) + profile-mfe (4201) together
npx ng serve shell     # or one app at a time
npx ng serve profile-mfe
npx ng test shell      # vitest via @angular/build:unit-test
npx ng test profile-mfe
npm run build          # ng build
```

### Backend (`backend/`)

```bash
./gradlew test                                          # requires Docker (Testcontainers PostgreSQL)
./gradlew test --tests "ee.eis.profile.BllLogicTest"    # single test class
POSTGRES_PORT=5433 ./gradlew bootRun                    # against the compose postgres
```

## Architecture

### Frontend: webpack Module Federation (deliberately NOT esbuild)

Angular is pinned to **21** and both apps use the classic webpack builder (`ngx-build-plus` + `@angular-architects/module-federation`), because literal webpack MF requires it. Do not migrate to the esbuild/application builder.

- `apps/shell` — MF **host**: portal chrome (sidebar/header), mock login, role selection ("Vali roll"), dashboard (`Töölaud`), services list/detail/application flows, maturity (`kupsus/`) pages. Routes in `apps/shell/src/app/app.routes.ts`; the `/profile` route lazy-loads the remote via `loadRemoteModule` + `apps/shell/public/mf.manifest.json` (maps `profileMfe` → `http://localhost:4201/remoteEntry.js`).
- `apps/profile-mfe` — MF **remote**: exposes `./Component` (its root `App`) in `webpack.config.js`. Internally switches between `ProfileOverview` and `ProfileEdit` (stepper) via component state, not routes.
- `libs/` — shared via tsconfig paths: `@dds/ui` (DDS design-system components), `@dds/tokens` (design tokens/fonts), `@eis/profile-api` (DTO models, person-code derivation, API service).

### Shell ↔ MFE contract

There is no real auth (no TARA/RIA). `IdentityService` (shell) holds a mock identity — 11-digit person code + active company — mirrored to sessionStorage. The shell passes context to the remote **via URL query params** `?rc=<registryCode>&person=<personCode>`; `ProfilePage` re-reads them on every `NavigationEnd` and feeds `ProfileContextService`. Birth date/age are derived client-side from the person code (once-only principle — never asked from the user).

### Backend: Spring Boot 4 / Java 25 (`backend/`, package `ee.eis.profile`)

Layered: `api` (ProfileController + DTOs) → `service` (ProfileCommandService, ProfileQueryService, ProfileLookupService, completeness calculator, discrepancy detector, validation) → `domain` (JPA entities) + `repository` → `integration` (RegistryClient → mock API; CrmClient is a no-op behind the `CRM_ENABLED` flag, default off).

REST API under `/api`:
- `GET /profiles/{registryCode}` — profile view
- `GET /profiles/{registryCode}/prefill` — once-only prefill from the register
- `POST /profiles` — create
- `PATCH /profiles/{registryCode}/step/{step}` — stepper-based partial update
- `POST /profiles/{registryCode}/refresh` — re-sync from register
- `GET /access` — profile access / role info

Persistence: PostgreSQL schema `profile`, Flyway migrations in `src/main/resources/db/migration` plus seed data in `db/seed` (`V900__seed_biomarket.sql`); Hibernate runs `ddl-auto: validate`, so **every schema change needs a new Flyway migration**. Register data is snapshotted per source (`ProfileSourceSnapshot`) for provenance, and `DiscrepancyDetector` compares stored vs. register values on refresh.

Backend tests are `@SpringBootTest` with a Testcontainers PostgreSQL container — Docker must be running.

### External register mock

`external/business-profile-mock-api` is a vendored (pinned, not a live submodule) register simulation with its own PostgreSQL. Backend reaches it via `REGISTRY_API_BASE_URL`. Contract: `GET /api/v1/companies/{8-digit-registry-code}`.

## Test data

- Companies: `10966560` Biomarket OÜ (seeded profile), `16789012` Porgand OÜ, `16890123` Karu Koobas OÜ (no profile — tests the create flow).
- Default demo person: `48505150220` Eva Tamm (seeded Biomarket OWNER).

## Handover constraints (procurement)

Full commit history must stay visible; files must not be deleted before the framework agreement is signed.
