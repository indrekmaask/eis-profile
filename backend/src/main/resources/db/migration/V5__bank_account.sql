-- Bank accounts — user-managed (mock API does not provide these).

CREATE TABLE bank_account (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id   UUID NOT NULL REFERENCES customer_profile (id) ON DELETE CASCADE,
    iban         VARCHAR(34) NOT NULL,
    bank_name    VARCHAR(120),
    is_primary   BOOLEAN NOT NULL DEFAULT false,
    source       VARCHAR(10) NOT NULL DEFAULT 'USER',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT bank_account_source_chk CHECK (source IN ('REGISTRY', 'CRM', 'USER')),
    -- Basic structural guard; full IBAN validation (mod-97) is done in the BLL.
    CONSTRAINT bank_account_iban_format CHECK (iban ~ '^[A-Z]{2}[0-9A-Z]{13,32}$'),
    CONSTRAINT bank_account_unique UNIQUE (profile_id, iban)
);

CREATE TRIGGER bank_account_set_updated_at
    BEFORE UPDATE ON bank_account
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
