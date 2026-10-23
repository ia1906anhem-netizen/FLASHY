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
  Info,
  Smartphone,
  Layers,
  UserCheck,
  Car,
  Building2,
  Timer,
  Wand2,
  Film,
  Plus,
  Minus,
  Check,
  Percent
} from 'lucide-react'
import { DEMO_PACKAGES } from '@/lib/data/mock-data'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { LocationTabPicker } from '@/components/shared/location-tab-picker'
import { createPersistentBooking, getApprovedProviders } from '@/lib/data/booking-store'
import { calculateFullBookingCommission } from '@/lib/utils/commission'
import {
  calculateHaversineDistance,
  formatDistance,
  calculateTravelSurcharge,
  getCoordinatesByLocation,
  TRAVEL_SURCHARGE_FREE_RADIUS_KM,
  TRAVEL_SURCHARGE_RATE_PER_KM
} from '@/lib/geolocation'
import { validateAndApplyVoucher } from '@/lib/utils/vouchers'

function BookingWizardContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const photographerId = params?.photographerId as string
  const preselectedPkgId = searchParams?.get('pkg')

  const approvedList = getApprovedProviders()
  const foundApproved = approvedList.find(p => p.id === photographerId || p.slug === photographerId)

  const photographer: any = foundApproved
    ? {
        id: foundApproved.id,
        slug: foundApproved.slug,
        display_name: foundApproved.name,
        avatar_url: foundApproved.avatar,
        cover_image_url: foundApproved.cover,
        average_rating: foundApproved.rating || 5.0,
        review_count: foundApproved.reviews || 0,
        is_verified: foundApproved.is_verified,
        district: foundApproved.district || 'Quận 1',
        city: foundApproved.city || 'Hồ Chí Minh',
        starting_price: foundApproved.starting_price || 350000,
        service_radius_km: (foundApproved as any).service_radius_km || 8,
      }
    : null

  // Wizard Step (1: Package, 2: DateTime & Location, 3: Addons & Notes, 4: Review & Payment)
  const [step, setStep] = useState<number>(1)

  const availablePackages = useMemo(() => {
    if (!photographer) return []
    try {
      const stored = localStorage.getItem('flashy_photographer_packages')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: any) => ({
            ...p,
            id: p.id || `${photographer.id}-${p.slug}`,
          }))
        }
      }
    } catch {}

    return DEMO_PACKAGES.map((pkg) => ({
      ...pkg,
      id: `${photographer.id}-${pkg.slug}`,
    }))
  }, [photographer])

  // Booking selections & URL params handling
  const queryDist = searchParams?.get('dist')
  const queryLoc = searchParams?.get('loc')
  const initialDistance = queryDist ? parseFloat(queryDist) : 0
  const initialExtraKm = initialDistance > TRAVEL_SURCHARGE_FREE_RADIUS_KM
    ? Math.round((initialDistance - TRAVEL_SURCHARGE_FREE_RADIUS_KM) * 10) / 10
    : 0

  const [selectedPkgId, setSelectedPkgId] = useState<string>(
    preselectedPkgId || (availablePackages[0]?.id ?? 'pkg-flashy-express')
  )
  const [shootingDate, setShootingDate] = useState<string>('')
  const [shootingTime, setShootingTime] = useState<string>('09:00')
  const [locationName, setLocationName] = useState<string>(queryLoc || '')
  const [totalDistanceKm, setTotalDistanceKm] = useState<number>(initialDistance)

  // Extra distance beyond standard radius (>8km): 15.000 VNĐ / km
  const [hasExtraDistance, setHasExtraDistance] = useState<boolean>(initialExtraKm > 0)
  const [extraDistanceKm, setExtraDistanceKm] = useState<number>(initialExtraKm)

  // Calculate coordinates of photographer
  const photogCoords = useMemo(() => {
    if (!photographer) return { lat: 10.7769, lng: 106.7009 }
    return getCoordinatesByLocation(photographer.district || photographer.city)
  }, [photographer])

  // Recalculate distance dynamically when location changes
  const handleLocationChange = (loc: string) => {
    setLocationName(loc)
    if (!loc.trim()) return
    const locCoords = getCoordinatesByLocation(loc)
    const dist = calculateHaversineDistance(
      locCoords.lat,
      locCoords.lng,
      photogCoords.lat,
      photogCoords.lng
    )
    setTotalDistanceKm(dist)
    if (dist > TRAVEL_SURCHARGE_FREE_RADIUS_KM) {
      setHasExtraDistance(true)
      setExtraDistanceKm(Math.round((dist - TRAVEL_SURCHARGE_FREE_RADIUS_KM) * 10) / 10)
    } else {
      setHasExtraDistance(false)
      setExtraDistanceKm(0)
    }
  }

  // Basic Studio rental option: 150.000 VNĐ / hour
  const [isStudioRental, setIsStudioRental] = useState<boolean>(false)
  const [studioHours, setStudioHours] = useState<number>(1)

  // Addons & concept
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([])
  const [conceptNotes, setConceptNotes] = useState<string>('')
  
  // Voucher & Payment
  const [voucherCode, setVoucherCode] = useState<string>('')
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null)
  const [voucherError, setVoucherError] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<'sandbox' | 'momo' | 'zalopay' | 'qr'>('sandbox')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState<any>(null)

  const selectedPackage = availablePackages.find(p => p.id === selectedPkgId) || availablePackages[0] || {
    id: 'pkg-flashy-express',
    slug: 'flashy-express',
    name: 'FLASHY EXPRESS',
    category: 'lifestyle',
    base_price: 350000,
    duration_minutes: 60,
    original_photos: 50,
    edited_photos: 10,
    delivery_days: 1
  }

  const packagePrice = selectedPackage.base_price

  // 1. Phụ phí di chuyển ngoài bán kính tiêu chuẩn (>8km): 15.000 VNĐ / km
  const TRAVEL_UNIT_PRICE = TRAVEL_SURCHARGE_RATE_PER_KM // 15.000 VNĐ / km
  const travelFee = (hasExtraDistance || extraDistanceKm > 0) ? Math.round(Math.max(0, extraDistanceKm) * TRAVEL_UNIT_PRICE) : 0

  // 2. Thuê Studio cơ bản: 150.000 VNĐ / giờ
  const STUDIO_UNIT_PRICE = 150000
  const studioFee = isStudioRental ? Math.max(1, studioHours) * STUDIO_UNIT_PRICE : 0

  // 3. Phí giao ảnh siêu tốc trong 24h: (+25% giá trị gói gốc)
  const expressDeliveryFee = Math.round(packagePrice * 0.25)

  // Core & Partner Add-ons List
  const ADDONS = useMemo(() => [
    {
      id: 'addon-extra-time',
      name: 'Thêm thời gian chụp: 30 phút',
      description: 'Kéo dài thêm 30 phút để bắt trọn nhiều góc ảnh và thay đổi trang phục thoải mái',
      price: 250000,
      icon: Timer,
      badge: '+30 phút',
      isCore: true,
    },
    {
      id: 'addon-retouch-extra',
      name: 'Thêm ảnh Retouch kỹ: 5 ảnh',
      description: 'Chỉnh sửa chuyên sâu da, vóc dáng, ánh sáng và màu sắc đạt chuẩn in ấn thương mại',
      price: 200000,
      icon: Wand2,
      badge: '+5 ảnh',
      isCore: true,
    },
    {
      id: 'addon-fast-delivery',
      name: 'Giao ảnh siêu tốc trong 24h',
      description: `Ưu tiên xếp hàng hậu kỳ, trả toàn bộ file gốc và file chỉnh sửa hoàn thiện chỉ trong 24 giờ (+25% giá trị gói gốc)`,
      price: expressDeliveryFee,
      icon: Zap,
      badge: '+25% gói gốc',
      isDynamicPercent: true,
      isCore: true,
    },
    {
      id: 'addon-reels-tiktok',
      name: 'Quay video ngắn hậu trường/Reels/TikTok',
      description: 'Clip ngắn 15–30s dựng sẵn âm nhạc bắt trend TikTok, Reels, Shorts sẵn sàng đăng tải',
      price: 250000,
      icon: Film,
      badge: 'Video 4K',
      isCore: true,
    },
    {
      id: 'addon-makeup',
      name: 'Trang điểm chuyên nghiệp (Makeup & Hair)',
      description: 'Có chuyên viên makeup đi kèm suốt buổi chụp và dặm phấn liên tục',
      price: 250000,
      icon: Sparkles,
      badge: 'Đối tác',
      isCore: false,
    },
    {
      id: 'addon-drone',
      name: 'Chụp flycam / drone toàn cảnh',
      description: 'Thiết bị bay drone chuyên dụng ghi lại khung cảnh hùng vĩ từ góc trên cao',
      price: 500000,
      icon: Camera,
      badge: 'Ngoại cảnh',
      isCore: false,
    },
  ], [packagePrice, expressDeliveryFee])

  const addonsItemsTotal = selectedAddonIds.reduce((sum, id) => {
    const addon = ADDONS.find(a => a.id === id)
    return sum + (addon ? addon.price : 0)
  }, 0)

  const addonsTotal = addonsItemsTotal + studioFee
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
  const remainingAmount = Math.max(0, totalPayable - depositAmount) // 70% còn lại

  const commissionBreakdown = useMemo(() => {
    const selectedAddonsList: any[] = ADDONS.filter((a) => selectedAddonIds.includes(a.id)).map((a) => ({
      id: a.id,
      name: a.name,
      category: 'service' as const,
      amountVnd: a.price,
    }))
    if (isStudioRental && studioFee > 0) {
      selectedAddonsList.push({
        id: 'addon-studio',
        name: `Hỗ trợ thuê Studio (${studioHours} giờ)`,
        category: 'reimbursement' as const,
        amountVnd: studioFee,
      })
    }
    if (travelFee > 0) {
      selectedAddonsList.push({
        id: 'addon-travel',
        name: `Phụ phí di chuyển (>8km: ${extraDistanceKm} km)`,
        category: 'reimbursement' as const,
        amountVnd: travelFee,
      })
    }
    return calculateFullBookingCommission({
      packageSlug: selectedPackage.slug,
      packageAmountVnd: packagePrice,
      photographerCompletedCount: 5,
      addons: selectedAddonsList,
      travelFee,
      studioFee,
    })
  }, [selectedPackage, packagePrice, selectedAddonIds, ADDONS, isStudioRental, studioHours, studioFee, travelFee, extraDistanceKm])

  const handleApplyVoucher = (codeParam?: string) => {
    const code = (codeParam || voucherCode).trim()
    setVoucherError('')
    if (!code) {
      setVoucherError('Vui lòng nhập mã voucher')
      return
    }
    const res = validateAndApplyVoucher(code, subtotal)
    if (res.valid && res.voucher) {
      setAppliedVoucher(res.voucher)
      setVoucherCode(res.voucher.code)
    } else {
      setVoucherError(res.error || 'Mã ưu đãi không hợp lệ hoặc đã hết hạn')
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
      // Gather selected addons
      const selectedAddonsList = ADDONS.filter((a) => selectedAddonIds.includes(a.id)).map((a) => ({
        id: a.id,
        name: a.name,
        price: a.price,
      }))

      if (isStudioRental && studioFee > 0) {
        selectedAddonsList.push({
          id: 'addon-studio',
          name: `Hỗ trợ thuê Studio (${studioHours} giờ)`,
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

      // Persist to store
      const persistent = createPersistentBooking({
        photographer_id: photographer.id,
        photographer_name: photographer.display_name,
        photographer_avatar: photographer.avatar_url || undefined,
        photographer_slug: photographer.slug,
        package_slug: selectedPackage.slug,
        package_name: selectedPackage.name,
        shooting_date: shootingDate,
        shooting_time: shootingTime,
        duration_minutes: selectedPackage.duration_minutes,
        location: locationName || 'Bưu điện Thành Phố & Nhà thờ Đức Bà',
        concept_notes: conceptNotes,
        package_price: packagePrice,
        addons_total: addonsTotal,
        travel_fee: travelFee,
        extra_distance_km: extraDistanceKm,
        studio_fee: studioFee,
        studio_hours: isStudioRental ? studioHours : 0,
        total_amount: totalPayable,
        deposit_amount: depositAmount,
        payment_method: paymentMethod,
        selected_addons: selectedAddonsList,
        voucher_code: appliedVoucher?.code,
        discount_amount: discountAmount,
      })

      setBookingSuccess(persistent)
      setIsSubmitting(false)
    }, 1000)
  }

  if (!photographer) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
          <Camera className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy nhiếp ảnh gia</h2>
        <p className="text-sm text-slate-500 max-w-md mb-6">
          Nhiếp ảnh gia này không tồn tại hoặc chưa được kiểm duyệt trên hệ thống FLASHY.
        </p>
        <Link href="/photographers">
          <Button className="bg-brand text-white rounded-xl">Khám phá danh sách thợ ảnh</Button>
        </Link>
      </div>
    )
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
            <Badge variant="secondary" className="mb-2 bg-emerald-50 text-emerald-700 border border-emerald-200">Giao dịch thành công</Badge>
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
                    {availablePackages.map((pkg) => {
                      const isSelected = selectedPkgId === pkg.id
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPkgId(pkg.id)}
                          className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-violet-600 bg-violet-50/40 shadow-md ring-2 ring-violet-500/10'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-violet-200">
                                  {pkg.category || 'Gói chuẩn CP3'}
                                </span>
                                <h4 className="font-black text-slate-900 text-base mt-1">{pkg.name}</h4>
                              </div>
                              <div className="text-right">
                                <span className="font-black text-violet-700 text-lg">{formatVND(pkg.base_price)}</span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{pkg.description}</p>
                            
                            {/* CP3 Fields */}
                            <div className="text-[11px] text-slate-700 space-y-2 pt-2 border-t border-slate-100">
                              {pkg.equipment && (
                                <p className="flex items-start gap-1.5">
                                  <Camera className="w-3.5 h-3.5 text-violet-600 flex-shrink-0 mt-0.5" />
                                  <span>Thiết bị: <strong className="text-slate-800">{pkg.equipment}</strong></span>
                                </p>
                              )}
                              <p className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <span>Thời lượng: <strong>{pkg.duration_text || `${pkg.duration_minutes} phút`}</strong></span>
                              </p>
                              {pkg.deliverables && (
                                <p className="flex items-start gap-1.5">
                                  <Layers className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                  <span>Bàn giao: <strong>{pkg.deliverables}</strong></span>
                                </p>
                              )}
                              {pkg.delivery_time && (
                                <p className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                                  <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                  <span>Hạn trả: {pkg.delivery_time}</span>
                                </p>
                              )}
                              {pkg.service_includes && (
                                <p className="flex items-start gap-1.5 text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                                  <span>Bao gồm: {pkg.service_includes}</span>
                                </p>
                              )}
                              {pkg.photographer_tier && (
                                <p className="flex items-center gap-1.5 text-slate-600 text-[10px]">
                                  <UserCheck className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                  <span>Phân khúc: <strong>{pkg.photographer_tier}</strong></span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="pt-3 mt-3 border-t border-slate-100">
                            <span className={`text-[11px] font-bold block text-center py-1 rounded-xl ${
                              isSelected ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {isSelected ? '✓ Đang chọn gói này' : 'Bấm để chọn gói'}
                            </span>
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
                    <label className="text-xs font-bold text-slate-700 block mb-2">
                      Chọn địa điểm chụp hoặc điểm hẹn (Theo Tab & Gợi ý điểm Hot) *
                    </label>
                    <LocationTabPicker
                      value={locationName}
                      onChange={handleLocationChange}
                      serviceRadiusKm={photographer.service_radius_km}
                      photographerName={photographer.display_name}
                    />
                  </div>

                  {/* Di chuyển ngoài bán kính tiêu chuẩn (>8km) */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    hasExtraDistance || extraDistanceKm > 0
                      ? 'border-violet-600 bg-violet-50/40 shadow-sm'
                      : 'border-slate-200 bg-slate-50/60'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Car className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">
                              Di chuyển ngoài bán kính tiêu chuẩn (&gt;8km)
                            </span>
                            <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                              15.000 VNĐ / km (Miễn phí 8km đầu)
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            FLASHY miễn phí di chuyển 8km đầu quanh khu vực {photographer.district}. Phụ phí hỗ trợ thợ chỉ tính cho số km vượt quá 8km.
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-3 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={hasExtraDistance || extraDistanceKm > 0}
                          onChange={(e) => {
                            setHasExtraDistance(e.target.checked)
                            if (!e.target.checked) setExtraDistanceKm(0)
                            else if (extraDistanceKm === 0) setExtraDistanceKm(5)
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600"></div>
                      </label>
                    </div>

                    {/* Dynamic Distance Indicator */}
                    {totalDistanceKm > 0 && (
                      <div className={`mt-3 p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        extraDistanceKm > 0
                          ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                          : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      }`}>
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-4 h-4 flex-shrink-0 ${extraDistanceKm > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
                          <span>
                            Khoảng cách thực tế: <strong>{formatDistance(totalDistanceKm)}</strong>
                            {extraDistanceKm > 0 ? ` (Vượt tiêu chuẩn: +${extraDistanceKm} km)` : ' (Trong bán kính chuẩn ≤ 8km)'}
                          </span>
                        </div>
                        <span className="font-bold">
                          {extraDistanceKm > 0 ? `+${formatVND(travelFee)}` : 'Miễn phí 0 VNĐ'}
                        </span>
                      </div>
                    )}

                    {(hasExtraDistance || extraDistanceKm > 0) && (
                      <div className="mt-3 pt-3 border-t border-slate-200/70 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-700">
                            Số km vượt tiêu chuẩn (&gt;8km):
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setExtraDistanceKm((prev) => Math.max(0, Math.round((prev - 1) * 10) / 10))}
                              className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <div className="relative w-28">
                              <Input
                                type="number"
                                min="0"
                                step="0.5"
                                placeholder="0"
                                value={extraDistanceKm || ''}
                                onChange={(e) => {
                                  const val = Math.max(0, parseFloat(e.target.value) || 0)
                                  setExtraDistanceKm(val)
                                  if (val > 0) setHasExtraDistance(true)
                                }}
                                className="text-center font-bold text-xs h-8 pr-7 rounded-lg"
                              />
                              <span className="absolute right-2 top-1.5 text-[11px] text-slate-400 font-bold pointer-events-none">
                                km
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setExtraDistanceKm((prev) => Math.round((prev + 1) * 10) / 10)
                                setHasExtraDistance(true)
                              }}
                              className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Quick preset chips */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-slate-400 font-medium">Chọn nhanh cự ly:</span>
                          {[3, 5, 8, 12, 15, 20].map((km) => (
                            <button
                              key={km}
                              type="button"
                              onClick={() => {
                                setExtraDistanceKm(km)
                                setHasExtraDistance(true)
                              }}
                              className={`text-[11px] px-2.5 py-0.5 rounded-lg border transition-all ${
                                extraDistanceKm === km
                                  ? 'bg-violet-600 text-white border-violet-600 font-bold shadow-sm'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300'
                              }`}
                            >
                              +{km} km
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-violet-100/60 border border-violet-200/80 text-xs">
                          <span className="text-violet-900 font-semibold text-[11px]">
                            Phụ phí di chuyển ({extraDistanceKm} km × 15.000 VNĐ):
                          </span>
                          <span className="font-black text-violet-700 text-sm">
                            +{formatVND(travelFee)}
                          </span>
                        </div>
                      </div>
                    )}
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
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-violet-600" />
                      Bước 3: Chọn thêm dịch vụ & Ghi chú concept
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Lựa chọn các tiện ích bổ sung để nâng tầm chất lượng bộ ảnh của bạn.
                    </p>
                  </div>

                  {/* 1. Thuê Studio cơ bản (+150.000 VNĐ/giờ) */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    isStudioRental
                      ? 'border-violet-600 bg-violet-50/50 shadow-sm ring-1 ring-violet-500/20'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                  }`}>
                    <div className="flex items-start justify-between">
                      <label className="flex items-start gap-3 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={isStudioRental}
                          onChange={(e) => {
                            setIsStudioRental(e.target.checked)
                            if (e.target.checked && studioHours === 0) setStudioHours(1)
                          }}
                          className="mt-1 rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-violet-600" />
                            <p className="font-bold text-slate-900 text-xs">
                              Cần hỗ trợ thuê Studio (+150.000 VNĐ/giờ)
                            </p>
                            <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                              Studio Cơ Bản
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            FLASHY kết nối Studio đối tác tiện nghi: phòng máy lạnh, setup phông nền trơn/concept, gương makeup và hệ thống đèn flash tiêu chuẩn.
                          </p>
                        </div>
                      </label>
                      <span className="font-black text-violet-700 text-xs whitespace-nowrap ml-3">
                        {isStudioRental ? `+${formatVND(studioFee)}` : '+150.000 VNĐ/giờ'}
                      </span>
                    </div>

                    {isStudioRental && (
                      <div className="mt-3 pt-3 border-t border-violet-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <span className="text-slate-700 font-bold">Số giờ thuê Studio:</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setStudioHours((prev) => Math.max(1, prev - 1))}
                            className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-black text-slate-900 w-16 text-center text-xs">
                            {studioHours} giờ
                          </span>
                          <button
                            type="button"
                            onClick={() => setStudioHours((prev) => prev + 1)}
                            className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-700"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[11px] text-slate-500 ml-1">
                            ({studioHours}h × 150.000đ = <strong className="text-violet-700">{formatVND(studioFee)}</strong>)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Danh sách Dịch vụ mua thêm (Add-ons) */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">
                      Danh sách Dịch vụ mua thêm (Add-ons):
                    </label>
                    <div className="space-y-2.5">
                      {ADDONS.map((addon) => {
                        const isChecked = selectedAddonIds.includes(addon.id)
                        const Icon = addon.icon
                        return (
                          <div
                            key={addon.id}
                            onClick={() => toggleAddon(addon.id)}
                            className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                              isChecked
                                ? 'border-violet-600 bg-violet-50/50 shadow-sm ring-1 ring-violet-500/20'
                                : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4 pointer-events-none"
                              />
                              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-violet-600 flex-shrink-0">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-bold text-slate-900 text-xs">{addon.name}</p>
                                  {addon.badge && (
                                    <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.2 rounded-full">
                                      {addon.badge}
                                    </span>
                                  )}
                                  {addon.id === 'addon-fast-delivery' && (
                                    <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-2 py-0.2 rounded-full">
                                      Hỏa Tốc
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">{addon.description}</p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-3">
                              <span className="font-black text-violet-700 text-xs block">
                                +{formatVND(addon.price)}
                              </span>
                              {addon.id === 'addon-fast-delivery' && (
                                <span className="text-[10px] text-slate-400 font-semibold block">
                                  (25% gói gốc)
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* 3. Phụ phí di chuyển ngoài bán kính (>8km) - Đồng bộ & Xem lại nhanh */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-slate-600" />
                      <div>
                        <span className="font-bold text-slate-800">
                          Phụ phí di chuyển (&gt;8km):
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {extraDistanceKm > 0
                            ? `Đã tính ${extraDistanceKm} km vượt chuẩn × 12.000 VNĐ = +${formatVND(travelFee)}`
                            : 'Miễn phí trong bán kính tiêu chuẩn 8km'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-violet-700 text-xs">
                        {extraDistanceKm > 0 ? `+${formatVND(travelFee)}` : '0 VNĐ'}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setStep(2)}
                        className="h-7 text-[10px] rounded-lg px-2"
                      >
                        Chỉnh sửa km
                      </Button>
                    </div>
                  </div>

                  {/* 4. Ghi chú concept */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Ghi chú phong cách / Yêu cầu đặc biệt:
                    </label>
                    <Textarea
                      rows={3}
                      value={conceptNotes}
                      onChange={(e) => setConceptNotes(e.target.value)}
                      placeholder="Ví dụ: Tone màu film 90s, trang phục áo dài trắng, muốn chụp góc nghiêng, có mang theo thú cưng..."
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

                  {/* Detailed Invoice & Transparent Commission Breakdown */}
                  <div className="p-5 bg-slate-50/90 rounded-2xl border border-slate-200 text-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div>
                        <span className="font-bold text-slate-800 text-sm block">Hóa Đơn Buổi Chụp & Bóc Tách Minh Bạch</span>
                        <span className="text-[10px] text-slate-400">Chuẩn Marketplace: Phân tách Doanh thu Dịch vụ & Phụ phí Hoàn trả</span>
                      </div>
                      <span className="text-[11px] font-semibold text-violet-700 bg-violet-100/70 px-2 py-0.5 rounded-full">
                        Minh bạch 100%
                      </span>
                    </div>

                    <div className="space-y-2.5 text-slate-600">
                      {/* 1. Gói chụp lựa chọn */}
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-slate-800">1. Gói chụp ({selectedPackage.name}):</span>
                          <span className="text-[11px] text-slate-400 block">Thời lượng: {selectedPackage.duration_minutes} phút • {selectedPackage.edited_photos} ảnh retouch</span>
                        </div>
                        <span className="font-bold text-slate-900">{formatVND(packagePrice)}</span>
                      </div>

                      {/* 2. Các dịch vụ mua thêm (Add-ons selected) */}
                      {selectedAddonIds.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-800">2. Dịch vụ mua thêm (Add-ons):</span>
                            <span className="font-bold text-slate-900">+{formatVND(addonsItemsTotal)}</span>
                          </div>
                          {selectedAddonIds.map((id) => {
                            const ad = ADDONS.find((a) => a.id === id)
                            if (!ad) return null
                            return (
                              <div key={id} className="flex justify-between text-[11px] pl-3 py-0.5 bg-white/70 rounded-lg px-2">
                                <span className="text-slate-700">• {ad.name}</span>
                                <span className="font-semibold text-slate-900">+{formatVND(ad.price)}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Gross Service Value Subtotal */}
                      <div className="flex justify-between text-[11px] font-bold text-violet-800 bg-violet-50/70 px-2.5 py-1.5 rounded-xl border border-violet-100">
                        <span>Tổng tiền dịch vụ chụp (Gross Service Value):</span>
                        <span>{formatVND(packagePrice + addonsItemsTotal)}</span>
                      </div>

                      {/* 3. Phụ thu di chuyển (>8km) with exact tooltip explanation */}
                      {travelFee > 0 ? (
                        <div className="pt-2 border-t border-slate-200/60">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-800 text-xs">
                                  3. Phụ thu di chuyển ngoài bán kính tiêu chuẩn (&gt;8km):
                                </span>
                                <div className="group relative inline-block">
                                  <Info className="w-3.5 h-3.5 text-violet-600 cursor-pointer" />
                                  <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-64 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-lg z-20 leading-snug">
                                    Miễn phí 8km đầu tiên, phụ thu 15.000đ/km để hỗ trợ thợ di chuyển
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-500 block mt-0.5">
                                {extraDistanceKm} km vượt chuẩn × 15.000 VNĐ/km • <em>Chuyển trọn 100% cho Thợ</em>
                              </span>
                              <div className="inline-flex items-center gap-1 text-[10px] text-violet-700 bg-violet-50 px-2 py-0.5 rounded mt-1">
                                <Info className="w-3 h-3 text-violet-600" />
                                <span>Miễn phí 8km đầu tiên, phụ thu 15.000đ/km để hỗ trợ thợ di chuyển</span>
                              </div>
                            </div>
                            <span className="font-bold text-slate-900 text-xs">+{formatVND(travelFee)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center py-1.5 border-t border-slate-200/60 text-xs text-emerald-700">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold">3. Phí di chuyển tiêu chuẩn (≤8km):</span>
                              <div className="group relative inline-block">
                                <Info className="w-3.5 h-3.5 text-emerald-600 cursor-pointer" />
                                <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-60 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-lg z-20 leading-snug">
                                  Miễn phí 8km đầu tiên, phụ thu 15.000đ/km để hỗ trợ thợ di chuyển
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] text-emerald-600 block">
                              Miễn phí 8km đầu tiên, phụ thu 15.000đ/km để hỗ trợ thợ di chuyển
                            </span>
                          </div>
                          <span className="font-bold">0 VNĐ (Miễn phí)</span>
                        </div>
                      )}

                      {/* Studio Rental if any */}
                      {isStudioRental && studioFee > 0 && (
                        <div className="flex justify-between items-center py-1 border-t border-slate-200/60">
                          <div>
                            <span className="font-semibold text-slate-800">
                              4. Hỗ trợ thuê Studio cơ bản:
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {studioHours} giờ × 150.000 VNĐ / giờ • Chuyển 100% cho Thợ/Studio
                            </span>
                          </div>
                          <span className="font-bold text-slate-900">+{formatVND(studioFee)}</span>
                        </div>
                      )}

                      {discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-semibold pt-1 border-t border-slate-200/60">
                          <span>Giảm giá Voucher ({appliedVoucher.code}):</span>
                          <span>-{formatVND(discountAmount)}</span>
                        </div>
                      )}

                      {/* Total Amount Payable */}
                      <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
                        <div>
                          <span>Tổng khách thanh toán:</span>
                          <span className="text-[10px] text-slate-400 font-normal block">
                            (Gói + Add-ons) + Phụ thu di chuyển
                          </span>
                        </div>
                        <span className="text-violet-700 font-black text-base">{formatVND(totalPayable)}</span>
                      </div>

                      {/* Escrow Deposit (30%) */}
                      <div className="flex justify-between items-center text-emerald-800 font-bold bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                        <div>
                          <span className="text-xs">Số tiền đặt cọc 30% qua Escrow hôm nay:</span>
                          <span className="text-[10px] text-emerald-600 block font-normal">
                            Bảo vệ ký quỹ an toàn – Chỉ giải ngân sau khi bạn duyệt nhận ảnh
                          </span>
                        </div>
                        <span className="font-black text-base text-emerald-700">{formatVND(depositAmount)}</span>
                      </div>

                      <div className="flex justify-between text-slate-500 text-[11px] px-1">
                        <span>70% còn lại thanh toán sau buổi chụp:</span>
                        <span className="font-bold text-slate-700">{formatVND(remainingAmount)}</span>
                      </div>
                    </div>
                  </div>

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
                
                {/* Distance fee with tooltip */}
                {travelFee > 0 ? (
                  <div className="pt-1.5 border-t border-slate-100">
                    <div className="flex justify-between text-[11px] text-slate-700">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <Car className="w-3 h-3 text-violet-600" />
                        Phụ thu di chuyển (&gt;8km: {extraDistanceKm}km):
                        <div className="group relative inline-block">
                          <Info className="w-3 h-3 text-violet-600 cursor-pointer" />
                          <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-52 p-2 bg-slate-900 text-white text-[10px] rounded shadow-lg z-20 leading-snug">
                            Miễn phí 8km đầu tiên, phụ thu 15.000đ/km để hỗ trợ thợ di chuyển
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                          </div>
                        </div>
                      </span>
                      <span className="font-bold text-slate-900">+{formatVND(travelFee)}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {extraDistanceKm} km vượt × 15.000đ/km (Thợ nhận 100%)
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between text-[11px] text-emerald-700 pt-1">
                    <span className="flex items-center gap-1">
                      <Car className="w-3 h-3 text-emerald-600" />
                      Phí di chuyển (≤8km):
                      <div className="group relative inline-block">
                        <Info className="w-3 h-3 text-emerald-600 cursor-pointer" />
                        <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-52 p-2 bg-slate-900 text-white text-[10px] rounded shadow-lg z-20 leading-snug">
                          Miễn phí 8km đầu tiên, phụ thu 15.000đ/km để hỗ trợ thợ di chuyển
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                        </div>
                      </div>
                    </span>
                    <span className="font-bold">0 VNĐ (Miễn phí)</span>
                  </div>
                )}

                {/* Studio rental fee */}
                {isStudioRental && studioFee > 0 && (
                  <div className="flex justify-between text-[11px] text-slate-700 pt-1">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-violet-600" />
                      Thuê Studio ({studioHours}h × 150k):
                    </span>
                    <span className="font-bold text-slate-900">+{formatVND(studioFee)}</span>
                  </div>
                )}

                {/* Addons list */}
                {selectedAddonIds.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold text-slate-700">Dịch vụ mua thêm ({selectedAddonIds.length}):</span>
                      <span className="text-[11px] font-bold text-slate-900">+{formatVND(addonsItemsTotal)}</span>
                    </div>
                    {selectedAddonIds.map(id => {
                      const ad = ADDONS.find(a => a.id === id)
                      return (
                        <div key={id} className="flex justify-between text-[11px] text-slate-500 py-0.5">
                          <span className="truncate pr-2">• {ad?.name}</span>
                          <span className="font-semibold text-slate-800 whitespace-nowrap">+{formatVND(ad?.price || 0)}</span>
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
                  <Button size="sm" onClick={() => handleApplyVoucher()} variant="outline" className="h-8 rounded-lg text-xs px-2.5">
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

              {/* Totals Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Tổng tiền dịch vụ (Gross):</span>
                  <span className="font-semibold text-slate-800">{formatVND(packagePrice + addonsItemsTotal)}</span>
                </div>
                {(travelFee > 0 || studioFee > 0) && (
                  <div className="flex justify-between text-[11px]">
                    <span>Phụ phí bù thợ (100%):</span>
                    <span className="font-semibold text-slate-800">+{formatVND(travelFee + studioFee)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Giảm giá voucher:</span>
                    <span>-{formatVND(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100 text-sm">
                  <span>Tổng khách thanh toán:</span>
                  <span className="text-violet-700 font-black">{formatVND(totalPayable)}</span>
                </div>
                <div className="flex justify-between font-black text-emerald-700 text-sm bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                  <span>Số tiền đặt cọc 30% (Escrow):</span>
                  <span>{formatVND(depositAmount)}</span>
                </div>
                <p className="text-[10px] text-slate-400 text-right">
                  70% ({formatVND(remainingAmount)}) thanh toán sau buổi chụp
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

