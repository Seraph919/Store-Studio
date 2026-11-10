import { ProductMediaFrame } from './ProductMediaFrame'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Check } from 'lucide-react'
import type { Product } from '../../types'
import { useCart } from '../../context/useCart'
import { formatPrice } from '../../utils/formatPrice'
import { paymentModeLabel } from '../../utils/paymentTerms'
interface Props { product: Product; isPreview?: boolean; onQuickView?: (product: Product) => void }
export function StoreProductCard({ product, isPreview, onQuickView }: Props) {
  const { addToCart } = useCart()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState('')
  const [hovered, setHovered] = useState(false)
  const add = async () => {
    if (isPreview || adding || product.quantity <= 0) return
    setAdding(true); setError('')
    try { await addToCart(product.id, 1); setAdded(true) }
    catch (error) { setError(error instanceof Error ? error.message : 'Could not add this product. Try again.') }
    finally { setAdding(false) }
  }
  return <article className="template-card store-product-card" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
    <Link to={`/products/${product.id}`} onClick={event => {
      if (isPreview || onQuickView) event.preventDefault()
      if (!isPreview) onQuickView?.(product)
    }} className="store-product-link">
      <ProductMediaFrame framing={product} src={(hovered && product.hoverImageUrl) || product.thumbnailUrl || product.images?.[0] || ''} alt={product.name} loading="lazy" />
      <div className="store-product-info"><span>{product.categoryName}</span><h3>{product.name}</h3>
        <div className="store-product-price"><strong>{formatPrice(product.price)}</strong>{product.originalPrice && product.originalPrice > product.price ? <del>{formatPrice(product.originalPrice)}</del> : null}</div>
        {product.paymentMode && product.paymentMode !== 'COD' && <p className="text-[11px] mt-1 text-[var(--store-text-muted)]">{paymentModeLabel(product.paymentMode, product.depositPercent)}</p>}
      </div>
    </Link>
    <button className="store-product-add" type="button" onClick={add} disabled={adding || product.quantity <= 0} aria-label={`Add ${product.name} to cart`}>
      {added ? <Check size={16} /> : <ShoppingBag size={16} />}{product.quantity <= 0 ? 'Sold out' : adding ? 'Adding…' : added ? 'Added' : 'Add to cart'}
    </button>
    {error && <p role="alert" className="store-product-error">{error}</p>}
  </article>
}
