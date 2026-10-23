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
  Percent,
  RotateCcw
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
      isReturningCustomer: Boolean(b.is_rebook),
      isTopRated: Boolean(b.is_top_rated),
      addons: (b.selected_addons || []).map((a) => ({
        name: a.name,
        amountVnd: a.price,
      })),
      travelFee: b.travel_fee || 0,
      studioFee: b.studio_fee || 0,
    })

    const isReleased = b.status === 'ACCEPTED' || b.status === 'COMPLETED'
    return {
      id: `TX-${b.booking_number}`,
      booking_id: b.booking_number,
      customer_name: b.customer_name,
      date: b.shooting_date,
      package: b.package_name,
      gross: b.total_amount,
      service_gross: commission.grossServiceValue,
      service_payout: commission.photographerServicePayout, // Tiền công chụp (đã trừ % phí sàn)
      travel_reimbursement: commission.photographerReimbursementPayout, // Tiền bù di chuyển (100%)
      fee_rate: `${commission.packageRatePercent}%`,
      fee_rule: commission.packageRuleName,
      fee_amount: commission.totalPlatformCommissionVnd,
      net: commission.totalNetPayoutVnd,
      status: isReleased ? 'RELEASED' : 'HELD_IN_ESCROW',
      status_label: isReleased ? 'Đã giải ngân khả dụng' : 'Ký quỹ (Đang duyệt/chờ)',
      is_rebook: Boolean(b.is_rebook),
      is_top_rated: Boolean(b.is_top_rated),
      rebook_note: commission.rebookDiscountNote,
      commission_savings: commission.commissionSavingsVnd || 0,
    }
  })

  // Summary figures
  const rebookTxCount = transactions.filter((t) => t.is_rebook).length
  const totalRebookSavings = transactions.reduce((sum, t) => sum + t.commission_savings, 0)
  const gross_total = transactions.reduce((sum, tx) => sum + tx.gross, 0)
  const platform_fee_total = transactions.reduce((sum, tx) => sum + tx.fee_amount, 0)
  const service_payout_total = transactions.reduce((sum, tx) => sum + tx.service_payout, 0)
  const travel_reimbursement_total = transactions.reduce((sum, tx) => sum + tx.travel_reimbursement, 0)
  const net_earnings = transactions.reduce((sum, tx) => sum + tx.net, 0)

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
    service_payout_total,
    travel_reimbursement_total,
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
            Dữ liệu tài chính chuẩn Marketplace: Bóc tách rành mạch Tiền công chụp & Tiền bù di chuyển (100%)
          </p>
        </div>

        <Link href="/photographer/withdrawals">
          <Button className="bg-brand hover:opacity-90 text-white rounded-xl font-bold text-xs h-11 px-6 shadow-md">
            Yêu cầu rút tiền ({formatVND(earningsSummary.available_to_withdraw)})
          </Button>
        </Link>
      </div>

      {/* Anti-Circumvention Re-booking Incentive Announcement Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm">Chính Sách Ưu Đãi Đặt Lại Thợ Cũ (Re-booking)</span>
              <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full">
                Chống giao dịch ngoài
              </span>
            </div>
            <p className="text-xs text-emerald-50 mt-0.5">
              🎉 <strong>Đơn hàng từ khách cũ - Bạn được giảm phí sàn từ 15% xuống 10%!</strong> (Hoặc 8% cho thợ Top Rated). Tiền công chụp thực nhận của bạn tăng lên tương ứng.
            </p>
          </div>
        </div>

        {rebookTxCount > 0 && (
          <div className="bg-white/10 px-3.5 py-2 rounded-2xl border border-white/20 whitespace-nowrap self-start sm:self-auto text-right">
            <span className="text-[10px] text-emerald-100 block">Đơn khách cũ đặt lại ({rebookTxCount} đơn):</span>
            <strong className="text-amber-300 text-sm font-black">Tiết kiệm +{formatVND(totalRebookSavings)}</strong>
          </div>
        )}
      </div>

      {/* Balance Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="rounded-3xl border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Tổng giá trị đơn (GMV)
          </span>
          <div className="text-xl font-black text-slate-900">
            {formatVND(earningsSummary.gross_total)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Toàn bộ doanh thu các đơn</p>
        </Card>

        <Card className="rounded-3xl border-violet-100 bg-violet-50/40 p-5 shadow-sm">
          <span className="text-[11px] font-bold text-violet-700 uppercase tracking-wider block mb-1">
            Tiền công chụp
          </span>
          <div className="text-xl font-black text-violet-900">
            {formatVND(earningsSummary.service_payout_total)}
          </div>
          <p className="text-[10px] text-violet-600 font-medium mt-1">Gói + Add-ons (đã trừ phí sàn)</p>
        </Card>

        <Card className="rounded-3xl border-emerald-100 bg-emerald-50/40 p-5 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
            Tiền bù di chuyển (100%)
          </span>
          <div className="text-xl font-black text-emerald-900">
            {formatVND(earningsSummary.travel_reimbursement_total)}
          </div>
          <p className="text-[10px] text-emerald-600 font-medium mt-1">Di chuyển &gt;8km (0% phí sàn)</p>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Số dư khả dụng
          </span>
          <div className="text-xl font-black text-emerald-600">
            {formatVND(earningsSummary.available_to_withdraw)}
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">Rút về ngân hàng 24/7</p>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Đang giữ Escrow
          </span>
          <div className="text-xl font-black text-amber-600">
            {formatVND(earningsSummary.pending_escrow)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Chờ duyệt trong 48h</p>
        </Card>
      </div>

      {/* Commission Rules Engine Explanation Box (Marketplace Standard) */}
      <Card className="rounded-3xl border-violet-200 bg-gradient-to-br from-violet-50/80 to-pink-50/50 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Percent className="w-5 h-5 text-violet-600" />
          <h3 className="font-bold text-slate-900 text-sm">Chính Sách Hoa Hồng & Phân Bổ Thu Nhập Chuẩn Marketplace FLASHY</h3>
          <Badge className="bg-violet-100 text-violet-700 rounded-full text-[10px] font-bold ml-auto">Minh bạch 100%</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white border border-violet-100 shadow-2xs">
            <span className="font-black text-violet-700 text-sm block mb-0.5">Nhóm 1: Doanh Thu Dịch Vụ</span>
            <strong className="text-slate-800">Gói Chụp + Dịch Vụ Thêm</strong>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Phí sàn trích 15% trên đơn mới. Thợ nhận 85% tiền công chụp.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-teal-200 shadow-2xs bg-teal-50/30">
            <span className="font-black text-teal-700 text-sm block mb-0.5">Ưu Đãi Đặt Lại</span>
            <strong className="text-slate-800">Giảm Phí Sàn Còn 10% (8%)</strong>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Khách cũ bấm &quot;Đặt lại thợ này&quot;: Sàn giảm phí từ 15% xuống 10% (8% thợ Top Rated).
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 shadow-2xs">
            <span className="font-black text-emerald-600 text-sm block mb-0.5">Nhóm 2: Phụ Phí Hoàn Trả</span>
            <strong className="text-slate-800">Di Chuyển &gt;8km (100%)</strong>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Chuyển trọn 100% phụ thu di chuyển (15.000đ/km) và thuê studio cho thợ. Sàn thu 0%.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-indigo-100 shadow-2xs">
            <span className="font-black text-indigo-600 text-sm block mb-0.5">Công Thức Thu Nhập</span>
            <strong className="text-slate-800">Thực Nhận = Công + Bù</strong>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Thực nhận = [Tiền công chụp đã trừ % sàn] + [100% Tiền bù di chuyển &amp; phụ phí].
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-amber-100 shadow-2xs">
            <span className="font-black text-amber-600 text-sm block mb-0.5">Ưu Đãi Đặc Biệt</span>
            <strong className="text-slate-800">Star of the Quarter (0%)</strong>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Thợ đạt danh hiệu xuất sắc quý được miễn trọn 100% phí sàn trên Doanh thu dịch vụ.
            </p>
          </div>
        </div>
      </Card>

      {/* Authoritative Financial Ledger Table with 2 Clear Columns */}
      <Card className="rounded-3xl border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Báo Cáo Thu Nhập & Sổ Cái Chi Tiết Từng Buổi Chụp</h3>
            <p className="text-xs text-slate-500">Phân định rõ ràng Tiền công chụp vs Tiền bù di chuyển (100%)</p>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start">
            Bảo vệ Escrow 48h
          </span>
        </div>

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
                  <th className="pb-3 font-bold">Tổng khách trả</th>
                  <th className="pb-3 font-bold">Phí sàn (Chiết khấu)</th>
                  <th className="pb-3 font-bold text-violet-700 bg-violet-50/60 px-2 rounded-t-lg">Tiền công chụp</th>
                  <th className="pb-3 font-bold text-emerald-700 bg-emerald-50/60 px-2 rounded-t-lg">Tiền bù di chuyển (100%)</th>
                  <th className="pb-3 font-bold text-emerald-700">Thực nhận</th>
                  <th className="pb-3 font-bold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 font-mono text-slate-400">{tx.id}</td>
                    <td className="py-3.5">{tx.date}</td>
                    <td className="py-3.5">
                      <div className="font-bold text-slate-900">{tx.package}</div>
                      {tx.is_rebook && (
                        <span className="inline-flex items-center gap-1 mt-0.5 text-[9px] font-extrabold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                          <RotateCcw className="w-2.5 h-2.5" />
                          Khách cũ đặt lại
                        </span>
                      )}
                    </td>
                    <td className="py-3.5">{formatVND(tx.gross)}</td>
                    <td className="py-3.5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${tx.is_rebook ? 'text-teal-700' : 'text-rose-600'}`}>
                            -{formatVND(tx.fee_amount)}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                              tx.is_rebook
                                ? 'bg-teal-100 text-teal-800 border border-teal-300'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {tx.fee_rate}
                          </span>
                        </div>
                        {tx.is_rebook && (
                          <div className="mt-1" title={tx.rebook_note}>
                            <span className="text-[10px] text-teal-700 font-bold block">
                              🎉 {tx.rebook_note}
                            </span>
                            {tx.commission_savings > 0 && (
                              <span className="text-[9px] text-emerald-600 font-semibold block">
                                Tiết kiệm: +{formatVND(tx.commission_savings)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Cột 1: Tiền công chụp (đã trừ % phí sàn) */}
                    <td className="py-3.5 font-bold text-violet-900 bg-violet-50/40 px-2">
                      {formatVND(tx.service_payout)}
                    </td>
                    {/* Cột 2: Tiền bù di chuyển (100%) */}
                    <td className="py-3.5 font-bold text-emerald-700 bg-emerald-50/40 px-2">
                      {tx.travel_reimbursement > 0 ? (
                        <span>+{formatVND(tx.travel_reimbursement)}</span>
                      ) : (
                        <span className="text-slate-400 font-normal">0đ (≤8km)</span>
                      )}
                    </td>
                    <td className="py-3.5 font-black text-emerald-600 text-sm">
                      {formatVND(tx.net)}
                    </td>
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

