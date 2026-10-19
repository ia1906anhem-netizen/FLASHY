'use client'

import { calculateFullBookingCommission } from '@/lib/utils/commission'

export interface PersistentBooking {
  id: string
  booking_number: string
  photographer_id: string
  photographer_name: string
  photographer_avatar?: string
  photographer_slug?: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
  package_slug: string
  package_name: string
  shooting_date: string
  shooting_time: string
  duration_minutes: number
  location: string
  location_detail?: string
  concept_notes?: string
  package_price: number
  addons_total: number
  total_amount: number
  deposit_amount: number
  remaining_amount: number
  payment_method: string
  status:
    | 'PENDING_PAYMENT'
    | 'CONFIRMED'
    | 'PHOTOGRAPHER_ARRIVED'
    | 'SHOOTING'
    | 'EDITING'
    | 'PHOTOS_DELIVERED'
    | 'ACCEPTED'
    | 'COMPLETED'
    | 'DISPUTED'
    | 'CANCELLED'
  status_label: string
  status_color: string
  created_at: string
  updated_at: string
  delivered_at?: string
  review_window_ends_at?: string
  accepted_at?: string
  completed_at?: string
  coins_earned?: number
  selected_addons?: Array<{ id: string; name: string; price: number }>
  uploaded_photos_count?: {
    original: number
    edited: number
    retouch_quota: number
    retouched: number
  }
  review?: {
    rating: number
    comment: string
    created_at: string
  }
}

const STORAGE_KEY = 'flashy_user_bookings'

export function getStoredBookings(): PersistentBooking[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as PersistentBooking[]
  } catch (err) {
    console.error('Failed to parse bookings from localStorage', err)
    return []
  }
}

export function saveStoredBookings(bookings: PersistentBooking[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
    window.dispatchEvent(new Event('flashy_bookings_updated'))
  } catch (err) {
    console.error('Failed to save bookings to localStorage', err)
  }
}

export function getBookingById(id: string): PersistentBooking | null {
  const all = getStoredBookings()
  return all.find((b) => b.id === id || b.booking_number === id) || null
}

export function createPersistentBooking(data: {
  photographer_id: string
  photographer_name: string
  photographer_avatar?: string
  photographer_slug?: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  package_slug: string
  package_name: string
  shooting_date: string
  shooting_time: string
  duration_minutes?: number
  location: string
  concept_notes?: string
  package_price: number
  addons_total: number
  total_amount: number
  deposit_amount: number
  payment_method?: string
  selected_addons?: Array<{ id: string; name: string; price: number }>
}): PersistentBooking {
  const all = getStoredBookings()
  const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString()
  const bookingNumber = `BK-${randomSuffix}`

  const newBooking: PersistentBooking = {
    id: bookingNumber,
    booking_number: bookingNumber,
    photographer_id: data.photographer_id,
    photographer_name: data.photographer_name,
    photographer_avatar:
      data.photographer_avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    photographer_slug: data.photographer_slug || 'photographer',
    customer_name: data.customer_name || 'Khách hàng',
    customer_email: data.customer_email,
    customer_phone: data.customer_phone,
    package_slug: data.package_slug,
    package_name: data.package_name,
    shooting_date: data.shooting_date,
    shooting_time: data.shooting_time,
    duration_minutes: data.duration_minutes || 60,
    location: data.location,
    concept_notes: data.concept_notes,
    package_price: data.package_price,
    addons_total: data.addons_total,
    total_amount: data.total_amount,
    deposit_amount: data.deposit_amount,
    remaining_amount: Math.max(0, data.total_amount - data.deposit_amount),
    payment_method: data.payment_method || 'sandbox',
    status: 'CONFIRMED',
    status_label: 'Đã xác nhận • Sắp diễn ra',
    status_color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    selected_addons: data.selected_addons || [],
    coins_earned: Math.min(500, Math.max(10, Math.round((data.total_amount * 2) / 100))),
    uploaded_photos_count: {
      original: 0,
      edited: 0,
      retouch_quota:
        data.package_slug === 'flashy-signature'
          ? 15
          : data.package_slug === 'flashy-pro'
          ? 10
          : data.package_slug === 'flashy-casual'
          ? 5
          : 0,
      retouched: 0,
    },
  }

  const updated = [newBooking, ...all]
  saveStoredBookings(updated)
  return newBooking
}

