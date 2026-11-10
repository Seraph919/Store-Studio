import React, { useState } from 'react'
import {
  User,
  ShieldCheck,
  Lock,
  Save,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { userApi } from '../../services/userApi'

export const SellerProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth()

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [profileMsg, setProfileMsg] = useState<string | null>(null)
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setProfileMsg(null)
    setIsUpdatingProfile(true)

    try {
      await userApi.updateProfile({ name, email })
      await refreshUser()
      setProfileMsg('Atelier credentials updated successfully.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile.')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setPasswordMsg(null)
    setIsChangingPassword(true)

    try {
      await userApi.changePassword({ currentPassword, newPassword })
      setPasswordMsg('Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change password.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[var(--portal-accent-soft)] border border-[var(--portal-accent-border)] flex items-center justify-center text-[var(--portal-accent-text)]">
            <ShieldCheck size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--portal-accent-text)]">
              Artisan Profile
            </span>
            <h1 className="text-2xl font-serif text-[var(--portal-text)]">{user?.name || 'Seller'}</h1>
            <p className="text-xs text-[var(--portal-muted)]">
              Verified Atelier Merchant • Role: {user?.role || 'SELLER'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[var(--portal-danger-soft)] border border-[var(--portal-danger-border)] rounded-xl flex items-center gap-3 text-xs text-[var(--portal-danger)]">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {profileMsg && (
        <div className="p-4 bg-[var(--portal-success-soft)] border border-[var(--portal-success-border)] rounded-xl flex items-center gap-3 text-xs text-[var(--portal-success)]">
          <CheckCircle size={16} className="flex-shrink-0" />
          <span>{profileMsg}</span>
        </div>
      )}

      {/* Account Details Form */}
      <div className="bg-[var(--portal-surface)] p-6 rounded-2xl border border-[var(--portal-border)] space-y-4">
        <h2 className="text-sm font-serif text-[var(--portal-text)] flex items-center gap-2">
          <User size={16} className="text-[var(--portal-accent-text)]" />
          <span>Atelier Account Details</span>
        </h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--portal-muted)] mb-1.5 font-medium">
              Merchant Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-sm text-[var(--portal-text)] focus:border-[var(--portal-accent)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--portal-muted)] mb-1.5 font-medium">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-sm text-[var(--portal-text)] focus:border-[var(--portal-accent)] focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="px-6 py-2 bg-[var(--portal-accent)] hover:bg-[var(--portal-accent)] text-[var(--portal-on-accent)] font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              <Save size={14} />
              <span>{isUpdatingProfile ? 'Saving...' : 'Update Details'}</span>
            </button>
          </div>
        </form>
      </div>

      {passwordMsg && (
        <div className="p-4 bg-[var(--portal-success-soft)] border border-[var(--portal-success-border)] rounded-xl flex items-center gap-3 text-xs text-[var(--portal-success)]">
          <CheckCircle size={16} className="flex-shrink-0" />
          <span>{passwordMsg}</span>
        </div>
      )}

      {/* Security & Password */}
      <div className="bg-[var(--portal-surface)] p-6 rounded-2xl border border-[var(--portal-border)] space-y-4">
        <h2 className="text-sm font-serif text-[var(--portal-text)] flex items-center gap-2">
          <Lock size={16} className="text-[var(--portal-accent-text)]" />
          <span>Security & Password</span>
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--portal-muted)] mb-1.5 font-medium">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-sm text-[var(--portal-text)] focus:border-[var(--portal-accent)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--portal-muted)] mb-1.5 font-medium">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-sm text-[var(--portal-text)] focus:border-[var(--portal-accent)] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-6 py-2 bg-[var(--portal-surface-alt)] hover:bg-[var(--portal-hover)] text-[var(--portal-text)] border border-[var(--portal-border)] font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              <Lock size={14} />
              <span>{isChangingPassword ? 'Updating...' : 'Change Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SellerProfilePage
