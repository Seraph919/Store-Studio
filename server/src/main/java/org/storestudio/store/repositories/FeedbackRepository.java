package org.storestudio.store.repositories;

import org.storestudio.store.entities.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<Feedback> findByProductIdAndIsVisibleTrueOrderByCreatedAtDesc(Long productId);
    List<Feedback> findByProductIdIsNullOrderByCreatedAtDesc();
    List<Feedback> findByProductIdIsNullAndIsVisibleTrueOrderByCreatedAtDesc();
    List<Feedback> findByIsVisibleTrueOrderByCreatedAtDesc();
    List<Feedback> findBySellerIdOrderByCreatedAtDesc(Long sellerId);
    List<Feedback> findAllByOrderByCreatedAtDesc();
}
