import React, { useState, useEffect } from 'react'
import {
  Store,
  Phone,
  Sparkles,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { settingsApi, type StoreSettings } from '../../services/settingsApi'
import { ShippingPolicyFields } from '../../components/ShippingPolicyFields'
import { invalidateStoreSettings } from '../../hooks/useStoreQueries'

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const loadSettings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await settingsApi.getSettings()
      setSettings(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve store settings.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const updated = await settingsApi.updateSettings(settings)
      setSettings(updated)
      invalidateStoreSettings()
      setSuccessMsg('Storefront settings published successfully.')
      setTimeout(() => setSuccessMsg(null), 3500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save settings.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-16 text-center text-[var(--portal-accent-text)]">
        <div className="w-8 h-8 border-2 border-[var(--portal-accent-border)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs text-[var(--portal-muted)]">Loading store settings...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)]">
        <div>
          <h1 className="text-2xl font-serif text-[var(--portal-text)] mt-1">Store settings</h1>
          <p className="text-sm leading-relaxed text-[var(--portal-muted)] mt-2">
            Update your store name, logos, contact details, and homepage text.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSettings}
          disabled={isLoading}
          className="p-2.5 bg-[var(--portal-surface-alt)] hover:bg-[var(--portal-hover)] text-[var(--portal-muted)] hover:text-[var(--portal-text)] rounded-xl border border-[var(--portal-border)] transition-colors self-start sm:self-auto"
          title="Refresh configuration"
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin text-[var(--portal-accent-text)]' : ''} />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-[var(--portal-danger-soft)] border border-[var(--portal-danger-border)] rounded-xl flex items-center gap-3 text-xs text-[var(--portal-danger)]">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-[var(--portal-success-soft)] border border-[var(--portal-success-border)] rounded-xl flex items-center gap-3 text-xs text-[var(--portal-success)]">
          <CheckCircle size={16} className="flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-[var(--portal-surface)] p-6 rounded-2xl border border-[var(--portal-border)]">
          <ShippingPolicyFields value={settings} onChange={patch => setSettings({...settings,...patch})}/>
        </div>
        {/* Brand & Identity Card */}
        <div className="bg-[var(--portal-surface)] p-6 rounded-2xl border border-[var(--portal-border)] space-y-4">
          <h2 className="text-sm font-serif text-[var(--portal-text)] flex items-center gap-2">
            <Store size={16} className="text-[var(--portal-accent-text)]" />
            <span>Store name and logos</span>
          </h2>

          <label className="flex items-center gap-3 rounded-xl border border-[var(--portal-border)] bg-[var(--portal-surface-alt)] p-3 text-sm text-[var(--portal-text)]">
            <input type="checkbox" checked={settings.showRingSizeGuide === true}
              onChange={e => setSettings({ ...settings, showRingSizeGuide: e.target.checked })} />
            <span>Show ring-size guide in storefront navigation and product pages</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--portal-muted)] mb-1.5 font-medium">
                Store Name
              </label>
              <input
                type="text"
                value={settings.storeName || ''}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                placeholder="Your Store"
                className="w-full px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-xs text-[var(--portal-text)] focus:border-[var(--portal-accent)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--portal-muted)] mb-1.5 font-medium">
                Store Tagline
              </label>
              <input
                type="text"
                value={settings.storeTagline || ''}
                onChange={(e) => setSettings({ ...settings, storeTagline: e.target.value })}
                placeholder="Everyday essentials"
                className="w-full px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-xs text-[var(--portal-text)] focus:border-[var(--portal-accent)] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--portal-muted)] mb-1.5 font-medium">
                Logo URL (Light Mode)
              </label>
              <input
                type="url"
                value={settings.logoUrl || ''}
                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-xs text-[var(--portal-text)] focus:border-[var(--portal-accent)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--portal-muted)] mb-1.5 font-medium">
                Logo URL (Dark Mode)
              </label>
              <input
                type="url"
                value={settings.logoDarkUrl || ''}
                onChange={(e) => setSettings({ ...settings, logoDarkUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-xs text-[var(--portal-text)] focus:border-[var(--portal-accent)] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Concierge & Contact Card */}
        <div className="bg-[var(--portal-surface)] p-6 rounded-2xl border border-[var(--portal-border)] space-y-4">
          <h2 className="text-sm font-serif text-[var(--portal-text)] flex items-center gap-2">
            <Phone size={16} className="text-[var(--portal-accent-text)]" />
            <span>Customer support</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--portal-muted)] mb-1.5 font-medium">
                Phone Number
              </label>
              <input
                type="tel"
                value={settings.phone || ''}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="+212 522-123456"
                className="w-full px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-xs text-[var(--portal-text)] focus:border-[var(--portal-accent)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--portal-muted)] mb-1.5 font-medium">
                WhatsApp Hotline
              </label>
              <input
                type="tel"
                value={settings.whatsappNumber || ''}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                placeholder="Your contact number"
                className="w-full px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-xs text-[var(--portal-text)] focus:border-[var(--portal-accent)] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--portal-muted)] mb-1.5 font-medium">
                Concierge Email
              </label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="support@example.com"
                className="w-full px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-xs text-[var(--portal-text)] focus:border-[var(--portal-accent)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--portal-muted)] mb-1.5 font-medium">
                Operating Schedule
              </label>
              <input
                type="text"
                value={settings.timing || ''}
                onChange={(e) => setSettings({ ...settings, timing: e.target.value })}
                placeholder="Monday – Saturday: 10:00 – 19:30 (GMT+1)"
                className="w-full px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-xs text-[var(--portal-text)] focus:border-[var(--portal-accent)] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Hero Section Editorial Copy */}
        <div className="bg-[var(--portal-surface)] p-6 rounded-2xl border border-[var(--portal-border)] space-y-4">
          <h2 className="text-sm font-serif text-[var(--portal-text)] flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--portal-accent-text)]" />
            <span>Homepage banner</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[var(--portal-muted)] mb-1.5 font-medium">
                Hero Eyebrow
              </label>
              <input
                type="text"
                value={settings.heroEyebrow || ''}
                onChange={(e) => setSettings({ ...settings, heroEyebrow: e.target.value })}
                placeholder="Your store tagline"
                className="w-full px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-xs text-[var(--portal-text)] focus:border-[var(--portal-accent)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-[var(--portal-muted)] mb-1.5 font-medium">
                Hero Title Headline
              </label>
              <input
                type="text"
                value={settings.heroTitle || ''}
                onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                placeholder="Browse our products"
                className="w-full px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-xs text-[var(--portal-text)] focus:border-[var(--portal-accent)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[var(--portal-muted)] mb-1.5 font-medium">
              Hero Introduction
            </label>
            <textarea
              rows={3}
              value={settings.heroIntro || ''}
              onChange={(e) => setSettings({ ...settings, heroIntro: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-xs text-[var(--portal-text)] focus:border-[var(--portal-accent)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--portal-muted)] mb-1.5 font-medium">
              Hero CTA Button Label
            </label>
            <input
              type="text"
              value={settings.heroCta || ''}
              onChange={(e) => setSettings({ ...settings, heroCta: e.target.value })}
              placeholder="Shop now"
              className="w-full px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-xs text-[var(--portal-text)] focus:border-[var(--portal-accent)] focus:outline-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-[var(--portal-danger-strong)] hover:bg-[var(--portal-danger-hover)] text-white font-semibold text-xs rounded-xl transition-colors shadow-md shadow-none flex items-center gap-2 disabled:opacity-60"
          >
            <Save size={15} />
            <span>{isSaving ? 'Publishing Settings...' : 'Save Global Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminSettingsPage
