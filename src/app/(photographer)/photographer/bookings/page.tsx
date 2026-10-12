'use client'

import { useState } from 'react'
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
  AlertCircle
} from 'lucide-react'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PhotographerBookingsManagementPage() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'delivering' | 'completed'>('all')

  const [bookings, setBookings] = useState([
    {
      id: 'BK-892104',
      customer_name: 'Nguyễn Thu Trang',
      customer_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      package_name: 'Vibe Sài Gòn',
      shooting_date: '15/04/2026',
      shooting_time: '15:30',
      location: 'Bến Bạch Đằng & Bưu điện Q.1',
      total_amount: 550000,
      status: 'CONFIRMED',
      status_label: 'Sắp diễn ra',
      status_color: 'bg-emerald-50 text-emerald-700',
    },
    {
      id: 'BK-781923',
      customer_name: 'Trần Minh Hoàng',
      customer_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      package_name: 'Quick Date',
      shooting_date: '10/04/2026',
      shooting_time: '09:00',
      location: 'Hồ Con Rùa, Quận 3',
      total_amount: 220000,
      status: 'PHOTOS_DELIVERED',
      status_label: 'Đã giao ảnh • Đang duyệt 48h',
      status_color: 'bg-violet-50 text-violet-700',
    },
    {
      id: 'BK-651209',
      customer_name: 'Võ Mai Anh',
      customer_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
      package_name: 'Outdoor / Dã ngoại',
      shooting_date: '20/03/2026',
      shooting_time: '14:00',
      location: 'Công viên Landmark 81, Bình Thạnh',
      total_amount: 1100000,
      status: 'COMPLETED',
      status_label: 'Hoàn tất & Đã giải ngân',
      status_color: 'bg-slate-100 text-slate-700',
    }
  ])

  const filtered = bookings.filter(b => {
    if (filter === 'upcoming') return b.status === 'CONFIRMED'
    if (filter === 'delivering') return b.status === 'PHOTOS_DELIVERED'
    if (filter === 'completed') return b.status === 'COMPLETED'
    return true
  })

  // Action status updates
  const handleUpdateStatus = (id: string, newStatus: string, label: string) => {
    setBookings(bookings.map(b => {
      if (b.id === id) {
        return { ...b, status: newStatus, status_label: label }
      }
      return b
    }))
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
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
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'Tất cả đơn' },
            { id: 'upcoming', label: 'Sắp chụp' },
            { id: 'delivering', label: 'Đang duyệt 48h' },
            { id: 'completed', label: 'Đã hoàn tất' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === tab.id
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filtered.map((b) => (
          <Card key={b.id} className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                  <Image src={b.customer_avatar} alt={b.customer_name} fill className="object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{b.customer_name}</h3>
                    <span className="font-mono text-xs text-slate-400">#{b.id}</span>
                  </div>
                  <p className="text-xs text-violet-600 font-semibold">{b.package_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${b.status_color}`}>
                  {b.status_label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 text-xs text-slate-600 border-b border-slate-100">
              <div>
                <span className="text-slate-400 block mb-0.5">Thời gian hẹn:</span>
                <strong className="text-slate-900">{b.shooting_time} • {b.shooting_date}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Địa điểm:</span>
                <strong className="text-slate-900 truncate block">{b.location}</strong>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Giá trị đơn / Thù lao:</span>
                <strong className="text-slate-900">{formatVND(b.total_amount)}</strong>
              </div>
            </div>

            {/* Workflow Progress Actions */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {b.status === 'CONFIRMED' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(b.id, 'PHOTOGRAPHER_ARRIVED', 'Đã đến điểm hẹn')}
                      variant="outline"
                      className="rounded-xl text-xs font-semibold h-9"
                    >
                      📍 Đã đến điểm hẹn
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(b.id, 'SHOOTING', 'Đang thực hiện buổi chụp')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold h-9"
                    >
                      📸 Bắt đầu chụp
                    </Button>
                  </>
                )}

                <Link href={`/photographer/bookings/${b.id}/delivery`}>
                  <Button size="sm" className="bg-brand hover:opacity-90 text-white rounded-xl text-xs font-bold h-9">
                    <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                    Tải ảnh bàn giao (Upload)
                  </Button>
                </Link>
              </div>

              <Link href="/customer/messages">
                <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold h-9">
                  <MessageCircle className="w-3.5 h-3.5 mr-1" />
                  Chat với khách
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
