package org.storestudio.store.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users")
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "username", nullable = false)
    private String username;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "password", nullable = false, length = Integer.MAX_VALUE)
    private String password;

    @ColumnDefault("'SELLER'")
    @Column(name = "role", nullable = false, length = 25)
    private String role;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ColumnDefault("'ACTIVE'")
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @OneToMany(mappedBy = "user")
    @Builder.Default
    private Set<Cart> carts = new LinkedHashSet<>();

    @OneToMany(mappedBy = "user")
    @Builder.Default
    private Set<Product> products = new LinkedHashSet<>();
}