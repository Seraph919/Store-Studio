import React from 'react'
import {
  Sparkles,
  Layout,
  Flame,
  Sun,
  Moon,
  Check,
} from 'lucide-react'
import type {
  StorefrontTemplateId,
  StorefrontThemeMode,
  StorefrontFontPreset,
  StorePaletteId,
} from '../../types/design'
import { STORE_PALETTES } from '../../storefront/palettes'

interface AppearancePanelProps {
  panel: 'templates' | 'theme'
  template: StorefrontTemplateId
  colorMode: StorefrontThemeMode
  paletteId: StorePaletteId
  accentColor: string
  fontPreset: StorefrontFontPreset
  onUpdateTemplate: (template: StorefrontTemplateId) => void
  onUpdateColorMode: (mode: StorefrontThemeMode) => void
  onUpdatePalette: (palette: StorePaletteId) => void
  onUpdateAccentColor: (accentColor: string) => void
  onUpdateFontPreset: (font: StorefrontFontPreset) => void
}

const TEMPLATE_OPTIONS: {
  id: StorefrontTemplateId
  title: string
  subtitle: string
  icon: React.FC<{ className?: string }>
  badge: string
}[] = [
  {
    id: 'EDITORIAL',
    title: 'Editorial',
    subtitle: 'Serif headings with text beside large images.',
    icon: Sparkles,
    badge: 'Luxury',
  },
  {
    id: 'MINIMAL',
    title: 'Minimal',
    subtitle: 'More space between sections and thin borders.',
    icon: Layout,
    badge: 'Modernist',
  },
  {
    id: 'MODERN',
    title: 'Modern',
    subtitle: 'Split banner, bold headings, and rounded cards.',
    icon: Flame,
    badge: 'Contemporary',
  },
]

const ACCENT_SWATCHES = [
  { label: 'Gold Vermeil', value: '#B58A56', color: '#B58A56' },
  { label: 'Rose Gold', value: '#C48B8B', color: '#C48B8B' },
  { label: 'Emerald', value: '#2D6A4F', color: '#2D6A4F' },
  { label: 'Onyx Black', value: '#18181B', color: '#18181B' },
  { label: 'Sapphire Cobalt', value: '#2563EB', color: '#2563EB' },
  { label: 'Royal Burgundy', value: '#881337', color: '#881337' },
  { label: 'Warm Bronze', value: '#9A3412', color: '#9A3412' },
]

const FONT_PRESETS: {
  id: StorefrontFontPreset
  title: string
  preview: string
  description: string
}[] = [
  {
    id: 'ELEGANT',
    title: 'Elegant',
    preview: 'Cormorant & Montserrat',
    description: 'Serif headings with sans-serif body text.',
  },
  {
    id: 'MODERN',
    title: 'Modern',
    preview: 'Montserrat & system sans',
    description: 'Sans-serif headings and body text.',
  },
  {
    id: 'CLASSIC',
    title: 'Classic',
    preview: 'Georgia & Times',
    description: 'Serif headings and body text.',
  },
]

export const AppearancePanel: React.FC<AppearancePanelProps> = ({
  panel,
  template,
  colorMode,
  paletteId,
  accentColor,
  fontPreset,
  onUpdateTemplate,
  onUpdateColorMode,
  onUpdatePalette,
  onUpdateAccentColor,
  onUpdateFontPreset,
}) => {
  return (
    <div className="flex flex-col h-full bg-white text-slate-800 overflow-y-auto p-4 space-y-6">
      {panel === 'templates' && <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
            Storefront Template
          </label>
          <span className="text-[10px] font-mono text-slate-500">
            3 templates
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mb-3">
          Each template keeps its own photos, sections and appearance. Publish to save all template edits.
        </p>

        <div className="space-y-2.5">
          {TEMPLATE_OPTIONS.map((tmpl) => {
            const isSelected = template === tmpl.id
            const Icon = tmpl.icon
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => onUpdateTemplate(tmpl.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all relative ${
                  isSelected
                    ? 'bg-amber-50 border-amber-500 shadow-md ring-1 ring-amber-500'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg mt-0.5 ${
                        isSelected
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {tmpl.title}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {tmpl.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {tmpl.subtitle}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>}

      <div className="h-px bg-[#252830]" />

      {panel === 'theme' && <>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">Color palette</label>
        <p className="text-[11px] text-slate-600 mb-3">Choose a complete color scheme. Every palette has its own light and dark version.</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {STORE_PALETTES.map(preset => <button key={preset.id} type="button" aria-pressed={paletteId === preset.id}
            onClick={() => onUpdatePalette(preset.id)}
            className={`p-2.5 rounded-xl border text-left ${paletteId === preset.id ? 'border-amber-500 ring-1 ring-amber-500 bg-amber-50' : 'border-slate-200 bg-white'}`}>
            <div className="flex overflow-hidden rounded-md border border-white/10 h-9 mb-2">
              {[preset.light.bg,preset.light.text,preset.light.accent,preset.dark.bg,preset.dark.accent].map((color,i) =>
                <span key={i} className="flex-1" style={{backgroundColor:color}} />)}
            </div>
            <div className="text-xs font-semibold text-slate-900">{preset.name}</div>
            <div className="text-[10px] text-slate-600 mt-1">{preset.description}</div>
          </button>)}
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
          Palette display mode
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onUpdateColorMode('LIGHT')}
            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
              colorMode === 'LIGHT'
                ? 'bg-amber-50 border-amber-500 text-slate-900 ring-1 ring-amber-500'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold block">Light mode</span>
              <span className="text-[10px] opacity-60">Palette light colors</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onUpdateColorMode('DARK')}
            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
              colorMode === 'DARK'
                ? 'bg-amber-50 border-amber-500 text-slate-900 ring-1 ring-amber-500'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold block">Dark mode</span>
              <span className="text-[10px] opacity-60">Palette dark colors</span>
            </div>
          </button>
        </div>
      </div>

      <div className="h-px bg-[#252830]" />

      {/* 3. Accent Color Swatches & Custom Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
            Accent override (optional)
          </label>
          <span className="text-[11px] font-mono text-slate-600">{accentColor}</span>
        </div>

        <div className="grid grid-cols-4 gap-2.5 mb-3">
          {ACCENT_SWATCHES.map((swatch) => {
            const isSelected = accentColor.toLowerCase() === swatch.value.toLowerCase()
            return (
              <button
                key={swatch.value}
                type="button"
                onClick={() => onUpdateAccentColor(swatch.value)}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className="w-6 h-6 rounded-full shadow-inner border border-white/20"
                  style={{ backgroundColor: swatch.color }}
                />
                <span className="text-[10px] text-slate-600 truncate max-w-full">
                  {swatch.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Custom hex input */}
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label="Accent color picker"
            value={accentColor}
            onChange={(e) => onUpdateAccentColor(e.target.value)}
            className="w-8 h-8 rounded-lg bg-transparent border border-slate-300 cursor-pointer"
          />
          <input
            type="text"
            aria-label="Accent color"
            value={accentColor}
            onChange={(e) => onUpdateAccentColor(e.target.value)}
            placeholder="#B58A56"
            className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono uppercase focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <div className="h-px bg-[#252830]" />

      {/* 4. Typography Preset */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
          Typography Hierarchy
        </label>
        <div className="space-y-2">
          {FONT_PRESETS.map((font) => {
            const isSelected = fontPreset === font.id
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => onUpdateFontPreset(font.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-amber-50 border-amber-500 text-slate-900 ring-1 ring-amber-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{font.title}</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {font.preview}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {font.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>
      </>}
    </div>
  )
}
