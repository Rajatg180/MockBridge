package com.mockbridge.chat_service.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mockbridge.chat_service.entity.ChatMessage;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findByBookingIdOrderByCreatedAtAsc(UUID bookingId);
}