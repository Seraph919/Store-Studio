import { StoreImage } from '../storefront/components/StoreImage'
import React, { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ShieldCheck,
  Truck,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  Lock,
  Package,
} from 'lucide-react'
import { useCart } from '../context/useCart'
import { useAuth } from '../context/useAuth'
import { orderApi } from '../services/orderApi'
import { formatPrice } from '../utils/formatPrice'
import { useStoreSettingsQuery } from '../hooks/useStoreQueries'
import { shippingCharge, shippingLabel } from '../utils/shipping'
import { cartPaymentBreakdown, paymentModeLabel } from '../utils/paymentTerms'
import type { CreateOrderRequest } from '../types'

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const { cart, cartId, resetCart } = useCart()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    guestName: user?.name || '',
    guestEmail: user?.email || '',
    phoneNumber: '',
    shippingAddress: '',
    city: '',
  })

  const submitting = useRef(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: shippingPolicy, isLoading: shippingLoading, isError: shippingError } = useStoreSettingsQuery()
  const items = cart?.items || []
  const subtotal = cart?.totalPrice || 0
  const deliveryFee = shippingCharge(subtotal, shippingPolicy)
  const totalPrice = subtotal + deliveryFee
  const paymentBreakdown = cartPaymentBreakdown(items, deliveryFee)

  if (!cart || items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-full bg-[var(--store-surface-subtle)] border border-[var(--store-border)] flex items-center justify-center text-[var(--store-accent)] mb-4">
          <ShoppingBag size={28} />
        </div>
        <h2 className="text-2xl font-serif text-[var(--store-text)] mb-2">Your bag is empty</h2>
        <p className="text-sm text-[var(--store-text-muted)] mb-6 max-w-md">
          Browse the shop and add products before proceeding to checkout.
        </p>
        <Link
          to="/shop"
          className="px-6 py-3 bg-[var(--store-accent)] hover:brightness-90 text-[var(--store-accent-text)] font-semibold text-xs uppercase tracking-widest rounded-lg transition-colors"
        >
          Browse products
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting.current) return
    setError(null)

    if (!shippingPolicy || shippingError) {
      setError('Shipping information is unavailable. Please retry before ordering.')
      return
    }
    if (!cartId) {
      setError('Active shopping cart not identified. Please refresh or add items again.')
      return
    }

    if (
      !formData.guestName.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.shippingAddress.trim() ||
      !formData.city.trim()
    ) {
      setError('Please fill in all required fields.')
      return
    }

    submitting.current = true
    setIsLoading(true)
    try {
      const orderPayload: CreateOrderRequest = {
        cartId,
        guestName: formData.guestName.trim(),
        guestEmail: formData.guestEmail.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        shippingAddress: formData.shippingAddress.trim(),
        city: formData.city.trim(),
      }

      const createdOrder = await orderApi.createOrder(orderPayload)
      // The order already exists. Cart cleanup must never turn it into a failed checkout.
      try {
        resetCart()
      } catch {
        // Browser storage may be unavailable. The confirmed order still takes priority.
      }
      navigate('/order/success', { replace: true, state: { order: createdOrder } })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to place order. Please try again.')
      submitting.current = false
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-10 pb-16 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-[0.25em] text-[var(--store-accent)] font-semibold">
          Checkout
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif text-[var(--store-text)] mt-2">
          Delivery details
        </h1>
        <p className="text-xs text-[var(--store-text-muted)] mt-2 tracking-wide">
          {shippingPolicy ? shippingLabel(subtotal, shippingPolicy) : 'Checking delivery rules...'} · Payment terms depend on the items in your cart
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-8 p-4 bg-[#ef4444]/15 border border-[#ef4444]/30 rounded-xl flex items-center gap-3 text-xs text-[#f87171]">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Form Column (7 cols) */}
        <div className="lg:col-span-7 bg-[var(--store-surface)] p-6 sm:p-8 rounded-2xl border border-[var(--store-border)]">
          <h2 className="text-lg font-serif text-[var(--store-text)] mb-6 flex items-center gap-2">
            <Truck size={18} className="text-[var(--store-accent)]" />
            <span>Contact and delivery address</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="checkoutpage-field-1" className="block text-xs uppercase tracking-wider text-[var(--store-text-muted)] mb-1.5 font-medium">
                Full Name *
              </label>
              <input id="checkoutpage-field-1" autoComplete="name"
                type="text"
                required
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                placeholder="e.g. Kenza Bennani"
                className="w-full px-4 py-3 bg-[var(--store-surface-subtle)] border border-[var(--store-border)] rounded-lg text-sm text-[var(--store-text)] placeholder-[#5a606b] focus:border-[var(--store-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--store-text)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkoutpage-field-2" className="block text-xs uppercase tracking-wider text-[var(--store-text-muted)] mb-1.5 font-medium">
                  Phone Number (for Courier & WhatsApp) *
                </label>
                <input id="checkoutpage-field-2" autoComplete="tel"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="06 12 34 56 78"
                  className="w-full px-4 py-3 bg-[var(--store-surface-subtle)] border border-[var(--store-border)] rounded-lg text-sm text-[var(--store-text)] placeholder-[#5a606b] focus:border-[var(--store-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--store-text)]"
                />
              </div>

              <div>
                <label htmlFor="checkoutpage-field-3" className="block text-xs uppercase tracking-wider text-[var(--store-text-muted)] mb-1.5 font-medium">
                  Email address (optional)
                </label>
                <input id="checkoutpage-field-3" autoComplete="email"
                  type="email"
                  value={formData.guestEmail}
                  onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                  placeholder="client@example.com"
                  className="w-full px-4 py-3 bg-[var(--store-surface-subtle)] border border-[var(--store-border)] rounded-lg text-sm text-[var(--store-text)] placeholder-[#5a606b] focus:border-[var(--store-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--store-text)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="checkoutpage-field-4" className="block text-xs uppercase tracking-wider text-[var(--store-text-muted)] mb-1.5 font-medium">
                  Street Address & Apartment *
                </label>
                <input id="checkoutpage-field-4" autoComplete="street-address"
                  type="text"
                  required
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                  placeholder="Boulevard d'Anfa, Résidence Al Amal, Casablanca"
                  className="w-full px-4 py-3 bg-[var(--store-surface-subtle)] border border-[var(--store-border)] rounded-lg text-sm text-[var(--store-text)] placeholder-[#5a606b] focus:border-[var(--store-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--store-text)]"
                />
              </div>

              <div>
                <label htmlFor="checkoutpage-field-5" className="block text-xs uppercase tracking-wider text-[var(--store-text-muted)] mb-1.5 font-medium">
                  City *
                </label>
                <input id="checkoutpage-field-5" autoComplete="address-level2"
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Casablanca"
                  className="w-full px-4 py-3 bg-[var(--store-surface-subtle)] border border-[var(--store-border)] rounded-lg text-sm text-[var(--store-text)] placeholder-[#5a606b] focus:border-[var(--store-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--store-text)]"
                />
              </div>
            </div>

            {/* Authoritative order totals are recalculated by the backend. */}
            <div className="p-4 bg-[var(--store-surface-subtle)] border border-[var(--store-border)] rounded-xl mt-6 space-y-3">
              <p className="text-sm font-semibold text-[var(--store-text)] flex items-center gap-2"><ShieldCheck size={16} className="text-[var(--store-accent)]" /> Payment breakdown</p>
              <div className="flex justify-between text-sm text-[var(--store-text)]"><span>Required before dispatch</span><strong>{formatPrice(paymentBreakdown.upfront)}</strong></div>
              <div className="flex justify-between text-sm text-[var(--store-text)]"><span>Due to the courier</span><strong>{formatPrice(paymentBreakdown.delivery)}</strong></div>
              <p className="text-xs text-[var(--store-text-muted)] leading-relaxed">
                {paymentBreakdown.upfront > 0
                  ? 'The seller will contact you with payment instructions. Your order ships after the seller confirms the advance payment. No payment is taken on this site.'
                  : 'Pay the amount due when your order is delivered. No online payment is collected.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || shippingLoading || !shippingPolicy || shippingError}
              className="w-full mt-6 py-4 bg-[var(--store-accent)] hover:brightness-90 text-[var(--store-accent-text)] font-semibold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#ca8a04]/20 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Placing your order...</span>
                </>
              ) : (
                <>
                  <Lock size={15} />
                  <span>Place order · {formatPrice(totalPrice)}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[var(--store-surface)] p-6 sm:p-8 rounded-2xl border border-[var(--store-border)]">
            <h2 className="text-lg font-serif text-[var(--store-text)] mb-6 flex items-center gap-2">
              <Package size={18} className="text-[var(--store-accent)]" />
              <span>Order summary ({items.length} items)</span>
            </h2>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-[var(--store-border)] last:border-0">
                  <div className="w-14 h-14 rounded-lg bg-[var(--store-surface-subtle)] border border-[var(--store-border)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.thumbnailUrl ? (
                      <StoreImage src={item.thumbnailUrl} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag size={18} className="text-[var(--store-accent)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs text-[var(--store-text)] font-medium truncate">{item.productName}</h4>
                    <span className="text-[11px] text-[var(--store-text-muted)]">
                      Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                    </span>
                    <span className="block text-[10px] mt-1 text-[var(--store-text-muted)]">{paymentModeLabel(item.paymentMode, item.depositPercent)}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-medium text-[var(--store-accent)]">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-[var(--store-border)] text-xs">
              <div className="flex justify-between text-[var(--store-text-muted)]">
                <span>Subtotal</span>
                <span className="font-mono text-[var(--store-text)]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--store-text-muted)]">
                <span>Shipping</span>
                <span className="font-medium text-[var(--store-text)]">{shippingPolicy ? (deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)) : 'Calculating...'}</span>
              </div>
              <div className="flex justify-between text-[var(--store-text)] text-base font-serif pt-3 border-t border-[var(--store-border)]">
                <span>Order total</span>
                <span className="text-[var(--store-accent)] font-semibold font-mono">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-[var(--store-text)] pt-2"><span>Before dispatch</span><span>{formatPrice(paymentBreakdown.upfront)}</span></div>
              <div className="flex justify-between text-[var(--store-text)]"><span>On delivery</span><span>{formatPrice(paymentBreakdown.delivery)}</span></div>
            </div>
          </div>

          <div className="p-5 bg-[var(--store-surface)] rounded-2xl border border-[var(--store-border)] space-y-3 text-xs text-[var(--store-text-muted)]">
            <div className="flex items-center gap-3 text-[var(--store-text)]">
              <ShieldCheck size={16} className="text-[var(--store-accent)]" />
              <span className="font-medium">Order information</span>
            </div>
            <p>We record your order request and send it to the seller. The seller will contact you to confirm the delivery and any required advance payment.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
