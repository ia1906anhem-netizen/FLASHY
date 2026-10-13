'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Coins,
  Award,
  Sparkles,
  Ticket,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Camera
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getStoredBookings } from '@/lib/data/booking-store'

export default function LoyaltyPage() {
  const [currentCoins, setCurrentCoins] = useState<number>(0)
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    const coins = Number(localStorage.getItem('flashy_user_coins') || '0')
    setCurrentCoins(coins)

    // Build ledger from completed bookings
    const bookings = getStoredBookings()
    const completed = bookings.filter((b) => ['ACCEPTED', 'COMPLETED'].includes(b.status))
    const ledger = completed.map((b) => ({
      id: `tx-${b.id}`,
      type: 'EARNED',
      title: `Tích lũy từ đơn chụp #${b.booking_number} (${b.package_name})`,
      amount: `+${b.coins_earned || 50} Xu`,
      date: new Date(b.completed_at || b.updated_at).toLocaleDateString('vi-VN'),
      reason: '2% giá trị đơn hoàn tất',
    }))

    setTransactions(ledger)
  }, [])

  const currentTier = currentCoins >= 500 ? 'Icon' : currentCoins >= 200 ? 'Creator' : 'Rookie'
  const progressPercent = Math.min(100, Math.round((currentCoins / 500) * 100))

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Flashy Coins & Khách Hàng Thân Thiết
              </h1>
              <Badge className="bg-amber-100 text-amber-800 border-amber-300">Hoàn 2% Mỗi Đơn</Badge>
            </div>
            <p className="text-xs text-slate-500">
              Tích lũy xu sau mỗi đơn hoàn thành để đổi voucher giảm giá và nâng hạng thành viên
            </p>
          </div>

          <Link href="/customer/vouchers">
            <Button className="bg-brand text-white hover:opacity-90 rounded-xl text-xs font-bold h-10 shadow-md">
              <Ticket className="w-3.5 h-3.5 mr-1.5" />
              Đổi Voucher Ưu Đãi
            </Button>
          </Link>
        </div>

        {/* Top Balance & Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Coins Balance Box */}
          <Card className="rounded-3xl border-amber-200 bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-orange-50/40 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Số Dư Khả Dụng
              </span>
              <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                <Coins className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl md:text-4xl font-black text-amber-900 mb-1">
              {currentCoins}{' '}
              <span className="text-sm font-bold text-amber-700">Xu (~{(currentCoins * 1000).toLocaleString('vi-VN')}đ)</span>
            </div>
            <p className="text-[11px] text-amber-800/80">Có thể dùng để đổi voucher giảm giá trực tiếp</p>
          </Card>

          {/* Current Tier Box */}
          <Card className="rounded-3xl border-violet-200 bg-gradient-to-br from-violet-500/10 via-violet-50/50 to-pink-50/40 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-violet-800 uppercase tracking-wider">
                Hạng Thành Viên
              </span>
              <div className="w-9 h-9 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-sm">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-violet-900 mb-1">{currentTier} Tier</div>
            <p className="text-[11px] text-violet-700/80">
              {currentTier === 'Icon'
                ? 'Đặc quyền Icon: Ưu tiên cao nhất'
                : currentTier === 'Creator'
                ? 'Đặc quyền Creator: Ưu tiên bàn giao'
                : 'Tích thêm xu để thăng hạng Creator'}
            </p>
          </Card>

          {/* How to Earn */}
          <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Công Thức Tích Xu
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Tự động hoàn 2% giá trị đơn</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sau khi buổi chụp kết thúc và khách hàng duyệt ảnh, hệ thống tự động cộng xu vào ví của bạn.
              </p>
            </div>
            <Link href="/photographers" className="text-xs font-bold text-violet-600 hover:underline flex items-center gap-1 pt-3">
              Đặt lịch để tích xu ngay
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        </div>

        {/* Membership Tier Roadmap */}
        <Card className="rounded-3xl border-slate-200 bg-white p-6 md:p-8 shadow-sm mb-8">
          <h3 className="text-base font-bold text-slate-900 mb-4">Các Hạng Thành Viên FLASHY</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div
              className={`p-4 rounded-2xl border ${
                currentTier === 'Rookie' ? 'border-2 border-violet-600 bg-violet-50/50' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <h4 className="font-bold text-slate-900 text-sm mb-1">Rookie (0 - 199 Xu)</h4>
              <p className="text-xs text-slate-500">Tích 2% xu mỗi đơn chụp, nhận mã ưu đãi chào mừng 10%.</p>
            </div>
            <div
              className={`p-4 rounded-2xl border ${
                currentTier === 'Creator' ? 'border-2 border-violet-600 bg-violet-50/50' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <h4 className="font-bold text-violet-900 text-sm mb-1">Creator (200 - 499 Xu)</h4>
              <p className="text-xs text-slate-600">Ưu tiên bàn giao ảnh sớm 24h, tặng 1 voucher giảm 50k mỗi quý.</p>
            </div>
            <div
              className={`p-4 rounded-2xl border ${
                currentTier === 'Icon' ? 'border-2 border-violet-600 bg-violet-50/50' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <h4 className="font-bold text-slate-900 text-sm mb-1">Icon (500+ Xu)</h4>
              <p className="text-xs text-slate-500">Miễn phí dịch vụ làm tóc/makeup 1 lần/năm, hỗ trợ thợ VIP riêng biệt.</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-600 font-bold mb-1.5">
              <span>Tiến độ lên hạng Icon:</span>
              <span>
                {currentCoins} / 500 Xu ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-brand h-full rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </Card>

        {/* Transaction History Ledger */}
        <Card className="rounded-3xl border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Lịch Sử Biến Động Số Dư (Ledger)</h3>

          {transactions.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400 space-y-2">
              <Coins className="w-8 h-8 text-slate-300 mx-auto mb-1" />
              <p className="font-bold text-slate-600">Chưa có giao dịch xu nào</p>
              <p className="text-slate-400 max-w-sm mx-auto">
                Khi bạn hoàn tất buổi chụp và duyệt ảnh, xu thưởng 2% sẽ được ghi nhận vào sổ cái này!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {transactions.map((tx) => (
                <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        tx.type === 'EARNED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {tx.type === 'EARNED' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{tx.title}</h4>
                      <p className="text-[11px] text-slate-400">
                        {tx.date} • {tx.reason}
                      </p>
                    </div>
                  </div>

                  <div className={`font-black text-sm ${tx.type === 'EARNED' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
