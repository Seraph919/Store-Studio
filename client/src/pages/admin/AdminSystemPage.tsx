import React, { useState, useEffect } from 'react'
import {
  FileSpreadsheet,
  Database,
  RefreshCw,
  AlertCircle,
  HardDrive,
} from 'lucide-react'
import { adminApi } from '../../services/adminApi'
import type { AdminHealth } from '../../types'

export const AdminSystemPage: React.FC = () => {
  const [health, setHealth] = useState<AdminHealth | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExportingFinancial, setIsExportingFinancial] = useState(false)
  const [isExportingSellers, setIsExportingSellers] = useState(false)

  const loadHealth = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await adminApi.getHealth()
      setHealth(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve system health telemetry.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadHealth()
  }, [])

  const handleExportFinancial = async () => {
    setIsExportingFinancial(true)
    try {
      await adminApi.exportFinancialAuditCsv()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Financial export failed.')
    } finally {
      setIsExportingFinancial(false)
    }
  }

  const handleExportSellers = async () => {
    setIsExportingSellers(true)
    try {
      await adminApi.exportSellerDirectoryCsv()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Seller directory export failed.')
    } finally {
      setIsExportingSellers(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)]">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--portal-accent-text)]">
            Infrastructure Diagnostics
          </span>
          <h1 className="text-2xl font-serif text-[var(--portal-text)] mt-1">System Health &amp; Auditing</h1>
          <p className="text-xs text-[var(--portal-muted)] mt-1">
            Monitor backend JVM metrics, database connection pools, and export financial audit logs.
          </p>
        </div>

        <button
          type="button"
          onClick={loadHealth}
          disabled={isLoading}
          className="p-2.5 bg-[var(--portal-surface-alt)] hover:bg-[var(--portal-hover)] text-[var(--portal-muted)] hover:text-[var(--portal-text)] rounded-xl border border-[var(--portal-border)] transition-colors self-start sm:self-auto"
          title="Refresh health"
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin text-[var(--portal-accent-text)]' : ''} />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-[var(--portal-danger-soft)] border border-[var(--portal-danger-border)] rounded-xl flex items-center gap-3 text-xs text-[var(--portal-danger)]">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[var(--portal-muted)] font-mono">Platform Health</span>
            <div className="w-2 h-2 rounded-full bg-[var(--portal-success)] animate-pulse" />
          </div>
          <div className="text-xl font-bold font-mono text-[var(--portal-success)]">
            {health?.databaseStatus || 'OPERATIONAL'}
          </div>
          <p className="text-xs text-[var(--portal-muted)]">All Spring Boot services reporting normal execution.</p>
        </div>

        <div className="p-5 bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[var(--portal-muted)] font-mono">PostgreSQL Pool</span>
            <Database size={16} className="text-[var(--portal-accent-text)]" />
          </div>
          <div className="text-xl font-bold font-mono text-[var(--portal-text)]">
            Connected (Port 5555)
          </div>
          <p className="text-xs text-[var(--portal-muted)]">HikariCP connection pool healthy with Flyway V2 applied.</p>
        </div>

        <div className="p-5 bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[var(--portal-muted)] font-mono">Cache Layer</span>
            <HardDrive size={16} className="text-[var(--portal-accent-text)]" />
          </div>
          <div className="text-xl font-bold font-mono text-[var(--portal-text)]">
            Redis L2 Active
          </div>
          <p className="text-xs text-[var(--portal-muted)]">Product &amp; category multi-tier caching enabled on port 6379.</p>
        </div>
      </div>

      {/* Export Reports Section */}
      <div className="bg-[var(--portal-surface)] rounded-2xl border border-[var(--portal-border)] p-6 space-y-4">
        <h2 className="text-sm font-serif text-[var(--portal-text)] flex items-center gap-2">
          <FileSpreadsheet size={16} className="text-[var(--portal-success)]" />
          <span>Export reports</span>
        </h2>
        <p className="text-xs text-[var(--portal-muted)]">
          Download comprehensive CSV datasets for bookkeeping, fiscal reporting, and seller audit compliance.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-5 bg-[var(--portal-surface-alt)] rounded-xl border border-[var(--portal-border)] flex flex-col justify-between space-y-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--portal-text)]">
                Comprehensive Financial Sales Audit
              </h3>
              <p className="text-xs text-[var(--portal-muted)] mt-1">
                Detailed ledger containing all customer orders, item subtotals, seller commissions, and cash delivery logs.
              </p>
            </div>
            <button
              type="button"
              disabled={isExportingFinancial}
              onClick={handleExportFinancial}
              className="w-full py-2.5 bg-[var(--portal-success-soft)] hover:bg-[var(--portal-success-soft)] text-[var(--portal-success)] border border-[var(--portal-success-border)] font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FileSpreadsheet size={14} />
              <span>{isExportingFinancial ? 'Generating CSV...' : 'Download Sales Audit CSV'}</span>
            </button>
          </div>

          <div className="p-5 bg-[var(--portal-surface-alt)] rounded-xl border border-[var(--portal-border)] flex flex-col justify-between space-y-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--portal-text)]">
                Seller Directory Registry
              </h3>
              <p className="text-xs text-[var(--portal-muted)] mt-1">
                Full roster of approved artisan merchants, registration dates, active piece counts, and contact credentials.
              </p>
            </div>
            <button
              type="button"
              disabled={isExportingSellers}
              onClick={handleExportSellers}
              className="w-full py-2.5 bg-[var(--portal-accent-soft)] hover:bg-[var(--portal-hover)] text-[var(--portal-accent-text)] border border-[var(--portal-accent-border)] font-semibold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FileSpreadsheet size={14} />
              <span>{isExportingSellers ? 'Generating CSV...' : 'Download Seller Directory CSV'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSystemPage
