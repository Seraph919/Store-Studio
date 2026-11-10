import type { CartItem, PaymentMode } from '../types'

export const paymentModeLabel = (mode?: PaymentMode, percent?: number | null): string => {
  if (mode === 'PREPAID') return 'Full payment before delivery'
  if (mode === 'DEPOSIT') return `${percent ?? 0}% deposit + balance on delivery`
  return 'Cash on delivery'
}

/** Estimates match the backend's per-line rounding; server remains authoritative. */
export const cartPaymentBreakdown = (items: CartItem[], shippingFee: number) => {
  const allPrepaid = items.length > 0 && items.every(item => item.paymentMode === 'PREPAID')
  const productUpfrontCents = items.reduce((sum, item) => {
    const lineCents = Math.round((item.unitPrice ?? item.price ?? 0) * item.quantity * 100)
    const mode = item.paymentMode ?? 'COD'
    if (mode === 'PREPAID') return sum + lineCents
    if (mode === 'DEPOSIT') return sum + Math.round(lineCents * (item.depositPercent ?? 0) / 100)
    return sum
  }, 0)
  const shippingCents = Math.round(shippingFee * 100)
  const subtotalCents = items.reduce((sum, item) => sum + Math.round((item.unitPrice ?? item.price ?? 0) * item.quantity * 100), 0)
  const upfrontCents = productUpfrontCents + (allPrepaid ? shippingCents : 0)
  return { upfront: upfrontCents / 100, delivery: (subtotalCents + shippingCents - upfrontCents) / 100 }
}
