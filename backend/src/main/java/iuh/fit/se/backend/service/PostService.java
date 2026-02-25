package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.request.PostRequest;
import iuh.fit.se.backend.entity.Post;
import iuh.fit.se.backend.entity.PostCategory;
import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.entity.enums.PostStatus;
import iuh.fit.se.backend.repository.PostCategoryRepository;
import iuh.fit.se.backend.repository.PostRepository;
import iuh.fit.se.backend.repository.UserRepository;
import iuh.fit.se.backend.specification.PostSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final PostCategoryRepository categoryRepository;
    private final UserRepository userRepository;

    private String generateSlug(String input) {
        if (input == null || input.isBlank()) {
            return "post";
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

        String baseSlug = normalized.isBlank() ? "post" : normalized;
        String slug = baseSlug;
        int counter = 2;

        // Kiểm tra trùng lặp và thêm số thứ tự nếu cần
        while (postRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }

        return slug;
    }

    @Transactional
    public Post createPost(PostRequest request, Long authorId) {
        Post post = new Post();
        post.setTitle(request.getTitle());

        // Generate slug if not provided
        if (request.getSlug() == null || request.getSlug().isBlank()) {
            post.setSlug(generateSlug(request.getTitle()));
        } else {
            post.setSlug(generateSlug(request.getSlug()));
        }

        post.setContent(request.getContent());
        post.setSummary(request.getSummary());
        post.setCoverImageUrl(request.getCoverImageUrl());
        post.setSeoTitle(request.getSeoTitle());
        post.setSeoDescription(request.getSeoDescription());
        post.setSeoKeywords(request.getSeoKeywords());
        post.setStatus(request.getStatus() != null ? request.getStatus() : PostStatus.DRAFT);
        post.setTags(request.getTags() != null ? request.getTags() : "");

        if (request.getCategoryId() != null) {
            PostCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            post.setPostCategory(category);
        }

        if (authorId != null) {
            User author = userRepository.findById(authorId)
                    .orElseThrow(() -> new RuntimeException("Author not found"));
            post.setAuthor(author);
        }

        if (post.getStatus() == PostStatus.PUBLISHED && post.getPublishedAt() == null) {
            post.setPublishedAt(LocalDateTime.now());
        }

        return postRepository.save(post);
    }

    @Transactional
    public Post updatePost(Long id, PostRequest request) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setSummary(request.getSummary());
        post.setCoverImageUrl(request.getCoverImageUrl());
        post.setSeoTitle(request.getSeoTitle());
        post.setSeoDescription(request.getSeoDescription());
        post.setSeoKeywords(request.getSeoKeywords());
        post.setTags(request.getTags() != null ? request.getTags() : "");

        if (request.getCategoryId() != null) {
            PostCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            post.setPostCategory(category);
        }

        // Update status and publishedAt
        if (request.getStatus() != null && request.getStatus() != post.getStatus()) {
            post.setStatus(request.getStatus());
            if (request.getStatus() == PostStatus.PUBLISHED && post.getPublishedAt() == null) {
                post.setPublishedAt(LocalDateTime.now());
            }
        }

        return postRepository.save(post);
    }

    @Transactional
    public void deletePost(Long id) {
        postRepository.deleteById(id);
    }

    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }

    public Post getPostBySlug(String slug) {
        return postRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }

    public Page<Post> getAllPosts(Pageable pageable) {
        return postRepository.findAll(pageable);
    }

    public Page<Post> getAllPostsFiltered(
            String title,
            Long categoryId,
            String status,
            java.time.LocalDateTime createdFrom,
            java.time.LocalDateTime createdTo,
            Pageable pageable
    ) {
        org.springframework.data.jpa.domain.Specification<Post> spec = null;

        spec = PostSpecification.hasTitle(title);
        spec = (spec == null) ? PostSpecification.hasCategoryId(categoryId) : spec.and(PostSpecification.hasCategoryId(categoryId));
        spec = (spec == null) ? PostSpecification.hasStatus(status) : spec.and(PostSpecification.hasStatus(status));
        spec = (spec == null) ? PostSpecification.createdBetween(createdFrom, createdTo) : spec.and(PostSpecification.createdBetween(createdFrom, createdTo));

        return postRepository.findAll(spec, pageable);
    }

    public List<Post> getPublishedPosts() {
        return postRepository.findByStatusOrderByPublishedAtDesc(PostStatus.PUBLISHED);
    }

    public Page<Post> getPublishedPostsPaged(Pageable pageable) {
        return postRepository.findByStatus(PostStatus.PUBLISHED, pageable);
    }

    public Page<Post> getPostsByCategory(Long categoryId, Pageable pageable) {
        return postRepository.findByPostCategory_IdAndStatus(categoryId, PostStatus.PUBLISHED, pageable);
    }

    public Page<Post> searchPosts(String keyword, Pageable pageable) {
        return postRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(keyword, keyword, pageable);
    }

    @Transactional
    public void incrementViewCount(Long id) {
        Post post = getPostById(id);
        post.setViewCount(post.getViewCount() + 1);
        postRepository.save(post);
    }
}
