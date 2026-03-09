package com.mockbridge.interview_service.controller;

import com.mockbridge.interview_service.dto.*;
import com.mockbridge.interview_service.security.GatewayAuth;
import com.mockbridge.interview_service.security.GatewayAuthResolver;
import com.mockbridge.interview_service.service.InterviewService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/interviews")
public class InterviewController {

    private final InterviewService service;
    private final GatewayAuthResolver authResolver;

    public InterviewController(InterviewService service, GatewayAuthResolver authResolver) {
        this.service = service;
        this.authResolver = authResolver;
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Interview Service is healthy");
    }

    /**
     * Option #1 (single USER):
     * Any authenticated user can create a slot.
     * Creating a slot means "I am acting as interviewer for this slot".
     */
    @PostMapping("/slots")
    public SlotResponse createSlot(HttpServletRequest request, @Valid @RequestBody CreateSlotRequest req) {
        GatewayAuth auth = requireAuth(request);
        return service.createSlot(auth.getUserId(), req);
    }

    /**
     * Any user can browse open slots.
     */
    @GetMapping("/slots/open")
    public List<SlotResponse> openSlots() {
        return service.listOpenSlots();
    }

    /**
     * Option #1 (single USER):
     * Any authenticated user can book a slot.
     * Booking means "I am acting as student for this booking".
     */
    @PostMapping("/slots/{slotId}/book")
    public BookingResponse book(HttpServletRequest request, @PathVariable UUID slotId) {
        GatewayAuth auth = requireAuth(request);
        return service.bookSlot(auth.getUserId(), slotId);
    }

    /**
     * Only the slot owner can confirm a booking.
     * Ownership is enforced inside service.confirmBooking().
     */
    @PostMapping("/bookings/{bookingId}/confirm")
    public SessionResponse confirm(HttpServletRequest request, @PathVariable UUID bookingId) {
        GatewayAuth auth = requireAuth(request);
        return service.confirmBooking(auth.getUserId(), bookingId);
    }

    /**
     * Only participants (slot owner or booking student) can fetch session details.
     * Enforced inside service.getSession().
     */
    @GetMapping("/bookings/{bookingId}/session")
    public SessionResponse getSession(HttpServletRequest request, @PathVariable UUID bookingId) {
        GatewayAuth auth = requireAuth(request);
        return service.getSession(auth.getUserId(), bookingId);
    }

     @GetMapping("/me/booking-requests")
    public List<IncomingBookingRequestResponse> myBookingRequests(
            HttpServletRequest request,
            @RequestParam(defaultValue = "PENDING") String status) {
        GatewayAuth auth = requireAuth(request);
        return service.listIncomingBookingRequests(auth.getUserId(), status);
    }

    private GatewayAuth requireAuth(HttpServletRequest request) {
        GatewayAuth auth = authResolver.resolve(request);
        if (auth == null)
            throw new IllegalArgumentException("Missing gateway auth headers");
        return auth;
    }

   
}