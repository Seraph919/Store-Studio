import { createContext, useContext } from 'react'
import type { Cart } from '../types'

export interface CartContextType {
  cart: Cart | null
  cartId: string | null
  itemCount: number
  isCartOpen: boolean
  isLoading: boolean
  addToCart: (productId: number, quantity?: number) => Promise<void>
  updateQuantity: (productId: number, quantity: number) => Promise<void>
  removeItem: (productId: number) => Promise<void>
  openCart: () => void
  closeCart: () => void
  refreshCart: () => Promise<void>
  resetCart: () => void
}

export const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = (): CartContextType => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
