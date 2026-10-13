'use client'

import { useState, useEffect } from 'react'
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
import { getStoredBookings, type PersistentBooking } from '@/lib/data/booking-store'

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<'30d' | '90d' | 'year'>('30d')
  const [bookings, setBookings] = useState<PersistentBooking[]>([])

  const loadAnalytics = () => {
    const list = getStoredBookings()
    setBookings(list)
  }

  useEffect(() => {
    loadAnalytics()
    window.addEventListener('flashy_bookings_updated', loadAnalytics)
    window.addEventListener('flashy_admin_updated', loadAnalytics)
    window.addEventListener('storage', loadAnalytics)
    return () => {
      window.removeEventListener('flashy_bookings_updated', loadAnalytics)
      window.removeEventListener('flashy_admin_updated', loadAnalytics)
      window.removeEventListener('storage', loadAnalytics)
    }
  }, [])

  const totalGmv = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
  const netCommission = Math.round(totalGmv * 0.15)
  const completedBookings = bookings.filter(
    (b) => b.status === 'COMPLETED' || b.status === 'ACCEPTED'
  )
  const completionRate =
    bookings.length > 0
      ? ((completedBookings.length / bookings.length) * 100).toFixed(1) + '%'
      : '0.0%'

  // Group by package
  const packageMap = new Map<string, { orders: number; gmv: number }>()
  for (const b of bookings) {
    const pkg = b.package_name || 'Khác'
    const cur = packageMap.get(pkg) || { orders: 0, gmv: 0 }
    cur.orders += 1
    cur.gmv += b.total_amount || 0
    packageMap.set(pkg, cur)
  }

  const packageBreakdown = Array.from(packageMap.entries()).map(([name, data]) => ({
    name,
    orders: data.orders,
    gmv: data.gmv,
    percent: totalGmv > 0 ? ((data.gmv / totalGmv) * 100).toFixed(1) + '%' : '0%',
  }))

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Báo Cáo Phân Tích Tài Chính & Tăng Trưởng
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu tổng hợp GMV, doanh thu hoa hồng sàn và phân bố theo gói chụp (Thời gian thực)
          </p>
        </div>

        <div className="flex gap-2">
          {['30d', '90d', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === p
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200'
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
            {formatVND(totalGmv)}
          </div>
          <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Tổng số {bookings.length} đơn hàng
          </p>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Doanh thu hoa hồng sàn (Net Revenue)
          </span>
          <div className="text-3xl font-black text-violet-700 mb-1">
            {formatVND(netCommission)}
          </div>
          <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Tỷ lệ thu cố định 15.0%
          </p>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Tỷ lệ hoàn tất thành công
          </span>
          <div className="text-3xl font-black text-emerald-600 mb-1">
            {completionRate}
          </div>
          <p className="text-xs text-slate-500">
            {completedBookings.length} đơn hoàn tất / {bookings.length} tổng đơn
          </p>
        </Card>
      </div>

      {/* Package Breakdown Table */}
      <Card className="rounded-3xl border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base mb-4">Phân Bố Doanh Số Theo Gói Chụp</h3>
        <div className="overflow-x-auto">
          {packageBreakdown.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-2">
                <PieChart className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-800">Chưa có dữ liệu phân tích gói chụp (Clean Slate)</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Khi có đơn đặt lịch mới, bảng phân tích tỷ trọng doanh số theo gói sẽ tự động tổng hợp tại đây.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-bold">Gói Dịch Vụ</th>
                  <th className="pb-3 font-bold">Số Lượng Đơn</th>
                  <th className="pb-3 font-bold">Doanh Số (GMV)</th>
                  <th className="pb-3 font-bold">Tỷ Trọng (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {packageBreakdown.map((pkg) => (
                  <tr key={pkg.name} className="hover:bg-slate-50/60">
                    <td className="py-3.5 font-bold text-slate-900">{pkg.name}</td>
                    <td className="py-3.5">{pkg.orders} đơn</td>
                    <td className="py-3.5 font-black text-slate-900">{formatVND(pkg.gmv)}</td>
                    <td className="py-3.5 font-bold text-violet-700">{pkg.percent}</td>
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
