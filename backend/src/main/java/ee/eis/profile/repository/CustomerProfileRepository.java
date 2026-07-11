package ee.eis.profile.repository;

import ee.eis.profile.domain.CustomerProfile;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, UUID> {
    Optional<CustomerProfile> findByRegistryCode(String registryCode);

    boolean existsByRegistryCode(String registryCode);
}
