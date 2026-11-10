package org.storestudio.store.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long productId;
    private String productName;
    private Long sellerId;
    private String sellerName;
    private String customerName;
    private String comment;
    private Short rating;
    private Instant createdAt;
    private Boolean isStoreReview;
    private Boolean isVisible;
}
