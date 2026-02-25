package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.response.NotificationResponse;
import iuh.fit.se.backend.entity.Notification;
import iuh.fit.se.backend.entity.Product;
import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.repository.NotificationRepository;
import iuh.fit.se.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationResponse createNotification(User user, String title, String message) {
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is required for notification");
        }

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .read(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.debug("Created notification {} for user {}", saved.getId(), user.getId());
        
        // Broadcast notification via WebSocket to specific user
        NotificationResponse response = toResponse(saved);
        try {
            messagingTemplate.convertAndSendToUser(
                user.getId().toString(),
                "/queue/notifications",
                response
            );
            log.debug("Broadcasted notification {} to user {} via WebSocket", saved.getId(), user.getId());
        } catch (Exception e) {
            log.warn("Failed to broadcast notification via WebSocket: {}", e.getMessage());
        }
        
        return response;
    }

    public NotificationResponse createReviewDeletedNotification(User user, Product product, String reason) {
        String productName = product != null ? product.getName() : "sản phẩm";
        String title = "Đánh giá của bạn đã bị gỡ";
        String message = String.format(
                "Đánh giá của bạn về %s đã bị quản trị viên gỡ. Lý do: %s",
                productName,
                reason
        );
        return createNotification(user, title, message);
    }

    public NotificationResponse createOrderStatusChangedNotification(User user, Long orderId, String oldStatus, String newStatus) {
        String title = "Cập nhật trạng thái đơn hàng";
        String message = String.format(
                "Đơn hàng #%d của bạn đã được cập nhật từ '%s' sang '%s'",
                orderId,
                translateStatus(oldStatus),
                translateStatus(newStatus)
        );
        return createNotification(user, title, message);
    }

    public NotificationResponse createOrderCancelledNotification(User user, Long orderId) {
        String title = "Đơn hàng đã bị hủy";
        String message = String.format(
                "Đơn hàng #%d của bạn đã bị hủy bởi quản trị viên",
                orderId
        );
        return createNotification(user, title, message);
    }

    public NotificationResponse createPromotionNotification(User user, String promotionName, String promotionDetails) {
        String title = "🎉 Khuyến mãi mới!";
        String message = String.format(
                "%s - %s",
                promotionName,
                promotionDetails
        );
        return createNotification(user, title, message);
    }

    public void notifyAllUsers(String title, String message) {
        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            createNotification(user, title, message);
        }
        log.info("Sent notification to {} users: {}", allUsers.size(), title);
    }

    private String translateStatus(String status) {
        if (status == null) return "Không xác định";
        return switch (status.toUpperCase()) {
            case "PENDING" -> "Chờ xử lý";
            case "PROCESSING" -> "Đang xử lý";
            case "SHIPPED" -> "Đang giao hàng";
            case "DELIVERED" -> "Đã giao hàng";
            case "COMPLETED" -> "Hoàn thành";
            case "CANCELLED" -> "Đã hủy";
            case "PAID" -> "Đã thanh toán";
            default -> status;
        };
    }

    public List<NotificationResponse> getNotificationsByUser(Long userId) {
        validateUserExists(userId);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public NotificationResponse markAsRead(Long notificationId, Long userId) {
        validateUserExists(userId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Notification does not belong to this user");
        }

        if (Boolean.TRUE.equals(notification.getRead())) {
            return toResponse(notification);
        }

        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        return toResponse(saved);
    }

    public void markAllAsRead(Long userId) {
        validateUserExists(userId);
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        boolean hasUpdates = false;
        for (Notification notification : notifications) {
            if (!Boolean.TRUE.equals(notification.getRead())) {
                notification.setRead(true);
                hasUpdates = true;
            }
        }
        if (hasUpdates) {
            notificationRepository.saveAll(notifications);
        }
    }

    public long countUnread(Long userId) {
        validateUserExists(userId);
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    private void validateUserExists(Long userId) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User id is required");
        }
        boolean exists = userRepository.existsById(userId);
        if (!exists) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
    }

    private NotificationResponse toResponse(Notification notification) {
        if (notification == null) {
            return null;
        }
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUser() != null ? notification.getUser().getId() : null)
                .title(notification.getTitle())
                .message(notification.getMessage())
                .read(Boolean.TRUE.equals(notification.getRead()))
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
