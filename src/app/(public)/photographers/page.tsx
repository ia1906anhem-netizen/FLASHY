'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Zap,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Camera,
  Grid,
  Map as MapIcon,
  X,
  CheckCircle2,
  Award,
  Sparkles,
  ArrowUpDown,
  Navigation,
  Loader2,
  Compass
} from 'lucide-react'
import { getApprovedProviders, type ApprovedProvider } from '@/lib/data/booking-store'
import { PHOTOGRAPHY_CATEGORIES } from '@/lib/constants'
import { formatVND } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { CityLocationPicker, type SelectedLocationData } from '@/components/shared/city-location-picker'
import {
  calculateDistanceKm,
  formatDistance,
  getCurrentUserCoordinates,
  findNearestDistrict,
  getCoordinatesByLocation,
  type Coordinates
} from '@/lib/geolocation'
import type { Photographer } from '@/types'

export type PhotographerWithDistance = Photographer & {
  distanceKm?: number
}

function providerToPhotographer(p: ApprovedProvider): PhotographerWithDistance {
  // Lấy tọa độ chuẩn xác theo quận/huyện của thợ ảnh
  const baseCoords = getCoordinatesByLocation(p.district || p.city || p.location)
  
  // Tạo độ phân tán nhẹ (jitter) theo hash của ID để thợ cùng quận không trùng khít tọa độ
  const seed = (p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 20) - 10
  const jitterLat = seed * 0.0015
  const jitterLng = ((seed * 7) % 20 - 10) * 0.0015

  return {
    id: p.id,
    user_id: p.id,
    slug: p.slug,
    display_name: p.name,
    bio: `Chuyên gia ${p.specialty} tại ${p.location}. Đã xác minh danh tính và thiết bị trên FLASHY.`,
    tagline: p.specialty,
    avatar_url: p.avatar,
    banner_url: p.cover,
    cover_image_url: p.cover,
    city: p.city || 'Hồ Chí Minh',
    district: p.district || 'Quận 1',
    address: p.location,
    latitude: baseCoords.lat + jitterLat,
    longitude: baseCoords.lng + jitterLng,
    specialties: p.specialty ? p.specialty.split(/[,·\s]+/).filter(Boolean) : ['Portrait', 'Street'],
    equipment: ['Professional Camera', '50mm f/1.8', '85mm f/1.4'],
    starting_price: p.starting_price || 350000,
    average_rating: p.rating || 5.0,
    review_count: p.reviews || 0,
    completed_orders_count: 0,
    is_verified: p.is_verified,
    is_ready_to_work: true,
    is_sponsored: p.is_sponsored || false,
    badges: p.badge ? [p.badge] : ['⭐ Đã duyệt KYC'],
    portfolio_photos: [p.cover],
    service_radius_km: 15,
    kyc_status: 'VERIFIED',
    is_available: true,
    is_approved: true,
    is_featured: false,
    avg_rating: p.rating || 5.0,
    total_reviews: p.reviews || 0,
    total_completed_bookings: 0,
    created_at: p.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

function PhotographersContent() {
  const searchParams = useSearchParams()
  const initialQ = searchParams?.get('q') || ''
  const initialCity = searchParams?.get('city') || 'all'
  const initialStyle = searchParams?.get('style') || 'all'

  const [allPhotographers, setAllPhotographers] = useState<PhotographerWithDistance[]>([])
  const [searchQuery, setSearchQuery] = useState(initialQ)
  const [selectedCategory, setSelectedCategory] = useState<string>(initialStyle)
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialCity)
  const [minRating, setMinRating] = useState<number>(0)
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false)
  const [readyToWorkOnly, setReadyToWorkOnly] = useState<boolean>(false)
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'price_asc' | 'price_desc' | 'popular'>('rating')
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false)
  const [selectedMapPhotographer, setSelectedMapPhotographer] = useState<string | null>(null)
  
  // Geolocation & Radius Filtering State
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null)
  const [isLocatingUser, setIsLocatingUser] = useState(false)
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(0) // 0 = Không giới hạn

  useEffect(() => {
    const load = () => {
      const approved = getApprovedProviders()
      setAllPhotographers(approved.map(providerToPhotographer))
    }
    load()
    window.addEventListener('flashy_providers_updated', load)
    window.addEventListener('storage', load)
    return () => {
      window.removeEventListener('flashy_providers_updated', load)
      window.removeEventListener('storage', load)
    }
  }, [])

  useEffect(() => {
    if (allPhotographers.length > 0 && !selectedMapPhotographer) {
      setSelectedMapPhotographer(allPhotographers[0].id)
    }
  }, [allPhotographers, selectedMapPhotographer])

  useEffect(() => {
    if (searchParams) {
      const q = searchParams.get('q')
      const city = searchParams.get('city')
      const style = searchParams.get('style')
      const lat = searchParams.get('lat')
      const lng = searchParams.get('lng')
      const nearby = searchParams.get('nearby')

      if (q !== null) setSearchQuery(q)
      if (city !== null) setSelectedDistrict(city)
      if (style !== null) setSelectedCategory(style)

      if (lat && lng) {
        setUserCoords({
          latitude: parseFloat(lat),
          longitude: parseFloat(lng)
        })
        if (nearby === 'true') {
          setSortBy('distance')
        }
      }
    }
  }, [searchParams])

  const handleLocateUser = async () => {
    setIsLocatingUser(true)
    try {
      const coords = await getCurrentUserCoordinates()
      setUserCoords(coords)
      setSortBy('distance')
    } catch (err: any) {
      alert(err?.message || 'Không thể lấy vị trí hiện tại. Vui lòng cho phép quyền định vị trong trình duyệt.')
    } finally {
      setIsLocatingUser(false)
    }
  }

  const districts = useMemo(() => {
    const list = Array.from(new Set(allPhotographers.map(p => p.district).filter(Boolean)))
    return list as string[]
  }, [allPhotographers])

  const filteredPhotographers = useMemo(() => {
    return allPhotographers
      .map(p => {
        let distanceKm: number | undefined = undefined
        if (userCoords && p.latitude && p.longitude) {
          distanceKm = calculateDistanceKm(
            userCoords.latitude,
            userCoords.longitude,
            p.latitude,
            p.longitude
          )
        }
        return {
          ...p,
          distanceKm
        }
      })
      .filter(p => {
        // Lọc theo bán kính tối đa
        if (maxRadiusKm > 0 && p.distanceKm !== undefined && p.distanceKm > maxRadiusKm) {
          return false
        }

        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const matchName = p.display_name.toLowerCase().includes(q)
          const matchBio = p.bio?.toLowerCase().includes(q)
          const matchDistrict = p.district?.toLowerCase().includes(q)
          const matchSpecialties = p.specialties?.some(s => s.toLowerCase().includes(q))
          if (!matchName && !matchBio && !matchDistrict && !matchSpecialties) return false
        }

        // Category
        if (selectedCategory !== 'all') {
          const catObj = PHOTOGRAPHY_CATEGORIES.find(c => c.value === selectedCategory)
          const catLabel = catObj ? catObj.label.toLowerCase() : selectedCategory.toLowerCase()
          const hasSpec = p.specialties?.some(s => s.toLowerCase().includes(catLabel) || catLabel.includes(s.toLowerCase()))
          if (!hasSpec) return false
        }

        // Location / City / District
        if (selectedDistrict !== 'all') {
          const loc = selectedDistrict.toLowerCase().replace('tp. ', '').replace('thành phố ', '').trim()
          const pDistrict = (p.district || '').toLowerCase()
          const pCity = (p.city || '').toLowerCase()
          const pAddress = (p.address || '').toLowerCase()
          const match = pDistrict.includes(loc) || pCity.includes(loc) || pAddress.includes(loc) || loc.includes(pDistrict)
          if (!match) return false
        }

        // Rating
        if (minRating > 0 && (p.average_rating || 0) < minRating) {
          return false
        }

        // Verified
        if (verifiedOnly && !p.is_verified) {
          return false
        }

        // Ready to work
        if (readyToWorkOnly && !p.is_ready_to_work) {
          return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'distance') {
          return (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999)
        }
        if (sortBy === 'rating') return (b.average_rating || 0) - (a.average_rating || 0)
        if (sortBy === 'price_asc') return (a.starting_price || 0) - (b.starting_price || 0)
        if (sortBy === 'price_desc') return (b.starting_price || 0) - (a.starting_price || 0)
        if (sortBy === 'popular') return (b.completed_orders_count || 0) - (a.completed_orders_count || 0)
        return 0
      })
  }, [allPhotographers, searchQuery, selectedCategory, selectedDistrict, minRating, verifiedOnly, readyToWorkOnly, sortBy, userCoords, maxRadiusKm])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedCategory !== 'all') count++
    if (selectedDistrict !== 'all') count++
    if (minRating > 0) count++
    if (verifiedOnly) count++
    if (readyToWorkOnly) count++
    if (maxRadiusKm > 0) count++
    if (userCoords) count++
    return count
  }, [selectedCategory, selectedDistrict, minRating, verifiedOnly, readyToWorkOnly])

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedDistrict('all')
    setMinRating(0)
    setVerifiedOnly(false)
    setReadyToWorkOnly(false)
    setSortBy('rating')
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Breadcrumb & Header */}
        <div className="mb-6">
          <nav className="text-xs text-slate-500 mb-2 flex items-center gap-2">
            <Link href="/" className="hover:text-violet-600">Trang chủ</Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Khám phá nhiếp ảnh gia</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Nhiếp Ảnh Gia FLASHY
                <span className="text-sm font-semibold bg-violet-100 text-violet-700 px-3 py-1 rounded-full">
                  {filteredPhotographers.length} tài năng sẵn sàng
                </span>
              </h1>
              <p className="text-slate-600 mt-1">
                Tìm kiếm và kết nối trực tiếp với các photographer tự do uy tín, giá chỉ từ 350.000đ
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 self-start md:self-auto bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Grid className="w-4 h-4" />
                Dạng lưới
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'map'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MapIcon className="w-4 h-4" />
                Bản đồ
              </button>
            </div>
          </div>
        </div>

        {/* Search & Top Action Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Tìm theo tên thợ, phong cách (Street, Retro, Hàn Quốc), địa điểm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-xl border-slate-200 focus:border-violet-500 focus:ring-violet-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Nút GPS định vị nhanh */}
              <button
                type="button"
                onClick={handleLocateUser}
                disabled={isLocatingUser}
                className={`h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                  userCoords
                    ? 'bg-emerald-600 text-white shadow-emerald-200 ring-2 ring-emerald-300'
                    : 'bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200'
                }`}
                title={userCoords ? 'Đang lọc theo GPS của bạn' : 'Lấy vị trí GPS hiện tại'}
              >
                {isLocatingUser ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Navigation className={`w-3.5 h-3.5 ${userCoords ? 'text-white' : 'text-violet-600'}`} />
                )}
                <span className="hidden sm:inline">
                  {userCoords ? 'GPS: Bật' : 'Gần tôi nhất'}
                </span>
              </button>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-11 px-3.5 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="rating">Đánh giá cao nhất</option>
                  <option value="distance">📍 Gần tôi nhất (Khoảng cách)</option>
                  <option value="popular">Nhiều lượt chụp nhất</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                </select>
                <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="md:hidden flex items-center gap-2 h-11 px-4 bg-violet-50 text-violet-700 border border-violet-200 rounded-xl text-sm font-semibold hover:bg-violet-100"
              >
                <Filter className="w-4 h-4" />
                Bộ lọc
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 bg-violet-600 text-white rounded-full text-xs flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Category Chips */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả thể loại
            </button>
            {PHOTOGRAPHY_CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h2 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                <SlidersHorizontal className="w-4 h-4 text-violet-600" />
                Bộ lọc nâng cao
              </h2>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Xóa lọc ({activeFiltersCount})
                </button>
              )}
            </div>

            {/* Khu vực / Thành phố theo Tab & Dropdown */}
            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                <span>Địa điểm / Thành phố</span>
                {selectedDistrict !== 'all' && (
                  <span className="text-[10px] text-violet-600 font-bold">Đang lọc</span>
                )}
              </label>

              {/* Quick Tabs */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {['all', 'TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Quận 1', 'Quận 3'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDistrict(d)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedDistrict === d
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {d === 'all' ? 'Tất cả' : d}
                  </button>
                ))}
              </div>

              <CityLocationPicker
                value={selectedDistrict === 'all' ? '' : selectedDistrict}
                onChange={(val) => setSelectedDistrict(val || 'all')}
                placeholder="Chọn thành phố / quận..."
                variant="input-field"
              />
            </div>

            {/* Bán kính tìm kiếm (Radius Filter) */}
            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                <span>Bán kính tìm kiếm</span>
                {maxRadiusKm > 0 && (
                  <span className="text-[10px] text-violet-600 font-bold">≤ {maxRadiusKm} km</span>
                )}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { value: 0, label: 'Tất cả' },
                  { value: 5, label: '5 km' },
                  { value: 10, label: '10 km' },
                  { value: 25, label: '25 km' },
                ].map((rad) => (
                  <button
                    key={rad.value}
                    type="button"
                    onClick={() => setMaxRadiusKm(rad.value)}
                    className={`h-8 rounded-lg text-xs font-semibold border transition-all ${
                      maxRadiusKm === rad.value
                        ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {rad.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">
                {userCoords
                  ? '🎯 Đang tính khoảng cách từ tọa độ GPS của bạn'
                  : '💡 Bấm "Gần tôi nhất" để tự động đo khoảng cách'}
              </p>
            </div>

            {/* Đánh giá tối thiểu */}
            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                Đánh giá tối thiểu
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 0, label: 'Mọi đánh giá' },
                  { value: 4.5, label: '4.5+ ⭐' },
                  { value: 4.8, label: '4.8+ ⭐' },
                  { value: 4.9, label: '4.9+ ⭐' },
                ].map(r => (
                  <button
                    key={r.value}
                    onClick={() => setMinRating(r.value)}
                    className={`h-9 rounded-lg text-xs font-semibold border transition-all ${
                      minRating === r.value
                        ? 'bg-violet-600 text-white border-violet-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Verification & Ready Status Toggles */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-700">Đã xác minh KYC</span>
                </div>
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-slate-700">Sẵn sàng nhận lịch ngay</span>
                </div>
                <input
                  type="checkbox"
                  checked={readyToWorkOnly}
                  onChange={(e) => setReadyToWorkOnly(e.target.checked)}
                  className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
                />
              </label>
            </div>

            {/* Escrow Guarantee Badge */}
            <div className="mt-6 p-3.5 rounded-xl bg-gradient-to-br from-violet-50 to-pink-50 border border-violet-100">
              <div className="flex items-center gap-2 text-violet-900 font-bold text-xs mb-1">
                <ShieldCheck className="w-4 h-4 text-violet-600" />
                Bảo Vệ Escrow 48H
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Tiền cọc được giữ an toàn. Chỉ giải ngân cho thợ sau khi bạn nhận và hài lòng với bộ ảnh.
              </p>
            </div>
          </aside>

          {/* Results Column */}
          <main className="col-span-1 lg:col-span-3">
            {allPhotographers.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200 max-w-xl mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">
                  Chưa có nhiếp ảnh gia nào được duyệt KYC (Clean Slate)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Hệ thống đang ở trạng thái tinh khiết không có dữ liệu mẫu giả định. FLASHY áp dụng quy trình thẩm định danh tính và thiết bị nghiêm ngặt. Khi thợ ảnh đăng ký và được quản trị viên duyệt KYC, danh sách sẽ hiển thị ngay tại đây.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/become-photographer">
                    <Button className="bg-brand text-white font-bold rounded-xl text-xs h-10 px-5 shadow-sm">
                      <Sparkles className="w-4 h-4 mr-1.5" />
                      Trở thành thợ chụp & Nộp KYC
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="rounded-xl text-xs h-10 px-5 font-semibold">
                      ← Về trang chủ
                    </Button>
                  </Link>
                </div>
              </div>
            ) : filteredPhotographers.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <div className="w-16 h-16 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Không tìm thấy thợ phù hợp</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                  Hãy thử mở rộng tiêu chí tìm kiếm, đổi quận/huyện hoặc xóa bớt các bộ lọc hiện tại.
                </p>
                <Button onClick={clearAllFilters} variant="outline" className="rounded-xl">
                  Xóa tất cả bộ lọc
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              /* GRID VIEW */
              <div>
                {/* Banner khi đang kích hoạt GPS */}
                {userCoords && (
                  <div className="mb-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 px-4 flex items-center justify-between text-xs text-emerald-900 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                        <Navigation className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <p className="font-bold">Đang đề xuất thợ theo tọa độ GPS của bạn</p>
                        <p className="text-[11px] text-emerald-700">
                          {userCoords.latitude.toFixed(4)}° N, {userCoords.longitude.toFixed(4)}° E • Đang sắp xếp khoảng cách tăng dần
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setUserCoords(null); setSortBy('rating') }}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-100/60 text-emerald-700 font-bold rounded-lg border border-emerald-200 transition-colors text-[11px]"
                    >
                      Tắt định vị
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredPhotographers.map((p) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="overflow-hidden rounded-2xl border-slate-200/80 hover:shadow-xl hover:border-violet-300 transition-all duration-300 group flex flex-col h-full bg-white">
                        
                        {/* Cover & Portfolio Carousel Preview */}
                        <div className="relative h-48 bg-slate-100 overflow-hidden">
                          <Image
                            src={p.portfolio_photos?.[0] || p.cover_image_url || '/hero-bg.jpg'}
                            alt={p.display_name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {p.distanceKm !== undefined && (
                                <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-emerald-400">
                                  <Navigation className="w-2.5 h-2.5" />
                                  Cách {formatDistance(p.distanceKm)}
                                </span>
                              )}
                              {p.is_sponsored && (
                                <span className="bg-amber-400 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 fill-slate-950" />
                                  Nổi bật
                                </span>
                              )}
                              {p.badges?.includes('Star of the Quarter') && (
                                <span className="bg-violet-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                  <Award className="w-3 h-3" />
                                  Star Q1
                                </span>
                              )}
                            </div>

                            {p.is_ready_to_work && (
                              <span className="bg-emerald-500/90 backdrop-blur-sm text-white font-semibold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                Sẵn sàng
                              </span>
                            )}
                          </div>

                        {/* Price Tag on Cover */}
                        <div className="absolute bottom-3 left-3 text-white">
                          <p className="text-[11px] text-white/80 font-medium">Giá bắt đầu từ</p>
                          <p className="text-lg font-black text-white leading-tight">
                            {formatVND(p.starting_price || 350000)}
                          </p>
                        </div>
                      </div>

                      {/* Profile Card Body */}
                      <CardContent className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Avatar & Name */}
                          <div className="flex items-start gap-3 mb-2.5">
                            <div className="relative w-11 h-11 rounded-full ring-2 ring-white shadow-md overflow-hidden flex-shrink-0 -mt-7 bg-white">
                              <Image
                                src={p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                                alt={p.display_name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-violet-600 transition-colors">
                                  {p.display_name}
                                </h3>
                                {p.is_verified && (
                                  <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-slate-500 flex items-center gap-1 truncate mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {p.district}, {p.city}
                              </p>
                            </div>
                          </div>

                          {/* Rating & Stats */}
                          <div className="flex items-center gap-3 text-xs py-2 border-y border-slate-100 my-2">
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>{p.average_rating?.toFixed(2)}</span>
                            </div>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600 font-medium">
                              {p.review_count} đánh giá
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600 font-medium">
                              {p.completed_orders_count} đơn
                            </span>
                          </div>

                          {/* Bio */}
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                            {p.bio}
                          </p>

                          {/* Specialties Tags */}
                          <div className="flex flex-wrap gap-1 mb-4">
                            {p.specialties?.slice(0, 3).map((s, idx) => (
                              <span
                                key={idx}
                                className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-md"
                              >
                                {s}
                              </span>
                            ))}
                            {(p.specialties?.length || 0) > 3 && (
                              <span className="text-slate-400 text-[10px] font-medium self-center">
                                +{(p.specialties?.length || 0) - 3}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                          <Link href={`/photographers/${p.slug}`} className="w-full">
                            <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-semibold h-9">
                              Xem hồ sơ
                            </Button>
                          </Link>
                          <Link href={`/book/${p.id}`} className="w-full">
                            <Button size="sm" className="w-full rounded-xl text-xs font-semibold h-9 bg-brand hover:opacity-90">
                              Đặt lịch
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                </div>
              </div>
            ) : (
              /* MAP VIEW */
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-violet-400" />
                      Bản đồ Nhiếp ảnh gia quanh khu vực
                    </h3>
                    <p className="text-xs text-slate-400">
                      {userCoords
                        ? 'Đang trực quan hóa bán kính các thợ ảnh xung quanh vị trí GPS của bạn'
                        : 'Bấm vào các vị trí để xem chi tiết thợ ảnh trong bán kính phục vụ'}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-violet-400 text-violet-300 text-xs">
                    {userCoords ? 'GPS Live Radius' : 'PostGIS Geolocation Demo'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
                  {/* Left Column: Interactive Map Graphic / Pins */}
                  <div className="md:col-span-2 relative bg-slate-100 p-6 flex flex-col justify-between overflow-hidden min-h-[420px]">
                    {/* Stylized Map Grid Lines */}
                    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px]" />
                    
                    {/* Simulated River / Saigon River curve */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M-50,100 Q150,300 300,200 T600,400" fill="none" stroke="#0284c7" strokeWidth="32" strokeLinecap="round" />
                    </svg>

                    {/* Photographer Pin Markers */}
                    <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-6 my-auto">
                      {filteredPhotographers.map((p) => {
                        const isSelected = selectedMapPhotographer === p.id
                        return (
                          <button
                            key={p.id}
                            onClick={() => setSelectedMapPhotographer(p.id)}
                            className={`p-2 rounded-2xl border text-left transition-all backdrop-blur-md ${
                              isSelected
                                ? 'bg-violet-600 text-white shadow-xl scale-105 border-white ring-4 ring-violet-200'
                                : 'bg-white/90 text-slate-800 shadow-md hover:bg-white border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-6 h-6 rounded-full overflow-hidden relative flex-shrink-0">
                                <Image
                                  src={p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                                  alt={p.display_name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <span className="font-bold text-xs truncate">{p.district}</span>
                            </div>
                            <p className={`text-[11px] font-semibold truncate ${isSelected ? 'text-violet-100' : 'text-slate-600'}`}>
                              {p.display_name}
                            </p>
                            <div className="flex items-center justify-between text-[10px] mt-1">
                              <span className="font-bold">{formatVND(p.starting_price || 350000)}</span>
                              {p.distanceKm !== undefined ? (
                                <span className={`font-bold ${isSelected ? 'text-emerald-200' : 'text-emerald-600'}`}>
                                  📍 {formatDistance(p.distanceKm)}
                                </span>
                              ) : (
                                <span>⭐ {p.average_rating}</span>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    <div className="relative z-10 self-start bg-white/85 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600">
                      {userCoords ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                          <Navigation className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                          Vị trí của bạn: {userCoords.latitude.toFixed(4)}° N, {userCoords.longitude.toFixed(4)}° E
                        </span>
                      ) : (
                        <span>📍 Mặc định: Trung tâm Quận 1 (10.7769° N, 106.7009° E)</span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Selected Photographer Detail Drawer */}
                  <div className="p-5 border-l border-slate-200 flex flex-col justify-between bg-white">
                    {(() => {
                      const p = allPhotographers.find(x => x.id === selectedMapPhotographer) || allPhotographers[0]
                      if (!p) return null
                      return (
                        <div>
                          <div className="relative h-36 rounded-xl overflow-hidden mb-3">
                            <Image
                              src={p.portfolio_photos?.[0] || p.cover_image_url || '/hero-bg.jpg'}
                              alt={p.display_name}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-2 left-2 text-white">
                              <p className="text-[10px] text-white/80">Khởi điểm từ</p>
                              <p className="text-base font-black">{formatVND(p.starting_price || 350000)}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-slate-900 text-base">{p.display_name}</h4>
                            {p.is_verified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                          </div>

                          <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {p.address}
                          </p>

                          <div className="flex items-center gap-2 text-xs py-1.5 border-y border-slate-100 mb-2">
                            <span className="text-amber-500 font-bold">⭐ {p.average_rating}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600">{p.review_count} đánh giá</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-emerald-600 font-medium">Bán kính {p.service_radius_km}km</span>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                            {p.bio}
                          </p>

                          <div className="space-y-2 mt-4">
                            <Link href={`/book/${p.id}`} className="block">
                              <Button className="w-full bg-brand hover:opacity-90 rounded-xl font-bold text-xs h-10">
                                Đặt lịch ngay ({formatVND(p.starting_price || 350000)})
                              </Button>
                            </Link>
                            <Link href={`/photographers/${p.slug}`} className="block">
                              <Button variant="outline" className="w-full rounded-xl font-semibold text-xs h-10">
                                Xem portfolio chi tiết
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative ml-auto w-full max-w-xs bg-white h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                  <h3 className="font-bold text-slate-900 text-base">Bộ lọc tìm kiếm</h3>
                  <button onClick={() => setShowMobileFilters(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* District / City */}
                <div className="mb-5">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Địa điểm / Thành phố</label>
                  <CityLocationPicker
                    value={selectedDistrict === 'all' ? '' : selectedDistrict}
                    onChange={(val) => setSelectedDistrict(val || 'all')}
                    placeholder="Chọn thành phố / quận..."
                    variant="input-field"
                  />
                </div>

                {/* Min rating */}
                <div className="mb-5">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Đánh giá sao</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 0, label: 'Tất cả' },
                      { value: 4.5, label: '4.5+ ⭐' },
                      { value: 4.8, label: '4.8+ ⭐' },
                      { value: 4.9, label: '4.9+ ⭐' },
                    ].map(r => (
                      <button
                        key={r.value}
                        onClick={() => setMinRating(r.value)}
                        className={`h-9 rounded-lg text-xs font-semibold border ${
                          minRating === r.value
                            ? 'bg-violet-600 text-white border-violet-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <span className="text-xs font-medium text-slate-700">Đã xác minh KYC</span>
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                      className="rounded text-violet-600"
                    />
                  </label>
                  <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <span className="text-xs font-medium text-slate-700">Sẵn sàng nhận lịch</span>
                    <input
                      type="checkbox"
                      checked={readyToWorkOnly}
                      onChange={(e) => setReadyToWorkOnly(e.target.checked)}
                      className="rounded text-violet-600"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex gap-2">
                <Button variant="outline" onClick={clearAllFilters} className="flex-1 rounded-xl text-xs">
                  Xóa lọc
                </Button>
                <Button onClick={() => setShowMobileFilters(false)} className="flex-1 rounded-xl text-xs bg-violet-600 text-white">
                  Áp dụng ({filteredPhotographers.length})
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function PhotographersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PhotographersContent />
    </Suspense>
  )
}
