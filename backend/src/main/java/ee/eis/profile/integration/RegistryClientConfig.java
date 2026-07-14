package ee.eis.profile.integration;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class RegistryClientConfig {

    @Bean
    RestClient registryRestClient(@Value("${eis.registry.base-url}") String baseUrl) {
        // Bounded timeouts: a hung register must throw (-> RegistryUnavailableException -> 503)
        // instead of blocking a request thread indefinitely.
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(3));
        factory.setReadTimeout(Duration.ofSeconds(5));
        return RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
    }
}
