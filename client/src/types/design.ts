import type { StoreSettings } from '../services/settingsApi'

export type StoreBranding = Pick<StoreSettings, 'storeName' | 'storeTagline' | 'logoUrl' | 'logoDarkUrl' | 'showRingSizeGuide'>

export type StorefrontTemplateId = 'EDITORIAL' | 'MINIMAL' | 'MODERN'
export type StorefrontThemeMode = 'LIGHT' | 'DARK'
export type StorePaletteId = 'CHAMPAGNE' | 'NAVY_GOLD' | 'MONOCHROME' | 'FOREST_COPPER'
export type StorefrontFontPreset = 'ELEGANT' | 'MODERN' | 'CLASSIC'

export type StoreSectionType =
  | 'Hero'
  | 'Categories'
  | 'FeaturedProducts'
  | 'BrandStory'
  | 'ProductCollection'
  | 'Reviews'
  | 'PromotionalBanner'

export interface HeroSectionSettings {
  eyebrow?: string
  title?: string
  intro?: string
  cta?: string
  ctaLink?: string
  imageUrl?: string
  alignment?: 'left' | 'center' | 'right'
  overlayOpacity?: number
  mediaType?: 'static' | 'video'
  videoUrl?: string
}

export interface CategoriesSectionSettings {
  title?: string
  subtitle?: string
  maxCategories?: number
}

export interface FeaturedProductsSectionSettings {
  title?: string
  subtitle?: string
  strategy?: 'featured' | 'newest' | 'bestsellers' | 'custom'
  columns?: number
  maxProducts?: number
  productIds?: number[]
}

export interface BrandStorySectionSettings {
  eyebrow?: string
  title?: string
  description?: string
  cta?: string
  ctaLink?: string
  imageUrl?: string
}

export interface ProductCollectionSectionSettings {
  title?: string
  subtitle?: string
  strategy?: 'packs' | 'category' | 'curated'
  categoryName?: string
  columns?: number
  maxProducts?: number
}

export interface ReviewsSectionSettings {
  eyebrow?: string
  title?: string
  subtitle?: string
}

export interface PromotionalBannerSectionSettings {
  text?: string
  ctaText?: string
  ctaLink?: string
  bgColor?: string
  textColor?: string
}

export type SectionSettings = HeroSectionSettings & CategoriesSectionSettings &
  Omit<FeaturedProductsSectionSettings, 'strategy'> & BrandStorySectionSettings &
  Omit<ProductCollectionSectionSettings, 'strategy'> & ReviewsSectionSettings &
  PromotionalBannerSectionSettings & { strategy?: 'featured' | 'newest' | 'bestsellers' | 'custom' | 'category' | 'packs' | 'curated' }

export interface StoreSection<T = SectionSettings> {
  id: string
  type: StoreSectionType
  variant: string
  enabled: boolean
  settings: T
}

/** One independently editable homepage and appearance per available template. */
export interface TemplateDesignSnapshot {
  sections: StoreSection[]
  colorMode: StorefrontThemeMode
  paletteId: StorePaletteId
  accentColor: string
  fontPreset: StorefrontFontPreset
}

export interface StoreDesignConfig {
  /** Sections for the currently published/selected template (backward compatible). */
  sections: StoreSection[]
  /** Saved, independent drafts for other templates. Stored in designConfig JSON. */
  templateDrafts?: Partial<Record<StorefrontTemplateId, TemplateDesignSnapshot>>
}

export interface StoreDesignDto {
  id: number
  template: StorefrontTemplateId
  colorMode: StorefrontThemeMode
  paletteId: StorePaletteId
  accentColor: string
  fontPreset: StorefrontFontPreset
  branding?: StoreBranding
  designConfig: string
  updatedAt?: string
}

export interface UpdateStoreDesignDto {
  template: StorefrontTemplateId
  colorMode: StorefrontThemeMode
  paletteId: StorePaletteId
  accentColor: string
  fontPreset: StorefrontFontPreset
  branding?: StoreBranding
  designConfig: string
}

export interface ParsedStoreDesign {
  id: number
  template: StorefrontTemplateId
  colorMode: StorefrontThemeMode
  paletteId: StorePaletteId
  accentColor: string
  fontPreset: StorefrontFontPreset
  branding?: StoreBranding
  config: StoreDesignConfig
  updatedAt?: string
}
