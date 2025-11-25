package com.mycompany.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
public class LinkedInPostStats {
    private String postId;
    private int likeCount;
    private int commentCount;
    private int shareCount;
    private int impressionCount;
    private int clickCount;
    private int engagementRate;
    private LocalDateTime lastUpdated;

    @JsonProperty("metrics")
    private Map<String, Integer> detailedMetrics;
}
