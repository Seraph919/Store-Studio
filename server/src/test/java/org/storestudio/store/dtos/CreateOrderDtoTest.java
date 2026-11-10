package org.storestudio.store.dtos;

import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

class CreateOrderDtoTest {
    @Test
    void rejectsOversizedCustomerFieldsBeforePersistence() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            var dto = CreateOrderDto.builder().cartId(UUID.randomUUID()).guestName("A".repeat(101))
                    .phoneNumber("1".repeat(31)).city("C".repeat(101))
                    .shippingAddress("A".repeat(2001)).guestEmail("a".repeat(250) + "@example.com").build();
            var fields = validator.validate(dto).stream().map(v -> v.getPropertyPath().toString()).toList();
            assertTrue(fields.containsAll(java.util.List.of("guestName", "phoneNumber", "city", "shippingAddress", "guestEmail")));
            dto.setGuestName("Alice");
            dto.setPhoneNumber("+212600000000");
            dto.setCity("Rabat");
            dto.setShippingAddress("12 Main Street");
            dto.setGuestEmail(null);
            assertTrue(validator.validate(dto).isEmpty());
        }
    }
}
