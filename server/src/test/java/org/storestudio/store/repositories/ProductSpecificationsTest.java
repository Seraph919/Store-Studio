package org.storestudio.store.repositories;

import jakarta.persistence.criteria.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.storestudio.store.entities.Category;
import org.storestudio.store.entities.Product;
import org.springframework.data.jpa.domain.Specification;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductSpecificationsTest {

    @Mock
    private Root<Product> root;
    @Mock
    private CriteriaQuery<?> query;
    @Mock
    private CriteriaBuilder cb;
    @Mock
    private Join<Product, Category> categoryJoin;
    @Mock
    private Path<String> categoryPath;
    @Mock
    private Expression<String> lowerCategoryName;
    @Mock
    private Path<String> productNamePath;
    @Mock
    private Expression<String> lowerProductName;
    @Mock
    private Path<String> productDescPath;
    @Mock
    private Expression<String> lowerProductDesc;
    @Mock
    private Predicate predicate;

    @Test
    void filter_WithNullParams_ReturnsConjunction() {
        Predicate conjunction = mock(Predicate.class);
        when(cb.conjunction()).thenReturn(conjunction);

        Specification<Product> spec = ProductSpecifications.filter(null, null);
        Predicate result = spec.toPredicate(root, query, cb);

        assertNotNull(result);
        verify(cb).conjunction();
        verifyNoMoreInteractions(cb);
    }

    @Test
    void filter_WithBlankParams_ReturnsConjunction() {
        Predicate conjunction = mock(Predicate.class);
        when(cb.conjunction()).thenReturn(conjunction);

        Specification<Product> spec = ProductSpecifications.filter("   ", "   ");
        Predicate result = spec.toPredicate(root, query, cb);

        assertNotNull(result);
        verify(cb).conjunction();
    }

    @Test
    void filter_WithCategoryOnly_AddsCategoryPredicate() {
        when(root.<Product, Category>join(eq("category"), eq(JoinType.LEFT))).thenReturn(categoryJoin);
        when(categoryJoin.<String>get("name")).thenReturn(categoryPath);
        when(cb.lower(categoryPath)).thenReturn(lowerCategoryName);
        when(cb.equal(lowerCategoryName, "electronics")).thenReturn(predicate);
        when(cb.and(any(Predicate[].class))).thenReturn(predicate);

        Specification<Product> spec = ProductSpecifications.filter("Electronics", null);
        Predicate result = spec.toPredicate(root, query, cb);

        assertNotNull(result);
        verify(cb).equal(lowerCategoryName, "electronics");
    }

    @Test
    void filter_WithSearchOnly_AddsSearchPredicate() {
        when(root.<String>get("name")).thenReturn(productNamePath);
        when(root.<String>get("description")).thenReturn(productDescPath);
        when(cb.lower(productNamePath)).thenReturn(lowerProductName);
        when(cb.lower(productDescPath)).thenReturn(lowerProductDesc);
        when(cb.like(lowerProductName, "%phone%")).thenReturn(predicate);
        when(cb.like(lowerProductDesc, "%phone%")).thenReturn(predicate);
        when(cb.or(predicate, predicate)).thenReturn(predicate);
        when(cb.and(any(Predicate[].class))).thenReturn(predicate);

        Specification<Product> spec = ProductSpecifications.filter(null, "Phone");
        Predicate result = spec.toPredicate(root, query, cb);

        assertNotNull(result);
        verify(cb).or(predicate, predicate);
    }

    @Test
    void filter_WithOnlyListedTrue_AddsIsListedPredicate() {
        Path<Boolean> isListedPath = mock(Path.class);
        Predicate isNullPredicate = mock(Predicate.class);
        Predicate isTruePredicate = mock(Predicate.class);
        Predicate orPredicate = mock(Predicate.class);

        when(root.<Boolean>get("isListed")).thenReturn(isListedPath);
        when(cb.isNull(isListedPath)).thenReturn(isNullPredicate);
        when(cb.isTrue(isListedPath)).thenReturn(isTruePredicate);
        when(cb.or(isNullPredicate, isTruePredicate)).thenReturn(orPredicate);
        when(cb.and(any(Predicate[].class))).thenReturn(predicate);

        Specification<Product> spec = ProductSpecifications.filter(null, null, true);
        Predicate result = spec.toPredicate(root, query, cb);

        assertNotNull(result);
        verify(cb).or(isNullPredicate, isTruePredicate);
    }
}
