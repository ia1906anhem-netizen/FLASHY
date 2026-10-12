'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  User,
  Clock,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AdminKycPage() {
  const [applications, setApplications] = useState([
    {
      id: 'KYC-8921',
      photographer_name: 'Lê Hoàng Nam (NamSunset)',
      email: 'nam.sunset@example.com',
      phone: '0912••••89',
      submitted_at: '12/04/2026 09:30',
      id_number: '0792••••1928',
      district: 'TP. Thủ Đức',
      status: 'PENDING_REVIEW',
      sample_doc_front: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500',
      sample_portrait: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
      equipment: 'Sony A7R IV, 24-70 GM',
    },
    {
      id: 'KYC-8712',
      photographer_name: 'Vũ Đức Anh (AnhFilm)',
      email: 'ducanh.film@example.com',
      phone: '0938••••45',
      submitted_at: '11/04/2026 14:10',
      id_number: '0790••••4431',
      district: 'Quận 5',
      status: 'PENDING_REVIEW',
      sample_doc_front: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
      sample_portrait: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
      equipment: 'Nikon Z6 II, Leica M6',
    }
  ])

  const handleDecision = (id: string, decision: 'VERIFIED' | 'REJECTED') => {
    setApplications(applications.map(app => {
      if (app.id === id) {
        return { ...app, status: decision }
      }
      return app
    }))
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Kiểm Duyệt Định Danh Nhiếp Ảnh Gia (KYC)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Quy trình thẩm định hồ sơ theo Nghị định TMĐT • Không công khai tài liệu nhận diện nhạy cảm
        </p>
      </div>

      {/* KYC Alert Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-bold">Môi trường thử nghiệm bảo mật (Synthetic Verification Fixtures):</p>
          <p className="text-amber-800 leading-relaxed mt-0.5">
            Các hồ sơ dưới đây sử dụng dữ liệu giả lập được tạo riêng cho mục đích thẩm duyệt luồng nghiệp vụ. Trong môi trường thương mại, dữ liệu CCCD được mã hóa đầu cuối và chỉ quản trị viên có thẩm quyền mới được truy cập để đối soát.
          </p>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.map((app) => (
          <Card key={app.id} className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">{app.photographer_name}</h3>
                  <span className="font-mono text-xs text-slate-400">#{app.id}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Email: {app.email} • Khu vực: {app.district} • Nộp lúc: {app.submitted_at}
                </p>
              </div>

              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  app.status === 'VERIFIED'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : app.status === 'REJECTED'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {app.status === 'VERIFIED' ? '✓ Đã duyệt thành công' : app.status === 'REJECTED' ? '✕ Đã từ chối' : 'Chờ kiểm duyệt'}
                </span>
              </div>
            </div>

            {/* Evidence previews */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 text-xs">
              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">Ảnh giấy tờ tùy thân (Mặt trước):</span>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <Image src={app.sample_doc_front} alt="CCCD" fill className="object-cover blur-[1px] hover:blur-none transition-all" />
                </div>
                <p className="text-[10px] text-slate-400 font-mono">CCCD: {app.id_number}</p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">Ảnh chân dung đối soát:</span>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <Image src={app.sample_portrait} alt="Chân dung" fill className="object-cover" />
                </div>
                <p className="text-[10px] text-slate-400">Đối chiếu tỷ lệ trùng khớp: 98.5%</p>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-slate-700 block">Thiết bị hành nghề:</span>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                  <p className="font-semibold">{app.equipment}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Đủ tiêu chuẩn phục vụ gói dịch vụ cơ bản và nâng cao.</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {app.status === 'PENDING_REVIEW' && (
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <Button
                  onClick={() => handleDecision(app.id, 'REJECTED')}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 h-9"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Từ chối hồ sơ
                </Button>
                <Button
                  onClick={() => handleDecision(app.id, 'VERIFIED')}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold h-9"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Phê duyệt & Cấp huy hiệu Verified
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

    </div>
  )
}
