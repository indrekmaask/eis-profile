-- FK / lookup indexes. (UNIQUE constraints already create their own indexes.)

CREATE INDEX contact_person_profile_id_idx        ON contact_person (profile_id);
CREATE INDEX bank_account_profile_id_idx          ON bank_account (profile_id);
CREATE INDEX address_profile_id_idx               ON address (profile_id);
CREATE INDEX related_party_profile_id_idx         ON related_party (profile_id);
CREATE INDEX annual_report_profile_id_idx         ON annual_report (profile_id);
CREATE INDEX market_region_profile_id_idx         ON market_region (profile_id);
CREATE INDEX profile_source_snapshot_profile_id_idx ON profile_source_snapshot (profile_id);

-- Latest snapshot per profile (audit / "as-of" display).
CREATE INDEX profile_source_snapshot_latest_idx   ON profile_source_snapshot (profile_id, fetched_at DESC);

-- "Vali roll": list companies linked to a person's ID code.
CREATE INDEX profile_access_person_code_idx       ON profile_access (person_code);
