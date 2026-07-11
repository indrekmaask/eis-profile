package ee.eis.profile.repository;

import ee.eis.profile.domain.RelatedParty;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RelatedPartyRepository extends JpaRepository<RelatedParty, UUID> {
    List<RelatedParty> findByProfileId(UUID profileId);
}
