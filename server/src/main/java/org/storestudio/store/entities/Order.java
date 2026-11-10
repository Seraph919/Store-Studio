package org.storestudio.store.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "\"order\"")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "public_order_reference", nullable = false, unique = true, length = 50)
    private String publicOrderReference;

    @Column(name = "guest_name", nullable = false, length = 100)
    private String guestName;

    @Column(name = "phone_number", nullable = false, length = 30)
    private String phoneNumber;

    @Column(name = "shipping_address", nullable = false, length = Integer.MAX_VALUE)
    private String shippingAddress;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "guest_email")
    private String guestEmail;

    @Column(name = "shipping_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "upfront_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal upfrontAmount = BigDecimal.ZERO;

    @Column(name = "delivery_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal deliveryAmount = BigDecimal.ZERO;

    /** Must only be set after the owner verifies payment outside this application. */
    @Column(name = "upfront_payment_confirmed", nullable = false)
    private boolean upfrontPaymentConfirmed = false;

    @Column(name = "upfront_confirmed_at")
    private Instant upfrontConfirmedAt;

    @ColumnDefault("'PENDING'")
    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<SellerOrder> sellerOrders = new LinkedHashSet<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<OrderItem> orderItems = new LinkedHashSet<>();
}