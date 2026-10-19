'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Camera,
  LayoutDashboard,
  Calendar,
  Package,
  DollarSign,
  Award,
  ShieldCheck,
  CheckCircle2,
  Clock,
  LogOut,
  FolderOpen,
  Menu,
  X,
  Settings,
} from 'lucide-react'

const NAV_ITEMS = [
  {
    href: '/photographer/dashboard',
    label: 'Tổng quan Studio',
    icon: LayoutDashboard,
    iconColor: 'text-violet-400',
  },
  {
    href: '/photographer/bookings',
    label: 'Lịch chụp & Bàn giao',
    icon: Clock,
    iconColor: 'text-emerald-400',
  },
  {
    href: '/photographer/calendar',
    label: 'Lịch biểu làm việc',
    icon: Calendar,
    iconColor: 'text-pink-400',
  },
  {
    href: '/photographer/portfolio',
    label: 'Quản lý Portfolio',
    icon: FolderOpen,
    iconColor: 'text-cyan-400',
  },
  {
    href: '/photographer/packages',
    label: 'Gói dịch vụ & Bảng giá',
    icon: Package,
    iconColor: 'text-amber-400',
  },
  {
    href: '/photographer/earnings',
    label: 'Thu nhập & Hoa hồng',
    icon: DollarSign,
    iconColor: 'text-emerald-400',
  },
  {
    href: '/photographer/withdrawals',
    label: 'Yêu cầu rút tiền',
    icon: ShieldCheck,
    iconColor: 'text-violet-400',
  },
  {
    href: '/photographer/achievements',
    label: 'Thành tích & Star Q1',
    icon: Award,
    iconColor: 'text-amber-400',
  },
]

export function PhotographerSidebar() {
  const pathname = usePathname()
  const [userName, setUserName] = useState('Minh Trí (TriStreet)')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('flashy_current_user')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.name || parsed?.full_name) {
          setUserName(parsed.name || parsed.full_name)
        }
      }
    } catch {}
  }, [])

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    document.cookie = 'flashy_role=; path=/; max-age=0'
    document.cookie = 'flashy_email=; path=/; max-age=0'
    document.cookie = 'flashy_name=; path=/; max-age=0'
    try {
      localStorage.removeItem('flashy_current_user')
    } catch {}
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    window.location.href = '/login'
  }

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-slate-950 text-white px-4 py-3 flex items-center justify-between border-b border-slate-900 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center text-white shadow-md">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <span className="text-base font-black text-white tracking-tight">FLASHY Pro</span>
            <span className="text-[9px] text-violet-400 block -mt-1 font-semibold">Photographer Studio</span>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar (Desktop fixed + Mobile slide-in) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-950 text-slate-300 flex flex-col justify-between p-4 flex-shrink-0 border-r border-slate-900 transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand (Desktop) */}
          <Link href="/" className="hidden md:flex items-center gap-2 px-2 py-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black text-white tracking-tight">FLASHY Pro</span>
              <span className="text-[10px] text-violet-400 block -mt-1 font-semibold">Photographer Studio</span>
            </div>
          </Link>

          {/* Navigation Links with Prominent Active States */}
          <nav className="space-y-1.5 text-xs">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive =
                item.href === '/photographer/dashboard'
                  ? pathname === '/photographer/dashboard' || pathname === '/photographer'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 ${
                    isActive
                      ? 'bg-violet-600 text-white font-semibold shadow-md shadow-violet-600/30'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white font-medium'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : item.iconColor
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Card at Bottom */}
        <div className="pt-4 border-t border-slate-900 mt-6 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors">
            <Link
              href="/photographer/profile"
              className="flex items-center gap-2.5 min-w-0 group flex-1"
              title="Xem thông tin cá nhân"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                {userName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white text-xs truncate group-hover:text-violet-300 transition-colors">
                  {userName}
                </p>
                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 shrink-0" /> Đã duyệt KYC
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-1 shrink-0 ml-1">
              <Link
                href="/photographer/settings"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Cài đặt tài khoản"
              >
                <Settings className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                title="Đăng xuất tài khoản"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
