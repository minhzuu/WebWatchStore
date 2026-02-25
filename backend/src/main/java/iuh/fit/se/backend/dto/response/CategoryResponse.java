package iuh.fit.se.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private String status;
    private Integer productCount;
    private List<ProductInfo> products;
    
    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProductInfo {
        private Long id;
        private String name;
    }
}
