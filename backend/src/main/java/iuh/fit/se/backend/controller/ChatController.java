package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.dto.response.ChatMessageResponse;
import iuh.fit.se.backend.dto.response.ChatRoomResponse;
import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.repository.UserRepository;
import iuh.fit.se.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    private final UserRepository userRepository;

    @GetMapping("/room")
    public ResponseEntity<ChatRoomResponse> getOrCreateRoom(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        ChatRoomResponse room = chatService.getRoomForUser(user.getId());
        return ResponseEntity.ok(room);
    }

    @GetMapping("/rooms")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ChatRoomResponse>> getAllRooms() {
        List<ChatRoomResponse> rooms = chatService.getAllRoomsForAdmin();
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/room/{roomId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<ChatMessageResponse> messages = chatService.getMessages(roomId, user.getId(), page, size);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/room/{roomId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long roomId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        chatService.markAsRead(roomId, user.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/admin/unread-count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Integer>> getUnreadCount() {
        Integer count = chatService.getTotalUnreadForAdmin();
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }
}
