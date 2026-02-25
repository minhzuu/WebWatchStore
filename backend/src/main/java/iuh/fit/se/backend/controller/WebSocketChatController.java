package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.dto.request.ChatMessageRequest;
import iuh.fit.se.backend.dto.response.ChatMessageResponse;
import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.repository.UserRepository;
import iuh.fit.se.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketChatController {
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageRequest request) {
        try {
            if (request.getSenderId() == null) {
                log.error("SenderId is null in chat message request");
                return;
            }
            
            User sender = userRepository.findById(request.getSenderId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            ChatMessageResponse response = chatService.sendMessage(request, sender.getId());
            
            // Send to specific room
            messagingTemplate.convertAndSend("/topic/room/" + request.getRoomId(), response);
            
            // Send notification to admin if sender is user
            boolean isAdmin = sender.getRole().name().equals("ADMIN");
            if (!isAdmin) {
                messagingTemplate.convertAndSend("/topic/admin/new-message", response);
            }
            
            log.info("Message sent from user {} to room {}", sender.getId(), request.getRoomId());
        } catch (Exception e) {
            log.error("Error sending message: ", e);
        }
    }

    @MessageMapping("/chat.typing")
    public void userTyping(@Payload TypingNotification notification) {
        // Broadcast typing notification to room
        messagingTemplate.convertAndSend("/topic/room/" + notification.getRoomId() + "/typing", notification);
    }

    @lombok.Data
    public static class TypingNotification {
        private Long roomId;
        private Long userId;
        private String userName;
        private boolean typing;
    }
}
