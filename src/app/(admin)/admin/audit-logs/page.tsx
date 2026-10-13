'use client'

import { useState, useEffect } from 'react'
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
  Layers,
  History
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface AuditLogItem {
  id: string
  timestamp: string
  actor: string
  role: string
  category: 'SECURITY' | 'FINANCE' | 'KYC' | 'DISPUTE'
  action: string
  target: string
  ip_address: string
  details: string
  status: 'SUCCESS' | 'BLOCKED'
}

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'SECURITY' | 'FINANCE' | 'KYC' | 'DISPUTE'>('all')
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const loadLogs = () => {
    try {
      const raw = localStorage.getItem('flashy_audit_logs')
      if (raw) {
        setLogs(JSON.parse(raw))
      } else {
        setLogs([])
      }
    } catch {
      setLogs([])
    }
    setIsLoaded(true)
  }

  useEffect(() => {
    loadLogs()
    window.addEventListener('flashy_admin_updated', loadLogs)
    window.addEventListener('storage', loadLogs)
    return () => {
      window.removeEventListener('flashy_admin_updated', loadLogs)
      window.removeEventListener('storage', loadLogs)
    }
  }, [])

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

  const financeCount = logs.filter((l) => l.category === 'FINANCE').length
  const kycCount = logs.filter((l) => l.category === 'KYC').length
  const securityCount = logs.filter((l) => l.category === 'SECURITY' && l.status === 'BLOCKED').length

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
            <p className="text-xs text-slate-500 font-medium">Tổng số sự kiện</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{logs.length}</p>
            <span className="text-[11px] text-emerald-600 font-medium">100% được ghi nhận bất biến</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Hành động tài chính</p>
            <p className="text-2xl font-bold text-violet-600 mt-1">{financeCount}</p>
            <span className="text-[11px] text-slate-500">Ký quỹ, giải ngân, hoàn tiền</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Thao tác duyệt KYC</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{kycCount}</p>
            <span className="text-[11px] text-slate-500">Có chữ ký số kiểm duyệt</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Cảnh báo bảo mật / Chặn IP</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{securityCount} vụ</p>
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
          {logs.length === 0 ? (
            <div className="py-14 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 m-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
                <History className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">Chưa có bản ghi nhật ký kiểm toán nào (Clean Slate)</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Hệ thống chưa có hành động quản trị phát sinh. Mọi thao tác (duyệt KYC, giải ngân, xử lý tranh chấp, đổi quyền...) sẽ được ghi lại tự động tại đây.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              Không tìm thấy bản ghi nhật ký nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
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
          )}
        </div>
      </Card>
    </div>
  )
}
