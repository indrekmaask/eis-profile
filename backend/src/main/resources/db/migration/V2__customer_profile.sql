-- Central profile: one row per company. Per-field *_source columns record provenance
-- (REGISTRY = Äriregister/RIK, CRM = Dynamics CRM, USER = user-entered). The effective
-- value is chosen by the priority rule (USER > REGISTRY > CRM) in the BLL, not here.

CREATE TABLE customer_profile (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registry_code          VARCHAR(8)  NOT NULL,
    business_name          VARCHAR(160) NOT NULL,
    business_name_source   VARCHAR(10) NOT NULL DEFAULT 'REGISTRY',
    legal_form             VARCHAR(80),
    legal_form_source      VARCHAR(10),
    emtak_code             VARCHAR(10),
    emtak_name             VARCHAR(200),
    emtak_source           VARCHAR(10),
    capital_size           BIGINT,
    capital_size_source    VARCHAR(10),
    website                VARCHAR(200),
    website_source         VARCHAR(10),
    employee_count         INTEGER,
    employee_count_source  VARCHAR(10),
    profile_status         VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT customer_profile_registry_code_key UNIQUE (registry_code),
    CONSTRAINT customer_profile_registry_code_format CHECK (registry_code ~ '^[0-9]{8}$'),
    CONSTRAINT customer_profile_status_chk CHECK (profile_status IN ('DRAFT', 'ACTIVE')),
    CONSTRAINT customer_profile_business_name_source_chk CHECK (business_name_source IN ('REGISTRY', 'CRM', 'USER')),
    CONSTRAINT customer_profile_legal_form_source_chk CHECK (legal_form_source IS NULL OR legal_form_source IN ('REGISTRY', 'CRM', 'USER')),
    CONSTRAINT customer_profile_emtak_source_chk CHECK (emtak_source IS NULL OR emtak_source IN ('REGISTRY', 'CRM', 'USER')),
    CONSTRAINT customer_profile_capital_size_source_chk CHECK (capital_size_source IS NULL OR capital_size_source IN ('REGISTRY', 'CRM', 'USER')),
    CONSTRAINT customer_profile_website_source_chk CHECK (website_source IS NULL OR website_source IN ('REGISTRY', 'CRM', 'USER')),
    CONSTRAINT customer_profile_employee_count_source_chk CHECK (employee_count_source IS NULL OR employee_count_source IN ('REGISTRY', 'CRM', 'USER')),
    CONSTRAINT customer_profile_employee_count_chk CHECK (employee_count IS NULL OR employee_count >= 0)
);

CREATE TRIGGER customer_profile_set_updated_at
    BEFORE UPDATE ON customer_profile
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
