'use client'

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
  PlusCircle
} from 'lucide-react'
import { DEMO_PACKAGES, DEMO_ADDONS } from '@/lib/data/mock-data'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PackagesPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="verified" className="mb-3 px-3 py-1 text-xs">
            Bảng giá minh bạch 100%
          </Badge>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Các Gói Dịch Vụ Chụp Ảnh FLASHY
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Từ những bức ảnh check-in nhanh dạo phố đến concept ngoại cảnh chuyên nghiệp. Giá niêm yết rõ ràng, không phát sinh chi phí ẩn.
          </p>
        </div>

        {/* 4 Standard Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {DEMO_PACKAGES.map((pkg, idx) => {
            const isPopular = pkg.slug === 'quick-date'
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="flex"
              >
                <Card className={`relative flex flex-col justify-between w-full rounded-3xl overflow-hidden transition-all duration-300 ${
                  isPopular
                    ? 'border-2 border-violet-600 shadow-xl bg-white ring-4 ring-violet-50'
                    : 'border border-slate-200 bg-white hover:border-violet-300 hover:shadow-lg'
                }`}>
                  {isPopular && (
                    <div className="absolute top-0 right-0 bg-brand text-white font-bold text-[11px] px-3 py-1 rounded-bl-xl shadow-sm">
                      Phổ biến nhất 🔥
                    </div>
                  )}

                  <CardContent className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="mb-4">
                        <span className="text-[11px] font-bold text-violet-600 uppercase tracking-wider bg-violet-50 px-2.5 py-1 rounded-md">
                          Gói {idx + 1}
                        </span>
                        <h3 className="text-2xl font-black text-slate-900 mt-2">{pkg.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{pkg.description}</p>
                      </div>

                      <div className="mb-6 pb-6 border-b border-slate-100">
                        <div className="text-3xl font-black text-violet-700">
                          {formatVND(pkg.base_price)}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">Khởi điểm từ ({pkg.duration_minutes} phút)</p>
                      </div>

                      {/* Package Features List */}
                      <ul className="space-y-3 text-xs text-slate-700 mb-6">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>Thời lượng: <strong>{pkg.duration_minutes} phút</strong></span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>File gốc: <strong>{pkg.original_photos}+ file</strong></span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>Ảnh chỉnh màu: <strong>{pkg.edited_photos} ảnh</strong></span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>Retouch chuyên sâu: <strong>{pkg.retouch_quota || 0} ảnh</strong></span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>Giao file sau: <strong>{pkg.delivery_days} ngày</strong></span>
                        </li>
                      </ul>
                    </div>

                    <Link href={`/photographers?category=${pkg.category}`} className="block w-full">
                      <Button className={`w-full rounded-xl font-bold text-xs h-11 ${
                        isPopular ? 'bg-brand hover:opacity-90' : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}>
                        Tìm thợ nhận gói này
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
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

        {/* Comparison Table */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-16 overflow-x-auto">
          <h2 className="text-2xl font-black text-slate-900 mb-6">So Sánh Chi Tiết Quyền Lợi Gói</h2>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-bold">Tiêu chí</th>
                <th className="pb-3 font-bold">Flash Shot</th>
                <th className="pb-3 font-bold text-violet-600">Quick Date</th>
                <th className="pb-3 font-bold">Vibe Sài Gòn</th>
                <th className="pb-3 font-bold">Outdoor / Dã ngoại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3.5 font-semibold text-slate-900">Mức giá tham khảo</td>
                <td className="py-3.5 font-bold text-violet-600">79.000đ - 99.000đ</td>
                <td className="py-3.5 font-bold text-violet-600">150.000đ - 300.000đ</td>
                <td className="py-3.5 font-bold text-violet-600">400.000đ - 700.000đ</td>
                <td className="py-3.5 font-bold text-violet-600">800.000đ - 1.500.000đ</td>
              </tr>
              <tr>
                <td className="py-3.5 font-semibold text-slate-900">Thời lượng chụp</td>
                <td className="py-3.5">15 - 20 phút</td>
                <td className="py-3.5">30 - 60 phút</td>
                <td className="py-3.5">2 - 3 tiếng</td>
                <td className="py-3.5">Nửa ngày (4 tiếng)</td>
              </tr>
              <tr>
                <td className="py-3.5 font-semibold text-slate-900">Địa điểm di chuyển</td>
                <td className="py-3.5">1 điểm cố định</td>
                <td className="py-3.5">1 - 2 điểm gần nhau (&lt;3km)</td>
                <td className="py-3.5">2 - 3 điểm nội thành</td>
                <td className="py-3.5">Theo lộ trình thỏa thuận</td>
              </tr>
              <tr>
                <td className="py-3.5 font-semibold text-slate-900">File ảnh gốc trả</td>
                <td className="py-3.5">Toàn bộ (~30 file)</td>
                <td className="py-3.5">Toàn bộ (~100 file)</td>
                <td className="py-3.5">Toàn bộ (~250 file)</td>
                <td className="py-3.5">Toàn bộ (~400 file)</td>
              </tr>
              <tr>
                <td className="py-3.5 font-semibold text-slate-900">Ảnh chỉnh màu nghệ thuật</td>
                <td className="py-3.5">3 - 5 ảnh</td>
                <td className="py-3.5">15 ảnh</td>
                <td className="py-3.5">40 ảnh</td>
                <td className="py-3.5">60 ảnh</td>
              </tr>
              <tr>
                <td className="py-3.5 font-semibold text-slate-900">Retouch chân dung chi tiết</td>
                <td className="py-3.5 text-slate-400">—</td>
                <td className="py-3.5 font-semibold text-emerald-600">5 ảnh</td>
                <td className="py-3.5 font-semibold text-emerald-600">10 ảnh</td>
                <td className="py-3.5 font-semibold text-emerald-600">20 ảnh</td>
              </tr>
              <tr>
                <td className="py-3.5 font-semibold text-slate-900">Hạn giao file đám mây</td>
                <td className="py-3.5">Trong 48 giờ</td>
                <td className="py-3.5">Trong 3 ngày</td>
                <td className="py-3.5">Trong 4 ngày</td>
                <td className="py-3.5">Trong 5 ngày</td>
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
          <Link href="/photographers">
            <Button className="h-12 px-8 bg-white text-slate-950 hover:bg-slate-100 rounded-2xl font-bold text-sm shadow-xl flex-shrink-0">
              Chọn thợ và đặt ngay
            </Button>
          </Link>
        </div>

      </div>
    </div>
  )
}
