package com.mycompany.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.beans.Visibility;

@Data
public class LinkedInPostRequest {
    private String author;

    @JsonProperty("lifecycleState")
    private String lifecycleState;

    @JsonProperty("specificContent")
    private SpecificContent specificContent;

    @JsonProperty("visibility")
    private Visibility visibility;

    public LinkedInPostRequest(String author, String lifecycleState,
                               String shareText, String visibility) {
        this.author = author;
        this.lifecycleState = lifecycleState;
        this.specificContent = new SpecificContent(shareText);
        this.visibility = new Visibility(visibility);
    }
    @Data
    public static class SpecificContent {
        @JsonProperty("com.linkedin.ugc.ShareContent")
        private ShareContent shareContent;

        public SpecificContent(String shareText) {
            this.shareContent = new ShareContent(shareText);
        }
    }

    @Data
    public static class ShareContent {
        @JsonProperty("shareCommentary")
        private ShareCommentary shareCommentary;

        @JsonProperty("shareMediaCategory")
        private String shareMediaCategory;

        public ShareContent(String text) {
            this.shareCommentary = new ShareCommentary(text);
            this.shareMediaCategory = "NONE";
        }
    }

    @Data
    public static class ShareCommentary {
        private String text;

        public ShareCommentary(String text) {
            this.text = text;
        }
    }

    @Data
    public static class Visibility {
        @JsonProperty("com.linkedin.ugc.MemberNetworkVisibility")
        private String memberNetworkVisibility;

        public Visibility(String visibility) {
            this.memberNetworkVisibility = visibility;
        }
    }
}
