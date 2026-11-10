import React from 'react'
import { X, Trash2, ShoppingBag, ArrowRight, Shield } from 'lucide-react'
import { useCart } from '../context/useCart'
import { formatPrice } from '../utils/formatPrice'
import { useStoreSettingsQuery } from '../hooks/useStoreQueries'
import { shippingCharge, shippingLabel } from '../utils/shipping'
import { paymentModeLabel } from '../utils/paymentTerms'

interface CartDrawerProps {
  onProceedToCheckout: () => void
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const { cart, isCartOpen, closeCart, updateQuantity, removeItem, isLoading } = useCart()
  const {data: shippingPolicy} = useStoreSettingsQuery()

  if (!isCartOpen) return null

  const items = cart?.items || []
  const totalPrice = cart?.totalPrice || 0
  const deliveryFee = shippingCharge(totalPrice, shippingPolicy)

  return (
    <div className="cart-backdrop" onClick={closeCart} role="dialog" aria-modal="true">
      <div className="cart-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-title-box">
            <h2 className="drawer-title">Your cart ({items.length})</h2>
          </div>
          <button className="icon-button" onClick={closeCart} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* Drawer Items */}
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="cart-empty-view">
              <ShoppingBag size={48} className="empty-bag-icon" />
              <h3>Your cart is empty</h3>
              <p>Add a product to start your order.</p>
              <button className="btn-luxury-secondary" onClick={closeCart}>
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map((item) => {
                const unitPrice = item.unitPrice ?? item.price ?? 0
                const itemSubtotal = item.subtotal ?? item.itemTotalPrice ?? unitPrice * item.quantity

                return (
                  <div key={item.id || item.productId} className="cart-item-card">
                    <div className="cart-item-details">
                      <div className="cart-item-header">
                        <h4 className="cart-item-name">{item.productName || `Product #${item.productId}`}</h4>
                        <button
                          type="button"
                          className="cart-remove-btn"
                          onClick={() => removeItem(item.productId)}
                          disabled={isLoading}
                          title="Remove from cart"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="cart-item-price-row">
                        <span className="cart-unit-price">{formatPrice(unitPrice)}</span>
                        <span className="cart-item-subtotal">{formatPrice(itemSubtotal)}</span>
                      </div>

                      <div className="text-xs text-[var(--store-text-muted)] mt-2">{paymentModeLabel(item.paymentMode, item.depositPercent)}</div>
                      <div className="cart-item-actions">
                        <div className="qty-selector small">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={isLoading}
                          >
                            -
                          </button>
                          <span className="qty-val">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={isLoading}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="drawer-footer">
            <div className="subtotal-row">
              <span className="subtotal-label">Products subtotal</span>
              <span className="subtotal-amount">{formatPrice(totalPrice)}</span>
            </div>

            <div className="shipping-notice">
              <Shield size={14} className="notice-icon text-gold" />
              <span>{shippingLabel(totalPrice, shippingPolicy)} · See payment breakdown at checkout.</span>
            </div>
            {shippingPolicy && <div className="subtotal-row"><span className="subtotal-label">Estimated total</span>
              <span className="subtotal-amount">{formatPrice(totalPrice + deliveryFee)}</span></div>}

            <button
              type="button"
              className="btn-luxury-cta full-width"
              onClick={() => {
                closeCart()
                onProceedToCheckout()
              }}
            >
              <span>Checkout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
export default CartDrawer
