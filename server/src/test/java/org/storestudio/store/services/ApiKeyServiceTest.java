package org.storestudio.store.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.storestudio.store.dtos.CreateApiKeyRequest;
import org.storestudio.store.entities.ApiKey;
import org.storestudio.store.entities.Users;
import org.storestudio.store.repositories.ApiKeyRepository;
import org.storestudio.store.repositories.UserRepository;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApiKeyServiceTest {
    @Mock private ApiKeyRepository keys;
    @Mock private UserRepository users;
    @InjectMocks private ApiKeyService service;

    private Users owner;

    @BeforeEach
    void setUp() {
        owner = new Users();
        owner.setId(7L);
        owner.setEmail("seller@example.test");
        owner.setRole("OWNER");
        owner.setStatus("ACTIVE");
    }

    @Test
    void createsPersistentKeyAndStoresOnlyHash() {
        when(users.findByEmail(owner.getEmail())).thenReturn(Optional.of(owner));
        when(keys.save(any(ApiKey.class))).thenAnswer(inv -> {
            ApiKey key = inv.getArgument(0);
            key.setId(10L);
            return key;
        });
        var response = service.create(owner.getEmail(), new CreateApiKeyRequest(
                "MCP", Set.of("orders:read", "products:read"), null));
        assertTrue(response.token().startsWith("store_sk_"));
        assertEquals(52, response.token().length());
        assertNull(response.apiKey().expiresAt());
        assertEquals(20, response.apiKey().prefix().length());
        var captured = org.mockito.ArgumentCaptor.forClass(ApiKey.class);
        verify(keys).save(captured.capture());
        ApiKey saved = captured.getValue();
        assertEquals(64, saved.getKeyHash().length());
        assertNotEquals(response.token(), saved.getKeyHash());
        assertEquals("orders:read,products:read", saved.getScopes());
    }

    @Test
    void invalidScopesAreRejectedBeforeSaving() {
        when(users.findByEmail(owner.getEmail())).thenReturn(Optional.of(owner));
        assertThrows(ResponseStatusException.class, () -> service.create(owner.getEmail(),
                new CreateApiKeyRequest("Danger", Set.of("orders:delete"), null)));
        verifyNoInteractions(keys);
    }

    @Test
    void revokedKeyIsRejected() {
        ApiKey existing = new ApiKey();
        existing.setOwner(owner);
        existing.setRevokedAt(Instant.now());
        when(keys.findByKeyHash(any(String.class))).thenReturn(Optional.of(existing));
        assertNull(service.authenticate("store_sk_" + "a".repeat(43)));
    }

    @Test
    void expiredKeyIsRejected() {
        ApiKey existing = new ApiKey();
        existing.setOwner(owner);
        existing.setExpiresAt(Instant.now().minusSeconds(5));
        when(keys.findByKeyHash(any(String.class))).thenReturn(Optional.of(existing));
        assertNull(service.authenticate("store_sk_" + "a".repeat(43)));
    }

    @Test
    void activeKeyReturnsOnlyItsGrantedScopes() {
        ApiKey existing = new ApiKey();
        existing.setOwner(owner);
        existing.setScopes("orders:read,settings:read");
        when(keys.findByKeyHash(any(String.class))).thenReturn(Optional.of(existing));
        var authenticated = service.authenticate("store_sk_" + "a".repeat(43));
        assertNotNull(authenticated);
        assertEquals(owner.getEmail(), authenticated.email());
        assertEquals(Set.of("orders:read", "settings:read"), authenticated.scopes());
    }

    @Test
    void suspendedOwnerInvalidatesKey() {
        owner.setStatus("SUSPENDED");
        ApiKey existing = new ApiKey();
        existing.setOwner(owner);
        when(keys.findByKeyHash(any(String.class))).thenReturn(Optional.of(existing));
        assertNull(service.authenticate("store_sk_" + "a".repeat(43)));
    }
}
