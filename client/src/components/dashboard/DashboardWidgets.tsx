import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export type StatusCount = Record<string, number>

const STATUS_COLORS: Record<string, string> = {
  DELIVERED: '#259a75', SHIPPED: '#5683d9', PROCESSING: '#9473d6',
  CONFIRMED: '#20a7b2', PENDING: '#ffba27', NO_ANSWER: '#f29954',
  CANCELLED: '#e77480',
}
const FALLBACK_COLORS = ['#ffba27', '#5683d9', '#9473d6', '#259a75']

const friendlyStatus = (status: string): string => status
  .replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase())

export function DashboardHeading({ eyebrow, title, description, actions }: {
  eyebrow: string; title: string; description: string; actions?: ReactNode
}) {
  return <div className="dash-heading">
    <div className="dash-heading-copy">
      <div className="dash-eyebrow"><span className="dash-eyebrow-dot" />{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
    {actions && <div className="dash-heading-actions">{actions}</div>}
  </div>
}

export function MetricCard({ label, value, description, icon: Icon, tone = 'amber', detail }: {
  label: string; value: string | number; description: string; icon: LucideIcon;
  tone?: 'amber' | 'blue' | 'green' | 'violet'; detail?: ReactNode
}) {
  return <article className={`dash-metric dash-metric--${tone}`}>
    <div className="dash-metric-top"><span>{label}</span><span className="dash-metric-icon"><Icon size={19} strokeWidth={1.9}/></span></div>
    <div className="dash-metric-value">{value}</div>
    <div className="dash-metric-bottom"><span>{description}</span>{detail}</div>
    <span className="dash-metric-decoration" aria-hidden="true" />
  </article>
}

export function Panel({ title, subtitle, action, children, className = '', compact = false }: {
  title: string; subtitle?: string; action?: ReactNode; children: ReactNode;
  className?: string; compact?: boolean
}) {
  return <section className={`dash-panel ${compact ? 'dash-panel--compact' : ''} ${className}`}>
    <div className="dash-panel-head"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action && <div className="dash-panel-action">{action}</div>}</div>
    {children}
  </section>
}

export function DashboardLink({ to, children }: { to: string; children: ReactNode }) {
  return <Link className="dash-text-link" to={to}>{children}<ArrowUpRight size={15}/></Link>
}

export function StatusBadge({ status }: { status: string }) {
  const statusUpper = status.toUpperCase()
  return <span className="dash-status-badge"><span style={{ backgroundColor: STATUS_COLORS[statusUpper] || '#8e95a6' }}/>{friendlyStatus(status)}</span>
}

export function StatusBreakdown({ counts, small = false }: { counts?: StatusCount | null; small?: boolean }) {
  const segments = Object.entries(counts || {}).filter(([, value]) => Number(value) > 0)
    .sort((a, b) => b[1] - a[1])
  const total = segments.reduce((sum, [, value]) => sum + value, 0)
  let position = 0
  const slices: string[] = []
  for (const [i, [name, count]] of segments.entries()) {
    const begin = position
    position += count / total * 100
    slices.push(`${STATUS_COLORS[name.toUpperCase()] || FALLBACK_COLORS[i % FALLBACK_COLORS.length]} ${begin}% ${position}%`)
  }

  return <div className={`dash-breakdown ${small ? 'dash-breakdown--small' : ''}`}>
    <div className="dash-donut" role="img" aria-label={total ? `${total} orders: ${segments.map(([name, count]) => `${count} ${friendlyStatus(name)}`).join(', ')}` : 'No orders yet'}
      style={{ background: slices.length ? `conic-gradient(${slices.join(', ')})` : 'conic-gradient(var(--portal-surface-alt) 0% 100%)' }}>
      <div className="dash-donut-center"><strong>{total.toLocaleString()}</strong><span>Orders</span></div>
    </div>
    <div className="dash-breakdown-legend">
      {total === 0 ? <p className="dash-muted">Order status totals will appear here once customers start ordering.</p>
        : segments.map(([name, count], i) => <div className="dash-legend-row" key={name}>
          <span className="dash-legend-dot" style={{ backgroundColor: STATUS_COLORS[name.toUpperCase()] || FALLBACK_COLORS[i % FALLBACK_COLORS.length] }}/>
          <span className="dash-legend-name">{friendlyStatus(name)}</span>
          <strong>{count}</strong><span className="dash-legend-percent">{Math.round(count / total * 100)}%</span>
        </div>)}
    </div>
  </div>
}

