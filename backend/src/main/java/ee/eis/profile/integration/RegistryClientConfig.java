package ee.eis.profile.integration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RegistryClientConfig {

    @Bean
    RestClient registryRestClient(RestClient.Builder builder,
                                  @Value("${eis.registry.base-url}") String baseUrl) {
        return builder.baseUrl(baseUrl).build();
    }
}
