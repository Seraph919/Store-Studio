const TOKEN_STORAGE_KEY = 'store_luxury_jwt_token'
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>
}

export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = getAuthToken()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const targetUrl = API_BASE_URL ? `${API_BASE_URL}${normalizedEndpoint}` : normalizedEndpoint

  const response = await fetch(targetUrl, {
    credentials: options.credentials || (API_BASE_URL ? 'include' : 'same-origin'),
    ...options,
    headers,
  })

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`
    try {
      const errorData = await response.json()
      if (errorData && typeof errorData === 'object') {
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData)
      }
    } catch {
      const text = await response.text().catch(() => '')
      if (text) errorMessage = text
    }
    throw new Error(errorMessage)
  }

  // Handle 204 or empty responses
  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

export async function apiDownload(endpoint: string, fallbackFilename: string): Promise<void> {
  const token = getAuthToken()
  const headers: Record<string, string> = {}

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const targetUrl = API_BASE_URL ? `${API_BASE_URL}${normalizedEndpoint}` : normalizedEndpoint

  const response = await fetch(targetUrl, {
    credentials: API_BASE_URL ? 'include' : 'same-origin',
    headers,
  })

  if (!response.ok) {
    let errorMsg = `Export failed with status ${response.status}`
    try {
      const text = await response.text()
      if (text) errorMsg = text
    } catch {
      // Ignored
    }
    throw new Error(errorMsg)
  }

  const blob = await response.blob()
  let filename = fallbackFilename
  const disposition = response.headers.get('content-disposition')
  if (disposition && disposition.includes('filename=')) {
    const parts = disposition.split('filename=')
    if (parts[1]) {
      filename = parts[1].replace(/["']/g, '').trim()
    }
  }

  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}
