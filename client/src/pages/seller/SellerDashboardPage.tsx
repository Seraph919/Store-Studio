import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle, ArrowRight, CircleDollarSign, ClipboardList, Package, Palette,
  Plus, RefreshCw, ShoppingBag, Truck, Wallet,
} from 'lucide-react'
import { useAuth } from '../../context/useAuth'
import { sellerApi } from '../../services/sellerApi'
import { formatPrice } from '../../utils/formatPrice'
import type { SellerKpis, SellerOrder } from '../../types'
import {
  ActionTile, DashboardHeading, DashboardLink, MetricCard, OrderTrend,
  Panel, StatusBadge, StatusBreakdown,
} from '../../components/dashboard/DashboardWidgets'
import '../../styles/dashboard.css'

function dailyOrderSeries(orders: SellerOrder[], days: number, metric: 'count' | 'value') {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const buckets = Array.from({ length: days }, (_, i) => {
    const date = new Date(start)
    date.setUTCDate(date.getUTCDate() - (days - i - 1))
    return { key: date.toISOString().slice(0, 10), label: date.toLocaleDateString('en', { month: 'short', day: 'numeric', timeZone: 'UTC' }), value: 0 }
  })
  const byDay = new Map(buckets.map((bucket, i) => [bucket.key, i]))
  for (const order of orders) {
    const created = new Date(order.createdAt)
    if (Number.isNaN(created.getTime())) continue
    const index = byDay.get(created.toISOString().slice(0, 10))
    if (index === undefined || (metric === 'value' && order.status?.toUpperCase() === 'CANCELLED')) continue
    buckets[index].value += metric === 'count' ? 1 : Number(order.subtotal) || 0
  }
  return buckets
}

