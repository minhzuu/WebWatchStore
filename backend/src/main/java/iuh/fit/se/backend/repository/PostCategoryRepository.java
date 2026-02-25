package iuh.fit.se.backend.repository;

import iuh.fit.se.backend.entity.PostCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostCategoryRepository extends JpaRepository<PostCategory, Long> {
    Optional<PostCategory> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<PostCategory> findAllByOrderByDisplayOrderAsc();
}
