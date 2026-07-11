import { query } from "../db/pool.js";
import {
  AnnualReport,
  Company,
  Debt,
  OfficialNotice,
  RealEstate,
  RelatedParty,
} from "../types/company.js";

interface CompanyRow {
  id: string;
  registry_code: string;
  business_name: string;
  data_as_of_date: string;
  legal_form: string | null;
  address: string | null;
  emtak_code: string | null;
  emtak_name: string | null;
  capital_size: number | null;
}

interface RelatedPartyRow {
  role: string;
  registry_code: string | null;
  country_code: string | null;
  type: string | null;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  ownership_percentage: number | null;
}

interface RealEstateRow {
  address: string;
}

interface DebtRow {
  total_debt: number;
  amount_in_payment_schedule: number;
  disputed_amount: number;
}

interface OfficialNoticeRow {
  notice_number: string;
  published_at: string | null;
  archived_at: string | null;
  notice_type: string | null;
  notice_subtype: string | null;
  notice_content_html: string | null;
  notice_url: string | null;
}

interface AnnualReportRow {
  report_year: number;
  is_required: boolean;
  is_submitted: boolean;
  sales_revenue_estonia: number | null;
  sales_revenue_eu: number | null;
  sales_revenue_non_eu: number | null;
  operating_profit: number | null;
  operating_profit_unconsolidated: number | null;
  depreciation: number | null;
  depreciation_unconsolidated: number | null;
  net_profit: number | null;
  net_profit_unconsolidated: number | null;
  balance_sheet_total: number | null;
  balance_sheet_total_unconsolidated: number | null;
  share_capital: number | null;
  share_capital_unconsolidated: number | null;
  equity: number | null;
  equity_unconsolidated: number | null;
  long_term_loan_obligations: number | null;
  long_term_loan_obligations_unconsolidated: number | null;
  short_term_loan_obligations: number | null;
  short_term_loan_obligations_unconsolidated: number | null;
  obligations_total: number | null;
  obligations_total_unconsolidated: number | null;
  current_assets_total: number | null;
  current_assets_total_unconsolidated: number | null;
  fixed_assets_total: number | null;
  fixed_assets_total_unconsolidated: number | null;
  short_term_obligations_total: number | null;
  short_term_obligations_total_unconsolidated: number | null;
  long_term_obligations_total: number | null;
  long_term_obligations_total_unconsolidated: number | null;
}

export class CompanyRepository {
  async findByRegistryCode(registryCode: string): Promise<Company | null> {
    const companyResult = await query<CompanyRow>(
      `
        SELECT
          id,
          registry_code,
          business_name,
          data_as_of_date,
          legal_form,
          address,
          emtak_code,
          emtak_name,
          capital_size
        FROM companies
        WHERE registry_code = $1
      `,
      [registryCode]
    );

    const company = companyResult.rows[0];

    if (!company) {
      return null;
    }

    const [officialNotices, relatedParties, realEstate, debts, annualReports] = await Promise.all([
      this.findOfficialNotices(company.id),
      this.findRelatedParties(company.id),
      this.findRealEstate(company.id),
      this.findDebts(company.id),
      this.findAnnualReports(company.id),
    ]);

    return {
      registryCode: company.registry_code,
      businessName: company.business_name,
      dataAsOfDate: company.data_as_of_date,
      legalForm: company.legal_form,
      address: company.address,
      emtakCode: company.emtak_code,
      emtakName: company.emtak_name,
      capitalSize: company.capital_size,
      officialNotices,
      relatedParties,
      realEstate,
      debts,
      annualReports,
    };
  }

  private async findRelatedParties(companyId: string): Promise<RelatedParty[]> {
    const result = await query<RelatedPartyRow>(
      `
        SELECT
          role,
          registry_code,
          country_code,
          type,
          first_name,
          last_name,
          business_name,
          ownership_percentage
        FROM related_parties
        WHERE company_id = $1
        ORDER BY sort_order, role, business_name NULLS LAST, last_name NULLS LAST
      `,
      [companyId]
    );

    return result.rows.map((row) => ({
      role: row.role,
      registryCode: row.registry_code,
      countryCode: row.country_code,
      type: row.type,
      firstName: row.first_name,
      lastName: row.last_name,
      businessName: row.business_name,
      ownershipPercentage: row.ownership_percentage,
    }));
  }

