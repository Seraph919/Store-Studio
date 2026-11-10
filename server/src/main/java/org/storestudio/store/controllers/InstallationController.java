package org.storestudio.store.controllers;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.storestudio.store.services.InstallationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/setup")
@RequiredArgsConstructor
public class InstallationController {
    private final InstallationService installation;

    public record OwnerRequest(
        @NotBlank @Size(max = 256) String setupToken,
        @NotBlank @Size(min = 2, max = 120) String name,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 12, max = 128) String password
    ) {}

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok().cacheControl(org.springframework.http.CacheControl.noStore()).body(installation.status());
    }

    @PostMapping("/owner")
    public ResponseEntity<Void> createOwner(@Valid @RequestBody OwnerRequest request) {
        installation.bootstrap(request.setupToken(), request.name(), request.email(), request.password());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/complete")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<Void> complete() {
        installation.complete();
        return ResponseEntity.noContent().build();
    }
}
