-- ============================================================
-- FLASHY Database Migration 001: Extensions & Core Setup
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'CUSTOMER' 
    CHECK (role IN ('CUSTOMER', 'PHOTOGRAPHER', 'ADMIN')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER ADDRESSES
-- ============================================================
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Nhà',
  address_line TEXT NOT NULL,
  district TEXT,
  city TEXT NOT NULL DEFAULT 'Hồ Chí Minh',
  province TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(POINT, 4326),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER PREFERENCES
-- ============================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  marketing_emails BOOLEAN NOT NULL DEFAULT false,
  language TEXT NOT NULL DEFAULT 'vi',
  timezone TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PHOTOGRAPHY CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_vi TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SERVICE PACKAGES (platform-defined)
-- ============================================================
CREATE TABLE IF NOT EXISTS service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES service_categories(id),
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  base_price BIGINT NOT NULL CHECK (base_price >= 0),  -- in VND
  max_price BIGINT NOT NULL CHECK (max_price >= base_price),
  original_photos INT NOT NULL DEFAULT 0,
  edited_photos INT NOT NULL DEFAULT 0,
  retouch_quota INT NOT NULL DEFAULT 0,
  travel_policy TEXT,
  cancellation_policy TEXT,
  delivery_days INT NOT NULL DEFAULT 3,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PACKAGE ADD-ONS
-- ============================================================
CREATE TABLE IF NOT EXISTS package_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_vi TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL CHECK (price >= 0),  -- in VND
  max_quantity INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PHOTOGRAPHER PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS photographer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  tagline TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  city TEXT NOT NULL DEFAULT 'Hồ Chí Minh',
  district TEXT,
  service_radius_km INT NOT NULL DEFAULT 10,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(POINT, 4326),
  kyc_status TEXT NOT NULL DEFAULT 'NOT_SUBMITTED'
    CHECK (kyc_status IN ('NOT_SUBMITTED','PENDING_REVIEW','VERIFIED','REJECTED','RESUBMISSION_REQUIRED','SUSPENDED')),
  is_available BOOLEAN NOT NULL DEFAULT false,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_sponsored BOOLEAN NOT NULL DEFAULT false,
  avg_rating NUMERIC(3,2) NOT NULL DEFAULT 0.0,
  total_reviews INT NOT NULL DEFAULT 0,
  total_completed_bookings INT NOT NULL DEFAULT 0,
  starting_price BIGINT,  -- in VND, auto-calculated
  total_earnings BIGINT NOT NULL DEFAULT 0,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for geospatial search
CREATE INDEX IF NOT EXISTS idx_photographer_location ON photographer_profiles USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_photographer_slug ON photographer_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_photographer_city ON photographer_profiles(city);
CREATE INDEX IF NOT EXISTS idx_photographer_available ON photographer_profiles(is_available, is_approved);

-- Full text search on photographer name
CREATE INDEX IF NOT EXISTS idx_photographer_search ON photographer_profiles USING GIN(to_tsvector('simple', display_name));

-- ============================================================
-- PHOTOGRAPHER SPECIALTIES
-- ============================================================
CREATE TABLE IF NOT EXISTS photographer_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES photographer_profiles(id) ON DELETE CASCADE,
  category_slug TEXT NOT NULL,
  years_experience INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(photographer_id, category_slug)
);

-- ============================================================
-- PHOTOGRAPHER KYC
-- ============================================================
CREATE TABLE IF NOT EXISTS photographer_kyc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES photographer_profiles(id) ON DELETE CASCADE UNIQUE,
  status TEXT NOT NULL DEFAULT 'NOT_SUBMITTED'
    CHECK (status IN ('NOT_SUBMITTED','PENDING_REVIEW','VERIFIED','REJECTED','RESUBMISSION_REQUIRED','SUSPENDED')),
  full_legal_name TEXT,
  id_number_hash TEXT,  -- hashed, not stored plaintext
  id_front_path TEXT,   -- encrypted storage path
  id_back_path TEXT,
  selfie_path TEXT,
  provider_reference TEXT,  -- KYC provider record ID
  review_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PHOTOGRAPHER AVAILABILITY
