package org.storestudio.store.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

import java.net.URI;

@Configuration
public class R2Config {
    @Bean
    public S3Client r2Client(
            @Value("${cloudflare.r2.account-id:}") String accountId,
            @Value("${cloudflare.r2.access-key:}") String accessKey,
            @Value("${cloudflare.r2.secret-key:}") String secretKey) {
        if (accountId.isBlank() || accessKey.isBlank() || secretKey.isBlank()) {
            // The application can start without R2; uploads report a clear configuration error.
            return null;
        }
        if (!accountId.matches("[a-fA-F0-9]{32}")) {
            return null; // Upload endpoint will report R2 as unavailable until configured.
        }
        return S3Client.builder()
                .region(Region.of("auto"))
                .endpointOverride(URI.create("https://" + accountId + ".r2.cloudflarestorage.com"))
                .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
                .build();
    }
}
