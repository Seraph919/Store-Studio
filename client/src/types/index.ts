export interface User {
  id: number
  name: string
  email: string
  role?: string
  status?: string
  createdAt?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface JwtResponse {
  token: string
}

export type PaymentMode = 'COD' | 'DEPOSIT' | 'PREPAID'

export interface Product {
  id: number
  name: string
  description?: string
  price: number
  originalPrice?: number
  discountRate?: number
  isPack?: boolean
  paymentMode?: PaymentMode
  depositPercent?: number | null
  quantity: number
  categoryId?: number
  categoryName?: string
  images?: string[]
  videoUrl?: string
  isListed?: boolean
  thumbnailUrl?: string
  hoverImageUrl?: string
  imageAspect?: 'square' | 'portrait' | 'landscape'
  imageFit?: 'cover' | 'contain'
  imagePositionX?: number
  imagePositionY?: number
  imageZoom?: number
  sellerId?: number
  store?: {
    name: string
    slug: string
  }
}

export interface CreateProductRequest {
  name: string
  description?: string
  price: number
  originalPrice?: number
  discountRate?: number
  isPack?: boolean
  paymentMode?: PaymentMode
  depositPercent?: number | null
  quantity: number
  categoryId?: number
  categoryName?: string
  images?: string[]
  videoUrl?: string
  isListed?: boolean
}

export interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface CartItem {
  id: number
  productId: number
  productName: string
  paymentMode?: PaymentMode
  depositPercent?: number | null
  price?: number
  unitPrice?: number
  quantity: number
  itemTotalPrice?: number
  subtotal?: number
  thumbnailUrl?: string
}

export interface Cart {
  id: string
  cartId?: string
  userId?: number
  items: CartItem[]
  totalPrice: number
}

export interface CartCreatedResponse {
  cartId: string
}

export interface AddItemToCartRequest {
  productId: number
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

export interface OrderItem {
  id?: number
  orderId?: number
  sellerOrderId?: number
  productId: number
  productName?: string
  thumbnailUrl?: string
  sellerId?: number
  sellerName?: string
  quantity: number
  price?: number
  unitPrice?: number
  subtotal?: number
  paymentMode?: PaymentMode
  depositPercent?: number | null
  upfrontAmount?: number
}

export interface SellerOrder {
  id: number
  orderId: number
  publicOrderReference?: string
  sellerId: number
  sellerName?: string
  sellerEmail?: string
  status: string
  subtotal: number
  upfrontAmount?: number
  deliveryAmount?: number
  upfrontPaymentConfirmed?: boolean
  customerName: string
  phoneNumber: string
  shippingAddress: string
  city: string
  customerEmail?: string
  createdAt: string
  updatedAt?: string
  items: OrderItem[]
}

export interface Order {
  id: number
  publicOrderReference?: string
  guestName: string
  phoneNumber: string
  shippingAddress: string
  city: string
  guestEmail: string
  totalPrice: number
  shippingFee?: number
  upfrontAmount?: number
  deliveryAmount?: number
  upfrontPaymentConfirmed?: boolean
  status: string
  createdAt: string
  items: OrderItem[]
  sellerOrders?: SellerOrder[]
}

export interface TrackingItem {
  productName: string
  quantity: number
  unitPrice: number
  thumbnailUrl?: string
}

export interface OrderTracking {
  publicOrderReference: string
  status: string
  city: string
  totalPrice: number
  createdAt: string
  items: TrackingItem[]
}

export interface CreateOrderRequest {
  cartId: string
  guestName: string
  phoneNumber: string
  shippingAddress: string
  city: string
  guestEmail: string
}

export interface UpdateOrderStatusRequest {
  status: string
}

export interface Feedback {
  id: number
  productId?: number | null
  productName?: string | null
  sellerId?: number | null
  sellerName?: string | null
  customerName: string
  comment: string
  rating: number
  createdAt: string
  isStoreReview: boolean
  isVisible?: boolean
}

export interface CreateFeedbackRequest {
  productId?: number | null
  customerName: string
  comment: string
  rating: number
  isVisible?: boolean
}

export interface SellerMediaConfig {
  thumbnailUrl?: string
  hoverImageUrl?: string
  imageAspect?: 'square' | 'portrait' | 'landscape'
  imageFit?: 'cover' | 'contain'
  imagePositionX?: number
  imagePositionY?: number
  imageZoom?: number
  isListed?: boolean
  images?: string[]
}

export interface SellerKpis {
  pendingCallConfirmationsCount: number
  todayRevenue: number
  monthRevenue: number
  ordersByStatus: Record<string, number>
  lowStockProducts: Product[]
}

export interface AdminAnalytics {
  gmv: number
  platformRevenue: number
  totalRegisteredSellers: number
  totalVisits: number
  totalOrders: number
  visitOrderConversionRate: number
  totalActiveListings: number
  fulfillmentConversionRate: number
  ordersByStatus: Record<string, number>
}

export interface AdminHealth {
  databaseStatus: string
  databaseLatencyMs: number
  cachingStatus: string
  jvmMemoryUsedMb: number
  jvmMemoryMaxMb: number
  uptimeSeconds: number
}

export interface Category {
  id: number
  name: string
  productCount?: number
}

// ==========================================
// SELLER STOREFRONT TEMPLATE SYSTEM
// ==========================================

export type StorefrontTemplateId = 'EDITORIAL' | 'MINIMAL' | 'MODERN'
export type StorefrontThemeMode = 'LIGHT' | 'DARK'
export type StorefrontFontPreset = 'ELEGANT' | 'MODERN' | 'CLASSIC'

export interface StoreHero {
  imageUrl?: string
  title?: string
  subtitle?: string
}

export interface StoreTheme {
  mode: StorefrontThemeMode
  accentColor: string
  fontPreset: StorefrontFontPreset
}

export interface StoreSections {
  showFeaturedProducts: boolean
  showReviews: boolean
  showAboutSection: boolean
}

export interface StoreAbout {
  title?: string
  text?: string
  imageUrl?: string
}

export interface PublicStorefront {
  slug: string
  storeName: string
  tagline?: string
  logoUrl?: string
  hero?: StoreHero
  templateId: StorefrontTemplateId
  theme: StoreTheme
  sections: StoreSections
  about?: StoreAbout
  featuredProducts: Product[]
}

export interface SellerStorefront {
  id: number
  sellerId: number
  slug: string
  storeName: string
  tagline?: string
  logoUrl?: string
  heroImageUrl?: string
  heroTitle?: string
  heroSubtitle?: string
  templateId: StorefrontTemplateId
  themeMode: StorefrontThemeMode
  accentColor: string
  fontPreset: StorefrontFontPreset
  showFeaturedProducts: boolean
  showReviews: boolean
  showAboutSection: boolean
  aboutTitle?: string
  aboutText?: string
  aboutImageUrl?: string
  featuredProductIds: number[]
  featuredProducts: Product[]
  createdAt: string
  updatedAt: string
}

export interface UpdateSellerStorefront {
  storeName: string
  slug: string
  tagline?: string
  logoUrl?: string
  heroImageUrl?: string
  heroTitle?: string
  heroSubtitle?: string
  templateId: StorefrontTemplateId
  themeMode: StorefrontThemeMode
  accentColor: string
  fontPreset: StorefrontFontPreset
  showFeaturedProducts: boolean
  showReviews: boolean
  showAboutSection: boolean
  aboutTitle?: string
  aboutText?: string
  aboutImageUrl?: string
  featuredProductIds: number[]
}
