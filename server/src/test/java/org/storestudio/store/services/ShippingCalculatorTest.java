package org.storestudio.store.services;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

class ShippingCalculatorTest {
  @Test void freeMode() {
    assertEquals(BigDecimal.ZERO, ShippingCalculator.calculate(new BigDecimal("100"), "FREE", new BigDecimal("25"), null));
  }
  @Test void flatMode() {
    assertEquals(new BigDecimal("25"), ShippingCalculator.calculate(new BigDecimal("100"), "FLAT", new BigDecimal("25"), null));
  }
  @Test void freeAboveThresholdIncludingBoundary() {
    assertEquals(new BigDecimal("25"), ShippingCalculator.calculate(new BigDecimal("99"), "FREE_ABOVE", new BigDecimal("25"), new BigDecimal("100")));
    assertEquals(BigDecimal.ZERO, ShippingCalculator.calculate(new BigDecimal("100"), "FREE_ABOVE", new BigDecimal("25"), new BigDecimal("100")));
  }
  @Test void rejectsMissingThreshold() {
    assertThrows(IllegalArgumentException.class, () -> ShippingCalculator.calculate(BigDecimal.TEN, "FREE_ABOVE", BigDecimal.ONE, null));
  }
}
