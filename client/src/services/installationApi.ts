import { apiFetch } from './apiClient'

export type InstallationPhase = 'OWNER' | 'CUSTOMIZE' | 'READY'
export const installationApi = {
  status: () => apiFetch<{ phase: InstallationPhase }>('/api/v1/setup/status'),
  createOwner: (data: { setupToken: string; name: string; email: string; password: string }) =>
    apiFetch<void>('/api/v1/setup/owner', { method: 'POST', body: JSON.stringify(data) }),
  complete: () => apiFetch<void>('/api/v1/setup/complete', { method: 'POST' }),
}
