package com.mycompany.backend.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LinkedInPostResponse {
    private String id;
    private String activity;

    @JsonProperty("created")
    private CreatedInfo created;

    @JsonProperty("lifecycleState")
    private String lifecycleState;

    @JsonProperty("visibility")
    private Visibility visibility;

    private String errorMessage;
    private boolean success;

    @Data
    public static class CreatedInfo {
        private String actor;
        private Long time;
        private LocalDateTime createdAt;
    }

    @Data
    public static class Visibility {
        @JsonProperty("com.linkedin.ugc.MemberNetworkVisibility")
        private String memberNetworkVisibility;
    }
}
