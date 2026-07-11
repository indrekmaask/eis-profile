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

/** Which person may act for which company (drives the mock identity switcher + "Vali roll"). */
@Entity
@Table(name = "profile_access")
@Getter
@Setter
@NoArgsConstructor
public class ProfileAccess {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID profileId;

    @Column(nullable = false, length = 20)
    private String personCode;

    /** OWNER, REP or VIEWER. */
    @Column(nullable = false, length = 20)
    private String accessRole;

    private String grantedVia;

    @Column(insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}
