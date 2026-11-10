package org.storestudio.store.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.Set;

/** expiresAt=null means there is no automatic expiration. */
public record CreateApiKeyRequest(
        @NotBlank @Size(max = 80) String name,
        @NotEmpty Set<@NotBlank String> scopes,
        Instant expiresAt
) {}
