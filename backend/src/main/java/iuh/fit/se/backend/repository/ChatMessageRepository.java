package iuh.fit.se.backend.repository;

import iuh.fit.se.backend.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.room.id = :roomId ORDER BY cm.createdAt DESC")
    Page<ChatMessage> findByRoomIdOrderByCreatedAtDesc(Long roomId, Pageable pageable);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.room.id = :roomId ORDER BY cm.createdAt DESC")
    List<ChatMessage> findByRoomIdOrderByCreatedAtDesc(Long roomId);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.room.id = :roomId ORDER BY cm.createdAt DESC LIMIT 1")
    Optional<ChatMessage> findLastMessageByRoomId(Long roomId);
}
