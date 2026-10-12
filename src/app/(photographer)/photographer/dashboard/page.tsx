'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Camera,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Star,
  Sparkles,
  Zap,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  UploadCloud,
  MessageCircle,
  Award
} from 'lucide-react'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PhotographerDashboardPage() {
  const [readyToWork, setReadyToWork] = useState(true)

  const stats = {
    gross_earnings: 14850000,
    platform_commission: 890000,
    net_earnings: 13960000,
    pending_settlement: 2450000,
    available_withdrawable: 11510000,
    total_completed: 48,
    average_rating: 4.95,
  }

  const upcomingShoots = [
    {
      id: 'BK-892104',
      customer_name: 'Nguyễn Thu Trang',
      package: 'Vibe Sài Gòn',
      date: '15/04/2026',
      time: '15:30',
      location: 'Bến Bạch Đằng & Bưu điện Q.1',
      total: 550000,
      status: 'CONFIRMED',
      status_label: 'Sắp diễn ra',
      status_color: 'bg-emerald-50 text-emerald-700',
    },
    {
      id: 'BK-781923',
      customer_name: 'Trần Minh Hoàng',
      package: 'Quick Date',
      date: '10/04/2026',
      time: '09:00',
      location: 'Hồ Con Rùa, Quận 3',
      total: 220000,
      status: 'PHOTOS_DELIVERED',
      status_label: 'Đang chờ khách duyệt 48h',
      status_color: 'bg-violet-50 text-violet-700',
    }
  ]

  return (
    <div className="p-6 md:p-8 space-y-8">
      
      {/* Top Banner: Verification Status & Ready-To-Work Toggle */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
            <Image
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
              alt="Avatar"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">Studio Minh Trí (TriStreet)</h1>
              <Badge variant="verified">Đã xác minh KYC</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Đánh giá ⭐ 4.95 (142 đánh giá) • Hoàn thành 48 đơn hàng
            </p>
          </div>
        </div>

        {/* Ready to work toggle */}
        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 self-start md:self-auto">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-900 block">Trạng thái nhận lịch</span>
            <span className="text-[11px] text-emerald-600 font-semibold">
              {readyToWork ? 'Đang bật: Sẵn sàng nhận đơn' : 'Đang tắt: Tạm nghỉ'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setReadyToWork(!readyToWork)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
              readyToWork ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                readyToWork ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng doanh thu</span>
            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">
            {formatVND(stats.gross_earnings)}
          </div>
          <p className="text-[11px] text-slate-400">48 đơn hoàn tất</p>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Số dư khả dụng</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mb-1">
            {formatVND(stats.available_withdrawable)}
          </div>
          <Link href="/photographer/withdrawals" className="text-[11px] text-violet-600 font-bold hover:underline">
            Rút tiền về ngân hàng →
          </Link>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đang chờ duyệt 48h</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mb-1">
            {formatVND(stats.pending_settlement)}
          </div>
          <p className="text-[11px] text-slate-400">Khách đang xem & duyệt ảnh</p>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hoa hồng FLASHY</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-700 mb-1">
            {formatVND(stats.platform_commission)}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">Ưu đãi trung bình chỉ 6.0%</p>
        </Card>
      </div>

      {/* Active Projects & Shoots */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-black text-slate-900">Buổi Chụp Cần Xử Lý</h2>
            <p className="text-xs text-slate-500">Bấm để tải ảnh bàn giao hoặc kiểm tra tin nhắn khách hàng</p>
          </div>
          <Link href="/photographer/bookings" className="text-xs font-bold text-violet-600 hover:underline">
            Xem tất cả đơn chụp →
          </Link>
        </div>

        <div className="space-y-4">
          {upcomingShoots.map((shoot) => (
            <div
              key={shoot.id}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{shoot.customer_name}</span>
                  <span className="text-[11px] text-violet-600 font-semibold bg-violet-100/60 px-2 py-0.5 rounded">
                    {shoot.package}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">#{shoot.id}</span>
                </div>
                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {shoot.time} • {shoot.date} • {shoot.location}
                </p>
                <p className="text-xs font-bold text-slate-900">
                  Thù lao buổi chụp: {formatVND(shoot.total)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/photographer/bookings/${shoot.id}/delivery`}>
                  <Button size="sm" className="bg-brand hover:opacity-90 text-white rounded-xl text-xs font-bold h-9">
                    <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                    Tải ảnh bàn giao
                  </Button>
                </Link>
                <Link href="/customer/messages">
                  <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold h-9">
                    <MessageCircle className="w-3.5 h-3.5 mr-1" />
                    Chat
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gamification / Star of the Quarter Widget */}
      <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-900 rounded-3xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Award className="w-4 h-4" />
            Huy Chương Star of the Quarter (Quý 1/2026)
          </div>
          <h3 className="text-xl md:text-2xl font-black mb-2">
            Chúc mừng bạn đã đạt tiêu chuẩn Star Q1!
          </h3>
          <p className="text-xs text-violet-200 max-w-xl leading-relaxed">
            Điều kiện: Hoàn tất tối thiểu 30 đơn & Rating &ge; 4.8. Bạn đã đạt <strong>48 đơn</strong> và <strong>4.95 ⭐</strong>. Bạn nhận được phần thưởng <strong>10 đơn chụp tiếp theo với 0% hoa hồng nền tảng</strong>!
          </p>
        </div>
        <Link href="/photographer/achievements">
          <Button className="bg-amber-400 text-slate-950 hover:bg-amber-300 font-black rounded-xl text-xs h-11 px-6 shadow-md flex-shrink-0">
            Xem bảng xếp hạng & Quà
          </Button>
        </Link>
      </div>

    </div>
  )
}
