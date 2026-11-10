import React from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

interface ProtectedRouteProps {
  allowedRoles?: ('CUSTOMER' | 'OWNER' | 'SELLER' | 'ADMIN')[]
  children?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d0d0d] text-[#ca8a04]">
        <div className="w-8 h-8 border-2 border-[#ca8a04] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs uppercase tracking-[0.2em] text-[#a3a3a3]">Verifying credentials...</span>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && (!user.role || !allowedRoles.some(role => role === user.role))) {
    return <Navigate to="/" replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export default ProtectedRoute
