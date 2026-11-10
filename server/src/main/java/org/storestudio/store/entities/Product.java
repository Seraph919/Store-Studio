package org.storestudio.store.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "product")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", nullable = false, length = Integer.MAX_VALUE)
    private String description;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @ColumnDefault("0")
    @Column(name = "quantity", nullable = false)
    private Long quantity;

    @Column(name = "payment_mode", nullable = false, length = 12)
    private String paymentMode = "COD";

    @Column(name = "deposit_percent")
    private Integer depositPercent;

    @Column(name = "video_url")
    private String videoUrl;

    @ColumnDefault("true")
    @Column(name = "is_listed", nullable = false)
    private Boolean isListed = true;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "hover_image_url")
    private String hoverImageUrl;

    @Column(name = "image_aspect", length = 12, nullable = false)
    private String imageAspect = "square";

    @Column(name = "image_fit", length = 12, nullable = false)
    private String imageFit = "cover";

    @Column(name = "image_position_x", nullable = false)
    private Integer imagePositionX = 50;

    @Column(name = "image_position_y", nullable = false)
    private Integer imagePositionY = 50;

    @Column(name = "image_zoom", nullable = false)
    private Integer imageZoom = 100;

    @Column(name = "original_price", precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "discount_rate")
    private Integer discountRate;

    @ColumnDefault("false")
    @Column(name = "is_pack", nullable = false)
    private Boolean isPack = false;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<ProductImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "product")
    private Set<CartItem> cartItems = new LinkedHashSet<>();

    @OneToMany(mappedBy = "product")
    private Set<Feedback> feedbacks = new LinkedHashSet<>();

    @OneToMany(mappedBy = "product")
    private Set<OrderItem> orderItems = new LinkedHashSet<>();


}