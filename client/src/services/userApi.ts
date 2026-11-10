import type { User } from '../types'
import { apiFetch } from './apiClient'

export const userApi = {
  getMe: async (): Promise<User> => {
    return apiFetch<User>('/api/v1/users/me')
  },

  getUsers: async (): Promise<User[]> => {
    return apiFetch<User[]>('/api/v1/users')
  },

  makeSeller: async (userId: number): Promise<User> => {
    return apiFetch<User>(`/api/v1/users/${userId}/make-seller`, {
      method: 'POST',
    })
  },

  updateRole: async (userId: number, role: string): Promise<User> => {
    return apiFetch<User>(`/api/v1/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    })
  },

  updateProfile: async (data: { name: string; email: string }): Promise<{ user: User; token?: string; message?: string }> => {
    return apiFetch<{ user: User; token?: string; message?: string }>('/api/v1/users/me/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>('/api/v1/users/me/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}
