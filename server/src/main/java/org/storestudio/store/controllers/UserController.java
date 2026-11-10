package org.storestudio.store.controllers;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.storestudio.store.dtos.ChangePasswordDto;
import org.storestudio.store.dtos.UpdateProfileDto;
import org.storestudio.store.dtos.UpdateRoleDto;
import org.storestudio.store.dtos.UserDto;
import org.storestudio.store.dtos.UserProfileResponseDto;
import org.storestudio.store.exceptions.UnauthorizedAccessException;
import org.storestudio.store.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@AllArgsConstructor
@RequestMapping({"/api/v1/users", "/api/users"})
public class UserController {
    private final UserService userService;

    private UserDto resolveCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new UnauthorizedAccessException("Authentication required");
        }
        return userService.getCurrentUser(authentication);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getMe(Authentication authentication) {
        UserDto userDto = resolveCurrentUser(authentication);
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("/me/profile")
    public ResponseEntity<UserProfileResponseDto> updateProfile(
            @Valid @RequestBody UpdateProfileDto profileDto,
            Authentication authentication) {
        UserDto currentUser = resolveCurrentUser(authentication);
        UserProfileResponseDto response = userService.updateProfile(currentUser.getId(), profileDto);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordDto passwordDto,
            Authentication authentication) {
        UserDto currentUser = resolveCurrentUser(authentication);
        userService.changePassword(currentUser.getId(), passwordDto);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @GetMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getUsers() {
        List<UserDto> users = userService.findAll();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleDto roleDto) {
        UserDto updated = userService.updateUserRole(id, roleDto.getRole());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/make-seller")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> makeSeller(@PathVariable Long id) {
        UserDto updated = userService.updateUserRole(id, "SELLER");
        return ResponseEntity.ok(updated);
    }
}
