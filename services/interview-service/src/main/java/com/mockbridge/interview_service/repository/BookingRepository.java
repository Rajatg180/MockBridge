package com.mockbridge.interview_service.repository;

import com.mockbridge.interview_service.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
    // this is join query to find booking by slot id  , we are using optional because slot might not have booking
    Optional<Booking> findBySlot_Id(UUID slotId);
    List<Booking> findByStudentId(UUID studentId);
}