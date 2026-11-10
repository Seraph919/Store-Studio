import { useState, type CSSProperties, type ReactNode, type SyntheticEvent } from 'react'
import type { ParsedStoreDesign } from '../types/design'
import type { StoreSettings } from '../services/settingsApi'
import { StoreHeader } from './components/StoreHeader'
import { StoreFooter } from './components/StoreFooter'
import { lightLogo, darkLogo } from './components/StoreImage'
import { StoreDisplayModeContext } from './StoreDisplayModeContext'
import { accentForeground } from './accentContrast'
import { paletteColors, resolvedAccent } from './palettes'
import './storefront.css'

interface Props {
  design: ParsedStoreDesign
  settings?: StoreSettings
  children: ReactNode
  isPreview?: boolean
  onSelectSection?: (id: string) => void
}

/** One public shell, shared by public routes and the editor preview. */
export function StoreShell({ design, settings, children, isPreview, onSelectSection }: Props) {
  // Shopper preference is local to their browser and never updates the owner's published design.
  const [visitorMode, setVisitorMode] = useState<'LIGHT' | 'DARK' | null>(() => {
    if (typeof window === 'undefined') return null
    const saved = window.localStorage.getItem('storefront-visitor-mode')
    return saved === 'LIGHT' || saved === 'DARK' ? saved : null
  })
  const displayedMode = isPreview ? design.colorMode : (visitorMode ?? design.colorMode)
  const toggleVisitorMode = () => {
    if (isPreview) return
    const next = displayedMode === 'DARK' ? 'LIGHT' : 'DARK'
    window.localStorage.setItem('storefront-visitor-mode', next)
    setVisitorMode(next)
  }
  const colors = paletteColors(design.paletteId, displayedMode)
  const accent = resolvedAccent(design.paletteId, displayedMode, design.accentColor)
  const branding = design.branding ?? settings
  const storeName = branding?.storeName || 'Store Studio'
  const showRingSizeGuide = branding?.showRingSizeGuide ?? settings?.showRingSizeGuide ?? false
  const logoUrl = displayedMode === 'DARK'
    ? branding?.logoDarkUrl || branding?.logoUrl
    : branding?.logoUrl
  // Selection is the only storefront action permitted while editing.
  const containInteraction = (event: SyntheticEvent) => {
    if (!isPreview) return
    event.preventDefault()
    event.stopPropagation()
    const target = event.target as Element
    const id = target.closest<HTMLElement>('[data-section-id]')?.dataset.sectionId
    if (id) onSelectSection?.(id)
  }
  return (
    <StoreDisplayModeContext.Provider value={displayedMode}>
    <div className="seller-storefront store-shell" data-template={design.template.toLowerCase()}
      data-theme={displayedMode.toLowerCase()} data-palette={design.paletteId?.toLowerCase()} data-font={design.fontPreset.toLowerCase()}
      style={{ '--store-accent': accent, '--store-accent-text': accentForeground(accent), '--store-bg': colors.bg, '--store-surface': colors.surface, '--store-surface-subtle': colors.subtle, '--store-text': colors.text, '--store-text-muted': colors.muted, '--store-border': colors.border } as CSSProperties}
      onClickCapture={containInteraction} onAuxClickCapture={containInteraction}
      onSubmitCapture={containInteraction} onDragStartCapture={isPreview ? containInteraction : undefined}>
      <StoreHeader storeName={storeName} storeTagline={branding?.storeTagline} logoUrl={logoUrl || (displayedMode === 'DARK' ? darkLogo : lightLogo)} showRingSizeGuide={showRingSizeGuide} isPreview={isPreview} mode={displayedMode} onToggleMode={toggleVisitorMode} />
      <main className="store-content">{children}</main>
      <StoreFooter storeName={storeName} storeTagline={branding?.storeTagline} showRingSizeGuide={showRingSizeGuide} isPreview={isPreview} />
    </div>
    </StoreDisplayModeContext.Provider>
  )
}
