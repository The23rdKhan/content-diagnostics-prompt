package com.contentdiagnostics.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI/Swagger configuration for API documentation.
 *
 * Access the documentation at:
 * - Swagger UI: /api/swagger-ui.html
 * - OpenAPI JSON: /api/v3/api-docs
 */
@Configuration
public class OpenApiConfig {

    @Value("${info.app.version:1.0.0}")
    private String appVersion;

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .servers(List.of(
                        new Server().url("/api").description("API Base Path")
                ))
                .components(securityComponents())
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"));
    }

    private Info apiInfo() {
        return new Info()
                .title("Content Diagnostics API")
                .description("""
                    API for Content Diagnostics platform.

                    ## Authentication
                    Most endpoints require JWT Bearer token authentication.
                    Obtain tokens via `/auth/login` or `/auth/signup`.

                    ## Roles
                    - **CREATOR**: Content creators who upload videos
                    - **REVIEWER**: Paid reviewers who complete review tasks
                    - **ADMIN**: Platform administrators

                    ## Rate Limits
                    - Standard: 100 requests/minute
                    - Authenticated: 1000 requests/minute
                    """)
                .version(appVersion)
                .contact(new Contact()
                        .name("Content Diagnostics Support")
                        .email("support@contentdiagnostics.com"))
                .license(new License()
                        .name("Proprietary")
                        .url("https://contentdiagnostics.com/terms"));
    }

    private Components securityComponents() {
        return new Components()
                .addSecuritySchemes("Bearer Authentication",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter JWT token obtained from /auth/login"));
    }
}
