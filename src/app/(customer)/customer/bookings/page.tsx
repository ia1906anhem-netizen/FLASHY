'use client'

import { useState } from 'react'
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
  Filter
} from 'lucide-react'
import { DEMO_PHOTOGRAPHERS } from '@/lib/data/mock-data'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function CustomerBookingsPage() {
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'review' | 'completed'>('all')

  const bookings = [
    {
      id: 'BK-892104',
      photographer: DEMO_PHOTOGRAPHERS[0],
      package_name: 'Vibe Sài Gòn',
      shooting_date: '15/04/2026',
      shooting_time: '15:30',
      location: 'Bến Bạch Đằng & Bưu điện Q.1',
      total_amount: 550000,
      deposit_paid: 165000,
      status: 'CONFIRMED',
      status_label: 'Đã xác nhận • Sắp chụp',
      status_color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'BK-781923',
      photographer: DEMO_PHOTOGRAPHERS[1],
      package_name: 'Quick Date',
      shooting_date: '10/04/2026',
      shooting_time: '09:00',
      location: 'Hồ Con Rùa, Quận 3',
      total_amount: 220000,
      deposit_paid: 66000,
      status: 'PHOTOS_DELIVERED',
      status_label: 'Đã giao ảnh • Đang duyệt 48h',
      status_color: 'bg-violet-50 text-violet-700 border-violet-200',
    },
    {
      id: 'BK-651209',
      photographer: DEMO_PHOTOGRAPHERS[2],
      package_name: 'Outdoor / Dã ngoại',
      shooting_date: '20/03/2026',
      shooting_time: '14:00',
      location: 'Công viên Landmark 81, Bình Thạnh',
      total_amount: 1100000,
      deposit_paid: 330000,
      status: 'COMPLETED',
      status_label: 'Hoàn tất • Đã nghiệm thu',
      status_color: 'bg-slate-100 text-slate-700 border-slate-200',
    }
  ]

  const filtered = bookings.filter(b => {
    if (filterTab === 'active') return b.status === 'CONFIRMED'
    if (filterTab === 'review') return b.status === 'PHOTOS_DELIVERED'
    if (filterTab === 'completed') return b.status === 'COMPLETED'
    return true
  })

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
            { id: 'active', label: 'Sắp diễn ra (1)' },
            { id: 'review', label: 'Chờ duyệt ảnh 48h (1)' },
            { id: 'completed', label: 'Đã hoàn tất (1)' },
          ].map(tab => (
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

        {/* Bookings List */}
        <div className="space-y-4">
          {filtered.map((b) => (
            <Card key={b.id} className="rounded-3xl border-slate-200 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                      <Image
                        src={b.photographer.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={b.photographer.display_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{b.photographer.display_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">#{b.id}</span>
                      </div>
                      <p className="text-xs text-violet-600 font-semibold">{b.package_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${b.status_color}`}>
                      {b.status_label}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 text-xs text-slate-600 border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Thời gian chụp:</span>
                    <strong className="text-slate-900">{b.shooting_time} • {b.shooting_date}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Địa điểm:</span>
                    <strong className="text-slate-900 truncate block">{b.location}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Tổng thanh toán / Cọc:</span>
                    <strong className="text-slate-900">{formatVND(b.total_amount)}</strong>{' '}
                    <span className="text-emerald-600 font-semibold">(Cọc: {formatVND(b.deposit_paid)})</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-violet-600" />
                    Ký quỹ Escrow bảo vệ 48h
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/customer/bookings/${b.id}`}>
                      <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold h-9">
                        Xem tiến độ
                      </Button>
                    </Link>

                    {b.status === 'PHOTOS_DELIVERED' && (
                      <Link href={`/customer/bookings/${b.id}/gallery`}>
                        <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold h-9">
                          <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
                          Xem & Duyệt ảnh (48h)
                        </Button>
                      </Link>
                    )}

                    <Link href={`/customer/messages`}>
                      <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold h-9">
                        <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                        Nhắn tin
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  )
}
