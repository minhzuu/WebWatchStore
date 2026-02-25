package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.request.PostCategoryRequest;
import iuh.fit.se.backend.entity.PostCategory;
import iuh.fit.se.backend.entity.enums.Status;
import iuh.fit.se.backend.repository.PostCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostCategoryService {
    private final PostCategoryRepository categoryRepository;

    private String generateSlug(String input) {
        if (input == null || input.isBlank()) {
            return "category";
        }

        String normalized = input.trim();

        // Xử lý ký tự đặc biệt tiếng Việt (đ, Đ) trước khi normalize
        normalized = normalized.replace("đ", "d").replace("Đ", "d");

        // Tách dấu tiếng Việt (á, à, ả, ã, ạ -> a)
        normalized = Normalizer.normalize(normalized, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        // Chuyển về lowercase và thay thế các ký tự không phải chữ cái hoặc số bằng dấu gạch ngang
        normalized = normalized.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "")  // Loại bỏ dấu gạch ngang ở đầu và cuối
                .replaceAll("-{2,}", "-");   // Gộp nhiều dấu gạch ngang liên tiếp thành 1

        String baseSlug = normalized.isBlank() ? "category" : normalized;
        String slug = baseSlug;
        int counter = 2;

        // Kiểm tra trùng lặp và thêm số thứ tự nếu cần
        while (categoryRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }

        return slug;
    }

    @Transactional
    public PostCategory createCategory(PostCategoryRequest request) {
        PostCategory category = new PostCategory();
        category.setName(request.getName());

        if (request.getSlug() == null || request.getSlug().isBlank()) {
            category.setSlug(generateSlug(request.getName()));
        } else {
            category.setSlug(generateSlug(request.getSlug()));
        }

        category.setDescription(request.getDescription());
        category.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);

        return categoryRepository.save(category);
    }

    @Transactional
    public PostCategory updateCategory(Long id, PostCategoryRequest request) {
        PostCategory category = categoryRepository.findById(id)
                .orElse(null);

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        if (request.getStatus() != null) {
            category.setStatus(Status.valueOf(request.getStatus()));
        }

        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        PostCategory category = categoryRepository.findById(id)
            .orElse(null);
        category.setStatus(Status.INACTIVE);
        categoryRepository.save(category);
    }

    public PostCategory getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElse(null);
    }

    public PostCategory getCategoryBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
                .orElse(null);
    }

    public List<PostCategory> getAllCategories() {
        return categoryRepository.findAllByOrderByDisplayOrderAsc();
    }
}
