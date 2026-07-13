-- Scenario 1 demo data: Biomarket OÜ (registry code 10966560, a mock API test company)
-- as an existing, fully-filled profile. Registry-sourced fields mirror the mock API seed
-- (external/business-profile-mock-api) and carry source REGISTRY; user-entered fields
-- (website, employee count, contacts, bank, operating address, markets) carry source USER.
-- Runs from the classpath:db/seed location (see application.yml).

-- Fixed profile id so child rows can reference it without RETURNING gymnastics.
INSERT INTO customer_profile (
    id, registry_code, business_name, business_name_source,
    legal_form, legal_form_source, emtak_code, emtak_name, emtak_source,
    capital_size, capital_size_source, website, website_source,
    employee_count, employee_count_source, profile_status
) VALUES (
    '10966560-0000-0000-0000-000000000001', '10966560', 'Biomarket OÜ', 'REGISTRY',
    'Osaühing', 'REGISTRY', '47111', 'Toidukaupade jaemüük (spetsialiseerimata)', 'REGISTRY',
    2500, 'REGISTRY', 'biomarket.ee', 'USER',
    38, 'USER', 'ACTIVE'
);

-- Addresses: LEGAL from register, OPERATING added by the user (mixed provenance).
INSERT INTO address (profile_id, address_type, full_address, source) VALUES
    ('10966560-0000-0000-0000-000000000001', 'LEGAL', 'Harju maakond, Tallinn, Kristiine linnaosa, Tulika tn 19', 'REGISTRY'),
    ('10966560-0000-0000-0000-000000000001', 'OPERATING', 'Harju maakond, Tallinn, Peterburi tee 46 (ladu ja kontor)', 'USER');

-- Contact persons (user-managed; Priit is primary).
INSERT INTO contact_person (profile_id, full_name, role, email, phone, person_code, is_primary, source) VALUES
    ('10966560-0000-0000-0000-000000000001', 'Priit Mikelsaar', 'Juhatuse liige', 'priit@biomarket.ee', '+372 5555 1234', '37510090251', true, 'USER'),
    ('10966560-0000-0000-0000-000000000001', 'Liis Tamm', 'Raamatupidaja', 'raamatupidamine@biomarket.ee', '+372 5333 9876', '47008104213', false, 'USER');

-- Bank account (user-managed, primary).
INSERT INTO bank_account (profile_id, iban, bank_name, is_primary, source) VALUES
    ('10966560-0000-0000-0000-000000000001', 'EE382200221020145685', 'Swedbank', true, 'USER');

-- Related parties (from register; mirrors the mock API related_persons rows).
INSERT INTO related_party (profile_id, role, party_type, registry_code, country_code, display_name, ownership_pct, source) VALUES
    ('10966560-0000-0000-0000-000000000001', 'Osanik', 'NATURAL', '37510090251', 'EE', 'Priit Mikelsaar', 77.00, 'REGISTRY'),
    ('10966560-0000-0000-0000-000000000001', 'Osanik', 'LEGAL', '12305242', 'EE', 'OÜ MOOS', 13.00, 'REGISTRY'),
    ('10966560-0000-0000-0000-000000000001', 'Asutaja', 'NATURAL', '37510090251', 'EE', 'Priit Mikelsaar', NULL, 'REGISTRY'),
    ('10966560-0000-0000-0000-000000000001', 'Osanik', 'LEGAL', '12183879', 'EE', 'Philia OÜ', 10.00, 'REGISTRY'),
    ('10966560-0000-0000-0000-000000000001', 'Osade registripidaja', 'LEGAL', '40003242879', 'LV', 'Nasdaq CSD SE', NULL, 'REGISTRY'),
    ('10966560-0000-0000-0000-000000000001', 'Kasusaaja', 'NATURAL', '37510090251', 'EE', 'Priit Mikelsaar', NULL, 'REGISTRY'),
    ('10966560-0000-0000-0000-000000000001', 'Juhatuse liige', 'NATURAL', '37510090251', 'EE', 'Priit Mikelsaar', NULL, 'REGISTRY');

-- Annual reports (from register) — mirrors the mock API figures (EE + EU revenue split).
INSERT INTO annual_report (profile_id, report_year, is_required, is_submitted,
                           sales_revenue_estonia, sales_revenue_eu, sales_revenue_non_eu,
                           net_profit, balance_sheet_total, equity, source) VALUES
    ('10966560-0000-0000-0000-000000000001', 2024, true, true, 4645686, 4993805, 0, -223475, 893914, -624390, 'REGISTRY'),
    ('10966560-0000-0000-0000-000000000001', 2023, true, true, 4920688, 5213346, 0, -295509, 1103736, -400915, 'REGISTRY'),
    ('10966560-0000-0000-0000-000000000001', 2022, true, true, 5256536, 5638002, 0, -636687, 1521972, -105406, 'REGISTRY');

-- Target markets (ISO 3166-1 alpha-2), user-set: Soome, Läti, Leedu.
INSERT INTO market_region (profile_id, region_type, value, source) VALUES
    ('10966560-0000-0000-0000-000000000001', 'TARGET_MARKET', 'FI', 'USER'),
    ('10966560-0000-0000-0000-000000000001', 'TARGET_MARKET', 'LV', 'USER'),
    ('10966560-0000-0000-0000-000000000001', 'TARGET_MARKET', 'LT', 'USER');

-- Registry snapshot (drives the read-only "Muud andmed" cards: kinnisvara, maksuvõlg).
-- Mirrors the mock API real_estate/debts rows so a fresh stack matches without a manual refresh.
INSERT INTO profile_source_snapshot (profile_id, source_system, endpoint, payload) VALUES
    ('10966560-0000-0000-0000-000000000001', 'RIK', '/api/v1/companies/10966560',
     '{"registryCode":"10966560","businessName":"Biomarket OÜ","dataAsOfDate":"2026-05-15T10:00:00.000Z","realEstate":[{"address":"Viljandi maakond, Viljandi vald, Uusna küla, Pärna tee 10"}],"debts":[{"totalDebt":0,"amountInPaymentSchedule":0,"disputedAmount":0}]}'::jsonb);

-- Access: person 48505150220 (Eva Tamm, the demo login) is OWNER of Biomarket (drives "Vali roll").
INSERT INTO profile_access (profile_id, person_code, access_role, granted_via) VALUES
    ('10966560-0000-0000-0000-000000000001', '48505150220', 'OWNER', 'REGISTRY_BOARD_MEMBER');
