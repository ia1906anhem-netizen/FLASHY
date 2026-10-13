'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  getStoredBookings,
  updateStoredBookingStatus,
  type PersistentBooking
} from '@/lib/data/booking-store'

interface EscrowRecord {
  id: string
  booking_id: string
  customer: string
  photographer: string
  gross: number
  fee_rate: string
  net_payout: number
  status: 'HELD_BY_PROVIDER' | 'REVIEW_WINDOW' | 'RELEASE_ELIGIBLE' | 'RELEASED' | 'DISPUTED'
  status_label: string
  hours_remaining: string
  can_release: boolean
}

export default function AdminEscrowPage() {
  const [records, setRecords] = useState<EscrowRecord[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const loadEscrow = () => {
    const bookings = getStoredBookings()
    const mapped: EscrowRecord[] = bookings
      .filter((b) => b.status !== 'CANCELLED')
      .map((b) => {
        const net = Math.round(b.total_amount * 0.85)
        const num = (b.booking_number || b.id).replace('BK-', '')

        if (b.status === 'DISPUTED') {
          return {
            id: `ESC-${num}`,
            booking_id: b.id,
            customer: b.customer_name,
            photographer: b.photographer_name,
            gross: b.total_amount,
            fee_rate: '15.0%',
            net_payout: net,
            status: 'DISPUTED',
            status_label: 'ĐANG ĐÓNG BĂNG • Tranh chấp mở',
            hours_remaining: 'Tạm dừng vì có khiếu nại',
            can_release: false,
          }
        }

        if (b.status === 'COMPLETED' || b.status === 'ACCEPTED') {
          return {
            id: `ESC-${num}`,
            booking_id: b.id,
            customer: b.customer_name,
            photographer: b.photographer_name,
            gross: b.total_amount,
            fee_rate: '15.0%',
            net_payout: net,
            status: 'RELEASED',
            status_label: '✓ Đã giải ngân thành công',
            hours_remaining: '0 giờ (Đã hoàn tất)',
            can_release: false,
          }
        }

        if (b.status === 'PHOTOS_DELIVERED') {
          return {
            id: `ESC-${num}`,
            booking_id: b.id,
            customer: b.customer_name,
            photographer: b.photographer_name,
            gross: b.total_amount,
            fee_rate: '15.0%',
            net_payout: net,
            status: 'RELEASE_ELIGIBLE',
            status_label: 'Đang trong cửa sổ duyệt 48h',
            hours_remaining: 'Đủ điều kiện giải ngân',
            can_release: true,
          }
        }

        return {
          id: `ESC-${num}`,
          booking_id: b.id,
          customer: b.customer_name,
          photographer: b.photographer_name,
          gross: b.total_amount,
          fee_rate: '15.0%',
          net_payout: net,
          status: 'HELD_BY_PROVIDER',
          status_label: 'Tiền đã khóa • Đang chuẩn bị chụp',
          hours_remaining: 'Chờ giao ảnh',
          can_release: false,
        }
      })

    setRecords(mapped)
    setIsLoaded(true)
  }

  useEffect(() => {
    loadEscrow()
    window.addEventListener('flashy_bookings_updated', loadEscrow)
    window.addEventListener('flashy_admin_updated', loadEscrow)
    window.addEventListener('storage', loadEscrow)
    return () => {
      window.removeEventListener('flashy_bookings_updated', loadEscrow)
      window.removeEventListener('flashy_admin_updated', loadEscrow)
      window.removeEventListener('storage', loadEscrow)
    }
  }, [])

  const handleExecuteRelease = (bookingId: string) => {
    updateStoredBookingStatus(bookingId, 'COMPLETED')
  }

  const totalHeld = records
    .filter((r) => r.status !== 'RELEASED')
    .reduce((sum, r) => sum + r.gross, 0)

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

        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-sm">
            Đang giữ ký quỹ: <span className="font-bold text-amber-600">{formatVND(totalHeld)}</span>
          </div>
          <Badge variant="verified" className="self-start sm:self-auto py-1 px-3">
            Escrow Daemon Active
          </Badge>
        </div>
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
          {records.length === 0 ? (
            <div className="py-14 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">Chưa có giao dịch ký quỹ Escrow nào (Clean Slate)</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Hệ thống chưa có khoản tiền ký quỹ nào đang giữ. Khi có khách hàng đặt lịch chụp thật, số tiền ký quỹ và cơ chế bảo vệ 48h sẽ tự động kích hoạt tại đây.
              </p>
            </div>
          ) : (
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
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          r.status === 'DISPUTED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : r.status === 'RELEASE_ELIGIBLE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {r.hours_remaining}
                      </span>
                    </td>
                    <td className="py-3.5">
                      {r.can_release ? (
                        <Button
                          size="sm"
                          onClick={() => handleExecuteRelease(r.booking_id)}
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
          )}
        </div>
      </Card>
    </div>
  )
}
