package org.storestudio.store.dtos;

/** Secret shown once, at creation; the database stores only its SHA-256 hash. */
public record CreatedApiKey(ApiKeyInfo apiKey, String token) {}
