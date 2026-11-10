package org.storestudio.store.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderDto {
    @NotNull(message = "Cart ID is required")
    private UUID cartId;

    @NotBlank(message = "Guest name is required")
    @Size(max = 100, message = "Name must be at most 100 characters")
    private String guestName;

    @NotBlank(message = "Phone number is required")
    @Size(max = 30, message = "Phone number must be at most 30 characters")
    private String phoneNumber;

    @NotBlank(message = "Shipping address is required")
    @Size(max = 2000, message = "Shipping address must be at most 2000 characters")
    private String shippingAddress;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must be at most 100 characters")
    private String city;

    @Email(message = "Please provide a valid email address")
    @Size(max = 255, message = "Email address must be at most 255 characters")
    private String guestEmail;
}
