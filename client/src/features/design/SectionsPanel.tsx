import React, { useState } from 'react'
import {
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Layout,
  Image,
  ShoppingBag,
  BookOpen,
  MessageSquare,
  Sparkles,
} from 'lucide-react'
import type { StoreSection, StoreSectionType } from '../../types/design'

interface SectionsPanelProps {
  sections: StoreSection[]
  selectedSectionId: string | null
  onSelectSection: (id: string) => void
  onToggleVisibility: (id: string) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onDeleteSection: (id: string) => void
  onAddSection: (type: StoreSectionType) => void
}

const SECTION_TYPE_META: Record<
  StoreSectionType,
  { label: string; icon: React.FC<{ className?: string }>; description: string }
> = {
  Hero: { label: 'Homepage banner', icon: Image, description: 'Heading, image, and a button linking to a page' },
  Categories: { label: 'Categories', icon: Layout, description: 'Links to product categories' },
  FeaturedProducts: { label: 'Featured products', icon: Sparkles, description: 'Products you choose to feature' },
  BrandStory: { label: 'About the store', icon: BookOpen, description: 'Text and an image about your business' },
  ProductCollection: { label: 'Product collection', icon: ShoppingBag, description: 'Product packs or a category grid' },
  Reviews: { label: 'Customer reviews', icon: MessageSquare, description: 'Reviews shown in your store' },
  PromotionalBanner: { label: 'Announcement bar', icon: Sparkles, description: 'Highlighted offer or shipping notice' },
}

export const SectionsPanel: React.FC<SectionsPanelProps> = ({
  sections,
  selectedSectionId,
  onSelectSection,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  onDeleteSection,
  onAddSection,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false)

  const availableSectionTypes: StoreSectionType[] = [
    'Hero',
    'Categories',
    'FeaturedProducts',
    'BrandStory',
    'ProductCollection',
    'Reviews',
    'PromotionalBanner',
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header and Add Section action */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Storefront Sections
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Click to edit content • Reorder layout
          </p>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-500/30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>

          {showAddMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowAddMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1.5 w-60 rounded-xl bg-white border border-slate-300 shadow-2xl p-1.5 z-50 divide-y divide-[#252830]">
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  Add Section
                </div>
                <div className="py-1 space-y-0.5">
                  {availableSectionTypes.map((type) => {
                    const meta = SECTION_TYPE_META[type]
                    const Icon = meta.icon
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          onAddSection(type)
                          setShowAddMenu(false)
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-slate-800 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-2.5 transition-colors group"
                      >
                        <div className="p-1 rounded bg-slate-100 group-hover:bg-amber-100 group-hover:text-amber-700">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 truncate">
                          <span className="font-medium block">{meta.label}</span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {meta.description}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sections.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Layout className="w-8 h-8 text-[#545d6e] mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-medium">No sections on storefront</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Click &quot;Add&quot; above to add your first section.
            </p>
          </div>
        ) : (
          sections.map((sec, index) => {
            const meta = SECTION_TYPE_META[sec.type] || {
              label: sec.type,
              icon: Layout,
              description: '',
            }
            const Icon = meta.icon
            const isSelected = selectedSectionId === sec.id

            return (
              <div
                key={sec.id}
                className={`p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-amber-50 border-amber-500 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Left: Click to inspect */}
                  <button
                    type="button"
                    onClick={() => onSelectSection(sec.id)}
                    className="flex-1 flex items-center gap-3 text-left min-w-0"
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {sec.settings.title || meta.label}
                        </span>
                        {!sec.enabled && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            Hidden
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono block">
                        {meta.label} • {sec.variant || 'default'}
                      </span>
                    </div>
                  </button>

                  {/* Actions: Visibility, Reorder, Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleVisibility(sec.id)}
                      title={sec.enabled ? 'Hide on storefront' : 'Show on storefront'}
                      className={`p-1.5 rounded hover:bg-slate-100 transition-colors ${
                        sec.enabled ? 'text-slate-600' : 'text-amber-400'
                      }`}
                    >
                      {sec.enabled ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => onMoveUp(index)}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-0.5 rounded text-slate-500 hover:text-slate-900 disabled:opacity-20 transition-colors"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveDown(index)}
                        disabled={index === sections.length - 1}
                        title="Move Down"
                        className="p-0.5 rounded text-slate-500 hover:text-slate-900 disabled:opacity-20 transition-colors"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remove "${meta.label}" section?`)) {
                          onDeleteSection(sec.id)
                        }
                      }}
                      title="Remove Section"
                      className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
