package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.request.ChatMessageRequest;
import iuh.fit.se.backend.dto.response.ChatMessageResponse;
import iuh.fit.se.backend.dto.response.ChatRoomResponse;
import iuh.fit.se.backend.entity.ChatMessage;
import iuh.fit.se.backend.entity.ChatRoom;
import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.entity.enums.MessageStatus;
import iuh.fit.se.backend.repository.ChatMessageRepository;
import iuh.fit.se.backend.repository.ChatRoomRepository;
import iuh.fit.se.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    @Transactional
    public ChatRoomResponse getOrCreateRoom(Long userId) {
        ChatRoom room = chatRoomRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
                    
                    ChatRoom newRoom = ChatRoom.builder()
                            .user(user)
                            .unreadCountForUser(0)
                            .unreadCountForAdmin(0)
                            .build();
                    return chatRoomRepository.save(newRoom);
                });
        
        return toRoomResponse(room, null);
    }

    @Transactional
    public ChatMessageResponse sendMessage(ChatMessageRequest request, Long senderId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sender not found"));
        
        ChatRoom room = chatRoomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat room not found"));
        
        ChatMessage message = ChatMessage.builder()
                .room(room)
                .sender(sender)
                .content(request.getContent())
                .status(MessageStatus.SENT)
                .build();
        
        ChatMessage saved = chatMessageRepository.save(message);
        
        // Update unread count
        boolean isAdmin = sender.getRole().name().equals("ADMIN");
        if (isAdmin) {
            room.setUnreadCountForUser(room.getUnreadCountForUser() + 1);
        } else {
            room.setUnreadCountForAdmin(room.getUnreadCountForAdmin() + 1);
        }
        room.setUpdatedAt(LocalDateTime.now());
        chatRoomRepository.save(room);
        
        return toMessageResponse(saved, senderId);
    }

    public List<ChatMessageResponse> getMessages(Long roomId, Long userId, int page, int size) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat room not found"));
        
        // Verify user has access to this room
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        if (!isAdmin && !room.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have access to this chat room");
        }
        
        var messages = chatMessageRepository.findByRoomIdOrderByCreatedAtDesc(
                roomId, 
                PageRequest.of(page, size)
        );
        
        return messages.getContent().stream()
                .map(msg -> toMessageResponse(msg, userId))
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long roomId, Long userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chat room not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        
        if (isAdmin) {
            room.setUnreadCountForAdmin(0);
            room.setAdminLastSeen(LocalDateTime.now());
        } else {
            if (!room.getUser().getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You don't have access to this chat room");
            }
            room.setUnreadCountForUser(0);
            room.setUserLastSeen(LocalDateTime.now());
        }
        
        chatRoomRepository.save(room);
    }

    public List<ChatRoomResponse> getAllRoomsForAdmin() {
        List<ChatRoom> allRooms = chatRoomRepository.findAllOrderByUpdatedAtDesc();
        return allRooms.stream()
                .map(room -> toRoomResponse(room, null))
                .collect(Collectors.toList());
    }

    public ChatRoomResponse getRoomForUser(Long userId) {
        return getOrCreateRoom(userId);
    }

    private ChatMessageResponse toMessageResponse(ChatMessage message, Long currentUserId) {
        User sender = message.getSender();
        return ChatMessageResponse.builder()
                .id(message.getId())
                .roomId(message.getRoom().getId())
                .senderId(sender.getId())
                .senderName(sender.getFullName())
                .senderRole(sender.getRole().name())
                .content(message.getContent())
                .status(message.getStatus())
                .createdAt(message.getCreatedAt())
                .readAt(message.getReadAt())
                .isOwnMessage(sender.getId().equals(currentUserId))
                .build();
    }

    private ChatRoomResponse toRoomResponse(ChatRoom room, Long currentUserId) {
        User user = room.getUser();
        
        // Get last message
        ChatMessageResponse lastMessage = chatMessageRepository.findLastMessageByRoomId(room.getId())
                .map(msg -> toMessageResponse(msg, currentUserId))
                .orElse(null);
        
        // Check online status (user is online if last seen is within 5 minutes)
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
        boolean isUserOnline = room.getUserLastSeen() != null && room.getUserLastSeen().isAfter(fiveMinutesAgo);
        boolean isAdminOnline = room.getAdminLastSeen() != null && room.getAdminLastSeen().isAfter(fiveMinutesAgo);
        
        return ChatRoomResponse.builder()
                .id(room.getId())
                .userId(user.getId())
                .userName(user.getUsername())
                .userFullName(user.getFullName())
                .userAvatar(null) // Add avatar URL if available
                .userLastSeen(room.getUserLastSeen())
                .adminLastSeen(room.getAdminLastSeen())
                .unreadCountForUser(room.getUnreadCountForUser())
                .unreadCountForAdmin(room.getUnreadCountForAdmin())
                .lastMessage(lastMessage)
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt())
                .isUserOnline(isUserOnline)
                .isAdminOnline(isAdminOnline)
                .build();
    }

    public Integer getTotalUnreadForAdmin() {
        Integer count = chatRoomRepository.getTotalUnreadCountForAdmin();
        return count != null ? count : 0;
    }
}
