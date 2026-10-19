'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  Clock,
  MapPin,
  Camera,
  Smartphone,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  Layers,
  X,
  CreditCard,
  ChevronRight
} from 'lucide-react'
import { ServicePackage } from '@/types'
import { DEMO_PACKAGES } from '@/lib/data/mock-data'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createPersistentBooking } from '@/lib/data/booking-store'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  initialPackage?: ServicePackage | null
  photographer?: {
    id: string
    display_name: string
    avatar_url?: string
    slug?: string
  } | null
}

export function BookingModal({
  isOpen,
  onClose,
  initialPackage,
  photographer,
}: BookingModalProps) {
  const router = useRouter()
  const [selectedPkg, setSelectedPkg] = useState<ServicePackage>(
    initialPackage || DEMO_PACKAGES[0]
  )
  const [shootingDate, setShootingDate] = useState<string>('')
  const [shootingTime, setShootingTime] = useState<string>('09:00')
  const [locationName, setLocationName] = useState<string>('')
  const [customerName, setCustomerName] = useState<string>('')
  const [customerPhone, setCustomerPhone] = useState<string>('')
  const [conceptNotes, setConceptNotes] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [createdBookingNumber, setCreatedBookingNumber] = useState<string>('')

  useEffect(() => {
    if (initialPackage) {
      setSelectedPkg(initialPackage)
    } else {
      setSelectedPkg(DEMO_PACKAGES[0])
    }
  }, [initialPackage, isOpen])

  if (!isOpen) return null

  // Calculate pricing
  const totalAmount = selectedPkg.base_price
  const depositAmount = Math.round((totalAmount * 30) / 100) // 30% deposit

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault()
    if (!shootingDate) {
      alert('Vui lòng chọn ngày chụp dự kiến!')
      return
    }
    if (!locationName.trim()) {
      alert('Vui lòng nhập địa điểm chụp mong muốn!')
      return
    }

    setIsSubmitting(true)

    try {
      const pId = photographer?.id || 'p-1'
      const pName = photographer?.display_name || 'Nhiếp ảnh gia FLASHY'
      const pAvatar = photographer?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
      const pSlug = photographer?.slug || 'photographer'

      const newBooking = createPersistentBooking({
        photographer_id: pId,
        photographer_name: pName,
        photographer_avatar: pAvatar,
        photographer_slug: pSlug,
        customer_name: customerName.trim() || 'Khách hàng',
        customer_phone: customerPhone.trim() || undefined,
        package_slug: selectedPkg.slug,
        package_name: selectedPkg.name,
        shooting_date: shootingDate,
        shooting_time: shootingTime,
        duration_minutes: selectedPkg.duration_minutes,
        location: locationName.trim(),
        concept_notes: conceptNotes.trim() || undefined,
        package_price: selectedPkg.base_price,
        addons_total: 0,
        total_amount: totalAmount,
        deposit_amount: depositAmount,
        payment_method: 'sandbox',
      })

      setCreatedBookingNumber(newBooking.booking_number)
      setIsSuccess(true)
    } catch (err) {
      console.error('Lỗi đặt lịch:', err)
      alert('Đã xảy ra lỗi khi tạo lịch chụp. Vui lòng thử lại!')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full">
                Đặt lịch thành công
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                Đã Xác Nhận Đặt Lịch Chụp!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Mã đơn: <strong className="text-slate-900 font-mono">{createdBookingNumber}</strong> • Gói:{' '}
                <strong className="text-violet-600">{selectedPkg.name}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs space-y-2 max-w-md mx-auto">
              <p className="flex justify-between">
                <span className="text-slate-500">Ngày & Giờ chụp:</span>
                <strong className="text-slate-800">{shootingDate} lúc {shootingTime}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Địa điểm:</span>
                <strong className="text-slate-800">{locationName}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Tiền cọc giữ chỗ (30%):</span>
                <strong className="text-emerald-600 font-black">{formatVND(depositAmount)}</strong>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Bảo vệ Escrow:</span>
                <span className="text-violet-600 font-semibold">Giữ tiền an toàn 48h</span>
              </p>
            </div>

            <div className="flex gap-3 pt-2 max-w-md mx-auto">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-2xl text-xs font-bold h-11"
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  onClose()
                  router.push('/customer/bookings')
                }}
                className="flex-1 bg-brand text-white rounded-2xl text-xs font-bold h-11"
              >
                Xem quản lý đơn
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmBooking} className="flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-violet-600 uppercase tracking-wider bg-violet-50 px-2.5 py-0.5 rounded-full">
                  Chuẩn CP3 FLASHY
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-medium">Bảo hiểm Escrow 48h</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Modal Đặt Lịch Chụp Ảnh
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {photographer
                  ? `Đặt lịch trực tiếp cùng ${photographer.display_name}`
                  : 'Chọn gói chụp và điền thông tin để thợ ảnh nhận đơn nhanh chóng'}
              </p>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* 1. Package Tabs Selector */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-2">
                  1. Chọn danh mục gói dịch vụ *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DEMO_PACKAGES.map((pkg) => {
                    const isCurrent = selectedPkg.slug === pkg.slug
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPkg(pkg)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isCurrent
                            ? 'border-violet-600 bg-violet-50/70 shadow-sm ring-2 ring-violet-500/10'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider block">
                          Gói {pkg.sort_order}
                        </span>
                        <p className="text-xs font-black text-slate-900 mt-0.5 truncate">
                          {pkg.name.replace('FLASHY ', '')}
                        </p>
                        <p className="text-[11px] font-black text-violet-700 mt-1">
                          {formatVND(pkg.base_price)}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 2. CP3 Full Information Breakdown Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50/60 via-slate-50 to-white border border-violet-100 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-violet-100/60">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">
                      Chi tiết {selectedPkg.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {selectedPkg.description}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xl font-black text-violet-700 block">
                      {formatVND(selectedPkg.base_price)}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600">
                      Cọc 30%: {formatVND(depositAmount)}
                    </span>
                  </div>
                </div>

                {/* 6 Key Spec Rows */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-start gap-2 p-2 rounded-xl bg-white border border-slate-100">
                    <Camera className="w-3.5 h-3.5 text-violet-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Thiết bị:
                      </span>
                      <span className="font-semibold text-slate-800 text-[11px]">
                        {selectedPkg.equipment}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2 rounded-xl bg-white border border-slate-100">
                    <Clock className="w-3.5 h-3.5 text-violet-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Thời lượng:
                      </span>
                      <span className="font-semibold text-slate-800 text-[11px]">
                        {selectedPkg.duration_text || `${selectedPkg.duration_minutes} phút`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2 rounded-xl bg-white border border-slate-100">
                    <Layers className="w-3.5 h-3.5 text-violet-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Sản phẩm bàn giao:
                      </span>
                      <span className="font-semibold text-slate-800 text-[11px]">
                        {selectedPkg.deliverables}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2 rounded-xl bg-white border border-slate-100">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Hạn trả ảnh:
                      </span>
                      <span className="font-bold text-emerald-700 text-[11px]">
                        {selectedPkg.delivery_time}
                      </span>
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex items-start gap-2 p-2 rounded-xl bg-white border border-slate-100">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-700 block">
                        Dịch vụ bao gồm:
                      </span>
                      <span className="text-slate-700 text-[11px]">
                        {selectedPkg.service_includes}
                      </span>
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex items-start gap-2 p-2 rounded-xl bg-white border border-slate-100">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-600 block">
                        Phân khúc thợ:
                      </span>
                      <span className="text-slate-800 font-semibold text-[11px]">
                        {selectedPkg.photographer_tier}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Schedule & Location Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. Thời gian & Địa điểm hẹn
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Ngày chụp *
                    </label>
                    <Input
                      type="date"
                      required
                      value={shootingDate}
                      onChange={(e) => setShootingDate(e.target.value)}
                      className="rounded-xl h-10 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Giờ chụp mong muốn *
                    </label>
                    <select
                      value={shootingTime}
                      onChange={(e) => setShootingTime(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="07:30">07:30 sáng (Ánh sáng vàng sớm)</option>
                      <option value="09:00">09:00 sáng (Ánh sáng trong trẻo)</option>
                      <option value="15:30">15:30 chiều (Nắng dịu)</option>
                      <option value="17:00">17:00 chiều (Hoàng hôn rực rỡ)</option>
                      <option value="19:00">19:00 tối (Phố đêm lung linh)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Địa điểm chụp / Điểm hẹn *
                  </label>
                  <Input
                    placeholder="VD: Cà phê Dinh Độc Lập / Bến Bạch Đằng / Landmark 81 / Phố đi bộ..."
                    required
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="rounded-xl h-10 text-xs"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400 self-center">Gợi ý nhanh:</span>
                    {['Bến Bạch Đằng', 'Hồ Con Rùa', 'Bưu điện TP', 'Landmark 81'].map((hot) => (
                      <button
                        key={hot}
                        type="button"
                        onClick={() => setLocationName(hot)}
                        className="text-[11px] bg-slate-100 hover:bg-violet-100 hover:text-violet-700 px-2.5 py-0.5 rounded-full text-slate-600 transition-colors"
                      >
                        {hot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Tên người liên hệ
                    </label>
                    <Input
                      placeholder="VD: Nguyễn Văn A"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="rounded-xl h-10 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Số điện thoại
                    </label>
                    <Input
                      placeholder="VD: 0901234567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="rounded-xl h-10 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Ghi chú mong muốn (Style, concept, trang phục)
                  </label>
                  <Textarea
                    placeholder="VD: Muốn chụp phong cách nhẹ nhàng Hàn Quốc, màu ấm áp, chụp cùng bạn bè..."
                    value={conceptNotes}
                    onChange={(e) => setConceptNotes(e.target.value)}
                    className="rounded-xl text-xs min-h-[64px]"
                  />
                </div>
              </div>

              {/* Escrow Assurance Banner */}
              <div className="p-3.5 rounded-2xl bg-violet-50 border border-violet-200/80 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-violet-600 flex-shrink-0" />
                <p className="text-[11px] text-violet-900 leading-relaxed font-medium">
                  <strong>Cam kết an toàn 100%:</strong> Số tiền cọc {formatVND(depositAmount)} được giữ trong hệ thống Escrow FLASHY và chỉ thanh toán cho thợ sau khi bạn đã nhận ảnh và duyệt hài lòng trong 48 giờ.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 pt-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-slate-500 block">Tổng thanh toán:</span>
                <span className="text-xl font-black text-violet-700">
                  {formatVND(totalAmount)}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">
                  (Cọc trước 30%: {formatVND(depositAmount)})
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="rounded-xl text-xs h-11 px-4"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand text-white hover:opacity-90 rounded-xl text-xs font-bold h-11 px-6 shadow-md"
                >
                  {isSubmitting ? 'Đang tạo đơn...' : 'Xác nhận đặt lịch'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
