import { useState } from 'react'
import { useStoreDesignQuery, parseStoreDesign, DEFAULT_DESIGN_CONFIG } from '../../services/storeApi'
import { useStoreSettingsQuery, useProductsQuery, useCategoriesQuery } from '../../hooks/useStoreQueries'
import { StorefrontRenderer } from '../../storefront/StorefrontRenderer'
import { StoreShell } from '../../storefront/StoreShell'
import { EditorTopBar, type ViewportMode } from './EditorTopBar'
import { SectionsPanel } from './SectionsPanel'
import { SectionInspector } from './SectionInspector'
import { AppearancePanel } from './AppearancePanel'
import { BrandingPanel } from './BrandingPanel'
import { PreviewFrame } from './PreviewFrame'
import { useDesignDraft } from './useDesignDraft'
import { switchDesignTemplate } from './templateDrafts'
import type { ParsedStoreDesign, StoreSection, StoreSectionType } from '../../types/design'
import type { StoreSettings } from '../../services/settingsApi'
import './editor.css'
import { STORE_PALETTES } from '../../storefront/palettes'

export default function StoreDesignEditor() {
  const design = useStoreDesignQuery()
  const settings = useStoreSettingsQuery()
  if (design.isError || settings.isError) return <div className="studio-load" role="alert">
    <h1>We couldn’t load your store</h1><p>Your published store has not changed.</p>
    <button onClick={() => { design.refetch(); settings.refetch() }}>Try again</button>
    <a href="/seller">Back to dashboard</a>
  </div>
  if (!design.data || !settings.data) return <div className="studio-load" role="status">Loading Store Studio…</div>
  const initial = parseStoreDesign(design.data)
  initial.branding ??= { storeName: settings.data.storeName, storeTagline: settings.data.storeTagline,
    logoUrl: settings.data.logoUrl, logoDarkUrl: settings.data.logoDarkUrl, showRingSizeGuide: settings.data.showRingSizeGuide }
  return <EditorSession initial={initial} settings={settings.data} />
}

