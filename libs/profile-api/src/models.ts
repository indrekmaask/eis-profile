/**
 * TS mirror of the backend DTOs (ee.eis.profile.api.dto).
 * Hand-written because springdoc/OpenAPI codegen is deferred (P2-10);
 * keep in sync with ProfileView / PrefillView / ProfileRequests / AccessEntry.
 */
export type Source = 'REGISTRY' | 'CRM' | 'USER';

export interface SourcedValue<T> {
  value: T | null;
  source: Source | null;
}

export interface Completeness {
  percent: number;
  missing: string[];
}

export interface Cards {
  relatedPartyCount: number;
  realEstateCount: number;
  officialNoticeCount: number;
  paymentBehaviour: string | null;
  taxDebt: number;
  employeeCount: number | null;
  targetMarkets: string[];
  operatingRegions: string[];
}

export interface Contact {
  id: string;
  fullName: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  personCode: string | null;
  primary: boolean;
  source: Source;
}

export interface BankAccount {
  id: string;
  iban: string;
  bankName: string | null;
  primary: boolean;
  source: Source;
}

export interface AddressView {
  id: string;
  addressType: string;
  fullAddress: string;
  source: Source;
}

export interface RelatedParty {
  role: string;
  partyType: string | null;
  registryCode: string | null;
  displayName: string;
  ownershipPct: number | null;
}

export interface AnnualReport {
  reportYear: number;
  submitted: boolean;
  salesRevenueEstonia: number | null;
  salesRevenueEu: number | null;
  salesRevenueNonEu: number | null;
  netProfit: number | null;
  balanceSheetTotal: number | null;
  equity: number | null;
}

export interface MarketRegionView {
  regionType: string;
  value: string;
}

export interface Discrepancy {
  field: string;
  storedValue: string | null;
  registryValue: string | null;
}

export interface ProfileView {
  registryCode: string;
  profileStatus: string;
  dataAsOfDate: string | null;
  businessName: SourcedValue<string>;
  legalForm: SourcedValue<string>;
  emtakCode: SourcedValue<string>;
  emtakName: SourcedValue<string>;
  capitalSize: SourcedValue<number>;
  website: SourcedValue<string>;
  employeeCount: SourcedValue<number>;
  completeness: Completeness;
  cards: Cards;
  contacts: Contact[];
  bankAccounts: BankAccount[];
  addresses: AddressView[];
  relatedParties: RelatedParty[];
  annualReports: AnnualReport[];
  marketRegions: MarketRegionView[];
  discrepancies: Discrepancy[];
}

export interface PrefillRelatedParty {
  role: string;
  partyType: string | null;
  registryCode: string | null;
  displayName: string;
  ownershipPct: number | null;
}

export interface PrefillView {
  registryCode: string;
  businessName: string;
  legalForm: string;
  emtakCode: string;
  emtakName: string;
  capitalSize: number | null;
  legalAddress: string | null;
  dataAsOfDate: string | null;
  relatedParties: PrefillRelatedParty[];
  missingUserFields: string[];
}

export interface ContactInput {
  fullName: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  personCode: string | null;
  primary: boolean;
}

export interface BankAccountInput {
  iban: string;
  bankName: string | null;
  primary: boolean;
}

export interface CreateProfileRequest {
  registryCode: string;
  website: string | null;
  employeeCount: number | null;
  operatingAddress: string | null;
  contacts: ContactInput[];
  bankAccounts: BankAccountInput[];
  targetMarkets: string[];
  operatingRegions: string[];
}

export interface StepUpdateRequest {
  employeeCount?: number | null;
  website?: string | null;
  operatingAddress?: string | null;
  contacts?: ContactInput[];
  bankAccounts?: BankAccountInput[];
  targetMarkets?: string[];
  operatingRegions?: string[];
}

export interface AccessEntry {
  registryCode: string;
  businessName: string;
  accessRole: string;
}
