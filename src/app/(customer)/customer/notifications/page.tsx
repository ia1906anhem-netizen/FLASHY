'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, BookOpen, Star, Package, Zap, Check, X, Settings } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRelativeTimeVN } from '@/lib/utils'

type NotifType = 'booking' | 'review' | 'payment' | 'promotion' | 'system'

interface Notification {
  id: string
  type: NotifType
  title: string
  body: string
  read: boolean
  created_at: string
  action_url?: string
}

const TYPE_CONFIG: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
  booking: { icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
  review: { icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
  payment: { icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  promotion: { icon: Package, color: 'text-violet-600', bg: 'bg-violet-50' },
  system: { icon: Bell, color: 'text-slate-600', bg: 'bg-slate-100' },
}

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  // Load real notifications from localStorage if any
  useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('flashy_notifications')
        if (stored) {
          setNotifications(JSON.parse(stored))
        }
      }
    } catch {}
  })

  const unreadCount = notifications.filter(n => !n.read).length
  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-violet-500" />
              Thông báo
              {unreadCount > 0 && (
                <Badge className="bg-violet-600 text-white border-0 text-xs px-2">{unreadCount}</Badge>
              )}
            </h1>
            <p className="text-slate-500 text-sm mt-1">Cập nhật về đơn hàng và tài khoản của bạn</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="text-violet-600 hover:text-violet-700 text-xs gap-1">
              <Check className="w-3 h-3" />
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {(['all', 'unread'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {f === 'all' ? 'Tất cả' : `Chưa đọc (${unreadCount})`}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl p-12 text-center border border-slate-200"
            >
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Không có thông báo nào</p>
              <p className="text-slate-400 text-sm mt-1">Bạn đã đọc tất cả thông báo rồi!</p>
            </motion.div>
          ) : (
            filtered.map((notif, i) => {
              const config = TYPE_CONFIG[notif.type]
              const Icon = config.icon
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white rounded-2xl p-4 border shadow-sm flex gap-4 cursor-pointer transition-all hover:shadow-md ${
                    !notif.read ? 'border-violet-200 bg-violet-50/30' : 'border-slate-200'
                  }`}
                  onClick={() => markRead(notif.id)}
                >
                  <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0 mt-1`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {notif.title}
                      </p>
                      <button
                        className="text-slate-300 hover:text-slate-500 flex-shrink-0 mt-0.5"
                        onClick={e => { e.stopPropagation(); dismiss(notif.id) }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.body}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-slate-400">{formatRelativeTimeVN(notif.created_at)}</span>
                      {!notif.read && <span className="w-2 h-2 bg-violet-500 rounded-full" />}
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>

        {/* Notification Settings Link */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Cài đặt thông báo</p>
            <p className="text-xs text-slate-400">Quản lý loại thông báo bạn muốn nhận</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="w-4 h-4" />
            Cài đặt
          </Button>
        </div>

      </div>
    </div>
  )
}
