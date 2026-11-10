package org.storestudio.store.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateOrderStatusDto {
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(?i)(PENDING|CONFIRMED|NO_ANSWER|SHIPPED|DELIVERED|CANCELLED)$", message = "Status must be PENDING, CONFIRMED, NO_ANSWER, SHIPPED, DELIVERED, or CANCELLED")
    private String status;
}
