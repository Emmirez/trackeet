import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Receipt, Plus, Trash2, X, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { expenseAPI } from '../../services/api.js'
import { fmt } from '../../utils/helpers.js'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

dayjs.extend(relativeTime)

const CATEGORIES = [
  { value: 'goods',       label: 'Goods',       icon: '📦', color: 'bg-primary-light text-primary'   },
  { value: 'transport',   label: 'Transport',   icon: '🚗', color: 'bg-blue-100 text-blue-600'        },
  { value: 'rent',        label: 'Rent',        icon: '🏠', color: 'bg-purple-100 text-purple-600'    },
  { value: 'salary',      label: 'Salary',      icon: '👤', color: 'bg-success-light text-success'    },
  { value: 'packaging',   label: 'Packaging',   icon: '📫', color: 'bg-yellow-100 text-yellow-600'    },
  { value: 'utilities',   label: 'Utilities',   icon: '💡', color: 'bg-orange-100 text-orange-600'    },
  { value: 'marketing',   label: 'Marketing',   icon: '📣', color: 'bg-pink-100 text-pink-600'        },
  { value: 'equipment',   label: 'Equipment',   icon: '🔧', color: 'bg-gray-100 text-gray-600'        },
  { value: 'maintenance', label: 'Maintenance', icon: '🛠️', color: 'bg-warning-light text-warning'    },
  { value: 'other',       label: 'Other',       icon: '📌', color: 'bg-dark-100 text-dark-400'        },
]

const getCat = (value) => CATEGORIES.find(c => c.value === value) || CATEGORIES[CATEGORIES.length - 1]

export default function ExpensesPage() {
  const qc  = useQueryClient()
  const now = dayjs()

  const [selectedDate, setSelectedDate] = useState(now)
  const [filterCat,    setFilterCat]    = useState('all')
  const [showAdd,      setShowAdd]      = useState(false)
  const [editExpense,  setEditExpense]  = useState(null)
  const [activeTab,    setActiveTab]    = useState('list')

  const [title,    setTitle]    = useState('')
  const [amount,   setAmount]   = useState('')
  const [category, setCategory] = useState('goods')
  const [date,     setDate]     = useState(dayjs().format('YYYY-MM-DD'))
  const [notes,    setNotes]    = useState('')

  const params = {
    month:    selectedDate.month() + 1,
    year:     selectedDate.year(),
    ...(filterCat !== 'all' ? { category: filterCat } : {}),
  }

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', params],
    queryFn:  () => expenseAPI.getAll(params).then(r => r.data),
  })

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: expenseAPI.create,
    onSuccess: () => {
      toast.success('Expense added!')
      qc.invalidateQueries(['expenses'])
      qc.invalidateQueries(['expense-summary'])
      resetForm()
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: ({ id, data }) => expenseAPI.update(id, data),
    onSuccess: () => {
      toast.success('Updated!')
      qc.invalidateQueries(['expenses'])
      qc.invalidateQueries(['expense-summary'])
      resetForm()
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })

  const { mutate: remove } = useMutation({
    mutationFn: expenseAPI.delete,
    onSuccess: () => {
      toast.success('Deleted!')
      qc.invalidateQueries(['expenses'])
      qc.invalidateQueries(['expense-summary'])
    },
    onError: () => toast.error('Failed to delete'),
  })

  const resetForm = () => {
    setShowAdd(false); setEditExpense(null)
    setTitle(''); setAmount(''); setCategory('goods')
    setDate(dayjs().format('YYYY-MM-DD')); setNotes('')
  }

  const openEdit = (exp) => {
    setEditExpense(exp); setTitle(exp.title); setAmount(String(exp.amount))
    setCategory(exp.category); setDate(dayjs(exp.date).format('YYYY-MM-DD')); setNotes(exp.notes || '')
    setShowAdd(true)
  }

  const handleSave = () => {
    if (!title.trim())                   return toast.error('Enter expense title')
    if (!amount || parseFloat(amount) <= 0) return toast.error('Enter valid amount')
    const payload = { title, amount: parseFloat(amount), category, date, notes }
    editExpense ? update({ id: editExpense._id, data: payload }) : create(payload)
  }

  const handleDelete = (exp) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">Delete "{exp.title}"?</p>
        <div className="flex gap-2">
          <button onClick={() => { remove(exp._id); toast.dismiss(t.id) }}
            className="px-3 py-1 bg-danger text-white text-xs font-bold rounded-lg">Delete</button>
          <button onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-100 text-dark text-xs font-bold rounded-lg">Cancel</button>
        </div>
      </div>
    ), { duration: 6000 })
  }

  const isCurrentMonth = selectedDate.isSame(now, 'month')
  const prevMonth = () => setSelectedDate(d => d.subtract(1, 'month'))
  const nextMonth = () => { if (!isCurrentMonth) setSelectedDate(d => d.add(1, 'month')) }

  const expenses            = data?.expenses            || []
  const selectedMonthAmount = data?.selectedMonthAmount || 0
  const prevMonthAmount     = data?.prevMonthAmount     || 0
  const byCategory          = data?.byCategory          || {}
  const monthlyHistory      = data?.monthlyHistory      || []
  const insight             = data?.insight
  const totalAmount         = data?.totalAmount         || 0

  const monthDiff = prevMonthAmount > 0
    ? Math.round(((selectedMonthAmount - prevMonthAmount) / prevMonthAmount) * 100)
    : null

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="section-header">
        <h1 className="page-title">Expenses</h1>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary btn-sm">
          <Plus size={16}/> Add Expense
        </button>
      </div>

      {/* Month Navigator */}
      <div className="card py-3">
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            <ChevronLeft size={18} className="text-dark-400"/>
          </button>
          <div className="text-center">
            <p className="font-bold text-dark dark:text-white text-lg">{selectedDate.format('MMMM YYYY')}</p>
            <p className="text-xs text-dark-400">{isCurrentMonth ? 'Current month' : selectedDate.fromNow()}</p>
          </div>
          <button onClick={nextMonth} disabled={isCurrentMonth}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30">
            <ChevronRight size={18} className="text-dark-400"/>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card py-3 text-center">
          <p className="font-black text-danger truncate" style={{ fontSize: 'clamp(11px,3.5vw,18px)' }}>
            {fmt.naira(selectedMonthAmount)}
          </p>
          <p className="text-xs text-dark-400 mt-0.5">This Month</p>
        </div>
        <div className="card py-3 text-center">
          <p className="font-black text-dark-400 truncate" style={{ fontSize: 'clamp(11px,3.5vw,18px)' }}>
            {fmt.naira(prevMonthAmount)}
          </p>
          <p className="text-xs text-dark-400 mt-0.5">Last Month</p>
        </div>
        <div className="card py-3 text-center">
          {monthDiff !== null ? (
            <>
              <p className={`font-black ${monthDiff > 0 ? 'text-danger' : 'text-success'}`}
                style={{ fontSize: 'clamp(11px,3.5vw,18px)' }}>
                {monthDiff > 0 ? '+' : ''}{monthDiff}%
              </p>
              <p className="text-xs text-dark-400 mt-0.5">vs Last Month</p>
            </>
          ) : (
            <>
              <p className="font-black text-dark dark:text-white truncate" style={{ fontSize: 'clamp(11px,3.5vw,18px)' }}>
                {fmt.naira(totalAmount)}
              </p>
              <p className="text-xs text-dark-400 mt-0.5">All Time</p>
            </>
          )}
        </div>
      </div>

      {/* Insight */}
      {insight && (
        <div className={`card flex items-start gap-3 ${
          insight.type === 'positive' ? 'bg-success-light border border-success/20' :
          insight.type === 'warning'  ? 'bg-warning-light border border-warning/20' :
          'bg-gray-50 dark:bg-dark border border-dark-100 dark:border-gray-700'
        }`}>
          <span className="text-xl flex-shrink-0">
            {insight.type === 'positive' ? '📉' : insight.type === 'warning' ? '📈' : '📊'}
          </span>
          <p className={`text-sm font-semibold ${
            insight.type === 'positive' ? 'text-success' :
            insight.type === 'warning'  ? 'text-warning' :
            'text-dark dark:text-white'
          }`}>{insight.message}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {[
          { key: 'list',    label: '📋 Expenses' },
          { key: 'history', label: '📊 History'  },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all
              ${activeTab === tab.key ? 'bg-white dark:bg-surface text-dark dark:text-white shadow-sm' : 'text-dark-400'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── HISTORY TAB ─────────────────────────── */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold text-dark dark:text-white mb-4">Last 12 Months</h2>
            {monthlyHistory.some(m => m.amount > 0) ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyHistory}>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94A3B8"/>
                  <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" tickFormatter={v => `₦${(v/1000).toFixed(0)}k`}/>
                  <Tooltip
                    formatter={v => fmt.naira(v)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="amount" radius={[6,6,0,0]}>
                    {monthlyHistory.map((entry, i) => (
                      <Cell key={i}
                        fill={entry.year === selectedDate.year() && entry.monthNum === selectedDate.month() + 1
                          ? '#7C3AED' : '#E2E8F0'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-dark-400 text-sm py-8">No expense history yet</p>
            )}
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="p-4 border-b border-dark-100 dark:border-gray-700">
              <h2 className="font-semibold text-dark dark:text-white">Monthly Breakdown</h2>
            </div>
            <div className="divide-y divide-dark-100 dark:divide-gray-700/30">
              {monthlyHistory.filter(m => m.amount > 0).reverse().map((m, i, arr) => {
                const prevM   = arr[i + 1]
                const change  = prevM?.amount > 0 ? Math.round(((m.amount - prevM.amount) / prevM.amount) * 100) : null
                const isSel   = m.year === selectedDate.year() && m.monthNum === selectedDate.month() + 1
                return (
                  <div key={i}
                    onClick={() => { setSelectedDate(dayjs(`${m.year}-${m.monthNum}-01`)); setActiveTab('list') }}
                    className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors ${isSel ? 'bg-primary-light dark:bg-primary/10' : ''}`}>
                    <p className={`text-sm font-semibold ${isSel ? 'text-primary' : 'text-dark dark:text-white'}`}>
                      {m.month}
                    </p>
                    <div className="flex items-center gap-3">
                      {change !== null && (
                        <span className={`text-xs font-semibold ${change > 0 ? 'text-danger' : 'text-success'}`}>
                          {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
                        </span>
                      )}
                      <p className={`text-sm font-black ${isSel ? 'text-primary' : 'text-dark dark:text-white'}`}>
                        {fmt.naira(m.amount)}
                      </p>
                    </div>
                  </div>
                )
              })}
              {monthlyHistory.filter(m => m.amount > 0).length === 0 && (
                <p className="text-center text-dark-400 text-sm p-8">No expense history yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── LIST TAB ──────────────────────────────── */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Category breakdown */}
          {Object.keys(byCategory).length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-dark dark:text-white mb-3">
                {selectedDate.format('MMMM')} by Category
              </h2>
              <div className="space-y-2">
                {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
                  const c       = getCat(cat)
                  const percent = selectedMonthAmount > 0 ? Math.round((amt / selectedMonthAmount) * 100) : 0
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${c.color}`}>
                        {c.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-dark dark:text-white capitalize">{c.label}</p>
                          <p className="text-xs font-bold text-dark dark:text-white">{fmt.naira(amt)}</p>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${percent}%` }}/>
                        </div>
                      </div>
                      <p className="text-xs text-dark-400 flex-shrink-0 w-8 text-right">{percent}%</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button onClick={() => setFilterCat('all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
                ${filterCat === 'all' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-dark-400'}`}>
              All
            </button>
            {CATEGORIES.map(c => (
              <button key={c.value} onClick={() => setFilterCat(c.value)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
                  ${filterCat === c.value ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-dark-400'}`}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="card p-0 overflow-hidden">
            {isLoading ? (
              <div className="p-4 space-y-3">{[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-xl"/>)}</div>
            ) : expenses.length === 0 ? (
              <div className="empty-state p-10">
                <Receipt size={48} className="text-dark-200"/>
                <p className="font-semibold text-dark dark:text-white">
                  No expenses in {selectedDate.format('MMMM YYYY')}
                </p>
                <button onClick={() => setShowAdd(true)} className="btn btn-primary btn-sm mt-2">
                  <Plus size={14}/> Add Expense
                </button>
              </div>
            ) : (
              <div className="divide-y divide-dark-100 dark:divide-gray-700/30">
                {expenses.map((exp, i) => {
                  const cat = getCat(exp.category)
                  return (
                    <div key={i}
                      className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group cursor-pointer"
                      onClick={() => openEdit(exp)}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${cat.color}`}>
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-dark dark:text-white truncate">{exp.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${cat.color}`}>
                            {cat.label}
                          </span>
                          <span className="text-xs text-dark-400">{dayjs(exp.date).format('D MMM YYYY')}</span>
                        </div>
                        {exp.notes && <p className="text-xs text-dark-400 mt-0.5 truncate">{exp.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <p className="text-sm font-black text-danger">{fmt.naira(exp.amount)}</p>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(exp) }}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-danger-light text-dark-300 hover:text-danger transition-all">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-dark-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-surface">
              <h3 className="font-bold text-dark dark:text-white">
                {editExpense ? 'Edit Expense' : 'Add Expense'}
              </h3>
              <button onClick={resetForm} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                <X size={18} className="text-dark-400"/>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label">Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Lagos transport" className="input"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Amount *</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="0.00" className="input"/>
                </div>
                <div>
                  <label className="label">Date *</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input"/>
                </div>
              </div>
              <div>
                <label className="label">Category *</label>
                <div className="grid grid-cols-5 gap-2">
                  {CATEGORIES.map(c => (
                    <button key={c.value} onClick={() => setCategory(c.value)}
                      className={`py-2 rounded-xl text-center transition-all border-2 ${
                        category === c.value ? 'border-primary bg-primary-light' : 'border-dark-100 dark:border-gray-700'
                      }`}>
                      <div className="text-lg">{c.icon}</div>
                      <p className="text-[9px] font-semibold text-dark-400 mt-0.5 truncate px-1">{c.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Notes <span className="text-dark-400 font-normal">(optional)</span></label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  rows={2} placeholder="Additional details..." className="input resize-none"/>
              </div>
              <button onClick={handleSave} disabled={creating || updating} className="btn btn-primary w-full py-3">
                {creating || updating
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  : <><TrendingDown size={16}/> {editExpense ? 'Update Expense' : 'Add Expense'}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}