import { createContext, useContext } from 'react'

/** Effective storefront mode (owner-published default + this shopper's preference). */
export type DisplayMode = 'LIGHT' | 'DARK'
export const StoreDisplayModeContext = createContext<DisplayMode | null>(null)
export const useStoreDisplayMode = () => useContext(StoreDisplayModeContext)