export function updateBookingStatus(
  id: string,
  newStatus: PersistentBooking['status'],
  extra?: Partial<PersistentBooking>
): PersistentBooking | null {
  const all = getStoredBookings()
  const idx = all.findIndex((b) => b.id === id || b.booking_number === id)
  if (idx === -1) return null

  const target = all[idx]
  const now = new Date()

  let statusLabel = 'Đang xử lý'
  let statusColor = 'bg-slate-100 text-slate-700 border-slate-200'

  switch (newStatus) {
    case 'CONFIRMED':
      statusLabel = 'Đã xác nhận • Sắp diễn ra'
      statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200'
      break
    case 'PHOTOGRAPHER_ARRIVED':
      statusLabel = 'Thợ ảnh đã đến điểm hẹn'
      statusColor = 'bg-sky-50 text-sky-700 border-sky-200'
      break
    case 'SHOOTING':
      statusLabel = 'Đang tiến hành chụp ảnh'
      statusColor = 'bg-amber-50 text-amber-700 border-amber-200'
      break
    case 'EDITING':
      statusLabel = 'Đang chỉnh màu & lọc ảnh'
      statusColor = 'bg-indigo-50 text-indigo-700 border-indigo-200'
      break
    case 'PHOTOS_DELIVERED':
      statusLabel = 'Đã giao ảnh • Đang duyệt 48h'
      statusColor = 'bg-violet-50 text-violet-700 border-violet-200'
      break
    case 'ACCEPTED':
      statusLabel = 'Khách đã duyệt & Nhận ảnh'
      statusColor = 'bg-teal-50 text-teal-700 border-teal-200'
      break
    case 'COMPLETED':
      statusLabel = 'Đã hoàn tất buổi chụp'
      statusColor = 'bg-emerald-100 text-emerald-800 border-emerald-300'
      break
    case 'DISPUTED':
      statusLabel = 'Đang khiếu nại • Tạm đóng băng Escrow'
      statusColor = 'bg-rose-50 text-rose-700 border-rose-200'
      break
    case 'CANCELLED':
      statusLabel = 'Đã hủy lịch'
      statusColor = 'bg-slate-100 text-slate-500 border-slate-200'
      break
  }

  const updatedBooking: PersistentBooking = {
    ...target,
    ...extra,
    status: newStatus,
    status_label: statusLabel,
    status_color: statusColor,
    updated_at: now.toISOString(),
  }

  if (newStatus === 'PHOTOS_DELIVERED' && !updatedBooking.delivered_at) {
    updatedBooking.delivered_at = now.toISOString()
    const reviewEnd = new Date(now.getTime() + 48 * 60 * 60 * 1000)
    updatedBooking.review_window_ends_at = reviewEnd.toISOString()
  }

  if (newStatus === 'ACCEPTED' && !updatedBooking.accepted_at) {
    updatedBooking.accepted_at = now.toISOString()
  }

  if (newStatus === 'COMPLETED' && !updatedBooking.completed_at) {
    updatedBooking.completed_at = now.toISOString()
  }

  all[idx] = updatedBooking
  saveStoredBookings(all)
  return updatedBooking
}

/**
 * Add a review to a completed booking and update photographer rating
 */
