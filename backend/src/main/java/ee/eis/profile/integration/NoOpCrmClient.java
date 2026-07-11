package ee.eis.profile.integration;

import ee.eis.profile.integration.dto.CompanyResponse;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * No-op CRM client. Demonstrates the {@code source=CRM} extension point without inventing data.
 * Controlled by {@code eis.crm.enabled} (default false); even when "enabled" it returns nothing,
 * as no real CRM endpoint exists in this trial work.
 */
@Component
public class NoOpCrmClient implements CrmClient {

    private static final Logger log = LoggerFactory.getLogger(NoOpCrmClient.class);

    private final boolean enabled;

    public NoOpCrmClient(org.springframework.core.env.Environment env) {
        this.enabled = Boolean.parseBoolean(env.getProperty("eis.crm.enabled", "false"));
    }

    @Override
    public Optional<CompanyResponse> fetchCompany(String registryCode) {
        log.debug("CRM lookup for {} skipped (no-op client, enabled={})", registryCode, enabled);
        return Optional.empty();
    }
}
