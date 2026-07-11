package ee.eis.profile.repository;

import ee.eis.profile.domain.ProfileAccess;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileAccessRepository extends JpaRepository<ProfileAccess, UUID> {
    List<ProfileAccess> findByPersonCode(String personCode);

    List<ProfileAccess> findByProfileId(UUID profileId);
}
