'use client'

import { useState, useEffect } from 'react'
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
  Navigation,
  PlayCircle,
  Palette
} from 'lucide-react'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getBookingById, updateBookingStatus, getStoredBookings, PersistentBooking } from '@/lib/data/booking-store'
import { calculateFullBookingCommission } from '@/lib/utils/commission'

export default function PhotographerBookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = (params?.id as string) || 'BK-892104'

  const [booking, setBooking] = useState<PersistentBooking | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [completedCount, setCompletedCount] = useState(0)

  useEffect(() => {
    if (bookingId) {
      const found = getBookingById(bookingId)
      setBooking(found)
      const allBookings = getStoredBookings()
      const count = allBookings.filter((b) => ['ACCEPTED', 'COMPLETED'].includes(b.status)).length
      setCompletedCount(count)
      setIsLoaded(true)
    }
  }, [bookingId])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
          <Camera className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Không tìm thấy đơn chụp #{bookingId}</h2>
        <p className="text-xs text-slate-500 max-w-sm mb-6">
          Đơn đặt chụp này không tồn tại hoặc đã bị xóa khỏi hệ thống. Vui lòng kiểm tra lại danh sách đơn chụp của bạn.
        </p>
        <Link href="/photographer/bookings">
          <Button className="bg-brand text-white rounded-xl text-xs font-bold h-10 px-6">
            Quay lại danh sách đơn chụp
          </Button>
        </Link>
      </div>
    )
  }

  // Calculate commission breakdown with special add-on rates (Makeup 10%, Outfit 10-12%)
  const commissionBreakdown = calculateFullBookingCommission({
    packageSlug: booking.package_slug,
    packageAmountVnd: booking.package_price,
    photographerCompletedCount: completedCount,
    addons: (booking.selected_addons || []).map((a) => ({
      name: a.name,
      amountVnd: a.price,
    })),
  })

  const timelineSteps = [
    { key: 'CONFIRMED', label: 'Đã nhận lịch', desc: 'Sẵn sàng khởi hành' },
    { key: 'PHOTOGRAPHER_ARRIVED', label: 'Đã đến điểm hẹn', desc: 'Có mặt tại vị trí' },
    { key: 'SHOOTING', label: 'Đang chụp', desc: 'Bấm máy cùng khách' },
    { key: 'EDITING', label: 'Đang hậu kỳ', desc: 'Lọc ảnh & chỉnh màu' },
    { key: 'PHOTOS_DELIVERED', label: 'Đã bàn giao ảnh', desc: 'Gửi link đám mây' },
    { key: 'COMPLETED', label: 'Hoàn tất', desc: 'Giải ngân nhuận bút' },
  ]

  const getCurrentStepIndex = () => {
    return timelineSteps.findIndex((s) => s.key === booking.status)
  }

  const advanceStatus = (nextStatus: PersistentBooking['status'], message: string) => {
    const updated = updateBookingStatus(booking.id, nextStatus)
    if (updated) {
      setBooking(updated)
      setStatusMessage(message)
      setTimeout(() => setStatusMessage(null), 3000)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6 md:p-8">
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
              <h1 className="text-xl font-bold text-slate-900">Chi tiết đơn #{booking.booking_number}</h1>
              <Badge className="bg-violet-100 text-violet-800 border-violet-200">
                Gói {booking.package_name}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Thời gian hẹn: {booking.shooting_date} lúc {booking.shooting_time}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href={`/photographer/messages?bookingId=${booking.id}`}>
            <Button variant="outline" size="sm" className="gap-2 text-slate-700 rounded-xl text-xs font-bold h-9">
              <MessageCircle className="h-4 w-4 text-violet-600" />
              Nhắn tin với khách
            </Button>
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Status Progress Bar */}
      <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900">Tiến độ buổi chụp ảnh thực tế</h2>
          <span className="text-xs text-violet-700 font-bold bg-violet-50 px-2.5 py-1 rounded-full border border-violet-200">
            {booking.status_label}
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
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isCurrent
                    ? 'border-violet-600 bg-violet-50 text-violet-900 shadow-xs ring-2 ring-violet-500/20'
                    : isPast
                    ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
                    : 'border-slate-200 bg-slate-50/50 text-slate-400'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full mx-auto mb-1.5 flex items-center justify-center text-xs font-bold ${
                    isPast
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isPast ? '✓' : idx + 1}
                </div>
                <div className="text-xs font-bold leading-tight">{step.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{step.desc}</div>
              </div>
            )
          })}
        </div>

        {/* Quick Action Progression Controls */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Bấm chuyển bước để thông báo tức thời cho khách hàng qua ứng dụng:
          </div>

          <div className="flex flex-wrap gap-2">
            {booking.status === 'CONFIRMED' && (
              <Button
                size="sm"
                onClick={() => advanceStatus('PHOTOGRAPHER_ARRIVED', 'Đã check-in điểm hẹn thành công!')}
                className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold h-9"
              >
                <Navigation className="h-3.5 w-3.5 mr-1" />
                Tôi đã đến điểm hẹn
              </Button>
            )}

            {booking.status === 'PHOTOGRAPHER_ARRIVED' && (
              <Button
                size="sm"
                onClick={() => advanceStatus('SHOOTING', 'Đã bắt đầu bấm máy cùng khách hàng!')}
                className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold h-9"
              >
                <PlayCircle className="h-3.5 w-3.5 mr-1" />
                Bắt đầu chụp ảnh
              </Button>
            )}

            {booking.status === 'SHOOTING' && (
              <Button
                size="sm"
                onClick={() => advanceStatus('EDITING', 'Buổi chụp kết thúc tốt đẹp. Bắt đầu giai đoạn hậu kỳ!')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold h-9"
              >
                <Palette className="h-3.5 w-3.5 mr-1" />
                Kết thúc chụp & Bắt đầu chỉnh màu
              </Button>
            )}

            {booking.status === 'EDITING' && (
              <Button
                size="sm"
                onClick={() =>
                  advanceStatus(
                    'PHOTOS_DELIVERED',
                    'Đã giao link ảnh đám mây thành công! Cửa sổ 48h kiểm duyệt bắt đầu tính.'
                  )
                }
                className="bg-brand text-white hover:opacity-90 rounded-xl text-xs font-bold h-9 shadow-md"
              >
                <UploadCloud className="h-3.5 w-3.5 mr-1" />
                Bàn giao bộ ảnh (Bật đếm ngược 48h)
              </Button>
            )}

            {booking.status === 'PHOTOS_DELIVERED' && (
              <div className="text-xs text-violet-700 font-bold bg-violet-50 px-3 py-1.5 rounded-xl border border-violet-200">
                ⏳ Đang chờ khách duyệt trong 48h hoặc tự động giải ngân sau 48h
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Customer & Session info */}
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Thông Tin Khách Hàng & Điểm Hẹn
            </h3>

            <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-100">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                <Image
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80"
                  alt={booking.customer_name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{booking.customer_name}</h4>
                <p className="text-xs text-slate-500">Khách hàng FLASHY • Đã thanh toán cọc Escrow</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-violet-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">{booking.location}</span>
                  <span className="text-[11px] text-slate-400">TP. Hồ Chí Minh</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-violet-600 flex-shrink-0" />
                <span>
                  {booking.shooting_date} • Khung giờ: {booking.shooting_time}
                </span>
              </div>

              {booking.concept_notes && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600">
                  <strong className="text-slate-900 block mb-1">Ghi chú concept của khách:</strong>
                  {booking.concept_notes}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Authoritative Earnings Breakdown with New Addon Commissions */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Sổ Cái Thù Lao & Hoa Hồng
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Gói chụp ({booking.package_name}):</span>
                <span className="font-bold text-slate-900">{formatVND(booking.package_price)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pl-2">
                <span>• Phí sàn chụp ({commissionBreakdown.packageRatePercent}%):</span>
                <span>-{formatVND(commissionBreakdown.packageCommissionVnd)}</span>
              </div>

              {/* Addons breakdown */}
              {commissionBreakdown.addonCommissions.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <div className="font-bold text-slate-700">Dịch vụ phụ trợ / Đối tác:</div>
                  {commissionBreakdown.addonCommissions.map((ad, i) => (
                    <div key={i} className="text-[11px] pl-2 space-y-0.5">
                      <div className="flex justify-between text-slate-800">
                        <span>• {ad.name}:</span>
                        <span>+{formatVND(ad.amountVnd)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 text-[10px]">
                        <span>• Phí sàn Add-on (0% - Thợ nhận 100%):</span>
                        <span>0₫</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900 text-sm">
                <span>Tổng đơn đặt:</span>
                <span>{formatVND(booking.total_amount)}</span>
              </div>

              <div className="flex justify-between text-rose-600 font-semibold text-xs">
                <span>Tổng phí hoa hồng sàn:</span>
                <span>-{formatVND(commissionBreakdown.totalPlatformCommissionVnd)}</span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex justify-between items-center text-emerald-900">
                <span className="font-bold text-xs">Thực nhận về ví:</span>
                <span className="font-black text-base text-emerald-700">
                  {formatVND(commissionBreakdown.totalNetPayoutVnd)}
                </span>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 text-[10px] text-slate-400">
              🛡️ Tiền cọc 30% ({formatVND(booking.deposit_amount)}) hiện đang được khóa an toàn tại Quỹ Ký Quỹ Escrow FLASHY.
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
