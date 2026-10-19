-- ============================================================
-- FLASHY Migration: 20261019_enable_rls.sql
-- Enforce Row Level Security (RLS) on Bookings, Profiles & Security Logs
-- Compliance: OWASP Top 10 - A01:2021 (Broken Access Control)
-- ============================================================

-- ------------------------------------------------------------
-- 1. Ensure core BOOKINGS table exists & Enable RLS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  photographer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  package_id UUID REFERENCES service_packages(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT'
    CHECK (status IN ('PENDING_PAYMENT', 'CONFIRMED', 'SHOOTING', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'DISPUTED')),
  shooting_date DATE NOT NULL,
  shooting_time TIME NOT NULL,
  location TEXT NOT NULL,
  total_amount BIGINT NOT NULL DEFAULT 0,
  deposit_amount BIGINT NOT NULL DEFAULT 0,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid collision
DROP POLICY IF EXISTS "customers_read_own_bookings" ON bookings;
DROP POLICY IF EXISTS "customers_insert_own_bookings" ON bookings;
DROP POLICY IF EXISTS "customers_update_own_bookings" ON bookings;
DROP POLICY IF EXISTS "photographers_read_assigned_bookings" ON bookings;
DROP POLICY IF EXISTS "photographers_update_assigned_bookings" ON bookings;
DROP POLICY IF EXISTS "admins_manage_all_bookings" ON bookings;

-- Policy 1.1: Customer can read their own bookings only
CREATE POLICY "customers_read_own_bookings"
  ON bookings
  FOR SELECT
  USING (auth.uid() = customer_id);

-- Policy 1.2: Customer can create bookings for themselves
CREATE POLICY "customers_insert_own_bookings"
  ON bookings
  FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Policy 1.3: Customer can update/cancel their own pending bookings
CREATE POLICY "customers_update_own_bookings"
  ON bookings
  FOR UPDATE
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

-- Policy 1.4: Photographer can view bookings assigned to them
CREATE POLICY "photographers_read_assigned_bookings"
  ON bookings
  FOR SELECT
  USING (auth.uid() = photographer_id);

-- Policy 1.5: Photographer can update status of their assigned bookings
CREATE POLICY "photographers_update_assigned_bookings"
  ON bookings
  FOR UPDATE
  USING (auth.uid() = photographer_id)
  WITH CHECK (auth.uid() = photographer_id);

-- Policy 1.6: Platform Admins have full access to all bookings
CREATE POLICY "admins_manage_all_bookings"
  ON bookings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'ADMIN'
    )
  );

-- ------------------------------------------------------------
-- 2. Enable RLS on PROFILES (Users table)
-- ------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active_profiles" ON profiles;
DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "admins_manage_all_profiles" ON profiles;

-- Policy 2.1: Public can view active profiles (for photographer marketplace discovery)
CREATE POLICY "public_read_active_profiles"
  ON profiles
  FOR SELECT
  USING (is_active = true);

-- Policy 2.2: Authenticated user can read their own profile
CREATE POLICY "users_read_own_profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy 2.3: Authenticated user can update their own profile info
CREATE POLICY "users_update_own_profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 2.4: Admins have full CRUD on all user profiles
CREATE POLICY "admins_manage_all_profiles"
  ON profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'ADMIN'
    )
  );

-- ------------------------------------------------------------
-- 3. Create & Secure SECURITY_AUDIT_LOGS table (OWASP A09)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  user_id TEXT,
  email TEXT,
  role TEXT,
  ip_address TEXT,
  user_agent TEXT,
  endpoint TEXT,
  action TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for rapid SIEM / Admin security investigation
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_event_type ON security_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_severity ON security_audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_at ON security_audit_logs(created_at DESC);

-- Enable RLS on security_audit_logs
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_view_security_logs" ON security_audit_logs;
DROP POLICY IF EXISTS "allow_server_insert_security_logs" ON security_audit_logs;

-- Policy 3.1: Only ADMIN users can inspect security audit logs
CREATE POLICY "admins_view_security_logs"
  ON security_audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'ADMIN'
    )
  );

-- Policy 3.2: Allow backend service role & authenticated API triggers to log events
CREATE POLICY "allow_server_insert_security_logs"
  ON security_audit_logs
  FOR INSERT
  WITH CHECK (true);