-- ============================================================
CREATE TABLE IF NOT EXISTS photographer_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES photographer_profiles(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),  -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(photographer_id, day_of_week)
);

-- ============================================================
-- PHOTOGRAPHER BLOCKED SLOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS photographer_blocked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES photographer_profiles(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  start_time TIME,  -- null = full day
  end_time TIME,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PHOTOGRAPHER PACKAGES (custom packages per photographer)
-- ============================================================
CREATE TABLE IF NOT EXISTS photographer_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES photographer_profiles(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES service_packages(id),
  custom_price BIGINT NOT NULL CHECK (custom_price >= 0),  -- in VND
  custom_description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(photographer_id, package_id)
);

-- ============================================================
-- PORTFOLIOS & IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS photographer_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES photographer_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category_slug TEXT,
  cover_image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES photographer_portfolios(id) ON DELETE CASCADE,
  photographer_id UUID NOT NULL REFERENCES photographer_profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  width INT,
  height INT,
  file_size BIGINT,
  sort_order INT NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- COMMISSION RULES
-- ============================================================
CREATE TABLE IF NOT EXISTS commission_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL 
    CHECK (rule_type IN ('STANDARD','FIRST_N_BOOKINGS','RETURNING_CUSTOMER','PROMOTIONAL')),
  package_slug TEXT,  -- null = applies to all packages
  rate NUMERIC(5,2) NOT NULL CHECK (rate >= 0 AND rate <= 100),
  min_booking_count INT,
  max_booking_count INT,
  priority INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_until TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES profiles(id),
  photographer_id UUID NOT NULL REFERENCES photographer_profiles(id),
  package_id UUID NOT NULL REFERENCES service_packages(id),
  photographer_package_id UUID REFERENCES photographer_packages(id),
  status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT'
    CHECK (status IN (
      'PENDING_PAYMENT','PENDING_PHOTOGRAPHER','CONFIRMED',
      'PHOTOGRAPHER_ARRIVED','SHOOTING','EDITING',
      'PHOTOS_DELIVERED','ACCEPTED','COMPLETED',
      'DISPUTED','CANCELLED','REFUNDED'
    )),
  shooting_date DATE NOT NULL,
  shooting_time TIME NOT NULL,
  duration_minutes INT NOT NULL,
  location_name TEXT NOT NULL,
  location_address TEXT NOT NULL,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location GEOGRAPHY(POINT, 4326),
  concept_notes TEXT,
  -- Snapshotted pricing at booking time
  package_snapshot JSONB NOT NULL DEFAULT '{}',  -- full package details at booking time
  package_price BIGINT NOT NULL CHECK (package_price >= 0),
  addons_total BIGINT NOT NULL DEFAULT 0,
  travel_fee BIGINT NOT NULL DEFAULT 0,
  discount_amount BIGINT NOT NULL DEFAULT 0,
  voucher_code TEXT,
  total_amount BIGINT NOT NULL CHECK (total_amount >= 0),
  deposit_amount BIGINT,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES profiles(id),
  review_submitted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Concurrency protection
  CONSTRAINT check_no_negative_total CHECK (total_amount >= 0)
);

CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_photographer ON bookings(photographer_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(shooting_date, photographer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- ============================================================
-- BOOKING ADD-ONS (junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS booking_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  addon_id UUID NOT NULL REFERENCES package_addons(id),
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price BIGINT NOT NULL CHECK (unit_price >= 0),
  addon_snapshot JSONB NOT NULL DEFAULT '{}'
);

-- ============================================================
-- BOOKING STATUS HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS booking_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  actor_id UUID NOT NULL REFERENCES profiles(id),
  actor_role TEXT NOT NULL CHECK (actor_role IN ('CUSTOMER','PHOTOGRAPHER','ADMIN','SYSTEM')),
  note TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_history_booking ON booking_status_history(booking_id, created_at);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  amount BIGINT NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL 
    CHECK (payment_method IN ('momo','zalopay','shopee_pay','bank_transfer','card','sandbox')),
  status TEXT NOT NULL DEFAULT 'AWAITING_PAYMENT'
    CHECK (status IN (
      'AWAITING_PAYMENT','PAYMENT_PROCESSING','FUNDS_CONFIRMED',
      'HELD_BY_PROVIDER','DELIVERY_PENDING','REVIEW_WINDOW',
      'RELEASE_ELIGIBLE','RELEASE_PROCESSING','RELEASED',
      'DISPUTED','REFUND_PENDING','REFUNDED','FAILED'
    )),
  provider_transaction_id TEXT,
  provider_reference TEXT,
  idempotency_key TEXT UNIQUE NOT NULL,
  paid_at TIMESTAMPTZ,
  failed_reason TEXT,
  sandbox_mode BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_idempotency ON payments(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_payments_provider_tx ON payments(provider_transaction_id);

-- ============================================================
-- PAYMENT WEBHOOK EVENTS (for idempotency and audit)
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  event_type TEXT NOT NULL,
  provider_event_id TEXT NOT NULL,
  raw_payload JSONB NOT NULL,
  signature_valid BOOLEAN NOT NULL DEFAULT false,
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, provider_event_id)  -- prevents duplicate processing
);

-- ============================================================
-- ESCROW RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS escrow_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) UNIQUE,
  payment_id UUID NOT NULL REFERENCES payments(id),
  gross_amount BIGINT NOT NULL CHECK (gross_amount > 0),
  commission_amount BIGINT NOT NULL DEFAULT 0,
  net_amount BIGINT NOT NULL CHECK (net_amount >= 0),
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  commission_rule_id UUID REFERENCES commission_rules(id),
  commission_snapshot JSONB,  -- rule details at time of booking
  status TEXT NOT NULL DEFAULT 'AWAITING_PAYMENT'
    CHECK (status IN (
      'AWAITING_PAYMENT','PAYMENT_PROCESSING','FUNDS_CONFIRMED',
      'HELD_BY_PROVIDER','DELIVERY_PENDING','REVIEW_WINDOW',
      'RELEASE_ELIGIBLE','RELEASE_PROCESSING','RELEASED',
      'DISPUTED','REFUND_PENDING','REFUNDED','FAILED'
    )),
  delivery_confirmed_at TIMESTAMPTZ,
  review_window_ends_at TIMESTAMPTZ,
  release_eligible_at TIMESTAMPTZ,
  hold_reason TEXT,  -- if manually held by admin
  held_by UUID REFERENCES profiles(id),
  released_at TIMESTAMPTZ,
  payout_id UUID,  -- references withdrawal_requests(id), added later
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escrow_status ON escrow_records(status);
CREATE INDEX IF NOT EXISTS idx_escrow_release_eligible ON escrow_records(release_eligible_at) WHERE status = 'REVIEW_WINDOW';

-- ============================================================
-- ESCROW STATUS HISTORY (immutable audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS escrow_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID NOT NULL REFERENCES escrow_records(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  actor_id UUID REFERENCES profiles(id),
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- COMMISSION SNAPSHOTS (immutable record per booking)
-- ============================================================
CREATE TABLE IF NOT EXISTS commission_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) UNIQUE,
  rule_id UUID REFERENCES commission_rules(id),
  rule_type TEXT NOT NULL,
  rate NUMERIC(5,2) NOT NULL,
  gross_amount BIGINT NOT NULL,
  commission_amount BIGINT NOT NULL,
  net_amount BIGINT NOT NULL,
  justification TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- WITHDRAWAL REQUESTS (payout to photographers)
-- ============================================================
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES photographer_profiles(id),
  amount BIGINT NOT NULL CHECK (amount > 0),
  bank_name TEXT NOT NULL,
  account_number_hash TEXT NOT NULL,  -- hashed
  account_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','PROCESSING','COMPLETED','FAILED','CANCELLED')),
  provider_reference TEXT,
  processed_at TIMESTAMPTZ,
  failed_reason TEXT,
  requested_by UUID NOT NULL REFERENCES profiles(id),
  processed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FINANCIAL LEDGER ENTRIES (immutable double-entry style log)
-- ============================================================
CREATE TABLE IF NOT EXISTS financial_ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  payment_id UUID REFERENCES payments(id),
  escrow_id UUID REFERENCES escrow_records(id),
  withdrawal_id UUID REFERENCES withdrawal_requests(id),
  entry_type TEXT NOT NULL,  -- e.g. PAYMENT_RECEIVED, COMMISSION_DEDUCTED, PAYOUT_SENT
  debit_amount BIGINT NOT NULL DEFAULT 0,
  credit_amount BIGINT NOT NULL DEFAULT 0,
  balance_effect BIGINT NOT NULL,  -- net effect on photographer balance
  actor_id UUID REFERENCES profiles(id),
  description TEXT NOT NULL,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BOOKING DELIVERIES
-- ============================================================
CREATE TABLE IF NOT EXISTS booking_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) UNIQUE,
  photographer_id UUID NOT NULL REFERENCES photographer_profiles(id),
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','UPLOADED','DELIVERED','ACCEPTED','DISPUTED')),
  original_count INT NOT NULL DEFAULT 0,
  edited_count INT NOT NULL DEFAULT 0,
  retouch_count INT NOT NULL DEFAULT 0,
  required_original INT NOT NULL DEFAULT 0,
  required_edited INT NOT NULL DEFAULT 0,
  delivered_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PHOTO ASSETS
