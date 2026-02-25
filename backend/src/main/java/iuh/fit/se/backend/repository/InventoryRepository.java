package iuh.fit.se.backend.repository;

import iuh.fit.se.backend.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProductId(Long productId);

    @Query("select coalesce(sum(i.stock), 0) from Inventory i")
    Long sumTotalStock();

    @Query("select coalesce(count(distinct i.product.id), 0) from Inventory i")
    Long countDistinctProducts();

    long countByStockLessThanEqual(Integer stock);

    long countByStockLessThan(Integer stock);

    long countByStock(Integer stock);

    @Query("select max(i.updatedAt) from Inventory i")
    LocalDateTime findLatestUpdatedAt();
}