export function addBookingReview(
  id: string,
  rating: number,
  comment: string
): PersistentBooking | null {
  const all = getStoredBookings()
  const idx = all.findIndex((b) => b.id === id || b.booking_number === id)
  if (idx === -1) return null

  const target = all[idx]
  target.review = {
    rating,
    comment,
    created_at: new Date().toISOString(),
  }
  target.status = 'COMPLETED'
  target.status_label = 'Đã hoàn tất buổi chụp'
  target.status_color = 'bg-emerald-100 text-emerald-800 border-emerald-300'
  target.updated_at = new Date().toISOString()

  all[idx] = target
  saveStoredBookings(all)

  // Also update provider rating and reviews in the approved providers store if present
  try {
    const providers = getApprovedProviders()
    const provIdx = providers.findIndex(
      (p) => p.id === target.photographer_id || p.name === target.photographer_name
    )
    if (provIdx >= 0) {
      const prov = providers[provIdx]
      const currentReviews = prov.reviews || 0
      const currentRating = prov.rating || 0
      const newReviews = currentReviews + 1
      const newRating = Number(((currentRating * currentReviews + rating) / newReviews).toFixed(2))
      providers[provIdx] = {
        ...prov,
        reviews: newReviews,
        rating: newRating,
      }
      saveApprovedProviders(providers)
    }
  } catch (err) {
    console.error('Failed to update provider rating on review', err)
  }

  return target
}

/**
 * =========================================================================
 * APPROVED PROVIDER / KYC STORE MANAGEMENT
 * =========================================================================
 */
export interface ApprovedProvider {
  id: string
  name: string
  slug: string
  avatar: string
  cover: string
  location: string
  city?: string
  district?: string
  specialty: string
  rating: number
  reviews: number
  starting_price: number
  is_verified: boolean
  is_sponsored?: boolean
  badge?: string | null
  kyc_status: 'VERIFIED' | 'PENDING_REVIEW' | 'NOT_SUBMITTED'
  created_at?: string
}

const PROVIDERS_STORAGE_KEY = 'flashy_approved_providers'

/**
 * Get all verified providers with approved KYC from local storage.
 * Defaults to an empty list (Clean Slate / Initial Empty State).
 */
export function getApprovedProviders(): ApprovedProvider[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(PROVIDERS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ApprovedProvider[]
    // Strictly filter for approved KYC status
    return parsed.filter((p) => p.kyc_status === 'VERIFIED' || p.is_verified)
  } catch (err) {
    console.error('Failed to parse approved providers from localStorage', err)
    return []
  }
}

/**
 * Save providers to local storage and dispatch update event.
 */
export function saveApprovedProviders(providers: ApprovedProvider[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PROVIDERS_STORAGE_KEY, JSON.stringify(providers))
    window.dispatchEvent(new Event('flashy_providers_updated'))
  } catch (err) {
    console.error('Failed to save approved providers to localStorage', err)
  }
}

/**
 * Add or update a provider after admin KYC approval or registration.
 */
export function addOrUpdateApprovedProvider(
  provider: Partial<ApprovedProvider> & { name: string }
): ApprovedProvider {
  const current = getApprovedProviders()
  const id = provider.id || `PHT-${Date.now().toString().slice(-4)}`
  const slug =
    provider.slug ||
    provider.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  const newProvider: ApprovedProvider = {
    id,
    name: provider.name,
    slug,
    avatar:
      provider.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    cover:
      provider.cover ||
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop',
    location: provider.location || 'TP. Hồ Chí Minh',
    city: provider.city || 'Hồ Chí Minh',
    district: provider.district || 'Quận 1',
    specialty: provider.specialty || 'Portrait · Concept',
    rating: provider.rating ?? 5.0,
    reviews: provider.reviews ?? 0,
    starting_price: provider.starting_price || 350000,
    is_verified: true,
    is_sponsored: provider.is_sponsored || false,
    badge: provider.badge || '⭐ Đã duyệt KYC',
    kyc_status: 'VERIFIED',
    created_at: provider.created_at || new Date().toISOString(),
  }

  const existingIdx = current.findIndex((p) => p.id === id || p.slug === slug)
  let updated: ApprovedProvider[]
  if (existingIdx >= 0) {
    updated = [...current]
    updated[existingIdx] = { ...current[existingIdx], ...newProvider }
  } else {
    updated = [newProvider, ...current]
  }

  saveApprovedProviders(updated)
  return newProvider
}

/**
 * Remove a provider (e.g. revoke verification or admin rejection).
 */
export function removeApprovedProvider(id: string): void {
  const current = getApprovedProviders()
  const filtered = current.filter((p) => p.id !== id && p.slug !== id)
  saveApprovedProviders(filtered)
}