-- ============================================================
CREATE TABLE IF NOT EXISTS photo_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES booking_deliveries(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES profiles(id),
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size > 0),
  mime_type TEXT NOT NULL,
  category TEXT NOT NULL 
    CHECK (category IN ('original','edited','retouched','preview')),
  width INT,
  height INT,
  is_watermarked BOOLEAN NOT NULL DEFAULT false,
  selected_for_retouch BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_photo_assets_delivery ON photo_assets(delivery_id);
CREATE INDEX IF NOT EXISTS idx_photo_assets_booking ON photo_assets(booking_id, category);

-- ============================================================
-- RETOUCH SELECTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS retouch_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID NOT NULL REFERENCES booking_deliveries(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id),
  photo_asset_id UUID NOT NULL REFERENCES photo_assets(id),
  selected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(delivery_id, photo_asset_id)
);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) UNIQUE,
  customer_id UUID NOT NULL REFERENCES profiles(id),
  photographer_id UUID NOT NULL REFERENCES photographer_profiles(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT true,  -- came from completed booking
  is_demo BOOLEAN NOT NULL DEFAULT false,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  helpful_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_photographer ON reviews(photographer_id, created_at DESC);

-- ============================================================
-- CONVERSATIONS & MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_muted BOOLEAN NOT NULL DEFAULT false,
  last_read_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text'
    CHECK (message_type IN ('text','image','location','system')),
  attachment_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_flagged BOOLEAN NOT NULL DEFAULT false,  -- for moderation
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);

-- ============================================================
-- LOYALTY
-- ============================================================
CREATE TABLE IF NOT EXISTS loyalty_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  coin_balance INT NOT NULL DEFAULT 0 CHECK (coin_balance >= 0),
  lifetime_coins INT NOT NULL DEFAULT 0 CHECK (lifetime_coins >= 0),
  tier TEXT NOT NULL DEFAULT 'ROOKIE'
    CHECK (tier IN ('ROOKIE','CREATOR','ICON')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  amount INT NOT NULL,  -- positive = earned, negative = spent
  transaction_type TEXT NOT NULL
    CHECK (transaction_type IN ('EARNED','REDEEMED','EXPIRED','REVERSED','ADJUSTMENT')),
  reason TEXT NOT NULL,
  booking_id UUID REFERENCES bookings(id),
  voucher_id UUID,  -- FK added after vouchers table
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- VOUCHERS
-- ============================================================
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('PERCENTAGE','FIXED','FREE_RETOUCH')),
  discount_value BIGINT NOT NULL,
  max_discount BIGINT,
  min_order_value BIGINT,
  coin_cost INT,  -- null = admin-issued voucher
  usage_limit INT,
  usage_count INT NOT NULL DEFAULT 0,
  user_id UUID REFERENCES profiles(id),  -- null = public
  partner TEXT,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voucher_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID NOT NULL REFERENCES vouchers(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  booking_id UUID REFERENCES bookings(id),
  discount_applied BIGINT NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(voucher_id, user_id, booking_id)
);

