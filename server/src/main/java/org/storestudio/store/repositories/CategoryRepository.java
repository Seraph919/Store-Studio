package org.storestudio.store.repositories;

import org.storestudio.store.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Short> {
    Optional<Category> findByNameIgnoreCase(String name);
}
