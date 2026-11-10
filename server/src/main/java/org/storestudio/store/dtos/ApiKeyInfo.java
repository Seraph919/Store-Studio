package org.storestudio.store.dtos;

import java.time.Instant;
import java.util.Set;

/** Metadata only; never contains the original secret. */
public record ApiKeyInfo(
        Long id,
        String name,
        String prefix,
        Set<String> scopes,
        Instant createdAt,
        Instant expiresAt,
        Instant revokedAt
) {}
