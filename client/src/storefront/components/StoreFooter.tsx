import { Link } from 'react-router-dom'
import type { PublicStorefront } from '../../types'

interface Props {
  storefront?: PublicStorefront
  storeName?: string
  storeTagline?: string
  showRingSizeGuide?: boolean
  isPreview?: boolean
}

export function StoreFooter({
  storefront,
  storeName = storefront?.storeName || 'Store Studio',
  storeTagline,
  showRingSizeGuide = false,
}: Props) {
  return (
    <footer className="store-footer">
      <div className="store-footer-inner">
        <div className="store-footer-brand">
          <strong className="store-heading">{storeName}</strong>
          {storeTagline && <p>{storeTagline}</p>}
        </div>
        <nav className="store-footer-links" aria-label="Footer navigation">
          <Link to="/shop">Shop</Link>
          {showRingSizeGuide && <Link to="/ring-size-guide">Size guide</Link>}
          <Link to="/login">Store management</Link>
        </nav>
        <div className="store-footer-meta">
          <p>© {new Date().getFullYear()} {storeName}</p>
          <small>Powered by Store Studio</small>
        </div>
      </div>
    </footer>
  )
}
