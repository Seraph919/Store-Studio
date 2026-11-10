import type { CreateProductRequest, Order, Product, SellerKpis, SellerMediaConfig, SellerOrder, UpdateOrderStatusRequest } from '../types'
import { apiDownload, apiFetch } from './apiClient'
import { queryClient } from '../lib/queryClient'

export const sellerApi = {
  // Orders
  getOrders: async (): Promise<SellerOrder[]> => {
    return apiFetch<SellerOrder[]>('/api/v1/seller/orders')
  },

  updateOrderStatus: async (orderId: number, data: UpdateOrderStatusRequest): Promise<Order> => {
    return apiFetch<Order>(`/api/v1/seller/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  updateSellerOrderStatus: async (sellerOrderId: number, data: UpdateOrderStatusRequest): Promise<SellerOrder> => {
    return apiFetch<SellerOrder>(`/api/v1/seller/seller-orders/${sellerOrderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  confirmUpfrontPayment: async (sellerOrderId: number): Promise<SellerOrder> => {
    return apiFetch<SellerOrder>(`/api/v1/seller/seller-orders/${sellerOrderId}/confirm-upfront`, {
      method: 'PATCH',
    })
  },

  deleteOrder: async (orderId: number): Promise<void> => {
    await apiFetch<void>(`/api/v1/seller/orders/${orderId}`, {
      method: 'DELETE',
    })
  },

  exportOrdersCsv: async (): Promise<void> => {
    await apiDownload('/api/v1/seller/orders/export', 'courier_dispatch_orders.csv')
  },

  // Analytics KPIs
  getKpis: async (): Promise<SellerKpis> => {
    return apiFetch<SellerKpis>('/api/v1/seller/analytics/kpis')
  },

  // Catalog & Media Configuration
  getSellerProducts: async (): Promise<Product[]> => {
    return apiFetch<Product[]>('/api/v1/seller/products')
  },

  updateMediaConfig: async (productId: number, data: SellerMediaConfig): Promise<Product> => {
    const result = await apiFetch<Product>(`/api/v1/seller/products/${productId}/media-config`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    await queryClient.invalidateQueries({ queryKey: ['store'] })
    return result
  },

  toggleProductListing: async (productId: number, isListed?: boolean): Promise<Product> => {
    const query = isListed !== undefined ? `?isListed=${isListed}` : ''
    const result = await apiFetch<Product>(`/api/v1/seller/products/${productId}/listing${query}`, {
      method: 'PATCH',
    })
    await queryClient.invalidateQueries({ queryKey: ['store'] })
    return result
  },

  updateProduct: async (productId: number, data: CreateProductRequest): Promise<Product> => {
    const result = await apiFetch<Product>(`/api/v1/seller/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    await queryClient.invalidateQueries({ queryKey: ['store'] })
    return result
  },

  createProduct: async (data: CreateProductRequest): Promise<Product> => {
    const result = await apiFetch<Product>('/api/v1/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    await queryClient.invalidateQueries({ queryKey: ['store'] })
    return result
  },

  deleteProduct: async (productId: number): Promise<void> => {
    await apiFetch<void>(`/api/v1/seller/products/${productId}`, {
      method: 'DELETE',
    })
    await queryClient.invalidateQueries({ queryKey: ['store'] })
  },

  // Uploaded media is sent through the authenticated backend to Cloudflare R2.
  // The browser never sees bucket credentials and does not need bucket CORS rules.
  uploadFileToR2: async (file: File): Promise<string> => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']
    if (!allowed.includes(file.type)) throw new Error('Choose a JPEG, PNG, WebP, MP4, or WebM file.')
    const maxSize = file.type.startsWith('video/') ? 30 : 8
    if (file.size > maxSize * 1024 * 1024) throw new Error(`Maximum file size: ${maxSize} MB.`)
    const form = new FormData()
    form.append('file', file)
    const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
    const token = localStorage.getItem('store_luxury_jwt_token')
    if (!token) throw new Error('Sign in to upload images.')
    const response = await fetch(`${base}/api/v1/seller/media/upload`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form,
    })
    if (!response.ok) {
      if (response.status === 503) throw new Error('R2 is not configured. Check CF_ACC_ID, CF_ACC_KEY, CF_SEC_ID, CF_BUCKET and PUBLIC_DOMAIN.')
      if (response.status === 413) throw new Error('Media exceeds the allowed size limit.')
      throw new Error(`Upload failed (HTTP ${response.status}). Choose a JPEG, PNG, WebP, MP4 or WebM file.`)
    }
    const result: { permanentUrl: string } = await response.json()
    return result.permanentUrl
  },
}
