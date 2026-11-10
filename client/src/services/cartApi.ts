import type { AddItemToCartRequest, Cart, CartCreatedResponse, UpdateCartItemRequest } from '../types'
import { apiFetch } from './apiClient'

export const cartApi = {
  createCart: async (): Promise<CartCreatedResponse> => {
    return apiFetch<CartCreatedResponse>('/api/carts', {
      method: 'POST',
    })
  },

  getCart: async (cartId: string): Promise<Cart> => {
    return apiFetch<Cart>(`/api/carts/${cartId}`)
  },

  addItem: async (cartId: string, item: AddItemToCartRequest): Promise<Cart> => {
    return apiFetch<Cart>(`/api/carts/${cartId}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    })
  },

  updateQuantity: async (cartId: string, productId: number, update: UpdateCartItemRequest): Promise<Cart> => {
    return apiFetch<Cart>(`/api/carts/${cartId}/items/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(update),
    })
  },

  removeItem: async (cartId: string, productId: number): Promise<Cart> => {
    return apiFetch<Cart>(`/api/carts/${cartId}/items/${productId}`, {
      method: 'DELETE',
    })
  },
}

