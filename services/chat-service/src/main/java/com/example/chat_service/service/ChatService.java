package com.mockbridge.chat_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.mockbridge.chat_service.dto.ChatMessageResponse;
import com.mockbridge.chat_service.entity.ChatMessage;
import com.mockbridge.chat_service.repository.ChatMessageRepository;
import com.mockbridge.chat_service.security.GatewayAuth;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final RestTemplate restTemplate;

    @Value("${services.interview.base-url}")
    private String interviewServiceBaseUrl;

    public ChatService(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.restTemplate = new RestTemplate();
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(UUID bookingId, GatewayAuth auth) {
        verifyParticipantAccess(bookingId, auth);

        return chatMessageRepository.findByBookingIdOrderByCreatedAtAsc(bookingId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ChatMessageResponse sendMessage(UUID bookingId, GatewayAuth auth, String content) {
        verifyParticipantAccess(bookingId, auth);

        String sanitized = content == null ? "" : content.trim();

        if (sanitized.isBlank()) {
            throw new IllegalArgumentException("Message content is required");
        }

        if (sanitized.length() > 1000) {
            throw new IllegalArgumentException("Message must be at most 1000 characters");
        }

        ChatMessage message = new ChatMessage();
        message.setId(UUID.randomUUID());
        message.setBookingId(bookingId);
        message.setSenderUserId(auth.getUserId());
        message.setSenderRole(auth.getRole());
        message.setSenderEmail(auth.getEmail());
        message.setContent(sanitized);
        message.setCreatedAt(LocalDateTime.now());

        chatMessageRepository.save(message);

        return toResponse(message);
    }

    private void verifyParticipantAccess(UUID bookingId, GatewayAuth auth) {
        String url = interviewServiceBaseUrl + "/interviews/bookings/" + bookingId + "/access";

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Id", auth.getUserId().toString());

        if (auth.getEmail() != null) {
            headers.set("X-User-Email", auth.getEmail());
        }

        if (auth.getRole() != null) {
            headers.set("X-User-Role", auth.getRole());
        }

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Void> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Void.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new IllegalArgumentException("You are not allowed to access chat for this session");
            }
        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalArgumentException("You are not allowed to access chat for this session");
        }
    }

    private ChatMessageResponse toResponse(ChatMessage message) {
        return new ChatMessageResponse(
                message.getId(),
                message.getBookingId(),
                message.getSenderUserId(),
                message.getSenderRole(),
                message.getSenderEmail(),
                message.getContent(),
                message.getCreatedAt()
        );
    }
}