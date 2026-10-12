'use client'

import { useState } from 'react'
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  User,
  Key,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'SECURITY' | 'FINANCE' | 'KYC' | 'DISPUTE'>('all')

  const logs = [
    {
      id: 'AUD-9012',
      timestamp: '12/04/2026 10:45:12',
      actor: 'admin@flashy.vn',
      role: 'SUPER_ADMIN',
      category: 'FINANCE',
      action: 'RELEASE_ESCROW_MANUAL',
      target: 'Booking BK-892104',
      ip_address: '14.232.208.115',
      details: 'Giải ngân nhuận bút 658,000 VND cho thợ Trần Minh Trí sau khi kết thúc 48h xem xét và khách xác nhận đạt chuẩn.',
      status: 'SUCCESS',
    },
    {
      id: 'AUD-9011',
      timestamp: '12/04/2026 09:12:04',
      actor: 'kyc-reviewer@flashy.vn',
      role: 'KYC_OFFICER',
      category: 'KYC',
      action: 'APPROVE_KYC_IDENTITY',
      target: 'Photographer PHT-01 (Trần Minh Trí)',
      ip_address: '113.161.72.4',
      details: 'Phê duyệt thẻ CCCD số 079093xxxxxx và ảnh chân dung đối chiếu hợp lệ.',
      status: 'SUCCESS',
    },
    {
      id: 'AUD-9010',
      timestamp: '11/04/2026 16:30:22',
      actor: 'moderator@flashy.vn',
      role: 'MODERATOR',
      category: 'SECURITY',
      action: 'SUSPEND_USER_ACCOUNT',
      target: 'User USR-09 (Lê Văn An)',
      ip_address: '14.169.12.89',
      details: 'Khóa tài khoản 14 ngày do vi phạm điều khoản dẫn dụ thanh toán ngoài sàn.',
      status: 'SUCCESS',
    },
    {
      id: 'AUD-9009',
      timestamp: '11/04/2026 14:15:00',
      actor: 'system-scheduler@internal',
      role: 'SYSTEM_JOB',
      category: 'FINANCE',
      action: 'AUTO_ESCROW_RELEASE_CRON',
      target: 'Batch 12 Bookings',
      ip_address: '10.0.4.12',
      details: 'Tiến trình định kỳ quét 12 đơn đủ điều kiện qua 48h không khiếu nại, chuyển trạng thái sang RELEASE_ELIGIBLE.',
      status: 'SUCCESS',
    },
    {
      id: 'AUD-9008',
      timestamp: '10/04/2026 11:20:44',
      actor: 'admin@flashy.vn',
      role: 'SUPER_ADMIN',
      category: 'DISPUTE',
      action: 'RESOLVE_DISPUTE_REFUND',
      target: 'Dispute DSP-108 (Booking BK-7721)',
      ip_address: '14.232.208.115',
      details: 'Hoàn tiền 100% (550,000 VND) về thẻ khách do thợ vắng mặt không lý do chính đáng.',
      status: 'SUCCESS',
    },
    {
      id: 'AUD-9007',
      timestamp: '09/04/2026 08:05:19',
      actor: 'anonymous@185.220.101.5',
      role: 'PUBLIC',
      category: 'SECURITY',
      action: 'FAILED_ADMIN_LOGIN_ATTEMPT',
      target: '/admin/login',
      ip_address: '185.220.101.5',
      details: 'Sai mật khẩu 5 lần liên tiếp. Hệ thống tự động chặn IP trong 15 phút theo chính sách Rate-limit.',
      status: 'BLOCKED',
    },
  ]

  const filtered = logs.filter((log) => {
    const matchSearch =
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.ip_address.includes(search)
    if (categoryFilter === 'all') return matchSearch
    return matchSearch && log.category === categoryFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Nhật ký Kiểm toán (Audit Logs)</h1>
          <p className="text-slate-500 text-sm mt-1">
            Ghi chép bất biến mọi hành động quản trị viên, giải ngân ký quỹ Escrow, duyệt CCCD và sự kiện bảo mật
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Nhật ký 30 ngày qua</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">1,420</p>
            <span className="text-[11px] text-emerald-600 font-medium">100% được ghi nhận bất biến</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Hành động tài chính</p>
            <p className="text-2xl font-bold text-violet-600 mt-1">318</p>
            <span className="text-[11px] text-slate-500">Ký quỹ, giải ngân, hoàn tiền</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Thao tác duyệt KYC</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">84</p>
            <span className="text-[11px] text-slate-500">Có chữ ký số kiểm duyệt</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Cảnh báo bảo mật / Chặn IP</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">7 vụ</p>
            <span className="text-[11px] text-slate-500">Đã kích hoạt phòng vệ WAF</span>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo Actor, Action, Đối tượng, IP..."
            className="pl-9 bg-white"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'FINANCE', 'KYC', 'SECURITY', 'DISPUTE'] as const).map((mode) => (
            <Button
              key={mode}
              variant={categoryFilter === mode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(mode)}
              className={categoryFilter === mode ? 'bg-violet-600 text-white' : 'text-slate-600'}
            >
              {mode === 'all'
                ? 'Tất cả'
                : mode === 'FINANCE'
                ? 'Tài chính / Escrow'
                : mode === 'KYC'
                ? 'Hồ sơ KYC'
                : mode === 'SECURITY'
                ? 'Bảo mật'
                : 'Khiếu nại'}
            </Button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <Card className="border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase border-b border-slate-200">
                <th className="p-4">Thời gian & Mã log</th>
                <th className="p-4">Tác nhân (Actor)</th>
                <th className="p-4">Hành động & Phân loại</th>
                <th className="p-4">Đối tượng tác động</th>
                <th className="p-4">Chi tiết thao tác</th>
                <th className="p-4">IP & Kết quả</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-mono text-slate-900 font-bold">{log.timestamp}</p>
                    <p className="font-mono text-[10px] text-slate-400">{log.id}</p>
                  </td>

                  <td className="p-4">
                    <p className="font-semibold text-slate-800">{log.actor}</p>
                    <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 mt-0.5">
                      {log.role}
                    </Badge>
                  </td>

                  <td className="p-4">
                    <p className="font-mono font-bold text-violet-700">{log.action}</p>
                    <Badge
                      className={`text-[10px] mt-0.5 ${
                        log.category === 'FINANCE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : log.category === 'KYC'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : log.category === 'SECURITY'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {log.category}
                    </Badge>
                  </td>

                  <td className="p-4">
                    <p className="font-medium text-slate-900">{log.target}</p>
                  </td>

                  <td className="p-4 max-w-xs">
                    <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                      {log.details}
                    </p>
                  </td>

                  <td className="p-4">
                    <p className="font-mono text-[11px] text-slate-500">{log.ip_address}</p>
                    {log.status === 'SUCCESS' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-0.5">
                        <CheckCircle2 className="h-3 w-3" /> Thành công
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-semibold mt-0.5">
                        <AlertCircle className="h-3 w-3" /> Đã chặn
                      </span>
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
