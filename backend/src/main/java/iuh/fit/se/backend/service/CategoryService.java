package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.response.CategoryResponse;
import iuh.fit.se.backend.entity.Category;
import iuh.fit.se.backend.entity.enums.Status;
import iuh.fit.se.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getAllCategories() {
        List<Category> categories = categoryRepository.findAll(org.springframework.data.domain.Sort.by(
            org.springframework.data.domain.Sort.Direction.DESC, "id"
        ));
        
        return categories.stream()
            .map(category -> convertToCategoryResponse(category, false))
            .collect(Collectors.toList());
    }

    public Category getCategoryById(Long id) {return categoryRepository.findById(id).orElse(null);}
    
    public CategoryResponse getCategoryDetailById(Long id) {
        Category category = categoryRepository.findById(id).orElse(null);
        if (category == null) return null;
        
        return convertToCategoryResponse(category, true);
    }
    
    public Category saveCategory(Category category) {
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(null);
        category.setStatus(Status.INACTIVE);
        categoryRepository.save(category);
    }
    
    private CategoryResponse convertToCategoryResponse(Category category, boolean includeProducts) {
        CategoryResponse.CategoryResponseBuilder builder = CategoryResponse.builder()
            .id(category.getId())
            .name(category.getName())
            .description(category.getDescription())
            .status(category.getStatus() != null ? category.getStatus().name() : "ACTIVE")
            .productCount(category.getProducts() != null ? category.getProducts().size() : 0);
        
        if (includeProducts && category.getProducts() != null) {
            builder.products(category.getProducts().stream()
                .map(product -> CategoryResponse.ProductInfo.builder()
                    .id(product.getId())
                    .name(product.getName())
                    .build())
                .collect(Collectors.toList()));
        }
        
        return builder.build();
    }
}
