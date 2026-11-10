package org.storestudio.store.controllers;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.storestudio.store.dtos.JwtResponse;
import org.storestudio.store.dtos.RegisterUserDto;
import org.storestudio.store.dtos.UserDto;
import org.storestudio.store.dtos.UserLoginDto;
import org.storestudio.store.services.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping({"/auth", "/api/v1/auth"})
public class AuthController {
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody RegisterUserDto user) {
        throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN, "Public registration is disabled. Shopping does not require an account.");
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody UserLoginDto user) {
        JwtResponse jwtResponse = userService.login(user);
        return ResponseEntity.ok(jwtResponse);
    }
}
