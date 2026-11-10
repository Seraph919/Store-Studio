package org.storestudio.store.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.storestudio.store.dtos.ApiKeyInfo;
import org.storestudio.store.dtos.CreateApiKeyRequest;
import org.storestudio.store.dtos.CreatedApiKey;
import org.storestudio.store.services.ApiKeyService;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/owner/api-keys")
@PreAuthorize("hasAnyRole('OWNER', 'SELLER', 'ADMIN')")
public class ApiKeyController {
    private final ApiKeyService apiKeyService;

    /** Requires a regular login JWT; this endpoint never accepts API keys. */
    @PostMapping
    public ResponseEntity<CreatedApiKey> create(Authentication authentication,
                                                    @Valid @RequestBody CreateApiKeyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).cacheControl(CacheControl.noStore())
                .body(apiKeyService.create(authentication.getName(), request));
    }

    @GetMapping
    public ResponseEntity<List<ApiKeyInfo>> list(Authentication authentication) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(apiKeyService.list(authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> revoke(Authentication authentication, @PathVariable Long id) {
        apiKeyService.revoke(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
