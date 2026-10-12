'use client'

import { useState } from 'react'
import {
  Lock,
  Unlock,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  ArrowRight,
  Filter,
  Play
} from 'lucide-react'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AdminEscrowPage() {
  const [records, setRecords] = useState([
    {
      id: 'ESC-892104',
      booking_id: 'BK-892104',
      customer: 'Nguyễn Thu Trang',
      photographer: 'Minh Trí (TriStreet)',
      gross: 550000,
      fee_rate: '6.0%',
      net_payout: 517000,
      status: 'HELD_BY_PROVIDER',
      status_label: 'Tiền đã khóa • Chờ chụp',
      hours_remaining: 'Chưa tính (Chưa giao ảnh)',
      can_release: false,
    },
    {
      id: 'ESC-781923',
      booking_id: 'BK-781923',
      customer: 'Trần Minh Hoàng',
      photographer: 'Lê Bảo Visuals',
      gross: 220000,
      fee_rate: '4.0%',
      net_payout: 211200,
      status: 'REVIEW_WINDOW',
      status_label: 'Đang đếm ngược 48h kiểm duyệt',
      hours_remaining: '34 giờ còn lại',
      can_release: false,
    },
    {
      id: 'ESC-512984',
      booking_id: 'BK-512984',
      customer: 'Phạm Phương Thảo',
      photographer: 'Thảo Nguyên Photo',
      gross: 800000,
      fee_rate: '9.0%',
      net_payout: 728000,
      status: 'RELEASE_ELIGIBLE',
      status_label: 'Đã hết 48h • Đủ điều kiện giải ngân',
      hours_remaining: '0 giờ (Đủ điều kiện)',
      can_release: true,
    },
    {
      id: 'ESC-651209',
      booking_id: 'BK-651209',
      customer: 'Võ Mai Anh',
      photographer: 'Hoàng Nam Sunset',
      gross: 1100000,
      fee_rate: '0.0%',
      net_payout: 1100000,
      status: 'DISPUTED',
      status_label: 'ĐANG ĐÓNG BĂNG • Tranh chấp mở',
      hours_remaining: 'Tạm dừng vì có khiếu nại',
      can_release: false,
    }
  ])

  const handleExecuteRelease = (id: string) => {
    setRecords(records.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'RELEASED',
          status_label: '✓ Đã giải ngân thành công',
          can_release: false,
        }
      }
      return r
    }))
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản Trị Ký Quỹ Escrow & Giải Ngân Tự Động
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cơ chế bảo vệ thanh toán 48 giờ • Tự động đóng băng khi có khiếu nại chưa giải quyết
          </p>
        </div>

        <Badge variant="verified" className="self-start sm:self-auto py-1 px-3">
          Escrow Daemon Active
        </Badge>
      </div>

      {/* Escrow Rule Summary Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="space-y-1">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Quy tắc 1</span>
          <p className="font-bold text-sm text-violet-300">Đồng hồ 48 giờ tin cậy</p>
          <p className="text-slate-300 leading-relaxed">
            Chỉ bắt đầu tính sau khi thợ tải đủ ảnh lên hệ thống và khách nhận được thông báo.
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Quy tắc 2</span>
          <p className="font-bold text-sm text-rose-300">Đóng băng khi có tranh chấp</p>
          <p className="text-slate-300 leading-relaxed">
            Bất kỳ khiếu nại hợp lệ nào được mở sẽ lập tức khóa nút giải ngân cho đến khi Admin ra phán quyết.
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Quy tắc 3</span>
          <p className="font-bold text-sm text-emerald-300">Giải ngân theo sổ cái bất biến</p>
          <p className="text-slate-300 leading-relaxed">
            Tất cả giao dịch thanh toán đều ghi log kiểm toán (Audit Trail) và snapshot tỷ lệ hoa hồng cố định.
          </p>
        </div>
      </div>

      {/* Escrow Records Table */}
      <Card className="rounded-3xl border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base mb-4">Các Giao Dịch Ký Quỹ Đang Được Theo Dõi</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-bold">Mã Escrow</th>
                <th className="pb-3 font-bold">Khách Hàng / Thợ</th>
                <th className="pb-3 font-bold">Tổng Đơn</th>
                <th className="pb-3 font-bold">Hoa Hồng</th>
                <th className="pb-3 font-bold">Thù Lao Rút</th>
                <th className="pb-3 font-bold">Thời Gian Còn</th>
                <th className="pb-3 font-bold">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="py-3.5 font-mono text-slate-400">{r.id}</td>
                  <td className="py-3.5">
                    <p className="font-bold text-slate-900">{r.customer}</p>
                    <p className="text-[11px] text-slate-400">→ {r.photographer}</p>
                  </td>
                  <td className="py-3.5 font-bold">{formatVND(r.gross)}</td>
                  <td className="py-3.5">{r.fee_rate}</td>
                  <td className="py-3.5 font-black text-emerald-600">{formatVND(r.net_payout)}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      r.status === 'DISPUTED'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : r.status === 'RELEASE_ELIGIBLE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {r.hours_remaining}
                    </span>
                  </td>
                  <td className="py-3.5">
                    {r.can_release ? (
                      <Button
                        size="sm"
                        onClick={() => handleExecuteRelease(r.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold h-8"
                      >
                        <Unlock className="w-3.5 h-3.5 mr-1" />
                        Giải ngân
                      </Button>
                    ) : r.status === 'RELEASED' ? (
                      <span className="text-emerald-600 font-bold text-[11px]">✓ Đã giải ngân</span>
                    ) : (
                      <span className="text-slate-400 text-[11px] italic">Đang khóa an toàn</span>
                    )}
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
