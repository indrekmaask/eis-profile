package ee.eis.profile.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import ee.eis.profile.api.dto.AuditEntry;
import ee.eis.profile.domain.AuditAction;
import ee.eis.profile.domain.AuditEvent;
import ee.eis.profile.repository.AuditEventRepository;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditEventRepository events;
    private final AuditContext context;
    private final ObjectMapper objectMapper;
    private final TransactionTemplate auditTx;

    public AuditService(AuditEventRepository events, AuditContext context, ObjectMapper objectMapper,
                        PlatformTransactionManager txManager) {
        this.events = events;
        this.context = context;
        this.objectMapper = objectMapper;
        this.auditTx = new TransactionTemplate(txManager);
        this.auditTx.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    public void record(AuditAction action, String registryCode, Map<String, Object> details) {
        record(action, registryCode, context.currentActor(), details);
    }

    // Own transaction, and failures are swallowed: an audit-write problem must never
    // roll back or surface from the business operation it records.
    public void record(AuditAction action, String registryCode, String actorPersonCode,
                       Map<String, Object> details) {
        try {
            String detailsJson = details == null ? null : objectMapper.writeValueAsString(details);
            auditTx.executeWithoutResult(status -> {
                AuditEvent e = new AuditEvent();
                e.setAction(action.name());
                e.setRegistryCode(registryCode);
                e.setActorPersonCode(actorPersonCode);
                e.setDetails(detailsJson);
                events.save(e);
            });
        } catch (Exception ex) {
            log.warn("Failed to write audit event {} for {}", action, registryCode, ex);
        }
    }

    public List<AuditEntry> list(String registryCode) {
        return events.findByRegistryCodeOrderByOccurredAtDesc(registryCode).stream()
                .map(e -> new AuditEntry(e.getId().toString(),
                        e.getOccurredAt() == null ? null : e.getOccurredAt().toString(),
                        e.getActorPersonCode(), e.getAction(), e.getDetails()))
                .toList();
    }
}
