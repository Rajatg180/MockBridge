package com.mockbridge.interview_service.service;

import com.mockbridge.interview_service.dto.*;
import com.mockbridge.interview_service.entity.*;
import com.mockbridge.interview_service.repository.*;
import com.mockbridge.interview_service.repository.BookingRepository;
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

    // Interviewer creates an OPEN slot
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

        return new SlotResponse(slot.getId(), slot.getInterviewerId(), slot.getStartTimeUtc(), slot.getEndTimeUtc(),
                slot.getStatus().name());
    }

    @Transactional(readOnly = true)
    public List<SlotResponse> listOpenSlots() {
        return slotRepo.findByStatus(SlotStatus.OPEN).stream()
                .map(s -> new SlotResponse(s.getId(), s.getInterviewerId(), s.getStartTimeUtc(), s.getEndTimeUtc(),
                        s.getStatus().name()))
                .toList();
    }

    // Student books a slot with locking
    @Transactional
    public BookingResponse bookSlot(UUID studentId, UUID slotId) {
        AvailabilitySlot slot = slotRepo.findByIdForUpdate(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Slot not found"));

        // if (bookingRepo.existsBySlot(slot)) {
        // throw new IllegalArgumentException("Slot already booked");
        // }

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
            // slot_id unique constraint hit (double booking attempt)
            throw new IllegalArgumentException("Slot already booked");
        }

        slot.setStatus(SlotStatus.BOOKED);
        slotRepo.save(slot);

        // Kafka event (lightweight for now)
        kafkaTemplate.send("interview-booked", booking.getId().toString());

        return new BookingResponse(booking.getId(), slot.getId(), studentId, booking.getStatus().name());
    }

    // Interviewer confirms booking -> create session + roomId
    @Transactional
    public SessionResponse confirmBooking(UUID interviewerId, UUID bookingId) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        AvailabilitySlot slot = booking.getSlot();

        if (!slot.getInterviewerId().equals(interviewerId)) {
            throw new IllegalArgumentException("You do not own this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING bookings can be confirmed");
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepo.save(booking);

        String roomId = "mock-" + booking.getId(); // Jitsi room

        Session session = new Session();
        session.setId(UUID.randomUUID());
        session.setBooking(booking);
        session.setRoomId(roomId);
        session.setSessionStatus(SessionStatus.CREATED);

        sessionRepo.save(session);

        kafkaTemplate.send("interview-confirmed", booking.getId().toString());

        return new SessionResponse(session.getId(), booking.getId(), session.getRoomId(),
                session.getSessionStatus().name());
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

        Session session = sessionRepo.findByBooking_Id(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Session not created yet"));

        return new SessionResponse(session.getId(), bookingId, session.getRoomId(), session.getSessionStatus().name());
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
                booking.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public List<MyBookingResponse> myBooking(UUID studedId){
        List<Booking> bookings = bookingRepo.findByStudentIdOrderByCreatedAtDesc(studedId);
        // System.out.println("Bookings found: " + bookings.size());
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
                slot.getEndTimeUtc());
    }
}