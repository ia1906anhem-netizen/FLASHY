'use client'

import { useState, useEffect } from 'react'
import {
  Ticket,
  Plus,
  CheckCircle2,
  Trash2,
  Coins,
  Clock,
  Sparkles
} from 'lucide-react'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface VoucherItem {
  id: string
  code: string
  type: string
  discount_value: number
  max_discount: number
  min_order_value: number
  coin_cost: number | null
  usage_limit: number
  usage_count: number
  description: string
  starts_at: string
  expires_at: string
  is_active: boolean
  created_at: string
}

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<VoucherItem[]>([])
  const [code, setCode] = useState('')
  const [discountVal, setDiscountVal] = useState('10')
  const [maxDiscount, setMaxDiscount] = useState('50000')

  const loadVouchers = () => {
    try {
      const raw = localStorage.getItem('flashy_admin_vouchers')
      if (raw) {
        setVouchers(JSON.parse(raw))
      } else {
        setVouchers([])
      }
    } catch {
      setVouchers([])
    }
  }

  useEffect(() => {
    loadVouchers()
    window.addEventListener('flashy_admin_updated', loadVouchers)
    window.addEventListener('storage', loadVouchers)
    return () => {
      window.removeEventListener('flashy_admin_updated', loadVouchers)
      window.removeEventListener('storage', loadVouchers)
    }
  }, [])

  const saveVouchers = (updated: VoucherItem[]) => {
    setVouchers(updated)
    try {
      localStorage.setItem('flashy_admin_vouchers', JSON.stringify(updated))
    } catch {}
  }

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) return
    const newV: VoucherItem = {
      id: `v-${Date.now()}`,
      code: code.toUpperCase(),
      type: 'PERCENTAGE',
      discount_value: Number(discountVal),
      max_discount: Number(maxDiscount),
      min_order_value: 150000,
      coin_cost: null,
      usage_limit: 500,
      usage_count: 0,
      description: `Giảm ${discountVal}% (Tối đa ${formatVND(Number(maxDiscount))})`,
      starts_at: new Date().toISOString(),
      expires_at: '2026-12-31T23:59:59Z',
      is_active: true,
      created_at: new Date().toISOString(),
    }
    const updated = [newV, ...vouchers]
    saveVouchers(updated)
    setCode('')
  }

  const toggleVoucher = (id: string) => {
    const updated = vouchers.map((v) => {
      if (v.id === id) return { ...v, is_active: !v.is_active }
      return v
    })
    saveVouchers(updated)
  }

  const deleteVoucher = (id: string) => {
    const updated = vouchers.filter((v) => v.id !== id)
    saveVouchers(updated)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý Chương Trình Khuyến Mãi & Voucher
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phát hành mã giảm giá toàn sàn và quản lý danh mục đổi quà bằng Flashy Coins (Thời gian thực)
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-sm">
          Tổng số Voucher: <span className="font-bold text-violet-700">{vouchers.length}</span>
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
          <div>
            <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-10 text-xs font-bold">
              <Plus className="w-4 h-4 mr-1" /> Phát hành
            </Button>
          </div>
        </form>
      </Card>

      {/* Vouchers List */}
      <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm mb-4">Danh Sách Mã Giảm Giá Đang Lưu Hành</h3>
        <div className="overflow-x-auto">
          {vouchers.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="w-10 h-10 mx-auto rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mb-2">
                <Ticket className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-800">Chưa có mã giảm giá nào (Clean Slate)</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Tạo mã voucher đầu tiên bằng biểu mẫu phía trên để áp dụng cho khách hàng toàn sàn.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-bold">Mã Code</th>
                  <th className="pb-3 font-bold">Mô Tả Giảm</th>
                  <th className="pb-3 font-bold">Lượt Dùng</th>
                  <th className="pb-3 font-bold">Trạng Thái</th>
                  <th className="pb-3 font-bold">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/60">
                    <td className="py-3 font-mono font-black text-slate-900">{v.code}</td>
                    <td className="py-3 font-medium">{v.description}</td>
                    <td className="py-3 font-bold">
                      {v.usage_count} / {v.usage_limit}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          v.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {v.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="py-3 flex items-center gap-3">
                      <button
                        onClick={() => toggleVoucher(v.id)}
                        className="text-xs font-bold text-violet-600 hover:underline"
                      >
                        {v.is_active ? 'Tạm ngưng' : 'Kích hoạt'}
                      </button>
                      <button
                        onClick={() => deleteVoucher(v.id)}
                        className="text-xs font-bold text-rose-500 hover:underline"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  )
}
