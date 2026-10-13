import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  calculateDynamicStats,
  getApprovedProviders,
  saveApprovedProviders,
  addOrUpdateApprovedProvider,
  saveStoredBookings,
  resetCleanSlateStore,
  addBookingReview,
  type PersistentBooking,
} from '../../src/lib/data/booking-store'

// Mock localStorage for Vitest node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

const windowMock = {
  localStorage: localStorageMock,
  dispatchEvent: vi.fn(),
}

Object.defineProperty(globalThis, 'window', {
  value: windowMock,
  writable: true,
})
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

describe('Homepage Dynamic Stats & KYC Provider Empty State', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('1. Returns empty state (0 / Chưa có dữ liệu) when no bookings or providers exist', () => {
    const stats = calculateDynamicStats()
    const providers = getApprovedProviders()

    expect(providers).toHaveLength(0)
    expect(stats.photographersCount).toBe(0)
    expect(stats.bookingsCount).toBe(0)
    expect(stats.averageRating).toBe('Chưa có dữ liệu')
    expect(stats.satisfactionRate).toBe('Chưa có dữ liệu')
  })

  it('2. Keeps approved providers empty until KYC is formally verified', () => {
    expect(getApprovedProviders()).toHaveLength(0)

    // Add an approved provider
    const added = addOrUpdateApprovedProvider({
      id: 'PHT-TEST-1',
      name: 'Nguyễn Văn A',
      district: 'Quận 1',
      kyc_status: 'VERIFIED',
      is_verified: true,
      rating: 5.0,
      reviews: 0,
    })

    expect(added.is_verified).toBe(true)
    expect(added.kyc_status).toBe('VERIFIED')

    const providers = getApprovedProviders()
    expect(providers).toHaveLength(1)
    expect(providers[0].name).toBe('Nguyễn Văn A')

    // Dynamic stats reflect the new approved provider
    const stats = calculateDynamicStats()
    expect(stats.photographersCount).toBe(1)
    expect(stats.bookingsCount).toBe(0)
  })

  it('3. Dynamically calculates average rating and satisfaction when bookings receive reviews', () => {
    // Setup approved provider
    addOrUpdateApprovedProvider({
      id: 'p-1',
      name: 'Trần Văn B',
      kyc_status: 'VERIFIED',
      is_verified: true,
    })

    // Setup 2 mock bookings
    const bookings: PersistentBooking[] = [
      {
        id: 'BK-001',
        booking_number: 'BK-001',
        photographer_id: 'p-1',
        photographer_name: 'Trần Văn B',
        customer_name: 'Khách A',
        package_slug: 'quick-date',
        package_name: 'Quick Date',
        shooting_date: '2026-10-15',
        shooting_time: '09:00',
        duration_minutes: 60,
        location: 'Quận 1',
        package_price: 200000,
        addons_total: 0,
        total_amount: 200000,
        deposit_amount: 50000,
        remaining_amount: 150000,
        payment_method: 'sandbox',
        status: 'CONFIRMED',
        status_label: 'Đã xác nhận',
        status_color: 'bg-emerald-50 text-emerald-700',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'BK-002',
        booking_number: 'BK-002',
        photographer_id: 'p-1',
        photographer_name: 'Trần Văn B',
        customer_name: 'Khách B',
        package_slug: 'flash-shot',
        package_name: 'Flash Shot',
        shooting_date: '2026-10-16',
        shooting_time: '14:00',
        duration_minutes: 20,
        location: 'Quận 3',
        package_price: 99000,
        addons_total: 0,
        total_amount: 99000,
        deposit_amount: 25000,
        remaining_amount: 74000,
        payment_method: 'sandbox',
        status: 'CONFIRMED',
        status_label: 'Đã xác nhận',
        status_color: 'bg-emerald-50 text-emerald-700',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]

    saveStoredBookings(bookings)

    let stats = calculateDynamicStats()
    expect(stats.bookingsCount).toBe(2)
    // No reviews yet: satisfaction defaults to 100% since no disputes
    expect(stats.averageRating).toBe('Chưa có dữ liệu')
    expect(stats.satisfactionRate).toBe('100%')

    // Add a 5-star review to booking 1
    addBookingReview('BK-001', 5, 'Buổi chụp quá xuất sắc!')

    stats = calculateDynamicStats()
    expect(stats.totalReviews).toBe(1)
    expect(stats.averageRating).toBe('5.0★')
    expect(stats.satisfactionRate).toBe('100%')

    // Add a 4-star review to booking 2
    addBookingReview('BK-002', 4, 'Ảnh đẹp và nhiệt tình.')

    stats = calculateDynamicStats()
    expect(stats.totalReviews).toBe(2)
    expect(stats.averageRating).toBe('4.5★')
    expect(stats.satisfactionRate).toBe('100%')
  })

  it('4. Total Clean Slate reset clears all approved providers and bookings back to pristine state', () => {
    addOrUpdateApprovedProvider({
      id: 'p-clean',
      name: 'Nhiếp Ảnh Gia Thử Nghiệm',
      kyc_status: 'VERIFIED',
      is_verified: true,
    })

    expect(getApprovedProviders()).toHaveLength(1)

    // Perform Clean Slate reset
    resetCleanSlateStore()

    expect(getApprovedProviders()).toHaveLength(0)
    const stats = calculateDynamicStats()
    expect(stats.photographersCount).toBe(0)
    expect(stats.bookingsCount).toBe(0)
    expect(stats.averageRating).toBe('Chưa có dữ liệu')
    expect(stats.satisfactionRate).toBe('Chưa có dữ liệu')
  })
})
