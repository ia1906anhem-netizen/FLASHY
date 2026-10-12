'use client'

import { useState } from 'react'
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

export default function AdminReportsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'RESOLVED'>('all')

  const [reports, setReports] = useState([
    {
      id: 'REP-2041',
      type: 'OFF_PLATFORM_PAYMENT',
      title: 'Yêu cầu chuyển khoản ngoài sàn',
      reporter: 'Nguyễn Thu Trang (Khách)',
      reported: 'Lê Văn An (Thợ)',
      date: '11/04/2026',
      description:
        'Thợ ảnh nhắn tin qua Zalo đề nghị khách hủy đơn trên Flashy để giảm 50k và chuyển khoản trực tiếp vào tài khoản cá nhân của thợ.',
      evidence: 'Ảnh chụp màn hình tin nhắn chat Zalo',
      status: 'PENDING',
      severity: 'HIGH',
    },
    {
      id: 'REP-2040',
      type: 'NO_SHOW',
      title: 'Thợ không đến điểm hẹn và không nghe máy',
      reporter: 'Trần Minh Hoàng (Khách)',
      reported: 'Ngô Quang Khải (Thợ)',
      date: '10/04/2026',
      description:
        'Đã hẹn tại Bưu điện Q1 lúc 09:00 sáng, khách đợi đến 09:45 nhưng thợ không đến và khóa số điện thoại.',
      evidence: 'Biên bản gọi điện và xác nhận vị trí qua định vị',
      status: 'PENDING',
      severity: 'CRITICAL',
    },
    {
      id: 'REP-2038',
      type: 'HARASSMENT',
      title: 'Bình luận khiếm nhã trong tin nhắn trao đổi',
      reporter: 'Hoàng Yến Nhi (Thợ)',
      reported: 'Phạm Hùng (Khách)',
      date: '06/04/2026',
      description:
        'Khách liên tục gửi tin nhắn tán tỉnh và đề nghị chụp tại phòng riêng không phù hợp với thỏa thuận gói chụp ban đầu.',
      evidence: 'Toàn bộ lịch sử tin nhắn trong ứng dụng',
      status: 'RESOLVED',
      resolution: 'Đã khóa tài khoản khách hàng 30 ngày và hoàn trả lịch hẹn',
      severity: 'HIGH',
    },
  ])

  const resolveReport = (id: string, actionNote: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'RESOLVED',
              resolution: actionNote,
            }
          : r
      )
    )
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
            <p className="text-2xl font-bold text-rose-600 mt-1">2</p>
            <span className="text-[11px] text-rose-700 font-medium">1 mức độ nghiêm trọng</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Vi phạm ngoài sàn (Anti-churn)</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">6 vụ</p>
            <span className="text-[11px] text-slate-500">Tháng này</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Đã giải quyết xong</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">19</p>
            <span className="text-[11px] text-slate-500">Tỷ lệ xử lý: 90.5%</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Tài khoản bị hạn chế</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">3</p>
            <span className="text-[11px] text-slate-500">Khóa tạm thời hoặc vĩnh viễn</span>
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
        {filtered.map((rep) => (
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
                <p className="text-[11px] text-slate-400 pt-1">
                  Bằng chứng kèm theo: <span className="text-violet-600 font-medium">{rep.evidence}</span>
                </p>
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
                    onClick={() => resolveReport(rep.id, 'Đã gửi cảnh cáo văn bản tới thợ ảnh và yêu cầu hoàn cọc cho khách.')}
                    className="text-xs text-amber-700 hover:bg-amber-50"
                  >
                    Gửi cảnh cáo & Khắc phục
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => resolveReport(rep.id, 'Đã đình chỉ tài khoản thợ ảnh 14 ngày theo quy định chống lôi kéo ngoài sàn.')}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs gap-1.5"
                  >
                    <UserX className="h-3.5 w-3.5" />
                    Tạm khóa tài khoản
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
