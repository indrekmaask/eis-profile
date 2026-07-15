-- Company-level contact e-mail/phone (user-managed), decoupled from contact persons.

ALTER TABLE customer_profile
    ADD COLUMN contact_email VARCHAR(160),
    ADD COLUMN contact_phone VARCHAR(40);

-- Backfill from the primary contact person so existing profiles stay complete.
UPDATE customer_profile p
SET contact_email = c.email,
    contact_phone = c.phone
FROM contact_person c
WHERE c.profile_id = p.id
  AND c.is_primary;
