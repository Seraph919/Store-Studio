package org.storestudio.store.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.storestudio.store.dtos.CreateFeedbackDto;
import org.storestudio.store.dtos.FeedbackDto;
import org.storestudio.store.entities.Feedback;
import org.storestudio.store.entities.Users;
import org.storestudio.store.exceptions.ProductNotFoundException;
import org.storestudio.store.exceptions.UnauthorizedAccessException;
import org.storestudio.store.exceptions.UserNotFoundException;
import org.storestudio.store.repositories.FeedbackRepository;
import org.storestudio.store.repositories.ProductRepository;
import org.storestudio.store.repositories.UserRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FeedbackServiceTest {

    @Mock
    private FeedbackRepository feedbackRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FeedbackService feedbackService;

    private Users ownerUser;
    private CreateFeedbackDto createDto;

    @BeforeEach
    void setUp() {
        ownerUser = Users.builder()
                .id(1L)
                .email("owner@example.com")
                .role("OWNER")
                .build();

        createDto = CreateFeedbackDto.builder()
                .customerName("Alice")
                .comment("Excellent quality!")
                .rating((short) 5)
                .isVisible(true)
                .build();
    }

    @Test
    void createFeedback_asOwner_savesAndReturnsDto() {
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(ownerUser));
        when(feedbackRepository.save(any(Feedback.class))).thenAnswer(i -> {
            Feedback f = i.getArgument(0);
            f.setId(10L);
            return f;
        });

        FeedbackDto result = feedbackService.createFeedback(createDto, "owner@example.com");

        assertNotNull(result);
        assertEquals("Alice", result.getCustomerName());
        assertEquals("Excellent quality!", result.getComment());
        assertEquals((short) 5, result.getRating().shortValue());
        verify(feedbackRepository).save(any(Feedback.class));
    }

    @Test
    void createFeedback_unauthorizedRole_throwsUnauthorizedAccessException() {
        Users customer = Users.builder().id(2L).email("user@example.com").role("CUSTOMER").build();
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(customer));

        assertThrows(UnauthorizedAccessException.class,
                () -> feedbackService.createFeedback(createDto, "user@example.com"));
        verify(feedbackRepository, never()).save(any());
    }

    @Test
    void createFeedback_userNotFound_throwsUserNotFoundException() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class,
                () -> feedbackService.createFeedback(createDto, "missing@example.com"));
        verify(feedbackRepository, never()).save(any());
    }

    @Test
    void createFeedback_invalidProductId_throwsProductNotFoundException() {
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(ownerUser));
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        createDto.setProductId(999L);

        assertThrows(ProductNotFoundException.class,
                () -> feedbackService.createFeedback(createDto, "owner@example.com"));
        verify(feedbackRepository, never()).save(any());
    }

    @Test
    void getStoreReviews_returnsVisibleList() {
        Feedback f1 = Feedback.builder()
                .id(1L)
                .customerName("Bob")
                .comment("Very good")
                .rating((short) 4)
                .isVisible(true)
                .createdAt(Instant.now())
                .build();

        when(feedbackRepository.findByIsVisibleTrueOrderByCreatedAtDesc()).thenReturn(List.of(f1));

        List<FeedbackDto> results = feedbackService.getStoreReviews();

        assertEquals(1, results.size());
        assertEquals("Bob", results.get(0).getCustomerName());
    }

    @Test
    void deleteFeedback_whenAuthor_deletesSuccessfully() {
        Feedback f = Feedback.builder().id(5L).seller(ownerUser).build();
        when(userRepository.findByEmail("owner@example.com")).thenReturn(Optional.of(ownerUser));
        when(feedbackRepository.findById(5L)).thenReturn(Optional.of(f));

        feedbackService.deleteFeedback(5L, "owner@example.com");

        verify(feedbackRepository).delete(f);
    }
}
