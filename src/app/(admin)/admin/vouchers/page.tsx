'use client'

import { useState } from 'react'
import {
  Ticket,
  Plus,
  CheckCircle2,
  Trash2,
  Coins,
  Clock,
  Sparkles
} from 'lucide-react'
import { DEMO_VOUCHERS } from '@/lib/data/mock-data'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState(DEMO_VOUCHERS)
  const [code, setCode] = useState('')
  const [discountVal, setDiscountVal] = useState('10')
  const [maxDiscount, setMaxDiscount] = useState('50000')

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) return
    const newV: any = {
      id: `v-${Date.now()}`,
      code: code.toUpperCase(),
      type: 'PERCENTAGE',
      discount_value: Number(discountVal),
      max_discount: Number(maxDiscount),
      min_order_value: 150000,
      coin_cost: null,
      usage_limit: 500,
      usage_count: 0,
      user_id: null,
      partner: null,
      description: `Giảm ${discountVal}% (Tối đa ${formatVND(Number(maxDiscount))})`,
      starts_at: new Date().toISOString(),
      expires_at: '2026-12-31T23:59:59Z',
      is_active: true,
      created_at: new Date().toISOString(),
    }
    setVouchers([newV, ...vouchers])
    setCode('')
  }

  const toggleVoucher = (id: string) => {
    setVouchers(vouchers.map(v => {
      if (v.id === id) return { ...v, is_active: !v.is_active }
      return v
    }))
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý Chương Trình Khuyến Mãi & Voucher
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phát hành mã giảm giá toàn sàn và quản lý danh mục đổi quà bằng Flashy Coins
          </p>
        </div>
      </div>

      {/* Create Voucher Card */}
      <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm mb-4">Tạo Mã Giảm Giá Mới</h3>
        <form onSubmit={handleCreateVoucher} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Mã Voucher *</label>
            <Input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="VD: HELLO2026"
              className="rounded-xl h-10 text-xs font-mono font-bold"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Tỷ lệ giảm (%) *</label>
            <Input
              type="number"
              value={discountVal}
              onChange={(e) => setDiscountVal(e.target.value)}
              className="rounded-xl h-10 text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Giảm tối đa (VND) *</label>
            <Input
              type="number"
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(e.target.value)}
              className="rounded-xl h-10 text-xs font-bold"
            />
          </div>
          <Button type="submit" className="bg-brand hover:opacity-90 rounded-xl font-bold text-xs h-10 text-white">
            <Plus className="w-4 h-4 mr-1" /> Phát hành voucher
          </Button>
        </form>
      </Card>

      {/* Vouchers List */}
      <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm mb-4">Danh Sách Mã Đang Lưu Hành</h3>
        <div className="divide-y divide-slate-100 text-xs">
          {vouchers.map((v) => (
            <div key={v.id} className="py-3.5 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                    {v.code}
                  </span>
                  <span className="text-violet-600 font-bold">{v.description}</span>
                  {v.coin_cost && (
                    <span className="text-amber-600 font-bold text-[11px]">({v.coin_cost} Xu)</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Đã dùng: {v.usage_count} lượt • HSD: 31/12/2026</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleVoucher(v.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${
                    v.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {v.is_active ? 'Đang kích hoạt' : 'Đã tạm dừng'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  )
}
