import React, { useState, useEffect, useMemo } from 'react'
import {
  MessageSquareQuote,
  Star,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { feedbackApi } from '../../services/feedbackApi'
import type { Feedback } from '../../types'

export const SellerReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterRating, setFilterRating] = useState<number | 'ALL'>('ALL')
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const loadReviews = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await feedbackApi.getMySellerReviews()
      setReviews(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not load reviews.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  const handleToggleVisibility = async (reviewId: number) => {
    setTogglingId(reviewId)
    try {
      const updated = await feedbackApi.toggleVisibility(reviewId)
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, isVisible: updated.isVisible } : r))
      )
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update review visibility.')
    } finally {
      setTogglingId(null)
    }
  }

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (filterRating === 'ALL') return true
      return r.rating === filterRating
    })
  }, [reviews, filterRating])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)]">
        <div>
          <h1 className="text-2xl font-serif text-[var(--portal-text)] mt-1">Product reviews</h1>
          <p className="text-sm leading-relaxed text-[var(--portal-muted)] mt-2">
            Read customer reviews and choose which ones appear in your store.
          </p>
        </div>

        <button
          type="button"
          onClick={loadReviews}
          disabled={isLoading}
          className="p-2.5 bg-[var(--portal-surface-alt)] hover:bg-[var(--portal-hover)] text-[var(--portal-muted)] hover:text-[var(--portal-text)] rounded-xl border border-[var(--portal-border)] transition-colors self-start sm:self-auto"
          title="Refresh reviews"
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin text-[var(--portal-accent-text)]' : ''} />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-[var(--portal-danger-soft)] border border-[var(--portal-danger-border)] rounded-xl flex items-center gap-3 text-xs text-[var(--portal-danger)]">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Rating Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {(['ALL', 5, 4, 3, 2, 1] as const).map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFilterRating(star)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              filterRating === star
                ? 'bg-[var(--portal-accent)] text-[var(--portal-on-accent)] font-semibold'
                : 'bg-[var(--portal-surface)] text-[var(--portal-muted)] hover:text-[var(--portal-text)] border border-[var(--portal-border)]'
            }`}
          >
            {star === 'ALL' ? (
              <span>All reviews ({reviews.length})</span>
            ) : (
              <>
                <span>{star}</span>
                <Star size={11} fill="currentColor" />
              </>
            )}
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      {isLoading ? (
        <div className="p-16 text-center text-[var(--portal-accent-text)]">
          <div className="w-8 h-8 border-2 border-[var(--portal-accent-border)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs text-[var(--portal-muted)]">Loading reviews...</span>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-12 text-center bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)] text-[var(--portal-muted)]">
          <MessageSquareQuote size={32} className="mx-auto mb-3 text-[var(--portal-placeholder)]" />
          <p className="text-sm">No reviews found for this selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((rev) => {
            const isToggling = togglingId === rev.id
            return (
              <div
                key={rev.id}
                className="bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)] p-5 flex flex-col justify-between hover:border-[var(--portal-accent-border)] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-[var(--portal-accent-text)]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          fill={i < rev.rating ? 'currentColor' : 'none'}
                          className={i < rev.rating ? 'text-[var(--portal-accent-text)]' : 'text-[var(--portal-placeholder)]'}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={isToggling}
                      onClick={() => handleToggleVisibility(rev.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                        rev.isVisible !== false
                          ? 'bg-[var(--portal-success-soft)] text-[var(--portal-success)] border border-[var(--portal-success-border)]'
                          : 'bg-[var(--portal-danger-soft)] text-[var(--portal-danger)] border border-[var(--portal-danger-border)]'
                      }`}
                      title="Toggle storefront display"
                    >
                      {rev.isVisible !== false ? <Eye size={11} /> : <EyeOff size={11} />}
                      <span>{rev.isVisible !== false ? 'Visible' : 'Hidden'}</span>
                    </button>
                  </div>

                  <p className="text-sm text-[var(--portal-text)] mb-4 leading-relaxed font-serif">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--portal-border)] flex items-center justify-between text-xs text-[var(--portal-muted)]">
                  <span className="font-medium text-[var(--portal-text)]">{rev.customerName || 'Anonymous Client'}</span>
                  {rev.productName && (
                    <span className="text-[11px] text-[var(--portal-accent-text)] truncate max-w-[150px]">
                      {rev.productName}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SellerReviewsPage
