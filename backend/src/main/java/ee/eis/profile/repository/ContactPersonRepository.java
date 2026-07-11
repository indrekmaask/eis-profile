package ee.eis.profile.repository;

import ee.eis.profile.domain.ContactPerson;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactPersonRepository extends JpaRepository<ContactPerson, UUID> {
    List<ContactPerson> findByProfileId(UUID profileId);
}
