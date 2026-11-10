package org.storestudio.store.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.storestudio.store.dtos.RegisterUserDto;
import org.storestudio.store.dtos.UserDto;
import org.storestudio.store.entities.Users;
import org.storestudio.store.repositories.UserRepository;
import org.storestudio.store.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void register_AlwaysAssignsCustomerRole_PreventingPrivilegeEscalation() {
        RegisterUserDto dto = new RegisterUserDto("Evil User", "evil@example.com", "secretpass");

        when(userRepository.existsByEmail("evil@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secretpass")).thenReturn("encoded-pass");
        when(userRepository.save(any(Users.class))).thenAnswer(invocation -> {
            Users u = invocation.getArgument(0);
            u.setId(10L);
            return u;
        });

        UserDto created = userService.register(dto);

        assertNotNull(created);
        assertEquals("CUSTOMER", created.getRole());
        assertEquals("ACTIVE", created.getStatus());

        verify(userRepository).save(argThat(user -> "CUSTOMER".equals(user.getRole())));
    }
}
