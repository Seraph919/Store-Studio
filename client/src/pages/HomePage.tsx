import React from 'react'
import { StorefrontRenderer } from '../storefront/StorefrontRenderer'
import { useStoreDesignQuery, parseStoreDesign } from '../services/storeApi'
import { useStoreSettingsQuery, useProductsQuery, useCategoriesQuery } from '../hooks/useStoreQueries'
import { Loader2 } from 'lucide-react'

export const HomePage: React.FC = () => {
  const { data: storeDesignDto, isLoading: isDesignLoading } = useStoreDesignQuery()
  const { data: storeSettings } = useStoreSettingsQuery()
  const { data: productsData, isLoading: isProductsLoading } = useProductsQuery({ size: 50 })
  const { data: categories = [] } = useCategoriesQuery()

  const products = productsData?.content || []
  const parsedDesign = parseStoreDesign(storeDesignDto)

  if (isDesignLoading && isProductsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--store-bg, #fafaf9)]">
        <div className="flex flex-col items-center gap-3 text-stone-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#B58A56]" />
          <span className="text-xs uppercase tracking-widest font-mono">Loading Storefront...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="homepage-content w-full">
      <StorefrontRenderer
        design={parsedDesign}
        storeSettings={storeSettings}
        products={products}
        categories={categories}
      />
    </div>
  )
}

export default HomePage
