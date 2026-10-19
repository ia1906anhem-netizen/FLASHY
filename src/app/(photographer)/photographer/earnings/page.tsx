'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  Info,
  Calendar,
  Percent
} from 'lucide-react'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getStoredBookings, PersistentBooking } from '@/lib/data/booking-store'
import { calculateFullBookingCommission } from '@/lib/utils/commission'

export default function PhotographerEarningsPage() {
  const [bookings, setBookings] = useState<PersistentBooking[]>([])
  const [withdrawnTotal, setWithdrawnTotal] = useState<number>(0)
  const [isLoaded, setIsLoaded] = useState(false)

  const loadData = () => {
    const list = getStoredBookings()
    setBookings(list)

    try {
      const history = JSON.parse(localStorage.getItem('flashy_withdrawals') || '[]')
      const totalW = history.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
      setWithdrawnTotal(totalW)
    } catch {
      setWithdrawnTotal(0)
    }
    setIsLoaded(true)
  }

  useEffect(() => {
    loadData()
    const handleUpdate = () => loadData()
    window.addEventListener('flashy_bookings_updated', handleUpdate)
    return () => window.removeEventListener('flashy_bookings_updated', handleUpdate)
  }, [])

  // Calculate dynamic transactions
  const completedCount = bookings.filter((b) => ['ACCEPTED', 'COMPLETED'].includes(b.status)).length

  const transactions = bookings.map((b) => {
    const commission = calculateFullBookingCommission({
      packageSlug: b.package_slug,
      packageAmountVnd: b.package_price,
      photographerCompletedCount: completedCount,
      addons: (b.selected_addons || []).map((a) => ({
        name: a.name,
        amountVnd: a.price,
      })),
    })

    const isReleased = b.status === 'ACCEPTED' || b.status === 'COMPLETED'
    return {
      id: `TX-${b.booking_number}`,
      booking_id: b.booking_number,
      date: b.shooting_date,
      package: b.package_name,
      gross: b.total_amount,
      fee_rate: `${commission.packageRatePercent}%`,
      fee_rule: commission.packageRuleName,
      fee_amount: commission.totalPlatformCommissionVnd,
      net: commission.totalNetPayoutVnd,
      status: isReleased ? 'RELEASED' : 'HELD_IN_ESCROW',
      status_label: isReleased ? 'Đã giải ngân khả dụng' : 'Ký quỹ (Đang duyệt/chờ)',
    }
  })

  // Summary figures
  const gross_total = transactions.reduce((sum, tx) => sum + tx.gross, 0)
  const platform_fee_total = transactions.reduce((sum, tx) => sum + tx.fee_amount, 0)
  const net_earnings = gross_total - platform_fee_total
  const released_balance = transactions
    .filter((tx) => tx.status === 'RELEASED')
    .reduce((sum, tx) => sum + tx.net, 0)
  const pending_escrow = transactions
    .filter((tx) => tx.status === 'HELD_IN_ESCROW')
    .reduce((sum, tx) => sum + tx.net, 0)
  const available_to_withdraw = Math.max(0, released_balance - withdrawnTotal)

  const earningsSummary = {
    gross_total,
    platform_fee_total,
    net_earnings,
    released_balance,
    pending_escrow,
    withdrawn_total: withdrawnTotal,
    available_to_withdraw,
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Thu Nhập & Minh Bạch Hoa Hồng
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu tài chính sổ cái bất biến • Tự động giải ngân sau 48h kiểm duyệt ảnh
          </p>
        </div>

        <Link href="/photographer/withdrawals">
          <Button className="bg-brand hover:opacity-90 text-white rounded-xl font-bold text-xs h-11 px-6 shadow-md">
            Yêu cầu rút tiền ({formatVND(earningsSummary.available_to_withdraw)})
          </Button>
        </Link>
      </div>

      {/* Balance Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Tổng giá trị đơn (GMV)
          </span>
          <div className="text-2xl font-black text-slate-900">
            {formatVND(earningsSummary.gross_total)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Toàn bộ giá trị các đơn đặt</p>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Thu nhập thực nhận (Net)
          </span>
          <div className="text-2xl font-black text-violet-700">
            {formatVND(earningsSummary.net_earnings)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Sau khi trừ phí hoa hồng</p>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Số dư rút khả dụng
          </span>
          <div className="text-2xl font-black text-emerald-600">
            {formatVND(earningsSummary.available_to_withdraw)}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Sẵn sàng chuyển khoản 24/7</p>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Đang giữ trong Escrow
          </span>
          <div className="text-2xl font-black text-amber-600">
            {formatVND(earningsSummary.pending_escrow)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Chờ hết hạn 48h kiểm duyệt</p>
        </Card>
      </div>

      {/* Commission Rules Engine Explanation Box (CP3 Policy) */}
      <Card className="rounded-3xl border-violet-200 bg-gradient-to-br from-violet-50/80 to-pink-50/50 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Percent className="w-5 h-5 text-violet-600" />
          <h3 className="font-bold text-slate-900 text-sm">Chính Sách Hoa Hồng FLASHY (Chuẩn CP3 Mới Nhất)</h3>
          <Badge className="bg-violet-100 text-violet-700 rounded-full text-[10px] font-bold ml-auto">Áp dụng cố định</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          <div className="p-3.5 rounded-2xl bg-white border border-violet-100 shadow-2xs">
            <span className="font-black text-violet-700 text-sm block mb-0.5">15% Phí Sàn</span>
            <strong className="text-slate-800">Phí Sàn FLASHY</strong>
            <p className="text-[11px] text-slate-500 mt-0.5">Trích cố định 15% từ giá gói gốc cho tất cả 4 gói dịch vụ.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 shadow-2xs">
            <span className="font-black text-emerald-600 text-sm block mb-0.5">85% Thù Lao</span>
            <strong className="text-slate-800">Thợ Thực Nhận</strong>
            <p className="text-[11px] text-slate-500 mt-0.5">Thợ nhận trọn 85% thù lao giá gói dịch vụ sau khi trừ phí sàn.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 shadow-2xs">
            <span className="font-black text-emerald-600 text-sm block mb-0.5">100% Phụ Phí</span>
            <strong className="text-slate-800">Add-ons & Di Chuyển</strong>
            <p className="text-[11px] text-slate-500 mt-0.5">Thợ nhận 100% phụ phí Add-ons / di chuyển. Sàn không trích hoa hồng.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-amber-100 shadow-2xs">
            <span className="font-black text-amber-600 text-sm block mb-0.5">0% Thưởng</span>
            <strong className="text-slate-800">Star of the Quarter</strong>
            <p className="text-[11px] text-slate-500 mt-0.5">Miễn 100% phí sàn trong tháng thưởng cho thợ đạt danh hiệu xuất sắc.</p>
          </div>
        </div>
      </Card>

      {/* Authoritative Financial Ledger Table */}
      <Card className="rounded-3xl border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base mb-4">Chi Tiết Từng Giao Dịch Bàn Giao</h3>
        {isLoaded && transactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <DollarSign className="w-8 h-8 text-slate-300 mx-auto mb-1" />
            <p className="font-bold text-slate-700 text-sm">Chưa có giao dịch thu nhập nào</p>
            <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
              Khi bạn hoàn thành các buổi chụp và bàn giao ảnh cho khách hàng, lịch sử doanh thu và chi tiết hoa hồng sẽ hiển thị minh bạch tại đây.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-bold">Mã GD</th>
                  <th className="pb-3 font-bold">Ngày</th>
                  <th className="pb-3 font-bold">Gói dịch vụ</th>
                  <th className="pb-3 font-bold">Tổng đơn</th>
                  <th className="pb-3 font-bold">Hoa hồng</th>
                  <th className="pb-3 font-bold">Thực nhận</th>
                  <th className="pb-3 font-bold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 font-mono text-slate-400">{tx.id}</td>
                    <td className="py-3.5">{tx.date}</td>
                    <td className="py-3.5 font-bold text-slate-900">{tx.package}</td>
                    <td className="py-3.5">{formatVND(tx.gross)}</td>
                    <td className="py-3.5">
                      <span className="text-slate-900 font-bold">{formatVND(tx.fee_amount)}</span>{' '}
                      <span className="text-[10px] text-slate-400">({tx.fee_rate})</span>
                    </td>
                    <td className="py-3.5 font-black text-emerald-600 text-sm">{formatVND(tx.net)}</td>
                    <td className="py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          tx.status === 'RELEASED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {tx.status_label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

    </div>
  )
}
