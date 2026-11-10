import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { CartProvider } from './CartContext'
import { useCart } from './useCart'
import { cartApi } from '../services/cartApi'
import type { Cart } from '../types'

vi.mock('../services/cartApi', () => ({
  cartApi: {
    createCart: vi.fn(),
    getCart: vi.fn(),
    addItem: vi.fn(),
    updateQuantity: vi.fn(),
    removeItem: vi.fn(),
  },
}))

const mockCart: Cart = {
  id: '1',
  cartId: 'test-cart-123',
  items: [
    {
      id: 1,
      productId: 10,
      productName: 'Watch',
      price: 500,
      quantity: 2,
      subtotal: 1000,
    },
  ],
  totalPrice: 1000,
}

function TestConsumer() {
  const { cart, itemCount, isCartOpen, addToCart, removeItem, resetCart, openCart, closeCart } = useCart()

  return (
    <div>
      <span data-testid="item-count">{itemCount}</span>
      <span data-testid="cart-open">{isCartOpen ? 'open' : 'closed'}</span>
      <span data-testid="cart-id">{cart?.cartId ?? 'no-cart'}</span>
      <button onClick={() => addToCart(10, 1)}>Add Item</button>
      <button onClick={() => removeItem(10)}>Remove Item</button>
      <button onClick={resetCart}>Reset</button>
      <button onClick={openCart}>Open</button>
      <button onClick={closeCart}>Close</button>
    </div>
  )
}

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('initializes with empty cart when no cart id in storage', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    )

    expect(screen.getByTestId('item-count')).toHaveTextContent('0')
    expect(screen.getByTestId('cart-open')).toHaveTextContent('closed')
    expect(screen.getByTestId('cart-id')).toHaveTextContent('no-cart')
  })

  it('loads existing cart when storage key is present', async () => {
    localStorage.setItem('luxury_store_cart_id', 'test-cart-123')
    vi.mocked(cartApi.getCart).mockResolvedValue(mockCart)

    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    )

    expect(await screen.findByText('test-cart-123')).toBeInTheDocument()
    expect(screen.getByTestId('item-count')).toHaveTextContent('2')
  })

  it('creates cart and adds item when addToCart is called', async () => {
    vi.mocked(cartApi.createCart).mockResolvedValue({ cartId: 'fresh-cart-456' })
    vi.mocked(cartApi.addItem).mockResolvedValue({
      ...mockCart,
      cartId: 'fresh-cart-456',
      items: [{ id: 1, productId: 10, productName: 'Watch', price: 500, quantity: 1, subtotal: 500 }],
    })

    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    )

    await act(async () => {
      screen.getByRole('button', { name: 'Add Item' }).click()
    })

    expect(cartApi.createCart).toHaveBeenCalled()
    expect(cartApi.addItem).toHaveBeenCalledWith('fresh-cart-456', { productId: 10, quantity: 1 })
    expect(screen.getByTestId('cart-open')).toHaveTextContent('open')
    expect(screen.getByTestId('item-count')).toHaveTextContent('1')
  })

  it('resets cart state and localStorage on resetCart', async () => {
    localStorage.setItem('luxury_store_cart_id', 'test-cart-123')
    vi.mocked(cartApi.getCart).mockResolvedValue(mockCart)

    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    )

    expect(await screen.findByText('test-cart-123')).toBeInTheDocument()

    act(() => {
      screen.getByRole('button', { name: 'Reset' }).click()
    })

    expect(screen.getByTestId('cart-id')).toHaveTextContent('no-cart')
    expect(screen.getByTestId('item-count')).toHaveTextContent('0')
    expect(localStorage.getItem('luxury_store_cart_id')).toBeNull()
  })

  it('controls drawer state via openCart and closeCart', () => {
    render(
      <CartProvider>
        <TestConsumer />
      </CartProvider>
    )

    expect(screen.getByTestId('cart-open')).toHaveTextContent('closed')

    act(() => {
      screen.getByRole('button', { name: 'Open' }).click()
    })
    expect(screen.getByTestId('cart-open')).toHaveTextContent('open')

    act(() => {
      screen.getByRole('button', { name: 'Close' }).click()
    })
    expect(screen.getByTestId('cart-open')).toHaveTextContent('closed')
  })
})
