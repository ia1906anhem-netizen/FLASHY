'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Camera,
  Search,
  ShieldCheck,
  Star,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Award,
  Filter,
  Eye,
  Ban,
  Check,
  Sparkles,
  MapPin,
  UserX
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatVND } from '@/lib/utils'
import {
  getApprovedProviders,
  getRegisteredUsersList,
  getKycApplications,
  getStoredBookings,
  type ApprovedProvider
} from '@/lib/data/booking-store'

interface PhotographerRow {
  id: string
  name: string
  handle: string
  email: string
  phone: string
  avatar: string
  area: string
  specialty: string
  kyc_status: 'VERIFIED' | 'PENDING_REVIEW' | 'NOT_SUBMITTED' | 'REJECTED'
  rating: number
  completed_shoots: number
  gross_earnings: number
  badges: string[]
  is_active: boolean
}

export default function AdminPhotographersPage() {
  const [search, setSearch] = useState('')
  const [kycFilter, setKycFilter] = useState<'all' | 'VERIFIED' | 'PENDING_REVIEW' | 'NOT_SUBMITTED' | 'REJECTED'>('all')
  const [photographers, setPhotographers] = useState<PhotographerRow[]>([])
  const [totalShoots, setTotalShoots] = useState(0)

  const loadPhotographers = () => {
    const providers = getApprovedProviders()
    const allUsers = getRegisteredUsersList()
    const kycApps = getKycApplications()
    const bookings = getStoredBookings()

    setTotalShoots(bookings.filter((b) => b.status === 'COMPLETED' || b.status === 'ACCEPTED').length)

    const photographerUsers = allUsers.filter((u) => u.role === 'PHOTOGRAPHER')
    const map = new Map<string, PhotographerRow>()

    // 1. From approved providers (Verified)
    for (const p of providers) {
      const pBookings = bookings.filter(
        (b) => b.photographer_id === p.id || b.photographer_name === p.name
      )
      const completed = pBookings.filter(
        (b) => b.status === 'COMPLETED' || b.status === 'ACCEPTED'
      ).length
      const earnings = pBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)

      map.set(p.name, {
        id: p.id,
        name: p.name,
        handle: p.id,
        email: `${p.id}@flashy.vn`,
        phone: 'Chưa cập nhật',
        avatar: p.avatar,
        area: p.location,
        specialty: p.specialty,
        kyc_status: 'VERIFIED',
        rating: p.rating,
        completed_shoots: completed,
        gross_earnings: earnings,
        badges: p.badge ? [p.badge] : ['⭐ Đã duyệt KYC'],
        is_active: true,
      })
    }

    // 2. From registered users with PHOTOGRAPHER role
    for (const u of photographerUsers) {
      if (!map.has(u.name)) {
        const kyc = kycApps.find(
          (k) => k.photographer_name === u.name || k.email === u.email
        )
        const pBookings = bookings.filter((b) => b.photographer_name === u.name)
        const completed = pBookings.filter(
          (b) => b.status === 'COMPLETED' || b.status === 'ACCEPTED'
        ).length
        const earnings = pBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)

        map.set(u.name, {
          id: u.id,
          name: u.name,
          handle: u.id.toLowerCase(),
          email: u.email,
          phone: 'Chưa cập nhật',
          avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
          area: 'Hồ Chí Minh',
          specialty: 'Portrait & Lifestyle',
          kyc_status: kyc ? kyc.status : 'NOT_SUBMITTED',
          rating: 0,
          completed_shoots: completed,
          gross_earnings: earnings,
          badges: [],
          is_active: u.is_active,
        })
      }
    }

    setPhotographers(Array.from(map.values()))
  }

  useEffect(() => {
    loadPhotographers()
    window.addEventListener('flashy_providers_updated', loadPhotographers)
    window.addEventListener('flashy_admin_updated', loadPhotographers)
    window.addEventListener('storage', loadPhotographers)
    return () => {
      window.removeEventListener('flashy_providers_updated', loadPhotographers)
      window.removeEventListener('flashy_admin_updated', loadPhotographers)
      window.removeEventListener('storage', loadPhotographers)
    }
  }, [])

  const toggleStatus = (id: string) => {
    setPhotographers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p))
    )
  }

  const filtered = photographers.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.area.toLowerCase().includes(search.toLowerCase())
    const matchKyc = kycFilter === 'all' || p.kyc_status === kycFilter
    return matchSearch && matchKyc
  })

  const verifiedCount = photographers.filter((p) => p.kyc_status === 'VERIFIED').length
  const pendingCount = photographers.filter((p) => p.kyc_status === 'PENDING_REVIEW').length
  const activeCount = photographers.filter((p) => p.is_active).length
  const ratedPhotographers = photographers.filter((p) => p.rating > 0)
  const avgRating =
    ratedPhotographers.length > 0
      ? (
          ratedPhotographers.reduce((s, p) => s + p.rating, 0) /
          ratedPhotographers.length
        ).toFixed(2)
      : '0.0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Nhiếp ảnh gia</h1>
          <p className="text-slate-500 text-sm mt-1">
            Danh sách nhiếp ảnh gia hoạt động trên sàn Flashy, trạng thái KYC và chỉ số hiệu suất
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/admin/kyc">
            <Button variant="outline" size="sm" className="gap-2">
              <ShieldCheck className="h-4 w-4 text-violet-600" />
              Duyệt hồ sơ KYC ({pendingCount})
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Tổng số thợ ảnh</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{photographers.length}</p>
            <span className="text-[11px] text-emerald-600 font-medium">{activeCount} đang hoạt động</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Đã xác minh KYC</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{verifiedCount}</p>
            <span className="text-[11px] text-slate-500">Được phép nhận cọc</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Chờ duyệt CCCD</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
            <span className="text-[11px] text-amber-700 font-medium">Cần xử lý</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Đánh giá trung bình sàn</p>
            <p className="text-2xl font-bold text-violet-600 mt-1">{avgRating}★</p>
            <span className="text-[11px] text-slate-500">Dựa trên {totalShoots} lượt chụp hoàn tất</span>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên thợ, email, khu vực..."
            className="pl-9 bg-white"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'VERIFIED', 'PENDING_REVIEW', 'NOT_SUBMITTED'] as const).map((mode) => (
            <Button
              key={mode}
              variant={kycFilter === mode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setKycFilter(mode)}
              className={kycFilter === mode ? 'bg-violet-600 text-white' : 'text-slate-600'}
            >
              {mode === 'all'
                ? 'Tất cả'
                : mode === 'VERIFIED'
                ? 'Đã KYC'
                : mode === 'PENDING_REVIEW'
                ? 'Chờ duyệt'
                : 'Chưa nộp KYC'}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          {photographers.length === 0 ? (
            <div className="py-14 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 m-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mb-3">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">Chưa có thợ chụp nào đăng ký (Clean Slate)</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Khi có nhiếp ảnh gia tạo tài khoản hoặc được duyệt KYC trong trang Quản lý KYC, danh sách thợ ảnh sẽ tự động hiển thị tại đây.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              Không tìm thấy nhiếp ảnh gia nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase border-b border-slate-200">
                  <th className="p-4">Nhiếp ảnh gia</th>
                  <th className="p-4">Khu vực & Phong cách</th>
                  <th className="p-4">Trạng thái KYC</th>
                  <th className="p-4">Đánh giá & Số ca</th>
                  <th className="p-4">Tổng doanh thu</th>
                  <th className="p-4">Huy hiệu</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                          {item.avatar ? (
                            <Image src={item.avatar} alt={item.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-violet-100 text-violet-700 font-bold">
                              {item.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            {item.name}
                            {item.kyc_status === 'VERIFIED' && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 inline" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{item.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-800 font-medium">{item.area}</div>
                      <div className="text-[11px] text-slate-400">{item.specialty}</div>
                    </td>
                    <td className="p-4">
                      {item.kyc_status === 'VERIFIED' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ✓ Đã duyệt
                        </span>
                      )}
                      {item.kyc_status === 'PENDING_REVIEW' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          ⏳ Chờ duyệt
                        </span>
                      )}
                      {item.kyc_status === 'NOT_SUBMITTED' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                          Chưa nộp
                        </span>
                      )}
                      {item.kyc_status === 'REJECTED' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          ✕ Đã từ chối
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 font-semibold text-slate-800">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {item.rating > 0 ? item.rating.toFixed(1) : 'Chưa có'}
                      </div>
                      <div className="text-[11px] text-slate-400">{item.completed_shoots} ca chụp</div>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{formatVND(item.gross_earnings)}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {item.badges.length > 0 ? (
                          item.badges.map((b) => (
                            <span
                              key={b}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-violet-50 text-violet-700 border border-violet-100"
                            >
                              {b}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">—</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(item.id)}
                        className={`text-xs ${item.is_active ? 'text-rose-600 hover:text-rose-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                      >
                        {item.is_active ? 'Tạm dừng' : 'Kích hoạt'}
                      </Button>
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
