import type { Feedback, CreateFeedbackRequest } from '../types'
import { apiFetch } from './apiClient'

export const feedbackApi = {
  getStoreReviews: async (): Promise<Feedback[]> => {
    return apiFetch<Feedback[]>('/api/v1/feedbacks/store')
  },

  clearStoreReviewsCache: () => {
    // No-op: handled by TanStack Query
  },

  getProductReviews: async (productId: number): Promise<Feedback[]> => {
    return apiFetch<Feedback[]>(`/api/v1/feedbacks/product/${productId}`)
  },

  getAllReviews: async (): Promise<Feedback[]> => {
    return apiFetch<Feedback[]>('/api/v1/feedbacks')
  },

  getMySellerReviews: async (): Promise<Feedback[]> => {
    return apiFetch<Feedback[]>('/api/v1/feedbacks/seller/my')
  },

  createFeedback: async (payload: CreateFeedbackRequest): Promise<Feedback> => {
    return apiFetch<Feedback>('/api/v1/feedbacks', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  deleteFeedback: async (id: number): Promise<void> => {
    return apiFetch<void>(`/api/v1/feedbacks/${id}`, {
      method: 'DELETE',
    })
  },

  toggleVisibility: async (id: number, isVisible?: boolean): Promise<Feedback> => {
    const url = isVisible !== undefined
      ? `/api/v1/feedbacks/${id}/visibility?isVisible=${isVisible}`
      : `/api/v1/feedbacks/${id}/visibility`
    return apiFetch<Feedback>(url, {
      method: 'PATCH',
    })
  },
}
