package com.mockbridge.chat_service.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class ChatMessageResponse {

    private UUID id;
    private UUID bookingId;
    private UUID senderUserId;
    private String senderRole;
    private String senderEmail;
    private String content;
    private LocalDateTime createdAt;

    public ChatMessageResponse(
            UUID id,
            UUID bookingId,
            UUID senderUserId,
            String senderRole,
            String senderEmail,
            String content,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.bookingId = bookingId;
        this.senderUserId = senderUserId;
        this.senderRole = senderRole;
        this.senderEmail = senderEmail;
        this.content = content;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getBookingId() {
        return bookingId;
    }

    public UUID getSenderUserId() {
        return senderUserId;
    }

    public String getSenderRole() {
        return senderRole;
    }

    public String getSenderEmail() {
        return senderEmail;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}