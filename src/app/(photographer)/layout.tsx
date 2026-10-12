import Link from 'next/link'
import {
  Camera,
  LayoutDashboard,
  Calendar,
  Image as ImageIcon,
  Package,
  DollarSign,
  Award,
  Bell,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  LogOut,
  FolderOpen
} from 'lucide-react'
import { RoleSwitcher } from '@/components/shared/role-switcher'

export default function PhotographerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Desktop Photographer Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 text-slate-300 flex flex-col justify-between p-4 flex-shrink-0 border-r border-slate-900">
        <div>
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 px-2 py-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black text-white tracking-tight">FLASHY Pro</span>
              <span className="text-[10px] text-violet-400 block -mt-1 font-semibold">Photographer Studio</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            <Link
              href="/photographer/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-violet-400" />
              Tổng quan Studio
            </Link>

            <Link
              href="/photographer/bookings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition-colors"
            >
              <Clock className="w-4 h-4 text-emerald-400" />
              Lịch chụp & Bàn giao
            </Link>

            <Link
              href="/photographer/calendar"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition-colors"
            >
              <Calendar className="w-4 h-4 text-pink-400" />
              Lịch biểu làm việc
            </Link>

            <Link
              href="/photographer/portfolio"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition-colors"
            >
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              Quản lý Portfolio
            </Link>

            <Link
              href="/photographer/packages"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition-colors"
            >
              <Package className="w-4 h-4 text-amber-400" />
              Gói dịch vụ & Bảng giá
            </Link>

            <Link
              href="/photographer/earnings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition-colors"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Thu nhập & Hoa hồng
            </Link>

            <Link
              href="/photographer/withdrawals"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-violet-400" />
              Yêu cầu rút tiền
            </Link>

            <Link
              href="/photographer/achievements"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition-colors"
            >
              <Award className="w-4 h-4 text-amber-400" />
              Thành tích & Star Q1
            </Link>
          </nav>
        </div>

        {/* User Card at Bottom */}
        <div className="pt-4 border-t border-slate-900 mt-6 text-xs space-y-2.5">
          <div className="flex items-center justify-between px-2">
            <div>
              <p className="font-bold text-white text-xs">Minh Trí (TriStreet)</p>
              <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Đã duyệt KYC
              </p>
            </div>
            <Link href="/" className="text-slate-500 hover:text-white" title="Đăng xuất">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
          <div className="px-2">
            <RoleSwitcher currentRole="PHOTOGRAPHER" />
          </div>
        </div>
      </aside>

      {/* Main Photographer Content */}
      <div className="flex-1 overflow-y-auto">
        <main className="min-h-screen">{children}</main>
      </div>

    </div>
  )
}
