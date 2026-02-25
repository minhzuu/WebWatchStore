package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.dto.request.PostCategoryRequest;
import iuh.fit.se.backend.entity.PostCategory;
import iuh.fit.se.backend.service.PostCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/post-categories")
@RequiredArgsConstructor
public class PostCategoryController {
    private final PostCategoryService categoryService;

    @GetMapping
    public List<PostCategory> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @GetMapping("/{id}")
    public PostCategory getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id);
    }

    @GetMapping("/slug/{slug}")
    public PostCategory getCategoryBySlug(@PathVariable String slug) {
        return categoryService.getCategoryBySlug(slug);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PostCategory createCategory(@RequestBody PostCategoryRequest request) {
        return categoryService.createCategory(request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public PostCategory updateCategory(@PathVariable Long id, @RequestBody PostCategoryRequest request) {
        return categoryService.updateCategory(id, request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
    }
}