-- Add FK for loyalty_transactions.voucher_id
ALTER TABLE loyalty_transactions 
  ADD CONSTRAINT fk_loyalty_voucher 
  FOREIGN KEY (voucher_id) REFERENCES vouchers(id);

-- ============================================================
-- DISPUTES
-- ============================================================
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) UNIQUE,
  customer_id UUID NOT NULL REFERENCES profiles(id),
  photographer_id UUID NOT NULL REFERENCES photographer_profiles(id),
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN'
    CHECK (status IN (
      'OPEN','UNDER_REVIEW','WAITING_FOR_EVIDENCE',
      'RESOLVED_FOR_CUSTOMER','RESOLVED_FOR_PHOTOGRAPHER','CLOSED'
    )),
  resolution TEXT,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dispute_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES profiles(id),
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  booking_id UUID REFERENCES bookings(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  criteria JSONB NOT NULL DEFAULT '{}',
  reward_type TEXT NOT NULL 
    CHECK (reward_type IN ('BADGE','COMMISSION_FREE','SPONSORED_CREDIT')),
  reward_value INT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS photographer_achievement_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES photographer_profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  reward_used BOOLEAN NOT NULL DEFAULT false,
  reward_used_at TIMESTAMPTZ,
  UNIQUE(photographer_id, achievement_id)
);

-- ============================================================
-- SPONSORED CAMPAIGNS
-- ============================================================
CREATE TABLE IF NOT EXISTS sponsored_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES photographer_profiles(id),
  name TEXT NOT NULL,
  budget_credits INT NOT NULL DEFAULT 0,
  used_credits INT NOT NULL DEFAULT 0,
  impressions INT NOT NULL DEFAULT 0,
  clicks INT NOT NULL DEFAULT 0,
  resulting_bookings INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT','ACTIVE','PAUSED','ENDED','EXPIRED')),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ADMIN AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON admin_audit_logs(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON admin_audit_logs(target_type, target_id);

-- ============================================================
-- SYSTEM SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_sensitive BOOLEAN NOT NULL DEFAULT false,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS: Updated At
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles','photographer_profiles','photographer_kyc',
    'photographer_packages','photographer_portfolios',
    'service_packages','bookings','payments','escrow_records',
    'booking_deliveries','reviews','conversations','loyalty_accounts',
    'vouchers','disputes','withdrawal_requests',
    'commission_rules','user_preferences','sponsored_campaigns'
  ] LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I;
      CREATE TRIGGER trg_%I_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    ', t, t, t, t);
  END LOOP;
END $$;

