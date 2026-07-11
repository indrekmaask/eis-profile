package ee.eis.profile.repository;

import ee.eis.profile.domain.ProfileSourceSnapshot;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileSourceSnapshotRepository extends JpaRepository<ProfileSourceSnapshot, UUID> {
    Optional<ProfileSourceSnapshot> findFirstByProfileIdOrderByFetchedAtDesc(UUID profileId);
}
