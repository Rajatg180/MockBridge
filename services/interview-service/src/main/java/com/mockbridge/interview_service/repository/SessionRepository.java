package com.mockbridge.interview_service.repository;

import com.mockbridge.interview_service.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SessionRepository extends JpaRepository<Session, UUID> {
    // finding session by booking id , we are using optional because booking might not have session
    Optional<Session> findByBooking_Id(UUID bookingId);
}
