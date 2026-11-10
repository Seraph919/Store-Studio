import { useEffect, useState, type FormEvent } from 'react'
import { useStoreSettingsQuery, invalidateStoreSettings } from '../../hooks/useStoreQueries'
import { settingsApi, type StoreSettings } from '../../services/settingsApi'
import { ShippingPolicyFields } from '../../components/ShippingPolicyFields'
import { Truck } from 'lucide-react'

export default function SellerShippingPage() {
  const query = useStoreSettingsQuery()
  const [settings,setSettings] = useState<StoreSettings | null>(null)
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState<string | null>(null)
  const [success,setSuccess] = useState(false)
  useEffect(() => { if(query.data) setSettings(query.data) },[query.data])
  const save = async (event:FormEvent) => {
    event.preventDefault(); if(!settings) return
    setBusy(true);setSuccess(false);setError(null)
    try {
      const updated = await settingsApi.updateSettings({ shippingMode:settings.shippingMode,
        shippingFee:settings.shippingFee, freeShippingThreshold:settings.freeShippingThreshold ?? undefined })
      setSettings(updated); await invalidateStoreSettings();setSuccess(true)
    } catch (e) {setError(e instanceof Error ? e.message : 'Unable to save shipping settings')}
    finally {setBusy(false)}
  }
  if (query.isLoading || !settings) return <p className="p-6 text-[var(--portal-muted)]">Loading delivery settings...</p>
  return <div className="max-w-4xl mx-auto space-y-5">
    <header className="flex items-center gap-3"><Truck size={23}/><div><h1 className="text-2xl font-semibold">Shipping settings</h1><p className="text-sm text-[var(--portal-muted)]">Control delivery fees for your store.</p></div></header>
    <form className="rounded-2xl border border-[var(--portal-border)] p-5 sm:p-8 space-y-6 bg-[var(--portal-surface)]" onSubmit={save}>
      <ShippingPolicyFields value={settings} onChange={patch => {setSettings({...settings,...patch});setSuccess(false)}}/>
      {error && <p role="alert" className="text-[var(--portal-danger)]">{error}</p>}
      {success && <p role="status" className="text-[var(--portal-success)]">Shipping rules saved successfully.</p>}
      <button type="submit" disabled={busy || (settings.shippingMode === 'FREE_ABOVE' && !(Number(settings.freeShippingThreshold) > 0))}
        className="portal-primary-button px-6 py-3 rounded-xl font-semibold disabled:opacity-50">{busy?'Saving...':'Save shipping rules'}</button>
    </form>
  </div>
}
