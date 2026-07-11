-- Target markets / operating regions the company selected. Controlled vocabulary:
-- value holds a code (TARGET_MARKET = ISO 3166-1 alpha-2 country code; OPERATING_REGION =
-- predefined region code). The vocabulary is validated in the BLL. Source is USER.

CREATE TABLE market_region (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id   UUID NOT NULL REFERENCES customer_profile (id) ON DELETE CASCADE,
    region_type  VARCHAR(20) NOT NULL,
    value        VARCHAR(40) NOT NULL,
    source       VARCHAR(10) NOT NULL DEFAULT 'USER',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT market_region_type_chk CHECK (region_type IN ('TARGET_MARKET', 'OPERATING_REGION')),
    CONSTRAINT market_region_source_chk CHECK (source IN ('REGISTRY', 'CRM', 'USER')),
    CONSTRAINT market_region_unique UNIQUE (profile_id, region_type, value)
);
