import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { StoreStudioLogo } from '../branding/platformBrand'
export default function LoginPage() {
  const { login, isAuthenticated, user, isLoading } = useAuth()
  const navigate = useNavigate(); const location = useLocation()
  const [email,setEmail] = useState(''); const [password,setPassword] = useState('')
  const [submitting,setSubmitting] = useState(false); const [error,setError] = useState('')
  useEffect(() => {
    if (!isAuthenticated || !user) return
    const state = location.state as { from?: { pathname?: string } } | null
    navigate(state?.from?.pathname || (user.role === 'ADMIN' ? '/admin' : ['OWNER','SELLER'].includes(user.role ?? '') ? '/seller' : '/'), { replace:true })
  },[isAuthenticated,user,location.state,navigate])
  const submit = async (event: FormEvent) => {
    event.preventDefault(); if(submitting) return
    setSubmitting(true);setError('')
    try { await login({email,password}) } catch(error) {setError(error instanceof Error ? error.message : 'Sign in failed. Please try again.')}
    finally {setSubmitting(false)}
  }
  return <div className="max-w-md mx-auto px-6 py-16">
    <StoreStudioLogo size={30} showWordmark />
    <h1 className="!text-3xl !mt-8">Store management sign in</h1>
    <p className="text-sm mb-8">Shopping does not require an account.</p>
    {error && <p role="alert" className="mb-4 text-red-600">{error}</p>}
    <form onSubmit={submit} className="space-y-5">
      <label className="block text-sm">Email address<input className="block w-full border rounded p-3 mt-2" type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
      <label className="block text-sm">Password<input className="block w-full border rounded p-3 mt-2" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
      <button className="store-cta w-full" disabled={submitting || isLoading}>{submitting ? 'Signing in…' : 'Sign in'}</button>
    </form>
    <Link to="/" className="inline-block mt-8 text-sm underline">Return to store</Link>
  </div>
}
