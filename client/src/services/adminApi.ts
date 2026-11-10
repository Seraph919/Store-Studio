import type {
  AdminAnalytics,
  AdminHealth,
  Category,
  Feedback,
  Product,
  User,
} from '../types'
import { apiDownload, apiFetch } from './apiClient'
import { queryClient } from '../lib/queryClient'

export const adminApi = {
  // Analytics & Health
  getAnalytics: async (): Promise<AdminAnalytics> => {
    return apiFetch<AdminAnalytics>('/api/admin/analytics')
  },

  getHealth: async (): Promise<AdminHealth> => {
    return apiFetch<AdminHealth>('/api/admin/health')
  },

  // Seller & Account Governance
  getUsers: async (): Promise<User[]> => {
    return apiFetch<User[]>('/api/admin/users')
  },

  updateUserStatus: async (id: number, status: 'ACTIVE' | 'SUSPENDED'): Promise<User> => {
    return apiFetch<User>(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },

  updateUserRole: async (id: number, role: string): Promise<User> => {
    return apiFetch<User>(`/api/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    })
  },

  // Category CRUD
  getCategories: async (): Promise<Category[]> => {
    return apiFetch<Category[]>('/api/admin/categories')
  },

  createCategory: async (name: string): Promise<Category> => {
    const result = await apiFetch<Category>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
    await queryClient.invalidateQueries({ queryKey: ['store'] })
    return result
  },

  updateCategory: async (id: number, name: string): Promise<Category> => {
    const result = await apiFetch<Category>(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    })
    await queryClient.invalidateQueries({ queryKey: ['store'] })
    return result
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiFetch<void>(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    })
    await queryClient.invalidateQueries({ queryKey: ['store'] })
  },

  // Central Catalog Oversight
  getAllProducts: async (): Promise<Product[]> => {
    return apiFetch<Product[]>('/api/admin/products')
  },

  toggleProductListing: async (id: number, isListed?: boolean): Promise<Product> => {
    const query = isListed !== undefined ? `?isListed=${isListed}` : ''
    const result = await apiFetch<Product>(`/api/admin/products/${id}/listing${query}`, {
      method: 'PATCH',
    })
    await queryClient.invalidateQueries({ queryKey: ['store'] })
    return result
  },

  deleteProduct: async (id: number): Promise<void> => {
    await apiFetch<void>(`/api/admin/products/${id}`, {
      method: 'DELETE',
    })
    await queryClient.invalidateQueries({ queryKey: ['store'] })
  },

  // Review Moderation
  getAllReviews: async (): Promise<Feedback[]> => {
    return apiFetch<Feedback[]>('/api/admin/reviews')
  },

  deleteReview: async (id: number): Promise<void> => {
    await apiFetch<void>(`/api/admin/reviews/${id}`, {
      method: 'DELETE',
    })
  },

  // CSV Exports
  exportFinancialAuditCsv: async (): Promise<void> => {
    await apiDownload('/api/admin/export/financial-audit', 'financial_sales_audit.csv')
  },

  exportSellerDirectoryCsv: async (): Promise<void> => {
    await apiDownload('/api/admin/export/seller-directory', 'seller_directory_registry.csv')
  },
}

