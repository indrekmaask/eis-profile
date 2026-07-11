SET search_path TO business_registry, public;

-- =========================================================
-- COMPANIES
-- =========================================================
INSERT INTO companies (
  id,
  registry_code,
  business_name,
  data_as_of_date,
  legal_form,
  address,
  emtak_code,
  emtak_name,
  capital_size
)
VALUES
  (
    '0198f6c2-4f30-7a12-9c4f-8d1e2b3a4c5d',
    '10966560',
    'Biomarket OÜ',
    '2026-05-15T01:20:11.129878Z',
    'Osaühing',
    'Harju maakond, Tallinn, Kristiine linnaosa, Tulika tn 19',
    '47111',
    'Peamiselt toidu, jookide või tubakatoodete spetsialiseerimata jaemüük',
    2500
  ),
  (
    '0198f6c2-5a10-7b31-a1d2-3f4b5c6d7e8f',
    '16789012',
    'Porgand OÜ',
    '2026-05-18T09:15:00.000000Z',
    'Osaühing',
    'Tartu maakond, Tartu linn, Rüütli tn 12',
    '01131',
    'Köögivilja- ja melonikasvatus, juur- ja mugulköögivilja kasvatus',
    2500
  ),
  (
    '0198f6c2-5b20-7c42-b2e3-4a5b6c7d8e9f',
    '16890123',
    'Karu Koobas OÜ',
    '2026-05-19T11:30:00.000000Z',
    'Osaühing',
    'Võru maakond, Võru vald, Metsa tee 7',
    '55201',
    'Puhkemaja',
    3000
  )
ON CONFLICT (registry_code) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  data_as_of_date = EXCLUDED.data_as_of_date,
  legal_form = EXCLUDED.legal_form,
  address = EXCLUDED.address,
  emtak_code = EXCLUDED.emtak_code,
  emtak_name = EXCLUDED.emtak_name,
  capital_size = EXCLUDED.capital_size,
  updated_at = now();


DELETE FROM related_parties WHERE company_id IN (
  SELECT id FROM companies WHERE registry_code IN ('10966560', '16789012', '16890123')
);
DELETE FROM real_estate WHERE company_id IN (
  SELECT id FROM companies WHERE registry_code IN ('10966560', '16789012', '16890123')
);
DELETE FROM debts WHERE company_id IN (
  SELECT id FROM companies WHERE registry_code IN ('10966560', '16789012', '16890123')
);
DELETE FROM official_notices WHERE company_id IN (
  SELECT id FROM companies WHERE registry_code IN ('10966560', '16789012', '16890123')
);
DELETE FROM annual_reports WHERE company_id IN (
  SELECT id FROM companies WHERE registry_code IN ('10966560', '16789012', '16890123')
);

-- =========================================================
-- RELATED PARTIES
-- =========================================================
INSERT INTO related_parties (
  company_id,
  role,
  registry_code,
  country_code,
  type,
  first_name,
  last_name,
  business_name,
  ownership_percentage,
  sort_order
)
VALUES
  -- Biomarket OÜ
  ((SELECT id FROM companies WHERE registry_code = '10966560'), 'Osanik', '37510090251', 'EST', 'Füüsiline isik', 'Priit', 'Mikelsaar', NULL, 77, 1),
  ((SELECT id FROM companies WHERE registry_code = '10966560'), 'Osanik', '12305242', 'EST', 'Juriidiline isik', NULL, NULL, 'OÜ MOOS', 13, 2),
  ((SELECT id FROM companies WHERE registry_code = '10966560'), 'Asutaja', '37510090251', 'EST', 'Füüsiline isik', 'Priit', 'Mikelsaar', NULL, NULL, 3),
  ((SELECT id FROM companies WHERE registry_code = '10966560'), 'Osanik', '12183879', 'EST', 'Juriidiline isik', NULL, NULL, 'Philia OÜ', 10, 4),
  ((SELECT id FROM companies WHERE registry_code = '10966560'), 'Osade registripidaja', '40003242879', 'LVA', 'Juriidiline isik', NULL, NULL, 'Nasdaq CSD SE', NULL, 5),
  ((SELECT id FROM companies WHERE registry_code = '10966560'), 'Kasusaaja', '37510090251', 'EST', 'Füüsiline isik', 'Priit', 'Mikelsaar', NULL, NULL, 6),
  ((SELECT id FROM companies WHERE registry_code = '10966560'), 'Juhatuse liige', '37510090251', 'EST', 'Füüsiline isik', 'Priit', 'Mikelsaar', NULL, NULL, 7),

  -- Porgand OÜ
  ((SELECT id FROM companies WHERE registry_code = '16789012'), 'Juhatuse liige', '48901010012', 'EST', 'Füüsiline isik', 'Mari', 'Porgand', NULL, NULL, 1),
  ((SELECT id FROM companies WHERE registry_code = '16789012'), 'Osanik', '48901010012', 'EST', 'Füüsiline isik', 'Mari', 'Porgand', NULL, 100, 2),

  -- Karu Koobas OÜ
  ((SELECT id FROM companies WHERE registry_code = '16890123'), 'Juhatuse liige', '38502020023', 'EST', 'Füüsiline isik', 'Karel', 'Karu', NULL, NULL, 1),
  ((SELECT id FROM companies WHERE registry_code = '16890123'), 'Osanik', '16789012', 'EST', 'Juriidiline isik', NULL, NULL, 'Porgand OÜ', 25, 2),
  ((SELECT id FROM companies WHERE registry_code = '16890123'), 'Osanik', '38502020023', 'EST', 'Füüsiline isik', 'Karel', 'Karu', NULL, 75, 3);

-- =========================================================
-- REAL ESTATE
-- =========================================================
INSERT INTO real_estate (company_id, address)
VALUES
  ((SELECT id FROM companies WHERE registry_code = '10966560'), 'Viljandi maakond, Viljandi vald, Uusna küla, Pärna tee 10'),
  ((SELECT id FROM companies WHERE registry_code = '16789012'), 'Tartu maakond, Tartu vald, Porgandi põld 3'),
  ((SELECT id FROM companies WHERE registry_code = '16890123'), 'Võru maakond, Võru vald, Metsa tee 7'),
  ((SELECT id FROM companies WHERE registry_code = '16890123'), 'Võru maakond, Rõuge vald, Koopa kinnistu');

-- =========================================================
-- DEBTS
-- =========================================================
INSERT INTO debts (company_id, total_debt, amount_in_payment_schedule, disputed_amount)
VALUES
  ((SELECT id FROM companies WHERE registry_code = '10966560'), 0, 0, 0),
  ((SELECT id FROM companies WHERE registry_code = '16789012'), 0, 0, 0),
  ((SELECT id FROM companies WHERE registry_code = '16890123'), 420, 120, 0);

-- =========================================================
-- OFFICIAL NOTICES
-- =========================================================
INSERT INTO official_notices (
  company_id,
  notice_number,
  published_at,
  archived_at,
  notice_type,
  notice_subtype,
  notice_content_html,
  notice_url
)
VALUES
  (
    (SELECT id FROM companies WHERE registry_code = '10966560'),
    'MOCK-2026-001',
    '2026-04-08',
    '2026-04-08',
    'Majandusteade',
    'Näidisteade',
    '<p>Näidisandmetel põhinev ametlik teadaanne.</p>',
    'https://example.test/notices/MOCK-2026-001'
  ),
  (
    (SELECT id FROM companies WHERE registry_code = '16789012'),
    'MOCK-2026-002',
    '2026-04-12',
    NULL,
    'Registriteade',
    'Näidisteade',
    '<p>Porgand OÜ näidisandmete teade.</p>',
    'https://example.test/notices/MOCK-2026-002'
  ),
  (
    (SELECT id FROM companies WHERE registry_code = '16890123'),
    'MOCK-2026-003',
    '2026-04-15',
    NULL,
    'Majandusteade',
    'Näidisteade',
    '<p>Karu Koobas OÜ näidisandmete teade.</p>',
    'https://example.test/notices/MOCK-2026-003'
  );

