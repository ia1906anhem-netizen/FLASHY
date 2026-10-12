'use client'

import { useState } from 'react'
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
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function LoyaltyPage() {
  const currentCoins = 280
  const lifetimeCoins = 420
  const currentTier = 'Creator'

  const transactions = [
    {
      id: 'tx-1',
      type: 'EARNED',
      title: 'Tích lũy từ đơn chụp #BK-651209 (Gói Outdoor)',
      amount: '+110 Xu',
      date: '21/03/2026 15:30',
      reason: '2% giá trị đơn hoàn tất',
    },
    {
      id: 'tx-2',
      type: 'REDEEMED',
      title: 'Đổi Voucher Giảm 50k (COIN50K)',
      amount: '-150 Xu',
      date: '10/03/2026 09:15',
      reason: 'Đổi ưu đãi giảm giá',
    },
    {
      id: 'tx-3',
      type: 'EARNED',
      title: 'Tích lũy từ đơn chụp #BK-521094 (Gói Vibe Sài Gòn)',
      amount: '+90 Xu',
      date: '15/02/2026 18:00',
      reason: '2% giá trị đơn hoàn tất',
    },
    {
      id: 'tx-4',
      type: 'EARNED',
      title: 'Thưởng chào mừng thành viên mới',
      amount: '+50 Xu',
      date: '10/01/2026 10:00',
      reason: 'Thành viên mới FLASHY',
    }
  ]

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
              <Badge variant="warning">Hạng Creator</Badge>
            </div>
            <p className="text-xs text-slate-500">
              Tích lũy 2% mỗi đơn hoàn tất • Đổi voucher chụp ảnh và đối tác ẩm thực
            </p>
          </div>

          <Link href="/customer/vouchers">
            <Button className="bg-brand text-white rounded-xl font-bold text-xs h-10 shadow-md">
              <Ticket className="w-3.5 h-3.5 mr-1.5" />
              Đổi Voucher Ưu Đãi
            </Button>
          </Link>
        </div>

        {/* Top 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số dư khả dụng</span>
            </div>
            <div className="text-3xl font-black text-amber-600 mb-1">{currentCoins} Xu</div>
            <p className="text-[11px] text-slate-400">Tương đương 280.000đ giá trị quy đổi ưu đãi</p>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hạng hội viên</span>
            </div>
            <div className="text-3xl font-black text-violet-700 mb-1">{currentTier}</div>
            <p className="text-[11px] text-slate-400">Được hưởng quyền lợi ưu tiên chỉnh sửa ảnh</p>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng xu trọn đời</span>
            </div>
            <div className="text-3xl font-black text-emerald-600 mb-1">{lifetimeCoins} Xu</div>
            <p className="text-[11px] text-slate-400">Đã tích lũy qua 3 đơn chụp thành công</p>
          </Card>
        </div>

        {/* Membership Tier Road map */}
        <Card className="rounded-3xl border-slate-200 bg-white p-6 md:p-8 shadow-sm mb-8">
          <h3 className="text-base font-bold text-slate-900 mb-4">Các Hạng Thành Viên FLASHY</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
              <h4 className="font-bold text-slate-900 text-sm mb-1">Rookie (0 - 199 Xu)</h4>
              <p className="text-xs text-slate-500">Tích 2% xu mỗi đơn chụp, nhận mã ưu đãi chào mừng 10%.</p>
            </div>
            <div className="p-4 rounded-2xl border-2 border-violet-600 bg-violet-50/50 relative shadow-sm">
              <div className="absolute top-2 right-2 text-[10px] font-bold text-violet-700 bg-white px-2 py-0.5 rounded-full border border-violet-200">
                Hạng hiện tại
              </div>
              <h4 className="font-bold text-violet-900 text-sm mb-1">Creator (200 - 499 Xu)</h4>
              <p className="text-xs text-slate-600">Ưu tiên bàn giao ảnh sớm 24h, tặng 1 voucher giảm 50k mỗi quý.</p>
            </div>
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
              <h4 className="font-bold text-slate-900 text-sm mb-1">Icon (500+ Xu)</h4>
              <p className="text-xs text-slate-500">Miễn phí dịch vụ làm tóc/makeup 1 lần/năm, hỗ trợ thợ VIP riêng biệt.</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-600 font-bold mb-1.5">
              <span>Tiến độ lên hạng Icon:</span>
              <span>280 / 500 Xu (56%)</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-brand h-full rounded-full" style={{ width: '56%' }} />
            </div>
          </div>
        </Card>

        {/* Transaction History Ledger (Section 9.1 requirement) */}
        <Card className="rounded-3xl border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Lịch Sử Biến Động Số Dư (Ledger)</h3>

          <div className="divide-y divide-slate-100 text-xs">
            {transactions.map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    tx.type === 'EARNED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {tx.type === 'EARNED' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{tx.title}</h4>
                    <p className="text-[11px] text-slate-400">{tx.date} • {tx.reason}</p>
                  </div>
                </div>

                <div className={`font-black text-sm ${
                  tx.type === 'EARNED' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {tx.amount}
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  )
}
