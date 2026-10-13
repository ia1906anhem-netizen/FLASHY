'use client'

import { useState, useEffect } from 'react'
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
import { getApprovedProviders } from '@/lib/data/booking-store'

interface CampaignItem {
  id: string
  title: string
  photographer: string
  handle: string
  avatar: string
  budget: number
  spent: number
  impressions: number
  clicks: number
  conversions: number
  start_date: string
  end_date: string
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
}

export default function AdminSponsoredPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [campaignName, setCampaignName] = useState('')
  const [photographerName, setPhotographerName] = useState('')
  const [budgetVND, setBudgetVND] = useState('500000')
  const [campaignCreated, setCampaignCreated] = useState(false)
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([])
  const [availablePhotographers, setAvailablePhotographers] = useState<Array<{ name: string; avatar: string }>>([])

  const loadData = () => {
    try {
      const raw = localStorage.getItem('flashy_admin_sponsored')
      if (raw) {
        setCampaigns(JSON.parse(raw))
      } else {
        setCampaigns([])
      }
    } catch {
      setCampaigns([])
    }

    const providers = getApprovedProviders()
    const pList = providers.map((p) => ({ name: p.name, avatar: p.avatar }))
    setAvailablePhotographers(pList)
    if (pList.length > 0 && !photographerName) {
      setPhotographerName(pList[0].name)
    }
  }

  useEffect(() => {
    loadData()
    window.addEventListener('flashy_admin_updated', loadData)
    window.addEventListener('storage', loadData)
    return () => {
      window.removeEventListener('flashy_admin_updated', loadData)
      window.removeEventListener('storage', loadData)
    }
  }, [])

  const saveCampaigns = (updated: CampaignItem[]) => {
    setCampaigns(updated)
    try {
      localStorage.setItem('flashy_admin_sponsored', JSON.stringify(updated))
    } catch {}
  }

  const toggleCampaign = (id: string) => {
    const updated = campaigns.map((c) =>
      c.id === id
        ? { ...c, status: (c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE') as any }
        : c
    )
    saveCampaigns(updated)
  }

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault()
    if (!campaignName) return

    const selectedP = availablePhotographers.find((p) => p.name === photographerName)
    const newCamp: CampaignItem = {
      id: `SPON-${String(campaigns.length + 1).padStart(2, '0')}`,
      title: campaignName,
      photographer: photographerName || 'Nhiếp ảnh gia',
      handle: (photographerName || 'photo').toLowerCase().replace(/\s+/g, '-'),
      avatar: selectedP?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      budget: parseInt(budgetVND) || 500000,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      start_date: new Date().toLocaleDateString('vi-VN'),
      end_date: new Date(Date.now() + 14 * 86400000).toLocaleDateString('vi-VN'),
      status: 'ACTIVE',
    }

    const updated = [newCamp, ...campaigns]
    saveCampaigns(updated)
    setCampaignCreated(true)
    setTimeout(() => {
      setCampaignCreated(false)
      setShowCreateModal(false)
      setCampaignName('')
    }, 1200)
  }

  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0)
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0)
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0)
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0)
  const ctrRate = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) + '%' : '0.0%'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chiến dịch Tài trợ (Sponsored Listings)</h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản trị vị trí nổi bật và huy hiệu Được tài trợ minh bạch trên trang khám phá (Thời gian thực)
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
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalImpressions.toLocaleString()}</p>
            <span className="text-[11px] text-emerald-600 font-medium">Số lượt hiển thị thực</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Lượt nhấn (Clicks)</p>
            <p className="text-2xl font-bold text-violet-600 mt-1">{totalClicks.toLocaleString()}</p>
            <span className="text-[11px] text-slate-500">CTR trung bình: {ctrRate}</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Đơn đặt thành công (Conversions)</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{totalConversions} đơn</p>
            <span className="text-[11px] text-slate-500">Chuyển đổi thực tế</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Doanh thu quảng cáo sàn</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{formatVND(totalSpent)}</p>
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
          {campaigns.length === 0 ? (
            <div className="py-14 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 m-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">Chưa có chiến dịch tài trợ nào (Clean Slate)</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Nhấn &quot;Tạo chiến dịch tài trợ mới&quot; để thiết lập tài trợ vị trí nổi bật và tiếp cận khách hàng tiềm năng cho thợ ảnh.
              </p>
            </div>
          ) : (
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
                      <p className="font-bold text-slate-800">{camp.impressions.toLocaleString()} views</p>
                      <p className="text-[11px] text-slate-400">{camp.clicks.toLocaleString()} clicks</p>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-emerald-600">{camp.conversions} đơn</p>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          camp.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : camp.status === 'PAUSED'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {camp.status === 'ACTIVE' ? 'Đang chạy' : camp.status === 'PAUSED' ? 'Tạm dừng' : 'Đã kết thúc'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCampaign(camp.id)}
                        className="text-xs text-violet-700 hover:text-violet-900"
                      >
                        {camp.status === 'ACTIVE' ? 'Tạm ngưng' : 'Kích hoạt lại'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Modal create campaign */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Tạo Chiến Dịch Tài Trợ Mới</h3>
            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên chiến dịch *</label>
                <Input
                  required
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="VD: Tài trợ Mùa Cưới Tháng 5"
                  className="rounded-xl h-10"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nhiếp ảnh gia được tài trợ *</label>
                {availablePhotographers.length > 0 ? (
                  <select
                    value={photographerName}
                    onChange={(e) => setPhotographerName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    {availablePhotographers.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    required
                    value={photographerName}
                    onChange={(e) => setPhotographerName(e.target.value)}
                    placeholder="Nhập tên thợ chụp..."
                    className="rounded-xl h-10"
                  />
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ngân sách chạy (VND) *</label>
                <Input
                  type="number"
                  value={budgetVND}
                  onChange={(e) => setBudgetVND(e.target.value)}
                  className="rounded-xl h-10"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl h-10 text-xs"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-10 text-xs font-bold"
                >
                  {campaignCreated ? '✓ Đã tạo!' : 'Xác nhận tạo'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
