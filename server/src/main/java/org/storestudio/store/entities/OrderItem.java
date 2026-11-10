package org.storestudio.store.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "seller_order_id")
    private SellerOrder sellerOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "seller_id", nullable = false)
    private Users seller;

    @Column(name = "quantity", nullable = false)
    private Long quantity;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "product_name_snapshot", length = 255)
    private String productNameSnapshot;

    @Column(name = "payment_mode_snapshot", nullable = false, length = 12)
    private String paymentModeSnapshot = "COD";

    @Column(name = "deposit_percent_snapshot")
    private Integer depositPercentSnapshot;

    @Column(name = "upfront_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal upfrontAmount = BigDecimal.ZERO;

    @Column(name = "thumbnail_snapshot")
    private String thumbnailSnapshot;
}