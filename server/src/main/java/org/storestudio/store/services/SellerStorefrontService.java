package org.storestudio.store.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.storestudio.store.dtos.*;
import org.storestudio.store.entities.*;
import org.storestudio.store.exceptions.UserNotFoundException;
import org.storestudio.store.repositories.ProductRepository;
import org.storestudio.store.repositories.ProductSpecifications;
import org.storestudio.store.repositories.SellerStorefrontRepository;
import org.storestudio.store.repositories.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SellerStorefrontService {

    private static final Set<String> RESERVED_SLUGS = Set.of(
            "admin", "seller", "shop", "login", "api", "stores",
            "order", "cart", "checkout", "track", "settings", "register",
            "auth", "products", "category", "home"
    );

    private static final Pattern SLUG_PATTERN = Pattern.compile("^[a-z0-9]+(?:-[a-z0-9]+)*$");

    private final SellerStorefrontRepository storefrontRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    // --- Public Operations ---

    @Transactional(readOnly = true)
    public PublicStorefrontDto getPublicStorefront(String slug) {
        String cleanSlug = slug != null ? slug.trim().toLowerCase() : "";
        SellerStorefront storefront = storefrontRepository.findBySlug(cleanSlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Storefront not found: " + slug));

        return toPublicDto(storefront);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProductDto> getStorefrontProducts(String slug, String category, String search, Pageable pageable) {
        String cleanSlug = slug != null ? slug.trim().toLowerCase() : "";
        SellerStorefront storefront = storefrontRepository.findBySlug(cleanSlug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Storefront not found: " + slug));

        Long sellerId = storefront.getSeller().getId();
        Page<Product> page = productRepository.findAll(
                ProductSpecifications.filterBySeller(sellerId, category, search, true),
                pageable
        );

        List<ProductDto> dtos = page.getContent().stream()
                .map(productService::toDto)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                dtos,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    // --- Seller Operations ---

    @Transactional
    public SellerStorefrontDto getOrCreateSellerStorefront(String sellerEmail) {
        Users seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new UserNotFoundException("Seller not found: " + sellerEmail));

        return storefrontRepository.findBySellerId(seller.getId())
                .map(this::toSellerDto)
                .orElseGet(() -> {
                    log.info("Creating default storefront for seller id: {}", seller.getId());
                    SellerStorefront newStorefront = createDefaultStorefront(seller);
                    return toSellerDto(storefrontRepository.save(newStorefront));
                });
    }

    @Transactional
    public SellerStorefrontDto updateSellerStorefront(String sellerEmail, UpdateSellerStorefrontDto dto) {
        Users seller = userRepository.findByEmail(sellerEmail)
                .orElseThrow(() -> new UserNotFoundException("Seller not found: " + sellerEmail));

        SellerStorefront storefront = storefrontRepository.findBySellerId(seller.getId())
                .orElseGet(() -> createDefaultStorefront(seller));

        // Validate slug
        String candidateSlug = dto.getSlug() != null ? dto.getSlug().trim().toLowerCase() : "";
        validateSlug(candidateSlug, storefront.getId());

        storefront.setSlug(candidateSlug);
        storefront.setStoreName(dto.getStoreName().trim());
        storefront.setTagline(dto.getTagline() != null ? dto.getTagline().trim() : null);
        storefront.setLogoUrl(dto.getLogoUrl());

        storefront.setHeroImageUrl(dto.getHeroImageUrl());
        storefront.setHeroTitle(dto.getHeroTitle());
        storefront.setHeroSubtitle(dto.getHeroSubtitle());

        storefront.setTemplateId(dto.getTemplateId() != null ? dto.getTemplateId() : StorefrontTemplate.EDITORIAL);
        storefront.setThemeMode(dto.getThemeMode() != null ? dto.getThemeMode() : StorefrontThemeMode.LIGHT);
        storefront.setAccentColor(dto.getAccentColor() != null ? dto.getAccentColor().trim() : "#B58A56");
        storefront.setFontPreset(dto.getFontPreset() != null ? dto.getFontPreset() : StorefrontFontPreset.ELEGANT);

        storefront.setShowFeaturedProducts(Boolean.TRUE.equals(dto.getShowFeaturedProducts()));
        storefront.setShowReviews(Boolean.TRUE.equals(dto.getShowReviews()));
        storefront.setShowAboutSection(Boolean.TRUE.equals(dto.getShowAboutSection()));

        storefront.setAboutTitle(dto.getAboutTitle());
        storefront.setAboutText(dto.getAboutText());
        storefront.setAboutImageUrl(dto.getAboutImageUrl());

        // Update featured products (max 6)
        if (dto.getFeaturedProductIds() != null) {
            if (dto.getFeaturedProductIds().size() > 6) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot feature more than 6 products");
            }

            storefront.getFeaturedProducts().clear();
            storefrontRepository.flush();
            int pos = 0;
            for (Long prodId : dto.getFeaturedProductIds()) {
                Product product = productRepository.findById(prodId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product not found: " + prodId));

                // Strict security check: product MUST belong to this seller
                if (product.getUser() == null || !product.getUser().getId().equals(seller.getId())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot feature a product owned by another seller");
                }

                SellerStorefrontFeaturedProduct fp = SellerStorefrontFeaturedProduct.builder()
                        .storefront(storefront)
                        .product(product)
                        .position(pos++)
                        .build();

                storefront.getFeaturedProducts().add(fp);
            }
        }

        SellerStorefront saved = storefrontRepository.save(storefront);
        log.info("Updated storefront for seller id: {}, slug: {}", seller.getId(), saved.getSlug());
        return toSellerDto(saved);
    }

    // --- Helpers ---

    private void validateSlug(String slug, Long currentStorefrontId) {
        if (slug.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slug cannot be blank");
        }
        if (!SLUG_PATTERN.matcher(slug).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slug must contain only lowercase alphanumeric characters and hyphens");
        }
        if (RESERVED_SLUGS.contains(slug)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The slug '" + slug + "' is reserved and cannot be used");
        }
        if (currentStorefrontId != null) {
            if (storefrontRepository.existsBySlugAndIdNot(slug, currentStorefrontId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "The slug '" + slug + "' is already in use by another storefront");
            }
        } else {
            if (storefrontRepository.existsBySlug(slug)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "The slug '" + slug + "' is already in use by another storefront");
            }
        }
    }

    private SellerStorefront createDefaultStorefront(Users seller) {
        String baseSlug = sanitizeSlug(seller.getUsername());
        String uniqueSlug = generateUniqueSlug(baseSlug);

        return SellerStorefront.builder()
                .seller(seller)
                .slug(uniqueSlug)
                .storeName(seller.getUsername() + " Atelier")
                .tagline("Handcrafted fine jewelry made with intention")
                .heroTitle("Timeless pieces for every story")
                .heroSubtitle("Discover our handcrafted collection designed to elevate your everyday moments.")
                .templateId(StorefrontTemplate.EDITORIAL)
                .themeMode(StorefrontThemeMode.LIGHT)
                .accentColor("#B58A56")
                .fontPreset(StorefrontFontPreset.ELEGANT)
                .showFeaturedProducts(true)
                .showReviews(true)
                .showAboutSection(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private String sanitizeSlug(String input) {
        if (input == null || input.isBlank()) {
            return "atelier";
        }
        String clean = input.toLowerCase().replaceAll("[^a-z0-9]+", "-");
        clean = clean.replaceAll("^-+|-+$", "");
        return clean.isBlank() ? "atelier" : clean;
    }

    private String generateUniqueSlug(String base) {
        String candidate = base;
        int counter = 2;
        while (storefrontRepository.existsBySlug(candidate) || RESERVED_SLUGS.contains(candidate)) {
            candidate = base + "-" + counter;
            counter++;
        }
        return candidate;
    }

    public PublicStorefrontDto toPublicDto(SellerStorefront sf) {
        List<ProductDto> featuredDtos = sf.getFeaturedProducts() != null
                ? sf.getFeaturedProducts().stream()
                        .map(SellerStorefrontFeaturedProduct::getProduct)
                        .filter(p -> p != null && Boolean.TRUE.equals(p.getIsListed()))
                        .map(productService::toDto)
                        .collect(Collectors.toList())
                : Collections.emptyList();

        return PublicStorefrontDto.builder()
                .slug(sf.getSlug())
                .storeName(sf.getStoreName())
                .tagline(sf.getTagline())
                .logoUrl(sf.getLogoUrl())
                .hero(StoreHeroDto.builder()
                        .imageUrl(sf.getHeroImageUrl())
                        .title(sf.getHeroTitle())
                        .subtitle(sf.getHeroSubtitle())
                        .build())
                .templateId(sf.getTemplateId())
                .theme(StoreThemeDto.builder()
                        .mode(sf.getThemeMode())
                        .accentColor(sf.getAccentColor())
                        .fontPreset(sf.getFontPreset())
                        .build())
                .sections(StoreSectionsDto.builder()
                        .showFeaturedProducts(sf.getShowFeaturedProducts())
                        .showReviews(sf.getShowReviews())
                        .showAboutSection(sf.getShowAboutSection())
                        .build())
                .about(StoreAboutDto.builder()
                        .title(sf.getAboutTitle())
                        .text(sf.getAboutText())
                        .imageUrl(sf.getAboutImageUrl())
                        .build())
                .featuredProducts(featuredDtos)
                .build();
    }

    public SellerStorefrontDto toSellerDto(SellerStorefront sf) {
        List<Long> featuredIds = new ArrayList<>();
        List<ProductDto> featuredDtos = new ArrayList<>();

        if (sf.getFeaturedProducts() != null) {
            for (SellerStorefrontFeaturedProduct fp : sf.getFeaturedProducts()) {
                if (fp.getProduct() != null) {
                    featuredIds.add(fp.getProduct().getId());
                    featuredDtos.add(productService.toDto(fp.getProduct()));
                }
            }
        }

        return SellerStorefrontDto.builder()
                .id(sf.getId())
                .sellerId(sf.getSeller().getId())
                .slug(sf.getSlug())
                .storeName(sf.getStoreName())
                .tagline(sf.getTagline())
                .logoUrl(sf.getLogoUrl())
                .heroImageUrl(sf.getHeroImageUrl())
                .heroTitle(sf.getHeroTitle())
                .heroSubtitle(sf.getHeroSubtitle())
                .templateId(sf.getTemplateId())
                .themeMode(sf.getThemeMode())
                .accentColor(sf.getAccentColor())
                .fontPreset(sf.getFontPreset())
                .showFeaturedProducts(sf.getShowFeaturedProducts())
                .showReviews(sf.getShowReviews())
                .showAboutSection(sf.getShowAboutSection())
                .aboutTitle(sf.getAboutTitle())
                .aboutText(sf.getAboutText())
                .aboutImageUrl(sf.getAboutImageUrl())
                .featuredProductIds(featuredIds)
                .featuredProducts(featuredDtos)
                .createdAt(sf.getCreatedAt())
                .updatedAt(sf.getUpdatedAt())
                .build();
    }
}
