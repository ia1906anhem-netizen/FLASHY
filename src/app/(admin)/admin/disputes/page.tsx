'use client'

import { useState } from 'react'
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
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState([
    {
      id: 'DISP-1029',
      booking_id: 'BK-651209',
      customer_name: 'Võ Mai Anh',
      photographer_name: 'Hoàng Nam Sunset',
      package: 'Outdoor Ngoại cảnh',
      booking_amount: 1100000,
      reason: 'late_delivery',
      reason_label: 'Trễ hạn bàn giao ảnh quá 3 ngày',
      description: 'Gói chụp cam kết trả file sau 5 ngày, nhưng đã 8 ngày kể từ buổi chụp mình vẫn chưa nhận được link tải ảnh.',
      status: 'OPEN',
      created_at: '11/04/2026 16:45',
      evidence: 'Biên lai lịch hẹn 03/04 & Nhật ký trò chuyện nhắc file 2 lần.',
    },
    {
      id: 'DISP-1014',
      booking_id: 'BK-542109',
      customer_name: 'Lê Tuấn Hưng',
      photographer_name: 'Lê Bảo Visuals',
      package: 'Quick Date',
      booking_amount: 220000,
      reason: 'missing_files',
      reason_label: 'Thiếu file chỉnh màu so với cam kết gói',
      description: 'Gói cam kết 15 ảnh màu nhưng thợ chỉ tải 8 ảnh lên hệ thống.',
      status: 'RESOLVED_FOR_CUSTOMER',
      created_at: '05/04/2026 10:20',
      evidence: 'Kiểm tra kho ảnh Supabase xác nhận chỉ có 8 tệp màu.',
    }
  ])

  const handleResolve = (id: string, decision: 'RESOLVED_FOR_CUSTOMER' | 'RESOLVED_FOR_PHOTOGRAPHER') => {
    setDisputes(disputes.map(d => {
      if (d.id === id) {
        return { ...d, status: decision }
      }
      return d
    }))
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Trung Tâm Trọng Tài & Xử Lý Khiếu Nại (Dispute Resolution)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Thẩm định bằng chứng và ra phán quyết hoàn tiền hoặc giải ngân theo quy chế sàn
        </p>
      </div>

      <div className="space-y-4">
        {disputes.map((d) => (
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
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  d.status === 'OPEN'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                    : d.status === 'RESOLVED_FOR_CUSTOMER'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-violet-50 text-violet-700 border border-violet-200'
                }`}>
                  {d.status === 'OPEN'
                    ? 'Tranh chấp đang mở (Escrow đóng băng)'
                    : d.status === 'RESOLVED_FOR_CUSTOMER'
                    ? '✓ Đã giải quyết: Hoàn tiền cho Khách'
                    : '✓ Đã giải quyết: Giải ngân cho Thợ'}
                </span>
              </div>
            </div>

            {/* Complaint details & Evidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 text-xs">
              <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-700 block">Nội dung khiếu nại của khách:</span>
                <p className="text-slate-600 leading-relaxed italic">"{d.description}"</p>
                <p className="text-[10px] text-slate-400 pt-1">Gửi lúc: {d.created_at}</p>
              </div>

              <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-700 block">Bằng chứng đối soát hệ thống:</span>
                <p className="text-slate-600 leading-relaxed">{d.evidence}</p>
                <p className="text-[10px] text-violet-600 font-semibold pt-1">Trạng thái Escrow: Đã tạm dừng giải ngân tự động</p>
              </div>
            </div>

            {/* Adjudication actions */}
            {d.status === 'OPEN' && (
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] text-slate-400">
                  Phán quyết sẽ tự động kích hoạt hoàn tiền qua cổng thanh toán hoặc giải phóng thù lao cho thợ chụp.
                </p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleResolve(d.id, 'RESOLVED_FOR_CUSTOMER')}
                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold h-9"
                  >
                    Hoàn 100% cọc cho khách
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleResolve(d.id, 'RESOLVED_FOR_PHOTOGRAPHER')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold h-9"
                  >
                    Bác khiếu nại & Giải ngân cho thợ
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

    </div>
  )
}
