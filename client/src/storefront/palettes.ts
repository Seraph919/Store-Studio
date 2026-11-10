import type { StorePaletteId, StorefrontThemeMode } from '../types/design'

export interface PaletteColors {
  bg: string; surface: string; subtle: string; text: string; muted: string; border: string; accent: string
}
export interface PalettePreset {
  id: StorePaletteId; name: string; description: string; light: PaletteColors; dark: PaletteColors
}
export const STORE_PALETTES: PalettePreset[] = [
  { id: 'CHAMPAGNE', name: 'Champagne & Onyx', description: 'Warm, elegant neutrals with gold details',
    light: { bg:'#FAF9F6', surface:'#FFFFFF', subtle:'#F2EEE7', text:'#201C18', muted:'#605750', border:'#D8CEC1', accent:'#92631F' },
    dark: { bg:'#141210', surface:'#201C19', subtle:'#2D2721', text:'#FAF7F1', muted:'#CEC1B2', border:'#4A4034', accent:'#DDBB77' } },
  { id: 'NAVY_GOLD', name: 'Navy & Gold', description: 'Deep maritime navy and warm metallic gold',
    light: { bg:'#F5F7FB', surface:'#FFFFFF', subtle:'#E9EDF5', text:'#11243E', muted:'#405575', border:'#C9D3E1', accent:'#986A20' },
    dark: { bg:'#0A1628', surface:'#12233D', subtle:'#1C3351', text:'#F4F7FD', muted:'#C5D0E1', border:'#324B6C', accent:'#E6C176' } },
  { id: 'MONOCHROME', name: 'Black & White', description: 'Pure monochrome with strong contrast',
    light: { bg:'#FFFFFF', surface:'#F9F9F9', subtle:'#EEEEEE', text:'#101010', muted:'#525252', border:'#D3D3D3', accent:'#181818' },
    dark: { bg:'#090909', surface:'#161616', subtle:'#242424', text:'#F8F8F8', muted:'#C2C2C2', border:'#3B3B3B', accent:'#F0F0F0' } },
  { id: 'FOREST_COPPER', name: 'Forest & Copper', description: 'Botanical greens and artisan copper',
    light: { bg:'#F8FAF6', surface:'#FFFFFF', subtle:'#EAF0E7', text:'#17362A', muted:'#456154', border:'#C5D4C8', accent:'#965327' },
    dark: { bg:'#0D1D17', surface:'#15291F', subtle:'#223C2D', text:'#F0F7F1', muted:'#C4D6C7', border:'#385444', accent:'#E8A371' } },
]
export function paletteColors(id: StorePaletteId | undefined, mode: StorefrontThemeMode): PaletteColors {
  const palette = STORE_PALETTES.find(item => item.id === id) ?? STORE_PALETTES[0]
  return mode === 'DARK' ? palette.dark : palette.light
}
export function resolvedAccent(id: StorePaletteId | undefined, mode: StorefrontThemeMode, savedAccent?: string): string {
  // Existing custom accent is honored, but built-in swatch values adapt automatically with mode.
  const isPresetAccent = !savedAccent || STORE_PALETTES.some(item =>
    item.light.accent.toLowerCase() === savedAccent.toLowerCase() ||
    item.dark.accent.toLowerCase() === savedAccent.toLowerCase()) || savedAccent.toLowerCase() === '#b58a56'
  return isPresetAccent ? paletteColors(id, mode).accent : savedAccent!
}
