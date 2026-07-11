export interface Company {
  registryCode: string;
  businessName: string;
  dataAsOfDate: string;
  legalForm: string | null;
  address: string | null;
  emtakCode: string | null;
  emtakName: string | null;
  capitalSize: number | null;
  officialNotices: OfficialNotice[];
  relatedParties: RelatedParty[];
  realEstate: RealEstate[];
  debts: Debt[];
  annualReports: AnnualReport[];
}

export interface OfficialNotice {
  noticeNumber: string;
  publishedAt: string | null;
  archivedAt: string | null;
  noticeType: string | null;
  noticeSubtype: string | null;
  noticeContentHtml: string | null;
  noticeUrl: string | null;
}

export interface RelatedParty {
  role: string;
  registryCode: string | null;
  countryCode: string | null;
  type: string | null;
  firstName: string | null;
  lastName: string | null;
  businessName: string | null;
  ownershipPercentage: number | null;
}

export interface RealEstate {
  address: string;
}

export interface Debt {
  totalDebt: number;
  amountInPaymentSchedule: number;
  disputedAmount: number;
}

export interface AnnualReport {
  reportYear: number;
  isRequired: boolean;
  isSubmitted: boolean;
  salesRevenueEstonia: number | null;
  salesRevenueEu: number | null;
  salesRevenueNonEu: number | null;
  operatingProfit: number | null;
  operatingProfitUnconsolidated: number | null;
  depreciation: number | null;
  depreciationUnconsolidated: number | null;
  netProfit: number | null;
  netProfitUnconsolidated: number | null;
  balanceSheetTotal: number | null;
  balanceSheetTotalUnconsolidated: number | null;
  shareCapital: number | null;
  shareCapitalUnconsolidated: number | null;
  equity: number | null;
  equityUnconsolidated: number | null;
  longTermLoanObligations: number | null;
  longTermLoanObligationsUnconsolidated: number | null;
  shortTermLoanObligations: number | null;
  shortTermLoanObligationsUnconsolidated: number | null;
  obligationsTotal: number | null;
  obligationsTotalUnconsolidated: number | null;
  currentAssetsTotal: number | null;
  currentAssetsTotalUnconsolidated: number | null;
  fixedAssetsTotal: number | null;
  fixedAssetsTotalUnconsolidated: number | null;
  shortTermObligationsTotal: number | null;
  shortTermObligationsTotalUnconsolidated: number | null;
  longTermObligationsTotal: number | null;
  longTermObligationsTotalUnconsolidated: number | null;
}

export interface CompanyReader {
  getCompanyByRegistryCode(registryCode: string): Promise<Company>;
}
