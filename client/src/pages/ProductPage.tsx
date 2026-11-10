import { imageFrameStyle, imagePhotoStyle } from '../storefront/components/ProductMediaFrame'
import { StoreImage } from '../storefront/components/StoreImage'
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RefreshCw,
  Check,
  ChevronLeft,
  ChevronRight,
  Play,
  Star,
  ChevronRight as ChevronRightIcon,
  Ruler,
  Image as ImageIcon,
  Edit3,
  ArrowRight,
} from 'lucide-react'
import type { Product, Feedback } from '../types'
import { productApi, useRelatedProductsQuery } from '../services/productApi'
import { feedbackApi } from '../services/feedbackApi'
import { useCart } from '../context/useCart'
import { useAuth } from '../context/useAuth'
import { formatPrice } from '../utils/formatPrice'
import { paymentModeLabel } from '../utils/paymentTerms'
import ProductCard from '../components/ProductCard'
import { useStoreSettingsQuery } from '../hooks/useStoreQueries'

interface MediaItem {
  type: 'image' | 'video'
  url: string
}

export const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>()
  const numericId = productId ? parseInt(productId, 10) : NaN
  const navigate = useNavigate()
  const { addToCart, isLoading: isCartLoading } = useCart()
  const { user } = useAuth()
  const { data: storeSettings } = useStoreSettingsQuery()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0)
  const [reviews, setReviews] = useState<Feedback[]>([])

  const { data: relatedProducts } = useRelatedProductsQuery(numericId, 4)

  useEffect(() => {
    if (isNaN(numericId)) {
      setError('Invalid product ID')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    setSelectedMediaIndex(0)
    setQuantity(1)

    productApi
      .getProductById(numericId)
      .then((data) => {
        setProduct(data)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Product not found')
        setIsLoading(false)
      })

    feedbackApi
      .getProductReviews(numericId)
      .then((data) => setReviews(data))
      .catch(() => setReviews([]))
  }, [numericId])

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-[var(--store-accent)]">
        <div className="w-8 h-8 border-2 border-[var(--store-accent)] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs uppercase tracking-[0.2em] text-[var(--store-text-muted)]">Loading product...</span>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl store-heading text-[var(--store-accent)] mb-2">Product Not Found</h2>
        <p className="text-sm text-[var(--store-text-muted)] mb-6">This product could not be found or is no longer available.</p>
        <Link
          to="/shop"
          className="px-6 py-2.5 bg-[var(--store-accent)] text-[var(--store-accent-text)] font-semibold text-xs uppercase tracking-widest rounded"
        >
          Return to Catalog
        </Link>
      </div>
    )
  }

  // Construct media list
  const mediaList: MediaItem[] = []
  const rawImages: string[] = []

  if (product.images && product.images.length > 0) {
    product.images.forEach((img) => {
      if (img && img.trim().length > 0) rawImages.push(img.trim())
    })
  }

  if (product.thumbnailUrl && product.thumbnailUrl.trim().length > 0) {
    const thumb = product.thumbnailUrl.trim()
    if (!rawImages.includes(thumb)) rawImages.unshift(thumb)
  }

  if (product.hoverImageUrl && product.hoverImageUrl.trim().length > 0) {
    const hover = product.hoverImageUrl.trim()
    if (!rawImages.includes(hover)) rawImages.push(hover)
  }

  rawImages.forEach((url) => {
    mediaList.push({ type: 'image', url })
  })

  if (product.videoUrl && product.videoUrl.trim().length > 0) {
    const vUrl = product.videoUrl.trim()
    if (vUrl.startsWith('http://') || vUrl.startsWith('https://')) {
      mediaList.push({ type: 'video', url: vUrl })
    }
  }

  const activeMedia = mediaList[selectedMediaIndex] || mediaList[0]

  const handlePrevMedia = () => {
    setSelectedMediaIndex((prev) => (prev > 0 ? prev - 1 : mediaList.length - 1))
  }

  const handleNextMedia = () => {
    setSelectedMediaIndex((prev) => (prev < mediaList.length - 1 ? prev + 1 : 0))
  }

  const isSoldOut = product.quantity <= 0
  const isOwnerOrAdmin = user && (user.role === 'ADMIN' || user.role === 'OWNER' || (user.role === 'SELLER' && user.id === product.sellerId))

  const discountPercent =
    product.discountRate ??
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0)

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : null

  const handleAddToCart = async () => {
    if (isSoldOut || isCartLoading) return
    try {
      await addToCart(product.id, quantity)
      setIsAdded(true)
      setTimeout(() => setIsAdded(false), 2000)
    } catch (err) {
      console.error('Failed to add to cart:', err)
    }
  }

  const renderVideoPlayer = (url: string) => {
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be')
    if (isYouTube) {
      let embedUrl = url
      if (url.includes('watch?v=')) {
        embedUrl = url.replace('watch?v=', 'embed/').split('&')[0]
      } else if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1].split('?')[0]
        embedUrl = `https://www.youtube.com/embed/${id}`
      }
      return (
        <iframe
          src={embedUrl}
          title={product.name}
          className="w-full h-full aspect-square border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    }
    return (
      <video
        src={url}
        controls
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full aspect-square object-cover"
      />
    )
  }

  return (
    <div className="min-h-screen pt-10 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[var(--store-text-muted)] mb-8 uppercase tracking-widest overflow-x-auto py-1">
        <Link to="/" className="hover:text-[var(--store-text)] transition-colors">Home</Link>
        <ChevronRightIcon size={12} />
        <Link to="/shop" className="hover:text-[var(--store-text)] transition-colors">Shop</Link>
        {product.categoryName && (
          <>
            <ChevronRightIcon size={12} />
            <Link
              to={`/shop?category=${encodeURIComponent(product.categoryName)}`}
              className="hover:text-[var(--store-text)] transition-colors"
            >
              {product.categoryName}
            </Link>
          </>
        )}
        <ChevronRightIcon size={12} />
        <span className="text-[var(--store-accent)] font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
        {/* Media Gallery (Left, 7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative bg-[var(--store-surface-subtle)] rounded-xl overflow-hidden border border-[var(--store-border)] flex items-center justify-center" style={imageFrameStyle(product)}>
            {activeMedia?.type === 'video' ? (
              renderVideoPlayer(activeMedia.url)
            ) : activeMedia ? (
              <StoreImage
                src={activeMedia.url}
                alt={product.name}
                className="w-full h-full transition-opacity duration-300"
                style={imagePhotoStyle(product)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-[var(--store-text-muted)]">
                <ImageIcon size={48} className="text-[var(--store-accent)] mb-2" />
                <span className="text-sm">No product photo available</span>
              </div>
            )}

            {/* Gallery Navigation Arrows */}
            {mediaList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevMedia}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-[var(--store-surface)]/90 hover:bg-[var(--store-surface-subtle)] text-[var(--store-text)] rounded-full backdrop-blur transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMedia}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-[var(--store-surface)]/90 hover:bg-[var(--store-surface-subtle)] text-[var(--store-text)] rounded-full backdrop-blur transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {mediaList.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {mediaList.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedMediaIndex(idx)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    idx === selectedMediaIndex
                      ? 'border-[#ca8a04] shadow-md scale-105'
                      : 'border-[var(--store-border)] opacity-70 hover:opacity-100'
                  }`}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full bg-[var(--store-surface-subtle)] flex flex-col items-center justify-center text-[10px] text-[var(--store-accent)]">
                      <Play size={14} className="mb-0.5" />
                      <span>Video</span>
                    </div>
                  ) : (
                    <StoreImage src={item.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Specifications & Purchasing Column (Right, 5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          <div className="flex items-center justify-between mb-2">
            {product.categoryName && (
              <span className="text-xs uppercase tracking-[0.2em] text-[var(--store-accent)] font-medium">
                {product.categoryName}
              </span>
            )}
            {averageRating && (
              <div className="flex items-center gap-1 text-xs text-[var(--store-accent)] bg-[var(--store-accent)]/10 px-2.5 py-1 rounded-full border border-[#ca8a04]/20">
                <Star size={12} fill="currentColor" />
                <span>{averageRating} ({reviews.length} reviews)</span>
              </div>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl store-heading text-[var(--store-text)] mb-2 leading-tight">
            {product.name}
          </h1>

          {/* Seller Storefront Identity Link */}
          {product.store && (
            <div className="mb-4">
              <Link
                to={`/stores/${product.store.slug}`}
                className="inline-flex items-center gap-1.5 text-xs text-[var(--store-text-muted)] hover:text-[var(--store-accent)] transition-colors group"
              >
                <span>Sold by <strong className="text-[var(--store-text)] group-hover:text-[var(--store-accent)] transition-colors font-medium">{product.store.name}</strong></span>
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}

          {/* Pricing */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl sm:text-3xl font-serif text-[var(--store-accent)] font-semibold">
              {formatPrice(product.price)}
            </span>
            {discountPercent > 0 && product.originalPrice && product.originalPrice > product.price && (
              <span className="text-lg text-[#71717a] line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-xs uppercase tracking-wider font-semibold bg-[#ef4444]/15 text-[#f87171] border border-[#ef4444]/30 px-2 py-0.5 rounded">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          <div className="mb-6 flex items-center gap-2 rounded-xl border border-[var(--store-border)] bg-[var(--store-surface-subtle)] px-4 py-3">
            <ShieldCheck size={18} className="shrink-0 text-[var(--store-accent)]" />
            <div>
              <p className="text-sm font-medium text-[var(--store-text)]">{paymentModeLabel(product.paymentMode, product.depositPercent)}</p>
              <p className="text-xs mt-1 text-[var(--store-text-muted)]">{product.paymentMode === 'COD' || !product.paymentMode
                ? 'Pay on delivery.'
                : 'The seller will contact you to arrange advance payment before dispatch. No online charge is made at checkout.'}</p>
            </div>
          </div>

          {/* Stock Indicator */}
          <div className="mb-6">
            <span
              className={`inline-flex items-center gap-1.5 text-xs tracking-wider uppercase font-medium px-2.5 py-1 rounded-md ${
                isSoldOut
                  ? 'bg-[#ef4444]/15 text-[#f87171] border border-[#ef4444]/30'
                  : product.quantity <= 3
                  ? 'bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/30'
                  : 'bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {isSoldOut ? 'Sold Out' : product.quantity <= 3 ? `Only ${product.quantity} Remaining` : 'Available in Stock'}
            </span>
          </div>

          {/* Description */}
          <div className="mb-8 p-5 bg-[var(--store-surface)] rounded-xl border border-[var(--store-border)] shadow-sm">
            <h4 className="text-xs font-semibold tracking-wide text-[var(--store-text)] mb-3">
              About this product
            </h4>
            <p className="text-sm text-[var(--store-text-muted)] leading-relaxed whitespace-pre-line">
              {product.description ||
                'Product details will be added by the store owner.'}
            </p>
          </div>

          {/* Optional ring sizing guide link */}
          {storeSettings?.showRingSizeGuide === true && <div className="mb-6 flex items-center justify-between p-3 bg-[var(--store-surface-subtle)] border border-[var(--store-border)] rounded-lg">
            <div className="flex items-center gap-2 text-xs text-[var(--store-text-muted)]">
              <Ruler size={14} className="text-[var(--store-accent)]" />
              <span>Uncertain about sizing specifications?</span>
            </div>
            <Link
              to="/ring-size-guide"
              className="text-xs text-[var(--store-accent)] hover:underline font-medium"
            >
              View Ring Size Guide
            </Link>
          </div>}

          {/* Quantity and Add to cart */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
            <div className="flex items-center border border-[var(--store-border)] rounded-lg bg-[var(--store-surface)] px-3 py-2 justify-between sm:justify-start">
              <span className="text-xs text-[var(--store-text-muted)] uppercase tracking-wider mr-4">Qty</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isSoldOut}
                  aria-label="Decrease quantity"
                  className="w-7 h-7 flex items-center justify-center text-[var(--store-text)] hover:bg-[var(--store-surface-subtle)] rounded disabled:opacity-40"
                >
                  -
                </button>
                <span className="w-6 text-center text-sm font-medium text-[var(--store-text)]" aria-live="polite">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.quantity, q + 1))}
                  disabled={quantity >= product.quantity || isSoldOut}
                  aria-label="Increase quantity"
                  className="w-7 h-7 flex items-center justify-center text-[var(--store-text)] hover:bg-[var(--store-surface-subtle)] rounded disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isSoldOut || isCartLoading}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all ${
                isAdded
                  ? 'bg-[#10b981] text-black shadow-lg shadow-[#10b981]/20'
                  : isSoldOut
                  ? 'bg-[#26282d] text-[#71717a] cursor-not-allowed'
                  : 'bg-[var(--store-accent)] hover:brightness-90 text-[var(--store-accent-text)] shadow-lg shadow-[#ca8a04]/20'
              }`}
            >
              {isAdded ? (
                <>
                  <Check size={16} />
                  <span>Added to cart</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  <span>{isSoldOut ? 'Sold Out' : 'Add to cart'}</span>
                </>
              )}
            </button>
          </div>

          {/* Owner Quick Edit Action */}
          {isOwnerOrAdmin && (
            <div className="mb-6">
              <button
                type="button"
                onClick={() => navigate(`/seller/products/${product.id}/edit`)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--store-accent)]/10 hover:bg-[var(--store-accent)]/20 text-[var(--store-accent)] border border-[#ca8a04]/30 rounded-lg text-xs font-medium tracking-wider transition-colors"
              >
                <Edit3 size={14} />
                <span>Edit This Product in Seller Portal</span>
              </button>
            </div>
          )}

          {/* Value Propositions */}
          <div className="grid grid-cols-1 gap-3 pt-6 border-t border-[var(--store-border)] text-xs text-[var(--store-text-muted)]">
            <div className="flex items-center gap-3">
              <Truck size={16} className="text-[var(--store-accent)] flex-shrink-0" />
              <span>Delivery fees, if any, are shown in the cart and at checkout.</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-[var(--store-accent)] flex-shrink-0" />
              <span>Contact the store if you have questions about product specifications.</span>
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw size={16} className="text-[var(--store-accent)] flex-shrink-0" />
              <span>Review the store's return and exchange policy before ordering.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="mb-20 pt-12 border-t border-[var(--store-border)]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--store-accent)] font-medium">Customer feedback</span>
            <h3 className="text-2xl store-heading text-[var(--store-text)] mt-1">Customer reviews ({reviews.length})</h3>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="p-8 text-center bg-[var(--store-surface)] rounded-xl border border-[var(--store-border)] text-[var(--store-text-muted)]">
            <p className="text-sm">No reviews yet for this product.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-5 bg-[var(--store-surface)] rounded-xl border border-[var(--store-border)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[var(--store-accent)] mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < rev.rating ? 'currentColor' : 'none'}
                        className={i < rev.rating ? 'text-[var(--store-accent)]' : 'text-[var(--store-border)]'}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-[var(--store-text)] leading-relaxed mb-4">"{rev.comment}"</p>
                </div>
                <div className="text-xs text-[var(--store-text-muted)] font-mono border-t border-[var(--store-border)] pt-3">
                  {rev.customerName || 'Customer'}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-[var(--store-border)]">
          <div className="mb-8">
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--store-accent)] font-medium">More to explore</span>
            <h3 className="text-2xl store-heading text-[var(--store-text)] mt-1">Related products</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductPage
