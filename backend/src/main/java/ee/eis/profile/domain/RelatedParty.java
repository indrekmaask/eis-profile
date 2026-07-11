package ee.eis.profile.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Related party (shareholder, board member, ...). Read-only, from the register. */
@Entity
@Table(name = "related_party")
@Getter
@Setter
@NoArgsConstructor
public class RelatedParty {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID profileId;

    @Column(nullable = false, length = 80)
    private String role;

    /** NATURAL or LEGAL. */
    private String partyType;
    private String registryCode;
    private String countryCode;

    @Column(nullable = false, length = 200)
    private String displayName;

    @Column(precision = 5, scale = 2)
    private BigDecimal ownershipPct;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Source source = Source.REGISTRY;

    @Column(insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}
