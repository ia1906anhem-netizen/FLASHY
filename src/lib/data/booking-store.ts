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
  travel_fee?: number
  extra_distance_km?: number
  studio_fee?: number
  studio_hours?: number
  total_amount: number
  deposit_amount: number
  remaining_amount: number
  payment_method: string
  status:
    | 'PENDING_PAYMENT'
    | 'PAID_ESCROW'
    | 'CONFIRMED'
    | 'PHOTOGRAPHER_ARRIVED'
    | 'SHOOTING'
    | 'EDITING'
    | 'DELIVERED'
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
  // Anti-circumvention & loyalty fields
  is_rebook?: boolean
  is_top_rated?: boolean
  voucher_code?: string
  discount_amount?: number
  cloud_photos?: Array<{
    id: string
    name: string
    url: string
    size: string
    category?: 'edited' | 'original' | 'retouched'
  }>
}

const STORAGE_KEY = 'flashy_user_bookings'
const FAVORITES_STORAGE_KEY = 'flashy_favorite_photographers'

export const DEFAULT_COMPLETED_BOOKINGS: PersistentBooking[] = [
  {
    id: 'BK-892145',
    booking_number: 'BK-892145',
    photographer_id: 'p-1',
    photographer_name: 'Minh Trí (Trí Lê Visual)',
    photographer_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    photographer_slug: 'tri-le-visual',
    customer_name: 'Hoàng Nam',
    customer_phone: '0908123456',
    package_slug: 'flashy-pro',
    package_name: 'Flashy Pro (Nhiệt Huyết)',
    shooting_date: '2026-10-15',
    shooting_time: '14:30',
    duration_minutes: 90,
    location: 'Bưu điện TP.HCM & Đường sách Nguyễn Văn Bình',
    concept_notes: 'Chụp chân dung ngoại cảnh phong cách tự nhiên, trang phục pastel',
    package_price: 650000,
    addons_total: 250000,
    travel_fee: 0,
    extra_distance_km: 0,
    studio_fee: 0,
    studio_hours: 0,
    total_amount: 900000,
    deposit_amount: 270000,
    remaining_amount: 630000,
    payment_method: 'sandbox',
    status: 'COMPLETED',
    status_label: 'Đã hoàn tất buổi chụp',
    status_color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    created_at: '2026-10-12T10:00:00Z',
    updated_at: '2026-10-16T18:00:00Z',
    completed_at: '2026-10-16T18:00:00Z',
    delivered_at: '2026-10-15T20:00:00Z',
    coins_earned: 50,
    is_top_rated: true,
    selected_addons: [
      { id: 'addon-reels-tiktok', name: 'Quay video ngắn hậu trường/Reels/TikTok', price: 250000 }
    ],
    review: {
      rating: 5,
      comment: 'Thợ chụp siêu có tâm, hướng dẫn tạo dáng nhiệt tình và màu ảnh cực đẹp!',
      created_at: '2026-10-16T19:00:00Z'
    },
    cloud_photos: [
      { id: 'hd-1', name: 'IMG_4812_HD_ColorGraded.jpg', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1600&q=90', size: '12.4 MB', category: 'edited' },
      { id: 'hd-2', name: 'IMG_4815_HD_ColorGraded.jpg', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1600&q=90', size: '14.1 MB', category: 'edited' },
      { id: 'hd-3', name: 'IMG_4820_HD_Retouched.jpg', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=1600&q=90', size: '11.8 MB', category: 'retouched' },
      { id: 'hd-4', name: 'IMG_4825_RAW_Master.cr3', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1600&q=90', size: '28.9 MB', category: 'original' },
      { id: 'hd-5', name: 'IMG_4830_Retouch_Face.jpg', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1600&q=90', size: '15.2 MB', category: 'retouched' },
    ]
  }
]

export function getStoredBookings(): PersistentBooking[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      // Initialize with demo completed booking so customer can test Re-book & Cloud Photo Vault immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COMPLETED_BOOKINGS))
      return DEFAULT_COMPLETED_BOOKINGS
    }
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

// Favorite Photographers Helpers (Anti-Circumvention Customer Vault)
export function getFavoritePhotographers(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY)
    return raw ? JSON.parse(raw) : ['p-1']
  } catch {
    return []
  }
}

export function isPhotographerFavorite(photographerId: string): boolean {
  const list = getFavoritePhotographers()
  return list.includes(photographerId)
}

export function toggleFavoritePhotographer(photographerId: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const current = getFavoritePhotographers()
    let updated: string[]
    let isNowFav = false
    if (current.includes(photographerId)) {
      updated = current.filter((id) => id !== photographerId)
      isNowFav = false
    } else {
      updated = [...current, photographerId]
      isNowFav = true
    }
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('flashy_favorites_updated', { detail: { photographerId, isFavorite: isNowFav } }))
    return isNowFav
  } catch {
    return false
  }
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
  travel_fee?: number
  extra_distance_km?: number
  studio_fee?: number
  studio_hours?: number
  total_amount: number
  deposit_amount: number
  payment_method?: string
  selected_addons?: Array<{ id: string; name: string; price: number }>
  is_rebook?: boolean
  is_top_rated?: boolean
  voucher_code?: string
  discount_amount?: number
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
    travel_fee: data.travel_fee || 0,
    extra_distance_km: data.extra_distance_km || 0,
    studio_fee: data.studio_fee || 0,
    studio_hours: data.studio_hours || 0,
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
    is_rebook: Boolean(data.is_rebook),
    is_top_rated: Boolean(data.is_top_rated),
    voucher_code: data.voucher_code,
    discount_amount: data.discount_amount || 0,
    cloud_photos: [
      { id: 'hd-new-1', name: 'PHOTO_PREVIEW_HD.jpg', url: data.photographer_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1600&q=90', size: '10.5 MB', category: 'edited' }
    ],
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
  /** Portfolio gallery: array of 3-4 high-quality Unsplash image URLs */
  portfolio?: string[]
}

const PROVIDERS_STORAGE_KEY = 'flashy_approved_providers'
const MOCK_SEED_KEY = 'flashy_mock_seeded_v2'

/**
 * MOCK SEED DATA — 6 photographers (3 TP.HCM + 3 Hà Nội)
 * Portfolio images from Unsplash: Áo dài, Streetwear, Cafe Portrait, Couple
 */
export const MOCK_PHOTOGRAPHERS: ApprovedProvider[] = [
  // ── TP. HỒ CHÍ MINH ─────────────────────────────────────────────────────
  {
    id: 'mock-hcm-001',
    name: 'Minh Khoa (MK Visual)',
    slug: 'minh-khoa-mk-visual',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    cover: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=400&fit=crop',
    location: 'Quận 1, TP. Hồ Chí Minh',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    specialty: 'Lifestyle · Street Photography · Cafe Portrait',
    rating: 4.97,
    reviews: 128,
    starting_price: 800000,
    is_verified: true,
    is_sponsored: true,
    badge: '🏆 Top Rated',
    kyc_status: 'VERIFIED',
    portfolio: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop',
    ],
    created_at: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'mock-hcm-002',
    name: 'Linh Đan (Dandelion Studio)',
    slug: 'linh-dan-dandelion-studio',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    cover: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=400&fit=crop',
    location: 'Quận 3, TP. Hồ Chí Minh',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 3',
    specialty: 'Áo dài · Tết · Couple · Concept',
    rating: 4.92,
    reviews: 84,
    starting_price: 1500000,
    is_verified: true,
    is_sponsored: false,
    badge: '✨ KYC Verified',
    kyc_status: 'VERIFIED',
    portfolio: [
      'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=400&h=400&fit=crop',
    ],
    created_at: '2026-02-10T08:00:00.000Z',
  },
  {
    id: 'mock-hcm-003',
    name: 'Trí Lê (Trí Lê Visual)',
    slug: 'tri-le-visual',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    cover: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=400&fit=crop',
    location: 'Quận 7, TP. Hồ Chí Minh',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 7',
    specialty: 'Street Photography · Urban · Streetwear',
    rating: 4.85,
    reviews: 63,
    starting_price: 350000,
    is_verified: true,
    is_sponsored: false,
    badge: '⚡ Sẵn sàng ngay',
    kyc_status: 'VERIFIED',
    portfolio: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1485125639709-a60c3a500bf1?w=400&h=400&fit=crop',
    ],
    created_at: '2026-03-01T08:00:00.000Z',
  },
  // ── HÀ NỘI ─────────────────────────────────────────────────────────────
  {
    id: 'mock-hn-001',
    name: 'Phương Nghi (Nghi Phim)',
    slug: 'phuong-nghi-nghi-phim',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    cover: 'https://images.unsplash.com/photo-1555921015-5532091f6026?w=800&h=400&fit=crop',
    location: 'Hoàn Kiếm, Hà Nội',
    city: 'Hà Nội',
    district: 'Hoàn Kiếm',
    specialty: 'Film Portrait · Cafe · Couple · Analog',
    rating: 5.0,
    reviews: 47,
    starting_price: 800000,
    is_verified: true,
    is_sponsored: true,
    badge: '🎞️ Film Style',
    kyc_status: 'VERIFIED',
    portfolio: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1507081323647-4d250478b919?w=400&h=400&fit=crop',
    ],
    created_at: '2026-01-20T08:00:00.000Z',
  },
  {
    id: 'mock-hn-002',
    name: 'Quang Hải (QH Lens)',
    slug: 'quang-hai-qh-lens',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    cover: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800&h=400&fit=crop',
    location: 'Tây Hồ, Hà Nội',
    city: 'Hà Nội',
    district: 'Tây Hồ',
    specialty: 'Outdoor · Dã ngoại · Travel · Landscape',
    rating: 4.88,
    reviews: 92,
    starting_price: 1500000,
    is_verified: true,
    is_sponsored: false,
    badge: '🏔️ Outdoor Pro',
    kyc_status: 'VERIFIED',
    portfolio: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=400&fit=crop',
    ],
    created_at: '2026-02-28T08:00:00.000Z',
  },
  {
    id: 'mock-hn-003',
    name: 'Bảo Châu (Studio Mây)',
    slug: 'bao-chau-studio-may',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    cover: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&h=400&fit=crop',
    location: 'Đống Đa, Hà Nội',
    city: 'Hà Nội',
    district: 'Đống Đa',
    specialty: 'Áo dài · Concept · Kỷ yếu · Tốt nghiệp',
    rating: 4.95,
    reviews: 76,
    starting_price: 3200000,
    is_verified: true,
    is_sponsored: false,
    badge: '🌸 Signature Style',
    kyc_status: 'VERIFIED',
    portfolio: [
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=400&fit=crop',
    ],
    created_at: '2026-03-15T08:00:00.000Z',
  },
]

/**
 * Seed 6 mock photographers into localStorage if not already seeded.
 * Idempotent — uses a version key to avoid duplicate seeding.
 */
export function seedMockPhotographers(): void {
  if (typeof window === 'undefined') return
  try {
    if (localStorage.getItem(MOCK_SEED_KEY)) return // already seeded
    const existing = getApprovedProviders()
    const existingIds = new Set(existing.map((p) => p.id))
    const toAdd = MOCK_PHOTOGRAPHERS.filter((m) => !existingIds.has(m.id))
    if (toAdd.length === 0) {
      localStorage.setItem(MOCK_SEED_KEY, '1')
      return
    }
    saveApprovedProviders([...toAdd, ...existing])
    localStorage.setItem(MOCK_SEED_KEY, '1')
  } catch (err) {
    console.error('Failed to seed mock photographers', err)
  }
}

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
