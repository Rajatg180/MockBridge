package com.mockbridge.interview_service.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class SlotResponse {
    private UUID id;
    private UUID interviewerId;
    private LocalDateTime startTimeUtc;
    private LocalDateTime endTimeUtc;
    private String status;

    public SlotResponse(UUID id, UUID interviewerId, LocalDateTime startTimeUtc, LocalDateTime endTimeUtc,
            String status) {
        this.id = id;
        this.interviewerId = interviewerId;
        this.startTimeUtc = startTimeUtc;
        this.endTimeUtc = endTimeUtc;
        this.status = status;
    }

    public UUID getId() {
        return id;
    }

    public UUID getInterviewerId() {
        return interviewerId;
    }

    public LocalDateTime getStartTimeUtc() {
        return startTimeUtc;
    }

    public LocalDateTime getEndTimeUtc() {
        return endTimeUtc;
    }

    public String getStatus() {
        return status;
    }
}