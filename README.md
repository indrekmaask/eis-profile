# EIS Central Customer Profile

Central, cross-application company profile for the EIS self-service environment, built on the once-only principle.

**Stack:** Java 25 / Spring Boot 4 · Angular 21 + webpack Module Federation · PostgreSQL 18 · Docker Compose. Angular is pinned to 21 — literal webpack MF requires `@angular-architects/module-federation`, which targets Angular 21.

```
apps/shell        Angular MF host (nav, header, mock login, "Vali roll")
apps/profile-mfe  Angular MF remote ("ettevõtte profiil")
libs/             dds-tokens, dds-ui, profile-api
backend/          Spring Boot BLL (REST, integration, JPA, Flyway)
external/         Pinned copy of the provided register mock API
```

## Run

```bash
docker compose up --build
```

No configuration or local Java/Node needed. Defaults overridable via env or `.env`.

| Service | URL / port |
|---|---|
| Shell (entry point) | http://localhost:4200 |
| Profile MFE | http://localhost:4201 |
| Backend | http://localhost:8080 (`/actuator/health`) |
| Mock API | http://localhost:3000 (Swagger: `/api/docs`) |
| PostgreSQL | localhost:5433 (`eis_profile`, `eis`/`eis`) |

Test companies: `10966560` Biomarket OÜ, `16789012` Porgand OÜ, `16890123` Karu Koobas OÜ. Demo login: Eva Tamm (`48505150220`).
