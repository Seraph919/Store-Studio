package org.storestudio.store.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.storestudio.store.dtos.CreateFeedbackDto;
import org.storestudio.store.dtos.FeedbackDto;
import org.storestudio.store.exceptions.UnauthorizedAccessException;
import org.storestudio.store.services.FeedbackService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/feedbacks", "/api/feedbacks"})
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    private String resolveEmail(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new UnauthorizedAccessException("Authentication required");
        }
        return authentication.getName();
    }

    @GetMapping("/store")
    public ResponseEntity<List<FeedbackDto>> getStoreReviews() {
        return ResponseEntity.ok(feedbackService.getStoreReviews());
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<FeedbackDto>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(feedbackService.getProductReviews(productId));
    }

    @GetMapping("")
    @PreAuthorize("hasAnyRole('OWNER', 'SELLER', 'ADMIN')")
    public ResponseEntity<List<FeedbackDto>> getAllReviews() {
        return ResponseEntity.ok(feedbackService.getAllReviews());
    }

    @GetMapping("/seller/my")
    @PreAuthorize("hasAnyRole('OWNER', 'SELLER', 'ADMIN')")
    public ResponseEntity<List<FeedbackDto>> getMySellerReviews(Authentication authentication) {
        String email = resolveEmail(authentication);
        return ResponseEntity.ok(feedbackService.getSellerReviews(email));
    }

    @PostMapping("")
    public ResponseEntity<FeedbackDto> createFeedback(
            @Valid @RequestBody CreateFeedbackDto dto,
            Authentication authentication) {
        String email = (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName()))
                ? authentication.getName() : null;
        FeedbackDto created = feedbackService.createFeedback(dto, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'SELLER', 'ADMIN')")
    public ResponseEntity<Void> deleteFeedback(
            @PathVariable Long id,
            Authentication authentication) {
        String email = resolveEmail(authentication);
        feedbackService.deleteFeedback(id, email);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/visibility")
    @PreAuthorize("hasAnyRole('OWNER', 'SELLER', 'ADMIN')")
    public ResponseEntity<FeedbackDto> toggleVisibility(
            @PathVariable Long id,
            @RequestParam(value = "isVisible", required = false) Boolean isVisible,
            Authentication authentication) {
        String email = resolveEmail(authentication);
        FeedbackDto updated;
        if (isVisible != null) {
            updated = feedbackService.updateVisibility(id, isVisible, email);
        } else {
            updated = feedbackService.toggleVisibility(id, email);
        }
        return ResponseEntity.ok(updated);
    }
}
