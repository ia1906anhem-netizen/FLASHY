import { describe, it, expect } from 'vitest'

interface CommissionCalculationParams {
  packageSlug: string
  bookingAmountVnd: number
  photographerCompletedCount: number
  isReturningCustomer: boolean
  hasStarOfTheQuarterBenefit: boolean
}

function calculateCommission({
  packageSlug,
  bookingAmountVnd,
  photographerCompletedCount,
  isReturningCustomer,
  hasStarOfTheQuarterBenefit,
}: CommissionCalculationParams) {
  // Precedence rule 1: Star of the Quarter 0% commission reward
  if (hasStarOfTheQuarterBenefit) {
    return {
      ratePercent: 0,
      ruleName: 'STAR_OF_THE_QUARTER_REWARD',
      commissionVnd: 0,
      netEarningsVnd: bookingAmountVnd,
    }
  }

  // Precedence rule 2: First 3 bookings free for new photographer
  if (photographerCompletedCount < 3) {
    return {
      ratePercent: 0,
      ruleName: 'FIRST_3_BOOKINGS_FREE',
      commissionVnd: 0,
      netEarningsVnd: bookingAmountVnd,
    }
  }

  // Precedence rule 3: Returning customer discount
  if (isReturningCustomer) {
    const ratePercent = 4.0
    const commissionVnd = Math.round((bookingAmountVnd * ratePercent) / 100)
    return {
      ratePercent,
      ruleName: 'RETURNING_CUSTOMER_PROMOTION',
      commissionVnd,
      netEarningsVnd: bookingAmountVnd - commissionVnd,
    }
  }

  // Precedence rule 4: Standard package commission
  let ratePercent = 6.0
  if (packageSlug === 'vibe-sai-gon' || packageSlug === 'outdoor') {
    ratePercent = 9.0
  }

  const commissionVnd = Math.round((bookingAmountVnd * ratePercent) / 100)
  return {
    ratePercent,
    ruleName: 'STANDARD_PACKAGE_COMMISSION',
    commissionVnd,
    netEarningsVnd: bookingAmountVnd - commissionVnd,
  }
}

describe('Scenario E: Commission Engine Business Rules', () => {
  it('should grant 0% commission on photographer first 3 eligible bookings', () => {
    // Booking 1
    const b1 = calculateCommission({
      packageSlug: 'flash-shot',
      bookingAmountVnd: 89000,
      photographerCompletedCount: 0,
      isReturningCustomer: false,
      hasStarOfTheQuarterBenefit: false,
    })
    expect(b1.ratePercent).toBe(0)
    expect(b1.commissionVnd).toBe(0)
    expect(b1.netEarningsVnd).toBe(89000)

    // Booking 2
    const b2 = calculateCommission({
      packageSlug: 'quick-date',
      bookingAmountVnd: 220000,
      photographerCompletedCount: 1,
      isReturningCustomer: false,
      hasStarOfTheQuarterBenefit: false,
    })
    expect(b2.ratePercent).toBe(0)
    expect(b2.commissionVnd).toBe(0)

    // Booking 3
    const b3 = calculateCommission({
      packageSlug: 'vibe-sai-gon',
      bookingAmountVnd: 550000,
      photographerCompletedCount: 2,
      isReturningCustomer: false,
      hasStarOfTheQuarterBenefit: false,
    })
    expect(b3.ratePercent).toBe(0)
    expect(b3.commissionVnd).toBe(0)
    expect(b3.netEarningsVnd).toBe(550000)
  })

  it('should apply 6% commission on 4th booking for Flash Shot & Quick Date', () => {
    const b4 = calculateCommission({
      packageSlug: 'quick-date',
      bookingAmountVnd: 200000,
      photographerCompletedCount: 3,
      isReturningCustomer: false,
      hasStarOfTheQuarterBenefit: false,
    })
    expect(b4.ratePercent).toBe(6.0)
    expect(b4.commissionVnd).toBe(12000)
    expect(b4.netEarningsVnd).toBe(188000)
  })

  it('should apply 9% commission on Vibe Sài Gòn & Outdoor packages', () => {
    const bVibe = calculateCommission({
      packageSlug: 'vibe-sai-gon',
      bookingAmountVnd: 500000,
      photographerCompletedCount: 5,
      isReturningCustomer: false,
      hasStarOfTheQuarterBenefit: false,
    })
    expect(bVibe.ratePercent).toBe(9.0)
    expect(bVibe.commissionVnd).toBe(45000)
    expect(bVibe.netEarningsVnd).toBe(455000)
  })

  it('should apply 4% promotional commission for returning customer', () => {
    const bReturn = calculateCommission({
      packageSlug: 'vibe-sai-gon',
      bookingAmountVnd: 500000,
      photographerCompletedCount: 10,
      isReturningCustomer: true,
      hasStarOfTheQuarterBenefit: false,
    })
    expect(bReturn.ratePercent).toBe(4.0)
    expect(bReturn.commissionVnd).toBe(20000)
    expect(bReturn.netEarningsVnd).toBe(480000)
  })

  it('should prioritize Star of the Quarter 0% benefit over returning customer rate', () => {
    const bStar = calculateCommission({
      packageSlug: 'outdoor',
      bookingAmountVnd: 1000000,
      photographerCompletedCount: 40,
      isReturningCustomer: true,
      hasStarOfTheQuarterBenefit: true,
    })
    expect(bStar.ratePercent).toBe(0)
    expect(bStar.commissionVnd).toBe(0)
    expect(bStar.netEarningsVnd).toBe(1000000)
  })

  it('always maintains integer arithmetic for Vietnamese Dong (no floating point accounting)', () => {
    const oddAmount = calculateCommission({
      packageSlug: 'quick-date',
      bookingAmountVnd: 187333,
      photographerCompletedCount: 5,
      isReturningCustomer: false,
      hasStarOfTheQuarterBenefit: false,
    })
    expect(Number.isInteger(oddAmount.commissionVnd)).toBe(true)
    expect(Number.isInteger(oddAmount.netEarningsVnd)).toBe(true)
    expect(oddAmount.commissionVnd + oddAmount.netEarningsVnd).toBe(187333)
  })
})
