package org.storestudio.store.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.storestudio.store.dtos.AdminHealthDto;
import org.storestudio.store.dtos.UserDto;
import org.storestudio.store.dtos.user.UserCreationDto;
import org.storestudio.store.entities.Users;
import org.storestudio.store.exceptions.UserNotFoundException;
import org.storestudio.store.repositories.OrderRepository;
import org.storestudio.store.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserService userService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminService adminService;

    private Users testUser;

    @BeforeEach
    void setUp() {
        testUser = Users.builder()
                .id(1L)
                .username("seller")
                .email("seller@example.com")
                .role("SELLER")
                .password("encoded_pass")
                .status("ACTIVE")
                .build();
    }

    @Test
    void createUser_hashesPasswordAndSaves() {
        UserCreationDto creationDto = new UserCreationDto("admin@example.com", "plain_pass", "ADMIN");

        when(userRepository.existsByEmail("admin@example.com")).thenReturn(false);
        when(passwordEncoder.encode("plain_pass")).thenReturn("hashed_pass");
        when(userRepository.save(any(Users.class))).thenAnswer(i -> {
            Users u = i.getArgument(0);
            u.setId(2L);
            return u;
        });
        when(userService.toDto(any(Users.class))).thenReturn(
                UserDto.builder().id(2L).email("admin@example.com").role("ADMIN").build()
        );

        UserDto created = adminService.createUser(creationDto);

        assertNotNull(created);
        assertEquals("admin@example.com", created.getEmail());
        assertEquals("ADMIN", created.getRole());
        verify(passwordEncoder).encode("plain_pass");
        verify(userRepository).save(any(Users.class));
    }

    @Test
    void createUser_duplicateEmail_throwsIllegalArgumentException() {
        UserCreationDto creationDto = new UserCreationDto("existing@example.com", "pass", "OWNER");
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> adminService.createUser(creationDto));
        verify(userRepository, never()).save(any());
    }

    @Test
    void updateUserStatus_whenValid_updatesStatus() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(Users.class))).thenAnswer(i -> i.getArgument(0));
        when(userService.toDto(any(Users.class))).thenReturn(
                UserDto.builder().id(1L).email("seller@example.com").status("SUSPENDED").build()
        );

        UserDto updated = adminService.updateUserStatus(1L, "SUSPENDED");

        assertEquals("SUSPENDED", updated.getStatus());
        verify(userRepository).save(testUser);
    }

    @Test
    void updateUserStatus_whenUserMissing_throwsUserNotFoundException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> adminService.updateUserStatus(99L, "SUSPENDED"));
        verify(userRepository, never()).save(any());
    }

    @Test
    void getSystemHealth_returnsOnlineStatus() {
        when(orderRepository.count()).thenReturn(15L);

        AdminHealthDto health = adminService.getSystemHealth();

        assertNotNull(health);
        assertEquals("ONLINE", health.getDatabaseStatus());
        assertEquals("OPTIMAL", health.getCachingStatus());
        assertTrue(health.getJvmMemoryUsedMb() >= 0);
        assertTrue(health.getJvmMemoryMaxMb() > 0);
    }
}
