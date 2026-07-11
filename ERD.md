# Data Model — Central Customer Profile (ERD)

Generated from the Flyway migrations in `backend/src/main/resources/db/migration`. PostgreSQL 18, schema `profile`. All PKs are `UUID` (`gen_random_uuid()`). Every child references `customer_profile(id)` with `ON DELETE CASCADE`.

**Provenance model:** the effective value of a field is chosen in the BLL by priority **`USER` > `REGISTRY` > `CRM`** — never in the database. `customer_profile` carries per-field `*_source` columns; child rows carry a single `source`. All raw source responses are retained in `profile_source_snapshot` (audit + recovery).

```mermaid
erDiagram
    customer_profile ||--o{ address : has
    customer_profile ||--o{ contact_person : has
    customer_profile ||--o{ bank_account : has
    customer_profile ||--o{ related_party : has
    customer_profile ||--o{ annual_report : has
    customer_profile ||--o{ market_region : has
    customer_profile ||--o{ profile_source_snapshot : has
    customer_profile ||--o{ profile_access : has

    customer_profile {
        uuid id PK
        varchar registry_code UK "8 digits, CHECK"
        varchar business_name
        varchar business_name_source "REGISTRY|CRM|USER"
        varchar legal_form
        varchar emtak_code
        varchar emtak_name
        bigint capital_size
        varchar website
        integer employee_count
        varchar profile_status "DRAFT|ACTIVE"
        timestamptz created_at
        timestamptz updated_at
    }
    address {
        uuid id PK
        uuid profile_id FK
        varchar address_type "LEGAL|OPERATING"
        varchar full_address
        varchar source
        uk profile_id_address_type "one per type"
    }
    contact_person {
        uuid id PK
        uuid profile_id FK
        varchar full_name
        varchar role
        varchar email
        varchar phone
        varchar person_code
        boolean is_primary
        varchar source
        uk profile_id_person_code
    }
    bank_account {
        uuid id PK
        uuid profile_id FK
        varchar iban "CHECK format; BLL mod-97"
        varchar bank_name
        boolean is_primary
        varchar source
        uk profile_id_iban
    }
    related_party {
        uuid id PK
        uuid profile_id FK
        varchar role
        varchar party_type "NATURAL|LEGAL"
        varchar registry_code
        varchar country_code
        varchar display_name
        numeric ownership_pct "0..100"
        varchar source "REGISTRY"
        uk profile_id_registry_code_role
    }
    annual_report {
        uuid id PK
        uuid profile_id FK
        integer report_year
        boolean is_required
        boolean is_submitted
        bigint sales_revenue_estonia "+ ~28 financial figures"
        varchar source "REGISTRY"
        uk profile_id_report_year
    }
    market_region {
        uuid id PK
        uuid profile_id FK
        varchar region_type "TARGET_MARKET|OPERATING_REGION"
        varchar value "controlled vocab code"
        varchar source "USER"
        uk profile_id_region_type_value
    }
    profile_source_snapshot {
        uuid id PK
        uuid profile_id FK
        varchar source_system "RIK|CRM"
        varchar endpoint
        jsonb payload "raw response"
        timestamptz fetched_at
    }
    profile_access {
        uuid id PK
        uuid profile_id FK
        varchar person_code "indexed (Vali roll)"
        varchar access_role "OWNER|REP|VIEWER"
        varchar granted_via
        uk profile_id_person_code
    }
```

## Notes

- **Enumerations** are enforced with `CHECK` constraints (portable, migration-friendly) rather than native PG enum types.
- **Indexes:** every child has a `profile_id` index; `profile_source_snapshot(profile_id, fetched_at DESC)` for latest-snapshot lookups; `profile_access(person_code)` for "Vali roll".
- **`updated_at`** is maintained by a trigger (`set_updated_at`) on the user-editable tables (`customer_profile`, `contact_person`, `bank_account`, `address`, `market_region`).
- **Mapping to the mock API:** `customer_profile` base fields, `related_party`, and `annual_report` come from the register (source `REGISTRY`); `contact_person`, `bank_account`, `website`, `employee_count`, the `OPERATING` address, and `market_region` are user-entered (source `USER`); `CRM` is a conceptual second source (no-op client behind a feature flag).
```
