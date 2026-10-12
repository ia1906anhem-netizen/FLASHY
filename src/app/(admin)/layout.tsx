import Link from 'next/link'
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
  LogOut,
  FileText
} from 'lucide-react'
import { RoleSwitcher } from '@/components/shared/role-switcher'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 flex-shrink-0 border-r border-slate-800">
        <div>
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 px-2 py-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black text-white tracking-tight">FLASHY Admin</span>
              <span className="text-[10px] text-amber-400 block -mt-1 font-bold">Control Panel</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-violet-400" />
              Tổng quan sàn (Overview)
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              Quản lý người dùng
            </Link>

            <Link
              href="/admin/kyc"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Duyệt định danh KYC
            </Link>

            <Link
              href="/admin/bookings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Calendar className="w-4 h-4 text-pink-400" />
              Đơn chụp & Lịch hẹn
            </Link>

            <Link
              href="/admin/escrow"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              Giám sát Ký quỹ Escrow
            </Link>

            <Link
              href="/admin/disputes"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Xử lý tranh chấp
            </Link>

            <Link
              href="/admin/analytics"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Báo cáo & Phân tích
            </Link>

            <Link
              href="/admin/commissions"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Percent className="w-4 h-4 text-teal-400" />
              Cấu hình hoa hồng
            </Link>

            <Link
              href="/admin/vouchers"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Ticket className="w-4 h-4 text-yellow-400" />
              Quản lý Voucher
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              Cài đặt hệ thống
            </Link>
          </nav>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-2">
          <RoleSwitcher currentRole="ADMIN" />
          <div>
            <p className="font-bold text-slate-400">Admin Session Active</p>
            <p className="mt-0.5">Audit Logging: Enabled</p>
          </div>
          <Link href="/" className="text-violet-400 hover:underline block pt-1">
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
