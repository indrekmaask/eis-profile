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

/** Target market / operating region (controlled vocabulary; value validated in the BLL). */
@Entity
@Table(name = "market_region")
@Getter
@Setter
@NoArgsConstructor
public class MarketRegion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID profileId;

    /** TARGET_MARKET or OPERATING_REGION. */
    @Column(nullable = false, length = 20)
    private String regionType;

    @Column(nullable = false, length = 40)
    private String value;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Source source = Source.USER;

    @Column(insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}