function EditorSession({ initial, settings }: { initial: ParsedStoreDesign; settings: StoreSettings }) {
  const { draft, setDraft, dirty, blocker, publish, discard, mutation } = useDesignDraft(initial)
  const { data: productsData } = useProductsQuery({ size: 50 })
  const { data: categories = [] } = useCategoriesQuery()
  const products = productsData?.content ?? []
  const [tab, setTab] = useState<'templates' | 'theme' | 'sections' | 'branding'>('sections')
  const [selectedId, select] = useState<string | null>(null)
  const [viewport, setViewport] = useState<ViewportMode>('desktop')
  const [mobilePanel, setMobilePanel] = useState<'settings' | 'preview'>('preview')
  const selected = draft.config.sections.find(section => section.id === selectedId)
  const updateSections = (sections: StoreSection[]) => setDraft(current => ({ ...current, config: { ...current.config, sections } }))
  const reorder = (index: number, direction: number) => {
    const sections = [...draft.config.sections]
    if (index + direction < 0 || index + direction >= sections.length) return
    ;[sections[index], sections[index + direction]] = [sections[index + direction], sections[index]]
    updateSections(sections)
  }
  const add = (type: StoreSectionType) => {
    const example = DEFAULT_DESIGN_CONFIG.sections.find(section => section.type === type)
    const section: StoreSection = { id: `${type.toLowerCase()}-${crypto.randomUUID()}`, type,
      enabled: true, variant: example?.variant ?? 'full',
      settings: example ? structuredClone(example.settings) : { text: 'Your announcement', ctaText: 'Shop', ctaLink: '/shop' } }
    updateSections([...draft.config.sections, section]); select(section.id)
  }
  const selectSection = (id: string) => { select(id); setTab('sections'); setMobilePanel('settings') }
  return <div className="studio-editor" data-theme="light">
    <EditorTopBar storeName={draft.branding?.storeName || 'Your store'} viewport={viewport} onViewportChange={setViewport}
      isDirty={dirty} isSaving={mutation.isPending} saveSuccess={mutation.isSuccess} onPublish={publish}
      onDiscard={() => { if (window.confirm('Discard all unpublished changes?')) { discard(); select(null) } }} />
    {mutation.isError && <div className="studio-error" role="alert">Couldn’t publish: {mutation.error.message}. Your changes are still here.</div>}
    <div className="studio-mobile-switch" role="group" aria-label="Editor panel">
      <button aria-pressed={mobilePanel === 'settings'} onClick={() => setMobilePanel('settings')}>Settings</button>
      <button aria-pressed={mobilePanel === 'preview'} onClick={() => setMobilePanel('preview')}>Website preview</button>
    </div>
    <div className="studio-workspace" data-panel={mobilePanel}>
      <aside className="studio-sidebar" aria-label="Store settings">
        {selected ? <SectionInspector section={selected} template={draft.template} products={products} categories={categories}
          onBack={() => select(null)} onUpdate={updated => updateSections(draft.config.sections.map(section => section.id === updated.id ? updated : section))} /> : <>
          <nav className="studio-tabs" aria-label="Editor settings">
            {([['templates', 'Templates'], ['theme', 'Theme'], ['sections', 'Homepage sections'], ['branding', 'Branding']] as const).map(([value, label]) =>
              <button key={value} aria-current={tab === value ? 'page' : undefined} onClick={() => setTab(value)}>{label}</button>)}
          </nav>
          <div className="studio-panel">
            {tab === 'sections' && <SectionsPanel sections={draft.config.sections} selectedSectionId={selectedId} onSelectSection={selectSection}
              onToggleVisibility={id => updateSections(draft.config.sections.map(section => section.id === id ? { ...section, enabled: !section.enabled } : section))}
              onMoveUp={index => reorder(index, -1)} onMoveDown={index => reorder(index, 1)}
              onDeleteSection={id => updateSections(draft.config.sections.filter(section => section.id !== id))} onAddSection={add} />}
            {(tab === 'templates' || tab === 'theme') && <AppearancePanel panel={tab} template={draft.template} colorMode={draft.colorMode} paletteId={draft.paletteId}
              accentColor={draft.accentColor} fontPreset={draft.fontPreset}
              onUpdateTemplate={template => { setDraft(current => switchDesignTemplate(current, template)); select(null) }} onUpdatePalette={paletteId => setDraft({ ...draft, paletteId, accentColor: STORE_PALETTES.find(p => p.id === paletteId)!.light.accent })} onUpdateColorMode={colorMode => setDraft({ ...draft, colorMode })}
              onUpdateAccentColor={accentColor => setDraft({ ...draft, accentColor })} onUpdateFontPreset={fontPreset => setDraft({ ...draft, fontPreset })} />}
            {tab === 'branding' && <BrandingPanel settings={draft.branding ?? {}} onChange={branding => setDraft({ ...draft, branding })} />}
          </div>
        </>}
      </aside>
      <div className="studio-canvas" aria-label="Website preview canvas">
        <PreviewFrame viewport={viewport}>
          <StoreShell design={draft} settings={settings} isPreview onSelectSection={selectSection}>
            <StorefrontRenderer design={draft} storeSettings={{ ...settings, ...draft.branding }} products={products} categories={categories}
              isPreview isEditMode selectedSectionId={selectedId} onSelectSection={selectSection} />
          </StoreShell>
        </PreviewFrame>
      </div>
    </div>
    {blocker.state === 'blocked' && <div className="studio-dialog-backdrop">
      <div className="studio-dialog" onKeyDown={event => {
        if (event.key === 'Escape') blocker.reset()
        if (event.key === 'Tab') {
          const buttons = Array.from(event.currentTarget.querySelectorAll('button'))
          const next = buttons[(buttons.indexOf(document.activeElement as HTMLButtonElement) + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length]
          event.preventDefault(); next?.focus()
        }
      }} role="alertdialog" aria-modal="true" aria-labelledby="leave-title">
        <h2 id="leave-title">Leave with unpublished changes?</h2><p>Your changes will be lost. Publish them or stay in the editor to keep working.</p>
        <button autoFocus onClick={() => blocker.reset()}>Keep editing</button><button onClick={() => blocker.proceed()}>Discard and leave</button>
      </div>
    </div>}
  </div>
}
