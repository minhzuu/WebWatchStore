package iuh.fit.se.backend.service;

import iuh.fit.se.backend.entity.PasswordResetToken;
import iuh.fit.se.backend.entity.User;
import iuh.fit.se.backend.repository.PasswordResetTokenRepository;
import iuh.fit.se.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {
    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Token valid for 1 hour
    private static final int EXPIRATION_MINUTES = 60;

    public String createTokenForUser(User user) {
        String token = UUID.randomUUID().toString();
        PasswordResetToken prt = new PasswordResetToken();
        prt.setToken(token);
        prt.setUser(user);
        prt.setExpiryDate(LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES));
        tokenRepository.save(prt);
        return token;
    }

    public Optional<User> validatePasswordResetToken(String token) {
        return tokenRepository.findByToken(token).filter(prt -> prt.getExpiryDate().isAfter(LocalDateTime.now())).map(PasswordResetToken::getUser);
    }

    public boolean resetPassword(String token, String newPassword) {
        Optional<PasswordResetToken> prtOpt = tokenRepository.findByToken(token);
        if (prtOpt.isEmpty()) return false;
        PasswordResetToken prt = prtOpt.get();
        if (prt.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(prt);
            return false;
        }

        User user = prt.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        tokenRepository.delete(prt);
        return true;
    }
}