-- ============================================================
-- TRIGGER: Auto-create profile after user signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create loyalty account
  INSERT INTO loyalty_accounts (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create user preferences
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- TRIGGER: Auto-update photographer avg_rating
-- ============================================================
CREATE OR REPLACE FUNCTION update_photographer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE photographer_profiles
  SET 
    avg_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE photographer_id = COALESCE(NEW.photographer_id, OLD.photographer_id)
        AND is_hidden = false
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE photographer_id = COALESCE(NEW.photographer_id, OLD.photographer_id)
        AND is_hidden = false
    )
  WHERE id = COALESCE(NEW.photographer_id, OLD.photographer_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_photographer_rating ON reviews;
CREATE TRIGGER trg_update_photographer_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_photographer_rating();

-- ============================================================
-- TRIGGER: Auto-update loyalty tier
-- ============================================================
CREATE OR REPLACE FUNCTION update_loyalty_tier()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tier = CASE
    WHEN NEW.lifetime_coins >= 500 THEN 'ICON'
    WHEN NEW.lifetime_coins >= 200 THEN 'CREATOR'
    ELSE 'ROOKIE'
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_loyalty_tier ON loyalty_accounts;
CREATE TRIGGER trg_update_loyalty_tier
  BEFORE UPDATE OF lifetime_coins ON loyalty_accounts
  FOR EACH ROW EXECUTE FUNCTION update_loyalty_tier();

-- ============================================================
-- FUNCTION: Check booking collision (concurrency-safe)
-- ============================================================
CREATE OR REPLACE FUNCTION check_booking_collision(
  p_photographer_id UUID,
  p_date DATE,
  p_time TIME,
  p_duration INT,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  new_start TIME := p_time;
  new_end TIME := (p_time::INTERVAL + (p_duration || ' minutes')::INTERVAL)::TIME;
  collision_count INT;
BEGIN
  SELECT COUNT(*)
  INTO collision_count
  FROM bookings b
  WHERE b.photographer_id = p_photographer_id
    AND b.shooting_date = p_date
    AND b.status NOT IN ('CANCELLED', 'REFUNDED')
    AND (p_exclude_booking_id IS NULL OR b.id != p_exclude_booking_id)
    AND (
      -- New booking overlaps with existing
      (b.shooting_time, (b.shooting_time::INTERVAL + (b.duration_minutes || ' minutes')::INTERVAL)::TIME)
      OVERLAPS
      (new_start, new_end)
    );
  
  RETURN collision_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Calculate commission for a booking
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_commission(
  p_photographer_id UUID,
  p_package_slug TEXT,
  p_customer_id UUID,
  p_amount BIGINT
)
RETURNS TABLE(
  rate NUMERIC,
  commission_amount BIGINT,
  net_amount BIGINT,
  rule_type TEXT,
  rule_id UUID,
  justification TEXT
) AS $$
DECLARE
  v_completed_bookings INT;
  v_is_returning_customer BOOLEAN;
  v_rule commission_rules%ROWTYPE;
  v_rate NUMERIC := 6.0;  -- default
  v_rule_type TEXT := 'STANDARD';
  v_rule_id UUID;
  v_justification TEXT;
BEGIN
  -- Count photographer's eligible completed bookings
  SELECT COUNT(*)
  INTO v_completed_bookings
  FROM bookings b
  JOIN payments p ON p.booking_id = b.id
  WHERE b.photographer_id = p_photographer_id
    AND b.status = 'COMPLETED'
    AND p.status = 'RELEASED';

  -- Check if returning customer
  SELECT EXISTS(
    SELECT 1 FROM bookings b
    JOIN payments p ON p.booking_id = b.id
    WHERE b.photographer_id = p_photographer_id
      AND b.customer_id = p_customer_id
      AND b.status = 'COMPLETED'
      AND p.status = 'RELEASED'
  ) INTO v_is_returning_customer;

  -- Priority 1: First N bookings free (for new photographers)
  IF v_completed_bookings < 3 THEN
    SELECT * INTO v_rule
    FROM commission_rules
    WHERE rule_type = 'FIRST_N_BOOKINGS'
      AND is_active = true
      AND (max_booking_count IS NULL OR v_completed_bookings < max_booking_count)
      AND effective_from <= NOW()
      AND (effective_until IS NULL OR effective_until > NOW())
    ORDER BY priority DESC
    LIMIT 1;

    IF v_rule.id IS NOT NULL THEN
      v_rate := v_rule.rate;
      v_rule_type := 'FIRST_N_BOOKINGS';
      v_rule_id := v_rule.id;
      v_justification := format('First %s bookings promotion (booking #%s)', v_rule.max_booking_count, v_completed_bookings + 1);
    ELSE
      v_rate := 0;
      v_rule_type := 'FIRST_N_BOOKINGS';
      v_justification := format('First 3 bookings: 0%% commission (booking #%s)', v_completed_bookings + 1);
    END IF;
  
  -- Priority 2: Returning customer
  ELSIF v_is_returning_customer THEN
    SELECT * INTO v_rule
    FROM commission_rules
    WHERE rule_type = 'RETURNING_CUSTOMER'
      AND is_active = true
      AND effective_from <= NOW()
      AND (effective_until IS NULL OR effective_until > NOW())
    ORDER BY priority DESC
    LIMIT 1;

    IF v_rule.id IS NOT NULL THEN
      v_rate := v_rule.rate;
      v_rule_id := v_rule.id;
    ELSE
      v_rate := 4.0;  -- default returning customer rate
    END IF;
    v_rule_type := 'RETURNING_CUSTOMER';
    v_justification := 'Returning customer promotional rate';
  
  -- Priority 3: Package-based standard rate
  ELSE
    SELECT * INTO v_rule
    FROM commission_rules
    WHERE rule_type = 'STANDARD'
      AND (package_slug IS NULL OR package_slug = p_package_slug)
      AND is_active = true
      AND effective_from <= NOW()
      AND (effective_until IS NULL OR effective_until > NOW())
    ORDER BY 
      CASE WHEN package_slug IS NOT NULL THEN 0 ELSE 1 END,  -- prefer specific package rule
      priority DESC
    LIMIT 1;

    IF v_rule.id IS NOT NULL THEN
      v_rate := v_rule.rate;
      v_rule_id := v_rule.id;
      v_justification := format('Standard rate for package: %s', p_package_slug);
    ELSE
      -- Hardcoded defaults if no rule found
      v_rate := CASE
        WHEN p_package_slug IN ('flash-shot', 'quick-date') THEN 6.0
        WHEN p_package_slug IN ('vibe-sai-gon', 'outdoor') THEN 9.0
        ELSE 6.0
      END;
      v_justification := 'Default standard rate';
    END IF;
    v_rule_type := 'STANDARD';
  END IF;

  RETURN QUERY SELECT
    v_rate,
    ROUND(p_amount * v_rate / 100)::BIGINT,
    p_amount - ROUND(p_amount * v_rate / 100)::BIGINT,
    v_rule_type,
    v_rule_id,
    v_justification;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: Validate retouch selection count
-- ============================================================
CREATE OR REPLACE FUNCTION validate_retouch_selection(
  p_delivery_id UUID,
  p_booking_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_quota INT;
  v_selected INT;
BEGIN
  -- Get retouch quota from booking snapshot
  SELECT (b.package_snapshot->>'retouch_quota')::INT
  INTO v_quota
  FROM bookings b
  WHERE b.id = p_booking_id;

  -- Count current selections
  SELECT COUNT(*)
  INTO v_selected
  FROM retouch_selections
  WHERE delivery_id = p_delivery_id;

  RETURN v_selected <= COALESCE(v_quota, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default system settings
INSERT INTO system_settings (key, value, description) VALUES
  ('review_window_hours', '48', 'Hours before payout is released after photo delivery'),
  ('deposit_percentage', '30', 'Percentage of booking total required as deposit'),
  ('max_dispute_days', '7', 'Days after delivery that customer can open a dispute'),
  ('loyalty_coins_per_percent', '2', 'Loyalty coins earned per 1% of booking value'),
  ('min_coins_per_booking', '10', 'Minimum coins earned per booking'),
  ('max_coins_per_booking', '500', 'Maximum coins earned per booking'),
  ('coin_to_vnd_rate', '100', 'VND value per loyalty coin'),
  ('achievement_quarter_min_bookings', '30', 'Min bookings for Star of Quarter'),
  ('achievement_quarter_min_rating', '4.8', 'Min rating for Star of Quarter')
ON CONFLICT (key) DO NOTHING;

-- Insert default commission rules
INSERT INTO commission_rules (name, description, rule_type, package_slug, rate, max_booking_count, priority) VALUES
  ('First 3 Bookings Free', 'New photographers: 0% for first 3 bookings', 'FIRST_N_BOOKINGS', NULL, 0, 3, 100),
  ('Flash Shot Standard', 'Standard commission for Flash Shot', 'STANDARD', 'flash-shot', 6.0, NULL, 10),
  ('Quick Date Standard', 'Standard commission for Quick Date', 'STANDARD', 'quick-date', 6.0, NULL, 10),
  ('Vibe Sai Gon Standard', 'Standard commission for Vibe Sài Gòn', 'STANDARD', 'vibe-sai-gon', 9.0, NULL, 10),
  ('Outdoor Standard', 'Standard commission for Outdoor', 'STANDARD', 'outdoor', 9.0, NULL, 10),
  ('Returning Customer', 'Discounted rate for returning customers', 'RETURNING_CUSTOMER', NULL, 4.0, NULL, 50)
ON CONFLICT DO NOTHING;

-- Insert service categories
INSERT INTO service_categories (slug, name, name_vi, icon, sort_order) VALUES
  ('lifestyle', 'Lifestyle', 'Lifestyle', '✨', 1),
  ('street', 'Street Photography', 'Street Photography', '🌆', 2),
  ('couple', 'Couple', 'Chụp đôi', '💑', 3),
  ('quick_date', 'Quick Date', 'Quick Date', '☕', 4),
  ('tet_ao_dai', 'Tet / Ao Dai', 'Tết / Áo dài', '🌸', 5),
  ('graduation', 'Graduation', 'Kỷ yếu', '🎓', 6),
  ('outdoor', 'Outdoor', 'Dã ngoại', '🏔️', 7),
  ('travel', 'Travel', 'Du lịch', '✈️', 8),
  ('events', 'Events', 'Sự kiện', '🎉', 9),
  ('portrait', 'Portrait', 'Chân dung', '🖼️', 10),
  ('concept', 'Concept', 'Concept', '🎨', 11)
ON CONFLICT (slug) DO NOTHING;

-- Insert service packages
INSERT INTO service_packages (slug, name, description, duration_minutes, base_price, max_price, original_photos, edited_photos, retouch_quota, delivery_days, sort_order) VALUES
  ('flash-shot', 'Flash Shot', 'Chụp nhanh, kết quả đẹp — hoàn hảo cho một buổi chiều tự do', 20, 79000, 99000, 30, 5, 0, 2, 1),
  ('quick-date', 'Quick Date', 'Buổi chụp lãng mạn, ấm áp — kỷ niệm từng khoảnh khắc đẹp', 45, 150000, 300000, 100, 15, 5, 3, 2),
  ('vibe-sai-gon', 'Vibe Sài Gòn', 'Trải nghiệm đô thị sôi động — bắt trọn linh hồn của Sài Gòn', 150, 400000, 700000, 200, 40, 10, 5, 3),
  ('outdoor', 'Outdoor / Dã ngoại', 'Phiêu lưu giữa thiên nhiên — câu chuyện bằng hình ảnh của bạn', 240, 800000, 1500000, 400, 60, 20, 7, 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert add-ons
INSERT INTO package_addons (name, name_vi, description, price, max_quantity, sort_order) VALUES
  ('Makeup', 'Trang điểm', 'Dịch vụ trang điểm chuyên nghiệp', 150000, 1, 1),
  ('Hairstyling', 'Làm tóc', 'Tạo kiểu tóc cho buổi chụp', 100000, 1, 2),
  ('Outfit Rental', 'Thuê trang phục', 'Thuê trang phục theo chủ đề', 200000, 3, 3),
  ('Extra Editing', 'Thêm ảnh chỉnh sửa', 'Thêm 5 ảnh được chỉnh màu', 100000, 5, 4),
  ('Extra Retouch', 'Thêm ảnh retouch', 'Thêm 1 ảnh retouch nâng cao', 80000, 10, 5),
  ('Extra Time', 'Thêm giờ chụp', 'Thêm 30 phút chụp', 100000, 4, 6),
  ('Travel Fee', 'Phụ phí di chuyển', 'Chi phí di chuyển ngoài 3km', 50000, 10, 7)
ON CONFLICT DO NOTHING;

-- Insert default achievements
INSERT INTO achievements (slug, name, description, icon, criteria, reward_type, reward_value) VALUES
  ('star-of-quarter', 'Star of the Quarter', 'Đạt 30+ đơn hoàn thành với rating 4.8+ trong quý', '⭐', 
   '{"min_completed_bookings": 30, "min_avg_rating": 4.8, "period": "quarter"}', 
   'COMMISSION_FREE', 10),
  ('golden-badge', 'Golden Badge', 'Nhiếp ảnh gia xuất sắc với 100+ đánh giá 5 sao', '🥇',
   '{"min_5_star_reviews": 100}',
   'BADGE', NULL),
  ('speed-shooter', 'Speed Shooter', 'Hoàn thành 10 đơn Flash Shot trong tháng', '⚡',
   '{"package_slug": "flash-shot", "min_count": 10, "period": "month"}',
   'BADGE', NULL)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
