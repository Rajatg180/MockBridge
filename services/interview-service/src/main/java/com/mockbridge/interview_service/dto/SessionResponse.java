package com.mockbridge.interview_service.dto;

import java.util.UUID;

public class SessionResponse {
    private UUID sessionId;
    private UUID bookingId;
    private String roomId;
    private String sessionStatus;

    public SessionResponse(UUID sessionId, UUID bookingId, String roomId, String sessionStatus) {
        this.sessionId = sessionId;
        this.bookingId = bookingId;
        this.roomId = roomId;
        this.sessionStatus = sessionStatus;
    }

    public UUID getSessionId() {
        return sessionId;
    }

    public UUID getBookingId() {
        return bookingId;
    }

    public String getRoomId() {
        return roomId;
    }

    public String getSessionStatus() {
        return sessionStatus;
    }
}