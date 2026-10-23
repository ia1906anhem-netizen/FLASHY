// ============================================================
// FLASHY - Core Application Types
// ============================================================

// ---- User & Authentication ----
export type UserRole = 'CUSTOMER' | 'PHOTOGRAPHER' | 'ADMIN'

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  phone: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserAddress {
  id: string
  user_id: string
  label: string
  address_line: string
  district: string
  city: string
  province: string
  latitude: number | null
  longitude: number | null
  is_default: boolean
}

// ---- Photographer ----
export type KycStatus = 
  | 'NOT_SUBMITTED'
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'RESUBMISSION_REQUIRED'
  | 'SUSPENDED'

export interface PhotographerProfile {
  id: string
  user_id: string
  slug: string
  display_name: string
  bio: string | null
  tagline: string | null
  avatar_url: string | null
  banner_url: string | null
  city: string
  district: string | null
  service_radius_km: number
  latitude: number | null
  longitude: number | null
  kyc_status: KycStatus
  is_available: boolean
  is_approved: boolean
  is_featured: boolean
  is_sponsored: boolean
  avg_rating: number
  total_reviews: number
  total_completed_bookings: number
  starting_price: number | null
  created_at: string
  updated_at: string
}

export type Photographer = PhotographerProfile & {
  specialties?: string[]
  badges?: string[]
  equipment?: string[]
  portfolio_photos?: string[]
  address?: string
  completed_orders_count?: number
  review_count?: number
  average_rating?: number
  is_ready_to_work?: boolean
  cover_image_url?: string
  is_verified?: boolean
}

export type PhotographerWithDistance = Photographer & {
  distanceKm?: number
  portfolio?: string[]
}

export interface PhotographerSpecialty {
  id: string
  photographer_id: string
  category: PhotographyCategory
  years_experience: number | null
}

export type PhotographyCategory =
  | 'lifestyle'
  | 'street'
  | 'couple'
  | 'quick_date'
  | 'tet_ao_dai'
  | 'graduation'
  | 'outdoor'
  | 'travel'
  | 'events'
  | 'portrait'
  | 'concept'

// ---- Service Packages ----
export interface ServicePackage {
  id: string
  name: string
  slug: string
  description: string
  category: PhotographyCategory
  duration_minutes: number
  duration_text?: string
  base_price: number  // in VND (integer)
  max_price: number   // in VND (integer)
  original_photos: number
  edited_photos: number
  retouch_quota: number
  equipment?: string
  deliverables?: string
  delivery_time?: string
  service_includes?: string
  photographer_tier?: string
  is_popular?: boolean
  travel_policy: string | null
  cancellation_policy: string | null
  delivery_days: number
  is_active: boolean
  sort_order: number
}

export interface PhotographerPackage {
  id: string
  photographer_id: string
  package_id: string
  custom_price: number  // in VND
  custom_description: string | null
  is_active: boolean
  package?: ServicePackage
}

export interface PackageAddon {
  id: string
  name: string
  description: string
  price: number  // in VND
  max_quantity: number
  is_active: boolean
}

// ---- Bookings ----
export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_PHOTOGRAPHER'
  | 'CONFIRMED'
  | 'PHOTOGRAPHER_ARRIVED'
  | 'SHOOTING'
  | 'EDITING'
  | 'PHOTOS_DELIVERED'
  | 'ACCEPTED'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'CANCELLED'
  | 'REFUNDED'

export interface Booking {
  id: string
  booking_number: string
  customer_id: string
  photographer_id: string
  package_id: string
  photographer_package_id: string | null
  status: BookingStatus
  shooting_date: string
  shooting_time: string
  duration_minutes: number
  location_name: string
  location_address: string
  location_lat: number | null
  location_lng: number | null
  concept_notes: string | null
  package_price: number
  addons_total: number
  travel_fee: number
  discount_amount: number
  voucher_code: string | null
  total_amount: number
  deposit_amount: number | null
  cancellation_reason: string | null
  review_submitted: boolean
  created_at: string
  updated_at: string
  // Relations
  customer?: Profile
  photographer?: PhotographerProfile
  package?: ServicePackage
  addons?: BookingAddon[]
  payment?: Payment
  delivery?: BookingDelivery
}

export interface BookingAddon {
  id: string
  booking_id: string
  addon_id: string
  quantity: number
  unit_price: number
  addon?: PackageAddon
}

export interface BookingStatusHistory {
  id: string
  booking_id: string
  status: BookingStatus
  actor_id: string
  actor_role: UserRole
  note: string | null
  created_at: string
}

// ---- Payments ----
export type PaymentStatus =
  | 'AWAITING_PAYMENT'
  | 'PAYMENT_PROCESSING'
  | 'FUNDS_CONFIRMED'
  | 'HELD_BY_PROVIDER'
  | 'DELIVERY_PENDING'
  | 'REVIEW_WINDOW'
  | 'RELEASE_ELIGIBLE'
  | 'RELEASE_PROCESSING'
  | 'RELEASED'
  | 'DISPUTED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'FAILED'

export type PaymentMethod = 'momo' | 'zalopay' | 'shopee_pay' | 'bank_transfer' | 'card' | 'sandbox'

export interface Payment {
  id: string
  booking_id: string
  amount: number
  payment_method: PaymentMethod
  status: PaymentStatus
  provider_transaction_id: string | null
  provider_reference: string | null
  idempotency_key: string
  paid_at: string | null
  failed_reason: string | null
  created_at: string
  updated_at: string
}

