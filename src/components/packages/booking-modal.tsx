'use client'

import React, { useState, useEffect, useMemo } from 'react'
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
  ChevronRight,
  Car,
  Building2,
  Timer,
  Wand2,
  Film,
  Zap,
  Minus,
  Plus,
  Ticket,
  Tag,
  RotateCcw
} from 'lucide-react'
import { ServicePackage } from '@/types'
import { DEMO_PACKAGES } from '@/lib/data/mock-data'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { createPersistentBooking } from '@/lib/data/booking-store'
import {
  validateAndApplyVoucher,
  getAllAvailableVouchers,
  PlatformVoucher,
} from '@/lib/utils/vouchers'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  initialPackage?: ServicePackage | null
  photographer?: {
    id: string
    display_name: string
    avatar_url?: string
    slug?: string
    is_top_rated?: boolean
  } | null
  isRebook?: boolean
}

export function BookingModal({
  isOpen,
  onClose,
  initialPackage,
  photographer,
  isRebook = false,
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

  // Extra distance (>8km): 12.000 VNĐ / km
  const [hasExtraDistance, setHasExtraDistance] = useState<boolean>(false)
  const [extraDistanceKm, setExtraDistanceKm] = useState<number>(0)

  // Studio rental: 150.000 VNĐ / hour
  const [isStudioRental, setIsStudioRental] = useState<boolean>(false)
  const [studioHours, setStudioHours] = useState<number>(1)

  // Addons selection
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([])

  // Voucher & Loyalty
  const [voucherCodeInput, setVoucherCodeInput] = useState<string>(isRebook ? 'REBOOK10' : '')
  const [appliedVoucher, setAppliedVoucher] = useState<PlatformVoucher | null>(null)
  const [voucherDiscount, setVoucherDiscount] = useState<number>(0)
  const [voucherError, setVoucherError] = useState<string>('')
  const [availableVouchers, setAvailableVouchers] = useState<PlatformVoucher[]>([])

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

  useEffect(() => {
    if (isOpen) {
      const list = getAllAvailableVouchers()
      setAvailableVouchers(list)
      if (isRebook) {
        setVoucherCodeInput('REBOOK10')
      }
    }
  }, [isOpen, isRebook])

  // Calculation logic
  const packagePrice = selectedPkg.base_price
  const travelFee = (hasExtraDistance || extraDistanceKm > 0) ? Math.max(0, extraDistanceKm) * 15000 : 0
  const studioFee = isStudioRental ? Math.max(1, studioHours) * 150000 : 0
  const expressDeliveryFee = Math.round(packagePrice * 0.25)

  const ADDONS = useMemo(() => [
    {
      id: 'addon-extra-time',
      name: 'Thêm thời gian chụp: 30 phút',
      price: 250000,
      badge: '+30 phút',
      icon: Timer,
    },
    {
      id: 'addon-retouch-extra',
      name: 'Thêm ảnh Retouch kỹ: 5 ảnh',
      price: 200000,
      badge: '+5 ảnh',
      icon: Wand2,
    },
    {
      id: 'addon-fast-delivery',
      name: 'Giao ảnh siêu tốc trong 24h (+25% gói gốc)',
      price: expressDeliveryFee,
      badge: '+25% gói gốc',
      icon: Zap,
    },
    {
      id: 'addon-reels-tiktok',
      name: 'Quay video ngắn hậu trường/Reels/TikTok',
      price: 250000,
      badge: 'Video 4K',
      icon: Film,
    },
  ], [packagePrice, expressDeliveryFee])

  const addonsItemsTotal = selectedAddonIds.reduce((sum, id) => {
    const item = ADDONS.find((a) => a.id === id)
    return sum + (item ? item.price : 0)
  }, 0)

  const addonsTotal = addonsItemsTotal + studioFee
  const grossSubtotal = packagePrice + addonsTotal + travelFee
  const discountAmount = appliedVoucher ? voucherDiscount : 0
  const totalAmount = Math.max(0, grossSubtotal - discountAmount)
  const depositAmount = Math.round((totalAmount * 30) / 100) // 30% deposit

  // Handle voucher verification
  const handleApplyVoucher = (codeToApply?: string) => {
    const code = (codeToApply || voucherCodeInput).trim()
    setVoucherError('')
    if (!code) {
      setVoucherError('Vui lòng nhập mã giảm giá')
      return
    }

    const res = validateAndApplyVoucher(code, packagePrice + addonsItemsTotal, { isRebook })
    if (res.valid && res.voucher) {
      setAppliedVoucher(res.voucher)
      setVoucherDiscount(res.discount)
      setVoucherCodeInput(res.voucher.code)
    } else {
      setVoucherError(res.error || 'Mã giảm giá không hợp lệ')
      setAppliedVoucher(null)
      setVoucherDiscount(0)
    }
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    setVoucherDiscount(0)
    setVoucherCodeInput('')
    setVoucherError('')
  }

  const toggleAddon = (id: string) => {
    if (selectedAddonIds.includes(id)) {
      setSelectedAddonIds(selectedAddonIds.filter((item) => item !== id))
    } else {
      setSelectedAddonIds([...selectedAddonIds, id])
    }
  }

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

      const selectedAddonsList = ADDONS.filter((a) => selectedAddonIds.includes(a.id)).map((a) => ({
        id: a.id,
        name: a.name,
        price: a.price,
      }))

      if (isStudioRental && studioFee > 0) {
        selectedAddonsList.push({
          id: 'addon-studio',
          name: `Thuê Studio cơ bản (${studioHours} giờ)`,
          price: studioFee,
        })
      }

      if (travelFee > 0) {
        selectedAddonsList.push({
          id: 'addon-travel',
          name: `Phụ phí di chuyển (>8km: ${extraDistanceKm} km)`,
          price: travelFee,
        })
      }

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
        addons_total: addonsTotal,
        travel_fee: travelFee,
        extra_distance_km: extraDistanceKm,
        studio_fee: studioFee,
        studio_hours: isStudioRental ? studioHours : 0,
        total_amount: totalAmount,
        deposit_amount: depositAmount,
        payment_method: 'sandbox',
        selected_addons: selectedAddonsList,
        is_rebook: Boolean(isRebook),
        is_top_rated: Boolean(photographer?.is_top_rated),
        voucher_code: appliedVoucher?.code,
        discount_amount: discountAmount,
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

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop - click để đóng */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content - nổi trên backdrop */}
      <div className="relative min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
          {/* Modal Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng modal"
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
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
                {isRebook ? 'Đặt Lại Nhiếp Ảnh Gia Cũ (Re-book)' : 'Modal Đặt Lịch Chụp Ảnh'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {photographer
                  ? `Đặt lịch trực tiếp cùng ${photographer.display_name}`
                  : 'Chọn gói chụp và điền thông tin để thợ ảnh nhận đơn nhanh chóng'}
              </p>
            </div>

            {/* Re-book Anti-Circumvention Banner */}
            {isRebook && (
              <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <RotateCcw className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-black">Đặt lại Nhiếp ảnh gia yêu thích</p>
                    <p className="text-[10px] text-violet-100">
                      Giao dịch an toàn qua sàn: Thợ được tự động giảm phí sàn từ 15% xuống 10% (hoặc 8% Top Rated), quyền lợi Escrow bảo vệ bạn 100%!
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-white text-violet-800 px-2.5 py-1 rounded-full whitespace-nowrap shadow-xs">
                  🎉 Giảm phí thợ 10%
                </span>
              </div>
            )}

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

                  {/* Di chuyển ngoài bán kính tiêu chuẩn (>8km) */}
                  <div className={`mt-3 p-3.5 rounded-2xl border transition-all ${
                    hasExtraDistance || extraDistanceKm > 0 ? 'border-violet-600 bg-violet-50/40' : 'border-slate-200 bg-slate-50/60'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Car className="w-4 h-4 text-violet-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            Phụ thu di chuyển ngoài bán kính tiêu chuẩn (&gt;8km)
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Đơn giá: <strong className="text-violet-700">15.000 VNĐ / km</strong> (Miễn phí 8km đầu)
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={hasExtraDistance || extraDistanceKm > 0}
                        onChange={(e) => {
                          setHasExtraDistance(e.target.checked)
                          if (!e.target.checked) setExtraDistanceKm(0)
                          else if (extraDistanceKm === 0) setExtraDistanceKm(5)
                        }}
                        className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
                      />
                    </div>

                    {(hasExtraDistance || extraDistanceKm > 0) && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-slate-700">
                          Số km vượt tiêu chuẩn:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setExtraDistanceKm((prev) => Math.max(0, prev - 1))}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <div className="relative w-20">
                            <Input
                              type="number"
                              min="0"
                              value={extraDistanceKm || ''}
                              onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value) || 0)
                                setExtraDistanceKm(val)
                                if (val > 0) setHasExtraDistance(true)
                              }}
                              className="text-center font-bold text-xs h-7 pr-6 rounded-lg"
                            />
                            <span className="absolute right-1.5 top-1 text-[10px] text-slate-400 font-bold pointer-events-none">
                              km
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setExtraDistanceKm((prev) => prev + 1)
                              setHasExtraDistance(true)
                            }}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <span className="text-[11px] font-bold text-violet-700 ml-1">
                            +{formatVND(travelFee)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Dịch vụ mua thêm (Add-ons) & Thuê Studio */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                    3. Dịch vụ mua thêm & Tiện ích Studio
                  </h4>

                  {/* Thuê Studio cơ bản */}
                  <div className={`p-3 rounded-2xl border transition-all ${
                    isStudioRental ? 'border-violet-600 bg-violet-50/50' : 'border-slate-200 bg-slate-50/40'
                  }`}>
                    <div className="flex items-start justify-between">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isStudioRental}
                          onChange={(e) => {
                            setIsStudioRental(e.target.checked)
                            if (e.target.checked && studioHours === 0) setStudioHours(1)
                          }}
                          className="mt-0.5 rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-violet-600" />
                            <p className="text-xs font-bold text-slate-900">
                              Cần hỗ trợ thuê Studio (+150.000 VNĐ/giờ)
                            </p>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Studio chuẩn: máy lạnh, gương makeup, đèn flash và phông nền.
                          </p>
                        </div>
                      </label>
                      <span className="text-xs font-black text-violet-700 whitespace-nowrap ml-2">
                        {isStudioRental ? `+${formatVND(studioFee)}` : '+150.000đ/h'}
                      </span>
                    </div>

                    {isStudioRental && (
                      <div className="mt-2 pt-2 border-t border-violet-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-semibold text-slate-700">Số giờ thuê:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setStudioHours((prev) => Math.max(1, prev - 1))}
                            className="w-6 h-6 rounded-md bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-slate-900 w-12 text-center text-xs">
                            {studioHours} giờ
                          </span>
                          <button
                            type="button"
                            onClick={() => setStudioHours((prev) => prev + 1)}
                            className="w-6 h-6 rounded-md bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700 text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <span className="text-[10px] text-slate-400 ml-1">
                            ({studioHours}h × 150.000đ)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Addons List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ADDONS.map((addon) => {
                      const isChecked = selectedAddonIds.includes(addon.id)
                      const Icon = addon.icon
                      return (
                        <div
                          key={addon.id}
                          onClick={() => toggleAddon(addon.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                            isChecked
                              ? 'border-violet-600 bg-violet-50/60 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="rounded text-violet-600 focus:ring-violet-500 w-3.5 h-3.5 pointer-events-none"
                            />
                            <Icon className="w-3.5 h-3.5 text-violet-600 flex-shrink-0" />
                            <div>
                              <p className="font-bold text-slate-800 text-[11px] leading-snug">
                                {addon.name}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-violet-700 text-[11px] whitespace-nowrap ml-1">
                            +{formatVND(addon.price)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    4. Thông tin liên hệ & Ghi chú
                  </h4>
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

                {/* 5. Mã giảm giá & Tích điểm Voucher FLASHY */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50/70 via-white to-pink-50/50 border border-violet-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                      <Ticket className="w-3.5 h-3.5 text-violet-600" />
                      5. Mã giảm giá / Voucher FLASHY
                    </label>
                    <span className="text-[10px] font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
                      Loyalty & Khách Thân Thiết
                    </span>
                  </div>

                  {appliedVoucher ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-emerald-800">{appliedVoucher.code}</span>
                            <Badge className="bg-emerald-600 text-white text-[9px] px-1.5 py-0">Đã áp dụng</Badge>
                          </div>
                          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                            Giảm {formatVND(discountAmount)} ({appliedVoucher.description})
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleRemoveVoucher}
                        className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 px-2"
                      >
                        Gỡ bỏ
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nhập mã voucher (VD: REBOOK10, FLASHYNEW...)"
                          value={voucherCodeInput}
                          onChange={(e) => {
                            setVoucherCodeInput(e.target.value.toUpperCase())
                            setVoucherError('')
                          }}
                          className="h-10 text-xs rounded-xl font-mono uppercase bg-white"
                        />
                        <Button
                          type="button"
                          onClick={() => handleApplyVoucher()}
                          className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs h-10 px-4 rounded-xl flex-shrink-0"
                        >
                          Áp dụng
                        </Button>
                      </div>

                      {voucherError && (
                        <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                          ⚠️ {voucherError}
                        </p>
                      )}

                      {/* Quick select pills */}
                      <div className="pt-1">
                        <span className="text-[10px] text-slate-400 font-medium block mb-1.5">Gợi ý voucher dành cho bạn:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {isRebook && (
                            <button
                              type="button"
                              onClick={() => handleApplyVoucher('REBOOK10')}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-violet-300 bg-violet-100 text-violet-800 hover:bg-violet-200 transition-colors flex items-center gap-1"
                            >
                              <Tag className="w-2.5 h-2.5 text-violet-600" />
                              REBOOK10 (Giảm 10% khách đặt lại)
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleApplyVoucher('FLASHYNEW')}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                          >
                            FLASHYNEW (Giảm 10% tối đa 50k)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleApplyVoucher('COIN50K')}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                          >
                            COIN50K (Giảm 50.000đ)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Transparent Order Summary / Checkout Breakdown */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      Hóa Đơn Đặt Lịch & Minh Bạch Dòng Tiền
                    </span>
                    <span className="text-[10px] font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
                      Chuẩn Marketplace
                    </span>
                  </div>

                  <div className="space-y-1.5 text-slate-600 text-xs">
                    {/* Gói chụp */}
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-800">
                        • Giá gói chụp ({selectedPkg.name}):
                      </span>
                      <span className="font-bold text-slate-900">{formatVND(packagePrice)}</span>
                    </div>

                    {/* Dịch vụ mua thêm */}
                    {selectedAddonIds.length > 0 && (
                      <div className="pl-2 space-y-1 py-1 border-y border-slate-200/60">
                        <div className="flex justify-between font-semibold text-slate-700 text-[11px]">
                          <span>• Dịch vụ mua thêm (Add-ons):</span>
                          <span>+{formatVND(addonsItemsTotal)}</span>
                        </div>
                        {selectedAddonIds.map((id) => {
                          const ad = ADDONS.find((a) => a.id === id)
                          if (!ad) return null
                          return (
                            <div key={id} className="flex justify-between text-[11px] text-slate-500 pl-2">
                              <span>- {ad.name}</span>
                              <span className="font-semibold text-slate-700">+{formatVND(ad.price)}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Gross Service Value */}
                    <div className="flex justify-between text-[11px] font-bold text-violet-800 bg-violet-50/80 p-2 rounded-xl border border-violet-100">
                      <span>Tổng tiền dịch vụ (Gross Service Value):</span>
                      <span>{formatVND(packagePrice + addonsItemsTotal)}</span>
                    </div>

                    {/* Phụ thu di chuyển */}
                    {travelFee > 0 ? (
                      <div className="pt-1 border-t border-slate-200/60">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-800 text-xs">
                                • Phụ thu di chuyển ngoài bán kính tiêu chuẩn (&gt;8km):
                              </span>
                              <div className="group relative inline-block">
                                <span className="text-violet-600 cursor-pointer font-bold text-[11px]">ⓘ</span>
                                <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-60 p-2 bg-slate-900 text-white text-[10px] rounded shadow-lg z-30 leading-snug">
                                  Miễn phí 8km đầu tiên, phụ thu 15.000đ/km để hỗ trợ thợ di chuyển
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-500 block">
                              {extraDistanceKm} km vượt chuẩn × 15.000 VNĐ/km (Thợ nhận 100%)
                            </span>
                            <div className="text-[10px] text-violet-700 bg-violet-100/60 rounded px-1.5 py-0.5 mt-0.5 inline-block">
                              Miễn phí 8km đầu tiên, phụ thu 15.000đ/km để hỗ trợ thợ di chuyển
                            </div>
                          </div>
                          <span className="font-bold text-slate-900">+{formatVND(travelFee)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-emerald-700 text-[11px] pt-1 border-t border-slate-200/60">
                        <div>
                          <span className="font-semibold">• Phí di chuyển (≤8km):</span>
                          <span className="text-[10px] text-emerald-600 block">
                            Miễn phí 8km đầu tiên, phụ thu 15.000đ/km để hỗ trợ thợ di chuyển
                          </span>
                        </div>
                        <span className="font-bold">0 VNĐ (Miễn phí)</span>
                      </div>
                    )}

                    {/* Thuê Studio */}
                    {isStudioRental && studioFee > 0 && (
                      <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-200/60">
                        <span className="font-semibold">• Hỗ trợ thuê Studio ({studioHours}h × 150.000đ):</span>
                        <span className="font-bold text-slate-900">+{formatVND(studioFee)}</span>
                      </div>
                    )}

                    {/* Dòng giảm trừ Voucher FLASHY */}
                    {discountAmount > 0 && appliedVoucher && (
                      <div className="flex justify-between items-center py-2 px-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs">
                        <div className="flex items-center gap-1.5">
                          <Ticket className="w-4 h-4 text-emerald-600" />
                          <span>Giảm giá Voucher FLASHY ({appliedVoucher.code}):</span>
                        </div>
                        <span className="text-emerald-700 font-black text-sm">
                          -{formatVND(discountAmount)}
                        </span>
                      </div>
                    )}

                    {/* Tổng khách thanh toán */}
                    <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
                      <div>
                        <span>Tổng khách thanh toán:</span>
                        <span className="text-[10px] text-slate-400 font-normal block">
                          {discountAmount > 0
                            ? `(Gói + Add-ons + Phí di chuyển) - Voucher ${formatVND(discountAmount)}`
                            : '(Giá gói + Add-ons) + Phụ thu di chuyển'}
                        </span>
                      </div>
                      <span className="text-violet-700 font-black text-base">{formatVND(totalAmount)}</span>
                    </div>

                    {/* Tiền cọc 30% */}
                    <div className="flex justify-between items-center bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-emerald-900 font-bold">
                      <div>
                        <span className="text-xs">Số tiền đặt cọc 30% qua Escrow:</span>
                        <span className="text-[10px] text-emerald-600 block font-normal">
                          Giữ an toàn 48h sau buổi chụp (tính trên tổng sau giảm)
                        </span>
                      </div>
                      <span className="font-black text-emerald-700 text-sm">{formatVND(depositAmount)}</span>
                    </div>
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
                {discountAmount > 0 && (
                  <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                    🎉 Đã giảm {formatVND(discountAmount)} từ voucher {appliedVoucher?.code}
                  </span>
                )}
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
    </div>
  )
}

