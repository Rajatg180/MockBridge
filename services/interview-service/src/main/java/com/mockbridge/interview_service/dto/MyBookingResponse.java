package com.mockbridge.interview_service.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class MyBookingResponse {

    private UUID bookingId;
    private UUID slotId;
    private UUID interviewerId;
    private String bookingStatus;
    private LocalDateTime startTimeUtc;
    private LocalDateTime endTimeUtc;

    public MyBookingResponse(
            UUID bookingId,
            UUID slotId,
            UUID interviewerId,
            String bookingStatus,
            LocalDateTime startTimeUtc,
            LocalDateTime endTimeUtc
    ) {
        this.bookingId = bookingId;
        this.slotId = slotId;
        this.interviewerId = interviewerId;
        this.bookingStatus = bookingStatus;
        this.startTimeUtc = startTimeUtc;
        this.endTimeUtc = endTimeUtc;
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

    public String getBookingStatus() {
        return bookingStatus;
    }

    public LocalDateTime getStartTimeUtc() {
        return startTimeUtc;
    }

    public LocalDateTime getEndTimeUtc() {
        return endTimeUtc;
    }
}