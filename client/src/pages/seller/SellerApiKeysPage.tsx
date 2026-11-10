import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Copy, KeyRound, ShieldCheck, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import { apiKeysApi, type ApiKeyInfo, type ApiKeyScope } from '../../services/apiKeysApi'

const SCOPE_LABELS: { value: ApiKeyScope; label: string }[] = [
  { value: 'products:read', label: 'Read products and stock' },
  { value: 'orders:read', label: 'Read orders and customer details' },
  { value: 'analytics:read', label: 'Read sales analytics' },
  { value: 'settings:read', label: 'Read store settings' },
]

const formatDate = (value: string | null) => value ? new Date(value).toLocaleString() : 'Never'

export default function SellerApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyInfo[]>([])
  const [name, setName] = useState('Python MCP Server')
  const [scopes, setScopes] = useState<ApiKeyScope[]>(SCOPE_LABELS.map((item) => item.value))
  const [permanent, setPermanent] = useState(true)
  const [expiry, setExpiry] = useState('')
  const [newToken, setNewToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [revoking, setRevoking] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setKeys(await apiKeysApi.list())
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to retrieve API keys')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const toggleScope = (scope: ApiKeyScope) => {
    setScopes((current) => current.includes(scope)
      ? current.filter((item) => item !== scope)
      : [...current, scope])
  }

  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setNewToken(null)
    setCopied(false)
    if (scopes.length === 0) {
      setError('Select at least one permission.')
      return
    }
    if (!permanent && (!expiry || new Date(expiry).getTime() <= Date.now())) {
      setError('Choose an expiration date in the future.')
      return
    }
    setCreating(true)
    try {
      const response = await apiKeysApi.create(name, scopes,
        permanent ? null : new Date(expiry).toISOString())
      // The token stays in component state ONLY. It is not persisted in localStorage.
      setNewToken(response.token)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create API key')
    } finally {
      setCreating(false)
    }
  }

  const revoke = async (key: ApiKeyInfo) => {
    if (!window.confirm(`Revoke "${key.name}"? Any MCP server using it will immediately lose access.`)) return
    setRevoking(key.id)
    setError(null)
    try {
      await apiKeysApi.revoke(key.id)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not revoke API key')
    } finally {
      setRevoking(null)
    }
  }

  const copyToken = async () => {
    if (!newToken) return
    try {
      await navigator.clipboard.writeText(newToken)
      setCopied(true)
    } catch {
      setError('Clipboard access failed. Select and copy the token manually.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)] p-6 flex items-start gap-3">
        <div className="p-3 rounded-xl border border-[var(--portal-accent-border)] bg-[var(--portal-accent-soft)] text-[var(--portal-accent-text)]">
          <KeyRound size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-serif text-[var(--portal-text)]">API Keys</h1>
          <p className="mt-1 text-sm text-[var(--portal-muted)]">
            Create read-only credentials for your Python MCP server. Keys can be revoked at any time.
          </p>
        </div>
      </header>

      {error && (
        <div role="alert" className="p-4 rounded-xl border border-[var(--portal-danger-border)] bg-[var(--portal-danger-soft)] text-[var(--portal-danger)] text-sm">
          {error}
        </div>
      )}

      {newToken && (
        <section aria-label="Generated API key" className="space-y-3 p-5 rounded-2xl border border-[var(--portal-success-border)] bg-[var(--portal-surface)]">
          <div className="flex gap-2 items-center text-[var(--portal-text)] font-semibold text-sm">
            <CheckCircle size={17} /> Key created. Copy it now.
          </div>
          <p className="text-xs text-[var(--portal-muted)]">
            This secret is displayed only once. Save it in your MCP server's private environment file, not in your frontend or Git repository.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <code className="flex-1 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-lg p-3 text-xs text-[var(--portal-text)] break-all select-all">{newToken}</code>
            <button type="button" onClick={() => void copyToken()} className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[var(--portal-accent)] text-[var(--portal-on-accent)] text-sm font-semibold">
              <Copy size={15} /> {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <button type="button" className="text-xs underline text-[var(--portal-muted)]" onClick={() => setNewToken(null)}>Hide saved key</button>
        </section>
      )}

      <section className="bg-[var(--portal-surface)] border border-[var(--portal-border)] rounded-2xl p-6 space-y-5">
        <div className="flex gap-2 items-center text-[var(--portal-text)] font-semibold text-sm"><ShieldCheck size={17} /> Generate a new key</div>
        <form onSubmit={(event) => void create(event)} className="space-y-5">
          <div>
            <label htmlFor="api-key-name" className="block text-xs font-semibold text-[var(--portal-muted)] mb-2">Key name</label>
            <input id="api-key-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required
              className="w-full bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] text-[var(--portal-text)] px-3 py-2.5 rounded-lg text-sm" />
          </div>
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold text-[var(--portal-muted)] mb-2">Access permissions</legend>
            {SCOPE_LABELS.map(({value, label}) => (
              <label key={value} className="flex items-center gap-3 text-sm text-[var(--portal-text)] cursor-pointer">
                <input type="checkbox" checked={scopes.includes(value)} onChange={() => toggleScope(value)} />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>
          <label className="flex gap-3 items-center text-sm text-[var(--portal-text)] cursor-pointer">
            <input type="checkbox" checked={permanent} onChange={(e) => setPermanent(e.target.checked)} />
            No automatic expiration (until revoked)
          </label>
          {!permanent && (
            <div>
              <label htmlFor="api-key-expiry" className="block text-xs text-[var(--portal-muted)] mb-2">Expiration date</label>
              <input id="api-key-expiry" type="datetime-local" required value={expiry} onChange={(e) => setExpiry(e.target.value)}
                className="bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] text-[var(--portal-text)] px-3 py-2.5 rounded-lg text-sm" />
            </div>
          )}
          {permanent && (
            <p className="flex items-start gap-2 text-xs text-[var(--portal-muted)]">
              <AlertTriangle size={15} className="shrink-0" /> Non-expiring keys should be rotated and revoked when no longer needed.
            </p>
          )}
          <button disabled={creating || !name.trim() || scopes.length === 0} type="submit"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[var(--portal-accent)] text-[var(--portal-on-accent)] disabled:opacity-50">
            {creating ? 'Generating…' : 'Generate API key'}
          </button>
        </form>
      </section>

      <section className="bg-[var(--portal-surface)] border border-[var(--portal-border)] rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--portal-text)]">Existing keys</h2>
        {loading && <p className="text-sm text-[var(--portal-muted)]">Loading…</p>}
        {!loading && keys.length === 0 && <p className="text-sm text-[var(--portal-muted)]">No API keys created yet.</p>}
        {keys.map((key) => (
          <div key={key.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-[var(--portal-border)] rounded-xl p-4">
            <div className="space-y-1 min-w-0">
              <div className="text-sm font-semibold text-[var(--portal-text)]">{key.name} {key.revokedAt && <span className="text-xs text-[var(--portal-danger)]">(Revoked)</span>}</div>
              <div className="text-xs font-mono text-[var(--portal-muted)] break-all">{key.prefix}…</div>
              <div className="text-xs text-[var(--portal-muted)]">Created {formatDate(key.createdAt)} · Expires {formatDate(key.expiresAt)}</div>
              <div className="text-xs text-[var(--portal-muted)]">Scopes: {key.scopes.join(', ')}</div>
            </div>
            {!key.revokedAt && (
              <button type="button" disabled={revoking === key.id} onClick={() => void revoke(key)}
                className="flex shrink-0 items-center justify-center gap-2 px-3 py-2 text-xs rounded-lg border border-[var(--portal-danger-border)] text-[var(--portal-danger)] disabled:opacity-50">
                <Trash2 size={14} /> {revoking === key.id ? 'Revoking…' : 'Revoke'}
              </button>
            )}
          </div>
        ))}
      </section>
    </div>
  )
}
