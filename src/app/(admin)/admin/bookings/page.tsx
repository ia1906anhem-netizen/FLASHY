'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Search,
  Filter,
  Eye,
  Lock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function AdminBookingsPage() {
  const [search, setSearch] = useState('')

  const bookings = [
    {
      id: 'BK-892104',
      customer: 'Nguyễn Thu Trang',
      photographer: 'Minh Trí (TriStreet)',
      package: 'Vibe Sài Gòn',
      date: '15/04/2026',
      total: 550000,
      status: 'CONFIRMED',
      status_label: 'Đã cọc • Sắp chụp',
      escrow_status: 'HELD_BY_PROVIDER',
    },
    {
      id: 'BK-781923',
      customer: 'Trần Minh Hoàng',
      photographer: 'Lê Bảo Visuals',
      package: 'Quick Date',
      date: '10/04/2026',
      total: 220000,
      status: 'PHOTOS_DELIVERED',
      status_label: 'Đang kiểm duyệt 48h',
      escrow_status: 'REVIEW_WINDOW',
    },
    {
      id: 'BK-651209',
      customer: 'Võ Mai Anh',
      photographer: 'Hoàng Nam Sunset',
      package: 'Outdoor Ngoại cảnh',
      date: '20/03/2026',
      total: 1100000,
      status: 'DISPUTED',
      status_label: 'Tranh chấp mở',
      escrow_status: 'DISPUTED',
    },
    {
      id: 'BK-512984',
      customer: 'Phạm Phương Thảo',
      photographer: 'Thảo Nguyên Photo',
      package: 'Outdoor Ngoại cảnh',
      date: '18/03/2026',
      total: 800000,
      status: 'COMPLETED',
      status_label: 'Hoàn tất • Đã giải ngân',
      escrow_status: 'RELEASED',
    }
  ]

  const filtered = bookings.filter(b => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return b.id.toLowerCase().includes(q) || b.customer.toLowerCase().includes(q) || b.photographer.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý Toàn Bộ Đơn Hàng & Lịch Hẹn
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Giám sát trạng thái phiên chụp, tài khoản ký quỹ và lịch sử thanh toán
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm theo mã đơn, tên khách hàng hoặc tên thợ chụp..."
          className="border-none shadow-none text-xs focus-visible:ring-0 p-0 h-auto"
        />
      </div>

      <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-bold">Mã Đơn</th>
                <th className="pb-3 font-bold">Khách Hàng</th>
                <th className="pb-3 font-bold">Nhiếp Ảnh Gia</th>
                <th className="pb-3 font-bold">Gói Dịch Vụ</th>
                <th className="pb-3 font-bold">Ngày Chụp</th>
                <th className="pb-3 font-bold">Tổng Giá Trị</th>
                <th className="pb-3 font-bold">Trạng Thái Buổi Chụp</th>
                <th className="pb-3 font-bold">Ký Quỹ Escrow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60">
                  <td className="py-3.5 font-mono text-slate-400 font-bold">{b.id}</td>
                  <td className="py-3.5 font-bold text-slate-900">{b.customer}</td>
                  <td className="py-3.5">{b.photographer}</td>
                  <td className="py-3.5">{b.package}</td>
                  <td className="py-3.5">{b.date}</td>
                  <td className="py-3.5 font-black text-slate-900">{formatVND(b.total)}</td>
                  <td className="py-3.5 font-bold">{b.status_label}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      b.escrow_status === 'DISPUTED'
                        ? 'bg-rose-50 text-rose-700'
                        : b.escrow_status === 'RELEASED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {b.escrow_status}
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
