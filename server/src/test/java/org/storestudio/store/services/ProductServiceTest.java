package org.storestudio.store.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.storestudio.store.dtos.ProductDto;
import org.storestudio.store.dtos.CategoryDto;
import org.storestudio.store.entities.Category;
import org.storestudio.store.entities.Product;
import org.storestudio.store.exceptions.ProductNotFoundException;
import org.storestudio.store.repositories.CategoryRepository;
import org.storestudio.store.repositories.ProductRepository;
import org.storestudio.store.repositories.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private org.storestudio.store.repositories.SellerStorefrontRepository sellerStorefrontRepository;

    @InjectMocks
    private ProductService productService;

    private Product product;
    private Category category;

    @BeforeEach
    void setUp() {
        category = new Category();
        category.setId((short) 1);
        category.setName("Electronics");

        product = new Product();
        product.setId(1L);
        product.setName("Laptop");
        product.setDescription("High performance laptop");
        product.setPrice(new BigDecimal("999.99"));
        product.setQuantity(10L);
        product.setCategory(category);
    }

    @Test
    void getProducts_WithoutFilters_ReturnsProducts() {
        Pageable pageable = PageRequest.of(0, 10);
        when(productRepository.searchProducts(eq(null), eq(null), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(product)));

        Page<ProductDto> result = productService.getProducts(null, null, pageable);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Laptop", result.getContent().get(0).getName());
        assertEquals("Electronics", result.getContent().get(0).getCategoryName());
        verify(productRepository).searchProducts(null, null, pageable);
    }

    @Test
    void getProducts_WithBlankFilters_TreatedAsNull() {
        Pageable pageable = PageRequest.of(0, 10);
        when(productRepository.searchProducts(eq(null), eq(null), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(product)));

        Page<ProductDto> result = productService.getProducts("   ", "   ", pageable);

        assertNotNull(result);
        verify(productRepository).searchProducts(null, null, pageable);
    }

    @Test
    void getProducts_WithCategoryAndSearch_TrimsParameters() {
        Pageable pageable = PageRequest.of(0, 10);
        when(productRepository.searchProducts(eq("Electronics"), eq("Laptop"), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(product)));

        Page<ProductDto> result = productService.getProducts("  Electronics  ", "  Laptop  ", pageable);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        verify(productRepository).searchProducts("Electronics", "Laptop", pageable);
    }

    @Test
    void getAllCategories_ReturnsListedProductCounts() {
        Category emptyCategory = new Category();
        emptyCategory.setId((short) 2);
        emptyCategory.setName("Accessories");
        when(categoryRepository.findAll()).thenReturn(List.of(category, emptyCategory));
        when(productRepository.countListedProductsByCategory())
                .thenReturn(List.<Object[]>of(new Object[]{(short) 1, 3L}));

        List<CategoryDto> categories = productService.getAllCategories();

        assertEquals(2, categories.size());
        assertEquals("Electronics", categories.get(0).getName());
        assertEquals(3L, categories.get(0).getProductCount());
        assertEquals(0L, categories.get(1).getProductCount());
        verify(productRepository).countListedProductsByCategory();
    }

    @Test
    void getProductById_Found() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        ProductDto result = productService.getProductById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Laptop", result.getName());
    }

    @Test
    void getProductById_NotFound() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ProductNotFoundException.class, () -> productService.getProductById(999L));
    }

    @Test
    void updateProduct_SellerCannotEditAnotherSellerProduct_ThrowsException() {
        org.storestudio.store.entities.Users sellerA = new org.storestudio.store.entities.Users();
        sellerA.setId(10L);
        sellerA.setEmail("sellerA@example.com");
        sellerA.setRole("SELLER");
        product.setUser(sellerA);

        org.storestudio.store.entities.Users sellerB = new org.storestudio.store.entities.Users();
        sellerB.setId(20L);
        sellerB.setEmail("sellerB@example.com");
        sellerB.setRole("SELLER");

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(userRepository.findByEmail("sellerB@example.com")).thenReturn(Optional.of(sellerB));

        org.storestudio.store.dtos.CreateProductDto dto = org.storestudio.store.dtos.CreateProductDto.builder()
                .name("Hacked Product")
                .price(new BigDecimal("10.00"))
                .build();

        assertThrows(org.storestudio.store.exceptions.UnauthorizedAccessException.class,
                () -> productService.updateProduct(1L, dto, "sellerB@example.com"));
    }

    @Test
    void updateProduct_SellerCanEditOwnProduct_Success() {
        org.storestudio.store.entities.Users sellerA = new org.storestudio.store.entities.Users();
        sellerA.setId(10L);
        sellerA.setEmail("sellerA@example.com");
        sellerA.setRole("SELLER");
        product.setUser(sellerA);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(userRepository.findByEmail("sellerA@example.com")).thenReturn(Optional.of(sellerA));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        org.storestudio.store.dtos.CreateProductDto dto = org.storestudio.store.dtos.CreateProductDto.builder()
                .name("Updated Name")
                .price(new BigDecimal("150.00"))
                .build();

        ProductDto result = productService.updateProduct(1L, dto, "sellerA@example.com");

        assertNotNull(result);
        assertEquals("Updated Name", product.getName());
    }
}
