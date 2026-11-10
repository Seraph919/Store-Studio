package org.storestudio.store.services;

import lombok.AllArgsConstructor;
import org.storestudio.store.dtos.CreateProductDto;
import org.storestudio.store.dtos.PagedResponse;
import org.storestudio.store.dtos.ProductDto;
import org.storestudio.store.dtos.SellerMediaConfigDto;
import org.storestudio.store.entities.Category;
import org.storestudio.store.entities.Product;
import org.storestudio.store.entities.ProductImage;
import org.storestudio.store.entities.Users;
import org.storestudio.store.exceptions.ProductNotFoundException;
import org.storestudio.store.exceptions.UnauthorizedAccessException;
import org.storestudio.store.exceptions.UserNotFoundException;
import org.storestudio.store.repositories.CategoryRepository;
import org.storestudio.store.repositories.OrderItemRepository;
import org.storestudio.store.repositories.ProductRepository;
import org.storestudio.store.repositories.UserRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;
    private final org.storestudio.store.repositories.SellerStorefrontRepository sellerStorefrontRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "productsPaged", key = "(#category != null ? #category : '') + '_' + (#search != null ? #search : '') + '_' + #pageable.pageNumber + '_' + #pageable.pageSize + '_' + #pageable.sort")
    public PagedResponse<ProductDto> getPagedProducts(String category, String search, Pageable pageable) {
        return PagedResponse.fromPage(getProducts(category, search, pageable));
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> getProducts(String category, String search, Pageable pageable) {
        String catParam = (category != null && !category.isBlank()) ? category.trim() : null;
        String searchParam = (search != null && !search.isBlank()) ? search.trim() : null;

        return productRepository.searchProducts(catParam, searchParam, pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "productById", key = "#id")
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        return toDto(product);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "topOrderedProduct", key = "#isPack")
    public ProductDto getTopOrderedProduct(boolean isPack) {
        List<Long> topProductIds = orderItemRepository.findTopOrderedProductIdsByPack(isPack);
        for (Long pid : topProductIds) {
            java.util.Optional<Product> optionalProduct = productRepository.findById(pid);
            if (optionalProduct.isPresent() && Boolean.TRUE.equals(optionalProduct.get().getIsListed())) {
                return toDto(optionalProduct.get());
            }
        }

        // Fallback to most recently listed product matching isPack
        List<Product> fallback = productRepository.findLatestByPack(isPack, PageRequest.of(0, 1));
        if (!fallback.isEmpty()) {
            return toDto(fallback.get(0));
        }

        return null;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "relatedProducts", key = "#id + '_' + #limit")
    public List<ProductDto> getRelatedProducts(Long id, int limit) {
        int targetLimit = (limit > 0 && limit <= 20) ? limit : 4;
        Product current = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        Short catId = current.getCategory() != null ? current.getCategory().getId() : null;
        List<Product> results = new ArrayList<>();

        if (catId != null) {
            results.addAll(productRepository.findRelatedByCategory(catId, id, PageRequest.of(0, targetLimit)));
        }

        if (results.size() < targetLimit) {
            int remaining = targetLimit - results.size();
            List<Long> excludeIds = new ArrayList<>();
            excludeIds.add(id);
            for (Product p : results) {
                excludeIds.add(p.getId());
            }
            results.addAll(productRepository.findFallbackListed(excludeIds, PageRequest.of(0, remaining)));
        }

        return results.stream().map(this::toDto).collect(Collectors.toList());
    }


    @Transactional
    public ProductDto createProduct(CreateProductDto dto, Long userId) {
        return createProduct(dto, userId, null);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "productsPaged", allEntries = true),
            @CacheEvict(value = "topOrderedProduct", allEntries = true),
            @CacheEvict(value = "categories", allEntries = true),
            @CacheEvict(value = "relatedProducts", allEntries = true)
    })
    public ProductDto createProduct(CreateProductDto dto, Long userId, String authEmail) {
        Users user = null;
        if (authEmail != null && !authEmail.isBlank()) {
            user = userRepository.findByEmail(authEmail).orElse(null);
        }
        if (user == null && userId != null) {
            user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException(userId));
        }
        if (user == null) {
            throw new UnauthorizedAccessException("Authentication required to create product.");
        }

        // Admin is not a seller, so do not allow him to add products
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new UnauthorizedAccessException("Administrators are platform overseers, not sellers. Only sellers can consign and list products.");
        }

        Category category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId()).orElse(null);
        } else if (dto.getCategoryName() != null && !dto.getCategoryName().isBlank()) {
            String catName = dto.getCategoryName().trim();
            category = categoryRepository.findByNameIgnoreCase(catName)
                    .orElseGet(() -> {
                        Category newCat = new Category();
                        newCat.setName(catName);
                        return categoryRepository.save(newCat);
                    });
        }

        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription() != null ? dto.getDescription() : "");
        product.setPrice(dto.getPrice());
        product.setQuantity(dto.getQuantity() != null ? dto.getQuantity() : 0L);
        product.setOriginalPrice(dto.getOriginalPrice());
        product.setIsPack(Boolean.TRUE.equals(dto.getIsPack()));
        product.setPaymentMode(PaymentTerms.normalize(dto.getPaymentMode()));
        product.setDepositPercent(PaymentTerms.validatePercent(product.getPaymentMode(), dto.getDepositPercent()));
        if (dto.getOriginalPrice() != null && dto.getPrice() != null && dto.getOriginalPrice().compareTo(dto.getPrice()) > 0) {
            int rate = dto.getOriginalPrice().subtract(dto.getPrice())
                    .multiply(java.math.BigDecimal.valueOf(100))
                    .divide(dto.getOriginalPrice(), 0, java.math.RoundingMode.HALF_UP)
                    .intValue();
            product.setDiscountRate(rate);
        } else if (dto.getDiscountRate() != null) {
            product.setDiscountRate(dto.getDiscountRate());
        } else {
            product.setDiscountRate(null);
        }
        product.setUser(user);
        product.setCategory(category);

        if (dto.getVideoUrl() != null) {
            String vUrl = dto.getVideoUrl().trim();
            if (!vUrl.isBlank() && (vUrl.startsWith("http://") || vUrl.startsWith("https://"))) {
                product.setVideoUrl(vUrl);
            } else {
                product.setVideoUrl(null);
            }
        }

        if (dto.getImages() != null && !dto.getImages().isEmpty()) {
            List<ProductImage> imageEntities = new ArrayList<>();
            for (String url : dto.getImages()) {
                if (url != null && !url.isBlank()) {
                    ProductImage pi = new ProductImage();
                    pi.setProduct(product);
                    pi.setImageUrl(url.trim());
                    imageEntities.add(pi);
                }
            }
            product.setImages(imageEntities);
            if (!imageEntities.isEmpty()) {
                product.setThumbnailUrl(imageEntities.get(0).getImageUrl());
                if (imageEntities.size() > 1) {
                    product.setHoverImageUrl(imageEntities.get(1).getImageUrl());
                }
            }
        }

        Product saved = productRepository.save(product);
        return toDto(saved);
    }

    public ProductDto toDto(Product product) {
        List<String> imageUrls = (product.getImages() != null)
                ? product.getImages().stream()
                        .map(ProductImage::getImageUrl)
                        .filter(u -> u != null && !u.isBlank())
                        .collect(Collectors.toList())
                : Collections.emptyList();

        String thumb = product.getThumbnailUrl();
        if ((thumb == null || thumb.isBlank()) && !imageUrls.isEmpty()) {
            thumb = imageUrls.get(0);
        }

        String hover = product.getHoverImageUrl();
        if ((hover == null || hover.isBlank()) && imageUrls.size() > 1) {
            hover = imageUrls.get(1);
        }

        org.storestudio.store.dtos.StoreSummaryDto store = null;
        if (product.getUser() != null) {
            store = sellerStorefrontRepository.findBySellerId(product.getUser().getId())
                    .map(sf -> new org.storestudio.store.dtos.StoreSummaryDto(sf.getStoreName(), sf.getSlug()))
                    .orElse(null);
        }

        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .quantity(product.getQuantity())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .images(imageUrls)
                .videoUrl(product.getVideoUrl())
                .isListed(product.getIsListed() != null ? product.getIsListed() : true)
                .thumbnailUrl(thumb)
                .hoverImageUrl(hover)
                .imageAspect(product.getImageAspect())
                .imageFit(product.getImageFit())
                .imagePositionX(product.getImagePositionX())
                .imagePositionY(product.getImagePositionY())
                .imageZoom(product.getImageZoom())
                .originalPrice(product.getOriginalPrice())
                .discountRate(product.getDiscountRate())
                .isPack(Boolean.TRUE.equals(product.getIsPack()))
                .paymentMode(PaymentTerms.normalize(product.getPaymentMode()))
                .depositPercent(product.getDepositPercent())
                .sellerId(product.getUser() != null ? product.getUser().getId() : null)
                .store(store)
                .build();
    }

    private static int bounded(int value, int min, int max) {
        if (value < min || value > max) throw new IllegalArgumentException("Image framing value out of range");
        return value;
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getSellerProducts(String sellerEmail) {
        Users user = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + sellerEmail));

        List<Product> products;
        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            products = productRepository.findAllByOrderByIdDesc();
        } else {
            products = productRepository.findByUserIdOrderByIdDesc(user.getId());
        }

        return products.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "productById", key = "#productId"),
            @CacheEvict(value = "productsPaged", allEntries = true),
            @CacheEvict(value = "topOrderedProduct", allEntries = true),
            @CacheEvict(value = "categories", allEntries = true),
            @CacheEvict(value = "relatedProducts", allEntries = true)
    })
    public ProductDto updateProductMediaConfig(Long productId, SellerMediaConfigDto dto, String userEmail) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userEmail));

        boolean isOwner = product.getUser() != null && product.getUser().getId().equals(user.getId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole());

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedAccessException("Not authorized to modify media configuration for product #" + productId);
        }

        if (dto.getThumbnailUrl() != null) {
            product.setThumbnailUrl(dto.getThumbnailUrl().isBlank() ? null : dto.getThumbnailUrl().trim());
        }

        if (dto.getHoverImageUrl() != null) {
            product.setHoverImageUrl(dto.getHoverImageUrl().isBlank() ? null : dto.getHoverImageUrl().trim());
        }

        if (dto.getImageAspect() != null) {
            if (!List.of("square", "portrait", "landscape").contains(dto.getImageAspect())) throw new IllegalArgumentException("Unsupported image shape");
            product.setImageAspect(dto.getImageAspect());
        }
        if (dto.getImageFit() != null) {
            if (!List.of("contain", "cover").contains(dto.getImageFit())) throw new IllegalArgumentException("Unsupported image fit");
            product.setImageFit(dto.getImageFit());
        }
        if (dto.getImagePositionX() != null) product.setImagePositionX(bounded(dto.getImagePositionX(), 0, 100));
        if (dto.getImagePositionY() != null) product.setImagePositionY(bounded(dto.getImagePositionY(), 0, 100));
        if (dto.getImageZoom() != null) product.setImageZoom(bounded(dto.getImageZoom(), 100, 200));

        if (dto.getIsListed() != null) {
            product.setIsListed(dto.getIsListed());
        }

        if (dto.getImages() != null) {
            product.getImages().clear();
            for (String url : dto.getImages()) {
                if (url != null && !url.isBlank()) {
                    ProductImage pi = new ProductImage();
                    pi.setProduct(product);
                    pi.setImageUrl(url.trim());
                    product.getImages().add(pi);
                }
            }
        }

        Product saved = productRepository.save(product);
        return toDto(saved);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "productById", key = "#productId"),
            @CacheEvict(value = "productsPaged", allEntries = true),
            @CacheEvict(value = "topOrderedProduct", allEntries = true),
            @CacheEvict(value = "categories", allEntries = true),
            @CacheEvict(value = "relatedProducts", allEntries = true)
    })
    public ProductDto updateProduct(Long productId, CreateProductDto dto, String userEmail) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        if (userEmail == null || userEmail.isBlank()) {
            throw new UnauthorizedAccessException("Authentication required to edit product #" + productId);
        }

        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userEmail));

        boolean isOwner = product.getUser() != null && product.getUser().getId().equals(user.getId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole());
        if (!isOwner && !isAdmin) {
            throw new UnauthorizedAccessException("Not authorized to edit product #" + productId);
        }

        product.setName(dto.getName());
        product.setDescription(dto.getDescription() != null ? dto.getDescription() : "");
        product.setPrice(dto.getPrice());
        product.setQuantity(dto.getQuantity() != null ? dto.getQuantity() : 0L);
        product.setOriginalPrice(dto.getOriginalPrice());
        // Backward-compatible: older API clients that omit these fields preserve the current policy.
        if (dto.getPaymentMode() != null) {
            product.setPaymentMode(PaymentTerms.normalize(dto.getPaymentMode()));
            product.setDepositPercent(PaymentTerms.validatePercent(product.getPaymentMode(), dto.getDepositPercent()));
        }
        if (dto.getIsPack() != null) {
            product.setIsPack(dto.getIsPack());
        }
        if (dto.getOriginalPrice() != null && dto.getPrice() != null && dto.getOriginalPrice().compareTo(dto.getPrice()) > 0) {
            int rate = dto.getOriginalPrice().subtract(dto.getPrice())
                    .multiply(java.math.BigDecimal.valueOf(100))
                    .divide(dto.getOriginalPrice(), 0, java.math.RoundingMode.HALF_UP)
                    .intValue();
            product.setDiscountRate(rate);
        } else if (dto.getDiscountRate() != null) {
            product.setDiscountRate(dto.getDiscountRate());
        } else {
            product.setDiscountRate(null);
        }

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId()).orElse(null);
            product.setCategory(category);
        } else if (dto.getCategoryName() != null && !dto.getCategoryName().isBlank()) {
            String catName = dto.getCategoryName().trim();
            Category category = categoryRepository.findByNameIgnoreCase(catName)
                    .orElseGet(() -> {
                        Category newCat = new Category();
                        newCat.setName(catName);
                        return categoryRepository.save(newCat);
                    });
            product.setCategory(category);
        }

        if (dto.getVideoUrl() != null) {
            String vUrl = dto.getVideoUrl().trim();
            if (!vUrl.isBlank() && (vUrl.startsWith("http://") || vUrl.startsWith("https://"))) {
                product.setVideoUrl(vUrl);
            } else {
                product.setVideoUrl(null);
            }
        }

        if (dto.getImages() != null) {
            if (product.getImages() == null) {
                product.setImages(new ArrayList<>());
            } else {
                product.getImages().clear();
            }
            List<ProductImage> newImages = new ArrayList<>();
            for (String url : dto.getImages()) {
                if (url != null && !url.isBlank()) {
                    ProductImage pi = new ProductImage();
                    pi.setProduct(product);
                    pi.setImageUrl(url.trim());
                    newImages.add(pi);
                }
            }
            product.getImages().addAll(newImages);

            if (!newImages.isEmpty()) {
                product.setThumbnailUrl(newImages.get(0).getImageUrl());
                if (newImages.size() > 1) {
                    product.setHoverImageUrl(newImages.get(1).getImageUrl());
                } else {
                    product.setHoverImageUrl(null);
                }
            } else {
                product.setThumbnailUrl(null);
                product.setHoverImageUrl(null);
            }
        }

        Product saved = productRepository.save(product);
        return toDto(saved);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "productById", key = "#productId"),
            @CacheEvict(value = "productsPaged", allEntries = true),
            @CacheEvict(value = "topOrderedProduct", allEntries = true),
            @CacheEvict(value = "categories", allEntries = true),
            @CacheEvict(value = "relatedProducts", allEntries = true)
    })
    public ProductDto toggleProductListing(Long productId, Boolean isListed, String userEmail) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userEmail));

        boolean isOwner = product.getUser() != null && product.getUser().getId().equals(user.getId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole());

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedAccessException("Not authorized to change listing status for product #" + productId);
        }

        boolean newStatus = (isListed != null) ? isListed : !Boolean.TRUE.equals(product.getIsListed());
        product.setIsListed(newStatus);
        Product saved = productRepository.save(product);
        return toDto(saved);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "productById", key = "#productId"),
            @CacheEvict(value = "productsPaged", allEntries = true),
            @CacheEvict(value = "topOrderedProduct", allEntries = true),
            @CacheEvict(value = "categories", allEntries = true),
            @CacheEvict(value = "relatedProducts", allEntries = true)
    })
    public void deleteProduct(Long productId, String userEmail) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        Users user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userEmail));

        boolean isOwner = product.getUser() != null && product.getUser().getId().equals(user.getId());
        boolean isAdmin = "ADMIN".equalsIgnoreCase(user.getRole());

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedAccessException("Not authorized to delete product #" + productId);
        }

        productRepository.delete(product);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "categories", key = "'public_v2'")
    public List<org.storestudio.store.dtos.CategoryDto> getAllCategories() {
        Map<Short, Long> visibleCounts = new HashMap<>();
        for (Object[] row : productRepository.countListedProductsByCategory()) {
            visibleCounts.put((Short) row[0], ((Number) row[1]).longValue());
        }
        return categoryRepository.findAll().stream()
                .map(c -> org.storestudio.store.dtos.CategoryDto.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .productCount(visibleCounts.getOrDefault(c.getId(), 0L))
                        .build())
                .collect(Collectors.toList());
    }
}
