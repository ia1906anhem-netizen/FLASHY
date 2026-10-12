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

export default function CustomerBookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params?.id as string

  // Mock booking data
  const photographer = DEMO_PHOTOGRAPHERS[0]
  const [currentStatus, setCurrentStatus] = useState<string>('PHOTOS_DELIVERED')
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeSent, setDisputeSent] = useState(false)

  const timelineSteps = [
    { key: 'CONFIRMED', label: 'Đã cọc & Xác nhận', time: '12/04 10:00', done: true },
    { key: 'PHOTOGRAPHER_ARRIVED', label: 'Thợ đã đến điểm hẹn', time: '15/04 15:20', done: true },
    { key: 'SHOOTING', label: 'Đang chụp ảnh', time: '15/04 15:30', done: true },
    { key: 'EDITING', label: 'Chỉnh màu & Lọc ảnh', time: '16/04 09:00', done: true },
    { key: 'PHOTOS_DELIVERED', label: 'Đã bàn giao ảnh đám mây', time: '17/04 14:00', done: true, current: true },
    { key: 'ACCEPTED', label: 'Khách duyệt & Giải ngân', time: 'Dự kiến 19/04', done: false },
    { key: 'COMPLETED', label: 'Hoàn tất buổi chụp', time: '', done: false },
  ]

  const handleSendDispute = () => {
    if (!disputeReason) return
    setDisputeSent(true)
    setTimeout(() => {
      setShowDisputeModal(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Top Back Nav */}
        <div className="mb-6">
          <Link href="/customer/bookings" className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 mb-2 font-medium">
            <ChevronLeft className="w-4 h-4" />
            Quay lại danh sách lịch hẹn
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">
                  Lịch Hẹn #{bookingId || 'BK-892104'}
                </h1>
                <Badge variant="verified">Escrow đang bảo vệ</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Gói Vibe Sài Gòn • Tạo lúc 12/04/2026 10:00
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/customer/bookings/${bookingId}/gallery`}>
                <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold h-10 shadow-md">
                  <ImageIcon className="w-4 h-4 mr-1.5" />
                  Mở kho ảnh đám mây
                </Button>
              </Link>
              <Link href="/customer/messages">
                <Button variant="outline" className="rounded-xl text-xs font-bold h-10">
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  Chat với thợ
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 48-Hour Review Alert Box */}
        {currentStatus === 'PHOTOS_DELIVERED' && (
          <div className="mb-6 p-5 rounded-3xl bg-gradient-to-r from-violet-900 to-indigo-900 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-violet-300 font-bold text-xs uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4 text-violet-400" />
                Đang trong thời hạn kiểm duyệt 48 Giờ
              </div>
              <h3 className="text-lg font-black">
                Nhiếp ảnh gia đã tải lên 250 ảnh gốc & 40 ảnh chỉnh màu
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
                Bạn còn <strong>34 giờ</strong> để xem trước ảnh có watermark, chọn 10 ảnh retouch chuyên sâu hoặc duyệt bàn giao để nhận file gốc không nén.
              </p>
            </div>
            <Link href={`/customer/bookings/${bookingId}/gallery`}>
              <Button className="bg-white text-slate-950 hover:bg-slate-100 rounded-xl font-bold text-xs h-11 px-6 shadow-md flex-shrink-0">
                Xem & Duyệt ảnh ngay
              </Button>
            </Link>
          </div>
        )}

        {/* Visual Timeline Tracker Card */}
        <Card className="rounded-3xl border-slate-200 bg-white p-6 md:p-8 shadow-sm mb-6">
          <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-600" />
            Tiến Độ Buổi Chụp & Giải Ngân
          </h3>

          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timelineSteps.map((step, idx) => (
              <div key={idx} className="relative">
                {/* Dot */}
                <div className={`absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step.done
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-50'
                    : step.current
                    ? 'bg-violet-600 text-white ring-4 ring-violet-100 animate-pulse'
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {step.done ? '✓' : idx + 1}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h4 className={`text-xs font-bold ${step.done || step.current ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.label}
                    </h4>
                    {step.current && (
                      <p className="text-[11px] text-violet-600 font-medium">Trạng thái hiện tại của đơn hàng</p>
                    )}
                  </div>
                  {step.time && (
                    <span className="text-[11px] text-slate-400 font-mono">{step.time}</span>
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
                  src={photographer.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={photographer.display_name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 text-sm">{photographer.display_name}</h4>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-xs text-slate-500">{photographer.district}, {photographer.city}</p>
                <div className="text-xs text-amber-500 font-bold mt-0.5">
                  ⭐ {photographer.average_rating} ({photographer.review_count} đánh giá)
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <Link href={`/customer/messages`} className="w-full">
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
                <span>Gói Vibe Sài Gòn:</span>
                <span className="font-semibold text-slate-900">450.000đ</span>
              </div>
              <div className="flex justify-between">
                <span>Makeup nhẹ nhàng (Addon):</span>
                <span className="font-semibold text-slate-900">150.000đ</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Voucher giảm giá (FLASHYNEW):</span>
                <span>-50.000đ</span>
              </div>
              <div className="flex justify-between py-2 border-y border-slate-100 font-bold text-slate-900 text-sm">
                <span>Tổng giá trị đơn:</span>
                <span>550.000đ</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Đã nộp cọc Escrow (30%):</span>
                <span>165.000đ</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Còn lại thanh toán sau nghiệm thu:</span>
                <span>385.000đ</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Trạng thái Escrow:</span>
              <span className="font-bold text-emerald-600">HELD_BY_PROVIDER (Đã khóa an toàn)</span>
            </div>
          </Card>
        </div>

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
            Mở khiếu nại đơn này
          </button>
        </div>

        {/* Dispute Modal */}
        {showDisputeModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">Mở Khiếu Nại Đơn Hàng</h3>
              <p className="text-xs text-slate-500 mb-4">
                Khi mở khiếu nại, khoản tiền ký quỹ Escrow sẽ lập tức bị đóng băng cho đến khi Admin kiểm duyệt.
              </p>

              {disputeSent ? (
                <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-700 text-xs font-bold text-center">
                  Đã ghi nhận khiếu nại! Admin sẽ liên hệ trong 24h.
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Lý do khiếu nại *</label>
                    <select
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="">-- Chọn lý do --</option>
                      <option value="no_show">Thợ ảnh không đến điểm hẹn</option>
                      <option value="late">Thợ ảnh đến trễ hơn 30 phút</option>
                      <option value="poor_quality">Chất lượng ảnh không đúng cam kết portfolio</option>
                      <option value="missing_files">Thiếu file ảnh so với gói</option>
                      <option value="attitude">Thái độ phục vụ không phù hợp</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={() => setShowDisputeModal(false)} className="flex-1 rounded-xl text-xs">
                      Hủy bỏ
                    </Button>
                    <Button onClick={handleSendDispute} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold">
                      Gửi khiếu nại
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
