import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { InstallationGate } from './InstallationGate'
import { installationApi } from '../services/installationApi'

vi.mock('../services/installationApi', () => ({
  installationApi: {
    status: vi.fn(),
  },
}))

function renderWithProviders(initialEntry: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retryDelay: 0,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={<InstallationGate />}>
            <Route path="/" element={<div>Storefront Home</div>} />
            <Route path="/setup" element={<div>Setup Page</div>} />
            <Route path="/seller" element={<div>Seller Dashboard</div>} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('InstallationGate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading indicator while checking status', () => {
    vi.mocked(installationApi.status).mockImplementation(() => new Promise(() => {}))
    renderWithProviders('/')
    expect(screen.getByText('Checking installation…')).toBeInTheDocument()
  })

  it('renders error screen if backend cannot be reached', async () => {
    vi.mocked(installationApi.status).mockRejectedValue(new Error('Network error'))
    renderWithProviders('/')
    expect(await screen.findByText('Could not reach the store backend')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('redirects to /setup if store installation is not READY and user visits /', async () => {
    vi.mocked(installationApi.status).mockResolvedValue({ phase: 'OWNER' })
    renderWithProviders('/')
    expect(await screen.findByText('Setup Page')).toBeInTheDocument()
  })

  it('allows visiting /login even when installation phase is not READY', async () => {
    vi.mocked(installationApi.status).mockResolvedValue({ phase: 'CUSTOMIZE' })
    renderWithProviders('/login')
    expect(await screen.findByText('Login Page')).toBeInTheDocument()
  })

  it('redirects from /setup to /seller if store is already READY', async () => {
    vi.mocked(installationApi.status).mockResolvedValue({ phase: 'READY' })
    renderWithProviders('/setup')
    expect(await screen.findByText('Seller Dashboard')).toBeInTheDocument()
  })

  it('renders children when installation is READY and visiting normal routes', async () => {
    vi.mocked(installationApi.status).mockResolvedValue({ phase: 'READY' })
    renderWithProviders('/')
    expect(await screen.findByText('Storefront Home')).toBeInTheDocument()
  })
})
