import { apiFetch } from './apiClient'

export interface HeroLayeredConfig {
  bgImage?: string
  bgColor?: string
  cutoutImage?: string
  cutoutImage2?: string
  showSolidText?: boolean // true = solid text visible behind cutout, false = totally invisible
  showOutlineText?: boolean // true = 3D hollow outline stroke over cutout
  strokeColor?: 'white' | 'gold' | 'black'
  cutoutScale?: 'compact' | 'normal' | 'large'
  // Flexible freeform resizing & positioning for Cutout 1
  cutoutHeight?: number // 20 to 300 (% of viewport height)
  cutoutVerticalOffset?: number // -100 to 100 (% vertical shift)
  cutoutHorizontalOffset?: number // -100 to 100 (% horizontal shift)
  // Headline Title
  titleFontSize?: number // 20 to 220 (px)
  titleTopOffset?: number // 0 to 95 (% from top)
  titleHorizontalOffset?: number // -60 to 60 (% horizontal shift from center)
  strokeWidth?: number // 1 to 6 (px)
  // Eyebrow
  eyebrowTopOffset?: number // 0 to 95 (% from top)
  eyebrowHorizontalOffset?: number // -60 to 60 (% horizontal shift from center)
  eyebrowFontSize?: number // 8 to 32 (px)
  // Subtitle / Intro
  introTopOffset?: number // 0 to 95 (% from top)
  introHorizontalOffset?: number // -60 to 60 (% horizontal shift from center)
  introFontSize?: number // 10 to 40 (px)
  introMaxWidth?: number // 240 to 1200 (px)
  // CTA Button
  ctaTopOffset?: number // 0 to 95 (% from top)
  ctaHorizontalOffset?: number // -60 to 60 (% horizontal shift from center)
  ctaFontSize?: number // 10 to 30 (px)
  // Cutout 2
  cutout2Height?: number // 10 to 70 (% of viewport height)
  cutout2BottomOffset?: number // 0 to 50 (%)
  cutout2RightOffset?: number // 0 to 50 (%)
  // Atmosphere & Fit
  bgOverlayOpacity?: number // 0 to 100 (%)
  fitMode?: 'custom' | 'match_bg' // 'match_bg' locks cutout to exact 1:1 dimensions of background photo
  cutoutFit?: 'cover' | 'contain' // 'cover' covers full screen, 'contain' fits inside
  scalePercent?: number // 20 to 300 (%)
  // Dedicated Mobile View Overrides
  mobileConfig?: HeroLayeredMobileConfig
}

export interface HeroLayeredMobileConfig {
  titleFontSize?: number // 16 to 80 (px)
  titleTopOffset?: number // 5 to 60 (% from top)
  titleHorizontalOffset?: number // -50 to 50 (% horizontal shift)
  cutoutHeight?: number // 20 to 120 (% of viewport)
  cutoutVerticalOffset?: number // -50 to 60 (% vertical shift)
  cutoutHorizontalOffset?: number // -50 to 50 (% horizontal shift)
  scalePercent?: number // 30 to 250 (%)
  fitMode?: 'custom' | 'match_bg'
  cutoutFit?: 'cover' | 'contain'
  eyebrowTopOffset?: number // 2 to 30 (% from top)
  eyebrowFontSize?: number // 8 to 20 (px)
  introTopOffset?: number // % from top (or undefined for bottom placement)
  introFontSize?: number // 10 to 22 (px)
  ctaTopOffset?: number // % from top (or undefined for bottom placement)
  ctaFontSize?: number // 9 to 20 (px)
  bgOverlayOpacity?: number // 0 to 100 (%)
}

export interface HeroMobileConfig {
  enabled?: boolean
  mediaType?: 'static' | 'video' | 'inherit'
  videoUrl?: string
  bgImage?: string
  heroEyebrow?: string
  heroTitle?: string
  heroIntro?: string
  heroCta?: string
}

export type ShippingMode = 'FREE' | 'FLAT' | 'FREE_ABOVE'
export interface StoreSettings {
  shippingMode?: ShippingMode
  shippingFee?: number
  freeShippingThreshold?: number | null
  storeName?: string
  storeTagline?: string
  logoUrl?: string
  logoDarkUrl?: string
  showRingSizeGuide?: boolean

  phone?: string
  email?: string
  timing?: string
  address?: string

  heroEyebrow?: string
  heroTitle?: string
  heroIntro?: string
  heroCta?: string
  heroMediaType?: 'static' | 'video'
  heroVideoUrl?: string
  heroLayered?: HeroLayeredConfig
  heroMobile?: HeroMobileConfig

  story1Eyebrow?: string
  story1Title?: string
  story1Intro?: string
  story1Cta?: string
  story1Image?: string
  story1ProductId?: number

  story2Eyebrow?: string
  story2Title?: string
  story2Intro?: string
  story2Cta?: string
  story2Image?: string
  story2ProductId?: number

  categoryOverrides?: string
  sectionOverrides?: string
  qrCodeUrl?: string
  whatsappNumber?: string
  updatedAt?: string
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  showRingSizeGuide: false,
  storeName: 'Store Studio',
  shippingMode: 'FREE',
  shippingFee: 0,
  freeShippingThreshold: null,
  storeTagline: 'A minimal storefront starter sellers can make their own',
  phone: '',
  email: '',
  timing: '',
  address: '',
  whatsappNumber: '',
  heroEyebrow: 'store studio',
  heroTitle: 'Launch a clean storefront that feels like your brand',
  heroIntro: 'Start with a calm, minimal storefront foundation. Sellers can replace the default identity, update the logo, and customize every section to match their business.',
  heroCta: 'Explore the store',
  story1Eyebrow: 'simple by default',
  story1Title: 'A storefront that starts clean',
  story1Intro: 'No layered hero composition, no heavy visual noise, and no locked-in brand. Sellers can keep the starter identity or replace it with their own.',
  story1Cta: 'See featured products',
  story2Eyebrow: 'made to adapt',
  story2Title: 'Ready for customization',
  story2Intro: 'From colors and sections to logo and hero copy, the base experience is neutral so each seller can turn it into their own storefront without reworking the whole platform.',
  story2Cta: 'Customize the experience',
}

export const settingsApi = {
  getSettings: async (): Promise<StoreSettings> => {
    return apiFetch<StoreSettings>('/api/v1/settings')
  },

  clearSettingsCache: () => {
    // No-op: Cache lifecycle is handled by TanStack Query
  },

  updateSettings: async (settings: Partial<StoreSettings>): Promise<StoreSettings> => {
    return apiFetch<StoreSettings>('/api/v1/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  },
}

