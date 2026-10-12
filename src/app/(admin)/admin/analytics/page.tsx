'use client'

import { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  PieChart,
  ArrowUpRight,
  Filter
} from 'lucide-react'
import { formatVND } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<'30d' | '90d' | 'year'>('30d')

  const packageBreakdown = [
    { name: 'Vibe Sài Gòn', orders: 198, gmv: 108900000, percent: '59.0%' },
    { name: 'Quick Date', orders: 184, gmv: 40480000, percent: '21.9%' },
    { name: 'Outdoor Ngoại cảnh', orders: 32, gmv: 28800000, percent: '15.6%' },
    { name: 'Flash Shot', orders: 98, gmv: 8722000, percent: '4.7%' },
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Báo Cáo Phân Tích Tài Chính & Tăng Trưởng
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu tổng hợp GMV, doanh thu hoa hồng sàn và phân bố theo gói chụp
          </p>
        </div>

        <div className="flex gap-2">
          {['30d', '90d', 'year'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === p ? 'bg-violet-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {p === '30d' ? '30 ngày qua' : p === '90d' ? 'Quý 1/2026' : 'Cả năm'}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Tổng GMV kỳ này
          </span>
          <div className="text-3xl font-black text-slate-900 mb-1">
            186.902.000đ
          </div>
          <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +24.8% so với kỳ trước
          </p>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Doanh thu hoa hồng sàn (Net Revenue)
          </span>
          <div className="text-3xl font-black text-violet-700 mb-1">
            12.450.000đ
          </div>
          <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Tỷ lệ thu trung bình 6.66%
          </p>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Tỷ lệ hoàn tất thành công
          </span>
          <div className="text-3xl font-black text-emerald-600 mb-1">
            98.2%
          </div>
          <p className="text-xs text-slate-500">
            Tỷ lệ khiếu nại tranh chấp &lt; 0.8%
          </p>
        </Card>
      </div>

      {/* Package Breakdown Table */}
      <Card className="rounded-3xl border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base mb-4">Phân Bố Doanh Số Theo Gói Chụp</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-bold">Gói Dịch Vụ</th>
                <th className="pb-3 font-bold">Số Lượng Đơn</th>
                <th className="pb-3 font-bold">Doanh Số (GMV)</th>
                <th className="pb-3 font-bold">Tỷ Trọng Doanh Số</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {packageBreakdown.map((pkg, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-3.5 font-bold text-slate-900">{pkg.name}</td>
                  <td className="py-3.5">{pkg.orders} đơn</td>
                  <td className="py-3.5 font-black text-slate-900">{formatVND(pkg.gmv)}</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-violet-600 h-full rounded-full" style={{ width: pkg.percent }} />
                      </div>
                      <span className="font-bold text-slate-700">{pkg.percent}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  )
}
