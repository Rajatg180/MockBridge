package com.mockbridge.interview_service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "availability_slots")
public class AvailabilitySlot {

    @Id
    private UUID id;

    @Column(name = "interviewer_id", nullable = false)
    private UUID interviewerId;

    @Column(name = "start_time_utc", nullable = false)
    private LocalDateTime startTimeUtc;

    @Column(name = "end_time_utc", nullable = false)
    private LocalDateTime endTimeUtc;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SlotStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getInterviewerId() {
        return interviewerId;
    }

    public void setInterviewerId(UUID interviewerId) {
        this.interviewerId = interviewerId;
    }

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

    public SlotStatus getStatus() {
        return status;
    }

    public void setStatus(SlotStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}