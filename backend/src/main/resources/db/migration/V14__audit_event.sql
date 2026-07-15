-- Audit trail (CFR-035) in a dedicated `audit` schema, isolated from profile data
-- and its own migration lineage; promotable to a separate database by pointing a
-- second datasource at it. Append-only: rows are never updated or deleted.

CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE audit.audit_event (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    occurred_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    actor_person_code VARCHAR(20),
    registry_code     VARCHAR(20) NOT NULL,
    action            VARCHAR(30) NOT NULL,
    details           JSONB,

    CONSTRAINT audit_event_action_chk
        CHECK (action IN ('CREATE_PROFILE', 'UPDATE_STEP', 'REFRESH', 'CAPTURE_SNAPSHOT'))
);

CREATE INDEX idx_audit_event_registry_code ON audit.audit_event (registry_code, occurred_at DESC);