export interface EscrowRecord {
  id: string
  booking_id: string
  payment_id: string
  gross_amount: number
  commission_amount: number
  net_amount: number
  commission_rate: number
  status: PaymentStatus
  delivery_confirmed_at: string | null
  review_window_ends_at: string | null
  release_eligible_at: string | null
  released_at: string | null
  payout_id: string | null
  created_at: string
  updated_at: string
}

// ---- Photo Delivery ----
export type DeliveryStatus = 'PENDING' | 'UPLOADED' | 'DELIVERED' | 'ACCEPTED' | 'DISPUTED'

export interface BookingDelivery {
  id: string
  booking_id: string
  photographer_id: string
  status: DeliveryStatus
  original_count: number
  edited_count: number
  retouch_count: number
  delivered_at: string | null
  accepted_at: string | null
  created_at: string
  updated_at: string
}

export interface PhotoAsset {
  id: string
  delivery_id: string
  booking_id: string
  uploader_id: string
  storage_path: string
  file_name: string
  file_size: number
  mime_type: string
  category: 'original' | 'edited' | 'retouched' | 'preview'
  width: number | null
  height: number | null
  is_watermarked: boolean
  created_at: string
}

// ---- Reviews ----
export interface Review {
  id: string
  booking_id: string
  customer_id: string
  photographer_id: string
  rating: number  // 1-5
  content?: string | null
  comment?: string | null
  is_verified?: boolean
  is_verified_booking?: boolean
  is_demo?: boolean
  helpful_count?: number
  created_at: string
  updated_at?: string
  customer?: Profile
  customer_name?: string
  customer_avatar?: string
  images?: string[]
}

// ---- Messaging ----
export interface Conversation {
  id: string
  booking_id: string | null
  created_at: string
  updated_at: string
  last_message_at: string | null
  participants?: ConversationParticipant[]
  last_message?: Message | null
  unread_count?: number
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  is_muted: boolean
  joined_at: string
  user?: Profile
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: 'text' | 'image' | 'location' | 'system'
  is_read: boolean
  attachment_url: string | null
  created_at: string
  sender?: Profile
}

// ---- Loyalty ----
export type MembershipTier = 'ROOKIE' | 'CREATOR' | 'ICON'

export interface LoyaltyAccount {
  id: string
  user_id: string
  coin_balance: number
  lifetime_coins: number
  tier: MembershipTier
  next_tier_at: number | null
  created_at: string
  updated_at: string
}

export interface LoyaltyTransaction {
  id: string
  account_id: string
  user_id: string
  amount: number  // positive = earned, negative = redeemed/expired
  transaction_type: 'EARNED' | 'REDEEMED' | 'EXPIRED' | 'REVERSED' | 'ADJUSTMENT'
  reason: string
  booking_id: string | null
  voucher_id: string | null
  created_at: string
}

export interface Voucher {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_RETOUCH'
  discount_value: number
  max_discount: number | null
  min_order_value: number | null
  coin_cost: number | null  // null = admin-issued, not redeemable with coins
  usage_limit: number | null
  usage_count: number
  user_id: string | null  // null = public voucher
  partner: string | null
  description: string | null
  starts_at: string
  expires_at: string | null
  is_active: boolean
  created_at: string
}

// ---- Disputes ----
export type DisputeStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'WAITING_FOR_EVIDENCE'
  | 'RESOLVED_FOR_CUSTOMER'
  | 'RESOLVED_FOR_PHOTOGRAPHER'
  | 'CLOSED'

export interface Dispute {
  id: string
  booking_id: string
  customer_id: string
  photographer_id: string
  reason: string
  description: string
  status: DisputeStatus
  resolution: string | null
  resolved_by: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
  booking?: Booking
}

// ---- Achievements ----
export interface Achievement {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  criteria: Record<string, unknown>
  reward_type: 'BADGE' | 'COMMISSION_FREE' | 'SPONSORED_CREDIT'
  reward_value: number | null
  is_active: boolean
}

export interface PhotographerAchievementRecord {
  id: string
  photographer_id: string
  achievement_id: string
  earned_at: string
  expires_at: string | null
  reward_used: boolean
  achievement?: Achievement
}

// ---- Admin ----
export interface AdminAuditLog {
  id: string
  admin_id: string
  action: string
  target_type: string
  target_id: string
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  reason: string | null
  created_at: string
}

// ---- Analytics ----
export interface AnalyticsSummary {
  total_users: number
  total_photographers: number
  verified_photographers: number
  active_bookings: number
  completed_bookings: number
  cancelled_bookings: number
  open_disputes: number
  total_gmv: number
  platform_commission: number
  pending_settlements: number
  pending_payouts: number
}

// ---- Commission ----
export interface CommissionRule {
  id: string
  name: string
  description: string
  rule_type: 'STANDARD' | 'FIRST_N_BOOKINGS' | 'RETURNING_CUSTOMER' | 'PROMOTIONAL'
  package_slug: string | null
  rate: number  // percentage, e.g. 6.00
  min_booking_count: number | null
  max_booking_count: number | null
  priority: number
  is_active: boolean
  effective_from: string
  effective_until: string | null
  created_at: string
}

// ---- API Response types ----
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

// ---- Search/Filter ----
export interface PhotographerSearchParams {
  query?: string
  city?: string
  category?: PhotographyCategory
  min_price?: number
  max_price?: number
  min_rating?: number
  max_distance_km?: number
  latitude?: number
  longitude?: number
  is_verified?: boolean
  is_available?: boolean
  page?: number
  limit?: number
  sort_by?: 'rating' | 'price_asc' | 'price_desc' | 'distance' | 'newest'
}
