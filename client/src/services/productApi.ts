import type { Category, CreateProductRequest, PagedResponse, Product } from '../types'
import { apiFetch } from './apiClient'

export interface GetProductsParams {
  category?: string
  search?: string
  page?: number
  size?: number
  sort?: string
  direction?: 'asc' | 'desc'
}

import { queryClient } from '../lib/queryClient'
import { useQuery } from '@tanstack/react-query'

export const productApi = {
  clearProductsCache: () => {
    queryClient.invalidateQueries({ queryKey: ['store', 'products'] })
  },

  getProducts: async (params: GetProductsParams = {}): Promise<PagedResponse<Product>> => {
    const query = new URLSearchParams()
    if (params.category) query.set('category', params.category)
    if (params.search) query.set('search', params.search)
    if (params.page !== undefined) query.set('page', params.page.toString())
    if (params.size !== undefined) query.set('size', params.size.toString())
    if (params.sort) query.set('sort', params.sort)
    if (params.direction) query.set('direction', params.direction)

    const queryString = query.toString()
    const url = `/api/v1/products${queryString ? `?${queryString}` : ''}`
    return apiFetch<PagedResponse<Product>>(url)
  },

  getProductById: async (id: number): Promise<Product> => {
    return apiFetch<Product>(`/api/v1/products/${id}`)
  },

  createProduct: async (product: CreateProductRequest): Promise<Product> => {
    const res = await apiFetch<Product>('/api/v1/products', {
      method: 'POST',
      body: JSON.stringify(product),
    })
    queryClient.invalidateQueries({ queryKey: ['store'] })
    return res
  },

  updateProduct: async (id: number, product: CreateProductRequest): Promise<Product> => {
    const res = await apiFetch<Product>(`/api/v1/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    })
    queryClient.invalidateQueries({ queryKey: ['store'] })
    return res
  },

  getCategories: async (): Promise<Category[]> => {
    return apiFetch<Category[]>('/api/v1/products/categories')
  },

  clearCategoriesCache: () => {
    queryClient.invalidateQueries({ queryKey: ['store', 'categories'] })
  },

  getTopOrdered: async (isPack: boolean = false): Promise<Product | null> => {
    try {
      const res = await apiFetch<Product>(`/api/v1/products/top-ordered?isPack=${isPack}`)
      return res && res.id ? res : null
    } catch {
      return null
    }
  },

  clearTopOrderedCache: () => {
    queryClient.invalidateQueries({ queryKey: ['store', 'top-ordered'] })
  },

  getRelatedProducts: async (id: number, limit = 4): Promise<Product[]> => {
    try {
      const res = await apiFetch<Product[]>(`/api/v1/products/${id}/related?limit=${limit}`)
      return Array.isArray(res) ? res : []
    } catch {
      return []
    }
  },

  clearRelatedProductsCache: (id?: number) => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: ['store', 'related-products', id] })
    } else {
      queryClient.invalidateQueries({ queryKey: ['store', 'related-products'] })
    }
  },
}

export function useRelatedProductsQuery(productId?: number, limit = 4) {
  return useQuery({
    queryKey: ['store', 'related-products', productId, limit],
    queryFn: () => productApi.getRelatedProducts(productId!, limit),
    enabled: Boolean(productId && productId > 0),
    staleTime: 5 * 60 * 1000,
  })
}

