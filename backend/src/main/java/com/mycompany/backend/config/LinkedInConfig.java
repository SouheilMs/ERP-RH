package com.mycompany.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "linkedin")
public class LinkedInConfig {
    private String clientId;
    private String clientSecret;
    private String accessToken;
    private String organizationId;
    private String apiUrl = "https://api.linkedin.com/v2";
    private int timeout = 30000;
    private int maxRetries = 3;

    public String getOrganizationUrn() {
        return "urn:li:organization:" + organizationId;
    }
}