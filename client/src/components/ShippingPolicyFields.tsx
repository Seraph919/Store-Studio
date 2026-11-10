import type { StoreSettings, ShippingMode } from '../services/settingsApi'

interface Props {
  value: StoreSettings
  onChange: (patch: Partial<StoreSettings>) => void
}
const MODES: { value: ShippingMode; label: string; description: string }[] = [
  { value: 'FREE', label: 'Always free', description: 'No delivery fee on any order' },
  { value: 'FLAT', label: 'Fixed delivery fee', description: 'Charge the same fee on every order' },
  { value: 'FREE_ABOVE', label: 'Free above a threshold', description: 'Charge a fee below the chosen subtotal' },
]
export function ShippingPolicyFields({value,onChange}:Props) {
  const mode = value.shippingMode ?? 'FREE'
  return <section className="space-y-4" aria-labelledby="shipping-policy-heading">
    <div>
      <h2 id="shipping-policy-heading" className="text-lg font-semibold text-[var(--portal-text)]">Delivery & shipping</h2>
      <p className="text-sm text-[var(--portal-muted)] mt-1">Applies to the whole store. Checkout calculates the delivery charge automatically.</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {MODES.map(option => <button type="button" key={option.value} onClick={() => onChange({shippingMode:option.value})}
        aria-pressed={mode === option.value}
        className={`text-left p-4 rounded-xl border transition-colors ${mode === option.value ? 'border-[var(--portal-text)] bg-[var(--portal-accent-soft)]' : 'border-[var(--portal-border)] bg-[var(--portal-surface)]'}`}>
        <span className="block font-semibold text-sm text-[var(--portal-text)]">{option.label}</span>
        <span className="block text-xs text-[var(--portal-muted)] mt-1">{option.description}</span>
      </button>)}
    </div>
    {mode !== 'FREE' && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <label className="block text-sm text-[var(--portal-text)]">Standard shipping fee (MAD)
        <input type="number" step="0.01" min="0" required value={value.shippingFee ?? 0}
          onChange={e => onChange({shippingFee:Number(e.target.value)})}
          className="mt-2 block w-full px-4 py-3 rounded-xl border bg-[var(--portal-surface-alt)] text-[var(--portal-text)] border-[var(--portal-border)]" />
      </label>
      {mode === 'FREE_ABOVE' && <label className="block text-sm text-[var(--portal-text)]">Free shipping when products reach (MAD)
        <input type="number" step="0.01" min="0.01" required value={value.freeShippingThreshold ?? ''}
          onChange={e => onChange({freeShippingThreshold:e.target.value === '' ? null : Number(e.target.value)})}
          className="mt-2 block w-full px-4 py-3 rounded-xl border bg-[var(--portal-surface-alt)] text-[var(--portal-text)] border-[var(--portal-border)]" />
      </label>}
    </div>}
    <p className="text-xs text-[var(--portal-muted)]">The free-shipping threshold applies to the product subtotal, before delivery. Changing settings does not change past orders.</p>
  </section>
}
