import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import {
  Activity,
  Users,
  FolderTree,
  Layers,
  MessageSquare,
  Settings,
  Server,
  Store,
  ShieldCheck,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Palette,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { useTheme } from '../context/ThemeContext'
import '../styles/management.css'
import { StoreStudioLogo } from '../branding/platformBrand'

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const { mode, palette, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { to: '/admin', label: 'Overview & Analytics', icon: Activity, end: true },
    { to: '/admin/sellers', label: 'Accounts & Roles', icon: Users },
    { to: '/admin/categories', label: 'Categories Catalog', icon: FolderTree },
    { to: '/admin/products', label: 'Products Oversight', icon: Layers },
    { to: '/admin/reviews', label: 'Review Moderation', icon: MessageSquare },
    { to: '/admin/settings', label: 'Store Settings', icon: Settings },
    { to: '/admin/system', label: 'System & Exports', icon: Server },
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
              <span className="px-1.5 py-0.5 text-[9px] tracking-widest font-semibold uppercase bg-[var(--portal-danger-soft)] text-[var(--portal-danger)] border border-[var(--portal-danger-border)] rounded">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-[var(--portal-muted)] mt-2 font-mono tracking-wide">Platform Administration</p>
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
        <div className="p-4 border-t border-[var(--portal-border)] space-y-1.5">
          <Link
            to="/seller"
            className="flex items-center gap-3 px-3.5 py-2 text-xs text-[var(--portal-muted)] hover:text-[var(--portal-text)] hover:bg-[var(--portal-hover)] rounded-lg transition-colors"
          >
            <Store size={15} />
            <span>Store Owner Portal</span>
          </Link>

          <Link
            to="/dashboard/design"
            className="flex items-center gap-3 px-3.5 py-2 text-xs text-[var(--portal-muted)] hover:text-[var(--portal-text)] hover:bg-[var(--portal-hover)] rounded-lg transition-colors"
          >
            <Palette size={15} />
            <span>Store Design Studio</span>
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
              <span className="text-xs font-medium text-[var(--portal-text)]">System Administration</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/dashboard/design"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-[var(--portal-accent-soft)] text-[var(--portal-danger)] hover:bg-[var(--portal-hover)] border border-[var(--portal-danger-border)] transition-colors"
            >
              <Palette size={13} />
              <span className="hidden sm:inline">Visual Editor</span>
            </Link>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] flex items-center justify-center text-xs font-bold text-[var(--portal-danger)]">
                <ShieldCheck size={16} />
              </div>
              <div className="hidden md:block text-left">
                <span className="block text-xs font-medium text-[var(--portal-text)]">
                  {user?.name || user?.email}
                </span>
                <span className="block text-[10px] text-[var(--portal-muted)] font-mono">
                  Administrator
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

export default AdminLayout
