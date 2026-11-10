import type { PagedResponse, Product, PublicStorefront, SellerStorefront, UpdateSellerStorefront } from '../types'
import { apiFetch } from './apiClient'

export interface StorefrontProductsParams {
  category?: string
  search?: string
  page?: number
  size?: number
  sort?: string
  direction?: 'asc' | 'desc'
}

export const storefrontQueryKeys = {
  public: (slug: string) => ['storefront', 'public', slug] as const,
  products: (slug: string, params?: StorefrontProductsParams) => ['storefront', 'products', slug, params] as const,
  seller: () => ['storefront', 'seller'] as const,
}

export const storefrontApi = {
  getPublicStorefront: async (slug: string): Promise<PublicStorefront> => {
    return apiFetch<PublicStorefront>(`/api/v1/stores/${encodeURIComponent(slug)}`)
  },

  getStorefrontProducts: async (slug: string, params: StorefrontProductsParams = {}): Promise<PagedResponse<Product>> => {
    const query = new URLSearchParams()
    if (params.category) query.set('category', params.category)
    if (params.search) query.set('search', params.search)
    if (params.page !== undefined) query.set('page', params.page.toString())
    if (params.size !== undefined) query.set('size', params.size.toString())
    if (params.sort) query.set('sort', params.sort)
    if (params.direction) query.set('direction', params.direction)

    const queryString = query.toString()
    const url = `/api/v1/stores/${encodeURIComponent(slug)}/products${queryString ? `?${queryString}` : ''}`
    return apiFetch<PagedResponse<Product>>(url)
  },

  getSellerStorefront: async (): Promise<SellerStorefront> => {
    return apiFetch<SellerStorefront>('/api/v1/seller/storefront')
  },

  updateSellerStorefront: async (data: UpdateSellerStorefront): Promise<SellerStorefront> => {
    return apiFetch<SellerStorefront>('/api/v1/seller/storefront', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}