-- =========================================================
-- ANNUAL REPORTS
-- =========================================================
INSERT INTO annual_reports (
  company_id,
  report_year,
  is_required,
  is_submitted,
  sales_revenue_estonia,
  sales_revenue_eu,
  sales_revenue_non_eu,
  operating_profit,
  operating_profit_unconsolidated,
  depreciation,
  depreciation_unconsolidated,
  net_profit,
  net_profit_unconsolidated,
  balance_sheet_total,
  balance_sheet_total_unconsolidated,
  share_capital,
  share_capital_unconsolidated,
  equity,
  equity_unconsolidated,
  long_term_loan_obligations,
  long_term_loan_obligations_unconsolidated,
  short_term_loan_obligations,
  short_term_loan_obligations_unconsolidated,
  obligations_total,
  obligations_total_unconsolidated,
  current_assets_total,
  current_assets_total_unconsolidated,
  fixed_assets_total,
  fixed_assets_total_unconsolidated,
  short_term_obligations_total,
  short_term_obligations_total_unconsolidated,
  long_term_obligations_total,
  long_term_obligations_total_unconsolidated
)
VALUES
  -- Biomarket OÜ
  (
    (SELECT id FROM companies WHERE registry_code = '10966560'),
    2024, true, true,
    4645686, 4993805, 0,
    -159985, -159985,
    164526, 164526,
    -223475, -223475,
    893914, 893914,
    2500, 2500,
    -624390, -624390,
    723652, 723652,
    59904, 59904,
    1518304, 1518304,
    593399, 593399,
    300515, 300515,
    794652, 794652,
    723652, 723652
  ),
  (
    (SELECT id FROM companies WHERE registry_code = '10966560'),
    2023, true, true,
    4920688, 5213346, 0,
    -231308, -231308,
    184596, 184596,
    -295509, -295509,
    1103736, 1103736,
    2500, 2500,
    -400915, -400915,
    735688, 735688,
    128674, 128674,
    1504651, 1504651,
    635173, 635173,
    468563, 468563,
    768963, 768963,
    735688, 735688
  ),
  (
    (SELECT id FROM companies WHERE registry_code = '10966560'),
    2022, true, true,
    5256536, 5638002, 0,
    -589619, -589619,
    189305, 189305,
    -636687, -636687,
    1521972, 1521972,
    2500, 2500,
    -105406, -105406,
    764413, 764413,
    179889, 179889,
    1627378, 1627378,
    867410, 867410,
    654562, 654562,
    862965, 862965,
    764413, 764413
  ),

  -- Porgand OÜ
  (
    (SELECT id FROM companies WHERE registry_code = '16789012'),
    2024, true, true,
    185000, 22000, 0,
    31000, 31000,
    8400, 8400,
    24800, 24800,
    142000, 142000,
    2500, 2500,
    76500, 76500,
    18000, 18000,
    9500, 9500,
    65500, 65500,
    88000, 88000,
    54000, 54000,
    47500, 47500,
    18000, 18000
  ),
  (
    (SELECT id FROM companies WHERE registry_code = '16789012'),
    2023, true, true,
    156000, 12000, 0,
    21000, 21000,
    7300, 7300,
    16900, 16900,
    118000, 118000,
    2500, 2500,
    51700, 51700,
    22000, 22000,
    6100, 6100,
    66300, 66300,
    72000, 72000,
    46000, 46000,
    44300, 44300,
    22000, 22000
  ),

  -- Karu Koobas OÜ
  (
    (SELECT id FROM companies WHERE registry_code = '16890123'),
    2024, true, true,
    98000, 0, 14500,
    14200, 14200,
    12600, 12600,
    9100, 9100,
    236000, 236000,
    3000, 3000,
    84200, 84200,
    94000, 94000,
    15200, 15200,
    151800, 151800,
    51000, 51000,
    185000, 185000,
    57800, 57800,
    94000, 94000
  );