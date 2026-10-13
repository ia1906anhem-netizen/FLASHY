'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn, getInitials } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

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
  const supabase = createClient()
  const [activeUser, setActiveUser] = useState<any>(user || null)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setProfileOpen(false)
  }, [pathname])

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
          <div className="flex items-center justify-between h-16 md:h-18">
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

              {activeUser ? (
                <>
                  {/* Notifications */}
                  <Button variant="ghost" size="icon" className={cn(
                    'relative hidden md:flex',
                    isScrolled || !isHomePage ? '' : 'text-white hover:bg-white/10'
                  )}>
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                  </Button>

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

      {/* Overlay for profile dropdown */}
      {profileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setProfileOpen(false)}
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
