import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  PackageCheck,
  Layers,
  PlusCircle,
  MessageSquareQuote,
  User,
  Store,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Palette,
  Truck,
  KeyRound,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useTheme } from '../context/ThemeContext'
import '../styles/management.css'
import { StoreStudioLogo } from '../branding/platformBrand'
import { useStoreSettingsQuery } from '../hooks/useStoreQueries'

export const SellerLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const { mode, palette, toggleTheme } = useTheme()
  const { data: storeSettings = {} } = useStoreSettingsQuery()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const storeName = storeSettings.storeName || 'Store Studio'
  const isOwner = user?.role === 'OWNER' || user?.role === 'SELLER'

  const navItems = [
    { to: '/seller', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/seller/orders', label: 'Orders & Dispatch', icon: PackageCheck },
    { to: '/seller/products', label: 'Product Catalog', icon: Layers, end: true },
    { to: '/seller/products/new', label: 'Add Product', icon: PlusCircle },
    { to: '/dashboard/design', label: 'Visual Store Studio', icon: Palette, end: true },
    { to: '/seller/reviews', label: 'Customer Reviews', icon: MessageSquareQuote },
    { to: '/seller/shipping', label: 'Shipping Rules', icon: Truck },
    { to: '/seller/profile', label: 'Store Profile', icon: User },
    { to: '/seller/api-keys', label: 'API Keys', icon: KeyRound },
  ]

  return (
    <div data-theme={mode} data-palette={palette} className="management-shell min-h-screen flex bg-[var(--portal-bg)] text-[var(--portal-text)]">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`portal-sidebar fixed top-0 bottom-0 left-0 z-50 w-64 bg-[var(--portal-surface)] border-r border-[var(--portal-border)] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="p-6 border-b border-[var(--portal-border)] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <StoreStudioLogo size={20} showWordmark={true} light={mode === 'dark'} className="text-[var(--portal-text)]" />
              <span className="px-1.5 py-0.5 text-[9px] tracking-widest font-semibold uppercase bg-[var(--portal-accent-soft)] text-[var(--portal-accent-text)] border border-[var(--portal-accent-border)] rounded">
                {isOwner ? 'Owner' : user?.role || 'Portal'}
              </span>
            </div>
            <p className="text-[11px] text-[var(--portal-muted)] mt-2 font-mono tracking-wide truncate max-w-[190px]">
              Managing: <span className="text-[var(--portal-text)] font-medium">{storeName}</span>
            </p>
          </div>
          <button
            type="button"
            className="lg:hidden p-1.5 text-[var(--portal-muted)] hover:text-[var(--portal-text)]"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm tracking-normal transition-all duration-200 ${
                    isActive
                      ? 'portal-nav-active font-semibold border'
                      : 'portal-nav-inactive'
                  }`
                }
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[var(--portal-border)] space-y-2">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3.5 py-2 text-xs text-[var(--portal-muted)] hover:text-[var(--portal-text)] hover:bg-[var(--portal-hover)] rounded-lg transition-colors"
          >
            <Store size={15} />
            <span>View Public Store</span>
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={mode === 'dark' ? 'Switch dashboard to light mode' : 'Switch dashboard to dark mode'}
            className="portal-theme-button w-full flex items-center justify-between px-3.5 py-2 text-xs text-[var(--portal-muted)] hover:text-[var(--portal-text)] hover:bg-[var(--portal-hover)] rounded-lg transition-colors"
          >
            <span className="flex items-center gap-3">
              {mode === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
              <span>{mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}</span>
            </span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-xs text-[var(--portal-danger)] hover:text-[var(--portal-danger)] hover:bg-[var(--portal-danger-soft)] rounded-lg transition-colors"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <header className="portal-topbar sticky top-0 z-30 h-16 bg-[var(--portal-surface)] backdrop-blur-md border-b border-[var(--portal-border)] px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="lg:hidden p-2 text-[var(--portal-muted)] hover:text-[var(--portal-text)]"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-[var(--portal-muted)] font-mono">Store Studio</span>
              <span className="text-xs text-[var(--portal-muted)]">/</span>
              <span className="text-xs font-medium text-[var(--portal-text)]">{storeName}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/dashboard/design"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-[var(--portal-accent-soft)] text-[var(--portal-accent-text)] hover:bg-[var(--portal-hover)] border border-[var(--portal-accent-border)] transition-colors"
            >
              <Palette size={13} />
              <span className="hidden sm:inline">Design Storefront</span>
            </Link>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] flex items-center justify-center text-xs font-bold text-[var(--portal-text)]">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'O'}
              </div>
              <div className="hidden md:block text-left">
                <span className="block text-xs font-medium text-[var(--portal-text)] line-clamp-1">
                  {user?.name || user?.email}
                </span>
                <span className="block text-[10px] text-[var(--portal-muted)] font-mono">
                  {user?.role || 'Store Owner'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 xl:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default SellerLayout
