import { DEFAULT_COMMISSION } from '../constants'

export type AddonType =
  | 'extra_time'
  | 'extra_retouch'
  | 'express_delivery'
  | 'reels_video'
  | 'makeup_hair'
  | 'travel_fee'
  | 'studio_fee'
  | 'outfit_rental'
  | 'other'

export interface AddonItemForCommission {
  id?: string
  name: string
  type?: AddonType
  category?: 'service' | 'reimbursement'
  amountVnd: number
  partnerRatePercent?: number
}

export interface CommissionCalculationParams {
  packageSlug?: string
  packageAmountVnd: number
  photographerCompletedCount?: number
  isReturningCustomer?: boolean
  isTopRated?: boolean
  hasStarOfTheQuarterBenefit?: boolean
  addons?: AddonItemForCommission[]
  travelFee?: number
  studioFee?: number
}

export interface AddonCommissionResult {
  name: string
  type: AddonType
  category: 'service' | 'reimbursement'
  amountVnd: number
  ratePercent: number
  commissionVnd: number
  netPartnerVnd: number
  description: string
}

export interface BookingCommissionBreakdown {
  packageRuleName: string
  packageRatePercent: number
  packageAmountVnd: number
  packageCommissionVnd: number
  packageNetVnd: number

  // Anti-circumvention re-booking incentives
  isReturningCustomer?: boolean
  isTopRated?: boolean
  rebookDiscountNote?: string
  commissionSavingsVnd?: number

  // Addons detail
  addonCommissions: AddonCommissionResult[]
  addonsTotalVnd: number
  addonsCommissionVnd: number
  addonsNetVnd: number

  // Marketplace 2 Groups
  // Nhóm 1: Doanh thu Dịch vụ (Gross Service Value) = Gói gốc + Add-ons dịch vụ
  grossServiceValue: number
  photographerServicePayout: number // Tiền công chụp thực nhận sau trừ phí sàn

  // Nhóm 2: Phụ phí Hoàn trả (Reimbursement Fees) = Di chuyển (>8km) + Studio/Vé (100% thợ)
  travelFee: number
  studioFee: number
  reimbursementFees: number
  photographerReimbursementPayout: number // 100% phụ thu hoàn trả chuyển trọn cho thợ

  // Tổng cộng
  totalGrossVnd: number
  totalPlatformCommissionVnd: number
  totalNetPayoutVnd: number
}

/**
 * Identify addon type based on name or explicit type
 */
export function identifyAddonType(name: string, explicitType?: AddonType): AddonType {
  if (explicitType) return explicitType
  const lower = name.toLowerCase()
  if (lower.includes('di chuyển') || lower.includes('km') || lower.includes('travel')) {
    return 'travel_fee'
  }
  if (lower.includes('studio') || lower.includes('phòng chụp') || lower.includes('vé chụp')) {
    return 'studio_fee'
  }
  if (lower.includes('thời gian') || lower.includes('30 phút') || lower.includes('extra time')) {
    return 'extra_time'
  }
  if (lower.includes('retouch') || lower.includes('chỉnh sửa thêm')) {
    return 'extra_retouch'
  }
  if (lower.includes('hỏa tốc') || lower.includes('siêu tốc') || lower.includes('24h') || lower.includes('express')) {
    return 'express_delivery'
  }
  if (lower.includes('video') || lower.includes('reels') || lower.includes('tiktok') || lower.includes('hậu trường')) {
    return 'reels_video'
  }
  if (lower.includes('trang điểm') || lower.includes('makeup') || lower.includes('làm tóc') || lower.includes('hair')) {
    return 'makeup_hair'
  }
  if (lower.includes('áo dài') || lower.includes('trang phục') || lower.includes('váy') || lower.includes('outfit')) {
    return 'outfit_rental'
  }
  return 'other'
}

/**
 * Identify if an item belongs to Reimbursement (Nhóm 2) or Service Revenue (Nhóm 1)
 */
export function isReimbursementItem(type: AddonType, explicitCategory?: 'service' | 'reimbursement'): boolean {
  if (explicitCategory) return explicitCategory === 'reimbursement'
  return type === 'travel_fee' || type === 'studio_fee'
}

