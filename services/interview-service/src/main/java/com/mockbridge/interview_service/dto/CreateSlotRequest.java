package com.mockbridge.interview_service.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class CreateSlotRequest {

    @NotNull
    private LocalDateTime startTimeUtc;

    @NotNull
    private LocalDateTime endTimeUtc;

    public LocalDateTime getStartTimeUtc() {
        return startTimeUtc;
    }

    public void setStartTimeUtc(LocalDateTime startTimeUtc) {
        this.startTimeUtc = startTimeUtc;
    }

    public LocalDateTime getEndTimeUtc() {
        return endTimeUtc;
    }

    public void setEndTimeUtc(LocalDateTime endTimeUtc) {
        this.endTimeUtc = endTimeUtc;
    }
}