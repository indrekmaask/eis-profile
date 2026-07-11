package ee.eis.profile.integration;

import ee.eis.profile.integration.dto.CompanyResponse;
import java.util.Optional;

/** Reads company data from the Estonian Business Register (mock API / RIK simulation). */
public interface RegistryClient {

    /**
     * @return the company, or empty if the register has no such company (404).
     * @throws RegistryUnavailableException if the register cannot be reached or errors (5xx).
     */
    Optional<CompanyResponse> fetchCompany(String registryCode);
}