/**
 * Tính hoa hồng cho từng mục Add-on:
 * - Nhóm 1 (Dịch vụ): Áp dụng % hoa hồng sàn (mặc định 15%, hoặc 0% nếu Star benefit)
 * - Nhóm 2 (Phụ phí hoàn trả - Di chuyển/Studio): 0% hoa hồng, thợ nhận 100%
 */
export function calculateAddonCommission(
  addon: AddonItemForCommission,
  serviceCommissionRate: number = DEFAULT_COMMISSION.TAKE_RATE
): AddonCommissionResult {
  const type = identifyAddonType(addon.name, addon.type)
  const isReimb = isReimbursementItem(type, addon.category)
  const category: 'service' | 'reimbursement' = isReimb ? 'reimbursement' : 'service'

  if (isReimb) {
    // Nhóm 2: 100% về thợ, 0% phí sàn
    return {
      name: addon.name,
      type,
      category,
      amountVnd: addon.amountVnd,
      ratePercent: 0,
      commissionVnd: 0,
      netPartnerVnd: addon.amountVnd,
      description: 'Phụ phí hoàn trả: Thợ nhận 100% (FLASHY không thu chiết khấu)',
    }
  }

  // Nhóm 1: Doanh thu Dịch vụ mua thêm (Add-ons) -> Chịu phí sàn chung
  const ratePercent = serviceCommissionRate
  const commissionVnd = Math.round((addon.amountVnd * ratePercent) / 100)
  const netPartnerVnd = addon.amountVnd - commissionVnd

  return {
    name: addon.name,
    type,
    category,
    amountVnd: addon.amountVnd,
    ratePercent,
    commissionVnd,
    netPartnerVnd,
    description: `Dịch vụ mua thêm: Phí sàn ${ratePercent}%, Thợ nhận ${100 - ratePercent}%`,
  }
}

/**
 * Marketplace Commission Engine for FLASHY
 * 
 * Chuẩn mô hình Marketplace 2 nguồn tiền:
 *  - Nhóm 1: Doanh thu Dịch vụ (Gross Service Value) = Giá Gói Gốc + Dịch Vụ Mua Thêm (Add-ons)
 *    -> Áp dụng Tỷ lệ hoa hồng sàn (15% hoặc 0% nếu Star of the Quarter)
 *  - Nhóm 2: Phụ phí Hoàn trả (Reimbursement Fees) = Phụ thu di chuyển ngoài 8km + Thuê studio/vé
 *    -> Chuyển TRÒN 100% cho Thợ, Tuyệt đối KHÔNG trích phí sàn
 */
