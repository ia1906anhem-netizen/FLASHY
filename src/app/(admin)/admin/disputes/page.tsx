'use client'

import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  ShieldCheck,
  MessageCircle,
  ArrowRight,
  User,
  DollarSign
} from 'lucide-react'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  getDisputes,
  saveDisputes,
  updateStoredBookingStatus,
  type DisputeRecord
} from '@/lib/data/booking-store'

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeRecord[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const loadDisputes = () => {
    const list = getDisputes()
    setDisputes(list)
    setIsLoaded(true)
  }

  useEffect(() => {
    loadDisputes()
    window.addEventListener('flashy_admin_updated', loadDisputes)
    window.addEventListener('flashy_bookings_updated', loadDisputes)
    window.addEventListener('storage', loadDisputes)
    return () => {
      window.removeEventListener('flashy_admin_updated', loadDisputes)
      window.removeEventListener('flashy_bookings_updated', loadDisputes)
      window.removeEventListener('storage', loadDisputes)
    }
  }, [])

  const handleResolve = (
    id: string,
    decision: 'RESOLVED_FOR_CUSTOMER' | 'RESOLVED_FOR_PHOTOGRAPHER'
  ) => {
    const target = disputes.find((d) => d.id === id)
    if (target && target.booking_id) {
      if (decision === 'RESOLVED_FOR_CUSTOMER') {
        updateStoredBookingStatus(target.booking_id, 'CANCELLED')
      } else {
        updateStoredBookingStatus(target.booking_id, 'COMPLETED')
      }
    }

    const updated = disputes.map((d) => {
      if (d.id === id) {
        return { ...d, status: decision }
      }
      return d
    })
    setDisputes(updated)
    saveDisputes(updated)
  }

  const openCount = disputes.filter((d) => d.status === 'OPEN').length

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Trung Tâm Trọng Tài & Xử Lý Khiếu Nại (Dispute Resolution)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Thẩm định bằng chứng và ra phán quyết hoàn tiền hoặc giải ngân theo quy chế sàn
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-sm">
          Khiếu nại đang mở: <span className="font-bold text-rose-600">{openCount}</span> / {disputes.length}
        </div>
      </div>

      <div className="space-y-4">
        {disputes.length === 0 ? (
          <Card className="rounded-3xl border-slate-200 bg-white p-14 text-center shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Không có tranh chấp nào (Clean Slate)</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Hệ thống hiện tại hoàn toàn không có khiếu nại hay tranh chấp tồn đọng. Khi khách hàng hoặc thợ chụp gửi phản ánh, phiên phân xử sẽ xuất hiện ngay tại đây.
            </p>
          </Card>
        ) : (
          disputes.map((d) => (
            <Card key={d.id} className="rounded-3xl border-slate-200 bg-white p-6 md:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      #{d.id}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{d.reason_label}</h3>
                    <span className="text-xs text-slate-400 font-mono">Đơn #{d.booking_id}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Khách: <strong>{d.customer_name}</strong> • Thợ: <strong>{d.photographer_name}</strong> • Gói: {d.package} ({formatVND(d.booking_amount)})
                  </p>
                </div>

                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      d.status === 'OPEN'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                        : d.status === 'RESOLVED_FOR_CUSTOMER'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-violet-50 text-violet-700 border border-violet-200'
                    }`}
                  >
                    {d.status === 'OPEN'
                      ? '● Đang mở • Chờ trọng tài'
                      : d.status === 'RESOLVED_FOR_CUSTOMER'
                      ? '✓ Phán quyết: Hoàn tiền cho khách'
                      : '✓ Phán quyết: Giải ngân cho thợ'}
                  </span>
                </div>
              </div>

              {/* Dispute Content */}
              <div className="py-4 space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700">
                  <span className="font-bold block mb-1 text-slate-900">Nội dung khiếu nại của khách:</span>
                  <p className="leading-relaxed">{d.description}</p>
                </div>

                {d.evidence && (
                  <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200 text-amber-900">
                    <span className="font-bold block mb-0.5">Bằng chứng ghi nhận:</span>
                    <p className="text-[11px] text-amber-800">{d.evidence}</p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {d.status === 'OPEN' && (
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                  <Button
                    onClick={() => handleResolve(d.id, 'RESOLVED_FOR_PHOTOGRAPHER')}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs font-bold border-violet-200 text-violet-700 hover:bg-violet-50 h-9"
                  >
                    Bác bỏ khiếu nại • Giải ngân cho Thợ
                  </Button>
                  <Button
                    onClick={() => handleResolve(d.id, 'RESOLVED_FOR_CUSTOMER')}
                    size="sm"
                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold h-9"
                  >
                    Chấp thuận • Hoàn 100% tiền cho Khách
                  </Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
