import type { StoreSection, StorefrontTemplateId } from '../../types/design'
import { StoreImage } from '../components/StoreImage'

interface Props { section: StoreSection; template: StorefrontTemplateId; storeName: string; storeTagline?: string; isPreview?: boolean }
export function HeroSectionRenderer({ section, template, storeName, storeTagline }: Props) {
  const { settings, variant } = section
  // A missing image (or a legacy layered layout) uses the clean, solid background.
  const imageUrl = variant === 'layered' ? undefined : settings.imageUrl?.trim()
  const split = Boolean(imageUrl) && (template === 'MODERN' || (template === 'EDITORIAL' && variant === 'split'))
  const cover = Boolean(imageUrl) && template === 'EDITORIAL' && !split
  const emptyModern = template === 'MODERN' && !imageUrl
  const emptyEditorial = template === 'EDITORIAL' && !imageUrl
  return <section className={`store-hero ${cover ? 'store-hero-cover' : split ? 'store-hero-split' : emptyModern ? 'store-hero-modern' : emptyEditorial ? 'store-hero-editorial' : 'store-hero-minimal'}`}
    data-align={settings.alignment ?? 'center'}>
    {cover && imageUrl && <div className="store-hero-background">
      <StoreImage src={imageUrl} alt="" />
      <div style={{ background: '#000', opacity: (settings.overlayOpacity ?? 50) / 100 }} />
    </div>}
    <div className="store-hero-copy">
      <span className="store-eyebrow">{settings.eyebrow ?? storeName}</span>
      <h1>{settings.title ?? storeName}</h1>
      <p>{settings.intro ?? storeTagline}</p>
      {settings.cta && <a className="template-btn store-cta" href={settings.ctaLink || '/shop'}>{settings.cta}</a>}
    </div>
    {split && imageUrl && <StoreImage className="store-hero-photo" src={imageUrl} alt={settings.title || storeName} />}
    {emptyModern && <div className="store-hero-modern-art" aria-hidden="true"><span/><span/><span/></div>}
  </section>
}
