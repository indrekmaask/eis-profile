package ee.eis.profile.repository;

import ee.eis.profile.domain.AuditEvent;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditEventRepository extends JpaRepository<AuditEvent, UUID> {
    List<AuditEvent> findByRegistryCodeOrderByOccurredAtDesc(String registryCode);
}
