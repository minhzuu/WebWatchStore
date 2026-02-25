package iuh.fit.se.backend.repository;

import iuh.fit.se.backend.entity.Order;
import iuh.fit.se.backend.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId);
    
    Optional<Order> findByTransactionId(String transactionId);

    Page<Order> findAll(Specification<Order> spec, Pageable pageable);

    @Query("""
        select date(o.createdAt) as orderDate, sum(oi.price * oi.quantity) as revenue
        from Order o
        join o.orderItems oi
        where date(o.createdAt) between :startDate and :endDate
          and o.status in :statuses
        group by orderDate
        order by orderDate
        """)
    List<Object[]> sumRevenueByDayRange(@Param("startDate") LocalDate startDate,
                    @Param("endDate") LocalDate endDate,
                    @Param("statuses") List<OrderStatus> statuses);

    @Query("""
        select date(o.createdAt) as orderDate,
               sum(oi.quantity) as unitsSold,
               count(distinct oi.product.id) as distinctProducts,
               count(distinct o.id) as ordersCount
        from Order o
        join o.orderItems oi
        where date(o.createdAt) between :startDate and :endDate
          and o.status in :statuses
        group by orderDate
        order by orderDate
        """)
    List<Object[]> sumUnitsSoldByDayRange(@Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate,
                     @Param("statuses") List<OrderStatus> statuses);

    @Query("""
        select year(o.createdAt) as yearValue,
           month(o.createdAt) as monthValue,
           sum(oi.price * oi.quantity) as revenue
        from Order o
        join o.orderItems oi
        where year(o.createdAt) = :year
          and o.status in :statuses
        group by yearValue, monthValue
        order by monthValue
        """)
    List<Object[]> sumRevenueByMonth(@Param("year") int year,
                     @Param("statuses") List<OrderStatus> statuses);

    @Query("""
        select year(o.createdAt) as yearValue,
           month(o.createdAt) as monthValue,
           sum(oi.quantity) as unitsSold,
           count(distinct oi.product.id) as distinctProducts
        from Order o
        join o.orderItems oi
        where year(o.createdAt) = :year
          and o.status in :statuses
        group by yearValue, monthValue
        order by monthValue
        """)
    List<Object[]> sumUnitsSoldByMonth(@Param("year") int year,
                     @Param("statuses") List<OrderStatus> statuses);

    @Query("""
        select year(o.createdAt) as yearValue,
           sum(oi.price * oi.quantity) as revenue
        from Order o
        join o.orderItems oi
        where year(o.createdAt) between :startYear and :endYear
          and o.status in :statuses
        group by yearValue
        order by yearValue
        """)
    List<Object[]> sumRevenueByYearRange(@Param("startYear") int startYear,
                     @Param("endYear") int endYear,
                     @Param("statuses") List<OrderStatus> statuses);

    @Query("""
        select year(o.createdAt) as yearValue,
           sum(oi.quantity) as unitsSold,
           count(distinct oi.product.id) as distinctProducts
        from Order o
        join o.orderItems oi
        where year(o.createdAt) between :startYear and :endYear
          and o.status in :statuses
        group by yearValue
        order by yearValue
        """)
    List<Object[]> sumUnitsSoldByYearRange(@Param("startYear") int startYear,
                     @Param("endYear") int endYear,
                     @Param("statuses") List<OrderStatus> statuses);

      @Query("""
        select date(o.createdAt) as orderDate,
             count(o.id) as totalOrders,
             sum(case when o.status in :fulfilledStatuses then 1 else 0 end) as fulfilledOrders,
             sum(case when o.status = :pendingStatus then 1 else 0 end) as pendingOrders,
             sum(case when o.status = :cancelledStatus then 1 else 0 end) as cancelledOrders
        from Order o
        where date(o.createdAt) between :startDate and :endDate
        group by orderDate
        order by orderDate
        """)
      List<Object[]> countOrdersByDayRange(@Param("startDate") LocalDate startDate,
                @Param("endDate") LocalDate endDate,
                @Param("fulfilledStatuses") List<OrderStatus> fulfilledStatuses,
                @Param("pendingStatus") OrderStatus pendingStatus,
                @Param("cancelledStatus") OrderStatus cancelledStatus);

      @Query("""
        select year(o.createdAt) as yearValue,
             month(o.createdAt) as monthValue,
             count(o.id) as totalOrders,
             sum(case when o.status in :fulfilledStatuses then 1 else 0 end) as fulfilledOrders,
             sum(case when o.status = :pendingStatus then 1 else 0 end) as pendingOrders,
             sum(case when o.status = :cancelledStatus then 1 else 0 end) as cancelledOrders
        from Order o
        where year(o.createdAt) = :year
        group by yearValue, monthValue
        order by monthValue
        """)
      List<Object[]> countOrdersByMonth(@Param("year") int year,
                @Param("fulfilledStatuses") List<OrderStatus> fulfilledStatuses,
                @Param("pendingStatus") OrderStatus pendingStatus,
                @Param("cancelledStatus") OrderStatus cancelledStatus);

      @Query("""
        select year(o.createdAt) as yearValue,
             count(o.id) as totalOrders,
             sum(case when o.status in :fulfilledStatuses then 1 else 0 end) as fulfilledOrders,
             sum(case when o.status = :pendingStatus then 1 else 0 end) as pendingOrders,
             sum(case when o.status = :cancelledStatus then 1 else 0 end) as cancelledOrders
        from Order o
        where year(o.createdAt) between :startYear and :endYear
        group by yearValue
        order by yearValue
        """)
      List<Object[]> countOrdersByYearRange(@Param("startYear") int startYear,
                 @Param("endYear") int endYear,
                 @Param("fulfilledStatuses") List<OrderStatus> fulfilledStatuses,
                 @Param("pendingStatus") OrderStatus pendingStatus,
                 @Param("cancelledStatus") OrderStatus cancelledStatus);

    @Query("""
        select coalesce(sum(oi.price * oi.quantity), 0)
        from Order o
        join o.orderItems oi
        where o.status in :statuses
        """)
    BigDecimal sumTotalRevenueByStatuses(@Param("statuses") List<OrderStatus> statuses);

    @Query("""
        select coalesce(sum(oi.price * oi.quantity), 0)
        from Order o
        join o.orderItems oi
        where o.status in :statuses
          and o.createdAt >= :startDate
          and o.createdAt <= :endDate
        """)
    BigDecimal sumRevenueInRange(@Param("startDate") LocalDateTime startDate,
                 @Param("endDate") LocalDateTime endDate,
                 @Param("statuses") List<OrderStatus> statuses);

    @Query("""
        select o.user.id,
           o.user.fullName,
           o.user.email,
           sum(oi.price * oi.quantity) as revenue,
           count(distinct o.id) as orderCount
        from Order o
        join o.orderItems oi
        where o.status in :statuses
          and year(o.createdAt) = :year
          and month(o.createdAt) = :month
        group by o.user.id, o.user.fullName, o.user.email
        order by revenue desc
        """)
    List<Object[]> sumCustomerRevenueByMonth(@Param("year") int year,
                         @Param("month") int month,
                         @Param("statuses") List<OrderStatus> statuses);

    @Query("""
        select o.user.id,
           o.user.fullName,
           o.user.email,
           sum(oi.price * oi.quantity) as revenue,
           count(distinct o.id) as orderCount
        from Order o
        join o.orderItems oi
        where o.status in :statuses
          and year(o.createdAt) = :year
        group by o.user.id, o.user.fullName, o.user.email
        order by revenue desc
        """)
    List<Object[]> sumCustomerRevenueByYear(@Param("year") int year,
                        @Param("statuses") List<OrderStatus> statuses);

    long countByStatusIn(List<OrderStatus> statuses);

    long countByStatus(OrderStatus status);

    long countByStatusInAndCreatedAtBetween(List<OrderStatus> statuses, LocalDateTime startDate, LocalDateTime endDate);

    long countByStatusAndCreatedAtBetween(OrderStatus status, LocalDateTime startDate, LocalDateTime endDate);

    long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("select max(o.createdAt) from Order o")
    LocalDateTime findLastOrderTimestamp();

    @Query("""
        select o.user.id,
               o.user.username,
               o.user.fullName,
               o.user.email,
               count(distinct o.id) as ordersCount,
               coalesce(sum(oi.quantity), 0) as totalUnits,
               coalesce(sum(oi.price * oi.quantity), 0) as totalAmount,
               max(o.createdAt) as latestOrderAt
        from Order o
        join o.orderItems oi
        where (:startDate is null or o.createdAt >= :startDate)
          and (:endDate is null or o.createdAt <= :endDate)
        group by o.user.id, o.user.username, o.user.fullName, o.user.email
        order by ordersCount desc, totalAmount desc
        """)
    List<Object[]> summarizeOrdersByUser(@Param("startDate") LocalDateTime startDate,
                                         @Param("endDate") LocalDateTime endDate);
}
