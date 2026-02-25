package iuh.fit.se.backend.specification;

import iuh.fit.se.backend.entity.Product;
import iuh.fit.se.backend.entity.enums.ProductStatus;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import java.math.BigDecimal;
import org.springframework.data.jpa.domain.Specification;

public class ProductSpecification {

    public static Specification<Product> hasName(String name) {
        return (root, query, cb) ->
                name == null ? null : cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Product> hasCategory(String categoryName) {
        return (root, query, cb) -> {
            if (categoryName == null) return null;
            Join<Object, Object> category = root.join("category", JoinType.INNER);
            return cb.equal(cb.lower(category.get("name")), categoryName.toLowerCase());
        };
    }

    public static Specification<Product> hasSupplier(String supplierName) {
        return (root, query, cb) -> {
            if (supplierName == null) return null;
            Join<Object, Object> supplier = root.join("supplier", JoinType.INNER);
            return cb.equal(cb.lower(supplier.get("name")), supplierName.toLowerCase());
        };
    }

    public static Specification<Product> hasBrand(String brandName) {
        return (root, query, cb) -> {
            if (brandName == null) return null;
            Join<Object, Object> brand = root.join("brand", JoinType.INNER);
            return cb.equal(cb.lower(brand.get("name")), brandName.toLowerCase());
        };
    }

    public static Specification<Product> hasPriceBetween(Double minPrice, Double maxPrice) {
        return (root, query, cb) -> {
            if (minPrice == null && maxPrice == null) return null;

            // join productPrices and filter by price; prefer current prices if available
            Join<Object, Object> prices = root.join("productPrices", JoinType.LEFT);
            // ensure we don't return duplicate products when joining
            query.distinct(true);

            if (minPrice != null && maxPrice != null) {
                return cb.and(
                        cb.equal(prices.get("isCurrent"), true),
                        cb.between(prices.get("price"), BigDecimal.valueOf(minPrice), BigDecimal.valueOf(maxPrice))
                );
            } else if (minPrice != null) {
                return cb.and(
                        cb.equal(prices.get("isCurrent"), true),
                        cb.greaterThanOrEqualTo(prices.get("price"), BigDecimal.valueOf(minPrice))
                );
            } else {
                return cb.and(
                        cb.equal(prices.get("isCurrent"), true),
                        cb.lessThanOrEqualTo(prices.get("price"), BigDecimal.valueOf(maxPrice))
                );
            }
        };
    }

    public static Specification<Product> hasStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isEmpty()) return null;
            try {
                ProductStatus ps = ProductStatus.valueOf(status);
                return cb.equal(root.get("status"), ps);
            } catch (IllegalArgumentException e) {
                return null; // invalid status string -> ignore filter
            }
        };
    }
}
