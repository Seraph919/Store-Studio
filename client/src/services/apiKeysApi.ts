import { apiFetch } from './apiClient'

export type ApiKeyScope = 'products:read' | 'orders:read' | 'analytics:read' | 'settings:read'

export interface ApiKeyInfo {
  id: number
  name: string
  prefix: string
  scopes: ApiKeyScope[]
  createdAt: string
  expiresAt: string | null
  revokedAt: string | null
}

export interface CreatedApiKey {
  apiKey: ApiKeyInfo
  token: string
}

export const apiKeysApi = {
  list: () => apiFetch<ApiKeyInfo[]>('/api/v1/owner/api-keys'),
  create: (name: string, scopes: ApiKeyScope[], expiresAt: string | null) =>
    apiFetch<CreatedApiKey>('/api/v1/owner/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name, scopes, expiresAt }),
    }),
  revoke: (id: number) =>
    apiFetch<void>(`/api/v1/owner/api-keys/${id}`, { method: 'DELETE' }),
}
