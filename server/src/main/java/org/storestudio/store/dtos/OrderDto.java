package org.storestudio.store.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDto {
    private Long id;
    private String publicOrderReference;
    private String guestName;
    private String phoneNumber;
    private String shippingAddress;
    private String city;
    private String guestEmail;
    private BigDecimal totalPrice;
    private BigDecimal shippingFee;
    private BigDecimal upfrontAmount;
    private BigDecimal deliveryAmount;
    private boolean upfrontPaymentConfirmed;
    private String status;
    private Instant createdAt;
    @Builder.Default
    private List<OrderItemDto> items = new ArrayList<>();
    @Builder.Default
    private List<SellerOrderDto> sellerOrders = new ArrayList<>();
}
