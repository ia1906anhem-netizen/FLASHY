'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Award,
  Star,
  Sparkles,
  Trophy,
  CheckCircle2,
  Gift,
  TrendingUp,
  Percent
} from 'lucide-react'
import { DEMO_PHOTOGRAPHERS } from '@/lib/data/mock-data'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PhotographerAchievementsPage() {
  const achievements = [
    {
      id: 'star-q1',
      title: 'Star of the Quarter (Quý 1/2026)',
      desc: 'Đạt từ 30 đơn trở lên & Rating >= 4.8. Thưởng: 10 đơn tiếp theo miễn 100% phí hoa hồng!',
      icon: Award,
      earned: true,
      reward: '10 đơn 0% hoa hồng',
    },
    {
      id: 'fast-delivery',
      title: 'Thợ Bàn Giao Siêu Tốc',
      desc: 'Bàn giao 10 đơn liên tiếp trong vòng 24 giờ sau buổi chụp.',
      icon: Sparkles,
      earned: true,
      reward: 'Huy hiệu hồ sơ',
    },
    {
      id: 'top-rated',
      title: 'Top Rated Photographer',
      desc: 'Đạt trên 100 lượt đánh giá 5 sao từ khách hàng thực tế.',
      icon: Star,
      earned: true,
      reward: 'Gắn nhãn uy tín',
    },
    {
      id: 'legend-century',
      title: 'Huyền Thoại 100 Buổi Chụp',
      desc: 'Hoàn thành 100 buổi chụp thành công trên FLASHY.',
      icon: Trophy,
      earned: false,
      progress: '48 / 100 đơn (48%)',
      reward: 'Gói tài trợ hiển thị',
    }
  ]

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Huy Hiệu & Bảng Xếp Hạng Nhiếp Ảnh Gia
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Ghi nhận thành tích, thăng hạng studio và mở khóa các phần thưởng giảm phí hoa hồng
        </p>
      </div>

      {/* Star of the Quarter Featured Card */}
      <Card className="rounded-3xl border-violet-300 bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/40 inline-flex items-center gap-1 mb-2">
              <Trophy className="w-3.5 h-3.5" />
              Danh hiệu danh giá Quý 1/2026
            </span>
            <h2 className="text-2xl font-black mb-1">
              Bạn Đang Là "Star of the Quarter" 🌟
            </h2>
            <p className="text-xs text-violet-200 max-w-lg leading-relaxed">
              Bạn đã hoàn thành xuất sắc <strong>48 đơn</strong> (yêu cầu tối thiểu 30) với điểm số <strong>4.95 ⭐</strong>.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[200px]">
            <p className="text-[11px] text-amber-300 font-bold uppercase">Phần thưởng đang kích hoạt</p>
            <p className="text-2xl font-black text-white mt-1">10 Đơn Chụp</p>
            <p className="text-[11px] text-emerald-400 font-bold mt-0.5">0% Phí Hoa Hồng</p>
          </div>
        </div>
      </Card>

      {/* Achievements Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {achievements.map((ach) => {
          const Icon = ach.icon
          return (
            <Card key={ach.id} className={`rounded-3xl border p-6 transition-all ${
              ach.earned ? 'border-slate-200 bg-white shadow-sm' : 'border-slate-200 bg-slate-50 opacity-60'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  ach.earned ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">{ach.title}</h3>
                    {ach.earned && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        ✓ Đã đạt
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{ach.desc}</p>
                  
                  {ach.progress && (
                    <div className="mt-2 text-[11px] font-mono text-violet-700 font-bold">
                      Tiến độ: {ach.progress}
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-amber-700 font-bold">
                    <Gift className="w-3.5 h-3.5" />
                    Phần thưởng: {ach.reward}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

    </div>
  )
}
