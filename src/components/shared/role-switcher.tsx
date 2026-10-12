'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Camera, User, LogOut, RefreshCw, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function RoleSwitcher({ currentRole }: { currentRole: 'ADMIN' | 'PHOTOGRAPHER' | 'CUSTOMER' }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const switchRole = async (targetRole: 'ADMIN' | 'PHOTOGRAPHER' | 'CUSTOMER') => {
    setLoading(true)
    try {
      document.cookie = `flashy_role=${targetRole}; path=/; max-age=604800; SameSite=Lax`
      const email =
        targetRole === 'ADMIN'
          ? 'admin@flashy.vn'
          : targetRole === 'PHOTOGRAPHER'
          ? 'photographer@flashy.vn'
          : 'customer@flashy.vn'
      document.cookie = `flashy_email=${email}; path=/; max-age=604800; SameSite=Lax`

      await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole, email }),
      })

      const targetPath =
        targetRole === 'ADMIN'
          ? '/admin'
          : targetRole === 'PHOTOGRAPHER'
          ? '/photographer/dashboard'
          : '/customer/dashboard'

      window.location.href = targetPath
    } catch {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    document.cookie = 'flashy_role=; path=/; max-age=0'
    document.cookie = 'flashy_email=; path=/; max-age=0'
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const roleLabel =
    currentRole === 'ADMIN'
      ? '👑 Quản Trị Viên (Admin)'
      : currentRole === 'PHOTOGRAPHER'
      ? '📷 Nhiếp Ảnh Gia (Pro)'
      : '👤 Khách Hàng (Customer)'

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium transition-all"
      >
        <span>{roleLabel}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 bottom-full mb-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50 text-xs space-y-1">
          <p className="px-2.5 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Chuyển nhanh vai trò
          </p>

          <button
            onClick={() => switchRole('ADMIN')}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors ${
              currentRole === 'ADMIN'
                ? 'bg-violet-600/30 text-violet-300 font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span>👑</span>
            <div>
              <p className="font-semibold text-xs">Quản Trị Viên (Admin)</p>
              <p className="text-[10px] text-slate-400">Xem GMV, Escrow, KYC, Tranh chấp</p>
            </div>
          </button>

          <button
            onClick={() => switchRole('PHOTOGRAPHER')}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors ${
              currentRole === 'PHOTOGRAPHER'
                ? 'bg-pink-600/30 text-pink-300 font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span>📷</span>
            <div>
              <p className="font-semibold text-xs">Nhiếp Ảnh Gia (Pro)</p>
              <p className="text-[10px] text-slate-400">Lịch chụp, Nhận đơn, Tải ảnh</p>
            </div>
          </button>

          <button
            onClick={() => switchRole('CUSTOMER')}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors ${
              currentRole === 'CUSTOMER'
                ? 'bg-emerald-600/30 text-emerald-300 font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span>👤</span>
            <div>
              <p className="font-semibold text-xs">Khách Hàng (Customer)</p>
              <p className="text-[10px] text-slate-400">Đặt lịch, Quản lý ảnh, Đổi xu</p>
            </div>
          </button>

          <div className="border-t border-slate-800 pt-1 mt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
