package iuh.fit.se.backend.repository;

import iuh.fit.se.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("SELECT r FROM Review r " +
        "LEFT JOIN FETCH r.user u " +
        "LEFT JOIN FETCH r.product p")
    List<Review> findAllWithUserAndProduct();

    @Query("SELECT r FROM Review r " +
        "LEFT JOIN FETCH r.user u " +
        "LEFT JOIN FETCH r.product p " +
        "WHERE r.id = :reviewId")
    Optional<Review> findByIdWithUserAndProduct(@Param("reviewId") Long reviewId);

    @Query("SELECT r FROM Review r " +
        "LEFT JOIN FETCH r.user u " +
        "LEFT JOIN FETCH r.product p " +
        "WHERE p.id = :productId")
    List<Review> findByProductIdWithUserAndProduct(@Param("productId") Long productId);

    @Query("SELECT r FROM Review r " +
        "LEFT JOIN FETCH r.user u " +
        "LEFT JOIN FETCH r.product p " +
        "WHERE u.id = :userId")
    List<Review> findByUserIdWithUserAndProduct(@Param("userId") Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double getAverageRating(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId")
    Long getTotalReviews(@Param("productId") Long productId);

    @Query("SELECT r FROM Review r " +
        "LEFT JOIN FETCH r.user u " +
        "LEFT JOIN FETCH r.product p " +
        "WHERE u.id = :userId AND p.id = :productId")
    Optional<Review> findByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);
}
