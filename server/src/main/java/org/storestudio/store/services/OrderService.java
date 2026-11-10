package org.storestudio.store.services;

import lombok.AllArgsConstructor;
import org.storestudio.store.component.CsvExporter;
import org.storestudio.store.dtos.CreateOrderDto;
import org.storestudio.store.dtos.OrderDto;
import org.storestudio.store.dtos.OrderItemDto;
import org.storestudio.store.dtos.ProductDto;
import org.storestudio.store.dtos.SellerKpiDto;
import org.storestudio.store.dtos.SellerOrderDto;
import org.storestudio.store.entities.Cart;
import org.storestudio.store.entities.CartItem;
import org.storestudio.store.entities.Order;
import org.storestudio.store.entities.OrderItem;
import org.storestudio.store.entities.Product;
import org.storestudio.store.entities.SellerOrder;
import org.storestudio.store.entities.Users;
import org.storestudio.store.exceptions.CartNotFoundException;
import org.storestudio.store.exceptions.EmptyCartException;
import org.storestudio.store.exceptions.InsufficientStockException;
import org.storestudio.store.exceptions.OrderNotFoundException;
import org.storestudio.store.exceptions.UnauthorizedAccessException;
import org.storestudio.store.exceptions.UserNotFoundException;
import org.storestudio.store.repositories.CartItemRepository;
import org.storestudio.store.repositories.CartRepository;
import org.storestudio.store.repositories.OrderItemRepository;
import org.storestudio.store.repositories.OrderRepository;
import org.storestudio.store.repositories.ProductRepository;
import org.storestudio.store.repositories.SellerOrderRepository;
import org.storestudio.store.repositories.UserRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final SellerOrderRepository sellerOrderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final CsvExporter csvExporter;
    private final EmailNotificationService emailNotificationService;
    private final StoreSettingsService storeSettingsService;

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "topOrderedProduct", allEntries = true),
            @CacheEvict(value = "productById", allEntries = true),
            @CacheEvict(value = "productsPaged", allEntries = true)
    })
    public OrderDto createOrder(CreateOrderDto dto) {
        UUID cartId = dto.getCartId();
        if (cartId == null) {
            throw new IllegalArgumentException("Cart ID must not be null");
        }

        Cart cart = cartRepository.findByIdWithItems(cartId)
                .orElseThrow(() -> new CartNotFoundException(cartId));

        Set<CartItem> cartItems = cart.getCartItems();
        if (cartItems == null || cartItems.isEmpty()) {
            throw new EmptyCartException("Shopping cart is empty. Add items before creating an order.");
        }

        for (CartItem item : cartItems) {
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new IllegalArgumentException("Cart item quantities must be greater than zero");
            }
        }

        // Concurrency-safe pessimistic locking in deterministic order (sorted by product ID)
        List<Long> productIds = cartItems.stream()
                .map(item -> item.getProduct().getId())
                .distinct()
                .sorted()
                .toList();

        List<Product> lockedProducts = productRepository.findAllByIdForUpdate(productIds);
        Map<Long, Product> productMap = lockedProducts.stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        // 1. Verify stock availability for all items
        for (CartItem item : cartItems) {
            Product product = productMap.get(item.getProduct().getId());
            if (product == null) {
                throw new InsufficientStockException("Product no longer exists: ID #" + item.getProduct().getId());
            }
            if (product.getQuantity() < item.getQuantity()) {
                throw new InsufficientStockException("Insufficient stock for product '" + product.getName() +
                        "'. Available: " + product.getQuantity() + ", requested: " + item.getQuantity());
            }
        }

        // 2. Decrement stock on locked products
        for (CartItem item : cartItems) {
            Product product = productMap.get(item.getProduct().getId());
            product.setQuantity(product.getQuantity() - item.getQuantity());
            productRepository.save(product);
        }

        // 3. Create the parent order; public tracking is intentionally not supported
        Order order = new Order();
        order.setGuestName(dto.getGuestName());
        order.setPhoneNumber(dto.getPhoneNumber());
        order.setShippingAddress(dto.getShippingAddress());
        order.setCity(dto.getCity());
        order.setGuestEmail(dto.getGuestEmail());
        order.setStatus("PENDING");
        order.setCreatedAt(Instant.now());
        order.setTotalPrice(BigDecimal.ZERO);
        order.setPublicOrderReference("TEMP");

        Order savedOrder = orderRepository.save(order);
        savedOrder.setPublicOrderReference("AM-" + (1000 + savedOrder.getId()));
        savedOrder = orderRepository.save(savedOrder);

        // 4. Partition items by seller to create distinct SellerOrders
        Map<Users, List<CartItem>> itemsBySeller = cartItems.stream()
                .collect(Collectors.groupingBy(item -> productMap.get(item.getProduct().getId()).getUser()));

        BigDecimal grandTotal = BigDecimal.ZERO;
        BigDecimal upfrontProducts = BigDecimal.ZERO;
        boolean allPrepaid = true;
        List<OrderItem> allSavedOrderItems = new ArrayList<>();
        List<SellerOrder> allSavedSellerOrders = new ArrayList<>();

        for (Map.Entry<Users, List<CartItem>> entry : itemsBySeller.entrySet()) {
            Users seller = entry.getKey();
            List<CartItem> sellerCartItems = entry.getValue();

            BigDecimal sellerSubtotal = BigDecimal.ZERO;
            for (CartItem ci : sellerCartItems) {
                Product p = productMap.get(ci.getProduct().getId());
                BigDecimal price = p.getPrice() != null ? p.getPrice() : BigDecimal.ZERO;
                sellerSubtotal = sellerSubtotal.add(price.multiply(BigDecimal.valueOf(ci.getQuantity())));
            }

            SellerOrder sellerOrder = new SellerOrder();
            sellerOrder.setOrder(savedOrder);
            sellerOrder.setSeller(seller);
            sellerOrder.setStatus("PENDING");
            sellerOrder.setSubtotal(sellerSubtotal);
            sellerOrder.setCreatedAt(Instant.now());
            sellerOrder.setUpdatedAt(Instant.now());
            SellerOrder savedSellerOrder = sellerOrderRepository.save(sellerOrder);
            allSavedSellerOrders.add(savedSellerOrder);

            for (CartItem ci : sellerCartItems) {
                Product p = productMap.get(ci.getProduct().getId());
                BigDecimal unitPrice = p.getPrice() != null ? p.getPrice() : BigDecimal.ZERO;

                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(savedOrder);
                orderItem.setSellerOrder(savedSellerOrder);
                orderItem.setProduct(p);
                orderItem.setSeller(seller);
                orderItem.setQuantity(ci.getQuantity());
                orderItem.setPrice(unitPrice);
                orderItem.setProductNameSnapshot(p.getName());
                orderItem.setThumbnailSnapshot(p.getThumbnailUrl());
                String paymentMode = PaymentTerms.normalize(p.getPaymentMode());
                Integer depositPercent = PaymentTerms.validatePercent(paymentMode, p.getDepositPercent());
                BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(ci.getQuantity()));
                BigDecimal lineUpfront = PaymentTerms.upfrontForLine(lineTotal, paymentMode, depositPercent);
                orderItem.setPaymentModeSnapshot(paymentMode);
                orderItem.setDepositPercentSnapshot(depositPercent);
                orderItem.setUpfrontAmount(lineUpfront);
                upfrontProducts = upfrontProducts.add(lineUpfront);
                if (!PaymentTerms.PREPAID.equals(paymentMode)) allPrepaid = false;

                allSavedOrderItems.add(orderItemRepository.save(orderItem));
            }

            grandTotal = grandTotal.add(sellerSubtotal);
        }

        var shipping = storeSettingsService.getSettings();
        BigDecimal shippingCharge = ShippingCalculator.calculate(grandTotal,
                shipping.getShippingMode(), shipping.getShippingFee(), shipping.getFreeShippingThreshold());
        savedOrder.setShippingFee(shippingCharge);
        savedOrder.setTotalPrice(grandTotal.add(shippingCharge));
        // Collect shipping before dispatch only when *all* products require full prepayment.
        BigDecimal requiredUpfront = upfrontProducts.add(allPrepaid ? shippingCharge : BigDecimal.ZERO);
        savedOrder.setUpfrontAmount(requiredUpfront);
        savedOrder.setDeliveryAmount(savedOrder.getTotalPrice().subtract(requiredUpfront));
        savedOrder.setUpfrontPaymentConfirmed(false);
        savedOrder.setOrderItems(new LinkedHashSet<>(allSavedOrderItems));
        savedOrder.setSellerOrders(new LinkedHashSet<>(allSavedSellerOrders));
        savedOrder = orderRepository.save(savedOrder);

        // 5. Clear the cart
        cartItemRepository.deleteByCartId(cart.getId());
        cart.getCartItems().clear();

        // 6. Send asynchronous email alerts to sellers
        for (SellerOrder so : allSavedSellerOrders) {
            Users seller = so.getSeller();
            if (seller != null && seller.getEmail() != null && !seller.getEmail().isBlank()) {
                emailNotificationService.sendNewOrderAlert(
                        seller.getEmail(),
                        savedOrder.getId(),
                        savedOrder.getGuestName(),
                        so.getSubtotal()
                );
            }
        }

        return toDto(savedOrder, allSavedOrderItems, allSavedSellerOrders);
    }

    @Transactional
    public OrderDto createOrder(Long userId, CreateOrderDto dto) {
        return createOrder(dto);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long id, String userEmail) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));

        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userEmail));

        boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole());
        List<SellerOrder> sellerOrders = sellerOrderRepository.findByOrderId(id);
        List<OrderItem> items = orderItemRepository.findByOrderId(id);

        if (!isAdmin) {
            boolean sellerOwns = sellerOrders.stream()
                    .anyMatch(so -> so.getSeller() != null && so.getSeller().getId().equals(user.getId()));
            if (!sellerOwns) {
                throw new UnauthorizedAccessException("Not authorized to view order #" + id);
            }
            sellerOrders = sellerOrders.stream()
                    .filter(so -> so.getSeller() != null && so.getSeller().getId().equals(user.getId()))
                    .collect(Collectors.toList());
            items = items.stream()
                    .filter(it -> it.getSeller() != null && it.getSeller().getId().equals(user.getId()))
                    .collect(Collectors.toList());
        }

        return toDto(order, items, sellerOrders);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        List<SellerOrder> sellerOrders = sellerOrderRepository.findByOrderId(id);
        List<OrderItem> items = orderItemRepository.findByOrderId(id);
        return toDto(order, items, sellerOrders);
    }


    @Transactional(readOnly = true)
    public List<SellerOrderDto> getSellerOrders(String sellerEmail) {
        Users seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new UserNotFoundException("Seller not found: " + sellerEmail));

        List<SellerOrder> sellerOrders;
        if ("ADMIN".equalsIgnoreCase(seller.getRole())) {
            sellerOrders = sellerOrderRepository.findAllWithOrder();
        } else {
            sellerOrders = sellerOrderRepository.findBySellerIdWithOrder(seller.getId());
        }

        return sellerOrders.stream()
                .map(so -> {
                    List<OrderItem> items = orderItemRepository.findBySellerOrderId(so.getId());
                    return toSellerOrderDto(so, items);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public SellerOrderDto updateSellerOrderStatus(Long sellerOrderId, String newStatus, String userEmail) {
        SellerOrder sellerOrder = sellerOrderRepository.findById(sellerOrderId)
                .orElseThrow(() -> new OrderNotFoundException("Seller order not found: " + sellerOrderId));

        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userEmail));

        boolean isOwner = sellerOrder.getSeller() != null && sellerOrder.getSeller().getId().equals(user.getId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole());

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedAccessException("Not authorized to update seller order #" + sellerOrderId);
        }

        String oldStatus = sellerOrder.getStatus() != null ? sellerOrder.getStatus().toUpperCase() : "PENDING";
        String normalizedNewStatus = validateStatusTransition(oldStatus, newStatus);
        Order parentOrder = sellerOrder.getOrder();
        if (parentOrder.getUpfrontAmount() != null && parentOrder.getUpfrontAmount().signum() > 0
                && !parentOrder.isUpfrontPaymentConfirmed()
                && ("CONFIRMED".equals(normalizedNewStatus) || "PROCESSING".equals(normalizedNewStatus)
                || "SHIPPED".equals(normalizedNewStatus) || "DELIVERED".equals(normalizedNewStatus))) {
            throw new IllegalArgumentException("Verify the required upfront payment before confirming or shipping this order");
        }

        // Concurrency-safe inventory restoration if cancelled
        if (!"CANCELLED".equalsIgnoreCase(oldStatus) && "CANCELLED".equalsIgnoreCase(normalizedNewStatus)) {
            List<OrderItem> items = orderItemRepository.findBySellerOrderId(sellerOrderId);
            for (OrderItem item : items) {
                if (item.getProduct() != null) {
                    Product product = item.getProduct();
                    product.setQuantity(product.getQuantity() + item.getQuantity());
                    productRepository.save(product);
                }
            }
        }

        sellerOrder.setStatus(normalizedNewStatus);
        sellerOrder.setUpdatedAt(Instant.now());
        SellerOrder saved = sellerOrderRepository.save(sellerOrder);

        // Update overall parent order status
        updateParentOrderStatus(sellerOrder.getOrder().getId());

        List<OrderItem> items = orderItemRepository.findBySellerOrderId(sellerOrderId);
        return toSellerOrderDto(saved, items);
    }

    @Transactional
    public SellerOrderDto confirmUpfrontPayment(Long sellerOrderId, String userEmail) {
        SellerOrder sellerOrder = sellerOrderRepository.findById(sellerOrderId)
                .orElseThrow(() -> new OrderNotFoundException("Seller order not found: " + sellerOrderId));
        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userEmail));
        boolean allowed = "ADMIN".equalsIgnoreCase(user.getRole())
                || (sellerOrder.getSeller() != null && sellerOrder.getSeller().getId().equals(user.getId()));
        if (!allowed) throw new UnauthorizedAccessException("Not permitted to verify payment");
        Order order = sellerOrder.getOrder();
        if ("CANCELLED".equalsIgnoreCase(order.getStatus()) || "CANCELLED".equalsIgnoreCase(sellerOrder.getStatus())) {
            throw new IllegalArgumentException("Cannot verify payment for a cancelled order");
        }
        if (order.getUpfrontAmount() == null || order.getUpfrontAmount().signum() <= 0) {
            throw new IllegalArgumentException("This order has no upfront payment requirement");
        }
        if (!order.isUpfrontPaymentConfirmed()) {
            order.setUpfrontPaymentConfirmed(true);
            order.setUpfrontConfirmedAt(Instant.now());
            orderRepository.save(order);
        }
        return toSellerOrderDto(sellerOrder, orderItemRepository.findBySellerOrderId(sellerOrderId));
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, String newStatus, String sellerEmail) {
        Users user = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + sellerEmail));

        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new OrderNotFoundException(orderId));
            List<SellerOrder> sellerOrders = sellerOrderRepository.findByOrderId(orderId);
            for (SellerOrder so : sellerOrders) {
                updateSellerOrderStatus(so.getId(), newStatus, sellerEmail);
            }
            return getOrderById(orderId, sellerEmail);
        }

        // For seller: update only their seller order within this order
        SellerOrder sellerOrder = sellerOrderRepository.findByOrderIdAndSellerId(orderId, user.getId())
                .orElseThrow(() -> new UnauthorizedAccessException("Seller does not participate in order #" + orderId));

        updateSellerOrderStatus(sellerOrder.getId(), newStatus, sellerEmail);
        return getOrderById(orderId, sellerEmail);
    }

    private String validateStatusTransition(String currentStatus, String targetStatus) {
        String from = currentStatus != null ? currentStatus.trim().toUpperCase() : "PENDING";
        String to = targetStatus != null ? targetStatus.trim().toUpperCase() : "PENDING";

        if (from.equals(to)) {
            return to;
        }

        if ("CANCELLED".equals(from)) {
            throw new IllegalArgumentException("Cannot change status of an already CANCELLED order");
        }
        if ("DELIVERED".equals(from)) {
            throw new IllegalArgumentException("Cannot change status of an already DELIVERED order");
        }

        boolean valid = switch (from) {
            case "PENDING" -> "CONFIRMED".equals(to) || "CANCELLED".equals(to) || "NO_ANSWER".equals(to);
            case "NO_ANSWER" -> "CONFIRMED".equals(to) || "CANCELLED".equals(to) || "PENDING".equals(to);
            case "CONFIRMED" -> "PROCESSING".equals(to) || "SHIPPED".equals(to) || "CANCELLED".equals(to);
            case "PROCESSING" -> "SHIPPED".equals(to) || "CANCELLED".equals(to);
            case "SHIPPED" -> "DELIVERED".equals(to) || "CANCELLED".equals(to);
            default -> false;
        };

        if (!valid) {
            throw new IllegalArgumentException("Invalid status transition from " + from + " to " + to);
        }
        return to;
    }

    private void updateParentOrderStatus(Long orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null) return;

        List<SellerOrder> sellerOrders = sellerOrderRepository.findByOrderId(orderId);
        if (sellerOrders.isEmpty()) return;

        boolean allCancelled = sellerOrders.stream().allMatch(so -> "CANCELLED".equalsIgnoreCase(so.getStatus()));
        boolean allDelivered = sellerOrders.stream().allMatch(so -> "DELIVERED".equalsIgnoreCase(so.getStatus()));
        boolean allShippedOrDelivered = sellerOrders.stream().allMatch(so -> "SHIPPED".equalsIgnoreCase(so.getStatus()) || "DELIVERED".equalsIgnoreCase(so.getStatus()));
        boolean anyShipped = sellerOrders.stream().anyMatch(so -> "SHIPPED".equalsIgnoreCase(so.getStatus()));
        boolean anyProcessing = sellerOrders.stream().anyMatch(so -> "PROCESSING".equalsIgnoreCase(so.getStatus()));
        boolean anyConfirmed = sellerOrders.stream().anyMatch(so -> "CONFIRMED".equalsIgnoreCase(so.getStatus()));

        if (allCancelled) {
            order.setStatus("CANCELLED");
        } else if (allDelivered) {
            order.setStatus("DELIVERED");
        } else if (allShippedOrDelivered) {
            order.setStatus("SHIPPED");
        } else if (anyShipped) {
            order.setStatus("PARTIALLY_SHIPPED");
        } else if (anyProcessing) {
            order.setStatus("PROCESSING");
        } else if (anyConfirmed) {
            order.setStatus("CONFIRMED");
        } else {
            order.setStatus("PENDING");
        }
        orderRepository.save(order);
    }

    @Transactional
    public void deleteOrder(Long orderId, String userEmail) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userEmail));

        boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole());
        if (!isAdmin) {
            throw new UnauthorizedAccessException("Only administrators can delete full marketplace orders.");
        }

        if (!"CANCELLED".equalsIgnoreCase(order.getStatus())) {
            List<OrderItem> allItems = orderItemRepository.findByOrderId(orderId);
            for (OrderItem item : allItems) {
                Product product = item.getProduct();
                if (product != null) {
                    product.setQuantity(product.getQuantity() + item.getQuantity());
                    productRepository.save(product);
                }
            }
        }

        orderRepository.delete(order);
    }

    @Transactional(readOnly = true)
    public SellerKpiDto getSellerKpis(String sellerEmail) {
        Users seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new UserNotFoundException("Seller not found: " + sellerEmail));

        List<SellerOrder> sellerOrders;
        if ("ADMIN".equalsIgnoreCase(seller.getRole())) {
            sellerOrders = sellerOrderRepository.findAll();
        } else {
            sellerOrders = sellerOrderRepository.findBySellerIdOrderByCreatedAtDesc(seller.getId());
        }

        long pendingCount = 0;
        BigDecimal todayRevenue = BigDecimal.ZERO;
        BigDecimal monthRevenue = BigDecimal.ZERO;
        Map<String, Long> statusCounts = new java.util.HashMap<>();
        for (String s : List.of("PENDING", "CONFIRMED", "NO_ANSWER", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED")) {
            statusCounts.put(s, 0L);
        }

        Instant now = Instant.now();
        java.time.ZonedDateTime nowZdt = now.atZone(java.time.ZoneOffset.UTC);
        java.time.ZonedDateTime startOfToday = nowZdt.toLocalDate().atStartOfDay(java.time.ZoneOffset.UTC);
        java.time.ZonedDateTime startOfMonth = nowZdt.toLocalDate().withDayOfMonth(1).atStartOfDay(java.time.ZoneOffset.UTC);

        for (SellerOrder so : sellerOrders) {
            String status = (so.getStatus() != null) ? so.getStatus().toUpperCase() : "PENDING";
            statusCounts.put(status, statusCounts.getOrDefault(status, 0L) + 1L);

            if ("PENDING".equals(status)) {
                pendingCount++;
            }

            if (!"CANCELLED".equals(status)) {
                BigDecimal orderRev = so.getSubtotal() != null ? so.getSubtotal() : BigDecimal.ZERO;
                Instant createdAt = so.getCreatedAt() != null ? so.getCreatedAt() : Instant.now();
                java.time.ZonedDateTime orderZdt = createdAt.atZone(java.time.ZoneOffset.UTC);

                if (!orderZdt.isBefore(startOfToday)) {
                    todayRevenue = todayRevenue.add(orderRev);
                }
                if (!orderZdt.isBefore(startOfMonth)) {
                    monthRevenue = monthRevenue.add(orderRev);
                }
            }
        }

        List<Product> lowStock;
        if ("ADMIN".equalsIgnoreCase(seller.getRole())) {
            lowStock = productRepository.findAll().stream()
                    .filter(p -> p.getQuantity() != null && p.getQuantity() <= 3)
                    .collect(Collectors.toList());
        } else {
            lowStock = productRepository.findByUserIdAndQuantityLessThanEqualOrderByIdDesc(seller.getId(), 3L);
        }
        List<ProductDto> lowStockDtos = lowStock.stream().map(productService::toDto).collect(Collectors.toList());

        return SellerKpiDto.builder()
                .pendingCallConfirmationsCount(pendingCount)
                .todayRevenue(todayRevenue)
                .monthRevenue(monthRevenue)
                .ordersByStatus(statusCounts)
                .lowStockProducts(lowStockDtos)
                .build();
    }

    @Transactional(readOnly = true)
    public String exportSellerOrdersCsv(String sellerEmail) {
        Users seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new UserNotFoundException("Seller not found: " + sellerEmail));

        List<SellerOrder> sellerOrders;
        if ("ADMIN".equalsIgnoreCase(seller.getRole())) {
            sellerOrders = sellerOrderRepository.findAllWithOrder();
        } else {
            sellerOrders = sellerOrderRepository.findBySellerIdWithOrder(seller.getId());
        }

        List<String> headers = List.of(
                "Order_Reference", "Seller_Order_ID", "Order_Date", "Customer_Name", "Phone_Number", "City",
                "Shipping_Address", "Items_Summary", "Subtotal", "Fulfillment_Status", "Customer_Email",
                "Order_Upfront_Required", "Order_Due_On_Delivery", "Upfront_Confirmed"
        );

        List<List<Object>> rows = new ArrayList<>();
        for (SellerOrder so : sellerOrders) {
            Order parent = so.getOrder();
            List<OrderItem> items = orderItemRepository.findBySellerOrderId(so.getId());

            String itemsSummary = items.stream()
                    .map(it -> (it.getProductNameSnapshot() != null ? it.getProductNameSnapshot() : "Product #" + it.getId()) + " (x" + it.getQuantity() + ")")
                    .collect(Collectors.joining("; "));

            rows.add(List.of(
                    parent != null && parent.getPublicOrderReference() != null ? parent.getPublicOrderReference() : "AM-" + so.getId(),
                    so.getId(),
                    so.getCreatedAt() != null ? so.getCreatedAt().toString() : "",
                    parent != null && parent.getGuestName() != null ? parent.getGuestName() : "",
                    parent != null && parent.getPhoneNumber() != null ? parent.getPhoneNumber() : "",
                    parent != null && parent.getCity() != null ? parent.getCity() : "",
                    parent != null && parent.getShippingAddress() != null ? parent.getShippingAddress() : "",
                    itemsSummary,
                    so.getSubtotal() != null ? so.getSubtotal().toString() : "0.00",
                    so.getStatus() != null ? so.getStatus() : "",
                    parent != null && parent.getGuestEmail() != null ? parent.getGuestEmail() : "",
                    parent != null && parent.getUpfrontAmount() != null ? parent.getUpfrontAmount().toString() : "0.00",
                    parent != null && parent.getDeliveryAmount() != null ? parent.getDeliveryAmount().toString() : "0.00",
                    parent != null && parent.isUpfrontPaymentConfirmed()
            ));
        }

        return csvExporter.toCsv(headers, rows);
    }

    public SellerOrderDto toSellerOrderDto(SellerOrder so, List<OrderItem> items) {
        Order parent = so.getOrder();
        List<OrderItemDto> itemDtos = new ArrayList<>();
        if (items != null) {
            for (OrderItem oi : items) {
                BigDecimal unitPrice = oi.getPrice() != null ? oi.getPrice() : BigDecimal.ZERO;
                BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(oi.getQuantity()));
                String name = oi.getProductNameSnapshot() != null ? oi.getProductNameSnapshot() :
                        (oi.getProduct() != null ? oi.getProduct().getName() : "Product");
                String thumb = oi.getThumbnailSnapshot() != null ? oi.getThumbnailSnapshot() :
                        (oi.getProduct() != null ? oi.getProduct().getThumbnailUrl() : null);

                itemDtos.add(OrderItemDto.builder()
                        .id(oi.getId())
                        .orderId(parent != null ? parent.getId() : null)
                        .sellerOrderId(so.getId())
                        .productId(oi.getProduct() != null ? oi.getProduct().getId() : null)
                        .productName(name)
                        .thumbnailUrl(thumb)
                        .sellerId(so.getSeller() != null ? so.getSeller().getId() : null)
                        .sellerName(so.getSeller() != null ? so.getSeller().getUsername() : null)
                        .quantity(oi.getQuantity())
                        .price(unitPrice)
                        .unitPrice(unitPrice)
                        .subtotal(subtotal)
                        .paymentMode(oi.getPaymentModeSnapshot())
                        .depositPercent(oi.getDepositPercentSnapshot())
                        .upfrontAmount(oi.getUpfrontAmount())
                        .build());
            }
        }

        return SellerOrderDto.builder()
                .id(so.getId())
                .orderId(parent != null ? parent.getId() : null)
                .publicOrderReference(parent != null ? parent.getPublicOrderReference() : "AM-" + so.getId())
                .sellerId(so.getSeller() != null ? so.getSeller().getId() : null)
                .sellerName(so.getSeller() != null ? so.getSeller().getUsername() : null)
                .sellerEmail(so.getSeller() != null ? so.getSeller().getEmail() : null)
                .status(so.getStatus())
                .subtotal(so.getSubtotal())
                .upfrontAmount(parent != null ? parent.getUpfrontAmount() : BigDecimal.ZERO)
                .deliveryAmount(parent != null ? parent.getDeliveryAmount() : BigDecimal.ZERO)
                .upfrontPaymentConfirmed(parent != null && parent.isUpfrontPaymentConfirmed())
                .customerName(parent != null ? parent.getGuestName() : null)
                .phoneNumber(parent != null ? parent.getPhoneNumber() : null)
                .shippingAddress(parent != null ? parent.getShippingAddress() : null)
                .city(parent != null ? parent.getCity() : null)
                .customerEmail(parent != null ? parent.getGuestEmail() : null)
                .createdAt(so.getCreatedAt())
                .updatedAt(so.getUpdatedAt())
                .items(itemDtos)
                .build();
    }

    public OrderDto toDto(Order order, List<OrderItem> items, List<SellerOrder> sellerOrders) {
        List<OrderItemDto> itemDtos = new ArrayList<>();
        if (items != null) {
            for (OrderItem oi : items) {
                BigDecimal unitPrice = oi.getPrice() != null ? oi.getPrice() : BigDecimal.ZERO;
                BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(oi.getQuantity()));
                String name = oi.getProductNameSnapshot() != null ? oi.getProductNameSnapshot() :
                        (oi.getProduct() != null ? oi.getProduct().getName() : "Product");
                String thumb = oi.getThumbnailSnapshot() != null ? oi.getThumbnailSnapshot() :
                        (oi.getProduct() != null ? oi.getProduct().getThumbnailUrl() : null);

                itemDtos.add(OrderItemDto.builder()
                        .id(oi.getId())
                        .orderId(order.getId())
                        .sellerOrderId(oi.getSellerOrder() != null ? oi.getSellerOrder().getId() : null)
                        .productId(oi.getProduct() != null ? oi.getProduct().getId() : null)
                        .productName(name)
                        .thumbnailUrl(thumb)
                        .sellerId(oi.getSeller() != null ? oi.getSeller().getId() : null)
                        .sellerName(oi.getSeller() != null ? oi.getSeller().getUsername() : null)
                        .quantity(oi.getQuantity())
                        .price(unitPrice)
                        .unitPrice(unitPrice)
                        .subtotal(subtotal)
                        .paymentMode(oi.getPaymentModeSnapshot())
                        .depositPercent(oi.getDepositPercentSnapshot())
                        .upfrontAmount(oi.getUpfrontAmount())
                        .build());
            }
        }

        List<SellerOrderDto> soDtos = new ArrayList<>();
        if (sellerOrders != null) {
            for (SellerOrder so : sellerOrders) {
                List<OrderItem> soItems = (items != null) ? items.stream()
                        .filter(it -> (it.getSellerOrder() != null && it.getSellerOrder().getId().equals(so.getId()))
                                || (it.getSeller() != null && so.getSeller() != null && it.getSeller().getId().equals(so.getSeller().getId())))
                        .collect(Collectors.toList()) : Collections.emptyList();
                soDtos.add(toSellerOrderDto(so, soItems));
            }
        }

        return OrderDto.builder()
                .id(order.getId())
                .publicOrderReference(order.getPublicOrderReference())
                .guestName(order.getGuestName())
                .phoneNumber(order.getPhoneNumber())
                .shippingAddress(order.getShippingAddress())
                .city(order.getCity())
                .guestEmail(order.getGuestEmail())
                .totalPrice(order.getTotalPrice())
                .shippingFee(order.getShippingFee() == null ? BigDecimal.ZERO : order.getShippingFee())
                .upfrontAmount(order.getUpfrontAmount())
                .deliveryAmount(order.getDeliveryAmount())
                .upfrontPaymentConfirmed(order.isUpfrontPaymentConfirmed())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .items(itemDtos)
                .sellerOrders(soDtos)
                .build();
    }
}
