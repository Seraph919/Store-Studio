package org.storestudio.store.services;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

class PaymentTermsTest {
    @Test void codIsDueOnDelivery() {
        assertEquals(new BigDecimal("0.00"), PaymentTerms.upfrontForLine(new BigDecimal("750.00"), "COD", null));
    }
    @Test void fullPrepaymentIsEntireProductLine() {
        assertEquals(new BigDecimal("599.00"), PaymentTerms.upfrontForLine(new BigDecimal("599"), "PREPAID", null));
    }
    @Test void depositIsRoundedPerOrderLine() {
        assertEquals(new BigDecimal("69.94"), PaymentTerms.upfrontForLine(new BigDecimal("199.82"), "DEPOSIT", 35));
    }
    @Test void rejectsInvalidModesAndPercentages() {
        assertThrows(IllegalArgumentException.class, () -> PaymentTerms.normalize("CARD"));
        assertThrows(IllegalArgumentException.class, () -> PaymentTerms.validatePercent("DEPOSIT", 0));
        assertThrows(IllegalArgumentException.class, () -> PaymentTerms.validatePercent("DEPOSIT", 100));
        assertNull(PaymentTerms.validatePercent("COD", null));
    }
}
