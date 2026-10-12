'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Sparkles,
  Plus,
  Calendar,
  DollarSign,
  TrendingUp,
  MousePointer,
  Eye,
  CheckCircle2,
  Clock,
  PauseCircle,
  PlayCircle,
  Search,
  ArrowUpRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatVND } from '@/lib/utils'

export default function AdminSponsoredPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [campaignName, setCampaignName] = useState('')
  const [photographerName, setPhotographerName] = useState('Trần Minh Trí')
  const [budgetVND, setBudgetVND] = useState('500000')
  const [campaignCreated, setCampaignCreated] = useState(false)

  const [campaigns, setCampaigns] = useState([
    {
      id: 'SPON-01',
      title: 'Chiến dịch Mùa Cưới & Quick Date Q2',
      photographer: 'Trần Minh Trí',
      handle: 'tri-tran-photo',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      budget: 1500000,
      spent: 850000,
      impressions: 14200,
      clicks: 864,
      conversions: 18,
      start_date: '01/04/2026',
      end_date: '30/04/2026',
      status: 'ACTIVE',
    },
    {
      id: 'SPON-02',
      title: 'Top Thợ Ảnh Concept Sài Gòn Đêm',
      photographer: 'Lê Bảo Visuals',
      handle: 'lebao-concept',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
      budget: 1000000,
      spent: 1000000,
      impressions: 18500,
      clicks: 1120,
      conversions: 24,
      start_date: '15/03/2026',
      end_date: '05/04/2026',
      status: 'COMPLETED',
    },
    {
      id: 'SPON-03',
      title: 'Tài Trợ Newbie Tiềm Năng',
      photographer: 'Hoàng Yến Nhi',
      handle: 'yen-nhi-moment',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
      budget: 500000,
      spent: 120000,
      impressions: 2100,
      clicks: 95,
      conversions: 2,
      start_date: '10/04/2026',
      end_date: '25/04/2026',
      status: 'ACTIVE',
    },
  ])

  const toggleCampaign = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' }
          : c
      )
    )
  }

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault()
    if (!campaignName) return

    const newCamp = {
      id: `SPON-0${campaigns.length + 1}`,
      title: campaignName,
      photographer: photographerName,
      handle: 'tri-tran-photo',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      budget: parseInt(budgetVND) || 500000,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      start_date: '12/04/2026',
      end_date: '26/04/2026',
      status: 'ACTIVE',
    }

    setCampaigns([newCamp, ...campaigns])
    setCampaignCreated(true)
    setTimeout(() => {
      setCampaignCreated(false)
      setShowCreateModal(false)
      setCampaignName('')
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chiến dịch Tài trợ (Sponsored Listings)</h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản trị vị trí nổi bật và huy hiệu Được tài trợ minh bạch trên trang khám phá
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Tạo chiến dịch tài trợ mới
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Lượt hiển thị (Impressions)</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">34,800</p>
            <span className="text-[11px] text-emerald-600 font-medium">+18.5% so với tháng trước</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Lượt nhấn (Clicks)</p>
            <p className="text-2xl font-bold text-violet-600 mt-1">2,079</p>
            <span className="text-[11px] text-slate-500">CTR trung bình: ~5.97%</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Đơn đặt thành công (Conversions)</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">44 đơn</p>
            <span className="text-[11px] text-slate-500">Doanh số đem lại: 32.5M VND</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Doanh thu quảng cáo sàn</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">1,970,000 đ</p>
            <span className="text-[11px] text-slate-500">Từ ngân sách tài trợ</span>
          </CardContent>
        </Card>
      </div>

      {/* Table of Campaigns */}
      <Card className="border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Danh sách chiến dịch quảng bá</h2>
          <Badge className="bg-violet-100 text-violet-800 border-violet-200">
            Hiển thị nhãn minh bạch: [Được tài trợ]
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase border-b border-slate-200">
                <th className="p-4">Chiến dịch & Thợ ảnh</th>
                <th className="p-4">Thời gian chạy</th>
                <th className="p-4">Ngân sách / Đã chi</th>
                <th className="p-4">Lượt hiển thị / Nhấn</th>
                <th className="p-4">Chuyển đổi đơn</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Điều khiển</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                        <Image src={camp.avatar} alt={camp.photographer} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{camp.title}</p>
                        <p className="text-[11px] text-violet-600 font-medium">Thợ: {camp.photographer}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Mã: {camp.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-slate-600">
                    <p className="flex items-center gap-1 font-medium text-slate-800">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {camp.start_date} - {camp.end_date}
                    </p>
                  </td>

                  <td className="p-4">
                    <p className="font-bold text-slate-900">{formatVND(camp.spent)}</p>
                    <p className="text-[10px] text-slate-400">Ngân sách: {formatVND(camp.budget)}</p>
                  </td>

                  <td className="p-4">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-800">{camp.impressions.toLocaleString()} views</p>
                      <p className="text-[11px] text-violet-600 font-medium">{camp.clicks.toLocaleString()} clicks</p>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-emerald-600 text-sm">{camp.conversions} đơn</span>
                  </td>

                  <td className="p-4">
                    {camp.status === 'ACTIVE' && (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[11px]">
                        Đang phát
                      </Badge>
                    )}
                    {camp.status === 'PAUSED' && (
                      <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 text-[11px]">
                        Tạm dừng
                      </Badge>
                    )}
                    {camp.status === 'COMPLETED' && (
                      <Badge variant="outline" className="text-slate-500 text-[11px]">
                        Hoàn tất
                      </Badge>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    {camp.status !== 'COMPLETED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleCampaign(camp.id)}
                        className="h-8 text-xs gap-1"
                      >
                        {camp.status === 'ACTIVE' ? (
                          <>
                            <PauseCircle className="h-3.5 w-3.5 text-amber-600" />
                            Tạm dừng
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-3.5 w-3.5 text-emerald-600" />
                            Kích hoạt
                          </>
                        )}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal create campaign */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Thiết lập chiến dịch tài trợ mới</h3>
            <p className="text-xs text-slate-500">
              Chiến dịch này sẽ gán nhãn [Tài trợ] cho thợ ảnh trên đầu trang tìm kiếm.
            </p>

            {campaignCreated ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>Chiến dịch đã được khởi tạo thành công!</span>
              </div>
            ) : (
              <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tên chiến dịch *</label>
                  <input
                    type="text"
                    required
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="VD: Quảng bá Mùa Kỷ Yếu 2026"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nhiếp ảnh gia chỉ định *</label>
                  <select
                    value={photographerName}
                    onChange={(e) => setPhotographerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white"
                  >
                    <option value="Trần Minh Trí">Trần Minh Trí (TriStreet)</option>
                    <option value="Lê Bảo Visuals">Lê Bảo Visuals</option>
                    <option value="Hoàng Yến Nhi">Hoàng Yến Nhi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Ngân sách tài trợ (VND) *</label>
                  <input
                    type="number"
                    step="100000"
                    value={budgetVND}
                    onChange={(e) => setBudgetVND(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    Lưu & Kích hoạt
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
