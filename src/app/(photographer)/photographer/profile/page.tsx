'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Camera,
  MapPin,
  Star,
  Award,
  Sparkles,
  ShieldCheck,
  Upload,
  Save,
  CheckCircle2,
  Instagram,
  Facebook,
  Globe,
  Tag,
  Clock,
  Layers,
  Edit3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const AVAILABLE_SPECIALTIES = [
  'Lifestyle',
  'Street photography',
  'Couple photography',
  'Quick Date',
  'Tết / Áo dài',
  'Graduation / Kỷ yếu',
  'Outdoor',
  'Travel',
  'Events',
  'Portrait',
  'Concept photography',
]

const DISTRICTS = [
  'Quận 1',
  'Quận 3',
  'Quận 4',
  'Quận 5',
  'Quận 7',
  'Quận 10',
  'Bình Thạnh',
  'Phú Nhuận',
  'Thành phố Thủ Đức',
  'Tân Bình',
]

export default function PhotographerProfilePage() {
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [displayName, setDisplayName] = useState('Trần Minh Trí')
  const [handle, setHandle] = useState('tri-tran-photo')
  const [bio, setBio] = useState(
    'Nhiếp ảnh gia đường phố và phong cách sống tại TP. Hồ Chí Minh với hơn 5 năm kinh nghiệm. Yêu thích bắt trọn những khoảnh khắc tự nhiên, ánh sáng vàng chiều tà và cảm xúc chân thật nhất của bạn.'
  )
  const [experience, setExperience] = useState('5 năm')
  const [gear, setGear] = useState('Sony A7IV, FE 35mm f/1.4 GM, FE 85mm f/1.8, Godox AD200 Pro')
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([
    'Lifestyle',
    'Street photography',
    'Couple photography',
    'Quick Date',
    'Portrait',
  ])
  const [selectedAreas, setSelectedAreas] = useState<string[]>([
    'Quận 1',
    'Quận 3',
    'Bình Thạnh',
    'Thành phố Thủ Đức',
  ])
  const [socialLinks, setSocialLinks] = useState({
    instagram: '@tritran.visuals',
    facebook: 'fb.com/tritranphoto',
    website: 'https://tritranphoto.vn',
  })

  const toggleSpecialty = (item: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    )
  }

  const toggleArea = (item: string) => {
    setSelectedAreas((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    )
  }

  const handleSave = () => {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hồ sơ chuyên nghiệp</h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý thông tin hiển thị công khai trên hồ sơ đặt lịch của bạn
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => window.open(`/photographers/${handle}`, '_blank')}
          >
            Xem trang công khai
          </Button>
          <Button
            onClick={handleSave}
            className="bg-violet-600 hover:bg-violet-700 text-white gap-2 shadow-sm"
          >
            <Save className="h-4 w-4" />
            Lưu hồ sơ
          </Button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>Hồ sơ đã được lưu thành công và cập nhật lên hệ thống Flashy!</span>
        </div>
      )}

      {/* Banner & Avatar section */}
      <Card className="border-slate-200 overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute right-4 bottom-4">
            <Button size="sm" variant="secondary" className="gap-2 bg-white/90 backdrop-blur-sm text-slate-800">
              <Upload className="h-3.5 w-3.5" />
              Đổi ảnh bìa
            </Button>
          </div>
        </div>

        <CardContent className="p-6 relative pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-12 mb-6">
            <div className="flex items-end gap-4">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-white relative">
                  <Image
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                    alt={displayName}
                    fill
                    className="object-cover"
                  />
                </div>
                <button className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                  <Camera className="h-4 w-4 mb-1" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1 text-xs">
                    <ShieldCheck className="h-3 w-3" />
                    Đã xác minh KYC
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-mono">flashy.vn/photographers/{handle}</p>
                <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                  <span className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    4.95 (48 đánh giá)
                  </span>
                  <span>•</span>
                  <span>Kinh nghiệm: {experience}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Họ và tên hiển thị *
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Đường dẫn cá nhân (Slug) *
              </label>
              <div className="flex rounded-lg border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-violet-500">
                <span className="px-3 py-2.5 bg-slate-50 text-slate-400 text-xs flex items-center border-r border-slate-200">
                  flashy.vn/
                </span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Giới thiệu bản thân (Bio) *
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Tối đa 500 ký tự. Chia sẻ về phong cách, góc chụp và cảm xúc bạn hướng đến.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Số năm kinh nghiệm
              </label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Thiết bị chính đang dùng
              </label>
              <input
                type="text"
                value={gear}
                onChange={(e) => setGear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="VD: Sony A7IV, Lens 35mm..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specialties & Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="h-4 w-4 text-violet-600" />
              <h3 className="text-base font-semibold text-slate-900">Phong cách chụp ảnh</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Chọn các phong cách bạn tự tin nhất để khách hàng dễ dàng tìm kiếm
            </p>

            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SPECIALTIES.map((spec) => {
                const isSelected = selectedSpecialties.includes(spec)
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialty(spec)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {spec}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-pink-600" />
              <h3 className="text-base font-semibold text-slate-900">Khu vực nhận chụp chính</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Khu vực bạn nhận chụp thường xuyên tại TP. Hồ Chí Minh
            </p>

            <div className="flex flex-wrap gap-2">
              {DISTRICTS.map((area) => {
                const isSelected = selectedAreas.includes(area)
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleArea(area)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-pink-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {area}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social links */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-2">Mạng xã hội & Portfolio ngoài</h3>
          <p className="text-xs text-slate-500 mb-4">
            Liên kết giúp tăng độ uy tín với khách hàng mới
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <Instagram className="h-3.5 w-3.5 text-pink-600" /> Instagram
              </label>
              <input
                type="text"
                value={socialLinks.instagram}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <Facebook className="h-3.5 w-3.5 text-blue-600" /> Facebook
              </label>
              <input
                type="text"
                value={socialLinks.facebook}
                onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-emerald-600" /> Website cá nhân
              </label>
              <input
                type="text"
                value={socialLinks.website}
                onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
