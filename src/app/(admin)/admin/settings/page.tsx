'use client'

import { useState } from 'react'
import {
  Settings,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Save,
  FileText,
  AlertTriangle,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function AdminSettingsPage() {
  const [depositPct, setDepositPct] = useState('30')
  const [reviewHours, setReviewHours] = useState('48')
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Cài Đặt Hệ Thống & Kiểm Tra Pháp Lý
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tham số cốt lõi của nền tảng và danh mục hồ sơ tuân thủ pháp luật Việt Nam
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Đã lưu thành công các thiết lập hệ thống!</span>
        </div>
      )}

      {/* Booking Parameters Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <Card className="rounded-3xl border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-600" />
            Tham Số Giao Dịch & Ký Quỹ Escrow
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tỷ lệ tiền cọc bắt buộc (%)</label>
              <Input
                type="number"
                min="10"
                max="100"
                value={depositPct}
                onChange={(e) => setDepositPct(e.target.value)}
                className="rounded-xl h-10 font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">Mặc định: 30% giá trị gói</p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Thời hạn cửa sổ kiểm duyệt ảnh (Giờ)</label>
              <Input
                type="number"
                min="24"
                max="168"
                value={reviewHours}
                onChange={(e) => setReviewHours(e.target.value)}
                className="rounded-xl h-10 font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">Mặc định chuẩn Escrow: 48 Giờ</p>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
            <Button type="submit" className="bg-brand hover:opacity-90 rounded-xl font-bold text-xs h-10 px-6 text-white">
              <Save className="w-4 h-4 mr-1" /> Lưu cài đặt
            </Button>
          </div>
        </Card>
      </form>

      {/* Ministry of Industry and Trade & Legal Compliance Checklist (Section 17) */}
      <Card className="rounded-3xl border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">Danh Mục Hồ Sơ Pháp Lý Sàn TMĐT (online.gov.vn)</h3>
          </div>
          <Badge variant="outline" className="border-amber-400 text-amber-700 text-[10px]">
            Chuẩn bị thủ tục Bộ Công Thương
          </Badge>
        </div>

        <div className="space-y-3 text-xs">
          {[
            {
              title: 'Đăng ký Đề án cung cấp dịch vụ Sàn Thương mại điện tử',
              authority: 'Bộ Công Thương (Cổng online.gov.vn)',
              status: 'Sẵn sàng nộp hồ sơ',
              done: true
            },
            {
              title: 'Quy chế hoạt động sàn TMĐT & Thỏa thuận dịch vụ nhiếp ảnh',
              authority: 'Nghị định 52/2013/NĐ-CP & Nghị định 85/2021/NĐ-CP',
              status: 'Đã hoàn thiện văn bản',
              done: true
            },
            {
              title: 'Hồ sơ đánh giá tác động xử lý dữ liệu cá nhân (DPIA)',
              authority: 'Cục An ninh mạng A05 - Bộ Công An (Luật 91/2025/QH15 & NĐ 356/2025/NĐ-CP)',
              status: 'Đã lập danh mục bảo vệ dữ liệu',
              done: true
            },
            {
              title: 'Hợp đồng liên kết dịch vụ trung gian thanh toán và tài khoản ủy thác',
              authority: 'Ngân hàng Nhà nước Việt Nam (Nghị định 52/2024/NĐ-CP)',
              status: 'Đang vận hành Sandbox',
              done: false
            }
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">{item.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.authority}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                item.done ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </Card>

    </div>
  )
}
