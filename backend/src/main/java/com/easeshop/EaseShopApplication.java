package com.easeshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

import lombok.extern.slf4j.Slf4j;

/**
 * Main entry point for the ShopEase E-Commerce Application.
 * 
 * @author ShopEase Team
 * @version 1.0.0
 */
@Slf4j
@EnableAsync
@SpringBootApplication
public class EaseShopApplication {

    public static void main(String[] args) {
        SpringApplication.run(EaseShopApplication.class, args);
        log.info("🚀 ShopEase Application started successfully!");
        log.info("📖 Swagger UI: http://localhost:8080/swagger-ui.html");
        log.info("📖 API Docs: http://localhost:8080/api-docs");
    }
}
