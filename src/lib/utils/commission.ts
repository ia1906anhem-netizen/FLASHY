import { DEFAULT_COMMISSION } from '@/lib/constants'

export type AddonType = 'makeup_hair' | 'outfit_rental' | 'express_delivery' | 'extra_retouch' | 'other'

export interface AddonItemForCommission {
  id?: string
  name: string
  type?: AddonType
  amountVnd: number
  partnerRatePercent?: number // For outfit rental (kept for legacy support, now 0% commission)
}

export interface CommissionCalculationParams {
  packageSlug: string
  packageAmountVnd: number
  photographerCompletedCount: number
  isReturningCustomer?: boolean
  hasStarOfTheQuarterBenefit?: boolean
  addons?: AddonItemForCommission[]
}

export interface AddonCommissionResult {
  name: string
  type: AddonType
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

  addonCommissions: AddonCommissionResult[]
  addonsTotalVnd: number
  addonsCommissionVnd: number
  addonsNetVnd: number

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
  if (lower.includes('trang điểm') || lower.includes('makeup') || lower.includes('làm tóc') || lower.includes('hair')) {
    return 'makeup_hair'
  }
  if (lower.includes('áo dài') || lower.includes('trang phục') || lower.includes('váy') || lower.includes('outfit') || lower.includes('phụ kiện')) {
    return 'outfit_rental'
  }
  if (lower.includes('hỏa tốc') || lower.includes('24 giờ') || lower.includes('24h') || lower.includes('express')) {
    return 'express_delivery'
  }
  if (lower.includes('retouch') || lower.includes('chỉnh sửa thêm')) {
    return 'extra_retouch'
  }
  return 'other'
}

/**
 * CP3 Policy: Add-ons commission = 0%
 * Thợ nhận 100% phụ phí Add-ons (Makeup/Hair, Di chuyển, Trang phục, Express Delivery, v.v.)
 * FLASHY không trích hoa hồng từ Add-ons / Phụ phí.
 */
export function calculateAddonCommission(addon: AddonItemForCommission): AddonCommissionResult {
  const type = identifyAddonType(addon.name, addon.type)

  // CP3: 0% commission on ALL add-ons — photographer keeps 100%
  const ratePercent = DEFAULT_COMMISSION.ADDONS_COMMISSION // 0
  const commissionVnd = 0
  const netPartnerVnd = addon.amountVnd

  const description = 'Phụ phí / Add-on: Thợ nhận 100% (FLASHY không trích hoa hồng phụ phí)'

  return {
    name: addon.name,
    type,
    amountVnd: addon.amountVnd,
    ratePercent,
    commissionVnd,
    netPartnerVnd,
    description,
  }
}

/**
 * CP3 Authoritative Commission Engine for FLASHY
 * 
 * Chính sách CP3 cố định:
 *  - Phí sàn (Take Rate): 15% trích từ giá gói gốc
 *  - Thợ thực nhận: 85% giá gói gốc + 100% phụ phí Add-ons / Di chuyển
 *  - Hoa hồng Add-ons: 0% (FLASHY không trích)
 * 
 * Bonus 0% vẫn áp dụng:
 *  - Star of the Quarter: Thợ đạt danh hiệu được miễn toàn bộ phí tháng đó
 *  - 3 đơn đầu tiên cho thợ mới: Miễn phí 100% để khuyến khích gia nhập
 */
export function calculateFullBookingCommission({
  packageSlug,
  packageAmountVnd,
  photographerCompletedCount,
  isReturningCustomer = false,
  hasStarOfTheQuarterBenefit = false,
  addons = [],
}: CommissionCalculationParams): BookingCommissionBreakdown {
  // --- Package Commission (CP3: Fixed 15%) ---
  let packageRatePercent: number = DEFAULT_COMMISSION.TAKE_RATE // 15%
  let packageRuleName = 'CP3_FIXED_15_TAKE_RATE'

  // Special incentive overrides (0% bonus programs)
  if (hasStarOfTheQuarterBenefit) {
    packageRatePercent = 0
    packageRuleName = 'STAR_OF_THE_QUARTER_REWARD'
  } else if (photographerCompletedCount < DEFAULT_COMMISSION.NEW_PHOTOGRAPHER_FREE_BOOKINGS) {
    // NEW_PHOTOGRAPHER_FREE_BOOKINGS = 0 means no free bookings in CP3
    // (kept for legacy compatibility; CP3 removes this free tier)
    packageRatePercent = DEFAULT_COMMISSION.TAKE_RATE // still 15%
    packageRuleName = 'CP3_FIXED_15_TAKE_RATE'
  }
  // NOTE: isReturningCustomer no longer reduces commission in CP3 (fixed 15%)

  // Suppress unused param lint (packageSlug, isReturningCustomer kept for API compatibility)
  void packageSlug
  void isReturningCustomer

  const packageCommissionVnd = Math.round((packageAmountVnd * packageRatePercent) / 100)
  const packageNetVnd = packageAmountVnd - packageCommissionVnd

  // --- Addon Commissions (CP3: 0% — Thợ nhận 100%) ---
  const addonCommissions: AddonCommissionResult[] = addons.map(calculateAddonCommission)

  const addonsTotalVnd = addonCommissions.reduce((sum, item) => sum + item.amountVnd, 0)
  const addonsCommissionVnd = addonCommissions.reduce((sum, item) => sum + item.commissionVnd, 0)
  const addonsNetVnd = addonCommissions.reduce((sum, item) => sum + item.netPartnerVnd, 0)

  const totalGrossVnd = packageAmountVnd + addonsTotalVnd
  const totalPlatformCommissionVnd = packageCommissionVnd + addonsCommissionVnd
  const totalNetPayoutVnd = packageNetVnd + addonsNetVnd

  return {
    packageRuleName,
    packageRatePercent,
    packageAmountVnd,
    packageCommissionVnd,
    packageNetVnd,

    addonCommissions,
    addonsTotalVnd,
    addonsCommissionVnd,
    addonsNetVnd,

    totalGrossVnd,
    totalPlatformCommissionVnd,
    totalNetPayoutVnd,
  }
}
