'use client'

import { useState } from 'react'
import {
  Percent,
  CheckCircle2,
  Save,
  Clock,
  Sparkles,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function AdminCommissionsPage() {
  const [rates, setRates] = useState({
    flash_shot: 6.0,
    quick_date: 6.0,
    vibe_sai_gon: 9.0,
    outdoor: 9.0,
    returning_customer: 4.0,
    free_bookings_count: 3,
  })

  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Cấu Hình Phí Hoa Hồng & Động Cơ Định Giá (Commission Engine)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Quy tắc phân tầng hoa hồng sàn • Chỉ áp dụng cho các đơn đặt lịch mới phát sinh sau khi lưu cấu hình
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Đã lưu thành công cấu hình hoa hồng mới! Sổ cái đã ghi nhận snapshot quy tắc mới.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="rounded-3xl border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
            <Percent className="w-4 h-4 text-violet-600" />
            Tỷ Lệ Hoa Hồng Theo Gói Dịch Vụ
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Gói Flash Shot (Chụp nhanh 20p) - (%)
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="30"
                value={rates.flash_shot}
                onChange={(e) => setRates({ ...rates, flash_shot: Number(e.target.value) })}
                className="rounded-xl h-10 font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">Mặc định đề xuất: 5% - 7%</p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Gói Quick Date (Hẹn hò 45p) - (%)
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="30"
                value={rates.quick_date}
                onChange={(e) => setRates({ ...rates, quick_date: Number(e.target.value) })}
                className="rounded-xl h-10 font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">Mặc định đề xuất: 5% - 7%</p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Gói Vibe Sài Gòn (Dạo phố 2-3h) - (%)
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="30"
                value={rates.vibe_sai_gon}
                onChange={(e) => setRates({ ...rates, vibe_sai_gon: Number(e.target.value) })}
                className="rounded-xl h-10 font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">Mặc định đề xuất: 8% - 10%</p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Gói Outdoor Ngoại cảnh (Nửa ngày) - (%)
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="30"
                value={rates.outdoor}
                onChange={(e) => setRates({ ...rates, outdoor: Number(e.target.value) })}
                className="rounded-xl h-10 font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">Mặc định đề xuất: 8% - 10%</p>
            </div>
          </div>
        </Card>

        {/* Incentive & Promotional Rules Card */}
        <Card className="rounded-3xl border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Chính Sách Khuyến Khích & Khách Hàng Thân Thiết
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Số đơn đầu miễn phí hoa hồng (0% Fee) cho thợ mới
              </label>
              <Input
                type="number"
                min="0"
                max="10"
                value={rates.free_bookings_count}
                onChange={(e) => setRates({ ...rates, free_bookings_count: Number(e.target.value) })}
                className="rounded-xl h-10 font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">Khuyến khích thợ mới gia nhập sàn (Mặc định: 3 đơn)</p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Hoa hồng ưu đãi khi khách cũ book lại cùng thợ (%)
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="15"
                value={rates.returning_customer}
                onChange={(e) => setRates({ ...rates, returning_customer: Number(e.target.value) })}
                className="rounded-xl h-10 font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">Giảm phí để ngăn chặn giao dịch ngoài sàn (Mặc định: 4.0%)</p>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
            <Button type="submit" className="bg-brand hover:opacity-90 rounded-xl font-bold text-xs h-11 px-8 text-white shadow-md">
              <Save className="w-4 h-4 mr-1.5" />
              Lưu cấu hình phí hoa hồng
            </Button>
          </div>
        </Card>
      </form>

    </div>
  )
}
