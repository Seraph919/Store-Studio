import { MediaUploadField } from '../../components/MediaUploadField'
import type { StoreBranding } from '../../types/design'

interface Props { settings: StoreBranding; onChange: (settings: StoreBranding) => void }
export function BrandingPanel({ settings, onChange }: Props) {
  return <div className="p-4 space-y-5 overflow-y-auto h-full text-slate-900">
    <p className="text-sm text-slate-600">Preview your identity here. Changes go live when you publish.</p>
    <label className="block text-sm">Store name
      <input value={settings.storeName ?? ''} maxLength={120} onChange={e => onChange({ ...settings, storeName: e.target.value })} className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900" />
    </label>
    <label className="block text-sm">Tagline
      <input value={settings.storeTagline ?? ''} maxLength={255} onChange={e => onChange({ ...settings, storeTagline: e.target.value })} className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900" />
    </label>
    <MediaUploadField label="Logo on light backgrounds" value={settings.logoUrl} onChange={logoUrl => onChange({ ...settings, logoUrl })} />
    <MediaUploadField label="Logo on dark backgrounds" value={settings.logoDarkUrl} onChange={logoDarkUrl => onChange({ ...settings, logoDarkUrl })} />
    <div className="pt-4 border-t border-slate-300/30">
      <label className="flex items-start gap-3 rounded-lg border border-slate-300/30 p-3 cursor-pointer">
        <input type="checkbox" className="mt-1 accent-amber-500"
          checked={settings.showRingSizeGuide === true}
          onChange={e => onChange({ ...settings, showRingSizeGuide: e.target.checked })} />
        <span className="text-sm">
          <span className="block font-semibold">Show ring-size guide</span>
          <span className="block text-xs opacity-70 mt-1">Add the guide to the storefront header and footer (and product pages). Disabled by default for stores that don't sell rings.</span>
        </span>
      </label>
    </div>
  </div>
}
