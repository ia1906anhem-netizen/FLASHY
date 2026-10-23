'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Camera,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  PlusCircle,
  Smartphone,
  Layers,
  Calendar,
  UserCheck
} from 'lucide-react'
import { DEMO_PACKAGES, DEMO_ADDONS } from '@/lib/data/mock-data'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PackageCard } from '@/components/packages/package-card'
import { BookingModal } from '@/components/packages/booking-modal'
import { ServicePackage } from '@/types'

export default function PackagesPage() {
  const [selectedBookingPkg, setSelectedBookingPkg] = useState<ServicePackage | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false)

  const handleOpenBooking = (pkg: ServicePackage) => {
    setSelectedBookingPkg(pkg)
    setIsBookingModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="verified" className="mb-3 px-3 py-1 text-xs">
            Bảng giá minh bạch 100% • Không phí ẩn
          </Badge>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Các Gói Dịch Vụ Chụp Ảnh FLASHY
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Danh mục 4 gói dịch vụ chụp ảnh tiêu chuẩn được định vị rõ ràng từ điện thoại Flagship check-in nhanh đến gói Signature trọn gói Makeup. Giá niêm yết minh bạch, bảo vệ quyền lợi với Escrow 48h.
          </p>
        </div>

        {/* 4 Standard Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 items-stretch">
          {DEMO_PACKAGES.map((pkg, idx) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="flex"
            >
              <PackageCard
                pkg={pkg}
                index={idx}
                className="w-full"
                onBookNow={handleOpenBooking}
                actionLabel="Đặt lịch gói này"
              />
            </motion.div>
          ))}
        </div>

        {/* Add-ons Services Section */}
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-sm mb-16">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold text-violet-600 uppercase tracking-wider bg-violet-50 px-2.5 py-1 rounded-md">
              Dịch vụ cộng thêm (Add-ons)
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">
              Nâng Tầm Buổi Chụp Của Bạn
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Bạn có thể dễ dàng chọn thêm chuyên viên trang điểm, trang phục hoặc dịch vụ trả ảnh hỏa tốc ngay trong bước đặt lịch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {DEMO_ADDONS.map((addon) => (
              <div key={addon.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-violet-300 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-3">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">{addon.name}</h4>
                <p className="text-xs text-slate-500 mb-3">{addon.description}</p>
                <div className="font-black text-violet-700 text-base">
                  +{formatVND(addon.price)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CP3 Comparison Table */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-16 overflow-x-auto">
          <div className="mb-6">
            <span className="text-xs font-bold text-violet-600 uppercase tracking-wider bg-violet-50 px-2.5 py-1 rounded-md">
              Bảng so sánh chi tiết
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">
              So Sánh Đầy Đủ Quyền Lợi 4 Gói Tiêu Chuẩn CP3
            </h2>
          </div>

          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-bold w-1/5">Tiêu chí</th>
                <th className="pb-3 font-bold text-emerald-700 w-1/5">
                  1. FLASHY EXPRESS
                </th>
                <th className="pb-3 font-bold text-violet-600 w-1/5">
                  2. FLASHY CASUAL 🔥
                </th>
                <th className="pb-3 font-bold text-indigo-600 w-1/5">
                  3. FLASHY PRO ⭐
                </th>
                <th className="pb-3 font-bold text-amber-600 w-1/5">
                  4. FLASHY SIGNATURE 👑
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3.5 font-bold text-slate-900">Giá niêm yết</td>
                <td className="py-3.5 font-black text-emerald-600 text-sm">350.000 VNĐ</td>
                <td className="py-3.5 font-black text-violet-600 text-sm">800.000 VNĐ</td>
                <td className="py-3.5 font-black text-indigo-600 text-sm">1.500.000 VNĐ</td>
                <td className="py-3.5 font-black text-amber-600 text-sm">3.200.000 VNĐ</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-slate-900">Thiết bị sử dụng</td>
                <td className="py-3.5 font-semibold text-slate-800">
                  Điện thoại Flagship (iPhone 14 Pro / 15 Pro Max, Samsung Ultra)
                </td>
                <td className="py-3.5 font-semibold text-slate-800">
                  Máy ảnh cơ bản (Crop / Full-frame entry-level)
                </td>
                <td className="py-3.5 font-semibold text-slate-800">
                  Máy ảnh chuyên nghiệp (Full-frame chuyên dụng) + Hắt sáng
                </td>
                <td className="py-3.5 font-semibold text-slate-800">
                  Máy ảnh cao cấp + Đèn phụ Studio / Hắt sáng chuyên dụng
                </td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-slate-900">Thời lượng chụp</td>
                <td className="py-3.5 font-semibold">45 – 60 phút</td>
                <td className="py-3.5 font-semibold">90 phút</td>
                <td className="py-3.5 font-semibold">120 phút</td>
                <td className="py-3.5 font-semibold">150 phút</td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-slate-900">Sản phẩm bàn giao</td>
                <td className="py-3.5">
                  5 – 10 ảnh đã chỉnh màu cơ bản + Toàn bộ file gốc
                </td>
                <td className="py-3.5">
                  10 ảnh chỉnh màu (trong đó có 5 ảnh Retouch da & dáng kỹ) + Toàn bộ file gốc
                </td>
                <td className="py-3.5">
                  15 ảnh chỉnh màu (trong đó có 10 ảnh Retouch da & dáng kỹ) + Toàn bộ file gốc
                </td>
                <td className="py-3.5">
                  20 ảnh chỉnh màu (trong đó có 15 ảnh Retouch cấp tạp chí) + Toàn bộ file gốc
                </td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-slate-900">Hạn trả ảnh</td>
                <td className="py-3.5 font-bold text-emerald-600">
                  Bàn giao ngay tại chỗ / AirDrop / Link Drive trong ngày
                </td>
                <td className="py-3.5 font-semibold text-violet-700">
                  3 – 5 ngày làm việc qua Cloud
                </td>
                <td className="py-3.5 font-semibold text-indigo-700">
                  5 – 7 ngày làm việc qua Cloud
                </td>
                <td className="py-3.5 font-semibold text-amber-700">
                  7 – 10 ngày làm việc qua Cloud
                </td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-slate-900">Dịch vụ bao gồm</td>
                <td className="py-3.5">
                  Thợ chụp hướng dẫn tạo dáng cơ bản, di chuyển nội thành (&lt;8km)
                </td>
                <td className="py-3.5">
                  Hướng dẫn tạo dáng, di chuyển cơ bản nội thành (&lt;8km)
                </td>
                <td className="py-3.5">
                  Hướng dẫn tạo dáng chuyên sâu, hắt sáng hỗ trợ, tư vấn concept & phối đồ, di chuyển tiêu chuẩn
                </td>
                <td className="py-3.5 text-amber-900 bg-amber-50/50 p-2 rounded-xl">
                  <strong>ĐÃ BAO GỒM Makeup + Làm tóc</strong> (1 Layout chuyên nghiệp), Lên Moodboard Concept riêng, hướng dẫn dáng cao cấp
                </td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-slate-900">Phân khúc thợ</td>
                <td className="py-3.5 font-semibold text-slate-700">
                  Creator / Thợ chụp Phone mát tay
                </td>
                <td className="py-3.5 font-semibold text-slate-700">
                  Freelancer 1–2 năm kinh nghiệm
                </td>
                <td className="py-3.5 font-semibold text-slate-700">
                  Freelancer cứng tay (2–4 năm kinh nghiệm), Portfolio kiểm duyệt đạt chuẩn Pro
                </td>
                <td className="py-3.5 font-semibold text-slate-700">
                  Senior Photographer / KOLs nhiếp ảnh uy tín trên sàn
                </td>
              </tr>
              <tr>
                <td className="py-3.5 font-bold text-slate-900">Thao tác</td>
                <td className="py-3.5">
                  <Button
                    size="sm"
                    onClick={() => handleOpenBooking(DEMO_PACKAGES[0])}
                    className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white h-9"
                  >
                    Đặt gói này
                  </Button>
                </td>
                <td className="py-3.5">
                  <Button
                    size="sm"
                    onClick={() => handleOpenBooking(DEMO_PACKAGES[1])}
                    className="rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white h-9"
                  >
                    Đặt gói này
                  </Button>
                </td>
                <td className="py-3.5">
                  <Button
                    size="sm"
                    onClick={() => handleOpenBooking(DEMO_PACKAGES[2])}
                    className="rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white h-9"
                  >
                    Đặt gói này
                  </Button>
                </td>
                <td className="py-3.5">
                  <Button
                    size="sm"
                    onClick={() => handleOpenBooking(DEMO_PACKAGES[3])}
                    className="rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white h-9"
                  >
                    Đặt gói này
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Escrow Guarantee Callout */}
        <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-violet-300 font-bold text-xs uppercase tracking-wider mb-2">
              <ShieldCheck className="w-5 h-5 text-violet-400" />
              Chính sách bảo vệ khách hàng 100%
            </div>
            <h3 className="text-2xl md:text-3xl font-black mb-3">
              Yên Tâm Đặt Lịch Với Cơ Chế Giữ Tiền 48 Giờ
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              FLASHY giữ tiền an toàn cho đến khi bạn nhận ảnh và duyệt hài lòng. Trong 48 giờ sau khi nhận ảnh, bạn có thể yêu cầu chỉnh sửa thêm hoặc mở khiếu nại nếu dịch vụ không đúng cam kết.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => handleOpenBooking(DEMO_PACKAGES[1])}
              className="h-12 px-6 bg-brand text-white hover:opacity-90 rounded-2xl font-bold text-sm shadow-xl flex-shrink-0"
            >
              Mở Modal Đặt Lịch Ngay
            </Button>
            <Link href="/photographers">
              <Button className="h-12 px-6 bg-white text-slate-950 hover:bg-slate-100 rounded-2xl font-bold text-sm shadow-xl flex-shrink-0">
                Xem danh sách thợ ảnh
              </Button>
            </Link>
          </div>
        </div>

      </div>

      {/* CP3 Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialPackage={selectedBookingPkg}
      />
    </div>
  )
}
