package com.mockbridge.interview_service.service;

import com.mockbridge.interview_service.dto.*;
import com.mockbridge.interview_service.entity.*;
import com.mockbridge.interview_service.repository.*;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class InterviewService {

    private final AvailabilitySlotRepository slotRepo;
    private final BookingRepository bookingRepo;
    private final SessionRepository sessionRepo;
    private final KafkaTemplate<String, String> kafkaTemplate;

    public InterviewService(AvailabilitySlotRepository slotRepo,
                            BookingRepository bookingRepo,
                            SessionRepository sessionRepo,
                            KafkaTemplate<String, String> kafkaTemplate) {
        this.slotRepo = slotRepo;
        this.bookingRepo = bookingRepo;
        this.sessionRepo = sessionRepo;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Transactional
    public SlotResponse createSlot(UUID interviewerId, CreateSlotRequest req) {
        if (req.getEndTimeUtc().isBefore(req.getStartTimeUtc()) || req.getEndTimeUtc().isEqual(req.getStartTimeUtc())) {
            throw new IllegalArgumentException("endTimeUtc must be after startTimeUtc");
        }

        AvailabilitySlot slot = new AvailabilitySlot();
        slot.setId(UUID.randomUUID());
        slot.setInterviewerId(interviewerId);
        slot.setStartTimeUtc(req.getStartTimeUtc());
        slot.setEndTimeUtc(req.getEndTimeUtc());
        slot.setStatus(SlotStatus.OPEN);
        slot.setCreatedAt(LocalDateTime.now());

        slotRepo.save(slot);

        return new SlotResponse(
                slot.getId(),
                slot.getInterviewerId(),
                slot.getStartTimeUtc(),
                slot.getEndTimeUtc(),
                slot.getStatus().name()
        );
    }

    @Transactional(readOnly = true)
    public List<SlotResponse> listOpenSlots() {
        return slotRepo.findByStatus(SlotStatus.OPEN).stream()
                .map(s -> new SlotResponse(
                        s.getId(),
                        s.getInterviewerId(),
                        s.getStartTimeUtc(),
                        s.getEndTimeUtc(),
                        s.getStatus().name()
                ))
                .toList();
    }

    @Transactional
    public BookingResponse bookSlot(UUID studentId, UUID slotId) {
        AvailabilitySlot slot = slotRepo.findByIdForUpdate(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found"));

        if (slot.getStatus() != SlotStatus.OPEN) {
            throw new IllegalArgumentException("Slot is not open");
        }

        Booking booking = new Booking();
        booking.setId(UUID.randomUUID());
        booking.setSlot(slot);
        booking.setStudentId(studentId);
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        try {
            bookingRepo.save(booking);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException("Slot already booked");
        }

        slot.setStatus(SlotStatus.BOOKED);
        slotRepo.save(slot);

        return new BookingResponse(
                booking.getId(),
                slot.getId(),
                studentId,
                booking.getStatus().name()
        );
    }

    @Transactional
    public SessionResponse confirmBooking(UUID interviewerId, UUID bookingId) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        AvailabilitySlot slot = booking.getSlot();

        if (!slot.getInterviewerId().equals(interviewerId)) {
            throw new IllegalArgumentException("You do not own this booking");
        }

        if (slot.getStatus() == SlotStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot confirm booking for a cancelled slot");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING bookings can be confirmed");
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepo.save(booking);

        String roomId = "mock-" + booking.getId().toString().replace("-", "");

        Session session = new Session();
        session.setId(UUID.randomUUID());
        session.setBooking(booking);
        session.setRoomId(roomId);
        session.setSessionStatus(SessionStatus.CREATED);

        sessionRepo.save(session);

        return new SessionResponse(
                session.getId(),
                booking.getId(),
                session.getRoomId(),
                session.getSessionStatus().name()
        );
    }

    @Transactional(readOnly = true)
    public SessionResponse getSession(UUID requesterUserId, UUID bookingId) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        UUID studentId = booking.getStudentId();
        UUID interviewerId = booking.getSlot().getInterviewerId();

        if (!requesterUserId.equals(studentId) && !requesterUserId.equals(interviewerId)) {
            throw new IllegalArgumentException("You are not part of this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("This interview was cancelled");
        }

        if (booking.getSlot().getStatus() == SlotStatus.CANCELLED) {
            throw new IllegalArgumentException("This slot was cancelled");
        }

        Session session = sessionRepo.findByBooking_Id(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Session not created yet"));

        return new SessionResponse(
                session.getId(),
                bookingId,
                session.getRoomId(),
                session.getSessionStatus().name()
        );
    }

    @Transactional(readOnly = true)
    public List<IncomingBookingRequestResponse> listIncomingBookingRequests(UUID interviewerId, String status) {
        List<Booking> bookings;

        if (status == null || status.isBlank()) {
            bookings = bookingRepo.findBySlot_InterviewerIdOrderByCreatedAtDesc(interviewerId);
        } else {
            BookingStatus bookingStatus;
            try {
                bookingStatus = BookingStatus.valueOf(status.trim().toUpperCase());
            } catch (Exception ex) {
                throw new IllegalArgumentException("Invalid status. Use PENDING/CONFIRMED/CANCELLED/COMPLETED");
            }

            bookings = bookingRepo.findBySlot_InterviewerIdAndStatusOrderByCreatedAtDesc(interviewerId, bookingStatus);
        }

        return bookings.stream()
                .map(this::toIncomingBookingRequestResponse)
                .toList();
    }

    private IncomingBookingRequestResponse toIncomingBookingRequestResponse(Booking booking) {
        AvailabilitySlot slot = booking.getSlot();

        return new IncomingBookingRequestResponse(
                booking.getId(),
                slot.getId(),
                slot.getInterviewerId(),
                booking.getStudentId(),
                booking.getStatus().name(),
                slot.getStatus().name(),
                slot.getStartTimeUtc(),
                slot.getEndTimeUtc(),
                booking.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<MyBookingResponse> myBooking(UUID studentId) {
        List<Booking> bookings = bookingRepo.findByStudentIdOrderByCreatedAtDesc(studentId);

        return bookings.stream()
                .map(this::toMyBookingResponse)
                .toList();
    }

    private MyBookingResponse toMyBookingResponse(Booking booking) {
        AvailabilitySlot slot = booking.getSlot();

        return new MyBookingResponse(
                booking.getId(),
                slot.getId(),
                slot.getInterviewerId(),
                booking.getStatus().name(),
                slot.getStartTimeUtc(),
                slot.getEndTimeUtc()
        );
    }

    @Transactional(readOnly = true)
    public List<SlotResponse> mySlots(UUID interviewerId) {
        return slotRepo.findByInterviewerIdOrderByStartTimeUtcDesc(interviewerId)
                .stream()
                .map(s -> new SlotResponse(
                        s.getId(),
                        s.getInterviewerId(),
                        s.getStartTimeUtc(),
                        s.getEndTimeUtc(),
                        s.getStatus().name()
                ))
                .toList();
    }

    /**
     * Cancel slot.
     * BOOKED slots should be cancelled, not deleted.
     * This preserves history and blocks future joining.
     */
    @Transactional
    public void cancelSlot(UUID interviewerId, UUID slotId) {
        AvailabilitySlot slot = slotRepo.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found"));

        if (!slot.getInterviewerId().equals(interviewerId)) {
            throw new IllegalArgumentException("You do not own this slot");
        }

        if (slot.getStatus() == SlotStatus.CANCELLED) {
            return;
        }

        slot.setStatus(SlotStatus.CANCELLED);
        slotRepo.save(slot);

        bookingRepo.findBySlot_Id(slotId).ifPresent(booking -> {
            if (booking.getStatus() == BookingStatus.PENDING || booking.getStatus() == BookingStatus.CONFIRMED) {
                booking.setStatus(BookingStatus.CANCELLED);
                booking.setUpdatedAt(LocalDateTime.now());
                bookingRepo.save(booking);
            }
        });
    }

    /**
     * Hard delete slot.
     * Only OPEN or CANCELLED slots can be deleted.
     * BOOKED slots must be cancelled instead.
     */
    @Transactional
    public void deleteSlot(UUID interviewerId, UUID slotId) {
        AvailabilitySlot slot = slotRepo.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found"));

        if (!slot.getInterviewerId().equals(interviewerId)) {
            throw new IllegalArgumentException("You do not own this slot");
        }

        if (slot.getStatus() == SlotStatus.BOOKED) {
            throw new IllegalArgumentException("Booked slots cannot be deleted. Cancel the slot instead.");
        }

        slotRepo.delete(slot);
    }
}