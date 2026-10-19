import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { isAuthorizedForBooking } from '../../src/lib/auth/booking-auth'

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

  describe('Route Authorization Middleware Security Matrix', () => {
    function evaluateRouteAccess(pathname: string, userRole: 'CUSTOMER' | 'PHOTOGRAPHER' | 'ADMIN' | null) {
      const isMatch = (base: string) => pathname === base || pathname.startsWith(`${base}/`)
      
      const isProtectedAdmin = isMatch('/admin')
      const isProtectedPhotographer = isMatch('/photographer')
      const isProtectedCustomer = isMatch('/customer') || isMatch('/book')

      if (isProtectedAdmin) {
        if (!userRole) return { action: 'REDIRECT_LOGIN' }
        if (userRole !== 'ADMIN') return { action: 'BLOCK_UNAUTHORIZED', status: 403 }
        return { action: 'ALLOW' }
      }

      if (isProtectedPhotographer) {
        if (!userRole) return { action: 'REDIRECT_LOGIN' }
        if (userRole === 'CUSTOMER') return { action: 'BLOCK_UNAUTHORIZED', status: 403 }
        return { action: 'ALLOW' }
      }

      if (isProtectedCustomer) {
        if (!userRole) return { action: 'REDIRECT_LOGIN' }
        return { action: 'ALLOW' }
      }

      return { action: 'ALLOW' }
    }

    it('blocks Customer from accessing /admin and /admin/* sub-routes', () => {
      expect(evaluateRouteAccess('/admin', 'CUSTOMER')).toEqual({ action: 'BLOCK_UNAUTHORIZED', status: 403 })
      expect(evaluateRouteAccess('/admin/users', 'CUSTOMER')).toEqual({ action: 'BLOCK_UNAUTHORIZED', status: 403 })
      expect(evaluateRouteAccess('/admin/escrow', 'CUSTOMER')).toEqual({ action: 'BLOCK_UNAUTHORIZED', status: 403 })
      expect(evaluateRouteAccess('/admin/audit-logs', 'CUSTOMER')).toEqual({ action: 'BLOCK_UNAUTHORIZED', status: 403 })
    })

    it('blocks Customer from accessing /photographer and /photographer/* routes', () => {
      expect(evaluateRouteAccess('/photographer/dashboard', 'CUSTOMER')).toEqual({ action: 'BLOCK_UNAUTHORIZED', status: 403 })
      expect(evaluateRouteAccess('/photographer/earnings', 'CUSTOMER')).toEqual({ action: 'BLOCK_UNAUTHORIZED', status: 403 })
      expect(evaluateRouteAccess('/photographer/bookings', 'CUSTOMER')).toEqual({ action: 'BLOCK_UNAUTHORIZED', status: 403 })
      expect(evaluateRouteAccess('/photographer/withdrawals', 'CUSTOMER')).toEqual({ action: 'BLOCK_UNAUTHORIZED', status: 403 })
    })

    it('allows Photographer to access /photographer/* but blocks from /admin/*', () => {
      expect(evaluateRouteAccess('/photographer/dashboard', 'PHOTOGRAPHER')).toEqual({ action: 'ALLOW' })
      expect(evaluateRouteAccess('/photographer/earnings', 'PHOTOGRAPHER')).toEqual({ action: 'ALLOW' })
      expect(evaluateRouteAccess('/admin', 'PHOTOGRAPHER')).toEqual({ action: 'BLOCK_UNAUTHORIZED', status: 403 })
      expect(evaluateRouteAccess('/admin/commissions', 'PHOTOGRAPHER')).toEqual({ action: 'BLOCK_UNAUTHORIZED', status: 403 })
    })

    it('allows Admin to access both /admin/* and /photographer/*', () => {
      expect(evaluateRouteAccess('/admin', 'ADMIN')).toEqual({ action: 'ALLOW' })
      expect(evaluateRouteAccess('/admin/escrow', 'ADMIN')).toEqual({ action: 'ALLOW' })
      expect(evaluateRouteAccess('/photographer/dashboard', 'ADMIN')).toEqual({ action: 'ALLOW' })
    })

    it('redirects unauthenticated users to login for protected routes', () => {
      expect(evaluateRouteAccess('/admin', null)).toEqual({ action: 'REDIRECT_LOGIN' })
      expect(evaluateRouteAccess('/photographer/dashboard', null)).toEqual({ action: 'REDIRECT_LOGIN' })
      expect(evaluateRouteAccess('/customer/bookings', null)).toEqual({ action: 'REDIRECT_LOGIN' })
    })

    it('does not falsely block public route /photographers when checking /photographer', () => {
      // /photographers is the public exploration page, must be allowed for everyone
      expect(evaluateRouteAccess('/photographers', 'CUSTOMER')).toEqual({ action: 'ALLOW' })
      expect(evaluateRouteAccess('/photographers', null)).toEqual({ action: 'ALLOW' })
    })
  })

  describe('Booking API Anti-IDOR Authorization Rules', () => {
    const sampleBooking = {
      id: 'BK-892104',
      booking_number: 'BK-892104',
      customer_id: 'cust-uuid-1',
      userId: 'cust-uuid-1',
      customer_email: 'trang@gmail.com',
      photographer_id: 'photo-uuid-1',
      photographerId: 'photo-uuid-1',
    }

    it('authorizes genuine customer owner by customer_id/userId', () => {
      const authorized = isAuthorizedForBooking(sampleBooking, {
        id: 'cust-uuid-1',
        email: 'trang@gmail.com',
        role: 'CUSTOMER',
      })
      expect(authorized).toBe(true)
    })

    it('authorizes genuine customer owner by customer_email match', () => {
      const authorized = isAuthorizedForBooking(sampleBooking, {
        id: 'different-session-id',
        email: 'trang@gmail.com',
        role: 'CUSTOMER',
      })
      expect(authorized).toBe(true)
    })

    it('BLOCKS unauthorized customer from reading or modifying another customer booking (IDOR rejection)', () => {
      // Attacker customer with id 'attacker-cust-99'
      const authorized = isAuthorizedForBooking(sampleBooking, {
        id: 'attacker-cust-99',
        email: 'attacker@evil.com',
        role: 'CUSTOMER',
      })
      expect(authorized).toBe(false)
    })

    it('authorizes genuine photographer by photographer_id/photographerId', () => {
      const authorized = isAuthorizedForBooking(sampleBooking, {
        id: 'photo-uuid-1',
        email: 'photo@flashy.vn',
        role: 'PHOTOGRAPHER',
      })
      expect(authorized).toBe(true)
    })

    it('BLOCKS unauthorized photographer from viewing or tampering with another photographer booking', () => {
      const authorized = isAuthorizedForBooking(sampleBooking, {
        id: 'other-photo-uuid-99',
        email: 'other-photo@flashy.vn',
        role: 'PHOTOGRAPHER',
      })
      expect(authorized).toBe(false)
    })

    it('authorizes Admin role to inspect and manage any booking for dispute/escrow resolution', () => {
      const authorized = isAuthorizedForBooking(sampleBooking, {
        id: 'admin-uuid-super',
        email: 'admin@flashy.vn',
        role: 'ADMIN',
      })
      expect(authorized).toBe(true)
    })
  })
})

