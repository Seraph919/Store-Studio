import { useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ShoppingBag, Search, Menu, X, UserRound, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { useCart } from '../../context/useCart'
import type { PublicStorefront } from '../../types'
import { StoreImage, lightLogo, darkLogo } from './StoreImage'
interface Props { storefront?: PublicStorefront; storeName?: string; storeTagline?: string; logoUrl?: string; showRingSizeGuide?: boolean; isPreview?: boolean; mode?: 'LIGHT' | 'DARK'; onToggleMode?: () => void }
const baseLinks = [['/', 'Home'], ['/shop', 'Shop']] as const
export function StoreHeader({ storefront, storeName = storefront?.storeName || 'Store Studio', logoUrl, showRingSizeGuide = false, isPreview, mode = 'LIGHT', onToggleMode }: Props) {
  const links: ReadonlyArray<readonly [string, string]> = showRingSizeGuide ? [...baseLinks, ['/ring-size-guide', 'Size guide']] : baseLinks
  const { cart, openCart } = useCart()
  const { user } = useAuth()
  const staffPath = user?.role === 'ADMIN' ? '/admin' : user?.role === 'OWNER' || user?.role === 'SELLER' ? '/seller' : '/login'
  const staffLabel = staffPath === '/login' ? 'Staff sign in' : user?.role === 'ADMIN' ? 'Admin dashboard' : 'Owner dashboard'
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const count = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  const close = () => { setOpen(false); toggle.current?.focus() }
  return <header className="store-header" onKeyDown={event => { if (event.key === 'Escape' && open) close() }}>
    <div className="store-header-inner">
      <Link to="/" aria-label={`${storeName} home`} className="store-brand">
        {logoUrl ? <StoreImage src={logoUrl === '/assets/logo.svg' ? lightLogo : logoUrl === '/assets/logo_white.svg' ? darkLogo : logoUrl}
          fallback="/image-unavailable.svg" alt={storeName} /> : <span className="store-heading">{storeName}</span>}
      </Link>
      <nav className="store-desktop-nav" aria-label="Main navigation">{links.map(([path,label]) => <NavLink key={path} to={path} end={path === '/'}>{label}</NavLink>)}</nav>
      <div className="store-header-actions">
        {!isPreview && <button type="button" onClick={onToggleMode} title={mode === 'DARK' ? 'Use light mode' : 'Use dark mode'} aria-label={mode === 'DARK' ? 'Switch store to light mode' : 'Switch store to dark mode'}>
          {mode === 'DARK' ? <Sun size={20} /> : <Moon size={20} />}
        </button>}
        <Link className="store-account-link" to={staffPath} aria-label={staffLabel} title={staffLabel}><UserRound size={20} /><span className="store-account-label">{staffPath === '/login' ? 'Staff sign in' : 'Dashboard'}</span></Link>
        <Link to="/shop" aria-label="Search products"><Search size={20} /></Link>
        <button onClick={() => { if (!isPreview) openCart() }} aria-label={`Open cart${count ? `, ${count} items` : ''}`}><ShoppingBag size={20} />{count > 0 && <span className="store-cart-count">{count}</span>}</button>
        <button ref={toggle} className="store-menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="store-mobile-menu" onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
      </div>
    </div>
    {open && <nav id="store-mobile-menu" className="store-mobile-nav" aria-label="Mobile navigation">
      {links.map(([path,label]) => <Link key={path} to={path} onClick={close}>{label}</Link>)}
      <Link to={staffPath} onClick={close}>{staffLabel}</Link>
      {!isPreview && <button type="button" onClick={() => { close(); onToggleMode?.() }}>{mode === 'DARK' ? 'Light mode' : 'Dark mode'}</button>}
      <button type="button" onClick={() => { close(); if (!isPreview) openCart() }}>Cart ({count})</button>
    </nav>}
  </header>
}
