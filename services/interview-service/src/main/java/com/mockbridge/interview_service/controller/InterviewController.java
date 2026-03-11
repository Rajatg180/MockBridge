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

    @PostMapping("/slots")
    public SlotResponse createSlot(HttpServletRequest request, @Valid @RequestBody CreateSlotRequest req) {
        GatewayAuth auth = requireAuth(request);
        return service.createSlot(auth.getUserId(), req);
    }

    @GetMapping("/slots/open")
    public List<SlotResponse> openSlots() {
        return service.listOpenSlots();
    }

    @PostMapping("/slots/{slotId}/book")
    public BookingResponse book(HttpServletRequest request, @PathVariable UUID slotId) {
        GatewayAuth auth = requireAuth(request);
        return service.bookSlot(auth.getUserId(), slotId);
    }

    @PostMapping("/bookings/{bookingId}/confirm")
    public SessionResponse confirm(HttpServletRequest request, @PathVariable UUID bookingId) {
        GatewayAuth auth = requireAuth(request);
        return service.confirmBooking(auth.getUserId(), bookingId);
    }

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

    @GetMapping("/me/bookings")
    public List<MyBookingResponse> myBookings(HttpServletRequest request) {
        GatewayAuth auth = requireAuth(request);
        return service.myBooking(auth.getUserId());
    }

    @GetMapping("/me/slots")
    public List<SlotResponse> mySlots(HttpServletRequest request) {
        GatewayAuth auth = requireAuth(request);
        return service.mySlots(auth.getUserId());
    }

    /**
     * Cancel slot.
     * Use this for BOOKED slots or when you want to preserve history.
     */
    @DeleteMapping("/slots/{slotId}")
    public ResponseEntity<Void> cancelSlot(HttpServletRequest request, @PathVariable UUID slotId) {
        GatewayAuth auth = requireAuth(request);
        service.cancelSlot(auth.getUserId(), slotId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Hard delete slot.
     * Allowed only for OPEN or CANCELLED slots.
     * BOOKED slots must be cancelled, not deleted.
     */
    @DeleteMapping("/slots/{slotId}/hard-delete")
    public ResponseEntity<Void> deleteSlot(HttpServletRequest request, @PathVariable UUID slotId) {
        GatewayAuth auth = requireAuth(request);
        service.deleteSlot(auth.getUserId(), slotId);
        return ResponseEntity.noContent().build();
    }

    private GatewayAuth requireAuth(HttpServletRequest request) {
        GatewayAuth auth = authResolver.resolve(request);
        if (auth == null) {
            throw new IllegalArgumentException("Missing gateway auth headers");
        }
        return auth;
    }
}