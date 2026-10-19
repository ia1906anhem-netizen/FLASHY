'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  Menu,
  X,
  Search,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Grid,
  Heart,
  MessageCircle,
  BookOpen,
  Award,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  CheckCheck,
  Check,
  Calendar,
  CreditCard,
  Image as ImageIcon,
  ChevronRight,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn, getInitials, formatRelativeTimeVN } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

export interface HeaderNotification {
  id: string
  type: 'booking' | 'delivery' | 'payment' | 'review' | 'system'
  title: string
  body: string
  read: boolean
  created_at: string
  action_url?: string
}

const DEFAULT_HEADER_NOTIFICATIONS: HeaderNotification[] = [
  {
    id: 'notif-1',
    type: 'booking',
    title: 'Đặt lịch chụp mới thành công',
    body: 'Đơn đặt lịch chụp chân dung ngoại cảnh với Photographer Minh Trí đã được xác nhận thành công.',
    read: false,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    action_url: '/customer/bookings',
  },
  {
    id: 'notif-2',
    type: 'delivery',
    title: 'Hình ảnh đã được tải lên',
    body: 'Photographer đã tải lên 35 ảnh đã chỉnh sửa cho buổi chụp Phố cổ. Hãy kiểm tra ngay!',
    read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    action_url: '/customer/bookings',
  },
  {
    id: 'notif-3',
    type: 'payment',
    title: 'Thanh toán thành công',
    body: 'Giao dịch thanh toán cọc 500.000đ cho đơn chụp #FL-8821 đã được xử lý thành công.',
    read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    action_url: '/customer/bookings',
  },
]

const NAV_LINKS = [
  { href: '/photographers', label: 'Tìm nhiếp ảnh gia' },
  { href: '/packages', label: 'Gói dịch vụ' },
  { href: '/how-it-works', label: 'Cách hoạt động' },
  { href: '/become-photographer', label: 'Trở thành photographer' },
]

interface HeaderProps {
  user?: Profile | null
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [activeUser, setActiveUser] = useState<any>(user || null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<HeaderNotification[]>([])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setProfileOpen(false)
    setNotifOpen(false)
  }, [pathname])

  useEffect(() => {
    async function loadNotifications() {
      let loadedFromDb = false
      if (activeUser?.id && activeUser.id !== 'current-user') {
        try {
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', activeUser.id)
            .order('created_at', { ascending: false })
            .limit(10)

          if (!error && data && data.length > 0) {
            setNotifications(
              data.map((item: any) => ({
                id: item.id,
                type: (item.type as any) || 'system',
                title: item.title,
                body: item.body,
                read: !!item.is_read,
                created_at: item.created_at,
                action_url: item.data?.action_url || (item.booking_id ? `/customer/bookings/${item.booking_id}` : '/customer/bookings'),
              }))
            )
            loadedFromDb = true
          }
        } catch {
          // fallback to localStorage
        }
      }

      if (!loadedFromDb && typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('flashy_notifications')
          if (stored !== null) {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed)) {
              setNotifications(parsed)
            } else {
              setNotifications([])
            }
          } else {
            // Seed initial notifications so user can immediately test dropdown & interactions
            setNotifications(DEFAULT_HEADER_NOTIFICATIONS)
            localStorage.setItem('flashy_notifications', JSON.stringify(DEFAULT_HEADER_NOTIFICATIONS))
          }
        } catch {
          setNotifications(DEFAULT_HEADER_NOTIFICATIONS)
        }
      }
    }

    loadNotifications()

    const handleSync = () => {
      try {
        const stored = localStorage.getItem('flashy_notifications')
        if (stored !== null) {
          setNotifications(JSON.parse(stored))
        }
      } catch {}
    }
    window.addEventListener('flashy_notifications_updated', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('flashy_notifications_updated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [activeUser])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllAsRead = async () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
    try {
      localStorage.setItem('flashy_notifications', JSON.stringify(updated))
      window.dispatchEvent(new Event('flashy_notifications_updated'))
    } catch {}

    if (activeUser?.id && activeUser.id !== 'current-user') {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', activeUser.id)
          .eq('is_read', false)
      } catch {}
    }
  }

  const handleNotificationClick = async (notif: HeaderNotification) => {
    if (!notif.read) {
      const updated = notifications.map(n => n.id === notif.id ? { ...n, read: true } : n)
      setNotifications(updated)
      try {
        localStorage.setItem('flashy_notifications', JSON.stringify(updated))
        window.dispatchEvent(new Event('flashy_notifications_updated'))
      } catch {}

      if (activeUser?.id && activeUser.id !== 'current-user') {
        try {
          await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notif.id)
        } catch {}
      }
    }
    setNotifOpen(false)
    if (notif.action_url) {
      router.push(notif.action_url)
    }
  }

  const dismissNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id)
    setNotifications(updated)
    try {
      localStorage.setItem('flashy_notifications', JSON.stringify(updated))
      window.dispatchEvent(new Event('flashy_notifications_updated'))
    } catch {}
  }

  const clearAllNotifications = () => {
    setNotifications([])
    try {
      localStorage.setItem('flashy_notifications', JSON.stringify([]))
      window.dispatchEvent(new Event('flashy_notifications_updated'))
    } catch {}
  }

  const restoreSampleNotifications = () => {
    setNotifications(DEFAULT_HEADER_NOTIFICATIONS)
    try {
      localStorage.setItem('flashy_notifications', JSON.stringify(DEFAULT_HEADER_NOTIFICATIONS))
      window.dispatchEvent(new Event('flashy_notifications_updated'))
    } catch {}
  }

