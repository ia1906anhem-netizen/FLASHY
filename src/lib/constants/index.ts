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

// Commission defaults (CP3 Standard: 15% Take Rate cố định)
export const DEFAULT_COMMISSION = {
  TAKE_RATE: 15, // 15% phí sàn cố định cho tất cả gói dịch vụ
  PHOTOGRAPHER_PAYOUT: 85, // 85% thù lao thợ thực nhận từ gói gốc
  ADDONS_COMMISSION: 0, // 0% hoa hồng trên Add-ons (Thợ nhận 100% phụ phí Add-ons / di chuyển)
  // Tương thích các gói CP3 và backward compatibility
  FLASHY_EXPRESS: 15,
  FLASHY_CASUAL: 15,
  FLASHY_PRO: 15,
  FLASHY_SIGNATURE: 15,
  FLASH_SHOT: 15,
  QUICK_DATE: 15,
  VIBE_SAI_GON: 15,
  OUTDOOR: 15,
  RETURNING_CUSTOMER: 15,
  NEW_PHOTOGRAPHER_FREE_BOOKINGS: 0,
  MAKEUP_HAIR: 0,
  OUTFIT_RENTAL_MIN: 0,
  OUTFIT_RENTAL_MAX: 0,
  OUTFIT_RENTAL: 0,
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

// Service packages (CP3 standard catalog)
export const SERVICE_PACKAGES = [
  {
    slug: 'flashy-express',
    name: 'FLASHY EXPRESS',
    description: 'Chụp nhanh với điện thoại Flagship hiện đại, nhận ảnh liền tay trong ngày. Phù hợp cho cafe, dạo phố, sống ảo check-in tức thì.',
    base_price: 350000,
    max_price: 350000,
    duration_minutes: 60,
    duration_text: '45 – 60 phút',
    original_photos: 50,
    edited_photos: 10,
    retouch_quota: 0,
    delivery_days: 1,
    delivery_time: 'Bàn giao ngay tại chỗ / AirDrop / Link Drive trong ngày',
    equipment: 'Điện thoại Flagship (iPhone 14 Pro / 15 Pro Max, Samsung Ultra)',
    deliverables: '5 – 10 ảnh đã chỉnh màu cơ bản + Toàn bộ file gốc',
    service_includes: 'Thợ chụp hướng dẫn tạo dáng cơ bản, di chuyển nội thành (<8km)',
    photographer_tier: 'Creator / Thợ chụp Phone mát tay',
  },
  {
    slug: 'flashy-casual',
    name: 'FLASHY CASUAL',
    description: 'Chụp ảnh máy cơ bản với Freelancer giàu năng lượng, nhận 10 ảnh chỉnh màu (5 ảnh retouch da & dáng kỹ) và toàn bộ file gốc.',
    base_price: 800000,
    max_price: 800000,
    duration_minutes: 90,
    duration_text: '90 phút',
    original_photos: 100,
    edited_photos: 10,
    retouch_quota: 5,
    delivery_days: 5,
    delivery_time: '3 – 5 ngày làm việc qua Cloud',
    equipment: 'Máy ảnh cơ bản (Crop / Full-frame entry-level)',
    deliverables: '10 ảnh chỉnh màu (trong đó có 5 ảnh Retouch da & dáng kỹ) + Toàn bộ file gốc',
    service_includes: 'Hướng dẫn tạo dáng, di chuyển cơ bản nội thành (<8km)',
    photographer_tier: 'Freelancer 1–2 năm kinh nghiệm',
  },
  {
    slug: 'flashy-pro',
    name: 'FLASHY PRO',
    description: 'Buổi chụp tiêu chuẩn chuyên nghiệp với máy ảnh Full-frame và hắt sáng, kèm tư vấn concept & phối đồ kỹ lưỡng.',
    base_price: 1500000,
    max_price: 1500000,
    duration_minutes: 120,
    duration_text: '120 phút',
    original_photos: 200,
    edited_photos: 15,
    retouch_quota: 10,
    delivery_days: 7,
    delivery_time: '5 – 7 ngày làm việc qua Cloud',
    equipment: 'Máy ảnh chuyên nghiệp (Full-frame chuyên dụng) + Hắt sáng',
    deliverables: '15 ảnh chỉnh màu (trong đó có 10 ảnh Retouch da & dáng kỹ) + Toàn bộ file gốc',
    service_includes: 'Hướng dẫn tạo dáng chuyên sâu, hắt sáng hỗ trợ, tư vấn concept & phối đồ, di chuyển tiêu chuẩn',
    photographer_tier: 'Freelancer cứng tay (2–4 năm kinh nghiệm), Portfolio kiểm duyệt đạt chuẩn Pro',
  },
  {
    slug: 'flashy-signature',
    name: 'FLASHY SIGNATURE',
    description: 'Gói chụp cao cấp trọn gói bao gồm Makeup + Làm tóc layout riêng, lên moodboard độc quyền cùng Senior Photographer.',
    base_price: 3200000,
    max_price: 3200000,
    duration_minutes: 150,
    duration_text: '150 phút',
    original_photos: 300,
    edited_photos: 20,
    retouch_quota: 15,
    delivery_days: 10,
    delivery_time: '7 – 10 ngày làm việc qua Cloud',
    equipment: 'Máy ảnh cao cấp + Đèn phụ Studio / Hắt sáng chuyên dụng',
    deliverables: '20 ảnh chỉnh màu (trong đó có 15 ảnh Retouch cấp tạp chí) + Toàn bộ file gốc',
    service_includes: 'ĐÃ BAO GỒM Makeup + Làm tóc (1 Layout chuyên nghiệp), Lên Moodboard Concept riêng, hướng dẫn dáng cao cấp',
    photographer_tier: 'Senior Photographer / KOLs nhiếp ảnh uy tín trên sàn',
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
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Cần Thơ',
  'Nha Trang',
  'Đà Lạt',
  'Vũng Tàu',
  'Huế',
  'Quảng Ninh',
  'Hải Phòng',
  'Hội An',
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
