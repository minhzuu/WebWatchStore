package iuh.fit.se.backend.dto.response;

import iuh.fit.se.backend.entity.enums.MessageStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private Long id;
    private Long roomId;
    private Long senderId;
    private String senderName;
    private String senderRole;
    private String content;
    private MessageStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private Boolean isOwnMessage;
}
