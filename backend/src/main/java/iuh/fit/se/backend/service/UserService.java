package iuh.fit.se.backend.service;

import iuh.fit.se.backend.dto.UserRequest;
import iuh.fit.se.backend.dto.UserSummary;
import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.entity.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface UserService {
    Page<UserSummary> searchUsers(String keyword, Role role, boolean includeInactive, Pageable pageable);

    Optional<UserSummary> getUserSummary(Long id);

    UserSummary createUser(UserRequest request);

    UserSummary updateUser(Long id, UserRequest request);

    UserSummary updateUserRole(Long id, Role role);

    UserSummary updateUserStatus(Long id, boolean active);

    void softDeleteUser(Long id);

    User validateUser(String username, String password);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}