package org.storestudio.store.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponseDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private UserDto user;
    private String token;
    private String message;
}

