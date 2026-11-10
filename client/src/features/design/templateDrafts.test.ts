import { describe, it, expect } from 'vitest'
import { snapshotTemplate, withSavedActiveTemplate, switchDesignTemplate } from './templateDrafts'
import type { ParsedStoreDesign } from '../../types/design'

const mockDesign: ParsedStoreDesign = {
  id: 1,
  template: 'EDITORIAL',
  colorMode: 'LIGHT',
  paletteId: 'CHAMPAGNE',
  accentColor: '#B58A56',
  fontPreset: 'ELEGANT',
  branding: {
    storeName: 'Test Store',
    storeTagline: 'Quality goods',
  },
  config: {
    sections: [
      {
        id: 'hero',
        type: 'Hero',
        variant: 'fullscreen',
        enabled: true,
        settings: { title: 'Welcome' },
      },
    ],
    templateDrafts: {},
  },
}

describe('templateDrafts', () => {
  it('correctly snapshots a design configuration', () => {
    const snapshot = snapshotTemplate(mockDesign)
    expect(snapshot).toEqual({
      sections: mockDesign.config.sections,
      colorMode: 'LIGHT',
      paletteId: 'CHAMPAGNE',
      accentColor: '#B58A56',
      fontPreset: 'ELEGANT',
    })
    // Ensure deep clone
    expect(snapshot.sections).not.toBe(mockDesign.config.sections)
  })

  it('preserves active template in templateDrafts with withSavedActiveTemplate', () => {
    const updated = withSavedActiveTemplate(mockDesign)
    expect(updated.config.templateDrafts?.EDITORIAL).toBeDefined()
    expect(updated.config.templateDrafts?.EDITORIAL?.fontPreset).toBe('ELEGANT')
    expect(updated.config.templateDrafts?.EDITORIAL?.accentColor).toBe('#B58A56')
  })

  it('returns identical design if switching to the same template', () => {
    const result = switchDesignTemplate(mockDesign, 'EDITORIAL')
    expect(result).toBe(mockDesign)
  })

  it('switches template and saves current template as draft when switching to a new template', () => {
    const switched = switchDesignTemplate(mockDesign, 'MODERN')
    expect(switched.template).toBe('MODERN')
    expect(switched.config.templateDrafts?.EDITORIAL).toBeDefined()
    expect(switched.config.templateDrafts?.EDITORIAL?.sections[0].id).toBe('hero')
  })

  it('restores previously saved draft when switching back to a template', () => {
    const designWithSavedMinimal: ParsedStoreDesign = {
      ...mockDesign,
      config: {
        ...mockDesign.config,
        templateDrafts: {
          MINIMAL: {
            sections: [
              {
                id: 'minimal-hero',
                type: 'Hero',
                variant: 'layered',
                enabled: true,
                settings: { title: 'Minimal Look' },
              },
            ],
            colorMode: 'DARK',
            paletteId: 'MONOCHROME',
            accentColor: '#000000',
            fontPreset: 'MODERN',
          },
        },
      },
    }

    const switched = switchDesignTemplate(designWithSavedMinimal, 'MINIMAL')
    expect(switched.template).toBe('MINIMAL')
    expect(switched.colorMode).toBe('DARK')
    expect(switched.paletteId).toBe('MONOCHROME')
    expect(switched.accentColor).toBe('#000000')
    expect(switched.fontPreset).toBe('MODERN')
    expect(switched.config.sections[0].id).toBe('minimal-hero')
  })
})
