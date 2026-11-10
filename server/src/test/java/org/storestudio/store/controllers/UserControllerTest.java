package org.storestudio.store.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.storestudio.store.dtos.UserDto;
import org.storestudio.store.dtos.UserProfileResponseDto;
import org.storestudio.store.exceptions.GlobalExceptionHandler;
import org.storestudio.store.services.UserService;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private UsernamePasswordAuthenticationToken auth;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        auth = new UsernamePasswordAuthenticationToken(
                "john@example.com",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );
    }

    @Test
    void getMe_Success() throws Exception {
        UserDto userDto = UserDto.builder()
                .id(1L)
                .name("John Doe")
                .email("john@example.com")
                .role("CUSTOMER")
                .build();

        when(userService.getCurrentUser(any(Authentication.class))).thenReturn(userDto);

        mockMvc.perform(get("/api/v1/users/me").principal(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john@example.com"));
    }

    @Test
    void getUsers_Success() throws Exception {
        UserDto userDto = UserDto.builder()
                .id(1L)
                .name("John Doe")
                .email("john@example.com")
                .role("CUSTOMER")
                .build();

        when(userService.findAll()).thenReturn(List.of(userDto));

        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].email").value("john@example.com"));
    }

    @Test
    void updateProfile_Success() throws Exception {
        UserDto userDto = UserDto.builder()
                .id(1L)
                .name("John Updated")
                .email("john.new@example.com")
                .role("CUSTOMER")
                .build();

        UserProfileResponseDto responseDto = UserProfileResponseDto.builder()
                .user(userDto)
                .token("mock-new-jwt-token")
                .message("Profile updated successfully")
                .build();

        when(userService.getCurrentUser(any(Authentication.class))).thenReturn(userDto);
        when(userService.updateProfile(eq(1L), any())).thenReturn(responseDto);

        mockMvc.perform(put("/api/v1/users/me/profile")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"John Updated\",\"email\":\"john.new@example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.name").value("John Updated"))
                .andExpect(jsonPath("$.user.email").value("john.new@example.com"))
                .andExpect(jsonPath("$.token").value("mock-new-jwt-token"));
    }

    @Test
    void changePassword_Success() throws Exception {
        UserDto userDto = UserDto.builder()
                .id(1L)
                .name("John Doe")
                .email("john@example.com")
                .role("CUSTOMER")
                .build();

        when(userService.getCurrentUser(any(Authentication.class))).thenReturn(userDto);
        doNothing().when(userService).changePassword(eq(1L), any());

        mockMvc.perform(put("/api/v1/users/me/password")
                        .principal(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"oldpass123\",\"newPassword\":\"newsecretpass\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password changed successfully"));
    }
}
