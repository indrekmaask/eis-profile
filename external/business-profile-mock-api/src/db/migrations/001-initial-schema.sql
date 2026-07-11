CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS business_registry;
ALTER DATABASE business_profile SET search_path TO business_registry, public;
SET search_path TO business_registry, public;

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registry_code TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  data_as_of_date TIMESTAMPTZ NOT NULL,
  legal_form TEXT,
  address TEXT,
  emtak_code TEXT,
  emtak_name TEXT,
  capital_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT companies_registry_code_format CHECK (registry_code ~ '^[0-9]{8}$')
);

CREATE TABLE IF NOT EXISTS related_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  registry_code TEXT,
  country_code TEXT,
  type TEXT,
  first_name TEXT,
  last_name TEXT,
  business_name TEXT,
  ownership_percentage NUMERIC(5, 2),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS related_parties_company_id_idx ON related_parties(company_id);

CREATE TABLE IF NOT EXISTS real_estate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  address TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS real_estate_company_id_idx ON real_estate(company_id);

CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  total_debt BIGINT NOT NULL DEFAULT 0,
  amount_in_payment_schedule BIGINT NOT NULL DEFAULT 0,
  disputed_amount BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS debts_company_id_idx ON debts(company_id);

CREATE TABLE IF NOT EXISTS official_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  notice_number TEXT NOT NULL,
  published_at DATE,
  archived_at DATE,
  notice_type TEXT,
  notice_subtype TEXT,
  notice_content_html TEXT,
  notice_url TEXT
);

CREATE INDEX IF NOT EXISTS official_notices_company_id_idx ON official_notices(company_id);

CREATE TABLE IF NOT EXISTS annual_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  report_year INTEGER NOT NULL,
  is_required BOOLEAN NOT NULL,
  is_submitted BOOLEAN NOT NULL,
  sales_revenue_estonia BIGINT,
  sales_revenue_eu BIGINT,
  sales_revenue_non_eu BIGINT,
  operating_profit BIGINT,
  operating_profit_unconsolidated BIGINT,
  depreciation BIGINT,
  depreciation_unconsolidated BIGINT,
  net_profit BIGINT,
  net_profit_unconsolidated BIGINT,
  balance_sheet_total BIGINT,
  balance_sheet_total_unconsolidated BIGINT,
  share_capital BIGINT,
  share_capital_unconsolidated BIGINT,
  equity BIGINT,
  equity_unconsolidated BIGINT,
  long_term_loan_obligations BIGINT,
  long_term_loan_obligations_unconsolidated BIGINT,
  short_term_loan_obligations BIGINT,
  short_term_loan_obligations_unconsolidated BIGINT,
  obligations_total BIGINT,
  obligations_total_unconsolidated BIGINT,
  current_assets_total BIGINT,
  current_assets_total_unconsolidated BIGINT,
  fixed_assets_total BIGINT,
  fixed_assets_total_unconsolidated BIGINT,
  short_term_obligations_total BIGINT,
  short_term_obligations_total_unconsolidated BIGINT,
  long_term_obligations_total BIGINT,
  long_term_obligations_total_unconsolidated BIGINT,
  UNIQUE (company_id, report_year)
);

CREATE INDEX IF NOT EXISTS annual_reports_company_id_idx ON annual_reports(company_id);
