package iuh.fit.se.backend.config;

import org.springframework.boot.web.client.RestTemplateCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAiHeaderConfig {

    @Bean
    public RestTemplateCustomizer noopAiHeaders() {
        return restTemplate -> {
            // legacy bean retained for compatibility; Gemini headers handled in AiService
        };
    }
}
