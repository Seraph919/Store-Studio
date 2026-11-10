import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { installationApi } from '../services/installationApi'

/** Installation status comes from the backend; no browser-only onboarding flag. */
export function InstallationGate() {
  const location = useLocation()
  const status = useQuery({ queryKey: ['installation', 'status'], queryFn: installationApi.status, retry: 1, staleTime: 0 })
  if (status.isLoading) return <main className="min-h-screen grid place-items-center bg-white text-slate-600">Checking installation…</main>
  if (status.isError || !status.data) return <main className="min-h-screen grid place-items-center bg-white p-8 text-slate-900"><div className="max-w-md text-center"><h1 className="text-2xl font-bold mb-3">Could not reach the store backend</h1><p className="text-slate-600 mb-5">Check your backend and database configuration before continuing.</p><button className="rounded-lg bg-amber-400 px-5 py-2" onClick={() => status.refetch()}>Retry</button></div></main>
  const phase = status.data.phase
  if (phase === 'READY' && location.pathname === '/setup') return <Navigate to="/seller" replace />
  if (phase !== 'READY' && location.pathname !== '/setup' && location.pathname !== '/login') return <Navigate to="/setup" replace />
  return <Outlet />
}
