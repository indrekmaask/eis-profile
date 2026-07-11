package ee.eis.profile.integration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RegistryClientConfig {

    @Bean
    RestClient registryRestClient(@Value("${eis.registry.base-url}") String baseUrl) {
        return RestClient.create(baseUrl);
    }
}
