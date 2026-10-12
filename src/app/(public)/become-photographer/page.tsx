'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Camera,
  Coins,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  Award
} from 'lucide-react'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function BecomePhotographerPage() {
  const [shootsPerWeek, setShootsPerWeek] = useState<number>(5)
  const [avgPackagePrice, setAvgPackagePrice] = useState<number>(350000)

  const monthlyGross = shootsPerWeek * avgPackagePrice * 4
  const estimatedNet = Math.round(monthlyGross * 0.94) // assuming avg 6% fee

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="verified" className="mb-3 px-3 py-1 text-xs">
            Dành cho Freelance Photographers & Sinh viên Nhiếp ảnh
          </Badge>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Biến Đam Mê Bấm Máy Thành Thu Nhập Ổn Định
          </h1>
          <p className="text-base text-slate-600 leading-relaxed mb-8">
            Gia nhập cộng đồng FLASHY để tiếp cận hàng nghìn khách hàng trẻ, tự do sắp xếp lịch chụp và được bảo đảm thanh toán 100%.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register?role=photographer">
              <Button className="h-12 px-8 bg-brand hover:opacity-90 rounded-2xl font-bold text-sm shadow-xl shadow-violet-500/20">
                Đăng ký làm thợ chụp ngay
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold text-sm border-slate-300">
                Xem quy trình hoạt động
              </Button>
            </Link>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center mb-4">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">0% Hoa Hồng 3 Đơn Đầu</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mọi nhiếp ảnh gia mới gia nhập đều được giữ trọn vẹn 100% doanh thu trong 3 đơn hàng đầu tiên để làm quen với hệ sinh thái FLASHY.
            </p>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Chống Bùng Kèo 100%</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Khách hàng bắt buộc phải cọc tiền trước vào tài khoản Escrow. Nếu khách hủy muộn hoặc không đến, tiền cọc sẽ được bồi thường cho bạn theo chính sách.
            </p>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Chủ Động Toàn Diện</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn tự quyết định bảng giá, tự chọn khu vực hoạt động trong bán kính mong muốn và bật tắt trạng thái nhận lịch bất cứ lúc nào.
            </p>
          </Card>
        </div>

        {/* Interactive Earnings Calculator */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm mb-16">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold text-violet-600 uppercase tracking-wider bg-violet-50 px-3 py-1 rounded-full">
              Ước tính thu nhập
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-3">
              Tính Toán Thu Nhập Tiềm Năng Hàng Tháng
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ước tính dựa trên số buổi chụp dự kiến và mức giá trung bình gói dịch vụ bạn cung cấp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-sm font-bold text-slate-900 mb-2">
                  <span>Số buổi chụp mỗi tuần:</span>
                  <span className="text-violet-600 font-black text-base">{shootsPerWeek} buổi</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={shootsPerWeek}
                  onChange={(e) => setShootsPerWeek(Number(e.target.value))}
                  className="w-full accent-violet-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>1 buổi/tuần (Bán thời gian)</span>
                  <span>20 buổi/tuần (Toàn thời gian)</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm font-bold text-slate-900 mb-2">
                  <span>Giá trung bình mỗi gói:</span>
                  <span className="text-violet-600 font-black text-base">{formatVND(avgPackagePrice)}</span>
                </div>
                <input
                  type="range"
                  min="89000"
                  max="1200000"
                  step="50000"
                  value={avgPackagePrice}
                  onChange={(e) => setAvgPackagePrice(Number(e.target.value))}
                  className="w-full accent-violet-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Flash Shot (89k)</span>
                  <span>Outdoor Ngoại cảnh (1.2tr)</span>
                </div>
              </div>
            </div>

            {/* Income Card Result */}
            <div className="bg-gradient-to-br from-violet-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl">
              <p className="text-xs text-violet-200 font-semibold uppercase tracking-wider mb-1">
                Thu nhập thực nhận ước tính
              </p>
              <div className="text-4xl md:text-5xl font-black text-white mb-2">
                {formatVND(estimatedNet)}
                <span className="text-base text-violet-300 font-normal"> / tháng</span>
              </div>
              <p className="text-xs text-violet-200 mb-6 leading-relaxed">
                Sau khi trừ phí nền tảng FLASHY (chỉ từ 5-9%). Trong 3 đơn hàng đầu tiên, bạn nhận trọn vẹn 100%!
              </p>

              <Link href="/register?role=photographer">
                <Button className="w-full h-12 bg-white text-slate-950 hover:bg-slate-100 rounded-xl font-bold text-sm">
                  Đăng ký nhận lịch chụp
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Steps to Start */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
            4 Bước Đơn Giản Để Bắt Đầu
          </h2>
          <p className="text-xs text-slate-500">
            Quy trình xét duyệt nhanh chóng trong vòng 24 giờ làm việc
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[
            { num: '1', title: 'Đăng Ký Tài Khoản', desc: 'Nhập thông tin cơ bản và tạo hồ sơ nhiếp ảnh' },
            { num: '2', title: 'Tải Lên Portfolio', desc: 'Chọn những bức ảnh đẹp nhất để thu hút khách' },
            { num: '3', title: 'Xác Minh KYC', desc: 'Gửi giấy tờ tùy thân để nhận huy hiệu Verified' },
            { num: '4', title: 'Nhận Đơn & Đi Chụp', desc: 'Bật trạng thái sẵn sàng để nhận thông báo đơn mới' },
          ].map((item) => (
            <div key={item.num} className="p-5 rounded-2xl bg-white border border-slate-200 text-center">
              <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 font-black text-sm flex items-center justify-center mx-auto mb-3">
                {item.num}
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h4>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