export function calculateFullBookingCommission({
  packageSlug,
  packageAmountVnd,
  photographerCompletedCount = 0,
  isReturningCustomer = false,
  isTopRated = false,
  hasStarOfTheQuarterBenefit = false,
  addons = [],
  travelFee = 0,
  studioFee = 0,
}: CommissionCalculationParams): BookingCommissionBreakdown {
  // Tỷ lệ hoa hồng sàn áp dụng cho Dịch vụ (Nhóm 1)
  // - Đơn hàng mới: 15%
  // - Đơn hàng được tạo từ nút "Đặt lại thợ cũ" (Re-book): Tự động giảm xuống 10% (hoặc 8% cho Top Rated)
  let packageRatePercent: number = DEFAULT_COMMISSION.TAKE_RATE // 15%
  let packageRuleName = 'MARKETPLACE_SERVICE_15_TAKE_RATE'
  let rebookDiscountNote: string | undefined = undefined

  if (hasStarOfTheQuarterBenefit) {
    packageRatePercent = 0
    packageRuleName = 'STAR_OF_THE_QUARTER_REWARD'
  } else if (isReturningCustomer) {
    if (isTopRated) {
      packageRatePercent = 8
      packageRuleName = 'REBOOK_TOP_RATED_8_PERCENT'
      rebookDiscountNote = 'Đơn hàng từ khách cũ - Bạn được giảm phí sàn từ 15% xuống 8% (Thợ Top Rated)!'
    } else {
      packageRatePercent = 10
      packageRuleName = 'REBOOK_LOYALTY_10_PERCENT'
      rebookDiscountNote = 'Đơn hàng từ khách cũ - Bạn được giảm phí sàn từ 15% xuống 10%!'
    }
  }

  void packageSlug
  void photographerCompletedCount

  // Hoa hồng gói gốc
  const packageCommissionVnd = Math.round((packageAmountVnd * packageRatePercent) / 100)
  const packageNetVnd = packageAmountVnd - packageCommissionVnd

  // Tính các mục Add-on
  const addonCommissions: AddonCommissionResult[] = addons.map((addon) =>
    calculateAddonCommission(addon, packageRatePercent)
  )

  // Bóc tách theo nhóm
  const serviceAddons = addonCommissions.filter((a) => a.category === 'service')
  const reimbAddons = addonCommissions.filter((a) => a.category === 'reimbursement')

  const serviceAddonsTotalVnd = serviceAddons.reduce((sum, item) => sum + item.amountVnd, 0)
  const serviceAddonsCommissionVnd = serviceAddons.reduce((sum, item) => sum + item.commissionVnd, 0)
  const serviceAddonsNetVnd = serviceAddons.reduce((sum, item) => sum + item.netPartnerVnd, 0)

  // Nhóm 1: Gross Service Value = Gói gốc + Add-ons dịch vụ
  const grossServiceValue = packageAmountVnd + serviceAddonsTotalVnd
  const photographerServicePayout = packageNetVnd + serviceAddonsNetVnd // = grossServiceValue - platformCommission

  // Tính số tiền hoa hồng thợ tiết kiệm được nhờ chính sách Giữ chân khách cũ (Anti-Circumvention)
  let commissionSavingsVnd = 0
  if (isReturningCustomer && packageRatePercent < DEFAULT_COMMISSION.TAKE_RATE) {
    const standardFee = Math.round((grossServiceValue * DEFAULT_COMMISSION.TAKE_RATE) / 100)
    const actualFee = packageCommissionVnd + serviceAddonsCommissionVnd
    commissionSavingsVnd = Math.max(0, standardFee - actualFee)
  }

  // Nhóm 2: Phụ phí hoàn trả = Travel fee + Studio fee + Reimbursement addons
  const extraTravel = Math.max(0, travelFee)
  const extraStudio = Math.max(0, studioFee)
  const reimbursementFees =
    extraTravel +
    extraStudio +
    reimbAddons.reduce((sum, item) => sum + item.amountVnd, 0)
  const photographerReimbursementPayout = reimbursementFees // 100% cho thợ

  // Addons tổng hợp
  const addonsTotalVnd = addonCommissions.reduce((sum, item) => sum + item.amountVnd, 0)
  const addonsCommissionVnd = addonCommissions.reduce((sum, item) => sum + item.commissionVnd, 0)
  const addonsNetVnd = addonCommissions.reduce((sum, item) => sum + item.netPartnerVnd, 0)

  // Tổng cộng
  const totalGrossVnd = grossServiceValue + reimbursementFees
  const totalPlatformCommissionVnd = packageCommissionVnd + serviceAddonsCommissionVnd
  const totalNetPayoutVnd = photographerServicePayout + photographerReimbursementPayout

  return {
    packageRuleName,
    packageRatePercent,
    packageAmountVnd,
    packageCommissionVnd,
    packageNetVnd,

    isReturningCustomer,
    isTopRated,
    rebookDiscountNote,
    commissionSavingsVnd,

    addonCommissions,
    addonsTotalVnd,
    addonsCommissionVnd,
    addonsNetVnd,

    grossServiceValue,
    photographerServicePayout,

    travelFee: extraTravel,
    studioFee: extraStudio,
    reimbursementFees,
    photographerReimbursementPayout,

    totalGrossVnd,
    totalPlatformCommissionVnd,
    totalNetPayoutVnd,
  }
}

/**
 * ĐỊNH NGHĨA CÔNG THỨC BACKEND / CHECKOUT FINANCIAL SPLIT:
 * 
 * 1. Nhóm 1: Doanh thu Dịch vụ (Gross Service Value) = Giá Gói Gốc + Giá Add-ons
 *    - Hoa Hồng App Thu = (Giá Gói Gốc + Giá Add-ons) * (% Hoa Hồng App)
 *    - Tiền Công Thợ = (Giá Gói Gốc + Giá Add-ons) * (1 - % Hoa Hồng App)
 * 
 * 2. Nhóm 2: Phụ phí Hoàn trả (Reimbursement Fees) = Phụ Thu Di Chuyển + Thuê Studio/Vé
 *    - Chuyển TRÒN 100% cho Thợ, 0% chiết khấu sàn
 * 
 * 3. Tổng kết:
 *    - Tổng Khách Thanh Toán = Gross Service Value + Reimbursement Fees
 *    - Thu Nhập Thợ Thực Nhận (Escrow Payout) = Tiền Công Thợ + Reimbursement Fees
 */
