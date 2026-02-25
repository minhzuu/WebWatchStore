package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.dto.request.NotificationReadRequest;
import iuh.fit.se.backend.dto.response.NotificationResponse;
import iuh.fit.se.backend.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/user/{userId}")
    public List<NotificationResponse> getByUser(@PathVariable Long userId) {
        return notificationService.getNotificationsByUser(userId);
    }

    @PatchMapping("/{id}/read")
    public NotificationResponse markAsRead(@PathVariable Long id,
                                            @Valid @RequestBody NotificationReadRequest request) {
        return notificationService.markAsRead(id, request.getUserId());
    }

    @PatchMapping("/user/{userId}/read")
    public ResponseEntity<Map<String, String>> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "Notifications marked as read"));
    }

    @GetMapping("/user/{userId}/unread-count")
    public Map<String, Long> countUnread(@PathVariable Long userId) {
        long total = notificationService.countUnread(userId);
        return Map.of("total", total);
    }
}
