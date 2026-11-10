import { MediaUploadField } from '../components/MediaUploadField'
import { useEffect, useState, type CSSProperties, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, LockKeyhole, Palette, Rocket, ShieldCheck, Store, Sun, Moon } from 'lucide-react'
import { StoreStudioLogo } from '../branding/platformBrand'
import { useAuth } from '../context/useAuth'
import { installationApi } from '../services/installationApi'
import { settingsApi } from '../services/settingsApi'
import { storeApi, parseStoreDesign } from '../services/storeApi'
import type { StorefrontTemplateId, StorefrontThemeMode } from '../types/design'
import './setup.css'

const templates: { id: StorefrontTemplateId; title: string; description: string }[] = [
  { id: 'MINIMAL', title: 'Minimal', description: 'Simple layout with more space between sections.' },
  { id: 'MODERN', title: 'Modern', description: 'Bold headings and rounded cards.' },
  { id: 'EDITORIAL', title: 'Editorial', description: 'Large images with text alongside them.' },
]

// Illustration-only catalog for the setup wizard. Nothing here is inserted into the store database.
const previewProducts = [
  { name: 'Wireless headphones', category: 'Headphones', price: '$59', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=540&q=80' },
  { name: 'Classic watch', category: 'Watches', price: '$129', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=540&q=80' },
  { name: 'Everyday sunglasses', category: 'Glasses', price: '$39', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=540&q=80' },
  { name: 'Signature fragrance', category: 'Perfumes', price: '$69', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=540&q=80' },
] as const
const previewHeroImage = previewProducts[0].image

export default function SetupPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { isAuthenticated, login } = useAuth()
  const status = useQuery({ queryKey: ['installation', 'status'], queryFn: installationApi.status })
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [setupToken, setSetupToken] = useState('')
  const [storeName, setStoreName] = useState('My Store')
  const [tagline, setTagline] = useState('Browse our products')
  const [logoUrl, setLogoUrl] = useState('')
  const [logoDarkUrl, setLogoDarkUrl] = useState('')
  const [template, setTemplate] = useState<StorefrontTemplateId>('MINIMAL')
  const [mode, setMode] = useState<StorefrontThemeMode>('LIGHT')
  const [accent, setAccent] = useState('#FFC300')
  const [ringGuide, setRingGuide] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (status.data?.phase === 'CUSTOMIZE') setStep(current => Math.max(1, current)) }, [status.data?.phase])
  useEffect(() => {
    if (status.data?.phase !== 'CUSTOMIZE' || !isAuthenticated) return
    let cancelled = false
    Promise.all([settingsApi.getSettings(), storeApi.getStoreDesign()]).then(([settings, currentDesign]) => {
      if (cancelled) return
      const design = parseStoreDesign(currentDesign)
      setStoreName(settings.storeName || 'My Store')
      setTagline(settings.storeTagline || '')
      setLogoUrl(settings.logoUrl || '')
      setLogoDarkUrl(settings.logoDarkUrl || '')
      setRingGuide(settings.showRingSizeGuide === true)
      setTemplate(design.template)
      setMode(design.colorMode)
      setAccent(design.accentColor)
    }).catch(() => { /* Saved settings remain available through the dashboard. */ })
    return () => { cancelled = true }
  }, [status.data?.phase, isAuthenticated])

  const createOwner = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError('')
    try {
      await installationApi.createOwner({ setupToken, name, email, password })
      await login({ email: email.trim().toLowerCase(), password })
      await qc.invalidateQueries({ queryKey: ['installation', 'status'] })
      setStep(1); setSetupToken(''); setPassword('')
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not create owner') }
    finally { setBusy(false) }
  }

  const saveBrand = async () => {
    setBusy(true); setError('')
    try {
      const [settings, currentDesign] = await Promise.all([settingsApi.getSettings(), storeApi.getStoreDesign()])
      await settingsApi.updateSettings({ ...settings, storeName: storeName.trim(), storeTagline: tagline.trim(), logoUrl, logoDarkUrl, showRingSizeGuide: ringGuide })
      const design = parseStoreDesign(currentDesign)
      await storeApi.updateStoreDesign({
        template, colorMode: mode, paletteId: design.paletteId, accentColor: accent, fontPreset: design.fontPreset,
        // Preserve all configured sections, but give the hero a layout matching the chosen template.
        // Demo photographs belong to the wizard only and are never persisted.
        branding: { storeName: storeName.trim(), storeTagline: tagline.trim(), logoUrl, logoDarkUrl, showRingSizeGuide: ringGuide },
        designConfig: JSON.stringify({ ...design.config, sections: design.config.sections.map(section =>
          section.type === 'Hero' ? { ...section, variant: template === 'MODERN' ? 'split' : 'fullscreen' } : section
        ) }),
      })
      await qc.invalidateQueries({ queryKey: ['store'] })
      setStep(2)
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save branding') }
    finally { setBusy(false) }
  }

  const publish = async () => {
    setBusy(true); setError('')
    try { await installationApi.complete(); await qc.invalidateQueries({ queryKey: ['installation', 'status'] }); navigate('/seller', { replace: true }) }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not complete setup') }
    finally { setBusy(false) }
  }

  if (!status.data) return <main className="setup-page">Loading installation…</main>
  if (status.data.phase === 'CUSTOMIZE' && !isAuthenticated) return <main className="setup-page"><div className="setup-login"><StoreStudioLogo size={44} showWordmark /><h1>Continue setting up your store</h1><p>The owner account exists. Sign in to finish configuring this installation.</p><Link className="setup-button" to="/login">Sign in as owner <ArrowRight size={17} /></Link></div></main>

  const current = status.data.phase === 'OWNER' ? 0 : step
  const steps = ['Secure installation', 'Brand your store', 'Review & launch']
  return <div className="setup-page">
    <header className="setup-topbar"><StoreStudioLogo size={37} showWordmark /><div className="setup-topline">Self-hosted store setup <span>One installation · One store</span></div></header>
    <div className="setup-wrap">
      <div className="setup-heading"><div><span className="setup-eyebrow">GETTING STARTED</span><h1>Create your store</h1><p>Create an owner account, choose a design, and publish your store.</p></div><span className="setup-step-count">Step {current + 1} of 3</span></div>
      <nav className="setup-steps" aria-label="Setup progress">{steps.map((label, i) => <div key={label} className={`setup-step ${i === current ? 'active' : ''} ${i < current ? 'done' : ''}`}><span>{i < current ? <Check size={16}/> : i + 1}</span><strong>{label}</strong></div>)}</nav>
      {error && <div role="alert" className="setup-error">{error}</div>}
      <div className="setup-grid">
        <section className="setup-card setup-controls">
          {current === 0 && <form id="owner-setup" onSubmit={createOwner}>
            <span className="setup-icon"><ShieldCheck size={25}/></span><h2>Secure your installation</h2><p>Only the person deploying the server should create the first owner account.</p>
            <label>Installation token<input type="password" autoComplete="off" required minLength={32} value={setupToken} onChange={e => setSetupToken(e.target.value)} placeholder="From SETUP_TOKEN in your .env" /></label>
            <label>Your name<input required minLength={2} maxLength={120} value={name} onChange={e => setName(e.target.value)} placeholder="Store owner" /></label>
            <label>Email address<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="owner@example.com" /></label>
            <label>Owner password<input type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 12 characters" /></label>
            <div className="setup-note"><LockKeyhole size={17} /> This account has owner privileges. Public signup is disabled and no customer account is needed to shop.</div>
          </form>}
          {current === 1 && <div><span className="setup-icon"><Palette size={25}/></span><h2>Choose your store design</h2><p>Choose a template and colors. You can change them later in the Design Studio.</p>
            <label>Store name<input maxLength={120} required value={storeName} onChange={e => setStoreName(e.target.value)} /></label>
            <label>Tagline<input maxLength={255} value={tagline} onChange={e => setTagline(e.target.value)} /></label>
            <div className="setup-section-title">Starting template</div>
            <div className="setup-template-options">{templates.map(item => <button type="button" key={item.id} aria-pressed={template === item.id} className={`setup-template ${template === item.id ? 'selected' : ''}`} onClick={() => setTemplate(item.id)}>
              <span className={`setup-template-thumbnail ${item.id.toLowerCase()}`}><span className="setup-thumb-header"/><span className="setup-thumb-copy"/><img src={previewProducts[item.id === 'MINIMAL' ? 1 : item.id === 'MODERN' ? 0 : 3].image} alt="" loading="lazy" /></span>
              <span><strong>{item.title}</strong><small>{item.description}</small></span>{template === item.id && <CheckCircle2 size={19}/>}</button>)}</div>
            <div className="setup-section-title">Appearance</div><div className="setup-modes"><button type="button" className={mode === 'LIGHT' ? 'selected' : ''} onClick={() => setMode('LIGHT')}><Sun size={16}/> Light</button><button type="button" className={mode === 'DARK' ? 'selected' : ''} onClick={() => setMode('DARK')}><Moon size={16}/> Dark</button></div>
            <label>Accent color<input type="color" aria-label="Accent color" value={accent} onChange={e => setAccent(e.target.value)} /></label>
            <MediaUploadField label="Store logo (light mode)" help="Optional. Upload your own logo to R2, or keep the Store Studio default." value={logoUrl} onChange={setLogoUrl} />
            <MediaUploadField label="Store logo (dark mode)" value={logoDarkUrl} onChange={setLogoDarkUrl} />
            <label className="setup-checkbox"><input type="checkbox" checked={ringGuide} onChange={e => setRingGuide(e.target.checked)}/> Show ring-size guide in navigation</label>
          </div>}
          {current === 2 && <div><span className="setup-icon"><Rocket size={25}/></span><h2>Ready to launch</h2><p>Review your store. You can continue changing its appearance after publishing.</p><div className="setup-summary"><div><span>Store</span><strong>{storeName}</strong></div><div><span>Template</span><strong>{templates.find(t => t.id === template)?.title}</strong></div><div><span>Theme</span><strong>{mode === 'LIGHT' ? 'Light' : 'Dark'}</strong></div><div><span>Ring-size guide</span><strong>{ringGuide ? 'Enabled' : 'Disabled'}</strong></div></div><div className="setup-note"><ShieldCheck size={17}/> Once published, the first-time installation wizard is permanently disabled. You'll manage the store through the private dashboard.</div></div>}
        </section>
        <section className="setup-card setup-preview">
          <div className="setup-preview-label"><div><Store size={19}/><strong>Live storefront preview</strong></div><span>Sample products · Not added to your store</span></div>
          <div className={`setup-store-preview ${mode === 'DARK' ? 'dark' : ''} template-${template.toLowerCase()}`} style={{ '--preview-accent': accent } as CSSProperties}>
            <div className="setup-preview-nav"><div className="setup-brand">{logoUrl ? <img src={mode === 'DARK' ? (logoDarkUrl || logoUrl) : logoUrl} alt="Store logo" /> : <img src={mode === 'DARK' ? '/store-studio-logo-dark.svg' : '/store-studio-logo-light.svg'} alt="Default logo" />}<strong>{storeName || 'Your store'}</strong></div><span>Home · Shop · About</span></div>
            <div className={`setup-preview-hero ${template.toLowerCase()}`}>
              <div className="setup-preview-hero-copy"><span className="setup-preview-eyebrow">Shop the collection</span><h3>Browse the collection</h3><p>{tagline || 'Browse our products'}</p><span className="setup-preview-cta">Shop now →</span></div>
              {template !== 'MINIMAL' && <img className="setup-preview-hero-photo" src={previewHeroImage} alt="Demo headphones product" />}
            </div>
            <div className="setup-preview-categories"><strong>Shop by category</strong><div>{previewProducts.map(product => <div key={product.category} className="setup-preview-category"><img src={product.image} alt="" loading="lazy"/><span>{product.category}</span></div>)}</div></div>
            <div className="setup-preview-products"><b>Featured products</b><div>{previewProducts.map(product => <div className="setup-demo-product" key={product.name}><img src={product.image} alt={product.name} loading="lazy"/><small>{product.name}</small><strong>{product.price}</strong></div>)}</div></div>
            <div className="setup-preview-foot">© {new Date().getFullYear()} {storeName || 'Your store'} <span>Powered by Store Studio</span></div>
          </div><p className="setup-preview-hint">Demo photography is only for choosing a style. Your actual storefront starts with an empty catalog.</p>
        </section>
      </div>
      <div className="setup-footer">{current > 1 ? <button type="button" className="setup-back" onClick={() => setStep(1)}><ArrowLeft size={16}/> Back</button> : <span/>}{current === 0 ? <button disabled={busy} form="owner-setup" type="submit" className="setup-button">{busy ? 'Creating account…' : 'Create owner account'} <ArrowRight size={17}/></button> : current === 1 ? <button disabled={busy || !storeName.trim()} type="button" className="setup-button" onClick={saveBrand}>{busy ? 'Saving…' : 'Continue'} <ArrowRight size={17}/></button> : <button disabled={busy} type="button" className="setup-button" onClick={publish}>{busy ? 'Publishing…' : 'Publish store'} <Rocket size={17}/></button>}</div>
    </div>
  </div>
}
