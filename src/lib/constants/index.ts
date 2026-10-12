// ============================================================
// FLASHY - Application Constants
// ============================================================

export const APP_NAME = 'FLASHY'
export const APP_TAGLINE = 'Marketplace Nhiếp Ảnh Sáng Tạo'
export const APP_DESCRIPTION = 'Kết nối khách hàng với nhiếp ảnh gia freelance tài năng cho những buổi chụp ảnh đáng nhớ'
export const SUPPORT_EMAIL = 'support@flashy.vn'
export const SUPPORT_PHONE = '1800 xxxx'

// Vietnam timezone
export const VN_TIMEZONE = 'Asia/Ho_Chi_Minh'

// Escrow settings
export const REVIEW_WINDOW_HOURS = 48
export const DEPOSIT_PERCENTAGE = 30 // 30% deposit required

// Loyalty tiers
export const MEMBERSHIP_TIERS = {
  ROOKIE: { min: 0, max: 199, label: 'Rookie', color: '#6b7280' },
  CREATOR: { min: 200, max: 499, label: 'Creator', color: '#7c3aed' },
  ICON: { min: 500, max: Infinity, label: 'Icon', color: '#f59e0b' },
} as const

// Loyalty earning
export const COINS_PER_BOOKING_PERCENT = 2 // earn 2% of booking value in coins
export const MIN_COINS_PER_BOOKING = 10
export const MAX_COINS_PER_BOOKING = 500

// Commission defaults
export const DEFAULT_COMMISSION = {
  FLASH_SHOT: 6,      // 6%
  QUICK_DATE: 6,      // 6%
  VIBE_SAI_GON: 9,   // 9%
  OUTDOOR: 9,         // 9%
  RETURNING_CUSTOMER: 4, // 4%
  NEW_PHOTOGRAPHER_FREE_BOOKINGS: 3, // first 3 bookings free
} as const

// Photography categories
export const PHOTOGRAPHY_CATEGORIES = [
  { value: 'lifestyle', label: 'Lifestyle', icon: '✨' },
  { value: 'street', label: 'Street Photography', icon: '🌆' },
  { value: 'couple', label: 'Chụp đôi', icon: '💑' },
  { value: 'quick_date', label: 'Quick Date', icon: '☕' },
  { value: 'tet_ao_dai', label: 'Tết / Áo dài', icon: '🌸' },
  { value: 'graduation', label: 'Kỷ yếu / Tốt nghiệp', icon: '🎓' },
  { value: 'outdoor', label: 'Dã ngoại / Outdoor', icon: '🏔️' },
  { value: 'travel', label: 'Du lịch', icon: '✈️' },
  { value: 'events', label: 'Sự kiện', icon: '🎉' },
  { value: 'portrait', label: 'Chân dung', icon: '🖼️' },
  { value: 'concept', label: 'Concept Photography', icon: '🎨' },
] as const

// Service packages (seed data)
export const SERVICE_PACKAGES = [
  {
    slug: 'flash-shot',
    name: 'Flash Shot',
    description: 'Chụp nhanh, kết quả đẹp — hoàn hảo cho một buổi chiều tự do',
    duration_minutes: 20,
    base_price: 79000,
    max_price: 99000,
    original_photos: 30,
    edited_photos: 5,
    retouch_quota: 0,
    delivery_days: 2,
  },
  {
    slug: 'quick-date',
    name: 'Quick Date',
    description: 'Buổi chụp lãng mạn, ấm áp — kỷ niệm từng khoảnh khắc đẹp',
    duration_minutes: 45,
    base_price: 150000,
    max_price: 300000,
    original_photos: 100,
    edited_photos: 15,
    retouch_quota: 5,
    delivery_days: 3,
  },
  {
    slug: 'vibe-sai-gon',
    name: 'Vibe Sài Gòn',
    description: 'Trải nghiệm đô thị sôi động — bắt trọn linh hồn của Sài Gòn',
    duration_minutes: 150,
    base_price: 400000,
    max_price: 700000,
    original_photos: 200,
    edited_photos: 40,
    retouch_quota: 10,
    delivery_days: 5,
  },
  {
    slug: 'outdoor',
    name: 'Outdoor / Dã ngoại',
    description: 'Phiêu lưu giữa thiên nhiên — câu chuyện bằng hình ảnh của bạn',
    duration_minutes: 240,
    base_price: 800000,
    max_price: 1500000,
    original_photos: 400,
    edited_photos: 60,
    retouch_quota: 20,
    delivery_days: 7,
  },
] as const

// Booking statuses with Vietnamese labels
export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  PENDING_PHOTOGRAPHER: 'Chờ nhiếp ảnh gia xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PHOTOGRAPHER_ARRIVED: 'Nhiếp ảnh gia đã đến',
  SHOOTING: 'Đang chụp',
  EDITING: 'Đang chỉnh sửa',
  PHOTOS_DELIVERED: 'Đã giao ảnh',
  ACCEPTED: 'Khách đã chấp nhận',
  COMPLETED: 'Hoàn thành',
  DISPUTED: 'Đang tranh chấp',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Đã hoàn tiền',
}

// Vietnamese cities
export const VN_CITIES = [
  'Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Cần Thơ',
  'Nha Trang',
  'Đà Lạt',
  'Huế',
  'Hội An',
  'Vũng Tàu',
  'Phú Quốc',
]

// File upload limits
export const UPLOAD_LIMITS = {
  AVATAR: 5 * 1024 * 1024,           // 5MB
  PORTFOLIO: 25 * 1024 * 1024,        // 25MB
  DELIVERY_PHOTO: 50 * 1024 * 1024,  // 50MB
  KYC_DOCUMENT: 10 * 1024 * 1024,    // 10MB
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']

// Signed URL expiry
export const SIGNED_URL_EXPIRY = {
  DELIVERY_PHOTO: 3600,  // 1 hour
  KYC_DOCUMENT: 600,     // 10 minutes
  PORTFOLIO: 86400,      // 24 hours
}

// Default search location (Ho Chi Minh City)
export const DEFAULT_LOCATION = {
  city: 'Hồ Chí Minh',
  latitude: 10.7769,
  longitude: 106.7009,
  radius_km: 10,
}

// KYC status labels
export const KYC_STATUS_LABELS: Record<string, string> = {
  NOT_SUBMITTED: 'Chưa nộp hồ sơ',
  PENDING_REVIEW: 'Đang chờ xét duyệt',
  VERIFIED: 'Đã xác minh',
  REJECTED: 'Bị từ chối',
  RESUBMISSION_REQUIRED: 'Cần nộp lại',
  SUSPENDED: 'Đã tạm ngưng',
}

// Achievement slugs
export const ACHIEVEMENT_SLUGS = {
  STAR_OF_QUARTER: 'star-of-quarter',
  GOLDEN_BADGE: 'golden-badge',
  SPEED_SHOOTER: 'speed-shooter',
  REVIEW_CHAMPION: 'review-champion',
} as const
