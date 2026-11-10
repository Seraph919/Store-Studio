import React from 'react'
import type { Product, Category, PublicStorefront } from '../../types'
import type { ParsedStoreDesign } from '../../types/design'
import { HeroSectionRenderer } from '../sections/HeroSectionRenderer'
import { CategoriesSectionRenderer } from '../sections/CategoriesSectionRenderer'
import { FeaturedProductsSectionRenderer } from '../sections/FeaturedProductsSectionRenderer'
import { BrandStorySectionRenderer } from '../sections/BrandStorySectionRenderer'
import { ProductCollectionSectionRenderer } from '../sections/ProductCollectionSectionRenderer'
import { ReviewsSectionRenderer } from '../sections/ReviewsSectionRenderer'
import { PromotionalBannerSectionRenderer } from '../sections/PromotionalBannerSectionRenderer'
import { Layers } from 'lucide-react'

export interface TemplateProps {
  design?: ParsedStoreDesign
  storefront?: PublicStorefront
  storeName: string
  storeTagline?: string
  logoUrl?: string
  products: Product[]
  categories?: Category[]
  isPreview?: boolean
  isEditMode?: boolean
  selectedSectionId?: string | null
  onSelectSection?: (sectionId: string) => void
}

export const EditorialTemplate: React.FC<TemplateProps> = ({
  design,
  storeName,
  storeTagline,
  products,
  categories,
  isPreview = false,
  isEditMode = false,
  selectedSectionId,
  onSelectSection,
}) => {
  const sections = design?.config?.sections || []

  const renderSection = (sec: import('../../types/design').StoreSection) => {
    switch (sec.type) {
      case 'Hero':
        return (
          <HeroSectionRenderer
            section={sec}
            template="EDITORIAL"
            storeName={storeName}
            storeTagline={storeTagline}
            isPreview={isPreview}
          />
        )
      case 'Categories':
        return (
          <CategoriesSectionRenderer
            section={sec}
            template="EDITORIAL"
            categories={categories}
          />
        )
      case 'FeaturedProducts':
        return (
          <FeaturedProductsSectionRenderer
            section={sec}
            template="EDITORIAL"
            products={products}
            isPreview={isPreview}
          />
        )
      case 'BrandStory':
        return (
          <BrandStorySectionRenderer
            section={sec}
            template="EDITORIAL"
            storeName={storeName}
            isPreview={isPreview}
          />
        )
      case 'ProductCollection':
        return (
          <ProductCollectionSectionRenderer
            section={sec}
            template="EDITORIAL"
            products={products}
            isPreview={isPreview}
          />
        )
      case 'Reviews':
        return (
          <ReviewsSectionRenderer
            isPreview={isPreview}
            section={sec}
            template="EDITORIAL"
            storeName={storeName}
          />
        )
      case 'PromotionalBanner':
        return (
          <PromotionalBannerSectionRenderer
            section={sec}
            template="EDITORIAL"
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col min-h-screen">

      <div className="flex-1">
        {sections.map((section) => {
          if (!section.enabled && !isEditMode) return null

          const isSelected = selectedSectionId === section.id

          return (
            <div
              key={section.id}
              data-section-id={section.id}
              id={`section-${section.id}`}
              tabIndex={isEditMode ? 0 : undefined}
              role={isEditMode ? 'region' : undefined}
              aria-label={isEditMode ? `Edit ${section.type}` : undefined}
              onKeyDown={event => {
                if (isEditMode && event.target === event.currentTarget && ['Enter', ' '].includes(event.key)) {
                  event.preventDefault(); onSelectSection?.(section.id)
                }
              }}
              onClick={(e) => {
                if (isEditMode) {
                  e.stopPropagation()
                  onSelectSection?.(section.id)
                }
              }}
              className={
                isEditMode
                  ? `store-section-wrapper is-editable ${isSelected ? 'is-active' : ''} ${
                      !section.enabled ? 'opacity-40 filter grayscale' : ''
                    }`
                  : ''
              }
            >
              {isEditMode && (
                <div className="store-section-tag">
                  <Layers className="w-3 h-3" />
                  <span>
                    {section.type} {!section.enabled && '(Hidden)'}
                  </span>
                </div>
              )}
              {renderSection(section)}
            </div>
          )
        })}

      </div>

    </div>
  )
}
