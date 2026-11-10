package org.storestudio.store.services;

import lombok.RequiredArgsConstructor;
import org.storestudio.store.dtos.CreateFeedbackDto;
import org.storestudio.store.dtos.FeedbackDto;
import org.storestudio.store.entities.Feedback;
import org.storestudio.store.entities.Product;
import org.storestudio.store.entities.Users;
import org.storestudio.store.exceptions.ProductNotFoundException;
import org.storestudio.store.exceptions.UnauthorizedAccessException;
import org.storestudio.store.exceptions.UserNotFoundException;
import org.storestudio.store.repositories.FeedbackRepository;
import org.storestudio.store.repositories.ProductRepository;
import org.storestudio.store.repositories.UserRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {
    private final FeedbackRepository feedbackRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "storeReviews", allEntries = true),
            @CacheEvict(value = "productReviews", allEntries = true)
    })
    public FeedbackDto createFeedback(CreateFeedbackDto dto, String userEmail) {
        Users seller = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userEmail));

        String role = seller.getRole();
        if (!"OWNER".equalsIgnoreCase(role) && !"SELLER".equalsIgnoreCase(role) && !"ADMIN".equalsIgnoreCase(role)) {
            throw new UnauthorizedAccessException("Only store owners or administrators can record customer reviews.");
        }

        Product product = null;
        if (dto.getProductId() != null && dto.getProductId() > 0) {
            product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new ProductNotFoundException(dto.getProductId()));
        }

        Feedback feedback = Feedback.builder()
                .product(product)
                .seller(seller)
                .customerName(dto.getCustomerName().trim())
                .comment(dto.getComment().trim())
                .rating(dto.getRating() != null ? dto.getRating() : 5)
                .isVisible(dto.getIsVisible() != null ? dto.getIsVisible() : true)
                .createdAt(Instant.now())
                .build();

        Feedback saved = feedbackRepository.save(feedback);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "storeReviews", key = "'all'")
    public List<FeedbackDto> getStoreReviews() {
        return feedbackRepository.findByIsVisibleTrueOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "productReviews", key = "#productId")
    public List<FeedbackDto> getProductReviews(Long productId) {
        return feedbackRepository.findByProductIdAndIsVisibleTrueOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FeedbackDto> getSellerReviews(String userEmail) {
        Users seller = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userEmail));
        return feedbackRepository.findBySellerIdOrderByCreatedAtDesc(seller.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FeedbackDto> getAllReviews() {
        return feedbackRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "storeReviews", allEntries = true),
            @CacheEvict(value = "productReviews", allEntries = true)
    })
    public FeedbackDto toggleVisibility(Long feedbackId, String userEmail) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found with id: " + feedbackId));

        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userEmail));

        boolean isAuthor = feedback.getSeller() != null && feedback.getSeller().getId().equals(user.getId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole());

        if (!isAuthor && !isAdmin) {
            throw new UnauthorizedAccessException("Not authorized to modify this review.");
        }

        boolean current = feedback.getIsVisible() != null && feedback.getIsVisible();
        feedback.setIsVisible(!current);
        Feedback saved = feedbackRepository.save(feedback);
        return toDto(saved);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "storeReviews", allEntries = true),
            @CacheEvict(value = "productReviews", allEntries = true)
    })
    public FeedbackDto updateVisibility(Long feedbackId, Boolean isVisible, String userEmail) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found with id: " + feedbackId));

        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userEmail));

        boolean isAuthor = feedback.getSeller() != null && feedback.getSeller().getId().equals(user.getId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole());

        if (!isAuthor && !isAdmin) {
            throw new UnauthorizedAccessException("Not authorized to modify this review.");
        }

        feedback.setIsVisible(isVisible != null ? isVisible : true);
        Feedback saved = feedbackRepository.save(feedback);
        return toDto(saved);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "storeReviews", allEntries = true),
            @CacheEvict(value = "productReviews", allEntries = true)
    })
    public void deleteFeedback(Long feedbackId, String userEmail) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found with id: " + feedbackId));

        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userEmail));

        boolean isAuthor = feedback.getSeller() != null && feedback.getSeller().getId().equals(user.getId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole());

        if (!isAuthor && !isAdmin) {
            throw new UnauthorizedAccessException("Not authorized to remove this review.");
        }

        feedbackRepository.delete(feedback);
    }

    public FeedbackDto toDto(Feedback feedback) {
        return FeedbackDto.builder()
                .id(feedback.getId())
                .productId(feedback.getProduct() != null ? feedback.getProduct().getId() : null)
                .productName(feedback.getProduct() != null ? feedback.getProduct().getName() : null)
                .sellerId(feedback.getSeller() != null ? feedback.getSeller().getId() : null)
                .sellerName(feedback.getSeller() != null ? feedback.getSeller().getUsername() : null)
                .customerName(feedback.getCustomerName())
                .comment(feedback.getComment())
                .rating(feedback.getRating())
                .createdAt(feedback.getCreatedAt())
                .isStoreReview(feedback.getProduct() == null)
                .isVisible(feedback.getIsVisible() != null ? feedback.getIsVisible() : true)
                .build();
    }
}
