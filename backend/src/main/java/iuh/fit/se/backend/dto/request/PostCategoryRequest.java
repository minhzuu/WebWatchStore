package iuh.fit.se.backend.dto.request;

import lombok.Data;

@Data
public class PostCategoryRequest {
    private String name;
    private String slug;
    private String description;
    private Integer displayOrder;
    private String status;
}
