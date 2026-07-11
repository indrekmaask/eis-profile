package ee.eis.profile.repository;

import ee.eis.profile.domain.MarketRegion;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketRegionRepository extends JpaRepository<MarketRegion, UUID> {
    List<MarketRegion> findByProfileId(UUID profileId);
}
