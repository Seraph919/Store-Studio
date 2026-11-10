package org.storestudio.store.services;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.storestudio.store.entities.Users;
import org.storestudio.store.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class InstallationService {
    private final JdbcTemplate jdbc;
    private final UserRepository users;
    private final PasswordEncoder passwords;

    @Value("${app.setup.token:}")
    private String setupToken;

    public Map<String, Object> status() {
        Boolean completed = jdbc.queryForObject(
            "SELECT completed FROM installation_state WHERE id = 1", Boolean.class);
        if (Boolean.TRUE.equals(completed)) return Map.of("phase", "READY");
        return Map.of("phase", users.count() == 0 ? "OWNER" : "CUSTOMIZE");
    }

    private boolean lockAndCheckCompleted() {
        Boolean completed = jdbc.queryForObject(
            "SELECT completed FROM installation_state WHERE id = 1 FOR UPDATE", Boolean.class);
        return Boolean.TRUE.equals(completed);
    }

    @Transactional
    public void bootstrap(String token, String name, String email, String password) {
        // Lock the singleton state row to prevent concurrent first-admin registration.
        if (lockAndCheckCompleted() || users.count() != 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The owner has already been created");
        }
        if (setupToken == null || !setupToken.matches("(?i)[a-f0-9]{64,}") || token == null
                || !MessageDigest.isEqual(setupToken.getBytes(StandardCharsets.UTF_8),
                    token.getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid installation token");
        }
        String normalizedEmail = email.trim().toLowerCase(java.util.Locale.ROOT);
        Users owner = Users.builder()
            .username(name.trim())
            .email(normalizedEmail)
            .password(passwords.encode(password))
            .role("OWNER")
            .status("ACTIVE")
            .createdAt(LocalDateTime.now())
            .build();
        users.saveAndFlush(owner);
    }

    @Transactional
    public void complete() {
        if (lockAndCheckCompleted()) return;
        if (users.count() == 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Create the owner first");
        }
        jdbc.update("UPDATE installation_state SET completed = TRUE, completed_at = NOW() WHERE id = 1");
    }
}
