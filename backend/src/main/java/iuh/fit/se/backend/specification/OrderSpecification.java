package iuh.fit.se.backend.specification;

import iuh.fit.se.backend.entity.Order;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class OrderSpecification {

    public static Specification<Order> hasCustomerName(String customerName) {
        return (root, query, cb) -> {
            if (customerName == null || customerName.isBlank()) {
                return null;
            }
            String keyword = "%" + customerName.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("user").get("fullName")), keyword),
                    cb.like(cb.lower(root.get("user").get("email")), keyword)
            );
        };
    }

    public static Specification<Order> hasUsername(String username) {
        return (root, query, cb) -> {
            if (username == null || username.isBlank()) {
                return null;
            }
            String keyword = "%" + username.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("user").get("username")), keyword);
        };
    }

    public static Specification<Order> hasUserId(Long userId) {
        return (root, query, cb) -> {
            if (userId == null) {
                return null;
            }
            return cb.equal(root.get("user").get("id"), userId);
        };
    }

    public static Specification<Order> hasStatus(String status) {
        return (root, query, cb) ->
                cb.equal(cb.lower(root.get("status")), status.toLowerCase());
    }

    public static Specification<Order> createdAfter(LocalDateTime fromDate) {
        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate);
    }

    public static Specification<Order> createdBefore(LocalDateTime toDate) {
        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("createdAt"), toDate);
    }

    public static Specification<Order> hasTotalGreaterThanOrEqual(Double minTotal) {
        return (root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("totalAmount"), minTotal);
    }

    public static Specification<Order> hasTotalLessThanOrEqual(Double maxTotal) {
        return (root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("totalAmount"), maxTotal);
    }

}
