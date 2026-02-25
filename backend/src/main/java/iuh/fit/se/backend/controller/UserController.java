package iuh.fit.se.backend.controller;

import iuh.fit.se.backend.dto.ApiResponse;
import iuh.fit.se.backend.dto.UserRequest;
import iuh.fit.se.backend.dto.UserRoleUpdateRequest;
import iuh.fit.se.backend.dto.UserStatusUpdateRequest;
import iuh.fit.se.backend.dto.UserSummary;
import iuh.fit.se.backend.entity.enums.Role;
import iuh.fit.se.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.Locale;
import iuh.fit.se.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserSummary>>> searchUsers(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "role", required = false) String role,
            @RequestParam(value = "includeInactive", defaultValue = "false") boolean includeInactive
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);

        Role roleFilter = null;
        if (StringUtils.hasText(role) && !"ALL".equalsIgnoreCase(role)) {
            try {
                roleFilter = Role.valueOf(role.trim().toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.failure("Invalid role value"));
            }
        }

        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<UserSummary> data = userService.searchUsers(keyword, roleFilter, includeInactive, pageable);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserSummary>> getUser(@PathVariable Long id) {
        return userService.getUserSummary(id)
                .map(summary -> ResponseEntity.ok(ApiResponse.success(summary)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.failure("User not found")));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserSummary>> createUser(@RequestBody UserRequest request) {
        try {
            UserSummary summary = userService.createUser(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(summary));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(ApiResponse.failure(ex.getReason()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserSummary>> updateUser(@PathVariable Long id, @RequestBody UserRequest request) {
        try {
            UserSummary summary = userService.updateUser(id, request);
            return ResponseEntity.ok(ApiResponse.success(summary));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(ApiResponse.failure(ex.getReason()));
        }
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserSummary>> updateUserRole(@PathVariable Long id,
                                                                   @RequestBody UserRoleUpdateRequest request) {
        if (request == null || request.getRole() == null) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Role is required"));
        }

        try {
            UserSummary summary = userService.updateUserRole(id, request.getRole());
            return ResponseEntity.ok(ApiResponse.success(summary));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(ApiResponse.failure(ex.getReason()));
        }
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserSummary>> updateUserStatus(@PathVariable Long id,
                                                                     @RequestBody UserStatusUpdateRequest request) {
        if (request == null) {
            return ResponseEntity.badRequest().body(ApiResponse.failure("Status payload is required"));
        }

        try {
            UserSummary summary = userService.updateUserStatus(id, request.isActive());
            return ResponseEntity.ok(ApiResponse.success(summary));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(ApiResponse.failure(ex.getReason()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        try {
            userService.softDeleteUser(id);
            return ResponseEntity.ok(ApiResponse.success("User deactivated"));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode())
                    .body(ApiResponse.failure(ex.getReason()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummary>> getCurrentUser(Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.failure("Unauthenticated"));
        }
        String username = principal.getName();
        var optUser = userRepository.findByUsername(username);
        if (optUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.failure("User not found"));
        }
        var user = optUser.get();
        var summaryOpt = userService.getUserSummary(user.getId());
        return summaryOpt.map(summary -> ResponseEntity.ok(ApiResponse.success(summary)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.failure("User not found")));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserSummary>> updateCurrentUser(Principal principal, @RequestBody UserRequest request) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.failure("Unauthenticated"));
        }
        String username = principal.getName();
        var optUser = userRepository.findByUsername(username);
        if (optUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.failure("User not found"));
        }
        var current = optUser.get();

        if (request != null) {
            request.setRole(null); // prevent role escalation
            request.setUsername(null); // username cannot be changed via /me
            request.setEmail(null); // email cannot be changed via /me
        }

        try {
            UserSummary summary = userService.updateUser(current.getId(), request);
            return ResponseEntity.ok(ApiResponse.success(summary));
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(ex.getStatusCode()).body(ApiResponse.failure(ex.getReason()));
        }
    }
}
