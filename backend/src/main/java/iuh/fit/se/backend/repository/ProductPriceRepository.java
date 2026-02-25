package iuh.fit.se.backend.repository;

import iuh.fit.se.backend.entity.ProductPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface ProductPriceRepository extends JpaRepository<ProductPrice, Long> {

    @Query("SELECT MIN(pp.price) FROM ProductPrice pp WHERE pp.isCurrent = true")
    BigDecimal findMinCurrentPrice();

    @Query("SELECT MAX(pp.price) FROM ProductPrice pp WHERE pp.isCurrent = true")
    BigDecimal findMaxCurrentPrice();
}
