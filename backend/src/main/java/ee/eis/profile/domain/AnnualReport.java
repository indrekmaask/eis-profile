package ee.eis.profile.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Annual report — read-only, from the register. Fields mirror the mock API annualReports[]. */
@Entity
@Table(name = "annual_report")
@Getter
@Setter
@NoArgsConstructor
public class AnnualReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID profileId;

    @Column(nullable = false)
    private Integer reportYear;

    @Column(name = "is_required", nullable = false)
    private boolean required;

    @Column(name = "is_submitted", nullable = false)
    private boolean submitted;

    private Long salesRevenueEstonia;
    private Long salesRevenueEu;
    private Long salesRevenueNonEu;
    private Long operatingProfit;
    private Long operatingProfitUnconsolidated;
    private Long depreciation;
    private Long depreciationUnconsolidated;
    private Long netProfit;
    private Long netProfitUnconsolidated;
    private Long balanceSheetTotal;
    private Long balanceSheetTotalUnconsolidated;
    private Long shareCapital;
    private Long shareCapitalUnconsolidated;
    private Long equity;
    private Long equityUnconsolidated;
    private Long longTermLoanObligations;
    private Long longTermLoanObligationsUnconsolidated;
    private Long shortTermLoanObligations;
    private Long shortTermLoanObligationsUnconsolidated;
    private Long obligationsTotal;
    private Long obligationsTotalUnconsolidated;
    private Long currentAssetsTotal;
    private Long currentAssetsTotalUnconsolidated;
    private Long fixedAssetsTotal;
    private Long fixedAssetsTotalUnconsolidated;
    private Long shortTermObligationsTotal;
    private Long shortTermObligationsTotalUnconsolidated;
    private Long longTermObligationsTotal;
    private Long longTermObligationsTotalUnconsolidated;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Source source = Source.REGISTRY;

    @Column(insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}