function safeDecode(val?: string | null): string {
  if (!val) return ''
  let current = val
  try {
    while (current.includes('%')) {
      const decoded = decodeURIComponent(current)
      if (decoded === current) break
      current = decoded
    }
    return current
  } catch {
    return current
  }
}

  useEffect(() => {
    if (!user && typeof document !== 'undefined') {
      const matchRole = document.cookie.match(/flashy_role=([^;]+)/)
      const matchEmail = document.cookie.match(/flashy_email=([^;]+)/)
      const matchName = document.cookie.match(/flashy_name=([^;]+)/)
      if (matchRole) {
        const role = matchRole[1]
        const email = matchEmail ? safeDecode(matchEmail[1]) : (
          role === 'ADMIN' ? 'admin@flashy.vn' : role === 'PHOTOGRAPHER' ? 'photo@flashy.vn' : 'cust@flashy.vn'
        )
        let fullName = matchName ? safeDecode(matchName[1]) : ''
        if (!fullName) {
          try {
            const stored = localStorage.getItem('flashy_current_user')
            if (stored) {
              const p = JSON.parse(stored)
              if (p.full_name) fullName = safeDecode(p.full_name)
            }
          } catch {}
        }
        if (!fullName) {
          if (email.toLowerCase().includes('cust') || email.toLowerCase().includes('customer@flashy.vn')) {
            fullName = 'Nguyễn Thu Trang'
          } else if (email.toLowerCase().includes('photo') || email.toLowerCase().includes('photographer@flashy.vn')) {
            fullName = 'Minh Trí (TriStreet)'
          } else if (email.toLowerCase().includes('admin')) {
            fullName = 'Ban Quản Trị Flashy'
          } else {
            fullName = email.split('@')[0]
          }
        }
        fullName = safeDecode(fullName)
        setActiveUser({
          id: 'current-user',
          email,
          full_name: fullName,
          role,
          avatar_url: role === 'PHOTOGRAPHER' 
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
            : role === 'ADMIN'
            ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
            : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
        })
      } else {
        setActiveUser(null)
      }
    } else if (user) {
      setActiveUser({
        ...user,
        full_name: safeDecode(user.full_name || ''),
      })
    }
  }, [user, pathname])

  const handleSignOut = async () => {
    document.cookie = 'flashy_role=; path=/; max-age=0'
    document.cookie = 'flashy_email=; path=/; max-age=0'
    document.cookie = 'flashy_name=; path=/; max-age=0'
    try {
      localStorage.removeItem('flashy_current_user')
    } catch {}
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    try {
      await supabase.auth.signOut()
    } catch {}
    setActiveUser(null)
    window.location.href = '/login'
  }

  const isHomePage = pathname === '/'

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled || !isHomePage
            ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
            : 'bg-transparent'
        )}
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-9 h-9 rounded-xl bg-brand flex items-center justify-center shadow-glow-purple group-hover:scale-110 transition-transform duration-200">
                <Camera className="w-5 h-5 text-white" />
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-amber-400" />
              </div>
              <span className={cn(
                'text-xl font-black tracking-tight hidden sm:block',
                isScrolled || !isHomePage ? 'text-foreground' : 'text-white'
              )}>
                FLASHY
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                    isScrolled || !isHomePage
                      ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      : 'text-white/80 hover:text-white hover:bg-white/10',
                    pathname === link.href && (isScrolled || !isHomePage)
                      ? 'text-primary bg-primary/10'
                      : pathname === link.href
                      ? 'text-white bg-white/20'
                      : ''
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Search button (mobile) */}
              <Button variant="ghost" size="icon" className={cn(
                'lg:hidden',
                isScrolled || !isHomePage ? '' : 'text-white hover:bg-white/10'
              )}>
                <Search className="w-5 h-5" />
              </Button>

              {/* Notification Bell Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen(!notifOpen)
                    setProfileOpen(false)
                  }}
                  className={cn(
                    'relative p-2 rounded-xl cursor-pointer hover:bg-slate-700/50 transition flex items-center justify-center',
                    isScrolled || !isHomePage ? 'text-foreground' : 'text-white',
                    notifOpen && 'bg-slate-700/30'
                  )}
                  aria-label="Thông báo"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-[-48px] sm:right-0 mt-2 w-[340px] sm:w-[380px] max-w-[calc(100vw-2rem)] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-border/60"
                    >
                      {/* Dropdown Header */}
                      <div className="p-3.5 flex items-center justify-between bg-muted/30">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">Thông báo</span>
                          {unreadCount > 0 ? (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                              {unreadCount} mới
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">
                              {notifications.length}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={markAllAsRead}
                              className="text-xs text-brand hover:text-brand-dark flex items-center gap-1 font-medium transition-colors hover:underline cursor-pointer"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              Đánh dấu tất cả là đã đọc
                            </button>
                          )}
                          {notifications.length > 0 && (
                            <button
                              type="button"
                              onClick={clearAllNotifications}
                              title="Xóa tất cả thông báo"
                              className="text-xs text-muted-foreground hover:text-red-500 p-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Dropdown Content */}
                      {notifications.length === 0 ? (
                        /* Gentle Empty State */
                        <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-3 text-muted-foreground border border-border/50">
                            <Bell className="w-6 h-6 text-muted-foreground/60" />
                          </div>
                          <p className="text-sm font-semibold text-foreground">Chưa có thông báo mới nào</p>
                          <p className="text-xs text-muted-foreground mt-1 max-w-[240px] leading-relaxed">
                            Khi có lịch chụp mới, hình ảnh hoặc thanh toán, bạn sẽ nhận được thông báo tại đây.
                          </p>
                          <button
                            type="button"
                            onClick={restoreSampleNotifications}
                            className="mt-4 text-xs font-medium text-brand hover:text-brand-dark flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand/10 hover:bg-brand/15 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Tải thông báo mẫu
                          </button>
                        </div>
                      ) : (
                        /* Notifications List */
                        <div className="max-h-[360px] overflow-y-auto divide-y divide-border/40">
                          {notifications.map((notif) => {
                            const isUnread = !notif.read
                            return (
                              <div
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className={cn(
                                  'p-3.5 flex items-start gap-3 transition-colors duration-150 cursor-pointer relative group',
                                  isUnread ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'
                                )}
                              >
                                <div className={cn(
                                  'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                                  getNotifIconBg(notif.type)
                                )}>
                                  {getNotifIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <p className={cn(
                                      'text-xs leading-snug truncate',
                                      isUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'
                                    )}>
                                      {notif.title}
                                    </p>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                                    {notif.body}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-[10px] text-muted-foreground">
                                      {formatRelativeTimeVN(notif.created_at)}
                                    </span>
                                    {isUnread && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    dismissNotification(notif.id)
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted cursor-pointer shrink-0"
                                  title="Xóa thông báo"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Dropdown Footer */}
                      <div className="p-2.5 bg-muted/20 text-center">
                        <Link
                          href="/customer/notifications"
                          onClick={() => setNotifOpen(false)}
                          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 py-1"
                        >
                          Xem tất cả thông báo
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {activeUser ? (
                <>
                  {/* Profile dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-muted/50 transition-colors duration-200"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={activeUser.avatar_url || ''} />
                        <AvatarFallback className="text-xs">
                          {getInitials(safeDecode(activeUser.full_name))}
                        </AvatarFallback>
                      </Avatar>
                      <span className={cn(
                        'text-sm font-medium hidden md:block max-w-[120px] truncate',
                        isScrolled || !isHomePage ? 'text-foreground' : 'text-white'
                      )}>
                        {safeDecode(activeUser.full_name).split(' ').pop()}
                      </span>
                      <ChevronDown className={cn(
                        'w-4 h-4 hidden md:block transition-transform duration-200',
                        isScrolled || !isHomePage ? 'text-muted-foreground' : 'text-white/70',
                        profileOpen && 'rotate-180'
                      )} />
                    </button>

                    <AnimatePresence>
                      {profileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-2xl shadow-xl overflow-hidden z-50"
                        >
                          <div className="p-2">
                            <div className="px-3 py-2 mb-1">
                              <p className="text-sm font-semibold truncate">{safeDecode(activeUser.full_name)}</p>
                              <p className="text-xs text-muted-foreground truncate">{activeUser.email}</p>
                              {activeUser.role && (
                                <Badge variant={activeUser.role === 'PHOTOGRAPHER' ? 'verified' : 'secondary'} className="mt-1 text-xs">
                                  {activeUser.role === 'CUSTOMER' ? 'Khách hàng' : activeUser.role === 'PHOTOGRAPHER' ? 'Nhiếp ảnh gia' : 'Admin'}
                                </Badge>
                              )}
                            </div>
                            <div className="h-px bg-border mb-1" />

                            {activeUser.role === 'CUSTOMER' || activeUser.role === 'ADMIN' ? (
                              <>
                                <ProfileMenuItem href="/customer/dashboard" icon={LayoutDashboard} label="Dashboard" />
                                <ProfileMenuItem href="/customer/bookings" icon={BookOpen} label="Đơn chụp của tôi" />
                                <ProfileMenuItem href="/customer/messages" icon={MessageCircle} label="Tin nhắn" />
                                <ProfileMenuItem href="/customer/loyalty" icon={Award} label="Điểm thưởng" />
                              </>
                            ) : null}

                            {activeUser.role === 'PHOTOGRAPHER' && (
                              <>
                                <ProfileMenuItem href="/photographer/dashboard" icon={LayoutDashboard} label="Dashboard" />
                                <ProfileMenuItem href="/photographer/bookings" icon={BookOpen} label="Đơn hàng" />
                                <ProfileMenuItem href="/photographer/messages" icon={MessageCircle} label="Tin nhắn" />
                                <ProfileMenuItem href="/photographer/earnings" icon={Award} label="Thu nhập" />
                              </>
                            )}

                            {activeUser.role === 'ADMIN' && (
                              <ProfileMenuItem href="/admin" icon={ShieldCheck} label="Trang Admin" />
                            )}

                            <div className="h-px bg-border my-1" />
                            <ProfileMenuItem href="/customer/settings" icon={Settings} label="Cài đặt" />
                            <button
                              onClick={handleSignOut}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors duration-200"
                            >
                              <LogOut className="w-4 h-4" />
                              Đăng xuất
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className={cn(
                      'hidden md:flex',
                      isScrolled || !isHomePage ? '' : 'text-white hover:bg-white/10'
                    )}
                  >
                    <Link href="/login">Đăng nhập</Link>
                  </Button>
                  <Button
                    size="sm"
                    className="bg-brand text-white hover:opacity-90 shadow-glow-purple"
                    asChild
                  >
                    <Link href="/register">Đăng ký</Link>
                  </Button>
                </div>
              )}

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'lg:hidden',
                  isScrolled || !isHomePage ? '' : 'text-white hover:bg-white/10'
                )}
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden overflow-hidden bg-background border-t border-border"
            >
              <nav className="container mx-auto px-4 py-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200',
                      pathname === link.href
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {!activeUser && (
                  <div className="pt-2 flex flex-col gap-2">
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/login">Đăng nhập</Link>
                    </Button>
                    <Button className="bg-brand text-white w-full" asChild>
                      <Link href="/register">Đăng ký miễn phí</Link>
                    </Button>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Overlay for profile & notification dropdowns */}
      {(profileOpen || notifOpen) && (
        <div
          className="fixed inset-0 z-40 bg-black/5"
          onClick={() => {
            setProfileOpen(false)
            setNotifOpen(false)
          }}
        />
      )}
    </>
  )
}

function ProfileMenuItem({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-lg transition-colors duration-200"
    >
      <Icon className="w-4 h-4 text-muted-foreground" />
      {label}
    </Link>
  )
}

function getNotifIcon(type: HeaderNotification['type']) {
  switch (type) {
    case 'booking':
      return <Calendar className="w-4 h-4 text-blue-500" />
    case 'delivery':
      return <ImageIcon className="w-4 h-4 text-violet-500" />
    case 'payment':
      return <CreditCard className="w-4 h-4 text-emerald-500" />
    case 'review':
      return <Award className="w-4 h-4 text-amber-500" />
    default:
      return <Bell className="w-4 h-4 text-slate-500" />
  }
}

function getNotifIconBg(type: HeaderNotification['type']) {
  switch (type) {
    case 'booking':
      return 'bg-blue-500/10'
    case 'delivery':
      return 'bg-violet-500/10'
    case 'payment':
      return 'bg-emerald-500/10'
    case 'review':
      return 'bg-amber-500/10'
    default:
      return 'bg-slate-500/10'
  }
}
