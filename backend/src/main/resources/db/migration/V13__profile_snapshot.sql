-- Process-time immutable snapshots (spec Lisa 1): frozen JSONB copy of the
-- assembled profile, written once when data enters a process, never updated.

CREATE TABLE profile_snapshot (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id     UUID NOT NULL REFERENCES customer_profile (id) ON DELETE CASCADE,
    snapshot_type  VARCHAR(40) NOT NULL,
    payload        JSONB NOT NULL,
    captured_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT profile_snapshot_type_chk
        CHECK (snapshot_type IN ('NÕUSTAMISE_EELREGISTREERIMINE', 'TAOTLUS'))
);

CREATE INDEX idx_profile_snapshot_profile_id ON profile_snapshot (profile_id, captured_at DESC);