/**
 * =========================================================================
 * DYNAMIC HOMEPAGE STATS CALCULATION
 * =========================================================================
 * Dynamically computes statistics based on actual store data:
 * - Photographers: actual verified providers in store (starts at 0)
 * - Bookings: actual customer bookings in store (starts at 0)
 * - Average Rating: average rating from real reviews (or "Chưa có dữ liệu")
 * - Customer Satisfaction: percentage of positive reviews/completed bookings (or "Chưa có dữ liệu")
 */
export interface DynamicStats {
  photographersCount: number
  bookingsCount: number
  averageRating: string
  satisfactionRate: string
  totalReviews: number
}

export function calculateDynamicStats(): DynamicStats {
  const bookings = getStoredBookings()
  const providers = getApprovedProviders()

  const photographersCount = providers.length
  const bookingsCount = bookings.length

  // Find bookings that have completed reviews
  const reviewedBookings = bookings.filter(
    (b) => b.review && typeof b.review.rating === 'number' && b.review.rating > 0
  )
  const totalReviews = reviewedBookings.length

  let averageRating = 'Chưa có dữ liệu'
  let satisfactionRate = 'Chưa có dữ liệu'

  if (totalReviews > 0) {
    const sumRating = reviewedBookings.reduce((sum, b) => sum + (b.review?.rating || 0), 0)
    const avg = sumRating / totalReviews
    averageRating = `${avg.toFixed(1)}★`

    // Positive satisfaction: rating >= 4
    const positiveReviews = reviewedBookings.filter((b) => (b.review?.rating || 0) >= 4).length
    const pct = Math.round((positiveReviews / totalReviews) * 100)
    satisfactionRate = `${pct}%`
  } else if (bookingsCount > 0) {
    // If bookings exist without reviews yet, check dispute/cancellation rate
    const successfulBookings = bookings.filter(
      (b) => b.status !== 'DISPUTED' && b.status !== 'CANCELLED'
    )
    const pct = Math.round((successfulBookings.length / bookingsCount) * 100)
    satisfactionRate = `${pct}%`
  }

  return {
    photographersCount,
    bookingsCount,
    averageRating,
    satisfactionRate,
    totalReviews,
  }
}

/**
 * =========================================================================
 * ADMIN & AUDIT STORE HELPERS
 * =========================================================================
 */
export interface KycApplication {
  id: string
  photographer_name: string
  email: string
  phone: string
  submitted_at: string
  id_number: string
  district: string
  status: 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED'
  sample_doc_front?: string
  sample_portrait?: string
  equipment?: string
}

export function getKycApplications(): KycApplication[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('flashy_kyc_applications')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveKycApplications(apps: KycApplication[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('flashy_kyc_applications', JSON.stringify(apps))
    window.dispatchEvent(new Event('flashy_admin_updated'))
  } catch (err) {
    console.error('Failed to save KYC applications', err)
  }
}

export interface DisputeRecord {
  id: string
  booking_id: string
  customer_name: string
  photographer_name: string
  package: string
  booking_amount: number
  reason: string
  reason_label: string
  description: string
  status: 'OPEN' | 'RESOLVED_FOR_CUSTOMER' | 'RESOLVED_FOR_PHOTOGRAPHER'
  created_at: string
  evidence?: string
}

export function getDisputes(): DisputeRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('flashy_disputes')
    const stored = raw ? (JSON.parse(raw) as DisputeRecord[]) : []
    // Also include any bookings with status DISPUTED that aren't already tracked
    const bookings = getStoredBookings().filter((b) => b.status === 'DISPUTED')
    const existingIds = new Set(stored.map((d) => d.booking_id))
    for (const b of bookings) {
      if (!existingIds.has(b.id)) {
        stored.push({
          id: `DISP-${b.booking_number.replace('BK-', '')}`,
          booking_id: b.id,
          customer_name: b.customer_name || 'Khách hàng',
          photographer_name: b.photographer_name,
          package: b.package_name,
          booking_amount: b.total_amount,
          reason: 'dispute_raised',
          reason_label: 'Khách hàng mở khiếu nại',
          description: b.concept_notes || 'Khiếu nại về chất lượng hoặc tiến độ buổi chụp.',
          status: 'OPEN',
          created_at: b.updated_at || b.created_at,
        })
      }
    }
    return stored
  } catch {
    return []
  }
}

