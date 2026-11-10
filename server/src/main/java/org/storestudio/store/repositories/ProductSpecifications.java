package org.storestudio.store.repositories;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.storestudio.store.entities.Category;
import org.storestudio.store.entities.Product;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class ProductSpecifications {

    private ProductSpecifications() {
    }

    public static Specification<Product> filter(String category, String search) {
        return filter(category, search, false);
    }

    public static Specification<Product> filter(String category, String search, Boolean onlyListed) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (Boolean.TRUE.equals(onlyListed)) {
                predicates.add(cb.or(cb.isNull(root.get("isListed")), cb.isTrue(root.get("isListed"))));
            }

            if (category != null && !category.isBlank()) {
                Join<Product, Category> categoryJoin = root.join("category", JoinType.LEFT);
                predicates.add(cb.equal(cb.lower(categoryJoin.get("name")), category.trim().toLowerCase()));
            }

            if (search != null && !search.isBlank()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), searchPattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), searchPattern);
                predicates.add(cb.or(nameMatch, descMatch));
            }

            return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Product> filterBySeller(Long sellerId, String category, String search, Boolean onlyListed) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("user").get("id"), sellerId));

            if (Boolean.TRUE.equals(onlyListed)) {
                predicates.add(cb.or(cb.isNull(root.get("isListed")), cb.isTrue(root.get("isListed"))));
            }

            if (category != null && !category.isBlank()) {
                Join<Product, Category> categoryJoin = root.join("category", JoinType.LEFT);
                predicates.add(cb.equal(cb.lower(categoryJoin.get("name")), category.trim().toLowerCase()));
            }

            if (search != null && !search.isBlank()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), searchPattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), searchPattern);
                predicates.add(cb.or(nameMatch, descMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
