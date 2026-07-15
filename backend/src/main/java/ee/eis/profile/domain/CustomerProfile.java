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

/** Central customer profile — one row per company. Per-field *Source columns record provenance. */
@Entity
@Table(name = "customer_profile")
@Getter
@Setter
@NoArgsConstructor
public class CustomerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 8)
    private String registryCode;

    @Column(nullable = false, length = 160)
    private String businessName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Source businessNameSource = Source.REGISTRY;

    private String legalForm;

    @Enumerated(EnumType.STRING)
    private Source legalFormSource;

    private String emtakCode;
    private String emtakName;

    @Enumerated(EnumType.STRING)
    private Source emtakSource;

    private Long capitalSize;

    @Enumerated(EnumType.STRING)
    private Source capitalSizeSource;

    private String website;

    @Enumerated(EnumType.STRING)
    private Source websiteSource;

    private String contactEmail;

    private String contactPhone;

    private Integer employeeCount;

    @Enumerated(EnumType.STRING)
    private Source employeeCountSource;

    @Column(nullable = false, length = 20)
    private String profileStatus = "ACTIVE";

    @Column(insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(insertable = false, updatable = false)
    private OffsetDateTime updatedAt;
}
