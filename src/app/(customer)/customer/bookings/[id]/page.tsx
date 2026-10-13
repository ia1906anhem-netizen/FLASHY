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
  Coins,
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
  UserCheck
} from 'lucide-react'
import { DEMO_PHOTOGRAPHERS } from '@/lib/data/mock-data'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getBookingById, updateBookingStatus, PersistentBooking } from '@/lib/data/booking-store'

export default function CustomerBookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params?.id as string

  const [booking, setBooking] = useState<PersistentBooking | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeSent, setDisputeSent] = useState(false)

  useEffect(() => {
    if (bookingId) {
      const found = getBookingById(bookingId)
      if (found) {
        setBooking(found)
      } else {
        // Fallback for direct link if not found in local store
        const photographer = DEMO_PHOTOGRAPHERS[0]
        setBooking({
          id: bookingId,
          booking_number: bookingId,
          photographer_id: photographer.id,
          photographer_name: photographer.display_name,
          photographer_avatar: photographer.avatar_url || '',
          photographer_slug: photographer.slug,
          customer_name: 'Khách hàng',
          package_slug: 'vibe-sai-gon',
          package_name: 'Vibe Sài Gòn',
          shooting_date: '15/04/2026',
          shooting_time: '15:30',
          duration_minutes: 120,
          location: 'Bến Bạch Đằng & Bưu điện Q.1',
          package_price: 450000,
          addons_total: 100000,
          total_amount: 550000,
          deposit_amount: 165000,
          remaining_amount: 385000,
          payment_method: 'sandbox',
          status: 'CONFIRMED',
          status_label: 'Đã xác nhận • Sắp diễn ra',
          status_color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          selected_addons: [{ id: 'addon-1', name: 'Trang điểm & Làm tóc nhẹ nhàng', price: 100000 }],
        })
      }
      setIsLoaded(true)
    }
  }, [bookingId])

  if (!isLoaded || !booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const handleSendDispute = () => {
    if (!disputeReason) return
    updateBookingStatus(booking.id, 'DISPUTED', { concept_notes: `Khiếu nại: ${disputeReason}` })
    setDisputeSent(true)
    setBooking((prev) =>
      prev
        ? {
            ...prev,
            status: 'DISPUTED',
            status_label: 'Đang khiếu nại • Tạm đóng băng Escrow',
            status_color: 'bg-rose-50 text-rose-700 border-rose-200',
          }
        : null
    )
    setTimeout(() => {
      setShowDisputeModal(false)
    }, 1500)
  }

  const timelineSteps = [
    {
      key: 'CONFIRMED',
      label: 'Đã cọc & Xác nhận',
      done: true,
      current: booking.status === 'CONFIRMED',
    },
    {
      key: 'PHOTOGRAPHER_ARRIVED',
      label: 'Thợ ảnh đã đến điểm hẹn',
      done: ['PHOTOGRAPHER_ARRIVED', 'SHOOTING', 'EDITING', 'PHOTOS_DELIVERED', 'ACCEPTED', 'COMPLETED'].includes(
        booking.status
      ),
      current: booking.status === 'PHOTOGRAPHER_ARRIVED',
    },
    {
      key: 'SHOOTING',
      label: 'Đang tiến hành chụp ảnh',
      done: ['SHOOTING', 'EDITING', 'PHOTOS_DELIVERED', 'ACCEPTED', 'COMPLETED'].includes(booking.status),
      current: booking.status === 'SHOOTING',
    },
    {
      key: 'EDITING',
      label: 'Chỉnh màu & Lọc ảnh',
      done: ['EDITING', 'PHOTOS_DELIVERED', 'ACCEPTED', 'COMPLETED'].includes(booking.status),
      current: booking.status === 'EDITING',
    },
    {
      key: 'PHOTOS_DELIVERED',
      label: 'Đã bàn giao ảnh đám mây',
      done: ['PHOTOS_DELIVERED', 'ACCEPTED', 'COMPLETED'].includes(booking.status),
      current: booking.status === 'PHOTOS_DELIVERED',
    },
    {
      key: 'ACCEPTED',
      label: 'Khách duyệt & Nhận ảnh',
      done: ['ACCEPTED', 'COMPLETED'].includes(booking.status),
      current: booking.status === 'ACCEPTED',
    },
    {
      key: 'COMPLETED',
      label: 'Hoàn tất buổi chụp',
      done: booking.status === 'COMPLETED',
      current: booking.status === 'COMPLETED',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Top Back Nav */}
        <div className="mb-6">
          <Link
            href="/customer/bookings"
            className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 mb-2 font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại danh sách lịch hẹn
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">
                  Lịch Hẹn #{booking.booking_number}
                </h1>
                <Badge variant="verified">Escrow đang bảo vệ</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Gói {booking.package_name} • Ngày tạo: {new Date(booking.created_at).toLocaleDateString('vi-VN')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/customer/bookings/${booking.id}/gallery`}>
                <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold h-10 shadow-md">
                  <ImageIcon className="w-4 h-4 mr-1.5" />
                  Mở kho ảnh đám mây
                </Button>
              </Link>
              <Link href={`/customer/messages?photographer=${booking.photographer_id}&bookingId=${booking.id}`}>
                <Button variant="outline" className="rounded-xl text-xs font-bold h-10">
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  Chat với thợ
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 48-Hour Review Alert Box */}
        {booking.status === 'PHOTOS_DELIVERED' && (
          <div className="mb-6 p-5 rounded-3xl bg-gradient-to-r from-violet-900 to-indigo-900 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-violet-300 font-bold text-xs uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4 text-violet-400" />
                Đang trong thời hạn kiểm duyệt 48 Giờ
              </div>
              <h3 className="text-lg font-black">
                Nhiếp ảnh gia đã tải lên bộ ảnh hoàn chỉnh
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
                Bạn có thể xem trước ảnh có watermark, chọn ảnh retouch chuyên sâu theo quota hoặc duyệt bàn giao để nhận file gốc không nén.
              </p>
            </div>
            <Link href={`/customer/bookings/${booking.id}/gallery`}>
              <Button className="bg-white text-slate-950 hover:bg-slate-100 rounded-xl font-bold text-xs h-11 px-6 shadow-md flex-shrink-0">
                Xem & Duyệt ảnh ngay
              </Button>
            </Link>
          </div>
        )}

        {/* Status Stepper Card */}
        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Tiến trình thực hiện lịch hẹn
          </h3>
          <div className="space-y-4">
            {timelineSteps.map((step, idx) => (
              <div key={step.key} className="flex items-start gap-3.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    step.done
                      ? 'bg-emerald-600 text-white'
                      : step.current
                      ? 'bg-violet-600 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step.done ? '✓' : idx + 1}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-xs font-bold ${
                        step.current ? 'text-violet-700' : step.done ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                  {step.current && (
                    <p className="text-[11px] text-violet-600 font-medium">Trạng thái hiện tại của đơn hàng</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Details & Photographer Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Photographer Box */}
          <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Nhiếp ảnh gia phụ trách
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                <Image
                  src={
                    booking.photographer_avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                  }
                  alt={booking.photographer_name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 text-sm">{booking.photographer_name}</h4>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-xs text-slate-500">TP. Hồ Chí Minh</p>
                <div className="text-xs text-amber-500 font-bold mt-0.5">
                  ⭐ 4.95 (Chuyên nghiệp • Đã xác minh)
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <Link
                href={`/customer/messages?photographer=${booking.photographer_id}&bookingId=${booking.id}`}
                className="w-full"
              >
                <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-bold h-9">
                  <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                  Gửi tin nhắn
                </Button>
              </Link>
            </div>
          </Card>

          {/* Payment & Breakdown */}
          <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Chi tiết tài chính & Ký quỹ
            </h3>
            <div className="space-y-2 text-xs text-slate-600 mb-4">
              <div className="flex justify-between">
                <span>Gói chụp ({booking.package_name}):</span>
                <span className="font-semibold text-slate-900">{formatVND(booking.package_price)}</span>
              </div>
              {booking.selected_addons && booking.selected_addons.length > 0 && (
                <div className="pt-1 border-t border-slate-100">
                  {booking.selected_addons.map((ad) => (
                    <div key={ad.id} className="flex justify-between text-slate-600 text-[11px] py-0.5">
                      <span>• {ad.name}:</span>
                      <span>+{formatVND(ad.price)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between py-2 border-y border-slate-100 font-bold text-slate-900 text-sm">
                <span>Tổng giá trị đơn:</span>
                <span>{formatVND(booking.total_amount)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Đã nộp cọc Escrow (30%):</span>
                <span>{formatVND(booking.deposit_amount)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Còn lại thanh toán sau nghiệm thu:</span>
                <span>{formatVND(booking.remaining_amount)}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Trạng thái Escrow:</span>
              <span className="font-bold text-emerald-600">HELD_BY_PROVIDER (Đã khóa an toàn)</span>
            </div>
          </Card>
        </div>

        {/* Location & Concept Card */}
        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm mb-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Thông tin điểm hẹn & Concept
          </h3>
          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900">{booking.location}</strong>
                <span className="text-[11px] text-slate-400">TP. Hồ Chí Minh</span>
              </div>
            </div>
            {booking.concept_notes && (
              <div className="pt-2 border-t border-slate-100 text-slate-600">
                <span className="font-bold text-slate-800">Ghi chú concept:</span> {booking.concept_notes}
              </div>
            )}
          </div>
        </Card>

        {/* Dispute Button Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-400">
            Nếu có sự cố phát sinh trong buổi chụp, bạn có quyền khiếu nại trước khi hết hạn 48h.
          </p>
          <button
            onClick={() => setShowDisputeModal(true)}
            className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Khiếu nại buổi chụp
          </button>
        </div>

        {/* Dispute Modal */}
        {showDisputeModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900">Khiếu Nại & Đóng Băng Ký Quỹ</h3>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDisputeModal(false)}
                      className="rounded-xl text-xs"
                    >
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
