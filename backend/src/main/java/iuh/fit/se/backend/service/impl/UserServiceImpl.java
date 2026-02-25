package iuh.fit.se.backend.service.impl;

import iuh.fit.se.backend.dto.UserRequest;
import iuh.fit.se.backend.dto.UserSummary;
import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.entity.enums.Role;
import iuh.fit.se.backend.repository.UserRepository;
import iuh.fit.se.backend.service.EmailService;
import iuh.fit.se.backend.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserSummary> searchUsers(String keyword, Role role, boolean includeInactive, Pageable pageable) {
        String sanitizedKeyword = sanitizeKeyword(keyword);
        return userRepository.searchUsers(sanitizedKeyword, role, includeInactive, pageable)
                .map(this::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserSummary> getUserSummary(Long id) {
        return userRepository.findById(id).map(this::toSummary);
    }

    @Override
    @Transactional
    public UserSummary createUser(UserRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User data is required");
        }

        String username = normalize(request.getUsername());
        String email = normalize(request.getEmail());
        String fullName = normalize(request.getFullName());

        if (!StringUtils.hasText(username)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required");
        }
        if (!StringUtils.hasText(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (!StringUtils.hasText(fullName)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Full name is required");
        }
        if (!request.hasPassword()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        ensureUniqueUsername(username, null);
        ensureUniqueEmail(email, null);

        Role role = request.getRole() != null ? request.getRole() : Role.USER;

        User user = User.builder()
            .username(username)
            .email(email)
            .fullName(fullName)
            .password(passwordEncoder.encode(request.getPassword()))
            .role(role)
            .active(true)
            .phone(request.getPhone())
            .address(request.getAddress())
            .city(request.getCity())
            .country(request.getCountry())
            .postalCode(request.getPostalCode())
            .avatarUrl(request.getAvatarUrl())
            .dateOfBirth(request.getDateOfBirth())
            .build();

        User saved = userRepository.save(user);

        // Send welcome email (best-effort). Exceptions from mail sending should not
        // prevent user creation; catch and log them.
        try {
            emailService.sendRegistrationEmail(saved.getEmail(), saved.getFullName());
        } catch (Exception ex) {
            // Log the exception; keep lightweight to avoid adding logging framework changes
            System.err.println("Failed to send registration email to " + saved.getEmail() + ": " + ex.getMessage());
        }

        return toSummary(saved);
    }

    @Override
    @Transactional
    public UserSummary updateUser(Long id, UserRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User data is required");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (StringUtils.hasText(request.getUsername())) {
            String username = normalize(request.getUsername());
            if (!username.equalsIgnoreCase(user.getUsername())) {
                ensureUniqueUsername(username, id);
            }
            user.setUsername(username);
        }

        if (StringUtils.hasText(request.getEmail())) {
            String email = normalize(request.getEmail());
            if (!email.equalsIgnoreCase(user.getEmail())) {
                ensureUniqueEmail(email, id);
            }
            user.setEmail(email);
        }

        if (StringUtils.hasText(request.getFullName())) {
            user.setFullName(normalize(request.getFullName()));
        }

        if (StringUtils.hasText(request.getPhone())) {
            user.setPhone(normalize(request.getPhone()));
        } else if (request.getPhone() != null && request.getPhone().isEmpty()) {
            user.setPhone(null);
        }

        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim().isEmpty() ? null : request.getAddress().trim());
        }

        if (request.getCity() != null) {
            user.setCity(request.getCity().trim().isEmpty() ? null : request.getCity().trim());
        }

        if (request.getCountry() != null) {
            user.setCountry(request.getCountry().trim().isEmpty() ? null : request.getCountry().trim());
        }

        if (request.getPostalCode() != null) {
            user.setPostalCode(request.getPostalCode().trim().isEmpty() ? null : request.getPostalCode().trim());
        }

        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().trim().isEmpty() ? null : request.getAvatarUrl().trim());
        }

        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        if (request.hasPassword()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return toSummary(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserSummary updateUserRole(Long id, Role role) {
        if (role == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role is required");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setRole(role);
        return toSummary(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserSummary updateUserStatus(Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setActive(active);
        return toSummary(userRepository.save(user));
    }

    @Override
    @Transactional
    public void softDeleteUser(Long id) {
        updateUserStatus(id, false);
    }

    @Override
    @Transactional
    public User validateUser(String username, String password) {
        if (!StringUtils.hasText(username) || !StringUtils.hasText(password)) {
            return null;
        }
        String input = normalize(username);

        Optional<User> optionalUser;
        // If input looks like an email, try email lookup first
        if (input != null && input.contains("@")) {
            optionalUser = userRepository.findByEmail(input);
            if (optionalUser.isEmpty()) {
                optionalUser = userRepository.findByUsername(input);
            }
        } else {
            optionalUser = userRepository.findByUsername(input);
            if (optionalUser.isEmpty()) {
                optionalUser = userRepository.findByEmail(input);
            }
        }

        if (optionalUser.isEmpty()) {
            return null;
        }

        User user = optionalUser.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return null;
        }

        if (!user.isActive()) {
            long activeCount = userRepository.countByActiveTrue();
            if (activeCount == 0) {
                user.setActive(true);
                user = userRepository.save(user);
            } else {
                return null;
            }
        }

        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        if (!StringUtils.hasText(username)) {
            return false;
        }
        return userRepository.findByUsername(normalize(username)).isPresent();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        if (!StringUtils.hasText(email)) {
            return false;
        }
        return userRepository.findByEmail(normalize(email)).isPresent();
    }

    private UserSummary toSummary(User user) {
        return new UserSummary(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFullName(),
            user.getRole(),
            user.isActive(),
            user.getCreatedAt(),
            user.getPhone(),
            user.getAddress(),
            user.getCity(),
            user.getCountry(),
            user.getPostalCode(),
            user.getAvatarUrl(),
            user.getDateOfBirth()
        );
    }

    private void ensureUniqueUsername(String username, Long excludeId) {
        userRepository.findByUsername(username)
                .filter(existing -> excludeId == null || !existing.getId().equals(excludeId))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
                });
    }

    private void ensureUniqueEmail(String email, Long excludeId) {
        userRepository.findByEmail(email)
                .filter(existing -> excludeId == null || !existing.getId().equals(excludeId))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
                });
    }

    private String sanitizeKeyword(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return null;
        }
        return keyword.trim().toLowerCase(Locale.ROOT);
    }

    private String normalize(String value) {
        return value != null ? value.trim() : null;
    }
}
