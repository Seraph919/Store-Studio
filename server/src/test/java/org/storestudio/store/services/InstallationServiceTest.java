package org.storestudio.store.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.storestudio.store.entities.Users;
import org.storestudio.store.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InstallationServiceTest {
    @Mock JdbcTemplate jdbc;
    @Mock UserRepository users;
    @Mock PasswordEncoder passwords;
    @InjectMocks InstallationService service;

    private static final String TOKEN = "0123456789abcdef".repeat(4);

    @BeforeEach void setUp() {
        ReflectionTestUtils.setField(service, "setupToken", TOKEN);
    }

    @Test void freshStatusShowsOwner() {
        when(jdbc.queryForObject(anyString(), eq(Boolean.class))).thenReturn(false);
        when(users.count()).thenReturn(0L);
        assertEquals("OWNER", service.status().get("phase"));
    }

    @Test void resumedStatusShowsCustomize() {
        when(jdbc.queryForObject(anyString(), eq(Boolean.class))).thenReturn(false);
        when(users.count()).thenReturn(1L);
        assertEquals("CUSTOMIZE", service.status().get("phase"));
    }

    @Test void existingInstallShowsReady() {
        when(jdbc.queryForObject(anyString(), eq(Boolean.class))).thenReturn(true);
        assertEquals("READY", service.status().get("phase"));
        verifyNoInteractions(users);
    }

    @Test void rejectsInvalidInstallationToken() {
        when(jdbc.queryForObject(anyString(), eq(Boolean.class))).thenReturn(false);
        when(users.count()).thenReturn(0L);
        var ex = assertThrows(ResponseStatusException.class,
                () -> service.bootstrap("invalid", "Seller", "seller@example.com", "SomeLongSecurePassword!"));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verifyNoInteractions(passwords);
    }

    @Test void createsOneOwnerUsingHashedPassword() {
        when(jdbc.queryForObject(anyString(), eq(Boolean.class))).thenReturn(false);
        when(users.count()).thenReturn(0L);
        when(passwords.encode("SomeLongSecurePassword!")).thenReturn("$2a$10$hash");
        service.bootstrap(TOKEN, "Seller", "Seller@Example.com", "SomeLongSecurePassword!");
        var captor = org.mockito.ArgumentCaptor.forClass(Users.class);
        verify(users).saveAndFlush(captor.capture());
        assertEquals("OWNER", captor.getValue().getRole());
        assertEquals("seller@example.com", captor.getValue().getEmail());
        assertEquals("$2a$10$hash", captor.getValue().getPassword());
    }

    @Test void neverAllowsSecondOwner() {
        when(jdbc.queryForObject(anyString(), eq(Boolean.class))).thenReturn(false);
        when(users.count()).thenReturn(1L);
        var ex = assertThrows(ResponseStatusException.class,
                () -> service.bootstrap(TOKEN, "Other", "other@example.com", "SomeLongSecurePassword!"));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verifyNoInteractions(passwords);
    }
}
