'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Camera,
  Calendar,
  Lock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  ArrowRight,
  Clock,
  Percent
} from 'lucide-react'
import { formatVND } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function AdminOverviewPage() {
  const summary = {
    total_gmv: 184500000,
    platform_commission: 12450000,
    total_users: 1420,
    total_photographers: 118,
    verified_photographers: 94,
    active_bookings: 34,
    completed_bookings: 512,
    open_disputes: 2,
    pending_escrow: 18900000,
    pending_payouts: 6400000,
  }

  const recentBookings = [
    {
      id: 'BK-892104',
      customer: 'Nguyễn Thu Trang',
      photographer: 'Minh Trí (TriStreet)',
      package: 'Vibe Sài Gòn',
      total: 550000,
      status: 'CONFIRMED',
      status_label: 'Sắp diễn ra',
      escrow: 'HELD_BY_PROVIDER',
    },
    {
      id: 'BK-781923',
      customer: 'Trần Minh Hoàng',
      photographer: 'Lê Bảo Visuals',
      package: 'Quick Date',
      total: 220000,
      status: 'PHOTOS_DELIVERED',
      status_label: 'Đang duyệt 48h',
      escrow: 'REVIEW_WINDOW',
    },
    {
      id: 'BK-651209',
      customer: 'Võ Mai Anh',
      photographer: 'Thảo Nguyên Photo',
      package: 'Outdoor Ngoại cảnh',
      total: 1100000,
      status: 'DISPUTED',
      status_label: 'Có khiếu nại (Đóng băng)',
      escrow: 'DISPUTED',
    }
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Bảng Điều Khiển Tổng Quan Sàn FLASHY
            </h1>
            <Badge variant="outline" className="border-emerald-600 text-emerald-700 font-bold">
              Production System Healthy
            </Badge>
          </div>
          <p className="text-xs text-slate-500">
            Dữ liệu tổng hợp từ cơ sở dữ liệu PostgreSQL • Giám sát thanh toán & Ký quỹ thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/disputes">
            <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold h-10 shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
              Khiếu nại cần xử lý ({summary.open_disputes})
            </Button>
          </Link>
          <Link href="/admin/escrow">
            <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold h-10 bg-white">
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              Giám sát Escrow
            </Button>
          </Link>
        </div>
      </div>

      {/* Financial & Platform KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng GMV Toàn Sàn</span>
            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">
            {formatVND(summary.total_gmv)}
          </div>
          <p className="text-[11px] text-slate-400">Không tính các giao dịch hoàn tiền</p>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Doanh Thu Hoa Hồng</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mb-1">
            {formatVND(summary.platform_commission)}
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold">Doanh thu thực tế của nền tảng</p>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiền Đang Giữ Escrow</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mb-1">
            {formatVND(summary.pending_escrow)}
          </div>
          <p className="text-[11px] text-slate-400">Đang được bảo đảm bởi trung gian</p>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Yêu Cầu Rút Tiền Chờ</span>
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">
            {formatVND(summary.pending_payouts)}
          </div>
          <p className="text-[11px] text-slate-400">Chờ chuyển khoản ngân hàng</p>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
          <span className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Tổng người dùng</span>
          <span className="text-xl font-black text-slate-900">{summary.total_users.toLocaleString()}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
          <span className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Thợ đã duyệt KYC</span>
          <span className="text-xl font-black text-emerald-600">{summary.verified_photographers} / {summary.total_photographers}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
          <span className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Đơn đang hoạt động</span>
          <span className="text-xl font-black text-violet-700">{summary.active_bookings}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
          <span className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Khiếu nại đang mở</span>
          <span className="text-xl font-black text-rose-600">{summary.open_disputes}</span>
        </div>
      </div>

      {/* Recent Bookings and Escrow States Table */}
      <Card className="rounded-3xl border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">Giám Sát Đơn Hàng Mới Nhất</h2>
            <p className="text-xs text-slate-500">Trạng thái đối soát và giữ tiền ký quỹ tương ứng</p>
          </div>
          <Link href="/admin/bookings" className="text-xs font-bold text-violet-600 hover:underline">
            Xem tất cả đơn →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-bold">Mã Đơn</th>
                <th className="pb-3 font-bold">Khách Hàng</th>
                <th className="pb-3 font-bold">Nhiếp Ảnh Gia</th>
                <th className="pb-3 font-bold">Gói</th>
                <th className="pb-3 font-bold">Giá Trị</th>
                <th className="pb-3 font-bold">Tiến Độ</th>
                <th className="pb-3 font-bold">Trạng Thái Escrow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60">
                  <td className="py-3.5 font-mono text-slate-400">{b.id}</td>
                  <td className="py-3.5 font-bold text-slate-900">{b.customer}</td>
                  <td className="py-3.5">{b.photographer}</td>
                  <td className="py-3.5">{b.package}</td>
                  <td className="py-3.5 font-black text-slate-900">{formatVND(b.total)}</td>
                  <td className="py-3.5">
                    <span className="font-bold text-slate-700">{b.status_label}</span>
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      b.escrow === 'DISPUTED'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : b.escrow === 'REVIEW_WINDOW'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {b.escrow}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  )
}
