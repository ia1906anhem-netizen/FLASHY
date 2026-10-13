'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  Clock,
  MapPin,
  Camera,
  Coins,
  ChevronRight,
  ShieldCheck,
  Star,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Filter,
  RefreshCw
} from 'lucide-react'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getStoredBookings, PersistentBooking } from '@/lib/data/booking-store'

export default function CustomerBookingsPage() {
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'review' | 'completed'>('all')
  const [bookings, setBookings] = useState<PersistentBooking[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const loadBookings = () => {
    const list = getStoredBookings()
    setBookings(list)
    setIsLoaded(true)
  }

  useEffect(() => {
    loadBookings()
    const handleUpdate = () => loadBookings()
    window.addEventListener('flashy_bookings_updated', handleUpdate)
    return () => window.removeEventListener('flashy_bookings_updated', handleUpdate)
  }, [])

  const filtered = bookings.filter((b) => {
    if (filterTab === 'active') {
      return ['CONFIRMED', 'PHOTOGRAPHER_ARRIVED', 'SHOOTING', 'EDITING'].includes(b.status)
    }
    if (filterTab === 'review') {
      return b.status === 'PHOTOS_DELIVERED'
    }
    if (filterTab === 'completed') {
      return ['ACCEPTED', 'COMPLETED'].includes(b.status)
    }
    return true
  })

  const activeCount = bookings.filter((b) =>
    ['CONFIRMED', 'PHOTOGRAPHER_ARRIVED', 'SHOOTING', 'EDITING'].includes(b.status)
  ).length
  const reviewCount = bookings.filter((b) => b.status === 'PHOTOS_DELIVERED').length
  const completedCount = bookings.filter((b) => ['ACCEPTED', 'COMPLETED'].includes(b.status)).length

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Quản Lý Lịch Hẹn Chụp Ảnh
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Toàn bộ lịch sử đặt lịch và tình trạng giải ngân ký quỹ Escrow
            </p>
          </div>

          <Link href="/photographers">
            <Button size="sm" className="bg-brand text-white rounded-xl font-bold text-xs h-10 shadow-md">
              <Camera className="w-3.5 h-3.5 mr-1.5" />
              Đặt lịch buổi chụp mới
            </Button>
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {[
            { id: 'all', label: `Tất cả (${bookings.length})` },
            { id: 'active', label: `Sắp diễn ra (${activeCount})` },
            { id: 'review', label: `Chờ duyệt ảnh 48h (${reviewCount})` },
            { id: 'completed', label: `Đã hoàn tất (${completedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterTab === tab.id
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Empty State when no bookings exist (như 1 web mới) */}
        {isLoaded && filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 md:p-14 border border-slate-200 text-center shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1.5">
              {filterTab === 'all'
                ? 'Bạn chưa có lịch hẹn chụp ảnh nào'
                : 'Không có buổi chụp trong mục này'}
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed max-w-sm mx-auto">
              {filterTab === 'all'
                ? 'Hãy tìm kiếm những thợ ảnh tài năng tại TP.HCM, chọn phong cách yêu thích và đặt lịch trải nghiệm ngay hôm nay!'
                : 'Hiện tại bạn không có lịch hẹn nào thuộc trạng thái này.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <Link href="/photographers">
                <Button className="bg-brand text-white hover:opacity-90 rounded-xl font-bold text-xs h-11 px-6 shadow-md">
                  <Camera className="w-4 h-4 mr-2" />
                  Khám phá thợ ảnh & Đặt lịch ngay
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Bookings List */
          <div className="space-y-4">
            {filtered.map((b) => (
              <Card
                key={b.id}
                className="rounded-3xl border-slate-200 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                        <Image
                          src={
                            b.photographer_avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                          }
                          alt={b.photographer_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm">{b.photographer_name}</h3>
                          <span className="font-mono text-[10px] text-slate-400">#{b.booking_number}</span>
                        </div>
                        <p className="text-xs text-violet-700 font-semibold mt-0.5">Gói {b.package_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${b.status_color}`}>
                        {b.status_label}
                      </span>
                    </div>
                  </div>

                  {/* Middle Info Grid */}
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
                      <Coins className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>Tổng: {formatVND(b.total_amount)} (Cọc: {formatVND(b.deposit_amount)})</span>
                    </div>
                  </div>

                  {/* Selected Addons preview */}
                  {b.selected_addons && b.selected_addons.length > 0 && (
                    <div className="pb-3 text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-700">Dịch vụ thêm:</span>
                      {b.selected_addons.map((ad) => (
                        <span key={ad.id} className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 font-medium">
                          {ad.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 48-Hour Review Alert Box if delivered */}
                  {b.status === 'PHOTOS_DELIVERED' && (
                    <div className="p-3.5 mb-4 rounded-2xl bg-violet-50 border border-violet-200 text-violet-900 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-violet-600 flex-shrink-0" />
                        <span>Ảnh đã sẵn sàng! Đang trong thời hạn kiểm duyệt 48 giờ để nhận xét hoặc chọn retouch.</span>
                      </div>
                      <Link href={`/customer/bookings/${b.id}/gallery`}>
                        <Button size="sm" className="bg-violet-600 text-white rounded-xl text-xs font-bold h-8">
                          Duyệt ảnh
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Bottom Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tiền cọc được bảo vệ bởi Escrow FLASHY</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/customer/messages?photographer=${b.photographer_id}&bookingId=${b.id}`}>
                        <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold h-9">
                          <MessageCircle className="w-3.5 h-3.5 mr-1" />
                          Chat
                        </Button>
                      </Link>

                      {b.status === 'PHOTOS_DELIVERED' ? (
                        <Link href={`/customer/bookings/${b.id}/gallery`}>
                          <Button size="sm" className="bg-brand text-white rounded-xl text-xs font-bold h-9 shadow-sm">
                            <ImageIcon className="w-3.5 h-3.5 mr-1" />
                            Xem & Tải ảnh
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/customer/bookings/${b.id}`}>
                          <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold h-9">
                            Chi tiết
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
