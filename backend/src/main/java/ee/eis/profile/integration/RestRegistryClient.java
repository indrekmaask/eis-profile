package ee.eis.profile.integration;

import ee.eis.profile.integration.dto.CompanyResponse;
import java.util.Optional;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class RestRegistryClient implements RegistryClient {

    private final RestClient restClient;

    public RestRegistryClient(RestClient registryRestClient) {
        this.restClient = registryRestClient;
    }

    @Override
    public Optional<CompanyResponse> fetchCompany(String registryCode) {
        try {
            CompanyResponse body = restClient.get()
                    .uri("/api/v1/companies/{registryCode}", registryCode)
                    .retrieve()
                    // 400 = malformed registry code: such a company cannot exist, so it is
                    // "not found", not a register outage.
                    .onStatus(status -> status.value() == 404 || status.value() == 400, (req, res) -> {
                        throw new NotFound();
                    })
                    .body(CompanyResponse.class);
            return Optional.ofNullable(body);
        } catch (NotFound e) {
            return Optional.empty();
        } catch (RestClientException e) {
            throw new RegistryUnavailableException(
                    "Register request failed for %s".formatted(registryCode), e);
        }
    }

    /** Internal marker to unwind a 404 without it being treated as a transport error. */
    private static final class NotFound extends RuntimeException {}
}
