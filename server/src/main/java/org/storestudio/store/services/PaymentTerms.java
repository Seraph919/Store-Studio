package org.storestudio.store.services;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Server-authoritative terms for a single product, independent of any payment gateway. */
public final class PaymentTerms {
    public static final String COD = "COD";
    public static final String DEPOSIT = "DEPOSIT";
    public static final String PREPAID = "PREPAID";

    private PaymentTerms() { }

    public static String normalize(String mode) {
        String normalized = mode == null || mode.isBlank() ? COD : mode.trim().toUpperCase();
        if (!COD.equals(normalized) && !DEPOSIT.equals(normalized) && !PREPAID.equals(normalized)) {
            throw new IllegalArgumentException("Payment mode must be COD, DEPOSIT, or PREPAID");
        }
        return normalized;
    }

    public static Integer validatePercent(String mode, Integer percent) {
        if (!DEPOSIT.equals(normalize(mode))) return null;
        if (percent == null || percent < 1 || percent > 99) {
            throw new IllegalArgumentException("Deposit percentage must be between 1 and 99");
        }
        return percent;
    }

    /** Amount due before dispatch, rounded once for the whole cart line. */
    public static BigDecimal upfrontForLine(BigDecimal lineTotal, String mode, Integer depositPercent) {
        if (lineTotal == null || lineTotal.signum() < 0) throw new IllegalArgumentException("Invalid line total");
        String normalized = normalize(mode);
        Integer validatedPercent = validatePercent(normalized, depositPercent);
        return switch (normalized) {
            case COD -> BigDecimal.ZERO.setScale(2);
            case PREPAID -> lineTotal.setScale(2, RoundingMode.HALF_UP);
            case DEPOSIT -> lineTotal.multiply(BigDecimal.valueOf(validatedPercent))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            default -> throw new IllegalArgumentException("Unsupported payment mode");
        };
    }
}
