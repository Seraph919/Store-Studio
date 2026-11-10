import type { CreateOrderRequest, Order, OrderTracking } from '../types'
import { apiFetch } from './apiClient'

export const orderApi = {
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    return apiFetch<Order>('/api/v1/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getOrderById: async (id: number): Promise<Order> => {
    return apiFetch<Order>(`/api/v1/orders/${id}`)
  },

  trackOrder: async (token: string): Promise<OrderTracking> => {
    return apiFetch<OrderTracking>(`/api/v1/orders/track/${encodeURIComponent(token)}`)
  },
}
