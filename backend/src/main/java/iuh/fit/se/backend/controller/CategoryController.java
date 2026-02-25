package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.dto.request.CategoryRequest;
import iuh.fit.se.backend.dto.response.CategoryResponse;
import iuh.fit.se.backend.entity.Category;
import iuh.fit.se.backend.entity.enums.Status;
import iuh.fit.se.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    public List<CategoryResponse> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @GetMapping("/{id}")
    public CategoryResponse getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryDetailById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Category createCategory(@RequestBody CategoryRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        return categoryService.saveCategory(category);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Category updateCategory(@PathVariable Long id, @RequestBody CategoryRequest request) {
        Category category = categoryService.getCategoryById(id);
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            category.setStatus(Status.valueOf(request.getStatus()));
        }
        return categoryService.saveCategory(category);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
    }
}
