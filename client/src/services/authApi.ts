import type { JwtResponse, LoginRequest, RegisterRequest, User } from '../types'
import { apiFetch } from './apiClient'

export const authApi = {
  login: async (credentials: LoginRequest): Promise<JwtResponse> => {
    return apiFetch<JwtResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  register: async (data: RegisterRequest): Promise<User> => {
    return apiFetch<User>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}
