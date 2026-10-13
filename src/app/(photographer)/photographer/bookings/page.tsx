'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  UploadCloud,
  MessageCircle,
  Eye,
  AlertCircle,
  Camera,
  PlayCircle,
  Palette
} from 'lucide-react'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getStoredBookings, updateBookingStatus, PersistentBooking } from '@/lib/data/booking-store'

export default function PhotographerBookingsManagementPage() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'delivering' | 'completed'>('all')
  const [bookings, setBookings] = useState<PersistentBooking[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const loadData = () => {
    const list = getStoredBookings()
    setBookings(list)
    setIsLoaded(true)
  }

  useEffect(() => {
    loadData()
    const handleUpdate = () => loadData()
    window.addEventListener('flashy_bookings_updated', handleUpdate)
    return () => window.removeEventListener('flashy_bookings_updated', handleUpdate)
  }, [])

  const filtered = bookings.filter((b) => {
    if (filter === 'upcoming') {
      return ['CONFIRMED', 'PHOTOGRAPHER_ARRIVED', 'SHOOTING'].includes(b.status)
    }
    if (filter === 'delivering') {
      return ['EDITING', 'PHOTOS_DELIVERED'].includes(b.status)
    }
    if (filter === 'completed') {
      return ['ACCEPTED', 'COMPLETED'].includes(b.status)
    }
    return true
  })

  // Action status updates
  const handleUpdateStatus = (id: string, newStatus: PersistentBooking['status']) => {
    const updated = updateBookingStatus(id, newStatus)
    if (updated) {
      loadData()
    }
  }

  const upcomingCount = bookings.filter((b) =>
    ['CONFIRMED', 'PHOTOGRAPHER_ARRIVED', 'SHOOTING'].includes(b.status)
  ).length
  const deliveringCount = bookings.filter((b) => ['EDITING', 'PHOTOS_DELIVERED'].includes(b.status)).length
  const completedCount = bookings.filter((b) => ['ACCEPTED', 'COMPLETED'].includes(b.status)).length

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý Buổi Chụp & Bàn Giao File
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cập nhật trạng thái buổi chụp thực tế và quản lý giao ảnh đám mây cho khách
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: `Tất cả (${bookings.length})` },
            { id: 'upcoming', label: `Sắp diễn ra (${upcomingCount})` },
            { id: 'delivering', label: `Đang bàn giao (${deliveringCount})` },
            { id: 'completed', label: `Hoàn tất (${completedCount})` },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === item.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State when no bookings exist (như 1 web mới) */}
      {isLoaded && filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 md:p-14 border border-slate-200 text-center shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1.5">
            {filter === 'all' ? 'Chưa có đơn chụp nào' : 'Không có buổi chụp trong mục này'}
          </h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed max-w-sm mx-auto">
            {filter === 'all'
              ? 'Khi khách hàng đặt lịch với bạn qua FLASHY, thông tin đơn, ngày giờ, địa điểm và trạng thái cọc sẽ tự động hiển thị tại đây.'
              : 'Hiện không có đơn hàng nào thuộc trạng thái này.'}
          </p>
          <Link href="/photographer/dashboard">
            <Button variant="outline" className="rounded-xl font-bold text-xs h-10 px-6">
              Về bảng điều khiển Studio
            </Button>
          </Link>
        </div>
      ) : (
        /* Bookings List Cards */
        <div className="space-y-4">
          {filtered.map((b) => (
            <Card
              key={b.id}
              className="rounded-3xl border-slate-200 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                      <Image
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
                        alt={b.customer_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{b.customer_name}</h3>
                        <span className="font-mono text-[10px] text-slate-400">#{b.booking_number}</span>
                      </div>
                      <p className="text-xs text-violet-700 font-bold mt-0.5">Gói {b.package_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${b.status_color}`}>
                      {b.status_label}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>
                      {b.shooting_time} • {b.shooting_date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{b.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      Tổng: {formatVND(b.total_amount)} (Cọc: {formatVND(b.deposit_amount)})
                    </span>
                  </div>
                </div>

                {/* Selected Addons preview */}
                {b.selected_addons && b.selected_addons.length > 0 && (
                  <div className="pb-3 text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-700">Dịch vụ cộng thêm:</span>
                    {b.selected_addons.map((ad) => (
                      <span key={ad.id} className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 font-medium">
                        {ad.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Controls & Stepper */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Step 1: Arrived */}
                    {b.status === 'CONFIRMED' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(b.id, 'PHOTOGRAPHER_ARRIVED')}
                        className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold h-9"
                      >
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        Check-in đã đến nơi
                      </Button>
                    )}

                    {/* Step 2: Start shoot */}
                    {b.status === 'PHOTOGRAPHER_ARRIVED' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(b.id, 'SHOOTING')}
                        className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold h-9"
                      >
                        <PlayCircle className="w-3.5 h-3.5 mr-1" />
                        Bắt đầu buổi chụp
                      </Button>
                    )}

                    {/* Step 3: Start editing */}
                    {b.status === 'SHOOTING' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(b.id, 'EDITING')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold h-9"
                      >
                        <Palette className="w-3.5 h-3.5 mr-1" />
                        Hoàn tất chụp & Bắt đầu chỉnh màu
                      </Button>
                    )}

                    {/* Step 4: Deliver photos */}
                    {b.status === 'EDITING' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(b.id, 'PHOTOS_DELIVERED')}
                        className="bg-brand text-white hover:opacity-90 rounded-xl text-xs font-bold h-9 shadow-sm"
                      >
                        <UploadCloud className="w-3.5 h-3.5 mr-1" />
                        Bàn giao ảnh đám mây (Bật hẹn giờ 48h)
                      </Button>
                    )}

                    {b.status === 'PHOTOS_DELIVERED' && (
                      <div className="text-[11px] text-violet-700 font-bold bg-violet-50 px-3 py-1.5 rounded-xl border border-violet-200">
                        ⏳ Đang trong cửa sổ 48h khách kiểm duyệt
                      </div>
                    )}

                    {['ACCEPTED', 'COMPLETED'].includes(b.status) && (
                      <div className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Khách đã nghiệm thu • Đã ghi nhận thù lao
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/photographer/messages?bookingId=${b.id}`}>
                      <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold h-9">
                        <MessageCircle className="w-3.5 h-3.5 mr-1" />
                        Nhắn tin
                      </Button>
                    </Link>
                    <Link href={`/photographer/bookings/${b.id}`}>
                      <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold h-9">
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Chi tiết đơn
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
