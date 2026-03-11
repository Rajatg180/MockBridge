package com.mockbridge.interview_service.repository;

import com.mockbridge.interview_service.entity.AvailabilitySlot;
import com.mockbridge.interview_service.entity.SlotStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AvailabilitySlotRepository extends JpaRepository<AvailabilitySlot, UUID> {

    List<AvailabilitySlot> findByInterviewerId(UUID interviewerId);

    //  will return all slots for the interviewer, ordered by start time descending (most recent first)
    List<AvailabilitySlot> findByInterviewerIdOrderByStartTimeUtcDesc(UUID interviewerId);

    List<AvailabilitySlot> findByStatus(SlotStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from AvailabilitySlot s where s.id = :id")
    Optional<AvailabilitySlot> findByIdForUpdate(@Param("id") UUID id);
}