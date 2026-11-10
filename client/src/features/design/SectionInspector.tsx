import { MediaUploadField } from '../../components/MediaUploadField'
import { ArrowLeft } from 'lucide-react'
import type { StoreSection, SectionSettings, StorefrontTemplateId } from '../../types/design'
import type { Product, Category } from '../../types'
interface Props { section: StoreSection; template: StorefrontTemplateId; products: Product[]; categories: Category[];
  onBack: () => void; onUpdate: (section: StoreSection) => void }
export function SectionInspector({ section, template, products, categories, onBack, onUpdate }: Props) {
  const set = <K extends keyof SectionSettings>(key: K, value: SectionSettings[K]) => onUpdate({ ...section, settings: { ...section.settings, [key]: value } })
  const text = (key: keyof SectionSettings, label: string, multiline = false) => <label className="studio-field" key={key}>{label}
    {multiline ? <textarea rows={4} value={String(section.settings[key] ?? '')} onChange={e => set(key, e.target.value)} maxLength={2000} />
      : <input value={String(section.settings[key] ?? '')} onChange={e => set(key, e.target.value)} maxLength={key.toLowerCase().includes('url') ? 2048 : 255} />}
  </label>
  const isProducts = section.type === 'FeaturedProducts' || section.type === 'ProductCollection'
  return <div className="studio-inspector">
    <button onClick={onBack} className="flex items-center gap-2"><ArrowLeft size={16} />Back to sections</button>
    <h2>{section.type.replace(/([a-z])([A-Z])/g, '$1 $2')}</h2>
    <label className="studio-field"><input type="checkbox" checked={section.enabled} onChange={e => onUpdate({ ...section, enabled: e.target.checked })} />Show on homepage</label>
    {section.type !== 'PromotionalBanner' && text('title', 'Heading')}
    {['Hero', 'BrandStory', 'Reviews'].includes(section.type) && text('eyebrow', 'Small heading')}
    {text(section.type === 'Hero' ? 'intro' : section.type === 'BrandStory' ? 'description' : section.type === 'PromotionalBanner' ? 'text' : 'subtitle', section.type === 'PromotionalBanner' ? 'Announcement' : 'Description', true)}
    {['Hero', 'BrandStory', 'PromotionalBanner'].includes(section.type) && <>
      {text(section.type === 'PromotionalBanner' ? 'ctaText' : 'cta', 'Button label')}{text('ctaLink', 'Button destination (store route)')}
    </>}
    {(section.type === 'BrandStory' || (section.type === 'Hero' && template !== 'MINIMAL')) && <MediaUploadField label={section.type === 'Hero' ? 'Hero photo' : 'Brand story photo'} value={section.settings.imageUrl} onChange={url => set('imageUrl', url)} help="Upload a JPEG, PNG or WebP image to your R2 bucket." />}
    {section.type === 'Hero' && <>
      {template === 'EDITORIAL' && <label className="studio-field">Image layout<select value={section.variant} onChange={e => onUpdate({ ...section, variant: e.target.value })}><option value="fullscreen">Cover image</option><option value="split">Split image</option></select></label>}
      <label className="studio-field">Text alignment<select value={section.settings.alignment ?? 'center'} onChange={e => set('alignment', e.target.value as 'left' | 'center' | 'right')}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
      {template === 'EDITORIAL' && section.variant !== 'split' && <label className="studio-field">Image overlay: {section.settings.overlayOpacity ?? 50}%<input type="range" min="0" max="100" value={section.settings.overlayOpacity ?? 50} onChange={e => set('overlayOpacity', Number(e.target.value))} /></label>}
    </>}
    {section.type === 'BrandStory' && <label className="studio-field">Image position<select value={section.variant} onChange={e => onUpdate({ ...section, variant: e.target.value })}><option value="split-right">Right</option><option value="split-left">Left</option></select></label>}
    {section.type === 'Categories' && <>
      <label className="studio-field">Layout<select value={section.variant} onChange={e => onUpdate({ ...section, variant: e.target.value })}><option value="cards">Cards</option><option value="strip">Compact list</option></select></label>
      <label className="studio-field">Category count<input type="number" min="1" max="12" value={section.settings.maxCategories ?? 4} onChange={e => set('maxCategories', Math.max(1, Math.min(12, Number(e.target.value))))} /></label>
    </>}
    {isProducts && <>
      <label className="studio-field">Products to show<select value={section.settings.strategy ?? 'featured'} onChange={e => set('strategy', e.target.value as SectionSettings['strategy'])}>
        <option value="featured">Selected featured products</option><option value="newest">Newest products</option><option value="custom">Selected products</option><option value="category">Category</option><option value="packs">Packs</option>
      </select></label>
      {section.settings.strategy === 'category' && <label className="studio-field">Category<select value={section.settings.categoryName ?? ''} onChange={e => set('categoryName', e.target.value)}><option value="">Choose a category</option>{categories.map(category => <option key={category.id} value={category.name}>{category.name}</option>)}</select></label>}
      {['featured', 'custom', 'curated'].includes(section.settings.strategy ?? 'featured') && <fieldset className="studio-field"><legend>Select products</legend>{products.length === 0 && <p>Add products to your catalog first.</p>}{products.map(product => <label key={product.id} className="block py-1"><input type="checkbox" checked={section.settings.productIds?.includes(product.id) ?? false} onChange={e => set('productIds', e.target.checked ? [...(section.settings.productIds ?? []), product.id] : (section.settings.productIds ?? []).filter(id => id !== product.id))} />{product.name}</label>)}</fieldset>}
      <label className="studio-field">Desktop columns<select value={section.settings.columns ?? 4} onChange={e => set('columns', Number(e.target.value))}>{[2,3,4].map(n => <option key={n} value={n}>{n}</option>)}</select></label>
      <label className="studio-field">Product count<input type="number" min="1" max="16" value={section.settings.maxProducts ?? 8} onChange={e => set('maxProducts', Math.max(1, Math.min(16, Number(e.target.value))))} /></label>
    </>}
    {section.type === 'PromotionalBanner' && <>{(['bgColor', 'textColor'] as const).map(key => <label key={key} className="studio-field">{key === 'bgColor' ? 'Background color' : 'Text color'}<input type="color" value={section.settings[key] ?? (key === 'bgColor' ? '#B58A56' : '#ffffff')} onChange={e => set(key,e.target.value)} /></label>)}</>}
  </div>
}
