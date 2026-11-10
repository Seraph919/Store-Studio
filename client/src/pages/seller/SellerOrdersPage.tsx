import React, { useState, useEffect, useMemo } from 'react'
import {
  Search,
  FileSpreadsheet,
  RefreshCw,
  AlertCircle,
  Truck,
  CheckCircle,
  XCircle,
  Phone,
  MapPin,
  Clock,
  Package,
} from 'lucide-react'
import { sellerApi } from '../../services/sellerApi'
import { formatPrice } from '../../utils/formatPrice'
import type { SellerOrder } from '../../types'

const STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export const SellerOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<SellerOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null)
  const [isExportingCsv, setIsExportingCsv] = useState(false)

  const loadOrders = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await sellerApi.getOrders()
      setOrders(data as SellerOrder[])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve seller orders.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleUpdateStatus = async (sellerOrderId: number, newStatus: string) => {
    setUpdatingOrderId(sellerOrderId)
    try {
      await sellerApi.updateSellerOrderStatus(sellerOrderId, { status: newStatus })
      // update local list
      setOrders((prev) =>
        prev.map((o) => (o.id === sellerOrderId ? { ...o, status: newStatus } : o))
      )
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update order status.')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const handleConfirmUpfront = async (sellerOrderId: number) => {
    if (!window.confirm('Have you independently verified receipt of the full required upfront payment? This action does not charge the customer.')) return
    setUpdatingOrderId(sellerOrderId)
    try {
      const updated = await sellerApi.confirmUpfrontPayment(sellerOrderId)
      setOrders(previous => previous.map(order => order.id === sellerOrderId ? { ...order, ...updated } : order))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Could not verify advance payment.')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const handleExportCsv = async () => {
    setIsExportingCsv(true)
    try {
      await sellerApi.exportOrdersCsv()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'CSV export failed.')
    } finally {
      setIsExportingCsv(false)
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus =
        filterStatus === 'ALL' || o.status?.toUpperCase() === filterStatus.toUpperCase()
      const q = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !q ||
        o.customerName?.toLowerCase().includes(q) ||
        o.phoneNumber?.toLowerCase().includes(q) ||
        o.city?.toLowerCase().includes(q) ||
        (o.publicOrderReference && o.publicOrderReference.toLowerCase().includes(q)) ||
        String(o.id).includes(q)
      return matchesStatus && matchesQuery
    })
  }, [orders, filterStatus, searchQuery])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)]">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--portal-accent-text)]">
            Fulfillment Logistics
          </span>
          <h1 className="text-2xl font-serif text-[var(--portal-text)] mt-1">Orders & Dispatch Registry</h1>
          <p className="text-xs text-[var(--portal-muted)] mt-1">
            Manage customer acquisitions, advance statuses, and coordinate carrier pickup.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadOrders}
            disabled={isLoading}
            className="p-2.5 bg-[var(--portal-surface-alt)] hover:bg-[var(--portal-hover)] text-[var(--portal-muted)] hover:text-[var(--portal-text)] rounded-xl border border-[var(--portal-border)] transition-colors"
            title="Refresh orders"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin text-[var(--portal-accent-text)]' : ''} />
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExportingCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--portal-surface-alt)] hover:bg-[var(--portal-hover)] text-[var(--portal-text)] font-semibold text-xs tracking-wider uppercase rounded-xl border border-[var(--portal-border)] transition-colors"
          >
            <FileSpreadsheet size={15} className="text-[var(--portal-success)]" />
            <span>{isExportingCsv ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[var(--portal-danger-soft)] border border-[var(--portal-danger-border)] rounded-xl flex items-center gap-3 text-xs text-[var(--portal-danger)]">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {STATUSES.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs tracking-wider uppercase transition-colors whitespace-nowrap font-medium ${
                filterStatus === st
                  ? 'bg-[var(--portal-accent)] text-[var(--portal-on-accent)] font-semibold'
                  : 'bg-[var(--portal-surface)] text-[var(--portal-muted)] hover:text-[var(--portal-text)] border border-[var(--portal-border)]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, city, ref..."
            className="w-full pl-9 pr-4 py-2 bg-[var(--portal-surface)] border border-[var(--portal-border)] rounded-xl text-xs text-[var(--portal-text)] placeholder-[var(--portal-placeholder)] focus:border-[var(--portal-accent)] focus:outline-none"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--portal-muted)]" />
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="p-16 text-center text-[var(--portal-accent-text)]">
          <div className="w-8 h-8 border-2 border-[var(--portal-accent-border)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs uppercase tracking-widest text-[var(--portal-muted)]">Loading registry...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)] text-[var(--portal-muted)]">
          <Package size={32} className="mx-auto mb-3 text-[var(--portal-placeholder)]" />
          <p className="text-sm">No orders found matching the selected filter or query.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => {
            const isUpdating = updatingOrderId === ord.id
            return (
              <div
                key={ord.id}
                className="bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)] p-6 hover:border-[var(--portal-accent-border)] transition-colors"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[var(--portal-border)] gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-mono font-bold text-[var(--portal-accent-text)]">
                      {ord.publicOrderReference || `ORDER #${ord.id}`}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        ord.status === 'DELIVERED'
                          ? 'bg-[var(--portal-success-soft)] text-[var(--portal-success)] border border-[var(--portal-success-border)]'
                          : ord.status === 'SHIPPED'
                          ? 'bg-[var(--portal-accent-soft)] text-[var(--portal-accent-text)] border border-[var(--portal-accent-border)]'
                          : ord.status === 'CANCELLED'
                          ? 'bg-[var(--portal-danger-soft)] text-[var(--portal-danger)] border border-[var(--portal-danger-border)]'
                          : 'bg-[var(--portal-accent-soft)] text-[var(--portal-accent-text)] border border-[var(--portal-accent-border)]'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[var(--portal-muted)] font-mono">
                    <Clock size={13} />
                    <span>{ord.createdAt ? new Date(ord.createdAt).toLocaleString() : ''}</span>
                  </div>
                </div>

                {/* Customer and Delivery Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-b border-[var(--portal-border)] text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[var(--portal-muted)] block mb-1">
                      Customer Info
                    </span>
                    <span className="text-[var(--portal-text)] font-medium block">{ord.customerName}</span>
                    <div className="flex items-center gap-1.5 text-[var(--portal-accent-text)] mt-1 font-mono">
                      <Phone size={12} />
                      <a href={`tel:${ord.phoneNumber}`} className="hover:underline">
                        {ord.phoneNumber}
                      </a>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <span className="text-[10px] uppercase font-mono text-[var(--portal-muted)] block mb-1">
                      Shipping Address
                    </span>
                    <div className="flex items-start gap-1.5 text-[var(--portal-text)]">
                      <MapPin size={13} className="text-[var(--portal-accent-text)] flex-shrink-0 mt-0.5" />
                      <span>{ord.shippingAddress}, {ord.city}</span>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="py-4">
                  <span className="text-[10px] uppercase font-mono text-[var(--portal-muted)] block mb-2">
                    Fulfillment Items ({ord.items?.length || 0})
                  </span>
                  <div className="space-y-2">
                    {ord.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-[var(--portal-surface-alt)] rounded-xl text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <Package size={15} className="text-[var(--portal-accent-text)]" />
                          <div>
                            <span className="text-[var(--portal-text)] font-medium block">
                              {item.productName || `Product #${item.productId}`}
                            </span>
                            <span className="text-[var(--portal-muted)] text-[11px]">
                              Qty: {item.quantity} × {formatPrice(item.unitPrice || 0)}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-[var(--portal-accent-text)] font-medium">
                          {formatPrice(item.subtotal || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Owner verification is manual until a payment gateway is integrated. */}
                <div className="py-4 border-t border-[var(--portal-border)] text-xs space-y-2">
                  <p className="font-semibold text-[var(--portal-text)]">Payment terms</p>
                  <div className="flex flex-wrap gap-5 text-[var(--portal-muted)]">
                    <span>Before dispatch: <strong className="text-[var(--portal-text)]">{formatPrice(ord.upfrontAmount ?? 0)}</strong></span>
                    <span>On delivery: <strong className="text-[var(--portal-text)]">{formatPrice(ord.deliveryAmount ?? ord.subtotal)}</strong></span>
                  </div>
                  {(ord.upfrontAmount ?? 0) > 0 && (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={ord.upfrontPaymentConfirmed ? 'text-[var(--portal-success)]' : 'text-[var(--portal-muted)]'}>
                        {ord.upfrontPaymentConfirmed ? 'Advance payment confirmed' : 'Advance payment not confirmed. Do not dispatch.'}
                      </span>
                      {!ord.upfrontPaymentConfirmed && ord.status !== 'CANCELLED' && (
                        <button type="button" disabled={isUpdating} onClick={() => handleConfirmUpfront(ord.id)}
                          className="px-3 py-2 rounded-lg border border-[var(--portal-accent-border)] bg-[var(--portal-accent-soft)] text-[var(--portal-accent-text)] disabled:opacity-50">
                          Mark upfront payment received
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Actions & Subtotal */}
                <div className="pt-4 border-t border-[var(--portal-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-[var(--portal-muted)]">Your Atelier Subtotal:</span>
                    <span className="text-base font-serif font-bold text-[var(--portal-accent-text)]">
                      {formatPrice(ord.subtotal)}
                    </span>
                  </div>

                  {/* Status Transition Buttons */}
                  <div className="flex items-center gap-2">
                    {(ord.upfrontAmount ?? 0) > 0 && !ord.upfrontPaymentConfirmed && ord.status === 'PENDING' && (
                      <button type="button" disabled={isUpdating} onClick={() => handleUpdateStatus(ord.id, 'CANCELLED')}
                        className="px-3 py-2 rounded-lg border border-[var(--portal-danger-border)] bg-[var(--portal-danger-soft)] text-[var(--portal-danger)] disabled:opacity-50">
                        Cancel unpaid order
                      </button>
                    )}
                    {ord.status === 'PENDING' && ((ord.upfrontAmount ?? 0) === 0 || ord.upfrontPaymentConfirmed) && (
                      <>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(ord.id, 'CONFIRMED')}
                          className="px-3.5 py-1.5 bg-[var(--portal-accent)] hover:bg-[var(--portal-accent)] text-[var(--portal-on-accent)] font-semibold text-xs tracking-wider uppercase rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <CheckCircle size={13} />
                          <span>Confirm</span>
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(ord.id, 'CANCELLED')}
                          className="px-3 py-1.5 bg-[var(--portal-danger-soft)] hover:bg-[var(--portal-danger-soft)] text-[var(--portal-danger)] border border-[var(--portal-danger-border)] text-xs tracking-wider uppercase rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <XCircle size={13} />
                          <span>Cancel</span>
                        </button>
                      </>
                    )}

                    {ord.status === 'CONFIRMED' && ((ord.upfrontAmount ?? 0) === 0 || ord.upfrontPaymentConfirmed) && (
                      <>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(ord.id, 'SHIPPED')}
                          className="px-3.5 py-1.5 bg-[var(--portal-accent)] hover:bg-[var(--portal-accent)] text-[var(--portal-on-accent)] font-semibold text-xs tracking-wider uppercase rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Truck size={13} />
                          <span>Mark Shipped</span>
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(ord.id, 'CANCELLED')}
                          className="px-3 py-1.5 bg-[var(--portal-danger-soft)] hover:bg-[var(--portal-danger-soft)] text-[var(--portal-danger)] border border-[var(--portal-danger-border)] text-xs tracking-wider uppercase rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <XCircle size={13} />
                          <span>Cancel</span>
                        </button>
                      </>
                    )}

                    {ord.status === 'SHIPPED' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(ord.id, 'DELIVERED')}
                        className="px-3.5 py-1.5 bg-[var(--portal-success-strong)] hover:bg-[var(--portal-success-strong)] text-white font-semibold text-xs tracking-wider uppercase rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <CheckCircle size={13} />
                        <span>Confirm Delivery</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SellerOrdersPage
