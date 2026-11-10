import React, { createContext, useContext, useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark'
export type ThemePalette = 'classic' | 'sapphire'

export interface ThemePaletteDefinition {
  id: ThemePalette
  name: string
  subtitle: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    contrast: string
  }
}

export const THEME_PALETTES: ThemePaletteDefinition[] = [
  {
    id: 'classic',
    name: 'Maison Noir & Gold',
    subtitle: 'Classic haute joaillerie luxury with Deep Onyx and Burnished Gold',
    colors: {
      primary: '#1c1917',
      secondary: '#44403c',
      accent: '#ca8a04',
      background: '#fafaf9',
      contrast: '#0c0a09',
    },
  },
  {
    id: 'sapphire',
    name: 'Royal Sapphire & Gold',
    subtitle: 'Imperial sophistication with Midnight Navy, Steel Sapphire & Imperial Gold',
    colors: {
      primary: '#0C1F3C',
      secondary: '#1F3A5F',
      accent: '#E2B84A',
      background: '#FAF6ED',
      contrast: '#111827',
    },
  },
]

interface ThemeContextType {
  // Mode (light / dark)
  theme: ThemeMode
  mode: ThemeMode
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
  setMode: (mode: ThemeMode) => void

  // Palette (classic / sapphire)
  palette: ThemePalette
  setPalette: (palette: ThemePalette) => void
  togglePalette: () => void
  currentPalette: ThemePaletteDefinition
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_MODE_KEY = 'maison-elite-theme'
const THEME_PALETTE_KEY = 'maison-elite-palette'
export const THEME_EXPLICIT_KEY = 'maison-elite-theme-explicit'

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_MODE_KEY)
    if ((saved === 'light' || saved === 'dark') && localStorage.getItem(THEME_EXPLICIT_KEY) === 'true') {
      return saved
    }
    return 'light' // Default management shell mode
  })

  const [palette, setPaletteState] = useState<ThemePalette>(() => {
    const saved = localStorage.getItem(THEME_PALETTE_KEY)
    if (saved === 'classic' || saved === 'sapphire') {
      return saved
    }
    return 'classic'
  })

  useEffect(() => {
    localStorage.setItem(THEME_MODE_KEY, mode)
    localStorage.setItem(THEME_PALETTE_KEY, palette)
  }, [mode, palette])

  const toggleTheme = React.useCallback(() => {
    setModeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem(THEME_MODE_KEY, next)
      localStorage.setItem(THEME_EXPLICIT_KEY, 'true')
      return next
    })
  }, [])

  const setTheme = React.useCallback((newMode: ThemeMode) => {
    setModeState(newMode)
    localStorage.setItem(THEME_MODE_KEY, newMode)
    localStorage.setItem(THEME_EXPLICIT_KEY, 'true')
  }, [])

  const setPalette = React.useCallback((newPalette: ThemePalette) => {
    setPaletteState(newPalette)
  }, [])

  const togglePalette = React.useCallback(() => {
    setPaletteState((prev) => (prev === 'classic' ? 'sapphire' : 'classic'))
  }, [])

  const currentPalette = THEME_PALETTES.find((p) => p.id === palette) || THEME_PALETTES[0]

  return (
    <ThemeContext.Provider
      value={{
        theme: mode,
        mode,
        toggleTheme,
        setTheme,
        setMode: setTheme,
        palette,
        setPalette,
        togglePalette,
        currentPalette,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
