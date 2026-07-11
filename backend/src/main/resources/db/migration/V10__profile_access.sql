-- Which people may act for which company (drives the mock identity switcher + "Vali roll").

CREATE TABLE profile_access (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id   UUID NOT NULL REFERENCES customer_profile (id) ON DELETE CASCADE,
    person_code  VARCHAR(20) NOT NULL,
    access_role  VARCHAR(20) NOT NULL,
    granted_via  VARCHAR(40),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT profile_access_role_chk CHECK (access_role IN ('OWNER', 'REP', 'VIEWER')),
    CONSTRAINT profile_access_unique UNIQUE (profile_id, person_code)
);
