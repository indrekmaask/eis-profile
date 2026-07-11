-- Addresses. LEGAL address comes from the register (source REGISTRY, a single string);
-- OPERATING address is user-entered (source USER). Exactly one address per type.

CREATE TABLE address (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id    UUID NOT NULL REFERENCES customer_profile (id) ON DELETE CASCADE,
    address_type  VARCHAR(20) NOT NULL,
    full_address  VARCHAR(300) NOT NULL,
    source        VARCHAR(10) NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT address_type_chk CHECK (address_type IN ('LEGAL', 'OPERATING')),
    CONSTRAINT address_source_chk CHECK (source IN ('REGISTRY', 'CRM', 'USER')),
    CONSTRAINT address_one_per_type UNIQUE (profile_id, address_type)
);

CREATE TRIGGER address_set_updated_at
    BEFORE UPDATE ON address
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
