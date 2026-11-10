import React, { useState, useEffect, useMemo } from 'react'
import {
  Layers,
  Search,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react'
import { adminApi } from '../../services/adminApi'
import { formatPrice } from '../../utils/formatPrice'
import type { Product } from '../../types'

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadProducts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await adminApi.getAllProducts()
      setProducts(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve platform products.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleToggleListing = async (id: number) => {
    setTogglingId(id)
    try {
      const updated = await adminApi.toggleProductListing(id)
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isListed: updated.isListed } : p))
      )
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to toggle product status.')
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Permanently remove "${name}" from the platform catalog?`)) {
      return
    }
    setDeletingId(id)
    try {
      await adminApi.deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete piece.')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
        String(p.id).includes(q) ||
        (p.sellerId && String(p.sellerId).includes(q))
    )
  }, [products, searchQuery])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)]">
        <div>
          <h1 className="text-2xl font-serif text-[var(--portal-text)] mt-1">Products</h1>
          <p className="text-sm leading-relaxed text-[var(--portal-muted)] mt-2">
            Review product listings and manage their availability.
          </p>
        </div>

        <button
          type="button"
          onClick={loadProducts}
          disabled={isLoading}
          className="p-2.5 bg-[var(--portal-surface-alt)] hover:bg-[var(--portal-hover)] text-[var(--portal-muted)] hover:text-[var(--portal-text)] rounded-xl border border-[var(--portal-border)] transition-colors self-start sm:self-auto"
          title="Refresh products"
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin text-[var(--portal-accent-text)]' : ''} />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-[var(--portal-danger-soft)] border border-[var(--portal-danger-border)] rounded-xl flex items-center gap-3 text-xs text-[var(--portal-danger)]">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search */}
      <div className="flex justify-end">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, seller ID, category..."
            className="w-full pl-9 pr-4 py-2 bg-[var(--portal-surface)] border border-[var(--portal-border)] rounded-xl text-xs text-[var(--portal-text)] placeholder-[var(--portal-placeholder)] focus:border-[var(--portal-accent)] focus:outline-none"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--portal-muted)]" />
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="p-16 text-center text-[var(--portal-accent-text)]">
          <div className="w-8 h-8 border-2 border-[var(--portal-accent-border)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs uppercase tracking-widest text-[var(--portal-muted)]">Scanning catalog...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)] text-[var(--portal-muted)]">
          <Layers size={32} className="mx-auto mb-3 text-[var(--portal-placeholder)]" />
          <p className="text-sm">No products found matching your search.</p>
        </div>
      ) : (
        <div className="bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--portal-surface-alt)] text-[10px] uppercase font-mono tracking-wider text-[var(--portal-muted)] border-b border-[var(--portal-border)]">
                <tr>
                  <th className="py-3.5 px-4 font-medium">Piece Details</th>
                  <th className="py-3.5 px-4 font-medium">Seller ID</th>
                  <th className="py-3.5 px-4 font-medium">Category</th>
                  <th className="py-3.5 px-4 font-medium">Price</th>
                  <th className="py-3.5 px-4 font-medium">Stock</th>
                  <th className="py-3.5 px-4 font-medium text-center">Visibility</th>
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
                          <div className="w-10 h-10 rounded-lg bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {thumb ? (
                              <img src={thumb} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={16} className="text-[var(--portal-accent-text)]" />
                            )}
                          </div>
                          <div>
                            <span className="text-[var(--portal-text)] font-medium block">{p.name}</span>
                            <span className="text-[10px] text-[var(--portal-muted)] font-mono">Product #{p.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[var(--portal-accent-text)]">
                        {p.sellerId ? `Seller #${p.sellerId}` : 'Platform'}
                      </td>

                      <td className="py-3.5 px-4 text-[var(--portal-muted)]">
                        {p.categoryName || 'Unassigned'}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-[var(--portal-accent-text)]">
                        {formatPrice(p.price)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[var(--portal-text)]">
                        {p.quantity}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => handleToggleListing(p.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                            p.isListed !== false
                              ? 'bg-[var(--portal-success-soft)] text-[var(--portal-success)] border border-[var(--portal-success-border)]'
                              : 'bg-[var(--portal-danger-soft)] text-[var(--portal-danger)] border border-[var(--portal-danger-border)]'
                          }`}
                        >
                          {p.isListed !== false ? <Eye size={11} /> : <EyeOff size={11} />}
                          <span>{p.isListed !== false ? 'Live' : 'Hidden'}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-[var(--portal-danger)] hover:bg-[var(--portal-danger-soft)] rounded transition-colors disabled:opacity-50"
                          title="Delete Piece"
                        >
                          <Trash2 size={14} />
                        </button>
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

export default AdminProductsPage
