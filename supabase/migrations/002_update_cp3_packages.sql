-- ============================================================
-- FLASHY - Migration 002: CP3 Service Packages Update
-- Adds CP3 package fields & seeds 4 standard packages:
-- 1. FLASHY EXPRESS (350.000 VNĐ)
-- 2. FLASHY CASUAL (800.000 VNĐ)
-- 3. FLASHY PRO (1.500.000 VNĐ)
-- 4. FLASHY SIGNATURE (3.200.000 VNĐ)
-- ============================================================

-- 1. Add CP3 columns to service_packages if they don't exist
ALTER TABLE service_packages ADD COLUMN IF NOT EXISTS equipment TEXT;
ALTER TABLE service_packages ADD COLUMN IF NOT EXISTS deliverables TEXT;
ALTER TABLE service_packages ADD COLUMN IF NOT EXISTS delivery_time TEXT;
ALTER TABLE service_packages ADD COLUMN IF NOT EXISTS duration_text TEXT;
ALTER TABLE service_packages ADD COLUMN IF NOT EXISTS service_includes TEXT;
ALTER TABLE service_packages ADD COLUMN IF NOT EXISTS photographer_tier TEXT;

-- 2. Upsert 4 standard CP3 packages
INSERT INTO service_packages (
  slug, name, description, duration_minutes, duration_text, base_price, max_price, 
  original_photos, edited_photos, retouch_quota, delivery_days, 
  equipment, deliverables, delivery_time, service_includes, photographer_tier, sort_order
) VALUES
  (
    'flashy-express', 
    'FLASHY EXPRESS', 
    'Chụp nhanh với điện thoại Flagship hiện đại, nhận ảnh liền tay trong ngày. Phù hợp cho cafe, dạo phố, check-in sống ảo tức thì.', 
    60, '45 – 60 phút', 350000, 350000, 
    50, 10, 0, 1,
    'Điện thoại Flagship (iPhone 14 Pro / 15 Pro Max, Samsung Ultra)',
    '5 – 10 ảnh đã chỉnh màu cơ bản + Toàn bộ file gốc',
    'Bàn giao ngay tại chỗ / AirDrop / Link Drive trong ngày',
    'Thợ chụp hướng dẫn tạo dáng cơ bản, di chuyển nội thành (<8km)',
    'Creator / Thợ chụp Phone mát tay',
    1
  ),
  (
    'flashy-casual', 
    'FLASHY CASUAL', 
    'Chụp ảnh máy cơ bản với Freelancer giàu năng lượng, nhận 10 ảnh chỉnh màu (5 ảnh retouch da & dáng kỹ) và toàn bộ file gốc.', 
    90, '90 phút', 800000, 800000, 
    100, 10, 5, 5,
    'Máy ảnh cơ bản (Crop / Full-frame entry-level)',
    '10 ảnh chỉnh màu (trong đó có 5 ảnh Retouch da & dáng kỹ) + Toàn bộ file gốc',
    '3 – 5 ngày làm việc qua Cloud',
    'Hướng dẫn tạo dáng, di chuyển cơ bản nội thành (<8km)',
    'Freelancer 1–2 năm kinh nghiệm',
    2
  ),
  (
    'flashy-pro', 
    'FLASHY PRO', 
    'Buổi chụp tiêu chuẩn chuyên nghiệp với máy ảnh Full-frame và hắt sáng, kèm tư vấn concept & phối đồ kỹ lưỡng.', 
    120, '120 phút', 1500000, 1500000, 
    200, 15, 10, 7,
    'Máy ảnh chuyên nghiệp (Full-frame chuyên dụng) + Hắt sáng',
    '15 ảnh chỉnh màu (trong đó có 10 ảnh Retouch da & dáng kỹ) + Toàn bộ file gốc',
    '5 – 7 ngày làm việc qua Cloud',
    'Hướng dẫn tạo dáng chuyên sâu, hắt sáng hỗ trợ, tư vấn concept & phối đồ, di chuyển tiêu chuẩn',
    'Freelancer cứng tay (2–4 năm kinh nghiệm), Portfolio kiểm duyệt đạt chuẩn Pro',
    3
  ),
  (
    'flashy-signature', 
    'FLASHY SIGNATURE', 
    'Gói chụp cao cấp trọn gói bao gồm Makeup + Làm tóc layout riêng, lên moodboard độc quyền cùng Senior Photographer.', 
    150, '150 phút', 3200000, 3200000, 
    300, 20, 15, 10,
    'Máy ảnh cao cấp + Đèn phụ Studio / Hắt sáng chuyên dụng',
    '20 ảnh chỉnh màu (trong đó có 15 ảnh Retouch cấp tạp chí) + Toàn bộ file gốc',
    '7 – 10 ngày làm việc qua Cloud',
    'ĐÃ BAO GỒM Makeup + Làm tóc (1 Layout chuyên nghiệp), Lên Moodboard Concept riêng, hướng dẫn dáng cao cấp',
    'Senior Photographer / KOLs nhiếp ảnh uy tín trên sàn',
    4
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  duration_text = EXCLUDED.duration_text,
  base_price = EXCLUDED.base_price,
  max_price = EXCLUDED.max_price,
  original_photos = EXCLUDED.original_photos,
  edited_photos = EXCLUDED.edited_photos,
  retouch_quota = EXCLUDED.retouch_quota,
  delivery_days = EXCLUDED.delivery_days,
  equipment = EXCLUDED.equipment,
  deliverables = EXCLUDED.deliverables,
  delivery_time = EXCLUDED.delivery_time,
  service_includes = EXCLUDED.service_includes,
  photographer_tier = EXCLUDED.photographer_tier,
  sort_order = EXCLUDED.sort_order;

-- 3. Deactivate legacy packages (Flash Shot, Quick Date, Vibe Sài Gòn, Outdoor)
UPDATE service_packages 
SET is_active = false 
WHERE slug IN ('flash-shot', 'quick-date', 'vibe-sai-gon', 'outdoor');

-- 4. Update commission rules to CP3 Fixed 15% Take Rate
-- Remove legacy commission rules
DELETE FROM commission_rules 
WHERE package_slug IN ('flash-shot', 'quick-date', 'vibe-sai-gon', 'outdoor')
   OR rule_type IN ('FIRST_N_BOOKINGS', 'RETURNING_CUSTOMER');

-- Insert CP3 15% Fixed Commission Rules
INSERT INTO commission_rules (name, description, rule_type, package_slug, rate, max_booking_count, priority) VALUES
  ('FLASHY Express 15%', 'Fixed 15% platform take rate for FLASHY EXPRESS', 'STANDARD', 'flashy-express', 15.0, NULL, 10),
  ('FLASHY Casual 15%', 'Fixed 15% platform take rate for FLASHY CASUAL', 'STANDARD', 'flashy-casual', 15.0, NULL, 10),
  ('FLASHY Pro 15%', 'Fixed 15% platform take rate for FLASHY PRO', 'STANDARD', 'flashy-pro', 15.0, NULL, 10),
  ('FLASHY Signature 15%', 'Fixed 15% platform take rate for FLASHY SIGNATURE', 'STANDARD', 'flashy-signature', 15.0, NULL, 10),
  ('Star of the Quarter Reward', '0% commission incentive for top performers', 'STAR_OF_QUARTER', NULL, 0, 10, 100)
ON CONFLICT DO NOTHING;
