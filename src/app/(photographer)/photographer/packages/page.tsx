'use client'

import { useState, useEffect } from 'react'
import {
  Package,
  Plus,
  CheckCircle2,
  Clock,
  Camera,
  Sparkles,
  Edit2,
  RotateCcw
} from 'lucide-react'
import { DEMO_PACKAGES } from '@/lib/data/mock-data'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function PhotographerPackagesPage() {
  const [packages, setPackages] = useState<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPackage, setNewPackage] = useState({
    name: '',
    category: 'Portrait',
    base_price: 350000,
    duration_minutes: 60,
    original_photos: 50,
    edited_photos: 10,
    retouch_quota: 5,
    delivery_days: 2,
    description: '',
  })

  useEffect(() => {
    try {
      const stored = localStorage.getItem('flashy_photographer_packages')
      if (stored) {
        setPackages(JSON.parse(stored))
      } else {
        // Default clean state: empty array []
        setPackages([])
      }
    } catch {
      setPackages([])
    }
    setIsLoaded(true)
  }, [])

  const savePackages = (updated: any[]) => {
    setPackages(updated)
    try {
      localStorage.setItem('flashy_photographer_packages', JSON.stringify(updated))
    } catch {}
  }

  const togglePackage = (id: string) => {
    const updated = packages.map((p) => {
      if (p.id === id) return { ...p, is_active: !p.is_active }
      return p
    })
    savePackages(updated)
  }

  const handleActivateStandardPackages = () => {
    savePackages(DEMO_PACKAGES)
  }

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPackage.name.trim()) return

    const created = {
      id: `pkg-${Date.now()}`,
      slug: newPackage.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: newPackage.name.trim(),
      category: newPackage.category,
      base_price: Number(newPackage.base_price) || 200000,
      duration_minutes: Number(newPackage.duration_minutes) || 60,
      original_photos: Number(newPackage.original_photos) || 30,
      edited_photos: Number(newPackage.edited_photos) || 10,
      retouch_quota: Number(newPackage.retouch_quota) || 0,
      delivery_days: Number(newPackage.delivery_days) || 2,
      description: newPackage.description || 'Gói chụp phong cách cá nhân',
      is_active: true,
      features: ['Trả toàn bộ file gốc', 'Chỉnh màu cơ bản'],
    }

    const updated = [created, ...packages]
    savePackages(updated)
    setShowAddForm(false)
    setNewPackage({
      name: '',
      category: 'Portrait',
      base_price: 300000,
      duration_minutes: 60,
      original_photos: 50,
      edited_photos: 10,
      retouch_quota: 5,
      delivery_days: 2,
      description: '',
    })
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý Gói Dịch Vụ & Báo Giá
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kích hoạt các gói chụp bạn sẵn sàng nhận và điều chỉnh mức giá theo quy định sàn ({packages.length} gói)
          </p>
        </div>

        {packages.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleActivateStandardPackages}
              className="rounded-xl text-xs font-bold h-10 px-3"
              title="Khôi phục các gói tiêu chuẩn FLASHY"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Gói chuẩn
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-brand text-white rounded-xl text-xs font-bold h-10 px-4 shadow-sm hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-1" />
              {showAddForm ? 'Đóng form' : 'Thêm gói chụp mới'}
            </Button>
          </div>
        )}
      </div>

      {/* Add Custom Package Form */}
      {showAddForm && (
        <Card className="rounded-3xl border-violet-200 bg-violet-50/40 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Tạo Gói Chụp Mới</h3>
          <form onSubmit={handleCreatePackage} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tên gói dịch vụ *</label>
              <Input
                required
                placeholder="Ví dụ: Vibe Cà Phê Chiều"
                value={newPackage.name}
                onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                className="rounded-xl h-10 text-xs bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Thể loại</label>
              <Input
                placeholder="Portrait, Outdoor, Couple..."
                value={newPackage.category}
                onChange={(e) => setNewPackage({ ...newPackage, category: e.target.value })}
                className="rounded-xl h-10 text-xs bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Giá cơ bản (VND) *</label>
              <Input
                type="number"
                step="50000"
                min="350000"
                required
                value={newPackage.base_price}
                onChange={(e) => setNewPackage({ ...newPackage, base_price: Number(e.target.value) })}
                className="rounded-xl h-10 text-xs bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Thời lượng chụp (phút)</label>
              <Input
                type="number"
                step="15"
                min="30"
                value={newPackage.duration_minutes}
                onChange={(e) => setNewPackage({ ...newPackage, duration_minutes: Number(e.target.value) })}
                className="rounded-xl h-10 text-xs bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Mô tả chi tiết</label>
              <Input
                placeholder="Mô tả phong cách chụp, địa điểm phù hợp, số lượng concept..."
                value={newPackage.description}
                onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                className="rounded-xl h-10 text-xs bg-white"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="rounded-xl text-xs h-9"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-brand text-white rounded-xl text-xs font-bold h-9 px-5"
              >
                Lưu gói dịch vụ
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Empty State when no packages exist */}
      {isLoaded && packages.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 md:p-14 border border-slate-200 text-center shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1.5">
            Chưa có gói dịch vụ nào được kích hoạt
          </h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed max-w-sm mx-auto">
            Khách hàng chỉ có thể đặt lịch khi bạn đã thiết lập ít nhất một gói chụp. Bạn có thể kích hoạt nhanh bộ gói chụp tiêu chuẩn của FLASHY hoặc tạo gói mới theo phong cách riêng.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              type="button"
              onClick={handleActivateStandardPackages}
              className="bg-brand hover:opacity-90 text-white rounded-xl font-bold text-xs h-11 px-6 shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Kích hoạt các gói chuẩn FLASHY
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddForm(true)}
              className="rounded-xl font-bold text-xs h-11 px-5"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Tự tạo gói chụp mới
            </Button>
          </div>
        </div>
      ) : (
        /* Package Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`rounded-3xl border transition-all ${
                pkg.is_active ? 'border-slate-200 bg-white shadow-sm' : 'border-slate-200 bg-slate-50 opacity-60'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider bg-violet-50 px-2 py-0.5 rounded">
                      {pkg.category}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">{pkg.name}</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => togglePackage(pkg.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                      pkg.is_active
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {pkg.is_active ? 'Đang nhận lịch' : 'Tạm tắt'}
                  </button>
                </div>

                <div className="text-2xl font-black text-violet-700 mb-3">
                  {formatVND(pkg.base_price)}
                  <span className="text-xs text-slate-400 font-normal">
                    {' '}
                    / buổi ({pkg.duration_minutes} phút)
                  </span>
                </div>

                {/* CP3 Detailed Specifications */}
                <div className="text-xs text-slate-600 space-y-2 pt-3 border-t border-slate-100 mb-2">
                  {pkg.equipment && (
                    <p className="flex items-start gap-1.5 text-[11px]">
                      <Camera className="w-3.5 h-3.5 text-violet-600 flex-shrink-0 mt-0.5" />
                      <span>Thiết bị: <strong className="text-slate-800">{pkg.equipment}</strong></span>
                    </p>
                  )}
                  <p className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>Thời lượng: <strong>{pkg.duration_text || `${pkg.duration_minutes} phút`}</strong></span>
                  </p>
                  {pkg.deliverables ? (
                    <p className="flex items-start gap-1.5 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <span>Bàn giao: <strong>{pkg.deliverables}</strong></span>
                    </p>
                  ) : (
                    <p className="text-[11px]">
                      📸 <strong>{pkg.original_photos}</strong> ảnh gốc • <strong>{pkg.edited_photos}</strong> ảnh màu
                    </p>
                  )}
                  {pkg.delivery_time && (
                    <p className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Hạn trả: {pkg.delivery_time}</span>
                    </p>
                  )}
                  {pkg.service_includes && (
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <strong>Bao gồm:</strong> {pkg.service_includes}
                    </p>
                  )}
                  {pkg.photographer_tier && (
                    <p className="text-[10px] text-slate-400">
                      Phân khúc thợ: <strong className="text-slate-600">{pkg.photographer_tier}</strong>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
