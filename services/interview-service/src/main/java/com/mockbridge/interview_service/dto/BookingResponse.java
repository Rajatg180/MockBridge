package com.mockbridge.interview_service.dto;

import java.util.UUID;

public class BookingResponse {
    private UUID bookingId;
    private UUID slotId;
    private UUID studentId;
    private String status;

    public BookingResponse(UUID bookingId, UUID slotId, UUID studentId, String status) {
        this.bookingId = bookingId;
        this.slotId = slotId;
        this.studentId = studentId;
        this.status = status;
    }

    public UUID getBookingId() {
        return bookingId;
    }

    public UUID getSlotId() {
        return slotId;
    }

    public UUID getStudentId() {
        return studentId;
    }

    public String getStatus() {
        return status;
    }
}