'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  MapPin,
  ChevronLeft,
  ShieldCheck,
  MessageCircle,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  ThumbsUp,
  Timer,
  Lock,
  Unlock,
  Banknote
} from 'lucide-react'
import { DEMO_PHOTOGRAPHERS } from '@/lib/data/mock-data'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getBookingById, updateBookingStatus, PersistentBooking } from '@/lib/data/booking-store'
import {
  getEscrowRemainingMs,
  formatCountdown,
  getEscrowWindowProgress,
  runEscrowAutoRelease,
  calculateEscrowPayout,
} from '@/lib/utils/escrow-engine'

export default function CustomerBookingDetailPage() {
  const params = useParams()
  const bookingId = params?.id as string

  const [booking, setBooking] = useState<PersistentBooking | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeSent, setDisputeSent] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmSent, setConfirmSent] = useState(false)
  const [remainingMs, setRemainingMs] = useState(0)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isDelivered = booking?.status === 'DELIVERED' || booking?.status === 'PHOTOS_DELIVERED'

  useEffect(() => {
    if (!bookingId) return
    runEscrowAutoRelease()
    const found = getBookingById(bookingId)
    if (found) {
      setBooking(found)
    } else {
      const photographer = DEMO_PHOTOGRAPHERS[0]
      setBooking({
        id: bookingId,
        booking_number: bookingId,
        photographer_id: photographer.id,
        photographer_name: photographer.display_name,
        photographer_avatar: photographer.avatar_url || '',
        photographer_slug: photographer.slug,
        customer_name: 'Khách hàng',
        package_slug: 'flashy-casual',
        package_name: 'FLASHY CASUAL',
        shooting_date: '15/04/2026',
        shooting_time: '15:30',
        duration_minutes: 90,
        location: 'Bến Bạch Đằng & Bưu điện Q.1',
        package_price: 800000,
        addons_total: 100000,
        total_amount: 900000,
        deposit_amount: 270000,
        remaining_amount: 630000,
        payment_method: 'sandbox',
        status: 'PAID_ESCROW',
        status_label: 'Đã thanh toán • Tiền đang giữ Escrow',
        status_color: 'bg-sky-50 text-sky-700 border-sky-200',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        selected_addons: [{ id: 'addon-1', name: 'Trang điểm & Làm tóc nhẹ nhàng', price: 100000 }],
      })
    }
    setIsLoaded(true)
  }, [bookingId])

  useEffect(() => {
    if (!booking || !isDelivered) return
    const tick = () => {
      const ms = getEscrowRemainingMs(booking)
      setRemainingMs(ms)
      setProgress(getEscrowWindowProgress(booking))
      if (ms <= 0) {
        const released = runEscrowAutoRelease()
        if (released.includes(booking.id)) {
          const updated = getBookingById(booking.id)
          if (updated) setBooking(updated)
        }
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
    tick()
    timerRef.current = setInterval(tick, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [booking, isDelivered])

  if (!isLoaded || !booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const handleConfirmSatisfied = () => {
    const updated = updateBookingStatus(booking.id, 'COMPLETED')
    if (updated) {
      setBooking(updated)
      setConfirmSent(true)
      setTimeout(() => setShowConfirmModal(false), 1800)
    }
  }

  const handleSendDispute = () => {
    if (!disputeReason) return
    const updated = updateBookingStatus(booking.id, 'DISPUTED', {
      concept_notes: `Khiếu nại: ${disputeReason}`,
    })
    if (updated) setBooking(updated)
    setDisputeSent(true)
    setTimeout(() => setShowDisputeModal(false), 1500)
  }

  const payout = calculateEscrowPayout(booking)
  const PAST_DELIVERED = ['DELIVERED', 'PHOTOS_DELIVERED', 'ACCEPTED', 'COMPLETED']
  const DELIVERED_STATUSES = ['DELIVERED', 'PHOTOS_DELIVERED']

  const timelineSteps = [
    {
      key: 'PAID_ESCROW',
      label: 'Bước 1 — Cọc & Escrow',
      desc: 'Tiền thanh toán vào tài khoản trung gian',
      done: true,
      current: booking.status === 'PAID_ESCROW',
    },
    {
      key: 'CONFIRMED',
      label: 'Bước 2 — Xác nhận lịch hẹn',
      desc: 'Thợ ảnh đã nhận & xác nhận đơn',
      done: ['CONFIRMED', 'PHOTOGRAPHER_ARRIVED', 'SHOOTING', 'EDITING', ...PAST_DELIVERED].includes(booking.status),
      current: booking.status === 'CONFIRMED',
    },
    {
      key: 'SHOOTING',
      label: 'Bước 3 — Buổi chụp & Hậu kỳ',
      desc: 'Chụp ảnh → Chỉnh màu & lọc ảnh',
      done: ['SHOOTING', 'EDITING', ...PAST_DELIVERED].includes(booking.status),
      current: ['PHOTOGRAPHER_ARRIVED', 'SHOOTING', 'EDITING'].includes(booking.status),
    },
    {
      key: 'DELIVERED',
      label: 'Bước 4 — Bàn giao ảnh (48h Escrow)',
      desc: 'Thợ upload & xác nhận bàn giao — đếm ngược 48h',
      done: PAST_DELIVERED.includes(booking.status),
      current: DELIVERED_STATUSES.includes(booking.status),
    },
    {
      key: 'COMPLETED',
      label: 'Bước 5 — Giải ngân Escrow',
      desc: '85% gói + 100% Add-ons chuyển vào ví thợ',
      done: booking.status === 'COMPLETED' || booking.status === 'ACCEPTED',
      current: booking.status === 'COMPLETED',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Header */}
        <div className="mb-6">
          <Link href="/customer/bookings" className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 mb-2 font-medium">
            <ChevronLeft className="w-4 h-4" />Quay lại danh sách lịch hẹn
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">Lịch Hẹn #{booking.booking_number}</h1>
                <Badge variant="verified">Escrow đang bảo vệ</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Gói {booking.package_name} • Ngày tạo: {new Date(booking.created_at).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/customer/bookings/${booking.id}/gallery`}>
                <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold h-10 shadow-md">
                  <ImageIcon className="w-4 h-4 mr-1.5" />Mở kho ảnh đám mây
                </Button>
              </Link>
              <Link href={`/customer/messages?photographer=${booking.photographer_id}&bookingId=${booking.id}`}>
                <Button variant="outline" className="rounded-xl text-xs font-bold h-10">
                  <MessageCircle className="w-4 h-4 mr-1.5" />Chat với thợ
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* BƯỚC 1: PAID_ESCROW Banner */}
        {booking.status === 'PAID_ESCROW' && (
          <div className="mb-6 p-5 rounded-3xl bg-gradient-to-r from-sky-900 to-indigo-900 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sky-300 font-bold text-xs uppercase tracking-wider mb-1">
                <Lock className="w-4 h-4 text-sky-400" />Tiền đã được khóa an toàn trong Escrow
              </div>
              <h3 className="text-lg font-black">Thanh toán thành công!</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
                {formatVND(booking.total_amount)} đang được FLASHY giữ an toàn. Tiền sẽ chỉ giải ngân cho thợ sau khi bạn xác nhận hài lòng hoặc hết 48h kiểm duyệt.
              </p>
            </div>
            <div className="flex-shrink-0 p-3 bg-white/10 rounded-2xl text-center min-w-[110px]">
              <Lock className="w-8 h-8 text-sky-300 mx-auto mb-1" />
              <div className="text-xs font-bold text-sky-200">ESCROW<br />ĐANG GIỮ</div>
            </div>
          </div>
        )}

        {/* BƯỚC 3: DELIVERED — 48h Countdown Banner */}
        {isDelivered && (
          <div className="mb-6 rounded-3xl bg-gradient-to-r from-violet-900 to-indigo-900 text-white shadow-lg overflow-hidden">
            <div className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-violet-300 font-bold text-xs uppercase tracking-wider mb-1">
                  <Timer className="w-4 h-4 text-violet-400 animate-pulse" />Đang đếm ngược 48 Giờ Escrow
                </div>
                <h3 className="text-lg font-black mb-1">Nhiếp ảnh gia đã bàn giao bộ ảnh hoàn chỉnh</h3>
                <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                  Kiểm tra ảnh trong kho đám mây. Bấm &quot;Xác nhận hài lòng&quot; để giải ngân ngay, hoặc khiếu nại trong 48h. Sau 48h không phản hồi, hệ thống tự động giải ngân.
                </p>
                {booking.delivered_at && (
                  <p className="text-[11px] text-violet-300 mt-2">
                    📦 Bàn giao lúc: {new Date(booking.delivered_at).toLocaleString('vi-VN')}
                    {booking.review_window_ends_at && <> · ⏰ Hạn cuối: {new Date(booking.review_window_ends_at).toLocaleString('vi-VN')}</>}
                  </p>
                )}
              </div>
              {/* Live Countdown Clock */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center bg-white/10 rounded-2xl px-5 py-3 min-w-[140px] text-center">
                <div className="text-3xl font-black font-mono tracking-tight text-white">{formatCountdown(remainingMs)}</div>
                <div className="text-[10px] text-violet-300 font-bold mt-0.5">GIỜ : PHÚT : GIÂY</div>
                <div className="text-[11px] text-violet-200 mt-1 font-medium">còn lại</div>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="px-5 pb-3">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-400 to-indigo-400 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-violet-400 mt-1">
                <span>0h</span><span>{Math.round(progress)}% thời gian đã qua</span><span>48h</span>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="px-5 pb-5 flex flex-col sm:flex-row gap-2">
              <Link href={`/customer/bookings/${booking.id}/gallery`} className="flex-1">
                <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold text-xs h-10">
                  <ImageIcon className="w-3.5 h-3.5 mr-1.5" />Xem ảnh trong kho đám mây
                </Button>
              </Link>
              <Button
                id="btn-confirm-satisfied"
                onClick={() => setShowConfirmModal(true)}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs h-10 shadow-md"
              >
                <ThumbsUp className="w-3.5 h-3.5 mr-1.5" />Xác nhận hài lòng &amp; Giải ngân ngay
              </Button>
              <Button
                id="btn-raise-dispute"
                onClick={() => setShowDisputeModal(true)}
                variant="ghost"
                className="flex-1 text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 border border-rose-400/30 rounded-xl font-bold text-xs h-10"
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />Gửi khiếu nại / Yêu cầu chỉnh sửa
              </Button>
            </div>
          </div>
        )}

        {/* BƯỚC 4: COMPLETED — Escrow đã giải ngân */}
        {booking.status === 'COMPLETED' && (
          <div className="mb-6 p-5 rounded-3xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white shadow-lg">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-500/20 rounded-xl flex-shrink-0">
                <Unlock className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider mb-1">
                  <CheckCircle2 className="w-4 h-4" />Escrow đã giải ngân thành công
                </div>
                <h3 className="text-lg font-black mb-1">Buổi chụp hoàn tất!</h3>
                <p className="text-xs text-emerald-200 leading-relaxed">
                  Cảm ơn bạn đã sử dụng FLASHY! Tiền đã được giải ngân minh bạch theo chính sách CP3.
                </p>
                {booking.completed_at && (
                  <p className="text-[11px] text-emerald-400 mt-1.5">
                    ✅ Giải ngân lúc: {new Date(booking.completed_at).toLocaleString('vi-VN')}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10 text-xs space-y-2">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5 mb-2">
                <Banknote className="w-4 h-4" />Chi tiết giải ngân Escrow (CP3 Policy)
              </div>
              <div className="flex justify-between text-white/70">
                <span>Giá gói ({booking.package_name}):</span>
                <span className="font-bold text-white">{formatVND(payout.packagePrice)}</span>
              </div>
              <div className="flex justify-between text-white/70 pl-2 text-[11px]">
                <span>• Phí sàn FLASHY (15%):</span>
                <span className="text-rose-300">-{formatVND(payout.platformCommission)}</span>
              </div>
              <div className="flex justify-between text-white/70 pl-2 text-[11px]">
                <span>• Thợ nhận (85% gói):</span>
                <span className="text-emerald-300">+{formatVND(payout.photographerPackageShare)}</span>
              </div>
              {payout.addonsTotal > 0 && (
                <div className="flex justify-between text-white/70 pl-2 text-[11px]">
                  <span>• Add-ons (100% về thợ):</span>
                  <span className="text-emerald-300">+{formatVND(payout.photographerAddonsShare)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-white pt-2 border-t border-white/10 text-sm">
                <span>Tổng thợ nhận:</span>
                <span className="text-emerald-400">{formatVND(payout.totalPhotographerPayout)}</span>
              </div>
            </div>
          </div>
        )}

        {/* DISPUTED banner */}
        {booking.status === 'DISPUTED' && (
          <div className="mb-6 p-5 rounded-3xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-rose-900 text-sm">Escrow đang bị đóng băng</h3>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                Khiếu nại của bạn đã được ghi nhận. Quỹ Escrow đã bị tạm đóng băng cho đến khi Ban Quản Trị FLASHY phân xử xong.
              </p>
            </div>
          </div>
        )}

        {/* Status Stepper */}
        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Tiến trình Escrow 5 bước</h3>
          <div className="space-y-4">
            {timelineSteps.map((step, idx) => (
              <div key={step.key} className="flex items-start gap-3.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step.done ? 'bg-emerald-600 text-white' : step.current ? 'bg-violet-600 text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                  {step.done ? '✓' : idx + 1}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className={`text-xs font-bold ${step.current ? 'text-violet-700' : step.done ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{step.desc}</p>
                  {step.current && <p className="text-[11px] text-violet-600 font-medium mt-0.5">← Trạng thái hiện tại</p>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Nhiếp ảnh gia phụ trách</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                <Image src={booking.photographer_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt={booking.photographer_name} fill className="object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 text-sm">{booking.photographer_name}</h4>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-xs text-slate-500">TP. Hồ Chí Minh</p>
                <div className="text-xs text-amber-500 font-bold mt-0.5">⭐ 4.95 (Chuyên nghiệp • Đã xác minh)</div>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <Link href={`/customer/messages?photographer=${booking.photographer_id}&bookingId=${booking.id}`} className="w-full">
                <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-bold h-9">
                  <MessageCircle className="w-3.5 h-3.5 mr-1.5" />Gửi tin nhắn
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Chi tiết tài chính &amp; Ký quỹ Escrow</h3>
            <div className="space-y-2 text-xs text-slate-600 mb-4">
              <div className="flex justify-between">
                <span>Gói chụp ({booking.package_name}):</span>
                <span className="font-semibold text-slate-900">{formatVND(booking.package_price)}</span>
              </div>
              {booking.selected_addons && booking.selected_addons.length > 0 && (
                <div className="pt-1 border-t border-slate-100">
                  {booking.selected_addons.map((ad) => (
                    <div key={ad.id} className="flex justify-between text-slate-600 text-[11px] py-0.5">
                      <span>• {ad.name}:</span><span>+{formatVND(ad.price)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between py-2 border-y border-slate-100 font-bold text-slate-900 text-sm">
                <span>Tổng giá trị đơn:</span><span>{formatVND(booking.total_amount)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Đã nộp cọc Escrow (30%):</span><span>{formatVND(booking.deposit_amount)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Còn lại thanh toán sau nghiệm thu:</span><span>{formatVND(booking.remaining_amount)}</span>
              </div>
            </div>
            <div className="pt-2 flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Trạng thái Escrow:</span>
              {booking.status === 'COMPLETED' ? (
                <span className="font-bold text-emerald-600">✅ ĐÃ GIẢI NGÂN</span>
              ) : booking.status === 'DISPUTED' ? (
                <span className="font-bold text-rose-600">🔒 ĐÓNG BĂNG</span>
              ) : (
                <span className="font-bold text-sky-600">🔐 HELD_BY_PROVIDER (Đã khóa)</span>
              )}
            </div>
            {booking.status === 'COMPLETED' && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-[11px]">
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Thợ nhận (85% gói + 100% Add-ons):</span>
                  <span>{formatVND(payout.totalPhotographerPayout)}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Phí sàn FLASHY (15%):</span>
                  <span>{formatVND(payout.platformCommission)}</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Location & Concept */}
        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Thông tin điểm hẹn &amp; Concept</h3>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900">{booking.location}</strong>
                <span className="text-[11px] text-slate-400">TP. Hồ Chí Minh</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-600 flex-shrink-0" />
              <span>{booking.shooting_date} • {booking.shooting_time}</span>
            </div>
            {booking.concept_notes && !booking.concept_notes.startsWith('Khiếu nại:') && (
              <div className="pt-2 border-t border-slate-100 text-slate-600">
                <span className="font-bold text-slate-800">Ghi chú concept:</span> {booking.concept_notes}
              </div>
            )}
          </div>
        </Card>

        {/* Modal: Xác nhận hài lòng */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <ThumbsUp className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900">Xác nhận hài lòng &amp; Giải ngân</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Khi bạn xác nhận hài lòng, hệ thống sẽ <strong>giải ngân ngay lập tức</strong>:
              </p>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-emerald-800">
                  <span>Thợ nhận (85% gói + 100% Add-ons):</span>
                  <span className="font-black">{formatVND(payout.totalPhotographerPayout)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Phí sàn FLASHY (15%):</span>
                  <span>{formatVND(payout.platformCommission)}</span>
                </div>
              </div>
              {confirmSent ? (
                <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs text-center font-bold">
                  ✅ Đã xác nhận! Escrow giải ngân thành công.
                </div>
              ) : (
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setShowConfirmModal(false)} className="rounded-xl text-xs">
                    Xem lại ảnh đã
                  </Button>
                  <Button
                    id="btn-confirm-payout"
                    size="sm"
                    onClick={handleConfirmSatisfied}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold px-5"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 mr-1.5" />Xác nhận giải ngân
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal: Khiếu nại */}
        {showDisputeModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900">Khiếu Nại &amp; Đóng Băng Ký Quỹ</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Khi bạn gửi khiếu nại, tiền ký quỹ sẽ ngay lập tức được <strong>đóng băng</strong>. Khoản tiền sẽ không được giải ngân cho thợ ảnh cho đến khi Ban Quản Trị Flashy phân xử xong.
              </p>
              {disputeSent ? (
                <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs text-center font-bold">
                  ✓ Đã ghi nhận khiếu nại. Quỹ Escrow đã được khóa an toàn!
                </div>
              ) : (
                <>
                  <textarea
                    rows={3}
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="Mô tả lý do khiếu nại (thợ không đến, ảnh không đúng cam kết...)"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setShowDisputeModal(false)} className="rounded-xl text-xs">
                      Hủy bỏ
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSendDispute}
                      className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold px-4"
                    >
                      Xác nhận gửi khiếu nại
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
