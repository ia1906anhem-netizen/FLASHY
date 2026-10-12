'use client'

import { useState } from 'react'
import {
  Ticket,
  Coins,
  CheckCircle2,
  Copy,
  Clock,
  Sparkles,
  ShoppingBag,
  Coffee
} from 'lucide-react'
import { DEMO_VOUCHERS } from '@/lib/data/mock-data'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function VouchersPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [userCoins, setUserCoins] = useState<number>(280)
  const [redeemedCodes, setRedeemedCodes] = useState<string[]>(['FLASHYNEW'])

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleRedeem = (voucher: any) => {
    if (voucher.coin_cost && userCoins >= voucher.coin_cost) {
      setUserCoins(userCoins - voucher.coin_cost)
      setRedeemedCodes([...redeemedCodes, voucher.code])
      alert(`Đã đổi thành công mã ${voucher.code}! Mã đã được thêm vào kho voucher của bạn.`)
    } else {
      alert('Bạn không đủ số dư Flashy Coins để đổi voucher này!')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Kho Voucher & Đổi Xu Thưởng
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Đổi Flashy Coins lấy mã giảm giá chụp ảnh và quà tặng đối tác
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl flex items-center gap-2 self-start sm:self-auto">
            <Coins className="w-4 h-4 text-amber-600" />
            <span className="text-xs text-slate-700 font-medium">Xu của bạn:</span>
            <strong className="text-amber-700 text-sm">{userCoins} Xu</strong>
          </div>
        </div>

        {/* Voucher Store Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEMO_VOUCHERS.map((v) => {
            const isOwned = redeemedCodes.includes(v.code)
            return (
              <Card key={v.id} className="rounded-3xl border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col justify-between">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider bg-violet-50 px-2.5 py-0.5 rounded-full">
                      {v.type === 'PERCENTAGE' ? 'Giảm %' : 'Giảm tiền mặt'}
                    </span>
                    {v.partner && (
                      <Badge variant="outline" className="text-[10px]">{v.partner}</Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-slate-900 mb-1">
                    {v.type === 'PERCENTAGE' ? `Giảm ${v.discount_value}%` : `Giảm ${formatVND(v.discount_value)}`}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">{v.description}</p>

                  <div className="space-y-1.5 text-[11px] text-slate-500 py-3 border-y border-slate-100 mb-4">
                    {v.min_order_value && (
                      <p>• Đơn tối thiểu: <strong>{formatVND(v.min_order_value)}</strong></p>
                    )}
                    {v.max_discount && (
                      <p>• Giảm tối đa: <strong>{formatVND(v.max_discount)}</strong></p>
                    )}
                    <p className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      HSD: 31/12/2026
                    </p>
                  </div>

                  {/* Voucher code banner */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-dashed border-slate-300 flex items-center justify-between font-mono font-bold text-xs text-slate-800 mb-4">
                    <span>{v.code}</span>
                    <button
                      onClick={() => handleCopy(v.code)}
                      className="text-violet-600 hover:text-violet-700 text-[11px] font-sans font-bold flex items-center gap-1"
                    >
                      {copiedCode === v.code ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCode === v.code ? 'Đã sao chép' : 'Sao chép'}
                    </button>
                  </div>

                  {/* Action */}
                  {isOwned ? (
                    <Button disabled className="w-full bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold h-10 border border-emerald-200">
                      ✓ Đã có trong ví của bạn
                    </Button>
                  ) : v.coin_cost ? (
                    <Button
                      onClick={() => handleRedeem(v)}
                      disabled={userCoins < v.coin_cost}
                      className="w-full bg-brand hover:opacity-90 rounded-xl text-xs font-bold h-10 text-white"
                    >
                      <Coins className="w-3.5 h-3.5 mr-1.5" />
                      Đổi ngay ({v.coin_cost} Xu)
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleCopy(v.code)}
                      variant="outline"
                      className="w-full rounded-xl text-xs font-bold h-10"
                    >
                      Sử dụng ngay khi đặt lịch
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

      </div>
    </div>
  )
}
