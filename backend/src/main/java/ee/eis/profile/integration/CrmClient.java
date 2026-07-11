package ee.eis.profile.integration;

import ee.eis.profile.integration.dto.CompanyResponse;
import java.util.Optional;

/**
 * Dynamics CRM — conceptual second source. Defined as an extension point; the only
 * implementation ({@link NoOpCrmClient}) is disabled by default and returns no data.
 */
public interface CrmClient {

    /** @return CRM-held company data, or empty when CRM is disabled / has nothing. */
    Optional<CompanyResponse> fetchCompany(String registryCode);
}
