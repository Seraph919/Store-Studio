package org.storestudio.store.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/seller/media")
@RequiredArgsConstructor
public class MediaUploadController {
    private static final long MAX_BYTES = 30L * 1024 * 1024;
    private final ObjectProvider<S3Client> r2;

    @Value("${cloudflare.r2.bucket:}") private String bucket;
    @Value("${cloudflare.r2.public-domain:}") private String publicDomain;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('OWNER', 'SELLER', 'ADMIN')")
    public ResponseEntity<UploadResponse> upload(@RequestPart("file") MultipartFile file) throws IOException {
        if (file.isEmpty() || file.getSize() > MAX_BYTES) {
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).build();
        }
        byte[] data = file.getBytes();
        // Inspect file signatures, not client-supplied MIME types. SVG / HTML uploads are forbidden.
        String type = detectType(data);
        if (type == null) return ResponseEntity.badRequest().build();
        if (type.startsWith("image/") && file.getSize() > 8L * 1024 * 1024) {
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).build();
        }

        S3Client client = r2.getIfAvailable();
        if (client == null || bucket.isBlank() || publicDomain.isBlank()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
        URI domain;
        try { domain = URI.create(publicDomain.replaceAll("/+$", "")); }
        catch (IllegalArgumentException ex) { return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build(); }
        if (!"https".equalsIgnoreCase(domain.getScheme()) || domain.getHost() == null || domain.getUserInfo() != null) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }

        String ext = switch (type) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            case "video/mp4" -> "mp4";
            default -> "webm";
        };
        String key = "uploads/" + UUID.randomUUID() + "." + ext;
        client.putObject(PutObjectRequest.builder().bucket(bucket.trim()).key(key)
                        .contentType(type).cacheControl("public, max-age=31536000, immutable").build(),
                RequestBody.fromBytes(data));
        return ResponseEntity.ok(new UploadResponse(publicDomain.replaceAll("/+$", "") + "/" + key));
    }

    static String detectType(byte[] bytes) {
        if (bytes.length >= 3 && (bytes[0] & 255) == 0xFF && (bytes[1] & 255) == 0xD8 && (bytes[2] & 255) == 0xFF) return "image/jpeg";
        if (bytes.length >= 8 && (bytes[0] & 255) == 137 && bytes[1] == 80 && bytes[2] == 78 && bytes[3] == 71 && bytes[4] == 13 && bytes[5] == 10 && (bytes[6] & 255) == 26 && bytes[7] == 10) return "image/png";
        if (bytes.length >= 12 && bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F' && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P') return "image/webp";
        // MP4: ftyp box starts at byte 4. WebM: EBML marker at byte 0.
        if (bytes.length >= 12 && bytes[4] == 'f' && bytes[5] == 't' && bytes[6] == 'y' && bytes[7] == 'p') return "video/mp4";
        if (bytes.length >= 4 && (bytes[0] & 255) == 0x1A && (bytes[1] & 255) == 0x45 && (bytes[2] & 255) == 0xDF && (bytes[3] & 255) == 0xA3) return "video/webm";
        return null;
    }
    public record UploadResponse(String permanentUrl) {}
}