  private async findRealEstate(companyId: string): Promise<RealEstate[]> {
    const result = await query<RealEstateRow>(
      "SELECT address FROM real_estate WHERE company_id = $1 ORDER BY address",
      [companyId]
    );

    return result.rows.map((row) => ({ address: row.address }));
  }

  private async findDebts(companyId: string): Promise<Debt[]> {
    const result = await query<DebtRow>(
      `
        SELECT total_debt, amount_in_payment_schedule, disputed_amount
        FROM debts
        WHERE company_id = $1
        ORDER BY id
      `,
      [companyId]
    );

    return result.rows.map((row) => ({
      totalDebt: row.total_debt,
      amountInPaymentSchedule: row.amount_in_payment_schedule,
      disputedAmount: row.disputed_amount,
    }));
  }

  private async findOfficialNotices(companyId: string): Promise<OfficialNotice[]> {
    const result = await query<OfficialNoticeRow>(
      `
        SELECT
          notice_number,
          published_at,
          archived_at,
          notice_type,
          notice_subtype,
          notice_content_html,
          notice_url
        FROM official_notices
        WHERE company_id = $1
        ORDER BY published_at DESC NULLS LAST, notice_number
      `,
      [companyId]
    );

    return result.rows.map((row) => ({
      noticeNumber: row.notice_number,
      publishedAt: row.published_at,
      archivedAt: row.archived_at,
      noticeType: row.notice_type,
      noticeSubtype: row.notice_subtype,
      noticeContentHtml: row.notice_content_html,
      noticeUrl: row.notice_url,
    }));
  }

  private async findAnnualReports(companyId: string): Promise<AnnualReport[]> {
    const result = await query<AnnualReportRow>(
      `
        SELECT
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
        FROM annual_reports
        WHERE company_id = $1
        ORDER BY report_year DESC
      `,
      [companyId]
    );

    return result.rows.map((row) => ({
      reportYear: row.report_year,
      isRequired: row.is_required,
      isSubmitted: row.is_submitted,
      salesRevenueEstonia: row.sales_revenue_estonia,
      salesRevenueEu: row.sales_revenue_eu,
      salesRevenueNonEu: row.sales_revenue_non_eu,
      operatingProfit: row.operating_profit,
      operatingProfitUnconsolidated: row.operating_profit_unconsolidated,
      depreciation: row.depreciation,
      depreciationUnconsolidated: row.depreciation_unconsolidated,
      netProfit: row.net_profit,
      netProfitUnconsolidated: row.net_profit_unconsolidated,
      balanceSheetTotal: row.balance_sheet_total,
      balanceSheetTotalUnconsolidated: row.balance_sheet_total_unconsolidated,
      shareCapital: row.share_capital,
      shareCapitalUnconsolidated: row.share_capital_unconsolidated,
      equity: row.equity,
      equityUnconsolidated: row.equity_unconsolidated,
      longTermLoanObligations: row.long_term_loan_obligations,
      longTermLoanObligationsUnconsolidated: row.long_term_loan_obligations_unconsolidated,
      shortTermLoanObligations: row.short_term_loan_obligations,
      shortTermLoanObligationsUnconsolidated: row.short_term_loan_obligations_unconsolidated,
      obligationsTotal: row.obligations_total,
      obligationsTotalUnconsolidated: row.obligations_total_unconsolidated,
      currentAssetsTotal: row.current_assets_total,
      currentAssetsTotalUnconsolidated: row.current_assets_total_unconsolidated,
      fixedAssetsTotal: row.fixed_assets_total,
      fixedAssetsTotalUnconsolidated: row.fixed_assets_total_unconsolidated,
      shortTermObligationsTotal: row.short_term_obligations_total,
      shortTermObligationsTotalUnconsolidated: row.short_term_obligations_total_unconsolidated,
      longTermObligationsTotal: row.long_term_obligations_total,
      longTermObligationsTotalUnconsolidated: row.long_term_obligations_total_unconsolidated,
    }));
  }
}

export const companyRepository = new CompanyRepository();
