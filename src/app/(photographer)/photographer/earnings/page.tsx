'use client'

import { useState } from 'react'
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

export default function PhotographerEarningsPage() {
  const earningsSummary = {
    gross_total: 14850000,
    platform_fee_total: 890000,
    net_earnings: 13960000,
    released_balance: 11510000,
    pending_escrow: 2450000,
    withdrawn_total: 8000000,
    available_to_withdraw: 3510000,
  }

  const transactions = [
    {
      id: 'TX-892104',
      booking_id: 'BK-892104',
      date: '15/04/2026',
      package: 'Vibe Sài Gòn',
      gross: 550000,
      fee_rate: '6.0%',
      fee_rule: 'Tiêu chuẩn gói đô thị',
      fee_amount: 33000,
      net: 517000,
      status: 'HELD_IN_ESCROW',
      status_label: 'Ký quỹ (Đang duyệt 48h)',
    },
    {
      id: 'TX-781923',
      booking_id: 'BK-781923',
      date: '10/04/2026',
      package: 'Quick Date',
      gross: 220000,
      fee_rate: '4.0%',
      fee_rule: 'Khách hàng quay lại (Returning)',
      fee_amount: 8800,
      net: 211200,
      status: 'HELD_IN_ESCROW',
      status_label: 'Ký quỹ (Đang duyệt 48h)',
    },
    {
      id: 'TX-651209',
      booking_id: 'BK-651209',
      date: '20/03/2026',
      package: 'Outdoor Ngoại cảnh',
      gross: 1100000,
      fee_rate: '0.0%',
      fee_rule: 'Ưu đãi 3 đơn đầu (0% Fee)',
      fee_amount: 0,
      net: 1100000,
      status: 'RELEASED',
      status_label: 'Đã giải ngân khả dụng',
    },
    {
      id: 'TX-521908',
      booking_id: 'BK-521908',
      date: '12/03/2026',
      package: 'Flash Shot',
      gross: 99000,
      fee_rate: '0.0%',
      fee_rule: 'Ưu đãi 3 đơn đầu (0% Fee)',
      fee_amount: 0,
      net: 99000,
      status: 'RELEASED',
      status_label: 'Đã giải ngân khả dụng',
    }
  ]

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

      {/* Commission Rules Engine Explanation Box (Section 11.2) */}
      <Card className="rounded-3xl border-violet-200 bg-gradient-to-br from-violet-50/80 to-pink-50/50 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Percent className="w-5 h-5 text-violet-600" />
          <h3 className="font-bold text-slate-900 text-sm">Chính Sách Hoa Hồng FLASHY Đang Áp Dụng</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-white border border-violet-100 shadow-2xs">
            <span className="font-black text-emerald-600 text-sm block mb-0.5">0% Hoa Hồng</span>
            <strong className="text-slate-800">3 Đơn Chụp Đầu Tiên</strong>
            <p className="text-[11px] text-slate-500 mt-0.5">Nhận trọn 100% thù lao khi mới tham gia sàn.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-violet-100 shadow-2xs">
            <span className="font-black text-violet-700 text-sm block mb-0.5">6.0% Hoa Hồng</span>
            <strong className="text-slate-800">Flash Shot & Quick Date</strong>
            <p className="text-[11px] text-slate-500 mt-0.5">Phí nền tảng siêu ưu đãi cho gói chụp ngắn.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-violet-100 shadow-2xs">
            <span className="font-black text-violet-700 text-sm block mb-0.5">9.0% Hoa Hồng</span>
            <strong className="text-slate-800">Vibe Sài Gòn & Outdoor</strong>
            <p className="text-[11px] text-slate-500 mt-0.5">Áp dụng cho gói chụp ngoại cảnh chuyên sâu.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-violet-100 shadow-2xs">
            <span className="font-black text-pink-600 text-sm block mb-0.5">4.0% Ưu Đãi</span>
            <strong className="text-slate-800">Khách Hàng Quay Lại</strong>
            <p className="text-[11px] text-slate-500 mt-0.5">Giảm phí khi khách cũ đặt lại bạn trên FLASHY.</p>
          </div>
        </div>
      </Card>

      {/* Authoritative Financial Ledger Table */}
      <Card className="rounded-3xl border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base mb-4">Chi Tiết Từng Giao Dịch Bàn Giao</h3>
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
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      tx.status === 'RELEASED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {tx.status_label}
                    </span>
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
