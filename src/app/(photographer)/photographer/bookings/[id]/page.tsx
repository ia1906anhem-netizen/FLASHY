'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  Clock,
  MapPin,
  Camera,
  DollarSign,
  ChevronLeft,
  ShieldCheck,
  Star,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
  UploadCloud,
  Check,
  Send,
  Navigation
} from 'lucide-react'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PhotographerBookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = (params?.id as string) || 'BK-892104'

  // Booking state simulation with status transitions
  const [currentStatus, setCurrentStatus] = useState<
    'CONFIRMED' | 'PHOTOGRAPHER_ARRIVED' | 'SHOOTING' | 'EDITING' | 'PHOTOS_DELIVERED' | 'COMPLETED'
  >('CONFIRMED')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const booking = {
    id: bookingId,
    customer: {
      name: 'Nguyễn Thu Trang',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
      phone_masked: '098 •••• 124',
      email_masked: 't••••g@gmail.com',
      tier: 'Creator (350 Coins)',
    },
    package: {
      name: 'Vibe Sài Gòn',
      category: 'Street & Lifestyle',
      duration: '2 - 3 giờ',
      deliverables: '35 - 40 ảnh chỉnh màu + 10 ảnh retouch nâng cao',
      base_price: 550000,
    },
    addons: [
      { name: 'Makeup nhẹ tự nhiên', price: 150000 },
    ],
    total_price: 700000,
    commission_rate: 0.06, // 6%
    net_earnings: 658000,
    date: '15/04/2026',
    time: '15:30 - 18:00',
    location: 'Bến Bạch Đằng & Bưu điện Q.1, TP. Hồ Chí Minh',
    concept_notes: 'Trang phục tone be/trắng, chụp ngoại cảnh chiều hoàng hôn, phong cách điện ảnh Hong Kong cổ điển nhẹ nhàng.',
    status_history: [
      { status: 'Tạo đơn đặt lịch', time: '12/04 09:30', actor: 'Khách hàng' },
      { status: 'Thanh toán Escrow qua MoMo', time: '12/04 09:35', actor: 'Hệ thống' },
      { status: 'Thợ ảnh nhận lịch', time: '12/04 10:00', actor: 'Nhiếp ảnh gia' },
    ],
  }

  const timelineSteps = [
    { key: 'CONFIRMED', label: 'Đã nhận lịch', desc: 'Sẵn sàng khởi hành' },
    { key: 'PHOTOGRAPHER_ARRIVED', label: 'Đã đến điểm hẹn', desc: 'Có mặt tại vị trí' },
    { key: 'SHOOTING', label: 'Đang chụp', desc: 'Bấm máy cùng khách' },
    { key: 'EDITING', label: 'Đang hậu kỳ', desc: 'Lọc ảnh & chỉnh màu' },
    { key: 'PHOTOS_DELIVERED', label: 'Đã bàn giao ảnh', desc: 'Gửi link đám mây' },
    { key: 'COMPLETED', label: 'Hoàn tất', desc: 'Giải ngân nhuận bút' },
  ]

  const getCurrentStepIndex = () => {
    return timelineSteps.findIndex((s) => s.key === currentStatus)
  }

  const advanceStatus = (nextStatus: typeof currentStatus, message: string) => {
    setCurrentStatus(nextStatus)
    setStatusMessage(message)
    setTimeout(() => setStatusMessage(null), 3000)
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/photographer/bookings"
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Chi tiết đơn {booking.id}</h1>
              <Badge className="bg-violet-100 text-violet-800 border-violet-200">
                {booking.package.name}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Thời gian hẹn: {booking.date} lúc {booking.time}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/photographer/messages">
            <Button variant="outline" size="sm" className="gap-2 text-slate-700">
              <MessageCircle className="h-4 w-4 text-violet-600" />
              Nhắn tin với khách
            </Button>
          </Link>
          <Link href={`/photographer/bookings/${booking.id}/delivery`}>
            <Button size="sm" className="gap-2 bg-violet-600 hover:bg-violet-700 text-white">
              <UploadCloud className="h-4 w-4" />
              Tải ảnh bàn giao
            </Button>
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Status Progress Bar */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Tiến độ buổi chụp ảnh</h2>
            <span className="text-xs text-violet-600 font-medium">
              Trạng thái hiện tại: {timelineSteps.find((s) => s.key === currentStatus)?.label}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {timelineSteps.map((step, idx) => {
              const currentIdx = getCurrentStepIndex()
              const isPast = idx < currentIdx
              const isCurrent = idx === currentIdx
              return (
                <div
                  key={step.key}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-violet-50 border-violet-300 shadow-sm'
                      : isPast
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${
                      isCurrent
                        ? 'bg-violet-600 text-white'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPast ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                  </div>
                  <p className="text-xs font-semibold text-slate-800 line-clamp-1">{step.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{step.desc}</p>
                </div>
              )
            })}
          </div>

          {/* Action Buttons for State Transitions */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Cập nhật trạng thái tức thì giúp khách hàng theo dõi vị trí và tiến trình buổi chụp.
            </p>
            <div className="flex items-center gap-2">
              {currentStatus === 'CONFIRMED' && (
                <Button
                  onClick={() =>
                    advanceStatus('PHOTOGRAPHER_ARRIVED', 'Đã cập nhật: Bạn đã đến điểm hẹn!')
                  }
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  Báo: Tôi đã đến điểm hẹn
                </Button>
              )}
              {currentStatus === 'PHOTOGRAPHER_ARRIVED' && (
                <Button
                  onClick={() => advanceStatus('SHOOTING', 'Đã bắt đầu bấm máy buổi chụp!')}
                  className="bg-violet-600 hover:bg-violet-700 text-white text-xs gap-1.5"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Bắt đầu buổi chụp (Bấm máy)
                </Button>
              )}
              {currentStatus === 'SHOOTING' && (
                <Button
                  onClick={() =>
                    advanceStatus('EDITING', 'Buổi chụp hoàn tất, chuyển sang giai đoạn hậu kỳ!')
                  }
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Kết thúc chụp, bắt đầu hậu kỳ
                </Button>
              )}
              {currentStatus === 'EDITING' && (
                <Link href={`/photographer/bookings/${booking.id}/delivery`}>
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white text-xs gap-1.5">
                    <UploadCloud className="h-3.5 w-3.5" />
                    Chuyển đến trang tải ảnh bàn giao
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Location Info */}
          <Card className="border-slate-200">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Thông tin khách hàng & Điểm hẹn</h3>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-200">
                    <Image
                      src={booking.customer.avatar}
                      alt={booking.customer.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{booking.customer.name}</h4>
                    <p className="text-xs text-slate-500">Hạng: {booking.customer.tier}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">SĐT: {booking.customer.phone_masked}</p>
                  </div>
                </div>

                <Link href="/photographer/messages">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    <MessageCircle className="h-3.5 w-3.5 text-violet-600" />
                    Trò chuyện
                  </Button>
                </Link>
              </div>

              <div className="p-3.5 rounded-xl bg-violet-50/50 border border-violet-100 text-xs space-y-1.5">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-violet-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">Địa điểm hẹn: </span>
                    <span className="text-slate-700">{booking.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-6 text-slate-500">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Thời gian: {booking.date} | {booking.time}</span>
                </div>
              </div>

              {booking.concept_notes && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <p className="font-semibold text-slate-800 mb-1">Ghi chú ý tưởng & Concept:</p>
                  <p className="text-slate-600 leading-relaxed">{booking.concept_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deliverables details */}
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Quy chuẩn bàn giao sản phẩm</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                  <span className="text-slate-600">Gói chụp lựa chọn:</span>
                  <span className="font-semibold text-slate-900">{booking.package.name} ({booking.package.duration})</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                  <span className="text-slate-600">Số lượng ảnh cam kết:</span>
                  <span className="font-semibold text-slate-900">{booking.package.deliverables}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                  <span className="text-slate-600">Hạn chót trả ảnh dự kiến:</span>
                  <span className="font-semibold text-violet-700">Trong vòng 48h sau buổi chụp</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Earnings & Escrow Breakdown */}
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Chi tiết thu nhập & Escrow</h3>

              <div className="space-y-2.5 text-xs pb-4 border-b border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>Giá gói chụp ({booking.package.name})</span>
                  <span>{formatVND(booking.package.base_price)}</span>
                </div>
                {booking.addons.map((ad, i) => (
                  <div key={i} className="flex justify-between text-slate-600">
                    <span>{ad.name}</span>
                    <span>{formatVND(ad.price)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold text-slate-900 pt-1">
                  <span>Tổng giá trị đơn</span>
                  <span>{formatVND(booking.total_price)}</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs py-4 border-b border-slate-100">
                <div className="flex justify-between text-slate-500">
                  <span>Phí sàn Flashy (6%)</span>
                  <span className="text-rose-600">-{formatVND(booking.total_price * booking.commission_rate)}</span>
                </div>
                <div className="flex justify-between items-center pt-1 font-bold text-sm text-emerald-600">
                  <span>Thực nhận (Net payout):</span>
                  <span>{formatVND(booking.net_earnings)}</span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  Bảo chứng ký quỹ Escrow
                </div>
                <p>
                  Tiền đã được khách thanh toán và giữ an toàn tại tài khoản bảo chứng. Sau khi bàn giao ảnh 48 giờ và khách không khiếu nại, tiền sẽ tự động chuyển vào số dư ví của bạn.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
