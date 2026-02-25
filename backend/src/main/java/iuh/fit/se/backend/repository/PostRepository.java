package iuh.fit.se.backend.repository;

import iuh.fit.se.backend.entity.Post;
import iuh.fit.se.backend.entity.enums.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long>, JpaSpecificationExecutor<Post> {
    Optional<Post> findBySlug(String slug);
    boolean existsBySlug(String slug);
    Page<Post> findByStatus(PostStatus status, Pageable pageable);
    List<Post> findByStatusOrderByPublishedAtDesc(PostStatus status);
    Page<Post> findByPostCategory_IdAndStatus(Long categoryId, PostStatus status, Pageable pageable);
    Page<Post> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(String title, String content, Pageable pageable);
}
