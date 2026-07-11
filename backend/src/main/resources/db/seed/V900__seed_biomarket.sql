-- Scenario 1 demo data: Biomarket OÜ (registry code 10966560, a mock API test company)
-- as an existing, partially-filled profile. Registry-sourced fields carry source REGISTRY;
-- user-entered fields (website, employee count, contacts, bank, operating address, markets)
-- carry source USER. Runs from the classpath:db/seed location (see application.yml).

-- Fixed profile id so child rows can reference it without RETURNING gymnastics.
INSERT INTO customer_profile (
    id, registry_code, business_name, business_name_source,
    legal_form, legal_form_source, emtak_code, emtak_name, emtak_source,
    capital_size, capital_size_source, website, website_source,
    employee_count, employee_count_source, profile_status
) VALUES (
    '10966560-0000-0000-0000-000000000001', '10966560', 'Biomarket OÜ', 'REGISTRY',
    'Osaühing', 'REGISTRY', '47111', 'Toidukaupade jaemüük (spetsialiseerimata)', 'REGISTRY',
    2500, 'REGISTRY', 'https://www.biomarket.ee', 'USER',
    38, 'USER', 'ACTIVE'
);

-- Addresses: LEGAL from register, OPERATING added by the user (mixed provenance).
INSERT INTO address (profile_id, address_type, full_address, source) VALUES
    ('10966560-0000-0000-0000-000000000001', 'LEGAL', 'Harju maakond, Tallinn, Kristiine linnaosa, Tulika tn 19', 'REGISTRY'),
    ('10966560-0000-0000-0000-000000000001', 'OPERATING', 'Harju maakond, Tallinn, Kristiine linnaosa, Tulika tn 19', 'USER');

-- Contact person (user-managed, primary).
INSERT INTO contact_person (profile_id, full_name, role, email, phone, person_code, is_primary, source) VALUES
    ('10966560-0000-0000-0000-000000000001', 'Priit Mikelsaar', 'Juhatuse liige', 'priit@biomarket.ee', '+372 5555 1234', '37510090251', true, 'USER');

-- Bank account (user-managed, primary).
INSERT INTO bank_account (profile_id, iban, bank_name, is_primary, source) VALUES
    ('10966560-0000-0000-0000-000000000001', 'EE382200221020145685', 'Swedbank', true, 'USER');

-- Related parties (from register).
INSERT INTO related_party (profile_id, role, party_type, registry_code, country_code, display_name, ownership_pct, source) VALUES
    ('10966560-0000-0000-0000-000000000001', 'Osanik', 'NATURAL', '37510090251', 'EE', 'Priit Mikelsaar', 77.00, 'REGISTRY'),
    ('10966560-0000-0000-0000-000000000001', 'Osanik', 'LEGAL', '12305242', 'EE', 'Philia OÜ', 10.00, 'REGISTRY'),
    ('10966560-0000-0000-0000-000000000001', 'Osanik', 'LEGAL', '12183879', 'EE', 'Moos OÜ', 13.00, 'REGISTRY');

-- Annual reports (from register) — latest years, representative figures.
INSERT INTO annual_report (profile_id, report_year, is_required, is_submitted, sales_revenue_estonia, net_profit, balance_sheet_total, equity, source) VALUES
    ('10966560-0000-0000-0000-000000000001', 2025, true, true, 9639491, -223475, 893914, 512000, 'REGISTRY'),
    ('10966560-0000-0000-0000-000000000001', 2024, true, true, 8300000, 145000, 810000, 498000, 'REGISTRY'),
    ('10966560-0000-0000-0000-000000000001', 2023, true, true, 7700000, 130000, 760000, 470000, 'REGISTRY');

-- Target markets (ISO 3166-1 alpha-2) and operating regions (controlled vocabulary), user-set.
INSERT INTO market_region (profile_id, region_type, value, source) VALUES
    ('10966560-0000-0000-0000-000000000001', 'TARGET_MARKET', 'EE', 'USER'),
    ('10966560-0000-0000-0000-000000000001', 'TARGET_MARKET', 'FI', 'USER'),
    ('10966560-0000-0000-0000-000000000001', 'TARGET_MARKET', 'LV', 'USER'),
    ('10966560-0000-0000-0000-000000000001', 'OPERATING_REGION', 'TALLINN', 'USER'),
    ('10966560-0000-0000-0000-000000000001', 'OPERATING_REGION', 'TARTU', 'USER'),
    ('10966560-0000-0000-0000-000000000001', 'OPERATING_REGION', 'RIGA', 'USER');

-- Access: person 37510090251 (Priit Mikelsaar) is OWNER of Biomarket (drives "Vali roll").
INSERT INTO profile_access (profile_id, person_code, access_role, granted_via) VALUES
    ('10966560-0000-0000-0000-000000000001', '37510090251', 'OWNER', 'REGISTRY_BOARD_MEMBER');
