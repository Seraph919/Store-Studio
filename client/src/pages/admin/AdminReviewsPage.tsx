import React, { useState, useEffect } from 'react'
import {
  MessageSquare,
  Star,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { adminApi } from '../../services/adminApi'
import { feedbackApi } from '../../services/feedbackApi'
import type { Feedback } from '../../types'

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadReviews = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await adminApi.getAllReviews()
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

  const handleToggleVisibility = async (id: number) => {
    try {
      const updated = await feedbackApi.toggleVisibility(id)
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isVisible: updated.isVisible } : r))
      )
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to toggle review visibility.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return
    setDeletingId(id)
    try {
      await adminApi.deleteReview(id)
      setReviews((prev) => prev.filter((r) => r.id !== id))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete review.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)]">
        <div>
          <h1 className="text-2xl font-serif text-[var(--portal-text)] mt-1">Customer reviews</h1>
          <p className="text-sm leading-relaxed text-[var(--portal-muted)] mt-2">
            Review customer feedback and manage which reviews appear in the store.
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

      {/* Reviews Table */}
      {isLoading ? (
        <div className="p-16 text-center text-[var(--portal-accent-text)]">
          <div className="w-8 h-8 border-2 border-[var(--portal-accent-border)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs uppercase tracking-widest text-[var(--portal-muted)]">Auditing feedback...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-12 text-center bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)] text-[var(--portal-muted)]">
          <MessageSquare size={32} className="mx-auto mb-3 text-[var(--portal-placeholder)]" />
          <p className="text-sm">No reviews found across the platform.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => {
            const isDeleting = deletingId === rev.id
            return (
              <div
                key={rev.id}
                className="p-5 bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 text-[var(--portal-accent-text)]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < rev.rating ? 'currentColor' : 'none'}
                          className={i < rev.rating ? 'text-[var(--portal-accent-text)]' : 'text-[var(--portal-placeholder)]'}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-[var(--portal-text)]">
                      {rev.customerName || 'Verified Patron'}
                    </span>
                    {rev.productName && (
                      <span className="text-[10px] text-[var(--portal-muted)] font-mono">
                        on "{rev.productName}"
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--portal-text)] leading-relaxed font-serif">"{rev.comment}"</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(rev.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      rev.isVisible !== false
                        ? 'bg-[var(--portal-success-soft)] text-[var(--portal-success)] border border-[var(--portal-success-border)]'
                        : 'bg-[var(--portal-danger-soft)] text-[var(--portal-danger)] border border-[var(--portal-danger-border)]'
                    }`}
                  >
                    {rev.isVisible !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                    <span>{rev.isVisible !== false ? 'Live' : 'Hidden'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleDelete(rev.id)}
                    className="p-1.5 text-[var(--portal-danger)] hover:bg-[var(--portal-danger-soft)] rounded transition-colors disabled:opacity-50"
                    title="Delete Review"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminReviewsPage
