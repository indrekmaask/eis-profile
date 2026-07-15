package ee.eis.profile.api.dto;

public record AuditEntry(String id, String occurredAt, String actorPersonCode, String action,
                         String details) {
}
