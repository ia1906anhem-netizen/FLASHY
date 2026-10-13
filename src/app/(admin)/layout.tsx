'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Camera,
  LayoutDashboard,
  Users,
  ShieldCheck,
  Calendar,
  Lock,
  AlertTriangle,
  BarChart3,
  Percent,
  Ticket,
  Settings,
  Star,
  Sparkles,
  ShieldAlert,
  FileText
} from 'lucide-react'
import { RoleSwitcher } from '@/components/shared/role-switcher'

const ADMIN_NAV_ITEMS = [
  {
    href: '/admin',
    label: 'Tổng quan sàn (Overview)',
    icon: LayoutDashboard,
    badgeColor: 'text-violet-400',
  },
  {
    href: '/admin/users',
    label: 'Quản lý người dùng',
    icon: Users,
    badgeColor: 'text-cyan-400',
  },
  {
    href: '/admin/kyc',
    label: 'Duyệt định danh KYC',
    icon: ShieldCheck,
    badgeColor: 'text-emerald-400',
  },
  {
    href: '/admin/bookings',
    label: 'Đơn chụp & Lịch hẹn',
    icon: Calendar,
    badgeColor: 'text-pink-400',
  },
  {
    href: '/admin/escrow',
    label: 'Giám sát Ký quỹ Escrow',
    icon: Lock,
    badgeColor: 'text-amber-400',
  },
  {
    href: '/admin/disputes',
    label: 'Xử lý tranh chấp',
    icon: AlertTriangle,
    badgeColor: 'text-rose-400',
  },
  {
    href: '/admin/photographers',
    label: 'Nhiếp ảnh gia',
    icon: Camera,
    badgeColor: 'text-purple-400',
  },
  {
    href: '/admin/reviews',
    label: 'Quản lý đánh giá',
    icon: Star,
    badgeColor: 'text-amber-300',
  },
  {
    href: '/admin/analytics',
    label: 'Báo cáo & Phân tích',
    icon: BarChart3,
    badgeColor: 'text-indigo-400',
  },
  {
    href: '/admin/commissions',
    label: 'Cấu hình hoa hồng',
    icon: Percent,
    badgeColor: 'text-teal-400',
  },
  {
    href: '/admin/vouchers',
    label: 'Quản lý Voucher',
    icon: Ticket,
    badgeColor: 'text-yellow-400',
  },
  {
    href: '/admin/sponsored',
    label: 'Quảng cáo & Tài trợ',
    icon: Sparkles,
    badgeColor: 'text-fuchsia-400',
  },
  {
    href: '/admin/reports',
    label: 'Báo cáo vi phạm',
    icon: ShieldAlert,
    badgeColor: 'text-rose-400',
  },
  {
    href: '/admin/audit-logs',
    label: 'Nhật ký kiểm toán',
    icon: FileText,
    badgeColor: 'text-sky-400',
  },
  {
    href: '/admin/settings',
    label: 'Cài đặt hệ thống',
    icon: Settings,
    badgeColor: 'text-slate-400',
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 flex-shrink-0 border-r border-slate-800">
        <div>
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 px-2 py-3 mb-6 group">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-md shadow-violet-900/50 group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black text-white tracking-tight">FLASHY Admin</span>
              <span className="text-[10px] text-amber-400 block -mt-1 font-bold">Control Panel</span>
            </div>
          </Link>

          {/* Navigation Links with Active/Highlight Styling */}
          <nav className="space-y-1 text-xs overflow-y-auto max-h-[calc(100vh-220px)] pr-1 [scrollbar-width:thin] [scrollbar-color:#334155_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const currentPath = pathname ? pathname.replace(/\/$/, '') || '/' : ''
              const targetPath = item.href.replace(/\/$/, '') || '/'
              const isActive =
                targetPath === '/admin'
                  ? currentPath === '/admin'
                  : currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 text-white font-bold shadow-lg shadow-violet-950/60 ring-1 ring-violet-400/50 border-l-[3.5px] border-l-amber-400 pl-2.5 translate-x-1'
                      : 'text-slate-400 font-medium hover:bg-slate-800/80 hover:text-slate-100 hover:translate-x-1'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive
                        ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]'
                        : item.badgeColor
                    }`}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] flex-shrink-0 animate-pulse" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-2 mt-6">
          <RoleSwitcher currentRole="ADMIN" />
          <div>
            <p className="font-bold text-slate-400">Admin Session Active</p>
            <p className="mt-0.5">Audit Logging: Enabled</p>
          </div>
          <Link href="/" className="text-violet-400 hover:underline block pt-1 font-medium">
            ← Thoát về trang chủ
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <main className="min-h-screen p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}
