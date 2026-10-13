import { DEFAULT_COMMISSION } from '@/lib/constants'

export type AddonType = 'makeup_hair' | 'outfit_rental' | 'express_delivery' | 'extra_retouch' | 'other'

export interface AddonItemForCommission {
  id?: string
  name: string
  type?: AddonType
  amountVnd: number
  partnerRatePercent?: number // For outfit rental (10% - 12%)
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
 * Calculates platform commission for an individual add-on service.
 * Special marketplace rules:
 * - Dịch vụ Makeup / Làm tóc: 10% (Áp dụng cho Makeup Artist tự do)
 * - Dịch vụ Thuê trang phục & Phụ kiện: 10% – 12% (Chiết khấu từ các Shop đối tác)
 */
export function calculateAddonCommission(addon: AddonItemForCommission): AddonCommissionResult {
  const type = identifyAddonType(addon.name, addon.type)
  let ratePercent = 0
  let description = ''

  if (type === 'makeup_hair') {
    ratePercent = DEFAULT_COMMISSION.MAKEUP_HAIR // 10%
    description = 'Dịch vụ Makeup / Làm tóc: 10% (Áp dụng cho Makeup Artist tự do)'
  } else if (type === 'outfit_rental') {
    // Range 10% - 12%, default 12%
    const requestedRate = addon.partnerRatePercent ?? DEFAULT_COMMISSION.OUTFIT_RENTAL
    ratePercent = Math.min(
      DEFAULT_COMMISSION.OUTFIT_RENTAL_MAX,
      Math.max(DEFAULT_COMMISSION.OUTFIT_RENTAL_MIN, requestedRate)
    )
    description = `Dịch vụ Thuê trang phục & Phụ kiện: ${ratePercent}% (Chiết khấu từ các Shop đối tác)`
  } else {
    // Other service add-ons (standard 6%)
    ratePercent = DEFAULT_COMMISSION.FLASH_SHOT // 6%
    description = 'Dịch vụ phụ trợ tiêu chuẩn'
  }

  // Integer VND arithmetic
  const commissionVnd = Math.round((addon.amountVnd * ratePercent) / 100)
  const netPartnerVnd = addon.amountVnd - commissionVnd

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
 * Authoritative Commission Engine for FLASHY
 * Computes exact integer VND splits across photography package and creative add-on services.
 */
export function calculateFullBookingCommission({
  packageSlug,
  packageAmountVnd,
  photographerCompletedCount,
  isReturningCustomer = false,
  hasStarOfTheQuarterBenefit = false,
  addons = [],
}: CommissionCalculationParams): BookingCommissionBreakdown {
  // --- Package Commission ---
  let packageRatePercent = 6.0
  let packageRuleName = 'STANDARD_PACKAGE_COMMISSION'

  if (hasStarOfTheQuarterBenefit) {
    packageRatePercent = 0
    packageRuleName = 'STAR_OF_THE_QUARTER_REWARD'
  } else if (photographerCompletedCount < DEFAULT_COMMISSION.NEW_PHOTOGRAPHER_FREE_BOOKINGS) {
    packageRatePercent = 0
    packageRuleName = 'FIRST_3_BOOKINGS_FREE'
  } else if (isReturningCustomer) {
    packageRatePercent = DEFAULT_COMMISSION.RETURNING_CUSTOMER // 4%
    packageRuleName = 'RETURNING_CUSTOMER_PROMOTION'
  } else {
    if (packageSlug === 'vibe-sai-gon' || packageSlug === 'outdoor') {
      packageRatePercent = DEFAULT_COMMISSION.VIBE_SAI_GON // 9%
    } else {
      packageRatePercent = DEFAULT_COMMISSION.FLASH_SHOT // 6%
    }
  }

  const packageCommissionVnd = Math.round((packageAmountVnd * packageRatePercent) / 100)
  const packageNetVnd = packageAmountVnd - packageCommissionVnd

  // --- Addon Commissions ---
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
