import React from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import ProductCatalog from '../components/ProductCatalog'

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') || 'All'

  const handleCategoryChange = (category: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (category === 'All') {
        next.delete('category')
      } else {
        next.set('category', category)
      }
      return next
    })
  }

  return (
    <div className="min-h-screen pt-10 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[var(--store-text-muted)] mb-8">
        <Link to="/" className="hover:text-[var(--store-text)] transition-colors">Home</Link>
        <ChevronRight size={12} />
        <Link to="/shop" aria-current={activeCategory === 'All' ? 'page' : undefined} className="hover:text-[var(--store-text)] transition-colors">Catalog</Link>
        {activeCategory !== 'All' && (
          <>
            <ChevronRight size={12} />
            <span aria-current="page" className="text-[var(--store-accent)] font-medium">{activeCategory}</span>
          </>
        )}
      </nav>

      {/* Catalog */}
      <ProductCatalog
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        isEditMode={false}
      />
    </div>
  )
}

export default ShopPage
