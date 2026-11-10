package org.storestudio.store.services;

import java.math.BigDecimal;

/** Computes one store-wide shipping charge from the product subtotal, not user input. */
public final class ShippingCalculator {
    private ShippingCalculator() { }

    public static BigDecimal calculate(BigDecimal subtotal, String mode, BigDecimal fee, BigDecimal threshold) {
        if (subtotal == null || subtotal.signum() < 0) throw new IllegalArgumentException("Invalid subtotal");
        BigDecimal standardFee = fee == null ? BigDecimal.ZERO : fee;
        if (standardFee.signum() < 0) throw new IllegalArgumentException("Negative shipping fee");
        String shippingMode = mode == null ? "FREE" : mode;
        return switch (shippingMode) {
            case "FREE" -> BigDecimal.ZERO;
            case "FLAT" -> standardFee;
            case "FREE_ABOVE" -> {
                if (threshold == null || threshold.signum() <= 0) throw new IllegalArgumentException("Missing free shipping threshold");
                yield subtotal.compareTo(threshold) >= 0 ? BigDecimal.ZERO : standardFee;
            }
            default -> throw new IllegalArgumentException("Unknown shipping mode");
        };
    }
}
