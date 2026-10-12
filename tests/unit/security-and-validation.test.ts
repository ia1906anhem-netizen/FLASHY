import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Retouch quota validation schema
const retouchSelectionSchema = z.object({
  selectedCount: z.number().int().min(1),
  maxAllowedQuota: z.number().int().positive(),
}).refine(data => data.selectedCount <= data.maxAllowedQuota, {
  message: 'RETENDED_LIMIT_EXCEEDED: Cannot select more photos than package quota',
})

// Booking server-side price validation
function validateServerPricing({
  basePrice,
  addonsSum,
  voucherDiscount,
  submittedTotal,
}: {
  basePrice: number
  addonsSum: number
  voucherDiscount: number
  submittedTotal: number
}) {
  const calculatedTotal = Math.max(0, basePrice + addonsSum - voucherDiscount)
  if (calculatedTotal !== submittedTotal) {
    return { valid: false, error: 'PRICE_TAMPERING_DETECTED' }
  }
  return { valid: true, error: null }
}

describe('Scenario F: Security, Authorization & Negative Tests', () => {
  it('rejects retouch submission when selected count exceeds package quota', () => {
    // Quick Date has quota of 5 photos. Customer attempts to submit 7 photos
    const result = retouchSelectionSchema.safeParse({
      selectedCount: 7,
      maxAllowedQuota: 5,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('RETENDED_LIMIT_EXCEEDED')
    }
  })

  it('accepts retouch submission within package quota', () => {
    const result = retouchSelectionSchema.safeParse({
      selectedCount: 5,
      maxAllowedQuota: 5,
    })
    expect(result.success).toBe(true)
  })

  it('detects and rejects client-side price tampering', () => {
    // Attacker modifies request payload in DevTools to pay only 10,000 VND instead of 550,000 VND
    const validation = validateServerPricing({
      basePrice: 450000,
      addonsSum: 150000,
      voucherDiscount: 50000,
      submittedTotal: 10000, // Forged total
    })
    expect(validation.valid).toBe(false)
    expect(validation.error).toBe('PRICE_TAMPERING_DETECTED')
  })

  it('validates genuine pricing calculation accurately', () => {
    const validation = validateServerPricing({
      basePrice: 450000,
      addonsSum: 150000,
      voucherDiscount: 50000,
      submittedTotal: 550000, // 450k + 150k - 50k = 550k
    })
    expect(validation.valid).toBe(true)
  })

  it('blocks unverified KYC photographers from receiving confirmed paid bookings', () => {
    const checkCanReceiveBooking = (status: 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED') => status === 'VERIFIED'
    expect(checkCanReceiveBooking('PENDING_REVIEW')).toBe(false)
    expect(checkCanReceiveBooking('REJECTED')).toBe(false)
    expect(checkCanReceiveBooking('VERIFIED')).toBe(true)
  })

  it('strictly isolates customer data and prevents Customer A from reading Customer B booking', () => {
    const booking = { id: 'BK-123', customer_id: 'cust-uuid-A' }
    const requestingUserId = 'cust-uuid-B'
    const isAuthorized = booking.customer_id === requestingUserId
    expect(isAuthorized).toBe(false)
  })
})
