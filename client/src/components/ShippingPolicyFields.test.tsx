import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ShippingPolicyFields } from './ShippingPolicyFields'
import type { StoreSettings } from '../services/settingsApi'

const baseSettings: StoreSettings = {
  storeName: 'Test Store',
  shippingMode: 'FREE',
  shippingFee: 0,
  freeShippingThreshold: null,
}

describe('ShippingPolicyFields', () => {
  it('renders all three shipping modes', () => {
    const onChange = vi.fn()
    render(<ShippingPolicyFields value={baseSettings} onChange={onChange} />)

    expect(screen.getByRole('button', { name: /Always free/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Fixed delivery fee/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Free above a threshold/i })).toBeInTheDocument()
  })

  it('indicates active shipping mode with aria-pressed', () => {
    const onChange = vi.fn()
    render(<ShippingPolicyFields value={baseSettings} onChange={onChange} />)

    const freeButton = screen.getByRole('button', { name: /Always free/i })
    const flatButton = screen.getByRole('button', { name: /Fixed delivery fee/i })

    expect(freeButton).toHaveAttribute('aria-pressed', 'true')
    expect(flatButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('triggers onChange when selecting a different shipping mode', () => {
    const onChange = vi.fn()
    render(<ShippingPolicyFields value={baseSettings} onChange={onChange} />)

    const flatButton = screen.getByRole('button', { name: /Fixed delivery fee/i })
    fireEvent.click(flatButton)

    expect(onChange).toHaveBeenCalledWith({ shippingMode: 'FLAT' })
  })

  it('shows shipping fee input when mode is FLAT', () => {
    const onChange = vi.fn()
    const settings: StoreSettings = {
      ...baseSettings,
      shippingMode: 'FLAT',
      shippingFee: 25,
    }
    render(<ShippingPolicyFields value={settings} onChange={onChange} />)

    const feeInput = screen.getByLabelText(/Standard shipping fee/i)
    expect(feeInput).toBeInTheDocument()
    expect(feeInput).toHaveValue(25)

    fireEvent.change(feeInput, { target: { value: '30' } })
    expect(onChange).toHaveBeenCalledWith({ shippingFee: 30 })
  })

  it('shows threshold input only when mode is FREE_ABOVE', () => {
    const onChange = vi.fn()
    const settings: StoreSettings = {
      ...baseSettings,
      shippingMode: 'FREE_ABOVE',
      shippingFee: 20,
      freeShippingThreshold: 200,
    }
    render(<ShippingPolicyFields value={settings} onChange={onChange} />)

    expect(screen.getByLabelText(/Standard shipping fee/i)).toBeInTheDocument()
    const thresholdInput = screen.getByLabelText(/Free shipping when products reach/i)
    expect(thresholdInput).toBeInTheDocument()
    expect(thresholdInput).toHaveValue(200)

    fireEvent.change(thresholdInput, { target: { value: '250' } })
    expect(onChange).toHaveBeenCalledWith({ freeShippingThreshold: 250 })
  })
})
