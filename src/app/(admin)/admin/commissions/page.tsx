'use client'

import { useState } from 'react'
import {
  Percent,
  CheckCircle2,
  Save,
  Sparkles,
  Info,
  ShieldCheck,
  TrendingUp,
  Camera,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const CP3_PACKAGES = [
  {
    name: 'FLASHY EXPRESS',
    slug: 'flashy-express',
    price: 350000,
    takeRate: 15,
    platformFee: 52500,
    photographerNet: 297500,
    icon: '⚡',
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
  },
  {
    name: 'FLASHY CASUAL',
    slug: 'flashy-casual',
    price: 800000,
    takeRate: 15,
    platformFee: 120000,
    photographerNet: 680000,
    icon: '📷',
    color: 'text-pink-700',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
  },
  {
    name: 'FLASHY PRO',
    slug: 'flashy-pro',
    price: 1500000,
    takeRate: 15,
    platformFee: 225000,
    photographerNet: 1275000,
    icon: '🎯',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    isPopular: true,
  },
  {
    name: 'FLASHY SIGNATURE',
    slug: 'flashy-signature',
    price: 3200000,
    takeRate: 15,
    platformFee: 480000,
    photographerNet: 2720000,
    icon: '👑',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
]

function formatVND(n: number) {
  return n.toLocaleString('vi-VN') + '₫'
}

export default function AdminCommissionsPage() {
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
          Cấu Hình Hoa Hồng Sàn (Commission Engine – CP3)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Chính sách Take Rate 15% cố định • Thợ nhận 85% giá gói + 100% phụ phí Add-ons / Di chuyển
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Đã lưu thành công cấu hình hoa hồng CP3! Sổ cái đã ghi nhận snapshot quy tắc mới.</span>
        </div>
      )}

      {/* CP3 Policy Banner */}
      <Card className="rounded-3xl border-violet-200 bg-gradient-to-br from-violet-50 to-pink-50 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-violet-600" />
          <h3 className="font-bold text-slate-900 text-base">Chính Sách Take Rate CP3 — Cố Định 15%</h3>
          <Badge className="bg-violet-100 text-violet-700 rounded-full text-[10px] font-bold ml-auto">Đang áp dụng</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white border border-violet-100 shadow-sm">
            <span className="font-black text-violet-700 text-xl block mb-0.5">15%</span>
            <strong className="text-slate-800 text-sm block">Phí Sàn FLASHY</strong>
            <p className="text-[11px] text-slate-500 mt-1">Trích cố định 15% từ giá gói gốc. Áp dụng đồng nhất cho tất cả 4 gói CP3.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm">
            <span className="font-black text-emerald-600 text-xl block mb-0.5">85%</span>
            <strong className="text-slate-800 text-sm block">Thù Lao Thợ Thực Nhận</strong>
            <p className="text-[11px] text-slate-500 mt-1">Nhiếp ảnh gia nhận 85% từ giá gói gốc sau khi trừ phí sàn.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm">
            <span className="font-black text-emerald-600 text-xl block mb-0.5">100%</span>
            <strong className="text-slate-800 text-sm block">Phụ Phí Add-ons</strong>
            <p className="text-[11px] text-slate-500 mt-1">Thợ nhận 100% phụ phí Add-ons / Di chuyển. FLASHY không trích hoa hồng phụ phí.</p>
          </div>
        </div>
      </Card>

      {/* CP3 Package Revenue Breakdown */}
      <Card className="rounded-3xl border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-5 h-5 text-violet-600" />
          <h3 className="font-bold text-slate-900 text-base">Phân Tích Doanh Thu Theo 4 Gói CP3</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CP3_PACKAGES.map((pkg) => (
            <div
              key={pkg.slug}
              className={`p-4 rounded-2xl border ${pkg.border} ${pkg.bg} relative`}
            >
              {pkg.isPopular && (
                <Badge className="absolute -top-2 right-3 bg-orange-500 text-white rounded-full text-[9px] font-bold px-2 py-0.5">
                  Phổ biến
                </Badge>
              )}
              <div className="text-2xl mb-1">{pkg.icon}</div>
              <p className={`font-black text-xs ${pkg.color} mb-2`}>{pkg.name}</p>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Giá niêm yết:</span>
                  <span className="font-bold text-slate-800">{formatVND(pkg.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phí sàn (15%):</span>
                  <span className="font-bold text-rose-600">{formatVND(pkg.platformFee)}</span>
                </div>
                <div className="pt-1 border-t border-slate-200 flex justify-between">
                  <span className="text-slate-600 font-semibold">Thợ nhận (85%):</span>
                  <span className="font-black text-emerald-600">{formatVND(pkg.photographerNet)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <p className="flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <span>Ngoài ra, Thợ nhận <strong>100% toàn bộ phụ phí Add-ons</strong> (Makeup &amp; Hair, Di chuyển ngoại thành, Express Delivery, v.v.). FLASHY không trích hoa hồng trên phụ phí.</span>
          </p>
        </div>
      </Card>

      {/* Bonus / Incentive Programs */}
      <Card className="rounded-3xl border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-slate-900 text-base">Chương Trình Khuyến Khích Đặc Biệt</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="font-black text-emerald-600 text-lg block mb-0.5">0% Phí</span>
            <strong className="text-slate-800 text-sm block">Thưởng Star of the Quarter</strong>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Nhiếp ảnh gia đạt danh hiệu "Star of the Quarter" được miễn toàn bộ phí sàn trong tháng thưởng. Áp dụng tự động theo hệ thống xếp hạng.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Camera className="w-4 h-4 text-blue-600" />
              <span className="font-black text-blue-600 text-lg">Escrow 48h</span>
            </div>
            <strong className="text-slate-800 text-sm block">Bảo Vệ Thanh Toán</strong>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Tiền được giữ an toàn 48h sau bàn giao. Tự động giải ngân cho thợ nếu không có khiếu nại. Bảo vệ quyền lợi cả 2 bên.
            </p>
          </div>
        </div>
      </Card>

      {/* Save button */}
      <form onSubmit={handleSave}>
        <div className="flex justify-end">
          <Button type="submit" className="bg-brand hover:opacity-90 rounded-xl font-bold text-xs h-11 px-8 text-white shadow-md">
            <Save className="w-4 h-4 mr-1.5" />
            Lưu cấu hình hoa hồng CP3
          </Button>
        </div>
      </form>

    </div>
  )
}
