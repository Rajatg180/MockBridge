package com.mockbridge.interview_service.repository;

import com.mockbridge.interview_service.entity.Booking;
import com.mockbridge.interview_service.entity.BookingStatus;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {

    Optional<Booking> findBySlot_Id(UUID slotId);

    List<Booking> findByStudentId(UUID studentId);

    // EntityGraph is used to fetch the associated Slot entity along with the Booking to avoid N+1 query issues when accessing slot details in the service layer.
    @EntityGraph(attributePaths = "slot")
    List<Booking> findBySlot_InterviewerIdOrderByCreatedAtDesc(UUID interviewerId);

    @EntityGraph(attributePaths = "slot")
    List<Booking> findBySlot_InterviewerIdAndStatusOrderByCreatedAtDesc(
            UUID interviewerId,
            BookingStatus status
    );
}