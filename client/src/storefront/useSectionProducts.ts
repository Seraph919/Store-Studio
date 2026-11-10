import { useQuery } from '@tanstack/react-query'
import { productApi } from '../services/productApi'
import type { SectionSettings } from '../types/design'
import { selectProducts } from './productSelection'

export function useSectionProducts(settings: SectionSettings) {
  return useQuery({
    queryKey: ['store', 'section-products', settings.strategy, settings.productIds, settings.categoryName, settings.maxProducts],
    queryFn: async () => {
      const strategy = settings.strategy ?? 'featured'
      if (['featured', 'custom', 'curated'].includes(strategy)) {
        const ids = settings.productIds ?? []
        // Resolve the requested products directly, including those beyond page 1.
        const products = await Promise.all(ids.map(id => productApi.getProductById(id).catch(error => {
          if (error instanceof Error && /not found|404/i.test(error.message)) return null
          throw error
        })))
        return selectProducts(products.filter(product => product !== null), settings)
      }
      if (strategy === 'bestsellers' || (strategy === 'category' && !settings.categoryName)) return []
      const params = { size: 50, sort: 'id', direction: 'desc' as const, category: strategy === 'category' ? settings.categoryName : undefined }
      const first = await productApi.getProducts({ ...params, page: 0 })
      let products = first.content
      // Packs can occur on any catalog page. Stop once the requested count is met.
      for (let page = 1; strategy === 'packs' && page < first.totalPages && selectProducts(products, settings).length < (settings.maxProducts ?? 8); page++) {
        products = [...products, ...(await productApi.getProducts({ ...params, page })).content]
      }
      return selectProducts(products, settings)
    },
  })
}
