-- Raw source payloads (audit + recovery). Stores everything fetched from a source system,
-- including fields not yet surfaced. source_system: RIK (register) or CRM.

CREATE TABLE profile_source_snapshot (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id     UUID NOT NULL REFERENCES customer_profile (id) ON DELETE CASCADE,
    source_system  VARCHAR(10) NOT NULL,
    endpoint       VARCHAR(200),
    payload        JSONB NOT NULL,
    fetched_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT profile_source_snapshot_system_chk CHECK (source_system IN ('RIK', 'CRM'))
);