export function saveDisputes(disputes: DisputeRecord[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('flashy_disputes', JSON.stringify(disputes))
    window.dispatchEvent(new Event('flashy_admin_updated'))
  } catch (err) {
    console.error('Failed to save disputes', err)
  }
}

export function getRegisteredUsersList(): Array<{
  id: string
  name: string
  email: string
  role: 'CUSTOMER' | 'PHOTOGRAPHER' | 'ADMIN'
  joined: string
  bookings: number
  coins: number
  is_active: boolean
  avatar?: string
}> {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('flashy_registered_users')
    if (!raw) return []
    const usersMap = JSON.parse(raw) as Record<string, any>
    const bookings = getStoredBookings()
    return Object.values(usersMap).map((u: any, idx: number) => {
      const userBookings = bookings.filter(
        (b) =>
          b.customer_email?.toLowerCase() === u.email?.toLowerCase() ||
          b.photographer_name === u.full_name
      )
      return {
        id: u.id || `USR-${String(idx + 1).padStart(2, '0')}`,
        name: u.full_name || u.name || 'Người dùng',
        email: u.email,
        role: u.role || 'CUSTOMER',
        joined: u.created_at
          ? new Date(u.created_at).toLocaleDateString('vi-VN')
          : new Date().toLocaleDateString('vi-VN'),
        bookings: userBookings.length,
        coins: u.coins || 0,
        is_active: u.is_active !== false,
        avatar:
          u.avatar ||
          (u.role === 'PHOTOGRAPHER'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'),
      }
    })
  } catch {
    return []
  }
}

/**
 * Alias for updateBookingStatus used by admin pages.
 */
export function updateStoredBookingStatus(
  id: string,
  newStatus: PersistentBooking['status']
): PersistentBooking | null {
  return updateBookingStatus(id, newStatus)
}

/**
 * Clears all bookings to emulate a brand new, empty site.
 */
export function clearAllBookings(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event('flashy_bookings_updated'))
}

/**
 * Total Clean Slate reset: Clears all bookings, providers, notifications,
 * requests, withdrawals, users, applications, and disputes back to pristine 0/empty state.
 */
export function resetCleanSlateStore(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(PROVIDERS_STORAGE_KEY)
  localStorage.removeItem('flashy_kyc_applications')
  localStorage.removeItem('flashy_disputes')
  localStorage.removeItem('flashy_registered_users')
  localStorage.removeItem('flashy_current_user')
  localStorage.removeItem('flashy_admin_vouchers')
  localStorage.removeItem('flashy_admin_sponsored')
  localStorage.removeItem('flashy_admin_reports')
  localStorage.removeItem('flashy_audit_logs')
  localStorage.removeItem('flashy_withdrawals')
  localStorage.removeItem('flashy_booking_requests')
  localStorage.removeItem('flashy_notifications')
  localStorage.removeItem('flashy_cart')
  localStorage.removeItem('flashy_user_coins')
  localStorage.removeItem('flashy_admin_reviews')
  localStorage.removeItem('flashy_admin_commission_rates')
  localStorage.removeItem('flashy_photographer_portfolio')
  localStorage.removeItem('flashy_photographer_packages')
  localStorage.removeItem('flashy_photographer_blocked_slots')
  // Clear any user-specific booking caches
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i)
      if (k && (k.startsWith('flashy_bookings_') || k.startsWith('flashy_user_'))) {
        localStorage.removeItem(k)
      }
    }
  } catch {}
  window.dispatchEvent(new Event('flashy_bookings_updated'))
  window.dispatchEvent(new Event('flashy_providers_updated'))
  window.dispatchEvent(new Event('flashy_coins_updated'))
  window.dispatchEvent(new Event('flashy_admin_updated'))
}
