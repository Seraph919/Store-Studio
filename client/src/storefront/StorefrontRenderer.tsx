import React from 'react'
import type { Product, Category, PublicStorefront, StorefrontTemplateId } from '../types'
import type { StoreDesignDto, ParsedStoreDesign } from '../types/design'
import { parseStoreDesign } from '../services/storeApi'
import type { StoreSettings } from '../services/settingsApi'
import { EditorialTemplate, type TemplateProps } from './templates/EditorialTemplate'
import { MinimalTemplate } from './templates/MinimalTemplate'
import { ModernTemplate } from './templates/ModernTemplate'
import './storefront.css'

const STORE_TEMPLATE_REGISTRY: Record<StorefrontTemplateId, React.FC<TemplateProps>> = {
  EDITORIAL: EditorialTemplate,
  MINIMAL: MinimalTemplate,
  MODERN: ModernTemplate,
}

export interface StorefrontRendererProps {
  design?: ParsedStoreDesign | StoreDesignDto | null
  storefront?: PublicStorefront
  storeSettings?: StoreSettings | null
  storeName?: string
  storeTagline?: string
  logoUrl?: string
  products?: Product[]
  categories?: Category[]
  isPreview?: boolean
  isEditMode?: boolean
  selectedSectionId?: string | null
  onSelectSection?: (sectionId: string) => void
}

export const StorefrontRenderer: React.FC<StorefrontRendererProps> = ({
  design,
  storefront,
  storeSettings,
  storeName: explicitStoreName,
  storeTagline: explicitStoreTagline,
  logoUrl: explicitLogoUrl,
  products = [],
  categories = [],
  isPreview = false,
  isEditMode = false,
  selectedSectionId,
  onSelectSection,
}) => {
  // Resolve ParsedStoreDesign
  let resolvedDesign: ParsedStoreDesign
  if (design && 'config' in design) {
    resolvedDesign = design as ParsedStoreDesign
  } else if (design) {
    resolvedDesign = parseStoreDesign(design as StoreDesignDto)
  } else if (storefront) {
    // Backwards compatibility adaptor from PublicStorefront
    resolvedDesign = {
      id: 1,
      template: storefront.templateId || 'MINIMAL',
      colorMode: storefront.theme?.mode || 'LIGHT',
      paletteId: 'CHAMPAGNE',
      accentColor: storefront.theme?.accentColor || '#F4B400',
      fontPreset: storefront.theme?.fontPreset || 'ELEGANT',
      config: {
        sections: [
          {
            id: 'hero',
            type: 'Hero',
            variant: 'fullscreen',
            enabled: true,
            settings: {
              title: storefront.hero?.title || storefront.storeName,
              intro: storefront.hero?.subtitle || storefront.tagline,
              imageUrl: storefront.hero?.imageUrl,
            },
          },
          ...(storefront.sections?.showFeaturedProducts
            ? [
                {
                  id: 'featured-products',
                  type: 'FeaturedProducts' as const,
                  variant: 'editorial-grid',
                  enabled: true,
                  settings: {
                    title: 'Featured Pieces',
                  },
                },
              ]
            : []),
          ...(storefront.sections?.showReviews
            ? [
                {
                  id: 'reviews',
                  type: 'Reviews' as const,
                  variant: 'grid',
                  enabled: true,
                  settings: {
                    title: 'Words from Our Patrons',
                  },
                },
              ]
            : []),
        ],
      },
    }
  } else {
    resolvedDesign = parseStoreDesign(null)
  }

  // Resolve Store Branding
  const resolvedStoreName =
    explicitStoreName ||
    storeSettings?.storeName ||
    storefront?.storeName ||
    'Store Studio'
  const resolvedStoreTagline =
    explicitStoreTagline ||
    storeSettings?.storeTagline ||
    storefront?.tagline ||
    'A minimal storefront starter sellers can personalize'
  const resolvedLogoUrl =
    explicitLogoUrl ||
    storeSettings?.logoUrl ||
    storefront?.logoUrl

  const templateKey = (resolvedDesign.template || 'MINIMAL').toUpperCase() as StorefrontTemplateId
  const Template = STORE_TEMPLATE_REGISTRY[templateKey] || EditorialTemplate

  return (
    <div
      className="storefront-home w-full"
    >
      <Template
        design={resolvedDesign}
        storefront={storefront}
        storeName={resolvedStoreName}
        storeTagline={resolvedStoreTagline}
        logoUrl={resolvedLogoUrl}
        products={products}
        categories={categories}
        isPreview={isPreview}
        isEditMode={isEditMode}
        selectedSectionId={selectedSectionId}
        onSelectSection={onSelectSection}
      />
    </div>
  )
}
