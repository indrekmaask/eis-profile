-- Contact persons — user-managed (mock API does not provide these).

CREATE TABLE contact_person (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id   UUID NOT NULL REFERENCES customer_profile (id) ON DELETE CASCADE,
    full_name    VARCHAR(160) NOT NULL,
    role         VARCHAR(80),
    email        VARCHAR(160),
    phone        VARCHAR(40),
    person_code  VARCHAR(20),
    is_primary   BOOLEAN NOT NULL DEFAULT false,
    source       VARCHAR(10) NOT NULL DEFAULT 'USER',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT contact_person_source_chk CHECK (source IN ('REGISTRY', 'CRM', 'USER')),
    -- person_code is nullable; PostgreSQL treats NULLs as distinct, so multiple
    -- contacts without a person code are allowed while coded ones stay unique.
    CONSTRAINT contact_person_unique UNIQUE (profile_id, person_code)
);

CREATE TRIGGER contact_person_set_updated_at
    BEFORE UPDATE ON contact_person
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
