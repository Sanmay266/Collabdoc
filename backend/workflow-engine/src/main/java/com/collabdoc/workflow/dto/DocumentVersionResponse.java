package com.collabdoc.workflow.dto;

import java.time.LocalDateTime;

public class DocumentVersionResponse {

    private Long id;
    private String title;
    private String content;
    private LocalDateTime createdAt;

    public DocumentVersionResponse(
            Long id,
            String title,
            String content,
            LocalDateTime createdAt) {

        this.id = id;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}