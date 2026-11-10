import React, { useState, useEffect, useMemo, useRef, useId } from 'react'
import { Search, SlidersHorizontal, RefreshCw, ChevronLeft, ChevronRight, PackageOpen, Edit3 } from 'lucide-react'
import type { Product } from '../types'
import { useProductsQuery, useCategoriesQuery } from '../hooks/useStoreQueries'
import { useAuth } from '../context/useAuth'
import ProductCard from './ProductCard'
import './ProductCatalog.css'

interface ProductCatalogProps {
  onQuickView?: (product: Product) => void
  onOpenCreateModal?: () => void
  activeCategory?: string
  onCategoryChange?: (category: string) => void
  isEditMode?: boolean
  onOpenEdit?: () => void
  catalogEyebrow?: string
  catalogTitle?: string
  catalogEyebrow2?: string
  catalogTitle2?: string
  catalogDesc?: string
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onQuickView,
  onOpenCreateModal,
  activeCategory = 'All',
  onCategoryChange,
  isEditMode = false,
  onOpenEdit,
  catalogEyebrow = 'DISCOVER',
  catalogTitle = 'Shop products',
  catalogEyebrow2 = '',
  catalogTitle2 = '',
  catalogDesc = 'Browse products by category or sort by price.',
}) => {
  const searchId = useId()
  const sortId = useId()
  const { user, isAuthenticated } = useAuth()
  const isSeller = isAuthenticated && user?.role === 'SELLER'
  const [selectedCategory, setSelectedCategory] = useState<string>(activeCategory)

  const { data: remoteCategories } = useCategoriesQuery()
  // Categories come exclusively from the store API. The only local option is the All filter.
  const categories = useMemo(
    () => ['All', ...new Set((remoteCategories ?? []).map(category => category.name))],
    [remoteCategories],
  )

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('id')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState<number>(0)
  const [isPaginating, setIsPaginating] = useState<boolean>(false)
  const [minGridHeight, setMinGridHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (activeCategory) {
      setSelectedCategory(activeCategory)
      setPage(0)
      setMinGridHeight(undefined)
    }
  }, [activeCategory])

  const gridRef = useRef<HTMLDivElement>(null)
  const resultsStartRef = useRef<HTMLDivElement>(null)

  const queryParams = useMemo(() => ({
    category: selectedCategory === 'All' ? undefined : selectedCategory,
    search: searchQuery.trim() ? searchQuery.trim() : undefined,
    page,
    size: 9,
    sort: sortBy,
    direction: sortDirection,
  }), [selectedCategory, searchQuery, page, sortBy, sortDirection])

  const { data: pagedResponse, isFetching: isLoading, isError, refetch } = useProductsQuery(queryParams, true)

  const products = useMemo(() => pagedResponse?.content || [], [pagedResponse?.content])
  const totalPages = pagedResponse?.totalPages ?? 1
  const totalElements = pagedResponse?.totalElements ?? 0

  // Keep the old grid's height while the new page loads, then release it once
  // the requested page is actually displayed (not placeholderData from React Query).
  useEffect(() => {
    if (!isLoading && pagedResponse?.number === page) {
      setIsPaginating(false)
      setMinGridHeight(undefined)
    }
  }, [isLoading, page, pagedResponse?.number])

  const handlePageChange = (newPage: number) => {
    if (newPage === page || newPage < 0 || newPage >= totalPages || isLoading) return
    if (gridRef.current) {
      setMinGridHeight(gridRef.current.offsetHeight)
    }
    setIsPaginating(true)
    setPage(newPage)

    // Pagination should show the first row of the new results, not preserve the
    // visitor's location at the bottom of the previous page.
    requestAnimationFrame(() => {
      resultsStartRef.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      })
    })
  }

  const handleCategorySelect = (cat: string) => {
    setMinGridHeight(undefined)
    setSelectedCategory(cat)
    setPage(0)
    if (onCategoryChange) {
      onCategoryChange(cat)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMinGridHeight(undefined)
    setPage(0)
    refetch()
  }

  return (
    <section id="collection" className={`catalog-section ${isEditMode ? 'editable-block-active' : ''}`}>
      <div className="section-header-wrap" style={{ position: 'relative' }}>
        {isEditMode && onOpenEdit && (
          <button
            type="button"
            className="editorial-block-edit-btn"
            onClick={onOpenEdit}
            style={{ top: '0', right: '0' }}
            title="Edit Catalog & Archive Headings"
          >
            <Edit3 size={13} />
            <span>Edit Catalog Headings</span>
          </button>
        )}
        {catalogEyebrow && <span className="section-eyebrow">{catalogEyebrow}</span>}
        {catalogTitle && <h2 className="section-title">{catalogTitle}</h2>}
        {catalogEyebrow2 && <span className="section-eyebrow">{catalogEyebrow2}</span>}
        {catalogTitle2 && <h2 className="section-title">{catalogTitle2}</h2>}
        <div className="gold-accent-bar"></div>
        {catalogDesc && <p className="section-desc">{catalogDesc}</p>}
      </div>

      {/* Filter and Control Bar */}
      <div className="catalog-controls">
        {/* Category Pills */}
        <div className="category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={selectedCategory === cat}
              className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategorySelect(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="search-sort-group">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-1" role="search">
            <label htmlFor={searchId} className="text-xs">Search products</label>
            <div className="search-form">
              <Search size={16} className="search-icon" />
              <input
                id={searchId}
                type="search"
                placeholder="Product name"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(0)
                  setMinGridHeight(undefined)
                }}
                className="luxury-input-search"
              />
            </div>
          </form>

          <div className="flex flex-col gap-1">
            <label htmlFor={sortId} className="text-xs">Sort products</label>
            <div className="sort-dropdown-wrap">
              <SlidersHorizontal size={14} className="sort-icon" />
              <select
                id={sortId}
                value={`${sortBy}-${sortDirection}`}
                onChange={(e) => {
                  const [sb, sd] = e.target.value.split('-')
                  setMinGridHeight(undefined)
                  setSortBy(sb)
                  setSortDirection(sd as 'asc' | 'desc')
                  setPage(0)
                }}
                className="luxury-select"
              >
                <option value="id-asc">Default order</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Alphabetical: A to Z</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            className="icon-refresh-btn"
            onClick={() => refetch()}
            title="Refresh catalog"
            aria-label="Refresh catalog"
            disabled={isLoading}
          >
            <RefreshCw size={15} className={isLoading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {/* Keep a stable scroll target before the grid or loading skeleton. */}
      <div ref={resultsStartRef} className="catalog-results-anchor" aria-hidden="true" />

      {/* Products Grid */}
      {isError && !isLoading ? (
        <div className="empty-catalog-state">
          <p role="alert">We could not load the products. Please try again.</p>
          <button type="button" className="btn-luxury-secondary" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      ) : isLoading && !isPaginating ? (
        <div className="catalog-skeleton-grid">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="skeleton-card">
              <div className="skeleton-img"></div>
              <div className="skeleton-line full"></div>
              <div className="skeleton-line half"></div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div
          ref={gridRef}
          className="products-grid"
          style={{
            minHeight: minGridHeight ? `${minGridHeight}px` : undefined,
            // Never dim product cards while changing pages; placeholder data stays readable.
          }}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      ) : (
        <div className="empty-catalog-state">
          <PackageOpen size={48} className="empty-icon text-gold" />
          {searchQuery || selectedCategory !== 'All' ? (
            <>
              <h3>No matching products</h3>
              <p>Try another search or clear your filters.</p>
              <button
                className="btn-luxury-secondary"
                onClick={() => {
                  handleCategorySelect('All')
                  setSearchQuery('')
                }}
              >
                Clear filters
              </button>
            </>
          ) : (
            <>
              <h3>No products yet</h3>
              <p>No products have been added to the store yet.</p>
              {isSeller && onOpenCreateModal && (
                <button
                  className="btn-luxury-primary"
                  onClick={onOpenCreateModal}
                  style={{ marginTop: '1rem' }}
                >
                  Add first product
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Pagination Bar */}
      {!isError && totalPages > 1 && (
        <div className="catalog-pagination">
          <button
            type="button"
            className="btn-page-arrow"
            disabled={isLoading || page === 0}
            onClick={() => handlePageChange(Math.max(0, page - 1))}
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="pagination-info" role="status">
            Page {page + 1} of {totalPages} ({totalElements} products)
          </span>
          <button
            type="button"
            className="btn-page-arrow"
            disabled={isLoading || page >= totalPages - 1}
            onClick={() => handlePageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </section>
  )
}
export default ProductCatalog
