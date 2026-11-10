package org.storestudio.store.services;

import lombok.RequiredArgsConstructor;
import org.storestudio.store.dtos.ApiKeyInfo;
import org.storestudio.store.dtos.CreateApiKeyRequest;
import org.storestudio.store.dtos.CreatedApiKey;
import org.storestudio.store.entities.ApiKey;
import org.storestudio.store.entities.Users;
import org.storestudio.store.repositories.ApiKeyRepository;
import org.storestudio.store.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.HexFormat;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApiKeyService {
    /** The first release exposes read-only MCP capabilities. */
    public static final Set<String> ALLOWED_SCOPES = Set.of(
            "products:read", "orders:read", "analytics:read", "settings:read"
    );
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String KEY_PREFIX = "store_sk_";

    private final ApiKeyRepository apiKeyRepository;
    private final UserRepository userRepository;

    @Transactional
    public CreatedApiKey create(String email, CreateApiKeyRequest request) {
        Users owner = getAuthorizedOwner(email);
        if (request == null || request.name() == null || request.name().isBlank()
                || request.name().trim().length() > 80) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Provide a key name of at most 80 characters");
        }
        if (request.scopes() == null || request.scopes().isEmpty()
                || request.scopes().stream().anyMatch(scope -> scope == null || !ALLOWED_SCOPES.contains(scope))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported or missing API key scopes");
        }
        if (request.expiresAt() != null && !request.expiresAt().isAfter(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expiration must be in the future");
        }

        byte[] randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);
        String rawToken = KEY_PREFIX + Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        ApiKey key = new ApiKey();
        key.setOwner(owner);
        key.setName(request.name().trim());
        key.setKeyHash(sha256(rawToken));
        key.setKeyPrefix(rawToken.substring(0, Math.min(rawToken.length(), 20)));
        key.setScopes(String.join(",", new TreeSet<>(request.scopes())));
        key.setCreatedAt(Instant.now());
        key.setExpiresAt(request.expiresAt());

        ApiKey saved = apiKeyRepository.save(key);
        return new CreatedApiKey(toInfo(saved), rawToken);
    }

    @Transactional(readOnly = true)
    public List<ApiKeyInfo> list(String email) {
        Users owner = getAuthorizedOwner(email);
        return apiKeyRepository.findByOwner_IdOrderByCreatedAtDesc(owner.getId()).stream()
                .map(this::toInfo)
                .toList();
    }

    @Transactional
    public void revoke(String email, long keyId) {
        Users owner = getAuthorizedOwner(email);
        ApiKey key = apiKeyRepository.findByIdAndOwner_Id(keyId, owner.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "API key not found"));
        if (key.getRevokedAt() == null) {
            key.setRevokedAt(Instant.now());
            apiKeyRepository.save(key);
        }
    }

    /** Only MCP-specific routes consume API keys; keys cannot access regular admin APIs. */
    @Transactional(readOnly = true)
    public AuthenticatedApiKey authenticate(String rawToken) {
        if (rawToken == null || !rawToken.matches("store_sk_[A-Za-z0-9_-]{43}")) {
            return null;
        }
        ApiKey key = apiKeyRepository.findByKeyHash(sha256(rawToken)).orElse(null);
        if (key == null || key.getRevokedAt() != null
                || (key.getExpiresAt() != null && !Instant.now().isBefore(key.getExpiresAt()))) {
            return null;
        }
        Users owner = key.getOwner();
        if (owner == null || !isAuthorizedOwner(owner)) {
            return null;
        }
        return new AuthenticatedApiKey(owner.getEmail(), parseScopes(key.getScopes()));
    }

    public record AuthenticatedApiKey(String email, Set<String> scopes) {}

    private Users getAuthorizedOwner(String email) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("Only active owners or administrators can manage API keys"));
        if (!isAuthorizedOwner(user)) {
            throw new AccessDeniedException("Only active owners or administrators can manage API keys");
        }
        return user;
    }

    private boolean isAuthorizedOwner(Users user) {
        String role = user.getRole();
        if (role != null && role.startsWith("ROLE_")) role = role.substring(5);
        return "ACTIVE".equalsIgnoreCase(user.getStatus())
                && role != null && Set.of("OWNER", "SELLER", "ADMIN").contains(role.toUpperCase(java.util.Locale.ROOT));
    }

    private Set<String> parseScopes(String scopes) {
        if (scopes == null || scopes.isBlank()) return Set.of();
        return Arrays.stream(scopes.split(","))
                .filter(ALLOWED_SCOPES::contains)
                .collect(Collectors.toUnmodifiableSet());
    }

    private ApiKeyInfo toInfo(ApiKey key) {
        return new ApiKeyInfo(key.getId(), key.getName(), key.getKeyPrefix(),
                parseScopes(key.getScopes()), key.getCreatedAt(), key.getExpiresAt(), key.getRevokedAt());
    }

    private static String sha256(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is unavailable", ex);
        }
    }
}
