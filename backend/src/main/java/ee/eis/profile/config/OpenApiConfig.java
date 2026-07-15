package ee.eis.profile.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI profileOpenAPI() {
        return new OpenAPI().info(new Info()
                .title("EIS Central Customer Profile API")
                .description("Profile service (BLL) REST API — company profile, once-only prefill, stepper updates, register refresh.")
                .version("0.1.0"));
    }
}
