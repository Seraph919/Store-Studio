import React, { useEffect, useState, useCallback } from 'react'
import type { LoginRequest, RegisterRequest, User } from '../types'
import { authApi } from '../services/authApi'
import { userApi } from '../services/userApi'
import { getAuthToken, removeAuthToken, setAuthToken } from '../services/apiClient'
import { AuthContext } from './useAuth'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(getAuthToken())
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const refreshUser = useCallback(async () => {
    const currentToken = getAuthToken()
    if (!currentToken) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      const profile = await userApi.getMe()
      setUser(profile)
    } catch {
      // If token expired or invalid, clear it
      removeAuthToken()
      setTokenState(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true)
    try {
      const response = await authApi.login(credentials)
      if (response.token) {
        setAuthToken(response.token)
        setTokenState(response.token)
        const profile = await userApi.getMe()
        setUser(profile)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterRequest) => {
    setIsLoading(true)
    try {
      await authApi.register(data)
      // Auto login after register
      await login({ email: data.email, password: data.password })
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    removeAuthToken()
    setTokenState(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
export default AuthProvider
