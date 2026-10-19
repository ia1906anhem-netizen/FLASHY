'use client'

import { useState, useEffect } from 'react'
import {
  Award,
  Star,
  Sparkles,
  Trophy,
  CheckCircle2,
  Gift,
  TrendingUp,
  Percent,
  Clock,
  Target
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getStoredBookings, PersistentBooking } from '@/lib/data/booking-store'

export default function PhotographerAchievementsPage() {
  const [bookings, setBookings] = useState<PersistentBooking[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const loadData = () => {
    const list = getStoredBookings()
    setBookings(list)
    setIsLoaded(true)
  }

  useEffect(() => {
    loadData()
    const handleUpdate = () => loadData()
    window.addEventListener('flashy_bookings_updated', handleUpdate)
    return () => window.removeEventListener('flashy_bookings_updated', handleUpdate)
  }, [])

  // Calculate real performance metrics from database/persistent store
  const completedBookings = bookings.filter((b) => ['ACCEPTED', 'COMPLETED'].includes(b.status))
  const completedCount = completedBookings.length

  const reviewedBookings = bookings.filter(
    (b) => b.review && typeof b.review.rating === 'number' && b.review.rating > 0
  )
  const totalReviews = reviewedBookings.length
  const avgRating =
    totalReviews > 0
      ? reviewedBookings.reduce((sum, b) => sum + (b.review?.rating || 0), 0) / totalReviews
      : 0
  const fiveStarCount = reviewedBookings.filter((b) => (b.review?.rating || 0) >= 5).length

  // Star of the Quarter criteria: >= 30 completed bookings & rating >= 4.8
  const isStarQ1 = completedCount >= 30 && avgRating >= 4.8
  const starQ1ProgressPct = Math.min(100, Math.round((completedCount / 30) * 100))

  const achievements = [
    {
      id: 'star-q1',
      title: 'Star of the Quarter (Quý 1/2026)',
      desc: 'Đạt từ 30 đơn trở lên & Rating ≥ 4.8. Thưởng: 10 đơn tiếp theo miễn 100% phí hoa hồng!',
      icon: Award,
      earned: isStarQ1,
      progressText: `${completedCount} / 30 đơn (${starQ1ProgressPct}%)`,
      progressPct: starQ1ProgressPct,
      reward: '10 đơn 0% hoa hồng',
    },
    {
      id: 'fast-delivery',
      title: 'Thợ Bàn Giao Siêu Tốc',
      desc: 'Bàn giao 10 đơn liên tiếp trong vòng 24 giờ sau buổi chụp.',
      icon: Sparkles,
      earned: completedCount >= 10,
      progressText: `${Math.min(10, completedCount)} / 10 đơn (${Math.min(100, Math.round((completedCount / 10) * 100))}%)`,
      progressPct: Math.min(100, Math.round((completedCount / 10) * 100)),
      reward: 'Huy hiệu hồ sơ',
    },
    {
      id: 'top-rated',
      title: 'Top Rated Photographer',
      desc: 'Đạt trên 100 lượt đánh giá 5 sao từ khách hàng thực tế.',
      icon: Star,
      earned: fiveStarCount >= 100,
      progressText: `${fiveStarCount} / 100 đánh giá 5★ (${Math.min(100, Math.round((fiveStarCount / 100) * 100))}%)`,
      progressPct: Math.min(100, Math.round((fiveStarCount / 100) * 100)),
      reward: 'Gắn nhãn uy tín',
    },
    {
      id: 'legend-century',
      title: 'Huyền Thoại 100 Buổi Chụp',
      desc: 'Hoàn thành 100 buổi chụp thành công trên FLASHY.',
      icon: Trophy,
      earned: completedCount >= 100,
      progressText: `${completedCount} / 100 đơn (${Math.min(100, Math.round((completedCount / 100) * 100))}%)`,
      progressPct: Math.min(100, Math.round((completedCount / 100) * 100)),
      reward: 'Gói tài trợ hiển thị',
    },
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

      {/* Star of the Quarter Featured Banner (Dynamic State) */}
      {isStarQ1 ? (
        <Card className="rounded-3xl border-amber-300 bg-gradient-to-r from-violet-950 via-indigo-900 to-slate-900 text-white p-6 md:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/40 inline-flex items-center gap-1 mb-2">
                <Trophy className="w-3.5 h-3.5" />
                Danh hiệu danh giá Quý 1/2026
              </span>
              <h2 className="text-2xl font-black mb-1">
                Bạn Đang Là &quot;Star of the Quarter&quot; 🌟
              </h2>
              <p className="text-xs text-violet-200 max-w-lg leading-relaxed">
                Bạn đã hoàn thành xuất sắc <strong>{completedCount} đơn</strong> (yêu cầu tối thiểu 30) với điểm số{' '}
                <strong>{avgRating.toFixed(2)} ⭐</strong>.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[200px]">
              <p className="text-[11px] text-amber-300 font-bold uppercase">Phần thưởng đang kích hoạt</p>
              <p className="text-2xl font-black text-white mt-1">10 Đơn Chụp</p>
              <p className="text-[11px] text-emerald-400 font-bold mt-0.5">0% Phí Hoa Hồng</p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="rounded-3xl border-slate-700 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-white/10 px-3 py-1 rounded-full border border-white/15 inline-flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-violet-400" />
                Chưa kích hoạt danh hiệu quý
              </span>
              <h2 className="text-xl md:text-2xl font-black text-white">
                Mục Tiêu Danh Hiệu &quot;Star of the Quarter&quot; (Quý 1/2026)
              </h2>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Hoàn thành các mốc đơn chụp để nhận ưu đãi hoa hồng. Đạt tối thiểu <strong>30 đơn hoàn tất</strong> và{' '}
                <strong>Rating ≥ 4.8</strong> để mở khóa phần thưởng <strong>10 đơn chụp 0% phí hoa hồng nền tảng</strong>.
              </p>

              <div className="pt-2 max-w-md">
                <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                  <span>Tiến trình hoàn thành:</span>
                  <span className="font-bold font-mono text-violet-300">
                    {completedCount}/30 đơn ({starQ1ProgressPct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                  <div
                    className="bg-violet-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${starQ1ProgressPct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[200px] flex-shrink-0">
              <p className="text-[11px] text-slate-400 font-bold uppercase">Phần thưởng sắp tới</p>
              <p className="text-xl font-black text-white mt-1">10 Đơn Chụp</p>
              <p className="text-[11px] text-violet-300 font-bold mt-0.5">0% Phí Hoa Hồng</p>
              <p className="text-[10px] text-slate-400 mt-2 border-t border-white/10 pt-2">
                {completedCount === 0
                  ? 'Cần 30 đơn để mở khóa'
                  : `Cần thêm ${Math.max(0, 30 - completedCount)} đơn để mở khóa`}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Real-time Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Đơn hoàn thành</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{completedCount} đơn</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Đánh giá trung bình</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {totalReviews > 0 ? `${avgRating.toFixed(2)} ⭐` : 'Chưa có'}
          </span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Lượt 5 sao</span>
          <span className="text-xl font-black text-amber-600 mt-1 block">{fiveStarCount} lượt</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Huy hiệu đạt được</span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">
            {achievements.filter((a) => a.earned).length} / {achievements.length}
          </span>
        </div>
      </div>

      {/* Achievements Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {achievements.map((ach) => {
          const Icon = ach.icon
          return (
            <Card
              key={ach.id}
              className={`rounded-3xl border p-6 transition-all ${
                ach.earned
                  ? 'border-amber-300 bg-white shadow-sm ring-1 ring-amber-200/50'
                  : 'border-slate-200 bg-slate-50/60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    ach.earned
                      ? 'bg-amber-100 text-amber-700 shadow-sm'
                      : 'bg-slate-200/80 text-slate-400'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{ach.title}</h3>
                    {ach.earned ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex-shrink-0">
                        ✓ Đã đạt
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-200/70 border border-slate-200 px-2 py-0.5 rounded-full flex-shrink-0">
                        Chưa đạt
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{ach.desc}</p>

                  {/* Progress Indicator */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500">Tiến trình:</span>
                      <span
                        className={`font-mono font-bold ${
                          ach.earned ? 'text-emerald-700' : 'text-violet-700'
                        }`}
                      >
                        {ach.progressText}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          ach.earned ? 'bg-emerald-500' : 'bg-violet-600'
                        }`}
                        style={{ width: `${ach.progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-amber-800 font-bold">
                    <Gift className="w-3.5 h-3.5 text-amber-600" />
                    <span>Phần thưởng: {ach.reward}</span>
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
