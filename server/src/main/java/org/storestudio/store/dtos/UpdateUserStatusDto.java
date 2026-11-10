package org.storestudio.store.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserStatusDto {
    @NotBlank(message = "Status cannot be blank")
    private String status; // "ACTIVE" or "SUSPENDED"
}

