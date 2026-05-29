package com.easeshop.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger / OpenAPI 3 configuration for ShopEase API documentation.
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI ShopEaseOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("ShopEase E-Commerce API")
                        .description("Full Stack E-Commerce REST API built with Spring Boot 3, " +
                                "Spring Security, JWT Authentication, and MySQL")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("ShopEase Team")
                                .email("support@shopease.com")
                                .url("https://github.com/shopease"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .bearerFormat("JWT")
                                        .scheme("bearer")
                                        .description("Enter your JWT token")));
    }
}
