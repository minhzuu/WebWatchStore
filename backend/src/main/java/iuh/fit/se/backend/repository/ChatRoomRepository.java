package iuh.fit.se.backend.repository;

import iuh.fit.se.backend.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    
    Optional<ChatRoom> findByUserId(Long userId);
    
    @Query("SELECT cr FROM ChatRoom cr ORDER BY cr.updatedAt DESC")
    List<ChatRoom> findAllOrderByUpdatedAtDesc();
    
    @Query("SELECT SUM(cr.unreadCountForAdmin) FROM ChatRoom cr")
    Integer getTotalUnreadCountForAdmin();
}
