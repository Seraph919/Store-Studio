import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, AlertTriangle, ArrowRight, Box, Database, HardDrive, Package, RefreshCw, Settings2, ShieldCheck, ShoppingBag, Users, Wallet } from 'lucide-react'
import { adminApi } from '../../services/adminApi'
import { formatPrice } from '../../utils/formatPrice'
import type { AdminAnalytics, AdminHealth } from '../../types'
import {
  ActionTile, DashboardHeading, DashboardLink, MetricCard, Panel, ProgressBar, StatusBreakdown,
} from '../../components/dashboard/DashboardWidgets'
import '../../styles/dashboard.css'

export const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null)
  const [health, setHealth] = useState<AdminHealth | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async () => {
    setIsLoading(true)
    setError('')
    const [analyticsResult, healthResult] = await Promise.allSettled([adminApi.getAnalytics(), adminApi.getHealth()])
    if (analyticsResult.status === 'fulfilled') setAnalytics(analyticsResult.value)
    if (healthResult.status === 'fulfilled') setHealth(healthResult.value)
    if (analyticsResult.status === 'rejected' || healthResult.status === 'rejected') setError('Some administration data could not be loaded. Please retry.')
    setIsLoading(false)
  }

  useEffect(() => { void loadData() }, [])

  const status = health?.databaseStatus?.toUpperCase()
  const databaseOnline = status === 'ONLINE' || status === 'HEALTHY'
  const memoryPercent = health?.jvmMemoryMaxMb ? Math.round(health.jvmMemoryUsedMb / health.jvmMemoryMaxMb * 100) : 0
  const totalOrders = analytics?.totalOrders ?? 0
  const totalStatus = Object.values(analytics?.ordersByStatus || {}).reduce((sum, value) => sum + value, 0)
  const fulfilled = (analytics?.ordersByStatus?.DELIVERED ?? 0) + (analytics?.ordersByStatus?.SHIPPED ?? 0)
  const pending = analytics?.ordersByStatus?.PENDING ?? 0

  return <div className="dash-page">
    <DashboardHeading eyebrow="Administration" title="Platform overview"
      description="Your store operations, catalog health, and infrastructure at a glance."
      actions={<><Link className="dash-button dash-button--subtle" to="/seller"><ShoppingBag size={16}/>Seller portal</Link>
        <button type="button" disabled={isLoading} className="dash-button dash-button--primary" onClick={() => void loadData()}><RefreshCw size={16} className={isLoading ? 'animate-spin' : ''}/>Refresh data</button></>}/>
    {error && <div className="dash-alert" role="alert"><AlertTriangle size={17}/>{error}</div>}

    <div className="dash-metrics-grid">
      <MetricCard label="Total order value" value={formatPrice(analytics?.gmv ?? 0)} description="Gross value of orders placed" icon={Wallet} tone="amber"/>
      <MetricCard label="Total orders" value={totalOrders.toLocaleString()} description="Customer checkouts recorded" icon={ShoppingBag} tone="blue"/>
      <MetricCard label="Live listings" value={(analytics?.totalActiveListings ?? 0).toLocaleString()} description="Products visible in your store" icon={Box} tone="green"/>
      <MetricCard label="Seller / admin accounts" value={(analytics?.totalRegisteredSellers ?? 0).toLocaleString()} description="Management user accounts" icon={Users} tone="violet"/>
    </div>

    <div className="dash-content-grid">
      <Panel title="Order distribution" subtitle="Breakdown by current order status" className="dash-span-7"
        action={<DashboardLink to="/admin/system">Reports</DashboardLink>}>
        <StatusBreakdown counts={analytics?.ordersByStatus}/>
        <div className="dash-insight-strip"><div><strong>{totalStatus.toLocaleString()}</strong><span>Recorded orders</span></div><div><strong>{fulfilled.toLocaleString()}</strong><span>Shipped / delivered</span></div><div><strong>{pending.toLocaleString()}</strong><span>Awaiting confirmation</span></div></div>
      </Panel>
      <Panel title="Order pipeline" subtitle="Operational values derived from order statuses" className="dash-span-5">
        <div className="dash-pipeline">
          <ProgressBar label="Order placement" value={totalOrders} max={Math.max(totalOrders, 1)} tone="amber" caption={`${totalOrders} orders`}/>
          <ProgressBar label="Shipped or delivered" value={fulfilled} max={Math.max(totalOrders, 1)} tone="green" caption={`${fulfilled} orders`}/>
          <ProgressBar label="Awaiting confirmation" value={pending} max={Math.max(totalOrders, 1)} tone="blue" caption={`${pending} orders`}/>
        </div>
        <div className="dash-note"><Activity size={16}/>These figures describe order workflow, not confirmed payments.</div>
      </Panel>
    </div>

    <div className="dash-content-grid">
      <Panel title="Infrastructure health" subtitle="Backend diagnostics from the live application" className="dash-span-7" action={<DashboardLink to="/admin/system">System tools</DashboardLink>}>
        <div className="dash-health-grid">
          <div className="dash-health-tile"><div className="dash-health-icon"><Database size={20}/></div><span>Database</span><strong className={status ? (databaseOnline ? 'dash-positive' : 'dash-negative') : ''}>{status || 'Unavailable'}</strong><small>{health ? `${health.databaseLatencyMs} ms query latency` : 'Awaiting response'}</small></div>
          <div className="dash-health-tile"><div className="dash-health-icon"><HardDrive size={20}/></div><span>JVM memory</span><strong>{health ? `${memoryPercent}%` : '—'}</strong><small>{health ? `${health.jvmMemoryUsedMb} of ${health.jvmMemoryMaxMb} MB used` : 'Awaiting response'}</small></div>
          <div className="dash-health-tile"><div className="dash-health-icon"><Activity size={20}/></div><span>App uptime</span><strong>{health ? `${Math.floor(health.uptimeSeconds / 3600)}h ${Math.floor((health.uptimeSeconds % 3600) / 60)}m` : '—'}</strong><small>Since last backend restart</small></div>
        </div>
        {health && <div className="dash-usage"><div className="dash-progress-top"><span>JVM memory utilization</span><strong>{memoryPercent}%</strong></div><div className="dash-progress-track"><div className="dash-progress-fill dash-progress-fill--amber" style={{ width: `${Math.max(0, Math.min(100, memoryPercent))}%` }}/></div></div>}
      </Panel>
      <Panel title="Administration tools" subtitle="Shortcuts to your existing workflows" className="dash-span-5" compact>
        <div className="dash-action-list">
          <ActionTile to="/admin/sellers" icon={Users} label="Accounts & roles" description="Manage access"/>
          <ActionTile to="/admin/products" icon={Package} label="Catalog oversight" description="Review listings"/>
          <ActionTile to="/admin/categories" icon={Settings2} label="Categories" description="Organize the catalog"/>
          <ActionTile to="/admin/system" icon={ShieldCheck} label="System & exports" description="Diagnostics and reports"/>
        </div>
      </Panel>
    </div>
    <div className="dash-admin-note"><ArrowRight size={15}/>Want to manage products and orders? Your existing seller portal is still available from the sidebar.</div>
  </div>
}

export default AdminDashboardPage
