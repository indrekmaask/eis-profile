-- Shared helpers. Schema `profile` is created by Flyway (create-schemas=true, default-schema=profile).
-- gen_random_uuid() is a core function in PostgreSQL 13+ (no extension needed).

-- Trigger function to maintain updated_at on user-editable tables.
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
