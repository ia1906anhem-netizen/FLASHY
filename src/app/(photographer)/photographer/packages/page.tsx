'use client'

import { useState } from 'react'
import {
  Package,
  Plus,
  CheckCircle2,
  Clock,
  Camera,
  Sparkles,
  Edit2
} from 'lucide-react'
import { DEMO_PACKAGES } from '@/lib/data/mock-data'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function PhotographerPackagesPage() {
  const [packages, setPackages] = useState(DEMO_PACKAGES)

  const togglePackage = (id: string) => {
    setPackages(packages.map(p => {
      if (p.id === id) return { ...p, is_active: !p.is_active }
      return p
    }))
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý Gói Dịch Vụ & Báo Giá
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kích hoạt các gói chụp bạn sẵn sàng nhận và điều chỉnh mức giá theo quy định sàn
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {packages.map((pkg) => (
          <Card key={pkg.id} className={`rounded-3xl border transition-all ${
            pkg.is_active ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-60'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider bg-violet-50 px-2 py-0.5 rounded">
                    {pkg.category}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">{pkg.name}</h3>
                </div>

                <button
                  onClick={() => togglePackage(pkg.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                    pkg.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {pkg.is_active ? 'Đang nhận lịch' : 'Tạm tắt'}
                </button>
              </div>

              <div className="text-2xl font-black text-violet-700 mb-3">
                {formatVND(pkg.base_price)}
                <span className="text-xs text-slate-400 font-normal"> / buổi ({pkg.duration_minutes} phút)</span>
              </div>

              <p className="text-xs text-slate-500 mb-4 leading-relaxed">{pkg.description}</p>

              <div className="text-xs text-slate-600 space-y-1.5 pt-3 border-t border-slate-100 mb-4">
                <p>📸 <strong>{pkg.original_photos}</strong> ảnh gốc • <strong>{pkg.edited_photos}</strong> ảnh màu</p>
                {pkg.retouch_quota > 0 && (
                  <p className="text-amber-600 font-semibold">✨ Retouch chuyên sâu: <strong>{pkg.retouch_quota}</strong> ảnh</p>
                )}
                <p>⏱️ Trả file trong vòng <strong>{pkg.delivery_days} ngày</strong></p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  )
}
