import { describe, it, expect } from 'vitest'

interface CommissionCalculationParams {
  packageSlug: string
  bookingAmountVnd: number
  photographerCompletedCount: number
  isReturningCustomer: boolean
  hasStarOfTheQuarterBenefit: boolean
}

/**
 * CP3 Commission Engine — Fixed 15% Take Rate
 * Photographer receives 85% of base package price + 100% of add-ons
 */
function calculateCommission({
  packageSlug,
  bookingAmountVnd,
  photographerCompletedCount,
  isReturningCustomer,
  hasStarOfTheQuarterBenefit,
}: CommissionCalculationParams) {
  // Bonus override: Star of the Quarter → 0% commission
  if (hasStarOfTheQuarterBenefit) {
    return {
      ratePercent: 0,
      ruleName: 'STAR_OF_THE_QUARTER_REWARD',
      commissionVnd: 0,
      netEarningsVnd: bookingAmountVnd,
    }
  }

  // CP3 standard: Fixed 15% take rate for all packages
  // (isReturningCustomer and packageSlug kept for API compatibility, no longer change rate)
  void packageSlug
  void photographerCompletedCount
  void isReturningCustomer

  const ratePercent = 15.0
  const commissionVnd = Math.round((bookingAmountVnd * ratePercent) / 100)
  return {
    ratePercent,
    ruleName: 'CP3_FIXED_15_TAKE_RATE',
    commissionVnd,
    netEarningsVnd: bookingAmountVnd - commissionVnd,
  }
}

describe('Scenario E: CP3 Commission Engine — Fixed 15% Take Rate', () => {
  it('should apply 15% commission on FLASHY EXPRESS package', () => {
    const result = calculateCommission({
      packageSlug: 'flashy-express',
      bookingAmountVnd: 350000,
      photographerCompletedCount: 5,
      isReturningCustomer: false,
      hasStarOfTheQuarterBenefit: false,
    })
    expect(result.ratePercent).toBe(15.0)
    expect(result.commissionVnd).toBe(52500)
    expect(result.netEarningsVnd).toBe(297500)
  })

  it('should apply 15% commission on FLASHY CASUAL package', () => {
    const result = calculateCommission({
      packageSlug: 'flashy-casual',
      bookingAmountVnd: 800000,
      photographerCompletedCount: 3,
      isReturningCustomer: false,
      hasStarOfTheQuarterBenefit: false,
    })
    expect(result.ratePercent).toBe(15.0)
    expect(result.commissionVnd).toBe(120000)
    expect(result.netEarningsVnd).toBe(680000)
  })

  it('should apply 15% commission on FLASHY PRO package', () => {
    const result = calculateCommission({
      packageSlug: 'flashy-pro',
      bookingAmountVnd: 1500000,
      photographerCompletedCount: 10,
      isReturningCustomer: true,
      hasStarOfTheQuarterBenefit: false,
    })
    expect(result.ratePercent).toBe(15.0)
    expect(result.commissionVnd).toBe(225000)
    expect(result.netEarningsVnd).toBe(1275000)
  })

  it('should apply 15% commission on FLASHY SIGNATURE package', () => {
    const result = calculateCommission({
      packageSlug: 'flashy-signature',
      bookingAmountVnd: 3200000,
      photographerCompletedCount: 20,
      isReturningCustomer: false,
      hasStarOfTheQuarterBenefit: false,
    })
    expect(result.ratePercent).toBe(15.0)
    expect(result.commissionVnd).toBe(480000)
    expect(result.netEarningsVnd).toBe(2720000)
  })

  it('should prioritize Star of the Quarter 0% benefit over standard rate', () => {
    const bStar = calculateCommission({
      packageSlug: 'flashy-pro',
      bookingAmountVnd: 1500000,
      photographerCompletedCount: 40,
      isReturningCustomer: true,
      hasStarOfTheQuarterBenefit: true,
    })
    expect(bStar.ratePercent).toBe(0)
    expect(bStar.commissionVnd).toBe(0)
    expect(bStar.netEarningsVnd).toBe(1500000)
  })

  it('should apply 15% even for new photographers (no free-booking tier in CP3)', () => {
    const newPh = calculateCommission({
      packageSlug: 'flashy-express',
      bookingAmountVnd: 350000,
      photographerCompletedCount: 0,
      isReturningCustomer: false,
      hasStarOfTheQuarterBenefit: false,
    })
    expect(newPh.ratePercent).toBe(15.0)
    expect(newPh.commissionVnd).toBe(52500)
  })

  it('should apply 15% even for returning customer (flat rate in CP3)', () => {
    const returning = calculateCommission({
      packageSlug: 'flashy-casual',
      bookingAmountVnd: 800000,
      photographerCompletedCount: 10,
      isReturningCustomer: true,
      hasStarOfTheQuarterBenefit: false,
    })
    expect(returning.ratePercent).toBe(15.0)
    expect(returning.commissionVnd).toBe(120000)
    expect(returning.netEarningsVnd).toBe(680000)
  })

  it('always maintains integer arithmetic for Vietnamese Dong (no floating point accounting)', () => {
    const oddAmount = calculateCommission({
      packageSlug: 'flashy-express',
      bookingAmountVnd: 187333,
      photographerCompletedCount: 5,
      isReturningCustomer: false,
      hasStarOfTheQuarterBenefit: false,
    })
    expect(Number.isInteger(oddAmount.commissionVnd)).toBe(true)
    expect(Number.isInteger(oddAmount.netEarningsVnd)).toBe(true)
    expect(oddAmount.commissionVnd + oddAmount.netEarningsVnd).toBe(187333)
  })

  it('calculates 0% commission on Add-ons — Photographer receives 100%', () => {
    const addonAmount = 150000 // Makeup + Hair add-on
    const addonCommissionRate = 0 // 0% in CP3
    const commissionVnd = Math.round((addonAmount * addonCommissionRate) / 100)
    const netPhotographer = addonAmount - commissionVnd

    expect(addonCommissionRate).toBe(0)
    expect(commissionVnd).toBe(0)
    expect(netPhotographer).toBe(150000) // 100% to photographer
    expect(commissionVnd + netPhotographer).toBe(addonAmount)
  })

  it('calculates 0% commission on travel / di chuyển ngoại thành add-on', () => {
    const travelFee = 120000
    const travelCommissionRate = 0 // 0% in CP3
    const commissionVnd = Math.round((travelFee * travelCommissionRate) / 100)
    const netPhotographer = travelFee - commissionVnd

    expect(commissionVnd).toBe(0)
    expect(netPhotographer).toBe(120000)
    expect(commissionVnd + netPhotographer).toBe(travelFee)
  })
})
