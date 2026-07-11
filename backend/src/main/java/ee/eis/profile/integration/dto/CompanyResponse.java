package ee.eis.profile.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

/**
 * Register (mock API) response for GET /api/v1/companies/{registryCode}.
 * Field names mirror the mock API exactly (src/types/company.ts); Jackson maps the camelCase JSON.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record CompanyResponse(
        String registryCode,
        String businessName,
        String dataAsOfDate,
        String legalForm,
        String address,
        String emtakCode,
        String emtakName,
        Long capitalSize,
        List<OfficialNoticeResponse> officialNotices,
        List<RelatedPartyResponse> relatedParties,
        List<RealEstateResponse> realEstate,
        List<DebtResponse> debts,
        List<AnnualReportResponse> annualReports
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RelatedPartyResponse(
            String role,
            String registryCode,
            String countryCode,
            String type,
            String firstName,
            String lastName,
            String businessName,
            java.math.BigDecimal ownershipPercentage
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RealEstateResponse(String address) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record DebtResponse(Long totalDebt, Long amountInPaymentSchedule, Long disputedAmount) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record OfficialNoticeResponse(
            String noticeNumber,
            String publishedAt,
            String archivedAt,
            String noticeType,
            String noticeSubtype,
            String noticeContentHtml,
            String noticeUrl
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AnnualReportResponse(
            Integer reportYear,
            Boolean isRequired,
            Boolean isSubmitted,
            Long salesRevenueEstonia,
            Long salesRevenueEu,
            Long salesRevenueNonEu,
            Long operatingProfit,
            Long operatingProfitUnconsolidated,
            Long depreciation,
            Long depreciationUnconsolidated,
            Long netProfit,
            Long netProfitUnconsolidated,
            Long balanceSheetTotal,
            Long balanceSheetTotalUnconsolidated,
            Long shareCapital,
            Long shareCapitalUnconsolidated,
            Long equity,
            Long equityUnconsolidated,
            Long longTermLoanObligations,
            Long longTermLoanObligationsUnconsolidated,
            Long shortTermLoanObligations,
            Long shortTermLoanObligationsUnconsolidated,
            Long obligationsTotal,
            Long obligationsTotalUnconsolidated,
            Long currentAssetsTotal,
            Long currentAssetsTotalUnconsolidated,
            Long fixedAssetsTotal,
            Long fixedAssetsTotalUnconsolidated,
            Long shortTermObligationsTotal,
            Long shortTermObligationsTotalUnconsolidated,
            Long longTermObligationsTotal,
            Long longTermObligationsTotalUnconsolidated
    ) {}
}
