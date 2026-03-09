package com.mockbridge.interview_service.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class IncomingBookingRequestResponse {

    private UUID bookingId;
    private UUID slotId;
    private UUID interviewerId;
    private UUID studentId;
    private String bookingStatus;
    private String slotStatus;
    private LocalDateTime startTimeUtc;
    private LocalDateTime endTimeUtc;
    private LocalDateTime createdAt;

    public IncomingBookingRequestResponse(
            UUID bookingId,
            UUID slotId,
            UUID interviewerId,
            UUID studentId,
            String bookingStatus,
            String slotStatus,
            LocalDateTime startTimeUtc,
            LocalDateTime endTimeUtc,
            LocalDateTime createdAt
    ) {
        this.bookingId = bookingId;
        this.slotId = slotId;
        this.interviewerId = interviewerId;
        this.studentId = studentId;
        this.bookingStatus = bookingStatus;
        this.slotStatus = slotStatus;
        this.startTimeUtc = startTimeUtc;
        this.endTimeUtc = endTimeUtc;
        this.createdAt = createdAt;
    }

    public UUID getBookingId() {
        return bookingId;
    }

    public UUID getSlotId() {
        return slotId;
    }

    public UUID getInterviewerId() {
        return interviewerId;
    }

    public UUID getStudentId() {
        return studentId;
    }

    public String getBookingStatus() {
        return bookingStatus;
    }

    public String getSlotStatus() {
        return slotStatus;
    }

    public LocalDateTime getStartTimeUtc() {
        return startTimeUtc;
    }

    public LocalDateTime getEndTimeUtc() {
        return endTimeUtc;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}