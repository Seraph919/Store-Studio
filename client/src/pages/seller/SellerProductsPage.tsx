import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Layers,
  PlusCircle,
  Search,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  RefreshCw,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react'
import { sellerApi } from '../../services/sellerApi'
import { formatPrice } from '../../utils/formatPrice'
import type { Product } from '../../types'

export const SellerProductsPage: React.FC = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PIECES' | 'PACKS'>('ALL')
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadProducts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await sellerApi.getSellerProducts()
      setProducts(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve products.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleToggleListed = async (productId: number) => {
    setTogglingId(productId)
    try {
      const updated = await sellerApi.toggleProductListing(productId)
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, isListed: updated.isListed } : p))
      )
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to toggle product visibility.')
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (productId: number, productName: string) => {
    if (!window.confirm(`Are you sure you wish to delete "${productName}" from your catalog?`)) {
      return
    }

    setDeletingId(productId)
    try {
      await sellerApi.deleteProduct(productId)
      setProducts((prev) => prev.filter((p) => p.id !== productId))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete product.')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesType =
        typeFilter === 'ALL' ||
        (typeFilter === 'PIECES' && !p.isPack) ||
        (typeFilter === 'PACKS' && p.isPack)
      const q = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q))
      return matchesType && matchesQuery
    })
  }, [products, typeFilter, searchQuery])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)]">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--portal-accent-text)]">
            Catalog Management
          </span>
          <h1 className="text-2xl font-serif text-[var(--portal-text)] mt-1">Products & Inventory</h1>
          <p className="text-xs text-[var(--portal-muted)] mt-1">
            Curate listings, update inventory levels, and configure pricing and visual showcases.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadProducts}
            disabled={isLoading}
            className="p-2.5 bg-[var(--portal-surface-alt)] hover:bg-[var(--portal-hover)] text-[var(--portal-muted)] hover:text-[var(--portal-text)] rounded-xl border border-[var(--portal-border)] transition-colors"
            title="Refresh pieces"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin text-[var(--portal-accent-text)]' : ''} />
          </button>
          <Link
            to="/seller/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--portal-accent)] hover:bg-[var(--portal-accent)] text-[var(--portal-on-accent)] font-semibold text-xs tracking-wider uppercase rounded-xl transition-colors shadow-md shadow-none"
          >
            <PlusCircle size={15} />
            <span>Create New Piece</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[var(--portal-danger-soft)] border border-[var(--portal-danger-border)] rounded-xl flex items-center gap-3 text-xs text-[var(--portal-danger)]">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          {(['ALL', 'PIECES', 'PACKS'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs tracking-wider uppercase font-medium transition-colors ${
                typeFilter === t
                  ? 'bg-[var(--portal-accent)] text-[var(--portal-on-accent)] font-semibold'
                  : 'bg-[var(--portal-surface)] text-[var(--portal-muted)] hover:text-[var(--portal-text)] border border-[var(--portal-border)]'
              }`}
            >
              {t === 'ALL' ? 'All Catalog' : t === 'PIECES' ? 'Individual Products' : 'Packs & Bundles'}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search piece by name or category..."
            className="w-full pl-9 pr-4 py-2 bg-[var(--portal-surface)] border border-[var(--portal-border)] rounded-xl text-xs text-[var(--portal-text)] placeholder-[var(--portal-placeholder)] focus:border-[var(--portal-accent)] focus:outline-none"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--portal-muted)]" />
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="p-16 text-center text-[var(--portal-accent-text)]">
          <div className="w-8 h-8 border-2 border-[var(--portal-accent-border)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs uppercase tracking-widest text-[var(--portal-muted)]">Retrieving catalog pieces...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)] text-[var(--portal-muted)]">
          <Layers size={32} className="mx-auto mb-3 text-[var(--portal-placeholder)]" />
          <p className="text-sm">No jewelry pieces found matching your criteria.</p>
        </div>
      ) : (
        <div className="bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--portal-surface-alt)] text-[10px] uppercase font-mono tracking-wider text-[var(--portal-muted)] border-b border-[var(--portal-border)]">
                <tr>
                  <th className="py-3.5 px-4 font-medium">Piece Details</th>
                  <th className="py-3.5 px-4 font-medium">Category</th>
                  <th className="py-3.5 px-4 font-medium">Price</th>
                  <th className="py-3.5 px-4 font-medium">Inventory</th>
                  <th className="py-3.5 px-4 font-medium text-center">Store Visibility</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--portal-border)]">
                {filteredProducts.map((p) => {
                  const isToggling = togglingId === p.id
                  const isDeleting = deletingId === p.id
                  const thumb = p.thumbnailUrl || p.images?.[0]
                  return (
                    <tr key={p.id} className="hover:bg-[var(--portal-hover)] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-[var(--portal-hover)] border border-[var(--portal-border)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {thumb ? (
                              <img src={thumb} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={18} className="text-[var(--portal-accent-text)]" />
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-serif text-[var(--portal-text)] font-medium block">
                              {p.name}
                            </span>
                            {p.isPack && (
                              <span className="text-[10px] bg-[var(--portal-warning-soft)] text-[var(--portal-warning)] px-1.5 py-0.2 rounded font-mono">
                                Pack & Set
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[var(--portal-muted)]">
                        {p.categoryName || 'Unassigned'}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-[var(--portal-accent-text)]">
                        {formatPrice(p.price)}
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="block text-[10px] text-[var(--portal-muted)] line-through">
                            {formatPrice(p.originalPrice)}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                            p.quantity <= 0
                              ? 'bg-[var(--portal-danger-soft)] text-[var(--portal-danger)]'
                              : p.quantity <= 3
                              ? 'bg-[var(--portal-warning-soft)] text-[var(--portal-warning)]'
                              : 'bg-[var(--portal-success-soft)] text-[var(--portal-success)]'
                          }`}
                        >
                          {p.quantity <= 0 ? '0 (Out of stock)' : `${p.quantity} units`}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => handleToggleListed(p.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                            p.isListed !== false
                              ? 'bg-[var(--portal-success-soft)] text-[var(--portal-success)] hover:bg-[var(--portal-success-soft)] border border-[var(--portal-success-border)]'
                              : 'bg-[var(--portal-danger-soft)] text-[var(--portal-danger)] hover:bg-[var(--portal-danger-soft)] border border-[var(--portal-danger-border)]'
                          }`}
                          title="Click to toggle store visibility"
                        >
                          {p.isListed !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                          <span>{p.isListed !== false ? 'Listed' : 'Hidden'}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/seller/products/${p.id}/edit`)}
                            className="p-1.5 text-[var(--portal-muted)] hover:text-[var(--portal-text)] hover:bg-[var(--portal-hover)] rounded transition-colors"
                            title="Edit Piece"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 text-[var(--portal-danger)] hover:bg-[var(--portal-danger-soft)] rounded transition-colors disabled:opacity-50"
                            title="Delete Piece"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerProductsPage
