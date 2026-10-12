'use client'

import { useState, useMemo, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Sparkles,
  Camera,
  Coins,
  Ticket,
  AlertCircle,
  CreditCard,
  QrCode,
  Wallet,
  Zap,
  Info
} from 'lucide-react'
import { DEMO_PHOTOGRAPHERS, DEMO_PACKAGES, DEMO_ADDONS, DEMO_VOUCHERS } from '@/lib/data/mock-data'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

function BookingWizardContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const photographerId = params?.photographerId as string
  const preselectedPkgId = searchParams?.get('pkg')

  const photographer = DEMO_PHOTOGRAPHERS.find(p => p.id === photographerId) || DEMO_PHOTOGRAPHERS[0]

  // Wizard Step (1: Package, 2: DateTime & Location, 3: Addons & Notes, 4: Review & Payment)
  const [step, setStep] = useState<number>(1)

  // Booking selections
  const [selectedPkgId, setSelectedPkgId] = useState<string>(preselectedPkgId || DEMO_PACKAGES[1].id)
  const [shootingDate, setShootingDate] = useState<string>('2026-04-15')
  const [shootingTime, setShootingTime] = useState<string>('09:00')
  const [locationName, setLocationName] = useState<string>('Bến Bạch Đằng, Quận 1')
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([])
  const [conceptNotes, setConceptNotes] = useState<string>('Chụp phong cách vintage đường phố, tone màu ấm áp kiểu film cổ điển.')
  
  // Voucher & Payment
  const [voucherCode, setVoucherCode] = useState<string>('FLASHYNEW')
  const [appliedVoucher, setAppliedVoucher] = useState<any>(DEMO_VOUCHERS[0])
  const [voucherError, setVoucherError] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<'sandbox' | 'momo' | 'zalopay' | 'qr'>('sandbox')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState<any>(null)

  const selectedPackage = DEMO_PACKAGES.find(p => p.id === selectedPkgId) || DEMO_PACKAGES[0]

  // Cost calculations
  const packagePrice = selectedPackage.base_price
  const addonsTotal = selectedAddonIds.reduce((sum, id) => {
    const addon = DEMO_ADDONS.find(a => a.id === id)
    return sum + (addon ? addon.price : 0)
  }, 0)
  const travelFee = 0 // Within free radius
  const subtotal = packagePrice + addonsTotal + travelFee

  const discountAmount = useMemo(() => {
    if (!appliedVoucher) return 0
    if (appliedVoucher.type === 'PERCENTAGE') {
      const calc = (subtotal * appliedVoucher.discount_value) / 100
      return appliedVoucher.max_discount ? Math.min(calc, appliedVoucher.max_discount) : calc
    } else if (appliedVoucher.type === 'FIXED') {
      return appliedVoucher.discount_value
    }
    return 0
  }, [appliedVoucher, subtotal])

  const totalPayable = Math.max(0, subtotal - discountAmount)
  const depositAmount = Math.round(totalPayable * 0.3) // 30% deposit

  const handleApplyVoucher = () => {
    setVoucherError('')
    const v = DEMO_VOUCHERS.find(x => x.code.toUpperCase() === voucherCode.trim().toUpperCase())
    if (v) {
      setAppliedVoucher(v)
    } else {
      setVoucherError('Mã ưu đãi không hợp lệ hoặc đã hết hạn')
      setAppliedVoucher(null)
    }
  }

  const toggleAddon = (addonId: string) => {
    if (selectedAddonIds.includes(addonId)) {
      setSelectedAddonIds(selectedAddonIds.filter(id => id !== addonId))
    } else {
      setSelectedAddonIds([...selectedAddonIds, addonId])
    }
  }

  const handleConfirmBooking = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      const newBooking = {
        id: `BK-${Date.now().toString().slice(-6)}`,
        photographer_id: photographer.id,
        photographer_name: photographer.display_name,
        package_name: selectedPackage.name,
        shooting_date: shootingDate,
        shooting_time: shootingTime,
        location: locationName,
        total_amount: totalPayable,
        deposit_amount: depositAmount,
        status: 'CONFIRMED',
        payment_method: paymentMethod,
      }
      setBookingSuccess(newBooking)
      setIsSubmitting(false)
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Wizard Navigation Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Đặt Lịch Chụp Ảnh Với {photographer.display_name}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Quy trình đặt hẹn an toàn 4 bước • Giữ tiền ký quỹ Escrow 48h
              </p>
            </div>
            <Link href={`/photographers/${photographer.slug}`}>
              <Button variant="outline" size="sm" className="rounded-xl text-xs">
                Xem lại hồ sơ
              </Button>
            </Link>
          </div>

          {/* Stepper bar */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { num: 1, title: 'Chọn gói chụp' },
              { num: 2, title: 'Thời gian & Địa điểm' },
              { num: 3, title: 'Dịch vụ thêm & Ghi chú' },
              { num: 4, title: 'Xác nhận & Cọc tiền' },
            ].map(s => (
              <div
                key={s.num}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  step === s.num
                    ? 'border-violet-600 bg-violet-50/80 text-violet-700 shadow-sm'
                    : step > s.num
                    ? 'border-emerald-200 bg-emerald-50/60 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <span>{step > s.num ? '✓' : `0${s.num}.`}</span>
                  <span className="hidden sm:inline">{s.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Modal View */}
        {bookingSuccess ? (
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-xl text-center max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <Badge variant="verified" className="mb-2">Giao dịch thành công</Badge>
            <h2 className="text-2xl font-black text-slate-900 mb-1">
              Đã Xác Nhận Đặt Lịch Chụp!
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Mã lịch hẹn: <strong>#{bookingSuccess.id}</strong> • Tiền cọc đã được chuyển vào quỹ ký quỹ an toàn.
            </p>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left text-xs space-y-2 mb-6">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Nhiếp ảnh gia:</span>
                <span className="font-bold text-slate-900">{bookingSuccess.photographer_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Gói dịch vụ:</span>
                <span className="font-bold text-slate-900">{bookingSuccess.package_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Thời gian chụp:</span>
                <span className="font-bold text-slate-900">{bookingSuccess.shooting_time} - {bookingSuccess.shooting_date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Địa điểm:</span>
                <span className="font-bold text-slate-900">{bookingSuccess.location}</span>
              </div>
              <div className="flex justify-between py-1 text-emerald-700">
                <span className="font-bold">Đã thanh toán cọc:</span>
                <span className="font-black text-sm">{formatVND(bookingSuccess.deposit_amount)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Link href="/customer/bookings" className="w-full">
                <Button className="w-full bg-brand hover:opacity-90 rounded-xl font-bold text-xs h-11">
                  Xem lịch hẹn của tôi
                </Button>
              </Link>
              <Link href="/customer/messages" className="w-full">
                <Button variant="outline" className="w-full rounded-xl font-bold text-xs h-11">
                  Nhắn tin với thợ chụp
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Main Form (Steps 1 to 4) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* STEP 1: CHOOSE PACKAGE */}
              {step === 1 && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-violet-600" />
                    Bước 1: Chọn gói chụp ảnh phù hợp
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DEMO_PACKAGES.map((pkg) => {
                      const isSelected = selectedPkgId === pkg.id
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPkgId(pkg.id)}
                          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-violet-600 bg-violet-50/40 shadow-md ring-2 ring-violet-500/10'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-violet-200">
                                {pkg.category}
                              </span>
                              <h4 className="font-black text-slate-900 text-base mt-1">{pkg.name}</h4>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-violet-700 text-lg">{formatVND(pkg.base_price)}</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 mb-3 line-clamp-2">{pkg.description}</p>
                          <div className="text-[11px] text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                            <p>⏱️ Thời lượng: <strong>{pkg.duration_minutes} phút</strong></p>
                            <p>📸 File nhận: <strong>{pkg.original_photos} gốc / {pkg.edited_photos} chỉnh màu</strong></p>
                            {pkg.retouch_quota > 0 && (
                              <p className="text-amber-600 font-semibold">✨ Retouch chuyên sâu: {pkg.retouch_quota} ảnh</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button onClick={() => setStep(2)} className="bg-brand hover:opacity-90 rounded-xl px-6 font-bold text-xs h-11">
                      Tiếp tục: Chọn thời gian & địa điểm
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: DATE, TIME & LOCATION */}
              {step === 2 && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-5">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-violet-600" />
                    Bước 2: Chọn ngày giờ và địa điểm chụp
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Ngày chụp dự kiến *</label>
                      <Input
                        type="date"
                        value={shootingDate}
                        onChange={(e) => setShootingDate(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Giờ chụp mong muốn *</label>
                      <select
                        value={shootingTime}
                        onChange={(e) => setShootingTime(e.target.value)}
                        className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500"
                      >
                        <option value="07:30">07:30 sáng (Ánh sáng vàng sớm)</option>
                        <option value="09:00">09:00 sáng (Ánh sáng trong trẻo)</option>
                        <option value="15:30">15:30 chiều (Nắng dịu)</option>
                        <option value="17:00">17:00 chiều (Hoàng hôn rực rỡ)</option>
                        <option value="19:00">19:00 tối (Phố đêm, Bokeh lung linh)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Địa điểm chụp hoặc điểm hẹn cụ thể *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        placeholder="Ví dụ: Bưu điện Thành Phố, Cà phê Dinh Độc Lập..."
                        className="pl-10 rounded-xl h-11"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Nhiếp ảnh gia {photographer.display_name} hỗ trợ di chuyển miễn phí trong bán kính {photographer.service_radius_km}km.
                    </p>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl text-xs h-11">
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Quay lại
                    </Button>
                    <Button onClick={() => setStep(3)} className="bg-brand hover:opacity-90 rounded-xl px-6 font-bold text-xs h-11">
                      Tiếp tục: Dịch vụ cộng thêm
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: ADDONS & CONCEPT NOTES */}
              {step === 3 && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-5">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-600" />
                    Bước 3: Chọn thêm dịch vụ & Ghi chú concept
                  </h3>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">Dịch vụ cộng thêm tùy chọn (Add-ons):</label>
                    <div className="space-y-2.5">
                      {DEMO_ADDONS.map((addon) => {
                        const isChecked = selectedAddonIds.includes(addon.id)
                        return (
                          <div
                            key={addon.id}
                            onClick={() => toggleAddon(addon.id)}
                            className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                              isChecked
                                ? 'border-violet-600 bg-violet-50/50 shadow-sm'
                                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4 pointer-events-none"
                              />
                              <div>
                                <p className="font-bold text-slate-900 text-xs">{addon.name}</p>
                                <p className="text-[11px] text-slate-500">{addon.description}</p>
                              </div>
                            </div>
                            <span className="font-black text-violet-700 text-xs">+{formatVND(addon.price)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">Ghi chú phong cách / Yêu cầu đặc biệt:</label>
                    <Textarea
                      rows={3}
                      value={conceptNotes}
                      onChange={(e) => setConceptNotes(e.target.value)}
                      placeholder="Ví dụ: Tone màu film 90s, trang phục áo dài trắng, muốn chụp góc nghiêng..."
                      className="rounded-xl text-xs"
                    />
                  </div>

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)} className="rounded-xl text-xs h-11">
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Quay lại
                    </Button>
                    <Button onClick={() => setStep(4)} className="bg-brand hover:opacity-90 rounded-xl px-6 font-bold text-xs h-11">
                      Tiếp tục: Xác nhận & Đặt cọc
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW & PAYMENT */}
              {step === 4 && (
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    Bước 4: Xem lại chi tiết & Chọn phương thức cọc
                  </h3>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">Chọn phương thức thanh toán cọc:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: 'sandbox', label: 'Sandbox Thử Nghiệm', icon: Zap, note: 'Khuyên dùng kiểm thử' },
                        { id: 'momo', label: 'Ví MoMo', icon: Wallet, note: 'Cổng MoMo Pay' },
                        { id: 'zalopay', label: 'ZaloPay', icon: CreditCard, note: 'Ví điện tử' },
                        { id: 'qr', label: 'VietQR Ngân Hàng', icon: QrCode, note: 'Chuyển khoản QR' },
                      ].map((pm) => {
                        const Icon = pm.icon
                        const isSelected = paymentMethod === pm.id
                        return (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => setPaymentMethod(pm.id as any)}
                            className={`p-3 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? 'border-violet-600 bg-violet-50 text-violet-700 shadow-sm ring-2 ring-violet-500/20'
                                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <Icon className="w-5 h-5 mb-1.5" />
                            <p className="font-bold text-xs leading-snug">{pm.label}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{pm.note}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {paymentMethod === 'sandbox' && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-bold">Thanh toán thử nghiệm – Không phát sinh giao dịch thật</p>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          Hệ thống sẽ mô phỏng webhook xác nhận tiền cọc thành công vào quỹ Escrow và cập nhật đơn hàng ngay lập tức.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex justify-between">
                    <Button variant="outline" onClick={() => setStep(3)} className="rounded-xl text-xs h-11">
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Quay lại
                    </Button>
                    <Button
                      onClick={handleConfirmBooking}
                      disabled={isSubmitting}
                      className="bg-brand hover:opacity-90 rounded-xl px-8 font-black text-xs h-11 shadow-lg shadow-violet-500/25"
                    >
                      {isSubmitting ? 'Đang kích hoạt Escrow...' : `Xác nhận & Cọc (${formatVND(depositAmount)})`}
                    </Button>
                  </div>
                </div>
              )}

            </div>

            {/* Sidebar Booking Summary Card */}
            <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-24 space-y-4">
              <h3 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100 flex items-center justify-between">
                <span>Tóm Tắt Đơn Đặt</span>
                <span className="text-xs text-violet-600 font-semibold">Bước {step}/4</span>
              </h3>

              {/* Photographer Mini Profile */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="relative w-11 h-11 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                  <Image
                    src={photographer.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={photographer.display_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{photographer.display_name}</h4>
                  <p className="text-[11px] text-slate-500">{photographer.district}, {photographer.city}</p>
                </div>
              </div>

              {/* Package Details */}
              <div className="text-xs space-y-1.5 text-slate-600 pb-3 border-b border-slate-100">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-800">Gói {selectedPackage.name}:</span>
                  <span className="font-bold">{formatVND(packagePrice)}</span>
                </div>
                <p className="text-[11px] text-slate-400">⏱️ {selectedPackage.duration_minutes} phút • {selectedPackage.edited_photos} ảnh màu</p>
                
                {selectedAddonIds.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-slate-700">Dịch vụ thêm ({selectedAddonIds.length}):</p>
                    {selectedAddonIds.map(id => {
                      const ad = DEMO_ADDONS.find(a => a.id === id)
                      return (
                        <div key={id} className="flex justify-between text-[11px] text-slate-500">
                          <span className="truncate pr-2">• {ad?.name}</span>
                          <span>+{formatVND(ad?.price || 0)}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Voucher Code Box */}
              <div className="pb-3 border-b border-slate-100">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Mã giảm giá / Voucher</label>
                <div className="flex gap-1.5">
                  <Input
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Mã voucher"
                    className="h-8 rounded-lg text-xs"
                  />
                  <Button size="sm" onClick={handleApplyVoucher} variant="outline" className="h-8 rounded-lg text-xs px-2.5">
                    Áp dụng
                  </Button>
                </div>
                {appliedVoucher && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Đã giảm {formatVND(discountAmount)}
                  </p>
                )}
                {voucherError && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">{voucherError}</p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span>{formatVND(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Giảm giá voucher:</span>
                    <span>-{formatVND(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100 text-sm">
                  <span>Tổng tiền dịch vụ:</span>
                  <span>{formatVND(totalPayable)}</span>
                </div>
                <div className="flex justify-between font-black text-violet-700 text-base pt-1">
                  <span>Tiền cọc cần trả (30%):</span>
                  <span>{formatVND(depositAmount)}</span>
                </div>
                <p className="text-[10px] text-slate-400 text-right">
                  70% còn lại thanh toán sau khi buổi chụp kết thúc
                </p>
              </div>

              {/* Escrow note */}
              <div className="p-3 rounded-xl bg-violet-50 text-[11px] text-violet-900 border border-violet-100">
                <div className="flex items-center gap-1.5 font-bold mb-0.5">
                  <ShieldCheck className="w-4 h-4 text-violet-600" />
                  Bảo vệ Ký Quỹ Escrow
                </div>
                <p className="text-slate-600">
                  FLASHY giữ cọc an toàn cho đến khi bạn nhận và duyệt ảnh hài lòng.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default function BookingWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BookingWizardContent />
    </Suspense>
  )
}