export const SellerDashboardPage = () => {
  const { user } = useAuth()
  const [kpis, setKpis] = useState<SellerKpis | null>(null)
  const [orders, setOrders] = useState<SellerOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [trendMetric, setTrendMetric] = useState<'count' | 'value'>('value')
  const [trendDays, setTrendDays] = useState<7 | 14>(14)

  const loadData = async () => {
    setIsLoading(true)
    setError('')
    const [kpisResult, ordersResult] = await Promise.allSettled([sellerApi.getKpis(), sellerApi.getOrders()])
    if (kpisResult.status === 'fulfilled') setKpis(kpisResult.value)
    if (ordersResult.status === 'fulfilled') setOrders(ordersResult.value)
    if (kpisResult.status === 'rejected' || ordersResult.status === 'rejected') setError('Some dashboard data could not be loaded. You can retry using Refresh.')
    setIsLoading(false)
  }

  useEffect(() => { void loadData() }, [])

  const totalOrders = Object.values(kpis?.ordersByStatus || {}).reduce((sum, value) => sum + value, 0)
  const pending = kpis?.pendingCallConfirmationsCount ?? 0
  const lowStock = kpis?.lowStockProducts ?? []
  const series = useMemo(() => dailyOrderSeries(orders, trendDays, trendMetric), [orders, trendDays, trendMetric])
  const recentOrders = useMemo(() => [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6), [orders])

  return <div className="dash-page">
    <DashboardHeading eyebrow="Store overview" title={`Good to see you, ${user?.name?.split(' ')[0] || 'there'}.`}
      description="Here's what's happening with your store today."
      actions={<><button type="button" className="dash-button dash-button--subtle" disabled={isLoading} onClick={() => void loadData()}><RefreshCw size={16} className={isLoading ? 'animate-spin' : ''}/>Refresh</button>
        <Link to="/seller/products/new" className="dash-button dash-button--primary"><Plus size={17}/>Add product</Link></>}/>

    {error && <div className="dash-alert" role="alert"><AlertTriangle size={17}/>{error}</div>}

    <div className="dash-metrics-grid">
      <MetricCard label="Today's order value" value={formatPrice(kpis?.todayRevenue ?? 0)} icon={CircleDollarSign} description="Non-cancelled orders today" tone="amber"/>
      <MetricCard label="This month's order value" value={formatPrice(kpis?.monthRevenue ?? 0)} icon={Wallet} description="Non-cancelled orders this month" tone="blue"/>
      <MetricCard label="Total orders" value={totalOrders.toLocaleString()} icon={ShoppingBag} description="All recorded orders" tone="green"/>
      <MetricCard label="Needs attention" value={(pending + lowStock.length).toLocaleString()} icon={AlertTriangle} description={`${pending} pending · ${lowStock.length} low stock`} tone="violet"/>
    </div>

    <div className="dash-content-grid">
      <Panel title="Order activity" subtitle="Your actual orders over the selected period" className="dash-span-7"
        action={<div className="dash-segmented"><button type="button" className={trendDays === 7 ? 'active' : ''} onClick={() => setTrendDays(7)}>7 days</button><button type="button" className={trendDays === 14 ? 'active' : ''} onClick={() => setTrendDays(14)}>14 days</button></div>}>
        <OrderTrend dates={series.map(item => item.label)} values={series.map(item => item.value)} metric={trendMetric} onMetricChange={setTrendMetric}/>
      </Panel>
      <Panel title="Order status" subtitle="Fulfillment breakdown" className="dash-span-5" action={<DashboardLink to="/seller/orders">Manage</DashboardLink>}>
        <StatusBreakdown counts={kpis?.ordersByStatus}/>
      </Panel>
    </div>

    <div className="dash-content-grid">
      <Panel title="Recent orders" subtitle="Latest customer checkouts" className="dash-span-8" action={<DashboardLink to="/seller/orders">View all</DashboardLink>}>
        {recentOrders.length === 0 ? <div className="dash-empty">No orders yet. New customer orders will show up here.</div> :
          <div className="dash-table-scroll"><table className="dash-table"><thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>
          {recentOrders.map(order => <tr key={order.id}><td><strong>{order.publicOrderReference || `#${order.id}`}</strong><small>{new Date(order.createdAt).toLocaleDateString()}</small></td><td><strong>{order.customerName}</strong><small>{order.city || '—'}</small></td><td className="dash-table-money">{formatPrice(order.subtotal)}</td><td><StatusBadge status={order.status}/></td><td><Link className="dash-row-action" to="/seller/orders" aria-label={`Manage order ${order.publicOrderReference || order.id}`}><ArrowRight size={17}/></Link></td></tr>)}
          </tbody></table></div>}
      </Panel>
      <div className="dash-side-stack dash-span-4">
        <Panel title="Quick actions" subtitle="Everything in reach" compact>
          <div className="dash-action-list">
            <ActionTile to="/seller/products" icon={Package} label="Manage products" description="Catalog & inventory"/>
            <ActionTile to="/seller/orders" icon={ClipboardList} label="Process orders" description="Confirm and dispatch"/>
            <ActionTile to="/seller/shipping" icon={Truck} label="Shipping settings" description="Delivery rules"/>
            <ActionTile to="/dashboard/design" icon={Palette} label="Design storefront" description="Themes & appearance"/>
          </div>
        </Panel>
        <Panel title="Inventory watch" subtitle="Products with 3 or fewer units" compact action={<DashboardLink to="/seller/products">Catalog</DashboardLink>}>
          {lowStock.length === 0 ? <div className="dash-inventory-clear"><span>✓</span>No low-stock items right now</div> :
            <div className="dash-low-stock-list">{lowStock.slice(0, 3).map(product => <div className="dash-low-stock" key={product.id}><div className="dash-low-stock-thumb"><Package size={16}/></div><div><strong>{product.name}</strong><small>{product.quantity ?? 0} left in stock</small></div><span className="dash-low-stock-warning">Low</span></div>)}</div>}
        </Panel>
      </div>
    </div>
  </div>
}

export default SellerDashboardPage
