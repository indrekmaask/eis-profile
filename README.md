# EIS Central Customer Profile — Trial Work (Procurement 311047)

Central, cross-application company profile for the EIS self-service environment, built on the once-only principle. See [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) for the full plan and [`TASKS.md`](./TASKS.md) for the phase-by-phase task breakdown.

## Stack

| Layer | Technology |
|---|---|
| Backend / BLL | Java 25, Spring Boot 4 |
| Frontend | Angular 21, webpack Module Federation (`@angular-architects/module-federation`) |
| Database | PostgreSQL 18 |
| External register | Provided mock API (git submodule under `external/`) |
| Runtime | Docker / Docker Compose |

> Angular is pinned to **21** (within the allowed 20/21/22 range): the `@angular-architects/module-federation` plugin's latest release is 21.2.x, so literal webpack Module Federation requires Angular 21.

## Repository layout

```
apps/shell        Angular MF host (shell: nav, header, mock identity switcher, "Vali roll")
apps/profile-mfe  Angular MF remote ("ettevõtte profiil")
libs/             Shared design tokens (dds-tokens), DDS UI (dds-ui), DTO types (profile-model)
backend/          Java 25 + Spring Boot 4 (BLL, integration, JPA, Flyway)
external/         Mock API (git submodule — external register simulation)
docs/             Source documents, ERD
```

## Prerequisites

- Docker Engine + Docker Compose v2/v5
- git (with submodule support)

No local Java / Node install is required — everything builds inside containers.

## Getting started

```bash
# 1. Clone
git clone <repo-url> eis-kliendiprofiil
cd eis-kliendiprofiil

# 2. Copy env defaults
cp .env.example .env

# 3. Build and start everything
docker compose up --build
```

> The mock API is vendored under `external/business-profile-mock-api` (plain files, no submodule) — a pinned copy of the provided register simulation. A plain clone is enough.

### Services & ports

| Service | URL / port | Notes |
|---|---|---|
| Shell (frontend host) | http://localhost:4200 | Entry point |
| Profile MFE (remote) | http://localhost:4201 | Loaded by the shell via `remoteEntry.js` |
| Backend (BLL) | http://localhost:8080 | Health: `/actuator/health` |
| Mock API (register) | http://localhost:3000 | Swagger: `/api/docs`; `GET /api/v1/companies/{8-digit}` |
| Backend PostgreSQL | localhost:5433 | DB `eis_profile` (user/pass from `.env`) |
| Mock-API PostgreSQL | internal | Owned by the mock API |

### Smoke test

```bash
curl http://localhost:8080/actuator/health          # {"status":"UP"}
curl http://localhost:3000/api/v1/companies/10966560 # Biomarket OÜ register data
```

Test companies: `10966560` Biomarket OÜ, `16789012` Porgand OÜ, `16890123` Karu Koobas OÜ.

## Handover rules (procurement)

- GitHub access is granted to `martinroos-eis` and `rvaher`.
- Full commit history must remain visible; the last version before the eRHR submission deadline is what is evaluated.
- Files must not be deleted before the framework agreement is signed.
- The video walkthrough (≤20 min) is uploaded unlisted and referenced from eRHR.

_UI strings are in Estonian (product language); code, docs and commit messages are in English._
