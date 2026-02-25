package iuh.fit.se.backend.specification;

import iuh.fit.se.backend.entity.Post;
import iuh.fit.se.backend.entity.PostCategory;
import iuh.fit.se.backend.entity.enums.PostStatus;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class PostSpecification {

    public static Specification<Post> hasTitle(String title) {
        return (root, query, cb) -> title == null || title.isEmpty() ? null : cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
    }

    public static Specification<Post> hasCategoryId(Long categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null) return null;
            Join<Object, Object> cat = root.join("postCategory", JoinType.INNER);
            return cb.equal(cat.get("id"), categoryId);
        };
    }

    public static Specification<Post> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isEmpty()) return null;
            try {
                PostStatus ps = PostStatus.valueOf(status);
                return cb.equal(root.get("status"), ps);
            } catch (IllegalArgumentException e) {
                return null;
            }
        };
    }

    public static Specification<Post> createdBetween(LocalDateTime from, LocalDateTime to) {
        return (root, query, cb) -> {
            if (from == null && to == null) return null;
            if (from != null && to != null) {
                return cb.between(root.get("createdAt"), from, to);
            } else if (from != null) {
                return cb.greaterThanOrEqualTo(root.get("createdAt"), from);
            } else {
                return cb.lessThanOrEqualTo(root.get("createdAt"), to);
            }
        };
    }
}
