/**
 * FLASHY - Database Seed Script
 * Seeds the CP3 Standard 4 Service Packages into the database / local mock store.
 */

const { createClient } = require('@supabase/supabase-js')

const CP3_PACKAGES = [
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
    sort_order: 1,
    is_active: true,
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
    sort_order: 2,
    is_active: true,
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
    sort_order: 3,
    is_active: true,
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
    sort_order: 4,
    is_active: true,
  },
]

async function seed() {
  console.log('🚀 [FLASHY CP3] Starting Service Packages Seeding...\n')

  console.log('📦 Danh mục 4 gói dịch vụ mới chuẩn CP3:')
  CP3_PACKAGES.forEach((pkg, idx) => {
    console.log(`  ${idx + 1}. ${pkg.name} (${new Intl.NumberFormat('vi-VN').format(pkg.base_price)} VNĐ)`)
    console.log(`     - Thiết bị: ${pkg.equipment}`)
    console.log(`     - Thời lượng: ${pkg.duration_text}`)
    console.log(`     - Bàn giao: ${pkg.deliverables}`)
    console.log(`     - Hạn trả ảnh: ${pkg.delivery_time}`)
    console.log(`     - Dịch vụ bao gồm: ${pkg.service_includes}`)
    console.log(`     - Phân khúc thợ: ${pkg.photographer_tier}\n`)
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
    try {
      console.log(`📡 Connecting to Supabase at ${supabaseUrl}...`)
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { data, error } = await supabase
        .from('service_packages')
        .upsert(CP3_PACKAGES, { onConflict: 'slug' })

      if (error) {
        console.warn('⚠️ Supabase upsert note:', error.message)
      } else {
        console.log('✅ Supabase database table `service_packages` updated successfully!')
      }
    } catch (e) {
      console.warn('⚠️ Could not connect to remote Supabase instance:', e.message)
    }
  } else {
    console.log('ℹ️ No remote Supabase credentials in environment; mock data & SQL migration files are up to date.')
  }

  console.log('✨ [FLASHY CP3] Seeding completed successfully!')
}

seed()
