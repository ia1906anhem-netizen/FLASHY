'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Search,
  CalendarCheck,
  Camera,
  ShieldCheck,
  CloudDownload,
  Coins,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  UserCheck,
  BadgeDollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function HowItWorksPage() {
  const [roleTab, setRoleTab] = useState<'customer' | 'photographer'>('customer')

  const customerSteps = [
    {
      step: '01',
      title: 'Khám Phá & Chọn Thợ',
      desc: 'Tìm kiếm thợ chụp theo khu vực, phong cách (Street, Retro, Concept) và xem portfolio, đánh giá sao minh bạch từ khách hàng trước.',
      icon: Search,
      badge: 'Bán kính GPS'
    },
    {
      step: '02',
      title: 'Đặt Lịch & Cọc An Toàn (Escrow)',
      desc: 'Chọn gói chụp (FLASHY EXPRESS t\u1eeb 350.000\u0111), chọn khung giờ và thanh toán cọc an toàn. FLASHY giữ tiền trung gian để bảo vệ quyền lợi của bạn.',
      icon: ShieldCheck,
      badge: 'Bảo vệ thanh toán'
    },
    {
      step: '03',
      title: 'Tận Hưởng Buổi Chụp & Nhận Ảnh Đám Mây',
      desc: 'Gặp gỡ nhiếp ảnh gia tại điểm hẹn. Sau buổi chụp, nhận toàn bộ file gốc và ảnh chỉnh màu trực tiếp trên nền tảng đám mây FLASHY.',
      icon: CloudDownload,
      badge: 'Đám mây riêng tư'
    },
    {
      step: '04',
      title: 'Duyệt Ảnh 48 Giờ & Tích Lũy Điểm Thưởng',
      desc: 'Bạn có 48 giờ để xem ảnh xem trước có watermark, chọn ảnh retouch chuyên sâu hoặc mở khiếu nại nếu chưa ưng ý. Hoàn tất nhận Flashy Coins!',
      icon: Coins,
      badge: 'Cửa sổ 48 giờ'
    }
  ]

  const photographerSteps = [
    {
      step: '01',
      title: 'Đăng Ký & Xác Minh Danh Tính (KYC)',
      desc: 'Tạo tài khoản nhiếp ảnh gia, tải lên portfolio nổi bật và gửi hồ sơ xác minh danh tính để xây dựng lòng tin với khách hàng.',
      icon: UserCheck,
      badge: 'Huy hiệu Verified'
    },
    {
      step: '02',
      title: 'Cài Đặt Lịch & Bảng Giá Dịch Vụ',
      desc: 'Tùy chỉnh các gói chụp FLASHY EXPRESS, FLASHY CASUAL, FLASHY CASUAL hoặc tạo gói riêng. Bật chế độ "Sẵn sàng" để nhận đơn chụp ngay lập tức.',
      icon: CalendarCheck,
      badge: 'Linh hoạt thời gian'
    },
    {
      step: '03',
      title: 'Nhận Đơn & Thực Hiện Buổi Chụp',
      desc: 'Nhận thông báo khi khách đặt lịch, xác nhận hẹn và đến điểm chụp đúng giờ. Sử dụng ứng dụng để check-in và bắt đầu buổi chụp.',
      icon: Camera,
      badge: 'Chat trực tiếp'
    },
    {
      step: '04',
      title: 'Tải Ảnh Bàn Giao & Nhận Thanh Toán',
      desc: 'Tải ảnh gốc và ảnh chỉnh sửa lên hệ thống. Sau khi khách duyệt hoặc sau 48h không khiếu nại, tiền được giải ngân về tài khoản ngân hàng của bạn.',
      icon: BadgeDollarSign,
      badge: 'Thù lao 85% + 100% Add-on'
    }
  ]

  const currentSteps = roleTab === 'customer' ? customerSteps : photographerSteps

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="verified" className="mb-3 px-3 py-1 text-xs">
            Quy trình minh bạch & Tiện lợi
          </Badge>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Cách FLASHY Hoạt Động
          </h1>
          <p className="text-base text-slate-600 leading-relaxed mb-8">
            Nền tảng kết nối nhiếp ảnh đầu tiên tại Việt Nam với cơ chế bảo vệ kép: Khách an tâm nhận ảnh đẹp, Thợ chắc chắn nhận đủ tiền.
          </p>

          {/* Role Switcher */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/80 shadow-inner">
            <button
              onClick={() => setRoleTab('customer')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                roleTab === 'customer'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dành cho Khách Hàng 📸
            </button>
            <button
              onClick={() => setRoleTab('photographer')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                roleTab === 'photographer'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dành cho Nhiếp Ảnh Gia 💼
            </button>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {currentSteps.map((s, idx) => {
            const Icon = s.icon
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="flex"
              >
                <Card className="rounded-3xl border border-slate-200 bg-white p-6 flex flex-col justify-between hover:shadow-xl hover:border-violet-300 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50 rounded-bl-full -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-300 pointer-events-none" />
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center shadow-sm">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-3xl font-black text-slate-200 group-hover:text-violet-300 transition-colors">
                        {s.step}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-2.5 py-0.5 rounded-full inline-block mb-2">
                      {s.badge}
                    </span>

                    <h3 className="text-lg font-black text-slate-900 mb-2 leading-snug">
                      {s.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {s.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Bước {s.step} hoàn tất tự động
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* The 48-Hour Escrow Explained Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-bold text-violet-600 uppercase tracking-wider bg-violet-50 px-3 py-1 rounded-full">
                Bảo vệ tài chính & Quyền lợi
              </span>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 mt-3 mb-4">
                Cơ Chế Ký Quỹ Escrow 48 Giờ Hoạt Động Như Thế Nào?
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Để giải quyết tình trạng khách sợ chuyển cọc bị mất tiền, còn thợ sợ chụp xong bị bùng công, FLASHY đóng vai trò trọng tài trung gian độc lập.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mt-0.5 flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Tiền cọc được khóa an toàn</h4>
                    <p className="text-xs text-slate-500">Khách thanh toán qua cổng điện tử, số tiền nằm trong tài khoản ký quỹ được giám sát.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs mt-0.5 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Đồng hồ 48 giờ bắt đầu sau khi giao ảnh</h4>
                    <p className="text-xs text-slate-500">Chỉ sau khi thợ tải đủ file ảnh lên hệ thống, thời gian 48 giờ kiểm duyệt của khách mới bắt đầu tính.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs mt-0.5 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Khách duyệt ảnh hoặc mở khiếu nại</h4>
                    <p className="text-xs text-slate-500">Nếu ảnh đạt yêu cầu, khách bấm Duyệt. Nếu có sự cố (thợ đến trễ, thiếu file), khiếu nại sẽ lập tức đóng băng giải ngân để Admin hỗ trợ.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Escrow Diagram */}
            <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white">
              <div className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-4 flex items-center justify-between">
                <span>Dòng Chuyển Tiền Escrow</span>
                <span className="text-emerald-400">● Tự động hóa</span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold">KH</div>
                    <div>
                      <p className="font-bold text-white">Khách hàng đặt cọc</p>
                      <p className="text-slate-400 text-[10px]">Ví MoMo / ZaloPay / Ngân hàng</p>
                    </div>
                  </div>
                  <span className="font-black text-emerald-400">100% Cọc</span>
                </div>

                <div className="flex justify-center">
                  <span className="text-slate-500 text-xs font-bold">↓ Khóa trong Escrow</span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-900/60 to-purple-900/60 border border-violet-500/40 text-center">
                  <ShieldCheck className="w-6 h-6 text-violet-400 mx-auto mb-1" />
                  <p className="font-black text-white text-sm">Ký Quỹ FLASHY Giữ Tiền</p>
                  <p className="text-violet-200 text-[11px] mt-0.5">Thời gian kiểm tra: 48 Giờ</p>
                </div>

                <div className="flex justify-center">
                  <span className="text-slate-500 text-xs font-bold">↓ Sau khi khách duyệt ảnh</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold">THỢ</div>
                    <div>
                      <p className="font-bold text-white">Nhiếp ảnh gia nhận thù lao</p>
                      <p className="text-slate-400 text-[10px]">Chuyển khoản trực tiếp vào tài khoản</p>
                    </div>
                  </div>
                  <span className="font-black text-emerald-400">Giải ngân</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="text-center">
          {roleTab === 'customer' ? (
            <Link href="/photographers">
              <Button className="h-13 px-8 bg-brand hover:opacity-90 rounded-2xl font-bold text-base shadow-xl">
                Khám phá thợ chụp ngay
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <Link href="/become-photographer">
              <Button className="h-13 px-8 bg-brand hover:opacity-90 rounded-2xl font-bold text-base shadow-xl">
                Đăng ký trở thành thợ chụp FLASHY
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>

      </div>
    </div>
  )
}
