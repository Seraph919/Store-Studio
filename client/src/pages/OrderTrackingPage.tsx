import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react'
import { orderApi } from '../services/orderApi'
import { formatPrice } from '../utils/formatPrice'
import type { OrderTracking, TrackingItem } from '../types'

export const OrderTrackingPage: React.FC = () => {
  const { trackingToken: urlToken } = useParams<{ trackingToken?: string }>()
  const navigate = useNavigate()

  const [inputToken, setInputToken] = useState(urlToken || '')
  const [trackingData, setTrackingData] = useState<OrderTracking | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTracking = async (token: string) => {
    if (!token.trim()) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await orderApi.trackOrder(token.trim())
      setTrackingData(data)
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to locate order with this tracking reference. Please verify your token.'
      )
      setTrackingData(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (urlToken) {
      setInputToken(urlToken)
      fetchTracking(urlToken)
    }
  }, [urlToken])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputToken.trim()) return
    navigate(`/track/${encodeURIComponent(inputToken.trim())}`)
  }

  const getStatusStep = (status: string) => {
    const s = status.toUpperCase()
    if (s === 'CANCELLED') return -1
    if (s === 'DELIVERED') return 4
    if (s === 'SHIPPED') return 3
    if (s === 'PROCESSING' || s === 'CONFIRMED') return 2
    return 1 // PENDING
  }

  const step = trackingData ? getStatusStep(trackingData.status) : 0

  return (
    <div className="min-h-screen pt-10 pb-16 px-4 md:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-[0.25em] text-[var(--store-accent)] font-semibold">
          Live Dispatch Concierge
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif text-[var(--store-text)] mt-2">
          Track Your Atelier Order
        </h1>
        <p className="text-xs text-[var(--store-text-muted)] mt-2 max-w-md mx-auto">
          Enter your unguessable tracking code or public order reference to view fulfillment status.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-10 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            required
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            placeholder="Enter tracking token (e.g. 550e8400-e29b-...)"
            className="w-full pl-10 pr-4 py-3 bg-[var(--store-surface)] border border-[var(--store-border)] rounded-xl text-sm text-[var(--store-text)] placeholder-[#5a606b] focus:border-[#ca8a04] focus:outline-none"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--store-text-muted)]" />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-[var(--store-accent)] hover:brightness-90 text-black font-semibold text-xs uppercase tracking-widest rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
          <span>Track</span>
        </button>
      </form>

      {error && (
        <div className="max-w-xl mx-auto mb-10 p-4 bg-[#ef4444]/15 border border-[#ef4444]/30 rounded-xl flex items-center gap-3 text-xs text-[#f87171]">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tracking Result */}
      {trackingData && (
        <div className="bg-[var(--store-surface)] rounded-3xl border border-[var(--store-border)] p-6 sm:p-10 shadow-xl space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--store-border)] gap-4">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--store-text-muted)]">
                Public Reference
              </span>
              <h2 className="text-xl sm:text-2xl font-mono font-bold text-[var(--store-accent)] mt-0.5">
                {trackingData.publicOrderReference}
              </h2>
              <div className="flex items-center gap-3 text-xs text-[var(--store-text-muted)] mt-1 font-mono">
                <Clock size={12} />
                <span>Placed on {new Date(trackingData.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <MapPin size={12} />
                <span>Destination: {trackingData.city}</span>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--store-text-muted)]">
                Order Status
              </span>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    trackingData.status === 'CANCELLED'
                      ? 'bg-[#ef4444]/15 text-[#f87171] border border-[#ef4444]/30'
                      : trackingData.status === 'DELIVERED'
                      ? 'bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30'
                      : 'bg-[var(--store-accent)]/15 text-[var(--store-accent)] border border-[#ca8a04]/30'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {trackingData.status}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Timeline */}
          {trackingData.status !== 'CANCELLED' && (
            <div className="py-4">
              <div className="grid grid-cols-4 gap-2 relative">
                {[
                  { title: 'Registered', icon: Package, s: 1 },
                  { title: 'Confirmed', icon: CheckCircle2, s: 2 },
                  { title: 'Dispatched', icon: Truck, s: 3 },
                  { title: 'Delivered', icon: CheckCircle2, s: 4 },
                ].map((item, idx) => {
                  const Icon = item.icon
                  const isDone = step >= item.s
                  const isCurrent = step === item.s
                  return (
                    <div key={idx} className="flex flex-col items-center text-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors mb-2 ${
                          isDone
                            ? 'bg-[var(--store-accent)] border-[#ca8a04] text-black font-bold'
                            : 'bg-[var(--store-surface-subtle)] border-[var(--store-border)] text-[#5a606b]'
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <span
                        className={`text-xs font-medium tracking-wider ${
                          isCurrent ? 'text-[var(--store-accent)]' : isDone ? 'text-[var(--store-text)]' : 'text-[#5a606b]'
                        }`}
                      >
                        {item.title}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Items Breakdown */}
          <div>
            <h3 className="text-sm font-serif text-[var(--store-text)] mb-4 flex items-center gap-2">
              <ShoppingBag size={15} className="text-[var(--store-accent)]" />
              <span>Pieces in this Parcel</span>
            </h3>

            <div className="space-y-3">
              {trackingData.items.map((item: TrackingItem, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-[var(--store-surface-subtle)] border border-[var(--store-border)] rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#202227] overflow-hidden flex items-center justify-center">
                      {item.thumbnailUrl ? (
                        <img src={item.thumbnailUrl} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={16} className="text-[var(--store-accent)]" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-[var(--store-text)]">{item.productName}</h4>
                      <span className="text-[11px] text-[var(--store-text-muted)]">
                        Quantity: {item.quantity} × {formatPrice(item.unitPrice)}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[var(--store-accent)]">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--store-border)] flex justify-between items-center text-sm font-serif">
              <span className="text-[var(--store-text-muted)]">Total Due on Delivery</span>
              <span className="text-lg font-mono font-bold text-[var(--store-accent)]">
                {formatPrice(trackingData.totalPrice)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderTrackingPage
