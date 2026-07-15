package ee.eis.profile.repository;

import ee.eis.profile.domain.ProfileSnapshot;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileSnapshotRepository extends JpaRepository<ProfileSnapshot, UUID> {
    List<ProfileSnapshot> findByProfileIdOrderByCapturedAtDesc(UUID profileId);

    Optional<ProfileSnapshot> findByIdAndProfileId(UUID id, UUID profileId);
}