export interface FinancialSplitParams {
  packagePrice: number
  addonsTotal?: number
  travelFee?: number
  studioFee?: number
  totalAmount?: number
  commissionRate?: number
}

export interface FinancialSplitResult {
  packagePrice: number
  addonsTotal: number
  travelFee: number
  studioFee: number

  // Nhóm 1: Doanh thu Dịch vụ (Gross Service Value)
  grossServiceValue: number
  platformRatePercent: number
  platformFee: number // (Gói + Add-ons) * 15%
  photographerServiceShare: number // (Gói + Add-ons) * 85% - Tiền công chụp

  // Nhóm 2: Phụ phí Hoàn trả (Reimbursement Fees)
  reimbursementFees: number // Phụ thu di chuyển + Studio
  photographerReimbursementShare: number // 100% tiền bù di chuyển & studio cho thợ

  // Tổng cộng
  extraFeesTotal: number
  totalAmount: number
  photographerNet: number // Tiền công chụp + Tiền bù di chuyển (100%)
  depositAmount: number // 30% tiền cọc Escrow

  summaryText: string
}

export function calculateFinancialSplit({
  packagePrice,
  addonsTotal = 0,
  travelFee = 0,
  studioFee = 0,
  totalAmount,
  commissionRate = DEFAULT_COMMISSION.TAKE_RATE,
}: FinancialSplitParams): FinancialSplitResult {
  const safePackagePrice = Math.max(0, packagePrice)
  const safeAddonsTotal = Math.max(0, addonsTotal)
  const safeTravelFee = Math.max(0, travelFee)
  const safeStudioFee = Math.max(0, studioFee)

  // Nhóm 1: Doanh thu Dịch vụ (Gross Service Value) = [Giá Gói Gốc] + [Tổng Giá Add-ons]
  const grossServiceValue = safePackagePrice + safeAddonsTotal

  // Hoa hồng app thu trên Nhóm 1
  const platformFee = Math.round((grossServiceValue * commissionRate) / 100)

  // Tiền công chụp thợ thực nhận (sau khi trừ phí sàn)
  const photographerServiceShare = grossServiceValue - platformFee

  // Nhóm 2: Phụ phí Hoàn trả (Reimbursement Fees) = [Phụ thu di chuyển >8km] + [Studio/Vé]
  const reimbursementFees = safeTravelFee + safeStudioFee
  const photographerReimbursementShare = reimbursementFees // 100% cho thợ

  // Tổng thanh toán của khách
  const computedTotal = grossServiceValue + reimbursementFees
  const resolvedTotal = totalAmount && totalAmount > 0 ? totalAmount : computedTotal

  // Thu nhập thợ thực nhận = Tiền công chụp + Tiền bù di chuyển/studio (100%)
  const photographerNet = photographerServiceShare + photographerReimbursementShare

  // Tiền cọc Escrow (30%)
  const depositAmount = Math.round((resolvedTotal * 30) / 100)

  return {
    packagePrice: safePackagePrice,
    addonsTotal: safeAddonsTotal,
    travelFee: safeTravelFee,
    studioFee: safeStudioFee,

    grossServiceValue,
    platformRatePercent: commissionRate,
    platformFee,
    photographerServiceShare,

    reimbursementFees,
    photographerReimbursementShare,

    extraFeesTotal: safeAddonsTotal + reimbursementFees,
    totalAmount: resolvedTotal,
    photographerNet,
    depositAmount,

    summaryText: `Dịch vụ: ${grossServiceValue.toLocaleString('vi-VN')}₫ (Phí sàn ${commissionRate}%: ${platformFee.toLocaleString('vi-VN')}₫, Tiền công thợ: ${photographerServiceShare.toLocaleString('vi-VN')}₫) | Bù di chuyển/studio (100%): ${reimbursementFees.toLocaleString('vi-VN')}₫ | Thợ thực nhận: ${photographerNet.toLocaleString('vi-VN')}₫`,
  }
}


