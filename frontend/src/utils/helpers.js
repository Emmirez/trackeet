import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime.js'
dayjs.extend(relativeTime)

export const fmt = {
  naira: (n) => '₦' + Number(n || 0).toLocaleString('en-NG'),
  date:  (d, f) => d ? dayjs(d).format(f || 'D MMM YYYY') : '—',
  dateTime: (d) => d ? dayjs(d).format('D MMM YYYY, h:mm A') : '—',
  relative: (d) => d ? dayjs(d).fromNow() : '—',
}

export const statusBadge = (status) => {
  const map = { paid:'badge-paid', pending:'badge-pending', overdue:'badge-overdue', draft:'badge-draft', partial:'badge-partial', cancelled:'badge-cancelled' }
  return map[status?.toLowerCase()] || 'badge-draft'
}

export const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('')

export const avatarColor = (name = '') => {
  const colors = ['bg-primary', 'bg-success', 'bg-warning', 'bg-info', 'bg-purple-500', 'bg-pink-500']
  return colors[(name.charCodeAt(0) || 0) % colors.length]
}
