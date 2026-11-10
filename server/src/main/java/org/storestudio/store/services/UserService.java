package org.storestudio.store.services;

import lombok.AllArgsConstructor;
import org.jspecify.annotations.NullMarked;
import org.storestudio.store.dtos.ChangePasswordDto;
import org.storestudio.store.dtos.JwtResponse;
import org.storestudio.store.dtos.RegisterUserDto;
import org.storestudio.store.dtos.UpdateProfileDto;
import org.storestudio.store.dtos.UserDto;
import org.storestudio.store.dtos.UserLoginDto;
import org.storestudio.store.dtos.UserProfileResponseDto;
import org.storestudio.store.entities.Users;
import org.storestudio.store.exceptions.UserNotFoundException;
import org.storestudio.store.repositories.UserRepository;
import org.storestudio.store.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    @NullMarked
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        String role = user.getRole();
        List<org.springframework.security.core.GrantedAuthority> authorities = Collections.emptyList();
        if (role != null && !role.isBlank()) {
            String roleName = role.startsWith("ROLE_") ? role : "ROLE_" + role;
            authorities = List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(roleName));
        }

        boolean enabled = !"SUSPENDED".equalsIgnoreCase(user.getStatus());
        return new User(
                user.getEmail(),
                user.getPassword(),
                enabled,
                true,
                true,
                true,
                authorities
        );
    }

    public List<UserDto> findAll() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public UserDto register(RegisterUserDto registerUserDto) {
        if (userRepository.existsByEmail(registerUserDto.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + registerUserDto.getEmail());
        }

        Users user = new Users();
        user.setUsername(registerUserDto.getName());
        user.setEmail(registerUserDto.getEmail());
        user.setPassword(passwordEncoder.encode(registerUserDto.getPassword()));
        // Security rule: Public registration defaults to CUSTOMER. Privilege escalation prevented.
        user.setRole("CUSTOMER");
        user.setStatus("ACTIVE");
        user.setCreatedAt(LocalDateTime.now());

        Users saved = userRepository.save(user);
        return toDto(saved);
    }

    public JwtResponse login(UserLoginDto loginDto) {
        Users user = userRepository.findByEmail(loginDto.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email"));

        if ("SUSPENDED".equalsIgnoreCase(user.getStatus())) {
            throw new BadCredentialsException("Account has been suspended. Please contact platform administrators.");
        }

        if (!passwordEncoder.matches(loginDto.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid password");
        }

        String token = jwtService.generateToken(user.getEmail());
        return new JwtResponse(token);
    }

    public UserDto getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new BadCredentialsException("No authenticated user found");
        }
        return userRepository.findByEmail(authentication.getName())
                .map(this::toDto)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + authentication.getName()));
    }

    public UserDto getCurrentUser(String authHeader, String userEmailHeader, Long userIdHeader) {
        if (authHeader != null && !authHeader.isBlank()) {
            try {
                String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
                String email = jwtService.extractEmail(token);
                if (email != null) {
                    return userRepository.findByEmail(email)
                            .map(this::toDto)
                            .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
                }
            } catch (Exception ignored) {
            }
        }

        if (userEmailHeader != null && !userEmailHeader.isBlank()) {
            return userRepository.findByEmail(userEmailHeader)
                    .map(this::toDto)
                    .orElseThrow(() -> new UserNotFoundException("User not found with email: " + userEmailHeader));
        }

        throw new BadCredentialsException("No authenticated user found");
    }

    public UserDto updateUserRole(Long userId, String newRole) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        if (newRole == null || newRole.isBlank()) {
            throw new IllegalArgumentException("Role cannot be empty");
        }

        String normalized = newRole.trim().toUpperCase();
        if (normalized.startsWith("ROLE_")) {
            normalized = normalized.substring(5);
        }

        if (!normalized.equals("ADMIN") && !normalized.equals("OWNER") && !normalized.equals("SELLER") && !normalized.equals("CUSTOMER")) {
            throw new IllegalArgumentException("Invalid role: " + newRole + ". Allowed roles are: CUSTOMER, OWNER, SELLER, ADMIN.");
        }

        user.setRole(normalized);
        Users saved = userRepository.save(user);
        return toDto(saved);
    }

    public UserProfileResponseDto updateProfile(Long userId, UpdateProfileDto dto) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        String newEmail = dto.getEmail().trim().toLowerCase();
        String newName = dto.getName().trim();

        boolean emailChanged = !newEmail.equalsIgnoreCase(user.getEmail());

        if (emailChanged) {
            userRepository.findByEmail(newEmail).ifPresent(existing -> {
                if (!existing.getId().equals(user.getId())) {
                    throw new IllegalArgumentException("Email address is already registered by another account");
                }
            });
            user.setEmail(newEmail);
        }

        user.setUsername(newName);
        Users saved = userRepository.save(user);

        String newToken = null;
        if (emailChanged) {
            newToken = jwtService.generateToken(saved.getEmail());
        }

        return UserProfileResponseDto.builder()
                .user(toDto(saved))
                .token(newToken)
                .message("Profile updated successfully")
                .build();
    }

    public void changePassword(Long userId, ChangePasswordDto dto) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
    }

    public UserDto toDto(Users user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus() != null ? user.getStatus() : "ACTIVE")
                .createdAt(user.getCreatedAt())
                .build();
    }
}
