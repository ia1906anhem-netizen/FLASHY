'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  User,
  Clock,
  ExternalLink,
  ShieldAlert
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  addOrUpdateApprovedProvider,
  removeApprovedProvider,
  getKycApplications,
  saveKycApplications,
  type KycApplication
} from '@/lib/data/booking-store'

export default function AdminKycPage() {
  const [applications, setApplications] = useState<KycApplication[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const loadKyc = () => {
    setApplications(getKycApplications())
    setIsLoaded(true)
  }

  useEffect(() => {
    loadKyc()
    window.addEventListener('flashy_admin_updated', loadKyc)
    window.addEventListener('storage', loadKyc)
    return () => {
      window.removeEventListener('flashy_admin_updated', loadKyc)
      window.removeEventListener('storage', loadKyc)
    }
  }, [])

  const handleDecision = (id: string, decision: 'VERIFIED' | 'REJECTED') => {
    const updated = applications.map((app) => {
      if (app.id === id) {
        if (decision === 'VERIFIED') {
          addOrUpdateApprovedProvider({
            id: app.id,
            name: app.photographer_name,
            avatar: app.sample_portrait || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
            cover: app.sample_doc_front || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600',
            location: `${app.district || 'Hồ Chí Minh'}, TP. Hồ Chí Minh`,
            district: app.district || 'Hồ Chí Minh',
            city: 'Hồ Chí Minh',
            specialty: 'Portrait · Vintage Street',
            rating: 5.0,
            reviews: 0,
            starting_price: 150000,
            is_verified: true,
            kyc_status: 'VERIFIED',
            badge: '⭐ Đã duyệt KYC',
          })
        } else {
          removeApprovedProvider(app.id)
        }
        return { ...app, status: decision }
      }
      return app
    })
    setApplications(updated)
    saveKycApplications(updated)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Kiểm Duyệt Định Danh Nhiếp Ảnh Gia (KYC)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quy trình thẩm định hồ sơ theo Nghị định TMĐT • Không công khai tài liệu nhận diện nhạy cảm
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-sm">
          Chờ duyệt: <span className="font-bold text-amber-600">{applications.filter((a) => a.status === 'PENDING_REVIEW').length}</span> / {applications.length} hồ sơ
        </div>
      </div>

      {/* KYC Alert Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-bold">Quy trình thẩm định KYC trực tiếp:</p>
          <p className="text-amber-800 leading-relaxed mt-0.5">
            Hồ sơ hiển thị trực tiếp khi thợ chụp ảnh nộp đơn xác minh danh tính. Khi được phê duyệt, tài khoản thợ ảnh sẽ được cấp huy hiệu Verified và hiển thị trên trang chủ & bộ tìm kiếm thợ.
          </p>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.length === 0 ? (
          <Card className="rounded-3xl border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Chưa có hồ sơ KYC nào cần xử lý (Clean Slate)</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Hệ thống hiện không có hồ sơ xác minh danh tính nào tồn đọng. Khi nhiếp ảnh gia đăng ký và gửi hồ sơ CCCD/thiết bị, danh sách sẽ xuất hiện tại đây.
            </p>
          </Card>
        ) : (
          applications.map((app) => (
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
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      app.status === 'VERIFIED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : app.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {app.status === 'VERIFIED'
                      ? '✓ Đã duyệt thành công'
                      : app.status === 'REJECTED'
                      ? '✕ Đã từ chối'
                      : 'Chờ kiểm duyệt'}
                  </span>
                </div>
              </div>

              {/* Evidence previews */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 text-xs">
                <div className="space-y-2">
                  <span className="font-bold text-slate-700 block">Ảnh giấy tờ tùy thân (Mặt trước):</span>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    {app.sample_doc_front ? (
                      <Image
                        src={app.sample_doc_front}
                        alt="CCCD"
                        fill
                        className="object-cover blur-[1px] hover:blur-none transition-all"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">Chưa có ảnh CCCD</div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">CCCD: {app.id_number || 'Chưa cung cấp'}</p>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-slate-700 block">Ảnh chân dung đối soát:</span>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    {app.sample_portrait ? (
                      <Image src={app.sample_portrait} alt="Chân dung" fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400">Chưa có ảnh chân dung</div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">Hồ sơ đối soát tự động</p>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-slate-700 block">Thiết bị hành nghề:</span>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                    <p className="font-semibold">{app.equipment || 'Đang cập nhật thiết bị'}</p>
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
          ))
        )}
      </div>
    </div>
  )
}
