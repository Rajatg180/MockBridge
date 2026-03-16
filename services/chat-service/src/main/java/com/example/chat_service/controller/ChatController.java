package com.mockbridge.chat_service.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.mockbridge.chat_service.dto.ChatMessageResponse;
import com.mockbridge.chat_service.dto.SendChatMessageRequest;
import com.mockbridge.chat_service.security.GatewayAuth;
import com.mockbridge.chat_service.security.GatewayAuthResolver;
import com.mockbridge.chat_service.service.ChatService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/chat")
@Validated
public class ChatController {

    private final ChatService chatService;
    private final GatewayAuthResolver authResolver;

    public ChatController(ChatService chatService, GatewayAuthResolver authResolver) {
        this.chatService = chatService;
        this.authResolver = authResolver;
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Chat Service is healthy");
    }

    @GetMapping("/rooms/{bookingId}/messages")
    public List<ChatMessageResponse> getMessages(
            HttpServletRequest request,
            @PathVariable UUID bookingId
    ) {
        GatewayAuth auth = requireAuth(request);
        return chatService.getMessages(bookingId, auth);
    }

    @PostMapping("/rooms/{bookingId}/messages")
    public ChatMessageResponse sendMessage(
            HttpServletRequest request,
            @PathVariable UUID bookingId,
            @Valid @RequestBody SendChatMessageRequest req
    ) {
        GatewayAuth auth = requireAuth(request);
        return chatService.sendMessage(bookingId, auth, req.getContent());
    }

    private GatewayAuth requireAuth(HttpServletRequest request) {
        GatewayAuth auth = authResolver.resolve(request);
        if (auth == null) {
            throw new IllegalArgumentException("Missing gateway auth headers");
        }
        return auth;
    }
}