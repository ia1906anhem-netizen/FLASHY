'use client'

import { useState } from 'react'
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
  MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatVND } from '@/lib/utils'

export default function AdminPhotographersPage() {
  const [search, setSearch] = useState('')
  const [kycFilter, setKycFilter] = useState<'all' | 'VERIFIED' | 'PENDING_REVIEW' | 'NOT_SUBMITTED'>('all')

  const [photographers, setPhotographers] = useState([
    {
      id: 'PHT-01',
      name: 'Trần Minh Trí',
      handle: 'tri-tran-photo',
      email: 'minhtri.photo@example.com',
      phone: '0903••••89',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      area: 'Quận 1, Bình Thạnh',
      specialty: 'Street & Lifestyle',
      kyc_status: 'VERIFIED',
      rating: 4.95,
      completed_shoots: 48,
      gross_earnings: 14850000,
      badges: ['Golden Badge', 'Star of the Quarter'],
      is_active: true,
    },
    {
      id: 'PHT-02',
      name: 'Lê Bảo Visuals',
      handle: 'lebao-concept',
      email: 'lebao.visuals@example.com',
      phone: '0912••••12',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
      area: 'Quận 3, Phú Nhuận',
      specialty: 'Concept & Fashion',
      kyc_status: 'VERIFIED',
      rating: 4.88,
      completed_shoots: 36,
      gross_earnings: 11200000,
      badges: ['Top Rated'],
      is_active: true,
    },
    {
      id: 'PHT-03',
      name: 'Hoàng Yến Nhi',
      handle: 'yen-nhi-moment',
      email: 'yennhi.camera@example.com',
      phone: '0988••••44',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
      area: 'Thủ Đức, Quận 2',
      specialty: 'Couple & Quick Date',
      kyc_status: 'PENDING_REVIEW',
      rating: 4.82,
      completed_shoots: 12,
      gross_earnings: 3400000,
      badges: [],
      is_active: true,
    },
    {
      id: 'PHT-04',
      name: 'Ngô Quang Khải',
      handle: 'khai-ngo-photo',
      email: 'quangkhai.ngo@example.com',
      phone: '0933••••76',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      area: 'Quận 7, Nhà Bè',
      specialty: 'Outdoor & Travel',
      kyc_status: 'NOT_SUBMITTED',
      rating: 0,
      completed_shoots: 0,
      gross_earnings: 0,
      badges: [],
      is_active: false,
    },
  ])

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
              Duyệt hồ sơ KYC
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Tổng số thợ ảnh</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">28</p>
            <span className="text-[11px] text-emerald-600 font-medium">24 đang hoạt động</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Đã xác minh KYC</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">21</p>
            <span className="text-[11px] text-slate-500">Được phép nhận cọc</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Chờ duyệt CCCD</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">4</p>
            <span className="text-[11px] text-amber-700 font-medium">Cần xử lý</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Đánh giá trung bình sàn</p>
            <p className="text-2xl font-bold text-violet-600 mt-1">4.91</p>
            <span className="text-[11px] text-slate-500">Dựa trên 342 lượt chụp</span>
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
                        <Image src={item.avatar} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900">{item.name}</p>
                          {!item.is_active && (
                            <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-700 border-rose-200">
                              Đã khóa
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{item.email}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{item.phone}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="space-y-0.5">
                      <p className="font-medium text-slate-800">{item.specialty}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {item.area}
                      </p>
                    </div>
                  </td>

                  <td className="p-4">
                    {item.kyc_status === 'VERIFIED' && (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1 text-[11px]">
                        <ShieldCheck className="h-3 w-3" />
                        Đã xác minh
                      </Badge>
                    )}
                    {item.kyc_status === 'PENDING_REVIEW' && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1 text-[11px]">
                        <AlertCircle className="h-3 w-3" />
                        Chờ thẩm định
                      </Badge>
                    )}
                    {item.kyc_status === 'NOT_SUBMITTED' && (
                      <Badge variant="outline" className="text-slate-500 text-[11px]">
                        Chưa gửi hồ sơ
                      </Badge>
                    )}
                  </td>

                  <td className="p-4">
                    {item.completed_shoots > 0 ? (
                      <div className="space-y-0.5">
                        <p className="font-semibold text-amber-600 flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          {item.rating}
                        </p>
                        <p className="text-[11px] text-slate-500">{item.completed_shoots} đơn thành công</p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Mới đăng ký</span>
                    )}
                  </td>

                  <td className="p-4">
                    <p className="font-bold text-slate-900">{formatVND(item.gross_earnings)}</p>
                    <p className="text-[10px] text-slate-400">GMV tích lũy</p>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {item.badges.length > 0 ? (
                        item.badges.map((b, i) => (
                          <Badge
                            key={i}
                            className="bg-violet-50 text-violet-700 border-violet-200 text-[10px]"
                          >
                            <Sparkles className="h-2.5 w-2.5 mr-1 text-violet-500" />
                            {b}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/photographers/${item.handle}`} target="_blank">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-600">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant={item.is_active ? 'ghost' : 'outline'}
                        onClick={() => toggleStatus(item.id)}
                        className={`h-8 px-2 text-xs ${
                          item.is_active ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 border-emerald-200'
                        }`}
                      >
                        {item.is_active ? (
                          <>
                            <Ban className="h-3.5 w-3.5 mr-1" />
                            Khóa
                          </>
                        ) : (
                          <>
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Mở
                          </>
                        )}
                      </Button>
                    </div>
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
