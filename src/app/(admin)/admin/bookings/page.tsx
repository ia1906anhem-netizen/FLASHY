'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Search,
  Filter,
  Eye,
  Lock,
  CheckCircle2,
  AlertTriangle,
  FolderOpen
} from 'lucide-react'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getStoredBookings, type PersistentBooking } from '@/lib/data/booking-store'

export default function AdminBookingsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [bookings, setBookings] = useState<PersistentBooking[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const loadBookings = () => {
    const list = getStoredBookings()
    setBookings(list)
    setIsLoaded(true)
  }

  useEffect(() => {
    loadBookings()
    window.addEventListener('flashy_bookings_updated', loadBookings)
    window.addEventListener('flashy_admin_updated', loadBookings)
    window.addEventListener('storage', loadBookings)
    return () => {
      window.removeEventListener('flashy_bookings_updated', loadBookings)
      window.removeEventListener('flashy_admin_updated', loadBookings)
      window.removeEventListener('storage', loadBookings)
    }
  }, [])

  const getEscrowStatus = (b: PersistentBooking) => {
    if (b.status === 'DISPUTED') return { label: 'TRANH CHẤP', color: 'bg-rose-50 text-rose-700 border-rose-200' }
    if (b.status === 'COMPLETED' || b.status === 'ACCEPTED') return { label: 'ĐÃ GIẢI NGÂN', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    if (b.status === 'CANCELLED') return { label: 'ĐÃ HOÀN TIỀN', color: 'bg-slate-50 text-slate-600 border-slate-200' }
    return { label: 'ESCROW ĐANG GIỮ', color: 'bg-amber-50 text-amber-700 border-amber-200' }
  }

  const filtered = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      b.id.toLowerCase().includes(q) ||
      (b.booking_number && b.booking_number.toLowerCase().includes(q)) ||
      b.customer_name.toLowerCase().includes(q) ||
      b.photographer_name.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý Toàn Bộ Đơn Hàng & Lịch Hẹn
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Giám sát trạng thái phiên chụp, tài khoản ký quỹ và lịch sử thanh toán thời gian thực
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-sm">
          Tổng đơn hàng: <span className="font-bold text-violet-700">{bookings.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo mã đơn, tên khách hàng hoặc tên thợ chụp..."
            className="pl-10 h-10 rounded-xl text-xs"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {['all', 'CONFIRMED', 'SHOOTING', 'PHOTOS_DELIVERED', 'COMPLETED', 'DISPUTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st === 'all'
                ? 'Tất cả'
                : st === 'CONFIRMED'
                ? 'Đã cọc'
                : st === 'SHOOTING'
                ? 'Đang chụp'
                : st === 'PHOTOS_DELIVERED'
                ? 'Đã trả ảnh'
                : st === 'COMPLETED'
                ? 'Hoàn thành'
                : 'Tranh chấp'}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          {bookings.length === 0 ? (
            <div className="py-14 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="w-12 h-12 mx-auto rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">Chưa có đơn hàng nào (Clean Slate)</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Hệ thống ở trạng thái tinh khiết không có dữ liệu mẫu. Đơn hàng sẽ tự động xuất hiện ngay khi người dùng hoàn tất đặt lịch chụp ngoài website.
              </p>
              <div className="mt-4">
                <Link href="/photographers">
                  <Button size="sm" variant="outline" className="text-xs rounded-xl font-medium">
                    Đặt thử 1 lịch chụp mẫu →
                  </Button>
                </Link>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              Không tìm thấy đơn hàng nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
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
                {filtered.map((b) => {
                  const escrow = getEscrowStatus(b)
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 font-mono text-slate-500 font-bold">
                        {b.booking_number || b.id}
                      </td>
                      <td className="py-3.5 font-bold text-slate-900">{b.customer_name}</td>
                      <td className="py-3.5">{b.photographer_name}</td>
                      <td className="py-3.5">{b.package_name}</td>
                      <td className="py-3.5">{b.shooting_date}</td>
                      <td className="py-3.5 font-black text-slate-900">{formatVND(b.total_amount)}</td>
                      <td className="py-3.5">
                        <span className="font-bold text-slate-700">{b.status_label}</span>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${escrow.color}`}>
                          {escrow.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  )
}
