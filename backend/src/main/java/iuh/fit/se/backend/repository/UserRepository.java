package iuh.fit.se.backend.repository;

import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.entity.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    long countByActiveTrue();
    long countByActiveFalse();
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("""
      SELECT DATE(u.createdAt) AS day,
       COUNT(u.id) AS total
      FROM User u
      WHERE u.createdAt >= :start AND u.createdAt <= :end
      GROUP BY DATE(u.createdAt)
      ORDER BY day
      """)
    List<Object[]> countNewUsersByDayRange(@Param("start") LocalDateTime start,
             @Param("end") LocalDateTime end);

    @Query("""
      SELECT YEAR(u.createdAt) AS year,
       MONTH(u.createdAt) AS month,
       COUNT(u.id) AS total
      FROM User u
      WHERE YEAR(u.createdAt) = :year
      GROUP BY YEAR(u.createdAt), MONTH(u.createdAt)
      ORDER BY month
      """)
    List<Object[]> countNewUsersByMonth(@Param("year") int year);

    @Query("""
      SELECT YEAR(u.createdAt) AS year,
       COUNT(u.id) AS total
      FROM User u
      WHERE YEAR(u.createdAt) BETWEEN :startYear AND :endYear
      GROUP BY YEAR(u.createdAt)
      ORDER BY year
      """)
    List<Object[]> countNewUsersByYearRange(@Param("startYear") int startYear,
              @Param("endYear") int endYear);

    @Query("""
            SELECT u
            FROM User u
            WHERE (:role IS NULL OR u.role = :role)
              AND (:includeInactive = true OR u.active = true)
              AND (
                    :keyword IS NULL
                    OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                  )
            """)
    Page<User> searchUsers(@Param("keyword") String keyword,
                           @Param("role") Role role,
                           @Param("includeInactive") boolean includeInactive,
                           Pageable pageable);
}
