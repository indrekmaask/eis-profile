-- Related parties (shareholders, board members, beneficiaries, ...). Read-only, from the
-- register. Mirrors the mock API relatedParties[] shape.

CREATE TABLE related_party (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id    UUID NOT NULL REFERENCES customer_profile (id) ON DELETE CASCADE,
    role          VARCHAR(80) NOT NULL,
    party_type    VARCHAR(20),
    registry_code VARCHAR(20),
    country_code  VARCHAR(3),
    display_name  VARCHAR(200) NOT NULL,
    ownership_pct NUMERIC(5, 2),
    source        VARCHAR(10) NOT NULL DEFAULT 'REGISTRY',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT related_party_type_chk CHECK (party_type IS NULL OR party_type IN ('NATURAL', 'LEGAL')),
    CONSTRAINT related_party_source_chk CHECK (source IN ('REGISTRY', 'CRM', 'USER')),
    CONSTRAINT related_party_ownership_chk CHECK (ownership_pct IS NULL OR (ownership_pct >= 0 AND ownership_pct <= 100)),
    CONSTRAINT related_party_unique UNIQUE (profile_id, registry_code, role)
);
