import { PersistentBooking, getStoredBookings, saveStoredBookings, updateBookingStatus } from '@/lib/data/booking-store'
import { calculateFullBookingCommission } from './commission'

const ESCROW_WINDOW_HOURS = 48
const ESCROW_WINDOW_MS = ESCROW_WINDOW_HOURS * 60 * 60 * 1000

export function getEscrowRemainingMs(booking: PersistentBooking | null | undefined): number {
  if (!booking) return 0
  const endTime = booking.review_window_ends_at
    ? new Date(booking.review_window_ends_at).getTime()
    : booking.delivered_at
    ? new Date(booking.delivered_at).getTime() + ESCROW_WINDOW_MS
    : 0

  if (!endTime) return 0
  const diff = endTime - Date.now()
  return Math.max(0, diff)
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00'
  const totalSec = Math.floor(ms / 1000)
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function formatCountdownShort(ms: number): string {
  if (ms <= 0) return 'Hết hạn'
  const totalSec = Math.floor(ms / 1000)
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)

  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function getEscrowWindowProgress(booking: PersistentBooking | null | undefined): number {
  if (!booking) return 0
  const remaining = getEscrowRemainingMs(booking)
  if (remaining <= 0) return 100
  const elapsed = ESCROW_WINDOW_MS - remaining
  return Math.min(100, Math.max(0, Math.round((elapsed / ESCROW_WINDOW_MS) * 100)))
}

export function runEscrowAutoRelease(): string[] {
  const all = getStoredBookings()
  const releasedIds: string[] = []

  all.forEach((b) => {
    if (b.status === 'PHOTOS_DELIVERED' || (b.status as any) === 'DELIVERED') {
      const remaining = getEscrowRemainingMs(b)
      if (remaining <= 0) {
        updateBookingStatus(b.id, 'COMPLETED')
        releasedIds.push(b.id)
      }
    }
  })

  return releasedIds
}

export function calculateEscrowPayout(booking: PersistentBooking | null | undefined) {
  if (!booking) {
    return {
      packagePrice: 0,
      travelFee: 0,
      studioFee: 0,
      addonsTotal: 0,
      totalAmount: 0,
      depositAmount: 0,
      remainingAmount: 0,
      platformFee: 0,
      photographerPayout: 0,
      platformCommission: 0,
      photographerPackageShare: 0,
      photographerAddonsShare: 0,
      totalPhotographerPayout: 0,
    }
  }

  const commission = calculateFullBookingCommission({
    packageSlug: booking.package_slug || 'express',
    packageAmountVnd: booking.package_price || 0,
    photographerCompletedCount: 5,
    addons: (booking.selected_addons || []).map((a) => ({
      id: a.id,
      name: a.name,
      amountVnd: a.price,
    })),
  })

  const travelFee = booking.travel_fee || 0
  const studioFee = booking.studio_fee || 0

  return {
    packagePrice: booking.package_price || 0,
    travelFee,
    studioFee,
    addonsTotal: booking.addons_total || 0,
    totalAmount: booking.total_amount || 0,
    depositAmount: booking.deposit_amount || 0,
    remainingAmount: booking.remaining_amount || 0,
    platformFee: commission.totalPlatformCommissionVnd,
    photographerPayout: commission.totalNetPayoutVnd + travelFee,
    platformCommission: commission.totalPlatformCommissionVnd,
    photographerPackageShare: commission.packageNetVnd,
    photographerAddonsShare: commission.addonsNetVnd,
    totalPhotographerPayout: commission.totalNetPayoutVnd + travelFee,
  }
}
