import { useSectionProducts } from '../useSectionProducts'
import React from 'react'
import type { StoreSection, StorefrontTemplateId } from '../../types/design'
import type { Product } from '../../types'
import { StoreProductCard } from '../components/StoreProductCard'

interface ProductCollectionSectionRendererProps {
  section: StoreSection
  template: StorefrontTemplateId
  products: Product[]
  isPreview?: boolean
}

export const ProductCollectionSectionRenderer: React.FC<ProductCollectionSectionRendererProps> = ({
  section,
  template,
  isPreview,
}) => {
  const { settings } = section
  const title = settings.title || 'Curated Sets & Packs'
  const subtitle =
    settings.subtitle ||
    'Hand-assembled duos, stacking sets, and gift ensembles created and priced by our artisans.'
  const columns = settings.columns || 4

  const query = useSectionProducts(settings)
  const collectionProducts = query.data ?? []
  if (query.isPending || query.isError) return isPreview ? <div className="store-empty" role="status">{query.isError ? 'Products could not be loaded. Please try again.' : 'Loading products…'}</div> : null
  if (collectionProducts.length === 0) return isPreview ? <div className="p-10 text-center text-[var(--store-text-muted)]"><h2>{title}</h2><p>No products match this selection. Choose another category or add products.</p></div> : null

  const colClass =
    columns === 2
      ? 'grid-cols-2'
      : columns === 3
      ? 'grid-cols-2 sm:grid-cols-3'
      : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'

  // ----------------------------------------------------
  // MINIMAL TEMPLATE
  // ----------------------------------------------------
  if (template === 'MINIMAL') {
    return (
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[var(--store-border)]">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-[var(--store-border)]">
          <h2 className="text-lg uppercase tracking-wider font-semibold text-[var(--store-text)] store-heading">
            {title}
          </h2>
          <span className="text-xs text-[var(--store-text-muted)] uppercase tracking-wider font-mono">
            {collectionProducts.length} pieces
          </span>
        </div>
        <div className={`grid ${colClass} gap-4 sm:gap-6`}>
          {collectionProducts.map((p) => (
            <StoreProductCard key={p.id} product={p} isPreview={isPreview} />
          ))}
        </div>
      </section>
    )
  }

  // ----------------------------------------------------
  // MODERN TEMPLATE
  // ----------------------------------------------------
  if (template === 'MODERN') {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-[var(--store-border)] gap-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-[var(--store-accent)] block mb-1">
              Curated Ensemble
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--store-text)] store-heading">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-sm text-[var(--store-text-muted)] max-w-md">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`grid ${colClass} gap-6`}>
          {collectionProducts.map((p) => (
            <StoreProductCard key={p.id} product={p} isPreview={isPreview} />
          ))}
        </div>
      </section>
    )
  }

  // ----------------------------------------------------
  // EDITORIAL TEMPLATE (Default)
  // ----------------------------------------------------
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs uppercase tracking-widest font-semibold text-[var(--store-accent)]">
          Curated Stacking Sets
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--store-text)] store-heading mt-1">
          {title}
        </h2>
        <div className="w-12 h-0.5 mx-auto mt-4" style={{ backgroundColor: 'var(--store-accent)' }} />
        {subtitle && (
          <p className="text-sm text-[var(--store-text-muted)] mt-4 font-light leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      <div className={`grid ${colClass} gap-6 lg:gap-8`}>
        {collectionProducts.map((p) => (
          <StoreProductCard key={p.id} product={p} isPreview={isPreview} />
        ))}
      </div>
    </section>
  )
}
