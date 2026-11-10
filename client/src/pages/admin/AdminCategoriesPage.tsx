import React, { useState, useEffect } from 'react'
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Save,
  X,
} from 'lucide-react'
import { adminApi } from '../../services/adminApi'
import { invalidateStoreCategories } from '../../hooks/useStoreQueries'
import type { Category } from '../../types'

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [newCatName, setNewCatName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [editName, setEditName] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const loadCategories = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await adminApi.getCategories()
      setCategories(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve categories.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCatName.trim()) return
    setIsCreating(true)
    setError(null)
    try {
      const created = await adminApi.createCategory(newCatName.trim())
      setCategories((prev) => [...prev, created])
      setNewCatName('')
      invalidateStoreCategories()
      setSuccessMsg('Category created successfully.')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create category.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleStartEdit = (cat: Category) => {
    setEditingCat(cat)
    setEditName(cat.name)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCat || !editName.trim()) return
    setIsUpdating(true)
    try {
      const updated = await adminApi.updateCategory(editingCat.id, editName.trim())
      setCategories((prev) => prev.map((c) => (c.id === editingCat.id ? updated : c)))
      setEditingCat(null)
      invalidateStoreCategories()
      setSuccessMsg('Category updated successfully.')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update category.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete category "${name}"? Existing products may need reassignment.`)) {
      return
    }
    try {
      await adminApi.deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      invalidateStoreCategories()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete category.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)]">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--portal-accent-text)]">
            Taxonomy Architecture
          </span>
          <h1 className="text-2xl font-serif text-[var(--portal-text)] mt-1">Product Categories</h1>
          <p className="text-xs text-[var(--portal-muted)] mt-1">
            Organize the storefront taxonomy, filters, and collection hierarchies.
          </p>
        </div>

        <button
          type="button"
          onClick={loadCategories}
          disabled={isLoading}
          className="p-2.5 bg-[var(--portal-surface-alt)] hover:bg-[var(--portal-hover)] text-[var(--portal-muted)] hover:text-[var(--portal-text)] rounded-xl border border-[var(--portal-border)] transition-colors self-start sm:self-auto"
          title="Refresh categories"
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

      {successMsg && (
        <div className="p-4 bg-[var(--portal-success-soft)] border border-[var(--portal-success-border)] rounded-xl flex items-center gap-3 text-xs text-[var(--portal-success)]">
          <CheckCircle size={16} className="flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Create Category Form */}
      <div className="p-6 bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)]">
        <h2 className="text-sm font-serif text-[var(--portal-text)] mb-3 flex items-center gap-2">
          <Plus size={16} className="text-[var(--portal-accent-text)]" />
          <span>Create New Category</span>
        </h2>

        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="e.g. Brooches & Pins"
            className="flex-1 px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-xs text-[var(--portal-text)] placeholder-[var(--portal-placeholder)] focus:border-[var(--portal-accent)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={isCreating}
            className="px-6 py-2.5 bg-[var(--portal-danger-strong)] hover:bg-[var(--portal-danger-hover)] text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Plus size={14} />
            <span>{isCreating ? 'Adding...' : 'Add Category'}</span>
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)] overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-[var(--portal-accent-text)]">
            <div className="w-8 h-8 border-2 border-[var(--portal-accent-border)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="text-xs uppercase tracking-widest text-[var(--portal-muted)]">Loading taxonomy...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-[var(--portal-muted)]">
            <FolderTree size={32} className="mx-auto mb-3 text-[var(--portal-placeholder)]" />
            <p className="text-sm">No custom categories registered.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--portal-border)]">
            {categories.map((c) => {
              const isItemEditing = editingCat?.id === c.id
              return (
                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-[var(--portal-hover)] transition-colors">
                  {isItemEditing ? (
                    <form onSubmit={handleUpdate} className="flex-1 flex items-center gap-3 mr-4">
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-accent-border)] rounded-lg text-xs text-[var(--portal-text)] focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="p-1.5 text-[var(--portal-success)] hover:bg-[var(--portal-success-soft)] rounded transition-colors"
                        title="Save"
                      >
                        <Save size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCat(null)}
                        className="p-1.5 text-[var(--portal-muted)] hover:text-[var(--portal-text)] rounded transition-colors"
                        title="Cancel"
                      >
                        <X size={15} />
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-3">
                      <FolderTree size={16} className="text-[var(--portal-accent-text)]" />
                      <span className="text-sm font-medium text-[var(--portal-text)]">{c.name}</span>
                      <span className="text-[10px] text-[var(--portal-muted)] font-mono">ID: #{c.id}</span>
                    </div>
                  )}

                  {!isItemEditing && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(c)}
                        className="p-1.5 text-[var(--portal-muted)] hover:text-[var(--portal-text)] hover:bg-[var(--portal-hover)] rounded transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-1.5 text-[var(--portal-danger)] hover:bg-[var(--portal-danger-soft)] rounded transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCategoriesPage
