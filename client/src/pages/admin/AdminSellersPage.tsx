import React, { useState, useEffect, useMemo } from 'react'
import {
  Users,
  Search,
  FileSpreadsheet,
  RefreshCw,
  AlertCircle,
  UserX,
  UserCheck,
} from 'lucide-react'
import { adminApi } from '../../services/adminApi'
import type { User } from '../../types'

export const AdminSellersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [isExporting, setIsExporting] = useState(false)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const loadUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await adminApi.getUsers()
      setUsers(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve platform users.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleRoleChange = async (userId: number, newRole: string) => {
    setUpdatingId(userId)
    try {
      const updated = await adminApi.updateUserRole(userId, newRole)
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: updated.role } : u)))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update user role.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleToggleStatus = async (userId: number, currentStatus?: string) => {
    setUpdatingId(userId)
    const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'
    try {
      const updated = await adminApi.updateUserStatus(userId, newStatus)
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: updated.status } : u)))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update user status.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleExportSellers = async () => {
    setIsExporting(true)
    try {
      await adminApi.exportSellerDirectoryCsv()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to export seller directory.')
    } finally {
      setIsExporting(false)
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesRole =
        roleFilter === 'ALL' || u.role?.toUpperCase() === roleFilter.toUpperCase()
      const q = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        String(u.id).includes(q)
      return matchesRole && matchesQuery
    })
  }, [users, roleFilter, searchQuery])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)]">
        <div>
          <h1 className="text-2xl font-serif text-[var(--portal-text)] mt-1">Accounts & access</h1>
          <p className="text-sm leading-relaxed text-[var(--portal-muted)] mt-2">
            Manage owner and administrator access and existing customer records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadUsers}
            disabled={isLoading}
            className="p-2.5 bg-[var(--portal-surface-alt)] hover:bg-[var(--portal-hover)] text-[var(--portal-muted)] hover:text-[var(--portal-text)] rounded-xl border border-[var(--portal-border)] transition-colors"
            title="Refresh users"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin text-[var(--portal-accent-text)]' : ''} />
          </button>
          <button
            type="button"
            onClick={handleExportSellers}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--portal-surface-alt)] hover:bg-[var(--portal-hover)] text-[var(--portal-text)] font-semibold text-xs tracking-wider uppercase rounded-xl border border-[var(--portal-border)] transition-colors"
          >
            <FileSpreadsheet size={15} className="text-[var(--portal-success)]" />
            <span>{isExporting ? 'Exporting...' : 'Export Directory'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[var(--portal-danger-soft)] border border-[var(--portal-danger-border)] rounded-xl flex items-center gap-3 text-xs text-[var(--portal-danger)]">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {(['ALL', 'OWNER', 'CUSTOMER', 'ADMIN'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-wider uppercase transition-colors whitespace-nowrap ${
                roleFilter === r
                  ? 'bg-[var(--portal-danger-strong)] text-white font-semibold'
                  : 'bg-[var(--portal-surface)] text-[var(--portal-muted)] hover:text-[var(--portal-text)] border border-[var(--portal-border)]'
              }`}
            >
              {r === 'ALL' ? 'All Roles' : `${r}s`}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email..."
            className="w-full pl-9 pr-4 py-2 bg-[var(--portal-surface)] border border-[var(--portal-border)] rounded-xl text-xs text-[var(--portal-text)] placeholder-[var(--portal-placeholder)] focus:border-[var(--portal-accent)] focus:outline-none"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--portal-muted)]" />
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="p-16 text-center text-[var(--portal-accent-text)]">
          <div className="w-8 h-8 border-2 border-[var(--portal-accent-border)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs uppercase tracking-widest text-[var(--portal-muted)]">Retrieving directory...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)] text-[var(--portal-muted)]">
          <Users size={32} className="mx-auto mb-3 text-[var(--portal-placeholder)]" />
          <p className="text-sm">No accounts found matching your query.</p>
        </div>
      ) : (
        <div className="bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--portal-surface-alt)] text-[10px] uppercase font-mono tracking-wider text-[var(--portal-muted)] border-b border-[var(--portal-border)]">
                <tr>
                  <th className="py-3.5 px-4 font-medium">User Profile</th>
                  <th className="py-3.5 px-4 font-medium">Email</th>
                  <th className="py-3.5 px-4 font-medium">Assigned Role</th>
                  <th className="py-3.5 px-4 font-medium text-center">Status</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--portal-border)]">
                {filteredUsers.map((u) => {
                  const isBusy = updatingId === u.id
                  const isSuspended = u.status === 'SUSPENDED'
                  return (
                    <tr key={u.id} className="hover:bg-[var(--portal-hover)] transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="text-[var(--portal-text)] font-medium block">{u.name || 'Anonymous User'}</span>
                        <span className="text-[10px] text-[var(--portal-muted)] font-mono">User ID: #{u.id}</span>
                      </td>

                      <td className="py-3.5 px-4 text-[var(--portal-text)] font-mono">
                        {u.email}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          disabled={isBusy}
                          value={u.role || 'CUSTOMER'}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-2.5 py-1 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-lg text-xs text-[var(--portal-text)] focus:border-[var(--portal-accent)] focus:outline-none"
                        >
                          <option value="CUSTOMER">CUSTOMER</option>
                          <option value="OWNER">OWNER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                            isSuspended
                              ? 'bg-[var(--portal-danger-soft)] text-[var(--portal-danger)] border border-[var(--portal-danger-border)]'
                              : 'bg-[var(--portal-success-soft)] text-[var(--portal-success)] border border-[var(--portal-success-border)]'
                          }`}
                        >
                          {isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleToggleStatus(u.id, u.status)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                            isSuspended
                              ? 'bg-[var(--portal-success-soft)] hover:bg-[var(--portal-success-soft)] text-[var(--portal-success)] border border-[var(--portal-success-border)]'
                              : 'bg-[var(--portal-danger-soft)] hover:bg-[var(--portal-danger-soft)] text-[var(--portal-danger)] border border-[var(--portal-danger-border)]'
                          }`}
                        >
                          {isSuspended ? <UserCheck size={13} /> : <UserX size={13} />}
                          <span>{isSuspended ? 'Activate' : 'Suspend'}</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSellersPage
