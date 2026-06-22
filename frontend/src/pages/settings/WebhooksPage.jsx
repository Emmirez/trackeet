import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Webhook, Plus, Trash2, X, Play, ToggleLeft, ToggleRight, Copy, CheckCircle } from 'lucide-react'
import { webhookAPI } from '../../services/api.js'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const ALL_EVENTS = [
  { value: 'invoice.created',  label: '📄 Invoice Created',   desc: 'When a new invoice is created' },
  { value: 'invoice.paid',     label: '✅ Invoice Paid',       desc: 'When an invoice is marked paid' },
  { value: 'invoice.overdue',  label: '⚠️ Invoice Overdue',   desc: 'When an invoice becomes overdue' },
  { value: 'invoice.deleted',  label: '🗑️ Invoice Deleted',   desc: 'When an invoice is deleted' },
  { value: 'customer.created', label: '👤 Customer Added',    desc: 'When a new customer is added' },
  { value: 'customer.deleted', label: '👤 Customer Deleted',  desc: 'When a customer is removed' },
  { value: 'payment.received', label: '💰 Payment Received',  desc: 'When a payment is recorded' },
]

export default function WebhooksPage() {
  const qc = useQueryClient()

  const [showCreate, setShowCreate] = useState(false)
  const [whName,  setWhName]  = useState('')
  const [whUrl,   setWhUrl]   = useState('')
  const [whEvents, setWhEvents] = useState([])

  const { data, isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn:  () => webhookAPI.getWebhooks().then(r => r.data),
  })

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: webhookAPI.createWebhook,
    onSuccess: () => {
      toast.success('Webhook created!')
      qc.invalidateQueries(['webhooks'])
      setShowCreate(false)
      setWhName('')
      setWhUrl('')
      setWhEvents([])
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create webhook'),
  })

  const { mutate: update } = useMutation({
    mutationFn: ({ id, data }) => webhookAPI.updateWebhook(id, data),
    onSuccess: () => { toast.success('Updated!'); qc.invalidateQueries(['webhooks']) },
    onError:   (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  })

  const { mutate: remove } = useMutation({
    mutationFn: webhookAPI.deleteWebhook,
    onSuccess: () => { toast.success('Webhook deleted'); qc.invalidateQueries(['webhooks']) },
    onError:   (err) => toast.error(err.response?.data?.message || 'Failed to delete'),
  })

  const { mutate: test } = useMutation({
    mutationFn: webhookAPI.testWebhook,
    onSuccess: () => toast.success('Test event sent! Check your endpoint.'),
    onError:   (err) => toast.error(err.response?.data?.message || 'Test failed'),
  })

  const toggleEvent = (event) => {
    setWhEvents(prev =>
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    )
  }

  const handleDelete = (webhook) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">Delete "{webhook.name}"?</p>
        <p className="text-xs text-dark-400">This cannot be undone.</p>
        <div className="flex gap-2">
          <button onClick={() => { remove(webhook._id); toast.dismiss(t.id) }}
            className="px-3 py-1 bg-danger text-white text-xs font-bold rounded-lg">Delete</button>
          <button onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-100 text-dark text-xs font-bold rounded-lg">Cancel</button>
        </div>
      </div>
    ), { duration: 6000 })
  }

  const webhooks = data?.webhooks || []

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl mx-auto">
      <div className="section-header">
        <div>
          <h1 className="page-title">Webhooks</h1>
          <p className="text-dark-400 text-sm">Get notified when events happen in Trackeet</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn btn-primary btn-sm">
          <Plus size={16}/> Add Webhook
        </button>
      </div>

      {/* How it works */}
      <div className="card">
        <h2 className="font-semibold text-dark dark:text-white mb-3">How Webhooks Work</h2>
        <p className="text-sm text-dark-400 mb-4">
          When an event occurs in Trackeet, we'll send an HTTP POST request to your URL with the event data.
        </p>
        <div className="p-3 bg-dark rounded-xl font-mono text-xs overflow-x-auto">
          <p className="text-gray-400">// Example payload for invoice.created</p>
          <p className="text-success mt-1">{'{'}</p>
          <p className="text-warning ml-4">"event": <span className="text-white">"invoice.created"</span>,</p>
          <p className="text-warning ml-4">"timestamp": <span className="text-white">"2026-05-14T09:00:00.000Z"</span>,</p>
          <p className="text-warning ml-4">"data": {'{'}</p>
          <p className="text-warning ml-8">"invoiceNumber": <span className="text-white">"INV-2026-0001"</span>,</p>
          <p className="text-warning ml-8">"totalAmount": <span className="text-white">15000</span>,</p>
          <p className="text-warning ml-8">"status": <span className="text-white">"pending"</span></p>
          <p className="text-warning ml-4">{'}'}</p>
          <p className="text-success">{'}'}</p>
        </div>
        <p className="text-xs text-dark-400 mt-3">
          We also send a <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">X-Trackeet-Signature</span> header for verification.
        </p>
      </div>

      {/* Webhooks list */}
      <div className="card">
        <h2 className="font-semibold text-dark dark:text-white mb-4">
          Your Webhooks {webhooks.length > 0 && `(${webhooks.length}/10)`}
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="skeleton h-20 rounded-xl"/>)}
          </div>
        ) : webhooks.length === 0 ? (
          <div className="empty-state py-8">
            <Webhook size={40} className="text-dark-200"/>
            <p className="font-semibold text-dark dark:text-white">No webhooks yet</p>
            <p className="text-dark-400 text-sm">Add a webhook to connect Trackeet to your systems</p>
          </div>
        ) : (
          <div className="space-y-4">
            {webhooks.map((wh, i) => (
              <div key={i} className="p-4 rounded-xl border border-dark-200 dark:border-gray-700 bg-gray-50 dark:bg-dark">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-dark dark:text-white">{wh.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        wh.status === 'active' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'
                      }`}>{wh.status}</span>
                    </div>
                    <p className="text-xs text-dark-400 font-mono truncate">{wh.url}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-dark-400">
                      <span>✅ {wh.successCount || 0} success</span>
                      <span>❌ {wh.failCount || 0} failed</span>
                      {wh.lastTriggered && <span>Last: {dayjs(wh.lastTriggered).fromNow()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => test(wh._id)}
                      className="btn btn-ghost btn-sm border border-primary/20 text-primary hover:bg-primary-light"
                      title="Send test event">
                      <Play size={12}/> Test
                    </button>
                    <button
                      onClick={() => update({ id: wh._id, data: { status: wh.status === 'active' ? 'disabled' : 'active' } })}>
                      {wh.status === 'active'
                        ? <ToggleRight size={24} className="text-primary"/>
                        : <ToggleLeft  size={24} className="text-dark-300"/>}
                    </button>
                    <button onClick={() => handleDelete(wh)}
                      className="p-1.5 rounded-lg hover:bg-danger-light text-dark-300 hover:text-danger transition-colors">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>

                {/* Events */}
                <div className="flex gap-1 flex-wrap">
                  {(wh.events || []).map(event => (
                    <span key={event} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-light text-primary">
                      {event}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Webhook Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-dark-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-surface">
              <div>
                <h3 className="font-bold text-dark dark:text-white">Add Webhook</h3>
                <p className="text-xs text-dark-400">Set up event notifications</p>
              </div>
              <button onClick={() => setShowCreate(false)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                <X size={18} className="text-dark-400"/>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label">Webhook Name *</label>
                <input value={whName} onChange={e => setWhName(e.target.value)}
                  placeholder="e.g. Zapier Integration, My POS System"
                  className="input"/>
              </div>
              <div>
                <label className="label">Endpoint URL *</label>
                <input value={whUrl} onChange={e => setWhUrl(e.target.value)}
                  placeholder="https://your-app.com/webhook"
                  type="url" className="input"/>
              </div>
              <div>
                <label className="label">Events to Listen *</label>
                <div className="space-y-2">
                  {ALL_EVENTS.map(event => (
                    <button key={event.value} onClick={() => toggleEvent(event.value)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
                        ${whEvents.includes(event.value)
                          ? 'bg-primary-light border-primary/30'
                          : 'border-dark-200 dark:border-gray-600'}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        whEvents.includes(event.value) ? 'bg-primary border-primary' : 'border-dark-300'
                      }`}>
                        {whEvents.includes(event.value) && <CheckCircle size={12} className="text-white"/>}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${whEvents.includes(event.value) ? 'text-primary' : 'text-dark dark:text-white'}`}>
                          {event.label}
                        </p>
                        <p className="text-xs text-dark-400">{event.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (!whName.trim())    return toast.error('Enter a webhook name')
                  if (!whUrl.trim())     return toast.error('Enter an endpoint URL')
                  if (!whEvents.length)  return toast.error('Select at least one event')
                  create({ name: whName, url: whUrl, events: whEvents })
                }}
                disabled={creating}
                className="btn btn-primary w-full py-3">
                {creating ? 'Creating...' : <><Webhook size={16}/> Create Webhook</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}