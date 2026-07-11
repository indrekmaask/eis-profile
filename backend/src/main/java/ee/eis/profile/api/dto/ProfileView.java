package ee.eis.profile.api.dto;

import java.math.BigDecimal;
import java.util.List;

/** Full profile as shown in the overview. Register-owned scalar fields carry their source. */
public record ProfileView(
        String registryCode,
        String profileStatus,
        String dataAsOfDate,
        SourcedValue<String> businessName,
        SourcedValue<String> legalForm,
        SourcedValue<String> emtakCode,
        SourcedValue<String> emtakName,
        SourcedValue<Long> capitalSize,
        SourcedValue<String> website,
        SourcedValue<Integer> employeeCount,
        Completeness completeness,
        Cards cards,
        List<Contact> contacts,
        List<BankAccount> bankAccounts,
        List<AddressView> addresses,
        List<RelatedParty> relatedParties,
        List<AnnualReport> annualReports,
        List<MarketRegionView> marketRegions,
        List<Discrepancy> discrepancies) {

    public record SourcedValue<T>(T value, String source) {}

    public record Completeness(int percent, List<String> missing) {}

    public record Cards(int relatedPartyCount, int realEstateCount, int officialNoticeCount,
                        String paymentBehaviour, Integer employeeCount,
                        List<String> targetMarkets, List<String> operatingRegions) {}

    public record Contact(String id, String fullName, String role, String email, String phone,
                          String personCode, boolean primary, String source) {}

    public record BankAccount(String id, String iban, String bankName, boolean primary, String source) {}

    public record AddressView(String id, String addressType, String fullAddress, String source) {}

    public record RelatedParty(String role, String partyType, String registryCode,
                               String displayName, BigDecimal ownershipPct) {}

    public record AnnualReport(int reportYear, boolean submitted, Long salesRevenueEstonia,
                               Long netProfit, Long balanceSheetTotal, Long equity) {}

    public record MarketRegionView(String regionType, String value) {}

    public record Discrepancy(String field, String storedValue, String registryValue) {}
}
