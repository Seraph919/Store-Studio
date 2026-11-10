import { useQuery, keepPreviousData } from '@tanstack/react-query'
import type { Category, Feedback, PagedResponse, Product } from '../types'
import { productApi, type GetProductsParams } from '../services/productApi'
import { settingsApi, type StoreSettings } from '../services/settingsApi'
import { feedbackApi } from '../services/feedbackApi'
import { cartApi } from '../services/cartApi'
import { queryClient } from '../lib/queryClient'

export const storeQueryKeys = {
  all: ['store'] as const,
  settings: () => [...storeQueryKeys.all, 'settings'] as const,
  products: (params?: GetProductsParams) => [...storeQueryKeys.all, 'products', params ?? {}] as const,
  categories: () => [...storeQueryKeys.all, 'categories'] as const,
  topOrdered: (isPack: boolean) => [...storeQueryKeys.all, 'top-ordered', isPack] as const,
  reviews: () => [...storeQueryKeys.all, 'reviews'] as const,
  cart: (cartId?: string | null) => ['cart', cartId ?? ''] as const,
}

// Invalidation Helpers
export const invalidateStoreSettings = () =>
  queryClient.invalidateQueries({ queryKey: storeQueryKeys.settings() })

export const invalidateStoreProducts = () =>
  queryClient.invalidateQueries({ queryKey: [...storeQueryKeys.all, 'products'] })

export const invalidateStoreCategories = () =>
  queryClient.invalidateQueries({ queryKey: storeQueryKeys.categories() })

export const invalidateStoreTopOrdered = () =>
  queryClient.invalidateQueries({ queryKey: [...storeQueryKeys.all, 'top-ordered'] })

export const invalidateStoreReviews = () =>
  queryClient.invalidateQueries({ queryKey: storeQueryKeys.reviews() })

export const invalidateCart = (cartId?: string | null) =>
  queryClient.invalidateQueries({ queryKey: cartId ? storeQueryKeys.cart(cartId) : ['cart'] })

export const invalidateAllStorefront = () => {
  return queryClient.invalidateQueries({ queryKey: storeQueryKeys.all })
}

// Query Hooks
export function useStoreSettingsQuery() {
  return useQuery<StoreSettings>({
    queryKey: storeQueryKeys.settings(),
    queryFn: () => settingsApi.getSettings(),
  })
}

export function useProductsQuery(params: GetProductsParams = {}, keepPrevious = false) {
  return useQuery<PagedResponse<Product>>({
    queryKey: storeQueryKeys.products(params),
    queryFn: () => productApi.getProducts(params),
    placeholderData: keepPrevious ? keepPreviousData : undefined,
  })
}

export function useCategoriesQuery() {
  return useQuery<Category[]>({
    queryKey: storeQueryKeys.categories(),
    queryFn: () => productApi.getCategories(),
  })
}

export function useTopOrderedQuery(isPack: boolean = false) {
  return useQuery<Product | null>({
    queryKey: storeQueryKeys.topOrdered(isPack),
    queryFn: () => productApi.getTopOrdered(isPack),
  })
}

export function useStoreReviewsQuery() {
  return useQuery<Feedback[]>({
    queryKey: storeQueryKeys.reviews(),
    queryFn: () => feedbackApi.getStoreReviews(),
  })
}

export function useCartQuery(cartId: string | null) {
  return useQuery({
    queryKey: storeQueryKeys.cart(cartId),
    queryFn: () => (cartId ? cartApi.getCart(cartId) : null),
    enabled: !!cartId,
  })
}

