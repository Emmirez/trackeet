import { useQuery } from '@tanstack/react-query'
import { Users, CreditCard, FileText, TrendingUp, AlertCircle, Shield } from 'lucide-react'
import { adminAPI } from '../../services/api.js'
import dayjs from 'dayjs'

const fmt = n => '₦' + (n || 0).toLocaleString('en-NG')

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: () => adminAPI.getStats().then(r => r.data) })
  const s = data?.stats || {}

  const STATS = [
    { label:'Total Users',     value: s.totalUsers    || 0, icon:Users,       color:'text-primary',   bg:'bg-primary-light' },
    { label:'Active Subs',     value: s.activeSubs    || 0, icon:CreditCard,  color:'text-success',   bg:'bg-success-light' },
    { label:'Total Invoices',  value: s.totalInvoices || 0, icon:FileText,    color:'text-warning',   bg:'bg-warning-light' },
    { label:'Monthly Revenue', value: fmt(s.mrr || 0),      icon:TrendingUp,  color:'text-info',      bg:'bg-info-light' },
    { label:'Open Tickets',    value: s.openTickets   || 0, icon:AlertCircle, color:'text-danger',    bg:'bg-danger-light' },
    { label:'WhatsApp Active', value: s.waConnected   || 0, icon:Shield,      color:'text-purple-600',bg:'bg-purple-100' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Platform Overview</h1>
        <p className="text-sm text-dark-400">Welcome back. Here is what is happening today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {STATS.map((stat, i) => (
          <div key={i} className="card flex items-center gap-4">
            <div className={['w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0', stat.bg].join(' ')}>
              <stat.icon size={20} className={stat.color}/>
            </div>
            <div>
              <p className="text-xs text-dark-400">{stat.label}</p>
              <p className="text-xl font-black text-dark dark:text-white">{isLoading ? '—' : stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-dark dark:text-white mb-4">Recent Sign-ups</h2>
          <div className="space-y-3">
            {(data?.recentUsers || []).length === 0
              ? <p className="text-dark-400 text-sm text-center py-4">No recent sign-ups</p>
              : (data?.recentUsers || []).map((u, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="avatar w-9 h-9 bg-primary text-white text-sm">{u.firstName?.[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark dark:text-white truncate">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-dark-400">{u.email}</p>
                  </div>
                  <p className="text-xs text-dark-400 flex-shrink-0">{dayjs(u.createdAt).format('D MMM')}</p>
                  <span className={u.plan === 'free' ? 'badge-draft' : 'badge-paid'}>{u.plan}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-dark dark:text-white mb-4">Revenue Summary</h2>
          <div className="space-y-3">
            {[
              { label:'Today',      value: s.revenueToday || 0 },
              { label:'This Week',  value: s.revenueWeek  || 0 },
              { label:'This Month', value: s.revenueMTD   || 0 },
              { label:'All Time',   value: s.revenueTotal || 0 },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark rounded-xl">
                <span className="text-sm text-dark-500 dark:text-gray-400">{r.label}</span>
                <span className="font-bold text-dark dark:text-white">{fmt(r.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}