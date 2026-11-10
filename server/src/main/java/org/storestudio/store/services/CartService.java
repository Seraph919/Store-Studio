package org.storestudio.store.services;

import lombok.AllArgsConstructor;
import org.storestudio.store.dtos.AddItemToCartDto;
import org.storestudio.store.dtos.CartCreatedResponse;
import org.storestudio.store.dtos.CartDto;
import org.storestudio.store.dtos.CartItemDto;
import org.storestudio.store.entities.Cart;
import org.storestudio.store.entities.CartItem;
import org.storestudio.store.entities.Product;
import org.storestudio.store.exceptions.CartItemNotFoundException;
import org.storestudio.store.exceptions.CartNotFoundException;
import org.storestudio.store.exceptions.InsufficientStockException;
import org.storestudio.store.exceptions.ProductNotFoundException;
import org.storestudio.store.repositories.CartItemRepository;
import org.storestudio.store.repositories.CartRepository;
import org.storestudio.store.repositories.ProductRepository;
import org.storestudio.store.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public CartCreatedResponse createCart() {
        Cart cart = new Cart();
        cart.setCreatedAt(Instant.now());
        Cart saved = cartRepository.save(cart);
        return new CartCreatedResponse(saved.getId());
    }

    @Transactional(readOnly = true)
    public CartDto getCartDto(UUID cartId) {
        Cart cart = cartRepository.findByIdWithItems(cartId)
                .orElseThrow(() -> new CartNotFoundException(cartId));
        return toDto(cart);
    }

    @Transactional
    public CartDto addItemToCart(UUID cartId, AddItemToCartDto dto) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new CartNotFoundException(cartId));

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ProductNotFoundException(dto.getProductId()));

        long requestedQty = dto.getQuantity() != null && dto.getQuantity() > 0 ? dto.getQuantity() : 1L;

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());
        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            long newTotalQty;
            try {
                newTotalQty = Math.addExact(existingItem.getQuantity(), requestedQty);
            } catch (ArithmeticException ex) {
                throw new IllegalArgumentException("Requested cart quantity is too large");
            }
            if (product.getQuantity() < newTotalQty) {
                throw new InsufficientStockException("Insufficient stock for product '" + product.getName() +
                        "'. Available: " + product.getQuantity() + ", current in cart: " + existingItem.getQuantity() +
                        ", additional: " + requestedQty);
            }
            existingItem.setQuantity(newTotalQty);
            cartItemRepository.save(existingItem);
        } else {
            if (product.getQuantity() < requestedQty) {
                throw new InsufficientStockException("Insufficient stock for product '" + product.getName() +
                        "'. Available: " + product.getQuantity() + ", requested: " + requestedQty);
            }
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(requestedQty);
            cartItemRepository.save(newItem);
        }

        Cart updatedCart = cartRepository.findByIdWithItems(cart.getId())
                .orElseThrow(() -> new CartNotFoundException(cart.getId()));
        return toDto(updatedCart);
    }

    @Transactional
    public CartDto updateItemQuantity(UUID cartId, Long productId, Long quantity) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new CartNotFoundException(cartId));

        CartItem cartItem = cartItemRepository.findByCartIdAndProductId(cartId, productId)
                .orElseThrow(() -> new CartItemNotFoundException(productId));

        if (quantity == null || quantity <= 0) {
            cartItemRepository.delete(cartItem);
        } else {
            Product product = cartItem.getProduct();
            if (product != null && product.getQuantity() < quantity) {
                throw new InsufficientStockException("Insufficient stock for product '" + product.getName() +
                        "'. Available: " + product.getQuantity() + ", requested: " + quantity);
            }
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }

        Cart updatedCart = cartRepository.findByIdWithItems(cart.getId())
                .orElseThrow(() -> new CartNotFoundException(cart.getId()));
        return toDto(updatedCart);
    }

    @Transactional
    public CartDto removeItemFromCart(UUID cartId, Long productId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new CartNotFoundException(cartId));

        CartItem cartItem = cartItemRepository.findByCartIdAndProductId(cartId, productId)
                .orElseThrow(() -> new CartItemNotFoundException(productId));

        cartItemRepository.delete(cartItem);

        Cart updatedCart = cartRepository.findByIdWithItems(cart.getId())
                .orElseThrow(() -> new CartNotFoundException(cart.getId()));
        return toDto(updatedCart);
    }

    @Transactional
    public Cart getOrCreateCart(Long userId, UUID cartId) {
        if (cartId != null) {
            Optional<Cart> existingCart = cartRepository.findById(cartId);
            if (existingCart.isPresent()) {
                return existingCart.get();
            }
        }

        if (userId != null) {
            Optional<Cart> userCart = cartRepository.findFirstByUserIdOrderByCreatedAtDesc(userId);
            if (userCart.isPresent()) {
                return userCart.get();
            }
        }

        Cart newCart = new Cart();
        newCart.setCreatedAt(Instant.now());
        if (userId != null) {
            userRepository.findById(userId).ifPresent(newCart::setUser);
        }
        return cartRepository.save(newCart);
    }

    @Transactional
    public CartDto getActiveCartDto(Long userId, UUID cartId) {
        Cart cart = getOrCreateCart(userId, cartId);
        return toDto(cart);
    }

    @Transactional
    public CartDto addItemToCart(Long userId, AddItemToCartDto dto) {
        Cart cart = getOrCreateCart(userId, dto.getCartId());
        return addItemToCart(cart.getId(), dto);
    }

    @Transactional
    public CartDto removeItemFromCart(Long userId, UUID cartId, Long itemId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new CartItemNotFoundException(itemId));

        Cart cart = item.getCart();
        cartItemRepository.delete(item);

        Cart updatedCart = cartRepository.findByIdWithItems(cart.getId())
                .orElseThrow(() -> new CartNotFoundException(cart.getId()));
        return toDto(updatedCart);
    }

    public CartDto toDto(Cart cart) {
        List<CartItemDto> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        if (cart.getCartItems() != null) {
            for (CartItem item : cart.getCartItems()) {
                Product p = item.getProduct();
                BigDecimal unitPrice = p != null && p.getPrice() != null ? p.getPrice() : BigDecimal.ZERO;
                BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                total = total.add(subtotal);

                items.add(CartItemDto.builder()
                        .id(item.getId())
                        .productId(p != null ? p.getId() : null)
                        .productName(p != null ? p.getName() : null)
                        .unitPrice(unitPrice)
                        .price(unitPrice)
                        .quantity(item.getQuantity())
                        .subtotal(subtotal)
                        .itemTotalPrice(subtotal)
                        .paymentMode(PaymentTerms.normalize(p != null ? p.getPaymentMode() : null))
                        .depositPercent(p != null ? p.getDepositPercent() : null)
                        .build());
            }
        }

        return CartDto.builder()
                .id(cart.getId())
                .cartId(cart.getId())
                .userId(cart.getUser() != null ? cart.getUser().getId() : null)
                .items(items)
                .totalPrice(total)
                .build();
    }
}
