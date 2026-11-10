import { useNavigate } from 'react-router-dom'
import React from 'react'
import { ArrowUpRight } from 'lucide-react'
import type { StoreSection, StorefrontTemplateId } from '../../types/design'
import type { Category, Product } from '../../types'

interface CategoriesSectionRendererProps {
  section: StoreSection
  template: StorefrontTemplateId
  products?: Product[]
  categories?: Category[]
  onSelectCategory?: (category: string) => void
}


export const CategoriesSectionRenderer: React.FC<CategoriesSectionRendererProps> = ({
  section,
  template,
  categories,
  onSelectCategory,
}) => {
  const navigate = useNavigate()
  const { settings } = section
  const title = settings.title || 'Shop by category'
  const subtitle = settings.subtitle || 'Browse the products available in our store.'

  const availableCats =
    categories && categories.length > 0
      ? categories.map((c) => ({
          name: c.name,
          description: `Explore ${c.name.toLowerCase()}`,
          count: c.productCount ?? 0,
        }))
      : []

  const displayCats = availableCats.slice(0, settings.maxCategories ?? 4)

  // A fresh store has no categories yet: don't render an empty category heading.
  if (displayCats.length === 0) return null

  const handleCategoryClick = (categoryName: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryName)
    } else {
      navigate(`/shop?category=${encodeURIComponent(categoryName)}`)
    }
  }

  // ----------------------------------------------------
  // MINIMAL TEMPLATE: Clean horizontal rule & text list
  // ----------------------------------------------------
  if (section.variant === 'strip') {
    return (
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[var(--store-border)]">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 pb-4 border-b border-[var(--store-border)]">
          <h2 className="text-xl font-light uppercase tracking-wider text-[var(--store-text)] store-heading">
            {title}
          </h2>
          <span className="text-xs text-[var(--store-text-muted)] tracking-widest uppercase mt-1 sm:mt-0">
            {subtitle}
          </span>
        </div>

        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {displayCats.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => handleCategoryClick(cat.name)}
              className="text-left p-4 sm:p-6 border border-[var(--store-border)] hover:border-[var(--store-text)] transition-colors group flex flex-col justify-between min-h-28 sm:min-h-36"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-[var(--store-text-muted)] font-mono">
                  {String(cat.count).padStart(2, '0')} Pieces
                </span>
                <ArrowUpRight className="w-4 h-4 text-[var(--store-text-muted)] group-hover:text-[var(--store-text)] transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-wider uppercase text-[var(--store-text)]">
                  {cat.name}
                </h3>
              </div>
            </button>
          ))}
        </div>
      </section>
    )
  }

  // ----------------------------------------------------
  // MODERN TEMPLATE: Rounded cards with subtle surface tint
  // ----------------------------------------------------
  if (template === 'MODERN') {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--store-accent)] block mb-2">
            Categories
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--store-text)] store-heading">
            {title}
          </h2>
          <p className="text-sm text-[var(--store-text-muted)] mt-2">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {displayCats.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => handleCategoryClick(cat.name)}
              className="text-left p-4 sm:p-6 rounded-2xl bg-[var(--store-surface-subtle)] border border-[var(--store-border)] hover:border-[var(--store-accent)] hover:shadow-lg hover:-translate-y-1 transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--store-surface)] text-[var(--store-text-muted)] border border-[var(--store-border)]">
                  {cat.count} Items
                </span>
                <div className="w-8 h-8 rounded-full bg-[var(--store-surface)] border border-[var(--store-border)] flex items-center justify-center text-[var(--store-text)] group-hover:bg-[var(--store-accent)] group-hover:text-white transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-[var(--store-text)] store-heading">
                {cat.name}
              </h3>
              <p className="text-xs text-[var(--store-text-muted)] mt-1 line-clamp-1">
                {cat.description}
              </p>
            </button>
          ))}
        </div>
      </section>
    )
  }

  // ----------------------------------------------------
  // EDITORIAL TEMPLATE (Default): Luxury Atelier Cards with gold accents
  // ----------------------------------------------------
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs uppercase tracking-widest font-semibold text-[var(--store-accent)]">
          Atelier Collections
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--store-text)] store-heading mt-1">
          {title}
        </h2>
        <div className="w-12 h-0.5 mx-auto mt-4" style={{ backgroundColor: 'var(--store-accent)' }} />
        <p className="text-sm text-[var(--store-text-muted)] mt-4 font-light">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {displayCats.map((cat) => (
          <button
            key={cat.name}
            type="button"
            onClick={() => handleCategoryClick(cat.name)}
            className="text-left p-4 sm:p-6 rounded-lg bg-[var(--store-surface)] border border-[var(--store-border)] hover:shadow-md transition-all group flex flex-col justify-between h-40"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-[var(--store-accent)] font-semibold">
                Collection
              </span>
              <ArrowUpRight className="w-4 h-4 text-[var(--store-text-muted)] group-hover:text-[var(--store-accent)] transition-colors" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-[var(--store-text)] store-heading">
                {cat.name}
              </h3>
              <p className="text-xs text-[var(--store-text-muted)] mt-1 font-light line-clamp-1">
                {cat.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
