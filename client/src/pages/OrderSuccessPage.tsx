import React, { useEffect, useRef } from 'react'
import { useLocation, Link, Navigate } from 'react-router-dom'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import type { Order } from '../types'
import { formatPrice } from '../utils/formatPrice'

export const OrderSuccessPage: React.FC = () => {
  const location = useLocation()
  const order: Order | undefined = location.state?.order
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!order) return
    const previousTitle = document.title
    document.title = 'Order received'
    heading.current?.focus({ preventScroll: true })
    return () => { document.title = previousTitle }
  }, [order])

  if (!order) return <Navigate to="/shop" replace />

  const publicRef = order.publicOrderReference || `ORD-${order.id}`
  const upfront = order.upfrontAmount ?? 0
  const delivery = order.deliveryAmount ?? Math.max(0, order.totalPrice - upfront)
  const status = order.status === 'PENDING' || !order.status
    ? 'Awaiting confirmation'
    : order.status.toLowerCase().replaceAll('_', ' ')
  const actionClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--store-border)] px-5 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--store-text)]'

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12 md:px-8">
      <div className="overflow-hidden rounded-2xl border border-[var(--store-border)] bg-[var(--store-surface)] text-[var(--store-text)] shadow-sm">
        <header className="border-b border-[var(--store-border)] px-5 py-7 sm:px-8 sm:py-9">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--store-surface-subtle)]">
            <CheckCircle2 size={26} aria-hidden="true" />
          </div>
          <h1 ref={heading} tabIndex={-1} className="text-3xl sm:text-4xl focus-visible:outline-2 focus-visible:outline-offset-4">
            Order received
          </h1>
          <p className="mt-3 text-base leading-relaxed">
            Thank you{order.guestName?.trim() ? `, ${order.guestName.trim()}` : ''}. The seller will contact you to confirm your order and delivery details.
          </p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-sm text-[var(--store-text-muted)]">Order reference</dt>
              <dd className="mt-1 break-all font-mono text-base font-semibold">{publicRef}</dd>
            </div>
            <div>
              <dt className="text-sm text-[var(--store-text-muted)]">Order status</dt>
              <dd className="mt-1 text-base font-medium first-letter:uppercase">{status}</dd>
            </div>
          </dl>
        </header>

        <div className="space-y-7 px-5 py-6 sm:px-8">
          <section>
            <h2 className="text-lg font-semibold">Your order</h2>
            {order.items?.length > 0 && (
              <ul className="mt-3 divide-y divide-[var(--store-border)]" role="list">
                {order.items.map((item, index) => (
                  <li key={item.id ?? `${item.productId}-${index}`} className="flex items-start justify-between gap-4 py-3 text-sm">
                    <div className="min-w-0 break-words">
                      <p className="font-medium">{item.productName || 'Product'}</p>
                      <p className="mt-1 text-[var(--store-text-muted)]">Quantity: {item.quantity}</p>
                    </div>
                    <span className="shrink-0 font-medium">{formatPrice(item.subtotal ?? (item.unitPrice ?? item.price ?? 0) * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            )}
            <dl className="mt-3 space-y-3 border-t border-[var(--store-border)] pt-4 text-sm">
              <div className="flex justify-between gap-4"><dt>Delivery</dt><dd>{formatPrice(order.shippingFee ?? 0)}</dd></div>
              <div className="flex justify-between gap-4 text-base font-semibold"><dt>Order total</dt><dd>{formatPrice(order.totalPrice)}</dd></div>
            </dl>
          </section>

          <section className="rounded-xl border border-[var(--store-border)] bg-[var(--store-surface-subtle)] p-4 sm:p-5">
            <h2 className="text-lg font-semibold">Payment</h2>
            <dl className="mt-3 space-y-3 text-sm">
              {upfront > 0 && <div className="flex justify-between gap-4"><dt>Before dispatch</dt><dd className="font-semibold">{formatPrice(upfront)}</dd></div>}
              <div className="flex justify-between gap-4"><dt>On delivery</dt><dd className="font-semibold">{formatPrice(delivery)}</dd></div>
            </dl>
            <p className="mt-4 text-sm leading-relaxed">
              {upfront > 0
                ? 'No online payment was taken. Wait for the seller to provide payment instructions before paying.'
                : 'No payment was taken. Pay when your order arrives.'}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Delivery details</h2>
            <dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
              <div className="min-w-0"><dt className="text-[var(--store-text-muted)]">Address</dt><dd className="mt-1 break-words leading-relaxed">{order.shippingAddress}<br />{order.city}</dd></div>
              <div className="min-w-0"><dt className="text-[var(--store-text-muted)]">Phone number</dt><dd className="mt-1 break-words">{order.phoneNumber}</dd></div>
            </dl>
          </section>

          <div className="border-t border-[var(--store-border)] pt-5">
            <p className="mb-4 text-sm text-[var(--store-text-muted)]">Save your order reference for questions about this order.</p>
            <div className="flex flex-col gap-3 sm:flex-row print:hidden">
              <Link to="/shop" className={`${actionClass} bg-[var(--store-accent)] text-[var(--store-accent-text)] hover:brightness-95`}>
                Continue shopping <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccessPage
