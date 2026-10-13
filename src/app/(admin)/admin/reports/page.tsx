'use client'

import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  UserX,
  FileText,
  Clock,
  Filter,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface ReportItem {
  id: string
  type: string
  title: string
  reporter: string
  reported: string
  date: string
  description: string
  evidence: string
  status: 'PENDING' | 'RESOLVED'
  resolution?: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'
}

export default function AdminReportsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'RESOLVED'>('all')
  const [reports, setReports] = useState<ReportItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const loadReports = () => {
    try {
      const raw = localStorage.getItem('flashy_admin_reports')
      if (raw) {
        setReports(JSON.parse(raw))
      } else {
        setReports([])
      }
    } catch {
      setReports([])
    }
    setIsLoaded(true)
  }

  useEffect(() => {
    loadReports()
    window.addEventListener('flashy_admin_updated', loadReports)
    window.addEventListener('storage', loadReports)
    return () => {
      window.removeEventListener('flashy_admin_updated', loadReports)
      window.removeEventListener('storage', loadReports)
    }
  }, [])

  const saveReports = (updated: ReportItem[]) => {
    setReports(updated)
    try {
      localStorage.setItem('flashy_admin_reports', JSON.stringify(updated))
    } catch {}
  }

  const resolveReport = (id: string, actionNote: string) => {
    const updated = reports.map((r) =>
      r.id === id
        ? {
            ...r,
            status: 'RESOLVED' as const,
            resolution: actionNote,
          }
        : r
    )
    saveReports(updated)
  }

  const filtered = reports.filter((r) => {
    const matchSearch =
      r.reporter.toLowerCase().includes(search.toLowerCase()) ||
      r.reported.toLowerCase().includes(search.toLowerCase()) ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
    if (statusFilter === 'all') return matchSearch
    return matchSearch && r.status === statusFilter
  })

  const pendingCount = reports.filter((r) => r.status === 'PENDING').length
  const criticalCount = reports.filter((r) => r.status === 'PENDING' && r.severity === 'CRITICAL').length
  const offPlatformCount = reports.filter((r) => r.type === 'OFF_PLATFORM_PAYMENT').length
  const resolvedCount = reports.filter((r) => r.status === 'RESOLVED').length
  const resolutionRate = reports.length > 0 ? ((resolvedCount / reports.length) * 100).toFixed(1) + '%' : '100%'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Báo cáo Vi phạm & Gian lận</h1>
          <p className="text-slate-500 text-sm mt-1">
            Xử lý khiếu nại vi phạm chính sách giao dịch ngoài sàn, hành vi ứng xử và gian lận lịch hẹn
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Báo cáo chờ xử lý</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{pendingCount}</p>
            <span className="text-[11px] text-rose-700 font-medium">
              {criticalCount > 0 ? `${criticalCount} mức độ nghiêm trọng` : 'Không có vụ gấp'}
            </span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Vi phạm ngoài sàn (Anti-churn)</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{offPlatformCount} vụ</p>
            <span className="text-[11px] text-slate-500">Giám sát tự động</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Đã giải quyết xong</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{resolvedCount}</p>
            <span className="text-[11px] text-slate-500">Tỷ lệ xử lý: {resolutionRate}</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Tổng số hồ sơ</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{reports.length}</p>
            <span className="text-[11px] text-slate-500">Hệ thống an toàn</span>
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
            placeholder="Tìm theo người báo cáo, người bị tố cáo, nội dung..."
            className="pl-9 bg-white"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'PENDING', 'RESOLVED'] as const).map((mode) => (
            <Button
              key={mode}
              variant={statusFilter === mode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(mode)}
              className={statusFilter === mode ? 'bg-violet-600 text-white' : 'text-slate-600'}
            >
              {mode === 'all' ? 'Tất cả' : mode === 'PENDING' ? 'Chưa xử lý' : 'Đã xong'}
            </Button>
          ))}
        </div>
      </div>

      {/* Report Cards */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <Card className="border-slate-200 bg-white p-14 text-center rounded-3xl shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Không có báo cáo vi phạm nào (Clean Slate)</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Hệ thống hiện tại sạch sẽ và không có bất kỳ tố cáo nào về lôi kéo giao dịch ngoài sàn hay hành vi tiêu cực.
            </p>
          </Card>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            Không tìm thấy báo cáo nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          filtered.map((rep) => (
            <Card key={rep.id} className="border-slate-200 overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">{rep.id}</span>
                    <Badge
                      className={`text-xs ${
                        rep.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}
                    >
                      {rep.title}
                    </Badge>
                    <span className="text-xs text-slate-400 font-mono">• {rep.date}</span>
                  </div>

                  <div>
                    {rep.status === 'PENDING' ? (
                      <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-xs">
                        Đang chờ can thiệp
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                        Đã giải quyết
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500">Người báo cáo:</span>
                    <p className="font-semibold text-slate-900 mt-0.5">{rep.reporter}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-100">
                    <span className="text-rose-700 font-medium">Bị tố cáo:</span>
                    <p className="font-bold text-rose-900 mt-0.5">{rep.reported}</p>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-semibold text-slate-800">Chi tiết phản ánh:</p>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {rep.description}
                  </p>
                  {rep.evidence && (
                    <p className="text-[11px] text-slate-400 pt-1">
                      Bằng chứng kèm theo: <span className="text-violet-600 font-medium">{rep.evidence}</span>
                    </p>
                  )}
                </div>

                {rep.status === 'RESOLVED' && rep.resolution && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                    <p className="font-bold flex items-center gap-1.5 mb-0.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Biện pháp xử lý của Ban Quản Trị:
                    </p>
                    <p>{rep.resolution}</p>
                  </div>
                )}

                {rep.status === 'PENDING' && (
                  <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        resolveReport(
                          rep.id,
                          'Đã gửi cảnh cáo văn bản tới thợ ảnh và yêu cầu hoàn cọc cho khách.'
                        )
                      }
                      className="text-xs text-amber-700 hover:bg-amber-50"
                    >
                      Gửi cảnh cáo & Khắc phục
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        resolveReport(
                          rep.id,
                          'Đã đình chỉ tài khoản thợ ảnh 14 ngày theo quy định chống lôi kéo ngoài sàn.'
                        )
                      }
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs gap-1.5"
                    >
                      <UserX className="h-3.5 w-3.5" />
                      Tạm khóa tài khoản
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
