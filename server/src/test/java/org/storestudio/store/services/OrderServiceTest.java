package org.storestudio.store.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.storestudio.store.component.CsvExporter;
import org.storestudio.store.dtos.CreateOrderDto;
import org.storestudio.store.dtos.OrderDto;
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
import org.storestudio.store.exceptions.UnauthorizedAccessException;
import org.storestudio.store.repositories.CartItemRepository;
import org.storestudio.store.repositories.CartRepository;
import org.storestudio.store.repositories.OrderItemRepository;
import org.storestudio.store.repositories.OrderRepository;
import org.storestudio.store.repositories.ProductRepository;
import org.storestudio.store.repositories.SellerOrderRepository;
import org.storestudio.store.repositories.UserRepository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private SellerOrderRepository sellerOrderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private CartRepository cartRepository;
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private EmailNotificationService emailNotificationService;
    @Mock
    private ProductService productService;
    @Mock
    private CsvExporter csvExporter;
    @Mock
    private StoreSettingsService storeSettingsService;

    @InjectMocks
    private OrderService orderService;

    private Cart cart;
    private Product product;
    private CartItem cartItem;
    private Users seller;

    @BeforeEach
    void setUp() {
        lenient().when(storeSettingsService.getSettings()).thenReturn(
            org.storestudio.store.dtos.StoreSettingsDto.builder().shippingMode("FREE")
                .shippingFee(BigDecimal.ZERO).build());
        cart = new Cart();
        cart.setId(UUID.randomUUID());

        seller = new Users();
        seller.setId(2L);
        seller.setEmail("seller@example.com");
        seller.setUsername("Seller One");
        seller.setRole("SELLER");

        product = new Product();
        product.setId(10L);
        product.setName("Mechanical Keyboard");
        product.setPrice(new BigDecimal("120.00"));
        product.setQuantity(10L);
        product.setUser(seller);

        cartItem = new CartItem();
        cartItem.setId(1L);
        cartItem.setCart(cart);
        cartItem.setProduct(product);
        cartItem.setQuantity(2L);

        Set<CartItem> items = new LinkedHashSet<>();
        items.add(cartItem);
        cart.setCartItems(items);
    }

    @Test
    void createOrder_RejectsInvalidCartQuantitiesBeforeChangingStock() {
        for (Long quantity : Arrays.asList(null, 0L, -1L, Long.MIN_VALUE)) {
            cartItem.setQuantity(quantity);
            when(cartRepository.findByIdWithItems(cart.getId())).thenReturn(Optional.of(cart));
            assertThrows(IllegalArgumentException.class,
                    () -> orderService.createOrder(CreateOrderDto.builder().cartId(cart.getId()).build()));
            assertEquals(10L, product.getQuantity());
        }
        verifyNoInteractions(productRepository, orderRepository, cartItemRepository, emailNotificationService);
    }

    @Test
    void createOrder_Success_LocksInventoryAndCalculatesTotal() {
        CreateOrderDto dto = CreateOrderDto.builder()
                .cartId(cart.getId())
                .guestName("Bob")
                .phoneNumber("5551234")
                .shippingAddress("456 Elm St")
                .city("Metropolis")
                .guestEmail("bob@example.com")
                .build();

        when(cartRepository.findByIdWithItems(cart.getId())).thenReturn(Optional.of(cart));
        when(productRepository.findAllByIdForUpdate(anyCollection())).thenReturn(List.of(product));

        Order savedOrder = new Order();
        savedOrder.setId(100L);
        savedOrder.setStatus("PENDING");
        savedOrder.setTotalPrice(new BigDecimal("240.00"));
        savedOrder.setGuestName("Bob");
        savedOrder.setCreatedAt(Instant.now());
        savedOrder.setPublicOrderReference("AM-1100");

        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);

        SellerOrder sellerOrder = new SellerOrder();
        sellerOrder.setId(1L);
        sellerOrder.setOrder(savedOrder);
        sellerOrder.setSeller(seller);
        sellerOrder.setStatus("PENDING");
        sellerOrder.setSubtotal(new BigDecimal("240.00"));

        when(sellerOrderRepository.save(any(SellerOrder.class))).thenReturn(sellerOrder);

        OrderItem orderItem = new OrderItem();
        orderItem.setId(50L);
        orderItem.setOrder(savedOrder);
        orderItem.setSellerOrder(sellerOrder);
        orderItem.setProduct(product);
        orderItem.setSeller(seller);
        orderItem.setQuantity(2L);
        orderItem.setPrice(new BigDecimal("120.00"));

        when(orderItemRepository.save(any(OrderItem.class))).thenReturn(orderItem);

        OrderDto result = orderService.createOrder(dto);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals("Bob", result.getGuestName());

        // Verify product stock was reduced by 2 (from 10 to 8)
        assertEquals(8L, product.getQuantity());
        verify(productRepository).save(product);

        // Verify cart items deleted
        verify(cartItemRepository).deleteByCartId(cart.getId());

        // Verify email notification sent to seller
        verify(emailNotificationService).sendNewOrderAlert("seller@example.com", 100L, "Bob", new BigDecimal("240.00"));
    }

    @Test
    void createOrder_MultiSeller_CreatesDistinctSellerOrders() {
        Users sellerB = new Users();
        sellerB.setId(3L);
        sellerB.setEmail("sellerB@example.com");
        sellerB.setUsername("Seller B");
        sellerB.setRole("SELLER");

        Product productB = new Product();
        productB.setId(20L);
        productB.setName("Artisan Ring");
        productB.setPrice(new BigDecimal("80.00"));
        productB.setQuantity(5L);
        productB.setUser(sellerB);

        CartItem cartItemB = new CartItem();
        cartItemB.setId(2L);
        cartItemB.setCart(cart);
        cartItemB.setProduct(productB);
        cartItemB.setQuantity(1L);

        cart.getCartItems().add(cartItemB);

        CreateOrderDto dto = CreateOrderDto.builder()
                .cartId(cart.getId())
                .guestName("Alice")
                .phoneNumber("5559876")
                .shippingAddress("123 Palm Ave")
                .city("Casablanca")
                .build();

        when(cartRepository.findByIdWithItems(cart.getId())).thenReturn(Optional.of(cart));
        when(productRepository.findAllByIdForUpdate(anyCollection())).thenReturn(List.of(product, productB));

        Order savedOrder = new Order();
        savedOrder.setId(101L);
        savedOrder.setGuestName("Alice");
        savedOrder.setCreatedAt(Instant.now());
        savedOrder.setPublicOrderReference("AM-1101");
        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);

        when(sellerOrderRepository.save(any(SellerOrder.class))).thenAnswer(i -> {
            SellerOrder so = i.getArgument(0);
            so.setId(so.getSeller().getId() == 2L ? 10L : 20L);
            return so;
        });

        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(i -> {
            OrderItem oi = i.getArgument(0);
            oi.setId(99L);
            return oi;
        });

        OrderDto result = orderService.createOrder(dto);

        assertNotNull(result);
        // Verify 2 distinct seller orders were created
        verify(sellerOrderRepository, times(2)).save(any(SellerOrder.class));
        // Verify both products were decremented
        assertEquals(8L, product.getQuantity());
        assertEquals(4L, productB.getQuantity());
    }

    @Test
    void createOrder_CartNotFound_ThrowsException() {
        UUID randomId = UUID.randomUUID();
        CreateOrderDto dto = CreateOrderDto.builder()
                .cartId(randomId)
                .guestName("Bob")
                .phoneNumber("5551234")
                .shippingAddress("456 Elm St")
                .city("Metropolis")
                .build();

        when(cartRepository.findByIdWithItems(randomId)).thenReturn(Optional.empty());

        assertThrows(CartNotFoundException.class, () -> orderService.createOrder(dto));
    }

    @Test
    void createOrder_EmptyCart_ThrowsException() {
        cart.setCartItems(new LinkedHashSet<>());
        when(cartRepository.findByIdWithItems(cart.getId())).thenReturn(Optional.of(cart));

        CreateOrderDto dto = CreateOrderDto.builder()
                .cartId(cart.getId())
                .guestName("Bob")
                .phoneNumber("5551234")
                .shippingAddress("456 Elm St")
                .city("Metropolis")
                .build();

        assertThrows(EmptyCartException.class, () -> orderService.createOrder(dto));
    }

    @Test
    void createOrder_InsufficientStock_ThrowsException() {
        product.setQuantity(1L); // available 1, requested 2
        when(cartRepository.findByIdWithItems(cart.getId())).thenReturn(Optional.of(cart));
        when(productRepository.findAllByIdForUpdate(anyCollection())).thenReturn(List.of(product));

        CreateOrderDto dto = CreateOrderDto.builder()
                .cartId(cart.getId())
                .guestName("Bob")
                .phoneNumber("5551234")
                .shippingAddress("456 Elm St")
                .city("Metropolis")
                .build();

        assertThrows(InsufficientStockException.class, () -> orderService.createOrder(dto));
    }

    @Test
    void getSellerOrders_Success() {
        when(userRepository.findByEmail("seller@example.com")).thenReturn(Optional.of(seller));

        Order order = new Order();
        order.setId(100L);
        order.setStatus("PENDING");
        order.setPublicOrderReference("AM-1100");
        order.setTotalPrice(new BigDecimal("240.00"));
        order.setCreatedAt(Instant.now());

        SellerOrder sellerOrder = new SellerOrder();
        sellerOrder.setId(10L);
        sellerOrder.setOrder(order);
        sellerOrder.setSeller(seller);
        sellerOrder.setStatus("PENDING");
        sellerOrder.setSubtotal(new BigDecimal("240.00"));
        sellerOrder.setCreatedAt(Instant.now());

        when(sellerOrderRepository.findBySellerIdWithOrder(seller.getId())).thenReturn(List.of(sellerOrder));

        OrderItem orderItem = new OrderItem();
        orderItem.setId(50L);
        orderItem.setOrder(order);
        orderItem.setSellerOrder(sellerOrder);
        orderItem.setProduct(product);
        orderItem.setSeller(seller);
        orderItem.setQuantity(2L);
        orderItem.setPrice(new BigDecimal("120.00"));

        when(orderItemRepository.findBySellerOrderId(10L)).thenReturn(List.of(orderItem));

        List<SellerOrderDto> result = orderService.getSellerOrders("seller@example.com");

        assertEquals(1, result.size());
        assertEquals(10L, result.get(0).getId());
        assertEquals(100L, result.get(0).getOrderId());
        assertEquals(1, result.get(0).getItems().size());
        assertEquals(2L, result.get(0).getItems().get(0).getSellerId());
    }

    @Test
    void updateSellerOrderStatus_Cancelled_RestoresStock() {
        Order order = new Order();
        order.setId(100L);
        order.setStatus("PENDING");
        order.setCreatedAt(Instant.now());

        SellerOrder sellerOrder = new SellerOrder();
        sellerOrder.setId(10L);
        sellerOrder.setOrder(order);
        sellerOrder.setSeller(seller);
        sellerOrder.setStatus("PENDING");
        sellerOrder.setSubtotal(new BigDecimal("240.00"));

        when(sellerOrderRepository.findById(10L)).thenReturn(Optional.of(sellerOrder));
        when(userRepository.findByEmail("seller@example.com")).thenReturn(Optional.of(seller));

        OrderItem orderItem = new OrderItem();
        orderItem.setId(50L);
        orderItem.setOrder(order);
        orderItem.setSellerOrder(sellerOrder);
        orderItem.setProduct(product);
        orderItem.setSeller(seller);
        orderItem.setQuantity(2L);
        orderItem.setPrice(new BigDecimal("120.00"));

        when(orderItemRepository.findBySellerOrderId(10L)).thenReturn(List.of(orderItem));
        when(sellerOrderRepository.save(any(SellerOrder.class))).thenReturn(sellerOrder);
        when(orderRepository.findById(100L)).thenReturn(Optional.of(order));
        when(sellerOrderRepository.findByOrderId(100L)).thenReturn(List.of(sellerOrder));

        // Product initial quantity is 10; when cancelled, 2 should be restored -> 12
        SellerOrderDto result = orderService.updateSellerOrderStatus(10L, "CANCELLED", "seller@example.com");

        assertEquals("CANCELLED", sellerOrder.getStatus());
        assertEquals(12L, product.getQuantity());
        verify(productRepository).save(product);
    }

    @Test
    void updateSellerOrderStatus_UnauthorizedSeller_ThrowsException() {
        Order order = new Order();
        order.setId(100L);

        SellerOrder sellerOrder = new SellerOrder();
        sellerOrder.setId(10L);
        sellerOrder.setOrder(order);
        sellerOrder.setSeller(seller); // seller id is 2L

        Users otherSeller = new Users();
        otherSeller.setId(99L);
        otherSeller.setEmail("other@example.com");
        otherSeller.setRole("SELLER");

        when(sellerOrderRepository.findById(10L)).thenReturn(Optional.of(sellerOrder));
        when(userRepository.findByEmail("other@example.com")).thenReturn(Optional.of(otherSeller));

        assertThrows(UnauthorizedAccessException.class,
                () -> orderService.updateSellerOrderStatus(10L, "CONFIRMED", "other@example.com"));
    }

}