export function ProgressBar({ label, value, max, caption, tone = 'amber' }: {
  label: string; value: number; max: number; caption?: string; tone?: 'amber' | 'blue' | 'green'
}) {
  const percent = max > 0 ? Math.max(0, Math.min(100, value / max * 100)) : 0
  return <div className="dash-progress-item">
    <div className="dash-progress-top"><span>{label}</span><strong>{caption ?? value.toLocaleString()}</strong></div>
    <div className="dash-progress-track"><div className={`dash-progress-fill dash-progress-fill--${tone}`} style={{ width: `${percent}%` }}/></div>
  </div>
}

export function EmptyChart({ text }: { text: string }) {
  return <div className="dash-empty-chart"><span className="dash-empty-chart-icon">▥</span>{text}</div>
}

export function OrderTrend({ dates, values, metric, onMetricChange }: {
  dates: string[]; values: number[]; metric: 'value' | 'count'; onMetricChange: (metric: 'value' | 'count') => void
}) {
  const valid = values.some(value => value > 0)
  const max = Math.max(1, ...values)
  const points = values.map((value, i) => ({ x: 40 + i * (620 / Math.max(1, values.length - 1)), y: 190 - (value / max * 148) }))
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')
  const area = points.length ? `${line} L${points[points.length - 1].x} 190 L${points[0].x} 190 Z` : ''
  return <div className="dash-chart-wrap">
    <div className="dash-segmented" role="group" aria-label="Chart metric">
      <button type="button" className={metric === 'value' ? 'active' : ''} onClick={() => onMetricChange('value')}>Order value</button>
      <button type="button" className={metric === 'count' ? 'active' : ''} onClick={() => onMetricChange('count')}>Orders</button>
    </div>
    <div className="dash-linechart">
      <svg viewBox="0 0 700 220" role="img" aria-label={`${metric === 'value' ? 'Order value' : 'Orders'} over the last ${dates.length} days`} preserveAspectRatio="none">
        <defs><linearGradient id="dash-trend-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#ffbf35" stopOpacity="0.28"/><stop offset="100%" stopColor="#ffbf35" stopOpacity="0"/></linearGradient></defs>
        {[42, 91, 140, 190].map(y => <line key={y} x1="30" x2="675" y1={y} y2={y} className="dash-chart-grid" />)}
        {valid && <><path d={area} fill="url(#dash-trend-area)"/><path d={line} fill="none" stroke="#f2a900" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
          {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3.2} fill="#f2a900"><title>{`${dates[i]}: ${values[i].toLocaleString()}`}</title></circle>)}
        </>}
      </svg>
      {!valid && <div className="dash-chart-overlay">No order activity during this period</div>}
    </div>
    <div className="dash-chart-axis">{dates.filter((_, i) => i === 0 || i === Math.floor(dates.length / 2) || i === dates.length - 1).map((date, i) => <span key={i}>{date}</span>)}</div>
  </div>
}

export function ActionTile({ to, icon: Icon, label, description }: { to: string; icon: LucideIcon; label: string; description: string }) {
  return <Link className="dash-action-tile" to={to}><span className="dash-action-icon"><Icon size={19}/></span><span className="dash-action-copy"><strong>{label}</strong><small>{description}</small></span><ArrowUpRight size={16} className="dash-action-arrow"/></Link>
}
