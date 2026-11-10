import React, { useEffect, useState, useCallback } from 'react'
import type { Cart } from '../types'
import { cartApi } from '../services/cartApi'
import { CartContext } from './useCart'
import { queryClient } from '../lib/queryClient'
import { storeQueryKeys } from '../hooks/useStoreQueries'

const CART_ID_STORAGE_KEY = 'luxury_store_cart_id'

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartId, setCartId] = useState<string | null>(localStorage.getItem(CART_ID_STORAGE_KEY))
  const [cart, setCart] = useState<Cart | null>(null)
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const ensureCartId = useCallback(async (): Promise<string> => {
    let existingId = localStorage.getItem(CART_ID_STORAGE_KEY)
    if (!existingId) {
      const res = await cartApi.createCart()
      existingId = res.cartId
      localStorage.setItem(CART_ID_STORAGE_KEY, existingId)
      setCartId(existingId)
    }
    return existingId
  }, [])

  const refreshCart = useCallback(async () => {
    const currentId = localStorage.getItem(CART_ID_STORAGE_KEY)
    if (!currentId) return

    try {
      const data = await cartApi.getCart(currentId)
      setCart(data)
      queryClient.setQueryData(storeQueryKeys.cart(currentId), data)
    } catch {
      // If the cart expired or doesn't exist on server, create fresh cart
      try {
        const res = await cartApi.createCart()
        localStorage.setItem(CART_ID_STORAGE_KEY, res.cartId)
        setCartId(res.cartId)
        const fresh = await cartApi.getCart(res.cartId)
        setCart(fresh)
        queryClient.setQueryData(storeQueryKeys.cart(res.cartId), fresh)
      } catch {
        // server might be offline or still starting
      }
    }
  }, [])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const addToCart = async (productId: number, quantity: number = 1) => {
    setIsLoading(true)
    try {
      const activeCartId = await ensureCartId()
      const updatedCart = await cartApi.addItem(activeCartId, { productId, quantity })
      setCart(updatedCart)
      queryClient.setQueryData(storeQueryKeys.cart(activeCartId), updatedCart)
      setIsCartOpen(true)
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!cartId) return
    setIsLoading(true)
    try {
      if (quantity <= 0) {
        const updatedCart = await cartApi.removeItem(cartId, productId)
        setCart(updatedCart)
        queryClient.setQueryData(storeQueryKeys.cart(cartId), updatedCart)
      } else {
        const updatedCart = await cartApi.updateQuantity(cartId, productId, { quantity })
        setCart(updatedCart)
        queryClient.setQueryData(storeQueryKeys.cart(cartId), updatedCart)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const removeItem = async (productId: number) => {
    if (!cartId) return
    setIsLoading(true)
    try {
      const updatedCart = await cartApi.removeItem(cartId, productId)
      setCart(updatedCart)
      queryClient.setQueryData(storeQueryKeys.cart(cartId), updatedCart)
    } finally {
      setIsLoading(false)
    }
  }

  const resetCart = (): void => {
    // A fresh cart is created lazily on the next add, never during order confirmation.
    setCart(null)
    setCartId(null)
    setIsCartOpen(false)
    if (cartId) queryClient.removeQueries({ queryKey: storeQueryKeys.cart(cartId) })
    localStorage.removeItem(CART_ID_STORAGE_KEY)
  }

  const itemCount = cart?.items?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0

  return (
    <CartContext.Provider
      value={{
        cart,
        cartId,
        itemCount,
        isCartOpen,
        isLoading,
        addToCart,
        updateQuantity,
        removeItem,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        refreshCart,
        resetCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
export default CartProvider
