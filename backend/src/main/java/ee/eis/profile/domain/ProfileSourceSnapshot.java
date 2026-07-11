package ee.eis.profile.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** Raw source payload (audit + recovery). source_system: RIK or CRM. */
@Entity
@Table(name = "profile_source_snapshot")
@Getter
@Setter
@NoArgsConstructor
public class ProfileSourceSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID profileId;

    /** RIK or CRM. */
    @Column(nullable = false, length = 10)
    private String sourceSystem;

    private String endpoint;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private String payload;

    @Column(insertable = false, updatable = false)
    private OffsetDateTime fetchedAt;

    @Column(insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}
