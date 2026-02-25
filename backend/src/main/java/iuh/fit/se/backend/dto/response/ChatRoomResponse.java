package iuh.fit.se.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userFullName;
    private String userAvatar;
    private LocalDateTime userLastSeen;
    private LocalDateTime adminLastSeen;
    private Integer unreadCountForUser;
    private Integer unreadCountForAdmin;
    private ChatMessageResponse lastMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isUserOnline;
    private Boolean isAdminOnline;
}
