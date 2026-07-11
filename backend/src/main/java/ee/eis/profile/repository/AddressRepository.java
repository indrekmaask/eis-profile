package ee.eis.profile.repository;

import ee.eis.profile.domain.Address;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AddressRepository extends JpaRepository<Address, UUID> {
    List<Address> findByProfileId(UUID profileId);
}
