package org.storestudio.store.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.storestudio.store.dtos.JwtResponse;
import org.storestudio.store.dtos.RegisterUserDto;
import org.storestudio.store.dtos.UserDto;
import org.storestudio.store.dtos.UserLoginDto;
import org.storestudio.store.exceptions.GlobalExceptionHandler;
import org.storestudio.store.services.UserService;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private UserService userService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void publicRegistrationIsDisabled() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Visitor\",\"email\":\"visitor@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isForbidden());
        org.mockito.Mockito.verifyNoInteractions(userService);
    }

    @Test
    void login_Success() throws Exception {
        UserLoginDto loginDto = new UserLoginDto("john@example.com", "password123");
        when(userService.login(any(UserLoginDto.class))).thenReturn(new JwtResponse("sample-jwt-token"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("sample-jwt-token"));
    }

    @Test
    void login_InvalidCredentials_ReturnsUnauthorized() throws Exception {
        UserLoginDto loginDto = new UserLoginDto("john@example.com", "wrongpassword");
        when(userService.login(any(UserLoginDto.class))).thenThrow(new BadCredentialsException("Invalid email or password"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginDto)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }
}
