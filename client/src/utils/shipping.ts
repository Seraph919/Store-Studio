import type { StoreSettings } from '../services/settingsApi'

/** Customer estimate; the backend ALWAYS recomputes and snapshots the actual charge. */
export function shippingCharge(subtotal: number, policy?: StoreSettings): number {
  if (!policy || (policy.shippingMode ?? 'FREE') === 'FREE') return 0
  const fee = Math.max(0, Number(policy.shippingFee) || 0)
  if (policy.shippingMode === 'FREE_ABOVE' && policy.freeShippingThreshold != null &&
      subtotal >= Number(policy.freeShippingThreshold)) return 0
  return fee
}
export function shippingLabel(subtotal: number, policy?: StoreSettings): string {
  if (!policy) return 'Shipping calculated at checkout'
  if (shippingCharge(subtotal, policy) === 0) return 'Free shipping'
  const fee = shippingCharge(subtotal, policy)
  if (policy.shippingMode === 'FREE_ABOVE' && policy.freeShippingThreshold) {
    return `Shipping ${fee.toFixed(2)} MAD · Free from ${Number(policy.freeShippingThreshold).toFixed(2)} MAD`
  }
  return `Shipping ${fee.toFixed(2)} MAD`
}
