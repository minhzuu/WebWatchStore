package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.dto.request.PostRequest;
import iuh.fit.se.backend.entity.Post;
import iuh.fit.se.backend.entity.enums.PostStatus;
import iuh.fit.se.backend.service.PostService;
import lombok.extern.slf4j.Slf4j;
import iuh.fit.se.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Slf4j
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;
    private final UserRepository userRepository;

    // ==================== PUBLIC ENDPOINTS ====================

    @GetMapping
    public Page<Post> getPublishedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return postService.getPublishedPostsPaged(pageable);
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<Post> getPostBySlug(@PathVariable String slug) {
        Post post = postService.getPostBySlug(slug);
        if (post.getStatus() != PostStatus.PUBLISHED) {
            return ResponseEntity.notFound().build();
        }
        postService.incrementViewCount(post.getId());
        return ResponseEntity.ok(post);
    }

    @GetMapping("/category/{categoryId}")
    public Page<Post> getPostsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return postService.getPostsByCategory(categoryId, pageable);
    }

    @GetMapping("/latest")
    public List<Post> getLatestPosts(@RequestParam(defaultValue = "5") int limit) {
        List<Post> posts = postService.getPublishedPosts();
        return posts.subList(0, Math.min(limit, posts.size()));
    }

    // ==================== ADMIN ENDPOINTS ====================

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/all")
    public Page<Post> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String createdFrom,
            @RequestParam(required = false) String createdTo
    ) {
        Sort.Direction sortDirection = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        java.time.LocalDateTime from = null;
        java.time.LocalDateTime to = null;
        try {
            if (createdFrom != null && !createdFrom.isEmpty()) from = java.time.LocalDate.parse(createdFrom).atStartOfDay();
            if (createdTo != null && !createdTo.isEmpty()) to = java.time.LocalDate.parse(createdTo).atTime(23,59,59);
        } catch (Exception e) {
            // ignore parse errors, service will return results without date filter
        }

        if (title == null && categoryId == null && (status == null || status.isEmpty()) && from == null && to == null) {
            return postService.getAllPosts(pageable);
        }

        return postService.getAllPostsFiltered(title, categoryId, status, from, to, pageable);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public Post getPostById(@PathVariable Long id) {
        return postService.getPostById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Post createPost(@RequestBody PostRequest request, Authentication authentication) {
        Long authorId = null;
        if (authentication == null) {
            log.warn("createPost called without authentication");
        } else {
            String username = authentication.getName();
            log.info("createPost requested by principal='{}', authorities={}", username, authentication.getAuthorities());
            if (username != null) {
                var opt = userRepository.findByUsername(username);
                if (opt.isPresent()) {
                    authorId = opt.get().getId();
                } else {
                    log.warn("Authenticated username '{}' not found in DB; creating post without author", username);
                }
            }
        }

        return postService.createPost(request, authorId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Post updatePost(@PathVariable Long id, @RequestBody PostRequest request) {
        return postService.updatePost(id, request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePost(@PathVariable Long id) {
        postService.deletePost(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/search")
    public Page<Post> searchPosts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return postService.searchPosts(keyword, PageRequest.of(page, size));
    }
}
