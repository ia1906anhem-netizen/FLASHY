'use client'

import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
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
  Compass,
  Car
} from 'lucide-react'
import { getApprovedProviders, seedMockPhotographers, type ApprovedProvider } from '@/lib/data/booking-store'
import { PHOTOGRAPHY_CATEGORIES } from '@/lib/constants'
import { formatVND } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { CityLocationPicker, type SelectedLocationData } from '@/components/shared/city-location-picker'
import GrabLocationBar, { type ActiveLocationCenter } from '@/components/photographers/grab-location-bar'
import {
  calculateHaversineDistance,
  formatDistance,
  calculateTravelSurcharge,
  reverseGeocodeLocation,
  getCurrentUserCoordinates,
  findNearestDistrict,
  getCoordinatesByLocation,
  searchGeocodedLocations,
  type GeocodedLocationItem,
  TRAVEL_SURCHARGE_FREE_RADIUS_KM,
  TRAVEL_SURCHARGE_RATE_PER_KM,
  type Coordinates
} from '@/lib/geolocation'
import type { Photographer, PhotographerWithDistance } from '@/types'
export type { PhotographerWithDistance }

// Dynamic import of Leaflet Map component with SSR disabled
const PhotographerMapView = dynamic(
  () => import('@/components/photographers/photographer-map-view'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[580px] w-full rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600 mb-2" />
        <span className="font-semibold text-xs">Đang tải bản đồ OpenStreetMap & định vị thợ ảnh...</span>
      </div>
    ),
  }
)

// Category filter chips with thumbnail images and micro-copy tooltips
const CATEGORY_VISUALS = [
  {
    value: 'lifestyle',
    label: 'Lifestyle',
    thumb: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=64&h=64&fit=crop',
    tooltip: 'Chụp ảnh đời thường, cafe, dạo phố tự nhiên',
  },
  {
    value: 'street',
    label: 'Street',
    thumb: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=64&h=64&fit=crop',
    tooltip: 'Streetwear & đô thị sáng tạo',
  },
  {
    value: 'couple',
    label: 'Chụp đôi',
    thumb: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=64&h=64&fit=crop',
    tooltip: 'Chụp cặp đôi lãng mạn, couple shoot',
  },
  {
    value: 'quick_date',
    label: 'Cafe / Date',
    thumb: 'https://images.unsplash.com/photo-1507081323647-4d250478b919?w=64&h=64&fit=crop',
    tooltip: 'Quick date: chụp nhanh tại cafe, check-in',
  },
  {
    value: 'tet_ao_dai',
    label: 'Áo dài / Tết',
    thumb: 'https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=64&h=64&fit=crop',
    tooltip: 'Áo dài truyền thống, ảnh Tết, lễ hội',
  },
  {
    value: 'graduation',
    label: 'Kỷ yếu',
    thumb: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=64&h=64&fit=crop',
    tooltip: 'Kỷ yếu tốt nghiệp, ảnh lớp học',
  },
  {
    value: 'outdoor',
    label: 'Dã ngoại',
    thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=64&h=64&fit=crop',
    tooltip: 'Outdoor, dã ngoại, thiên nhiên',
  },
  {
    value: 'travel',
    label: 'Du lịch',
    thumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=64&h=64&fit=crop',
    tooltip: 'Ảnh du lịch, check-in địa điểm',
  },
  {
    value: 'concept',
    label: 'Concept',
    thumb: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=64&h=64&fit=crop',
    tooltip: 'Ảnh concept sáng tạo, nghệ thuật',
  },
] as const

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
    bio: `Chuyên ${p.specialty.split('·')[0].trim()} • ${p.district || p.city}`,
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
    portfolio_photos: p.portfolio || [p.cover],
    portfolio: p.portfolio || [],
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
  
  // Grab-Style Geolocation State (2 Chế độ định vị)
  const [geolocationMode, setGeolocationMode] = useState<'gps' | 'custom'>('gps')
  const [activeCenter, setActiveCenter] = useState<ActiveLocationCenter>({
    lat: 10.7769,
    lng: 106.7009,
    name: 'Trung tâm Quận 1, TP. Hồ Chí Minh',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    isGps: false,
  })
  const [isLocatingUser, setIsLocatingUser] = useState(false)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [maxRadiusKm, setMaxRadiusKm] = useState<number>(0) // 0 = Không giới hạn

  // Live Geocoding Search States (Kết nối ô input tìm kiếm với bản đồ Leaflet)
  const [searchSuggestions, setSearchSuggestions] = useState<GeocodedLocationItem[]>([])
  const [isSearchingGeocode, setIsSearchingGeocode] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [activeSearchIdx, setActiveSearchIdx] = useState(-1)
  // Flag: true khi người dùng đã chọn 1 địa điểm (không phải tìm tên thợ)
  const [isLocationSearch, setIsLocationSearch] = useState(false)
  const isSelectingSearchRef = useRef(false)
  const mainSearchDropdownRef = useRef<HTMLDivElement>(null)

  // ── Live Geocoding: Tự động tìm kiếm tọa độ sau 400ms debounce khi gõ ô input ──
  useEffect(() => {
    if (isSelectingSearchRef.current) {
      isSelectingSearchRef.current = false
      return
    }

    const clean = searchQuery.trim()
    if (!clean || clean.length < 2) {
      setSearchSuggestions([])
      setIsSearchingGeocode(false)
      setIsLocationSearch(false) // Xóa input → reset về tìm kiếm thông thường
      return
    }

    // Người dùng đang gõ thủ công → reset flag địa điểm
    setIsLocationSearch(false)

    let cancelled = false
    setIsSearchingGeocode(true)
    const timer = setTimeout(() => {
      searchGeocodedLocations(clean)
        .then((results) => {
          if (!cancelled) {
            setSearchSuggestions(results.slice(0, 5))
            if (results.length > 0) {
              setShowSearchDropdown(true)
            }
          }
        })
        .catch(() => {
          if (!cancelled) setSearchSuggestions([])
        })
        .finally(() => {
          if (!cancelled) setIsSearchingGeocode(false)
        })
    }, 400)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [searchQuery])


  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (mainSearchDropdownRef.current && !mainSearchDropdownRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false)
        setActiveSearchIdx(-1)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // Xử lý khi chọn gợi ý địa điểm từ dropdown hoặc nhấn Enter
  const handleSelectLocation = useCallback((item: GeocodedLocationItem) => {
    isSelectingSearchRef.current = true
    const lat = item.lat
    const lon = item.lon ?? item.lng
    const placeName = item.displayName || item.name

    // 1. Cập nhật lại mốc điểm chụp trung tâm (`selectedLocation` / `activeCenter`)
    const newCenter: ActiveLocationCenter = {
      lat,
      lng: lon,
      name: placeName,
      district: item.address ? item.address.split(',')[0].trim() : undefined,
      isGps: false,
    }
    setActiveCenter(newCenter)
    setGeolocationMode('custom')

    // 2. Chuyển sang chế độ Bản đồ & tự động sắp xếp theo khoảng cách
    setViewMode('map')
    setSortBy('distance')
    setIsLocationSearch(true) // Đánh dấu: đang tìm theo địa điểm, không lọc thợ

    // 3. Đóng Dropdown gợi ý và cập nhật lại tên địa điểm trên ô input
    setSearchQuery(placeName)
    setSearchSuggestions([])
    setShowSearchDropdown(false)
    setActiveSearchIdx(-1)

    // 4. Kích hoạt chuyển vùng bản đồ: map.flyTo([parseFloat(lat), parseFloat(lon)], 15, { animate: true, duration: 1.5 })
    // Dispatch event để map component (nếu đang mounted) fly ngay lập tức
    if (typeof window !== 'undefined') {
      // Dùng setTimeout để đảm bảo map component đã mount sau khi setViewMode('map') render xong
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('flashy_fly_to_location', {
            detail: { lat, lon, name: placeName },
          })
        )
      }, 100)
    }
  }, [])

  // Xử lý sự kiện onKeyDown khi người dùng nhấn phím ENTER (e.key === 'Enter')
  const handleSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const inputValue = searchQuery.trim()
      if (!inputValue) return

      // Nếu đang mở dropdown và đã chọn mục bằng phím mũi tên
      if (showSearchDropdown && searchSuggestions.length > 0 && activeSearchIdx >= 0) {
        handleSelectLocation(searchSuggestions[activeSearchIdx])
        return
      }

      setIsSearchingGeocode(true)
      let foundLat: number | null = null
      let foundLon: number | null = null
      let foundName: string = inputValue

      // 1. Thực hiện fetch tới API Nominatim:
      // https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputValue)}&countrycodes=vn&limit=1
      try {
        const apiUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputValue)}&countrycodes=vn&limit=1`
        const res = await fetch(apiUrl, {
          headers: { 'Accept-Language': 'vi' },
        })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            foundLat = parseFloat(data[0].lat)
            foundLon = parseFloat(data[0].lon)
            foundName = data[0].display_name || data[0].name || inputValue
          }
        }
      } catch {
        // Fallback
      }

      // 2. Nếu API ngoài bị timeout hoặc không kết nối được, fallback sang danh bạ điểm chụp nội bộ (có sẵn HUB, các trường ĐH, địa danh)
      if (foundLat === null || foundLon === null || isNaN(foundLat) || isNaN(foundLon)) {
        const localResults = await searchGeocodedLocations(inputValue)
        if (localResults.length > 0) {
          foundLat = localResults[0].lat
          foundLon = localResults[0].lon ?? localResults[0].lng
          foundName = localResults[0].displayName || localResults[0].name || inputValue
        }
      }

      setIsSearchingGeocode(false)

      if (foundLat !== null && foundLon !== null && !isNaN(foundLat) && !isNaN(foundLon)) {
        handleSelectLocation({
          name: foundName,
          address: foundName,
          displayName: foundName,
          lat: foundLat,
          lng: foundLon,
          lon: foundLon,
        })
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveSearchIdx((i) => Math.min(i + 1, searchSuggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveSearchIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Escape') {
      setShowSearchDropdown(false)
      setActiveSearchIdx(-1)
    }
  }

  // Load verified photographers from store (Clean slate compliant)
  useEffect(() => {
    // Auto-seed 6 demo photographers on first load
    seedMockPhotographers()
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

  // Handle URL search params on mount
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
        const parsedLat = parseFloat(lat)
        const parsedLng = parseFloat(lng)
        reverseGeocodeLocation(parsedLat, parsedLng).then((geo) => {
          setActiveCenter({
            lat: parsedLat,
            lng: parsedLng,
            name: geo.formattedAddress,
            district: geo.district,
            city: geo.city,
            isGps: nearby === 'true',
          })
        })
        if (nearby === 'true') {
          setSortBy('distance')
          setGeolocationMode('gps')
        }
      }
    }
  }, [searchParams])

  // Toggle GPS: Bật / Tắt với navigator.geolocation.getCurrentPosition
  const handleToggleGps = async () => {
    if (activeCenter.isGps) {
      // Tắt GPS, trở về mốc mặc định
      setActiveCenter({
        lat: 10.7769,
        lng: 106.7009,
        name: 'Trung tâm Quận 1, TP. Hồ Chí Minh',
        district: 'Quận 1',
        city: 'TP. Hồ Chí Minh',
        isGps: false,
      })
      setSortBy('rating')
      return
    }

    setIsLocatingUser(true)
    setGpsError(null)
    try {
      const coords = await getCurrentUserCoordinates()
      const geo = await reverseGeocodeLocation(coords.latitude, coords.longitude)
      setActiveCenter({
        lat: coords.latitude,
        lng: coords.longitude,
        name: geo.formattedAddress,
        district: geo.district,
        city: geo.city,
        isGps: true,
      })
      setGeolocationMode('gps')
      setSortBy('distance')
    } catch (err: any) {
      setGpsError(err?.message || 'Không thể lấy vị trí. Vui lòng cho phép quyền định vị trong cài đặt trình duyệt.')
    } finally {
      setIsLocatingUser(false)
    }
  }

  // Handle map click to place custom shooting pin
  const handleMapClickPin = async (coords: { lat: number; lng: number }) => {
    const geo = await reverseGeocodeLocation(coords.lat, coords.lng)
    setActiveCenter({
      lat: coords.lat,
      lng: coords.lng,
      name: `Điểm ghim: ${geo.formattedAddress}`,
      district: geo.district,
      city: geo.city,
      isGps: false,
    })
    setGeolocationMode('custom')
  }

  // Calculate dynamic distance to active center using Haversine formula
  const filteredPhotographers = useMemo(() => {
    return allPhotographers
      .map(p => {
        let distanceKm: number | undefined = undefined
        if (p.latitude && p.longitude) {
          distanceKm = calculateHaversineDistance(
            activeCenter.lat,
            activeCenter.lng,
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
          // Nếu người dùng đã chọn 1 địa điểm (isLocationSearch = true), giữ tất cả thợ để sắp xếp theo khoảng cách
          if (!isLocationSearch) {
            const q = searchQuery.toLowerCase()
            // Kiểm tra nếu query khớp với địa điểm hiện tại (activeCenter) thì không lọc thợ
            const isLocationQuery =
              activeCenter.name.toLowerCase().includes(q) ||
              q.includes(activeCenter.name.toLowerCase()) ||
              (activeCenter.district ? activeCenter.district.toLowerCase().includes(q) : false)

            if (!isLocationQuery) {
              const matchName = p.display_name.toLowerCase().includes(q)
              const matchBio = p.bio?.toLowerCase().includes(q)
              const matchDistrict = p.district?.toLowerCase().includes(q)
              const matchSpecialties = p.specialties?.some(s => s.toLowerCase().includes(q))
              if (!matchName && !matchBio && !matchDistrict && !matchSpecialties) {
                // Nếu đang gõ và có gợi ý địa điểm (typing mode), giữ thợ lại để show cùng dropdown
                if (searchSuggestions.length === 0) {
                  return false
                }
              }
            }
          }
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
  }, [allPhotographers, searchQuery, selectedCategory, selectedDistrict, minRating, verifiedOnly, readyToWorkOnly, sortBy, activeCenter, maxRadiusKm, isLocationSearch, searchSuggestions.length])

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedCategory !== 'all') count++
    if (selectedDistrict !== 'all') count++
    if (minRating > 0) count++
    if (verifiedOnly) count++
    if (readyToWorkOnly) count++
    if (maxRadiusKm > 0) count++
    if (activeCenter.isGps) count++
    return count
  }, [selectedCategory, selectedDistrict, minRating, verifiedOnly, readyToWorkOnly, maxRadiusKm, activeCenter.isGps])

  const clearAllFilters = () => {
    setSearchQuery('')
    setSearchSuggestions([])
    setIsLocationSearch(false)
    setSelectedCategory('all')
    setSelectedDistrict('all')
    setMinRating(0)
    setMaxRadiusKm(0)
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

            {/* 1. View Mode Toggle (Dạng lưới & Bản đồ) */}
            <div className="flex items-center gap-2 self-start md:self-auto bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Grid className="w-4 h-4 flex-shrink-0" />
                <span>Dạng lưới</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'map'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MapIcon className="w-4 h-4 flex-shrink-0" />
                <span>Bản đồ</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Grab-Style Geolocation 2-Mode Bar */}
        <GrabLocationBar
          activeCenter={activeCenter}
          onSelectCenter={(newCenter) => {
            setActiveCenter(newCenter)
            setViewMode('map')
          }}
          onModeChange={setGeolocationMode}
          currentMode={geolocationMode}
          gpsError={gpsError}
          setGpsError={setGpsError}
        />

        {/* Search & Top Action Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1" ref={mainSearchDropdownRef}>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Tìm theo địa điểm chụp (Đại học Ngân hàng, Landmark 81...), tên thợ, phong cách..."
                value={searchQuery}
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSearchDropdown(true)
                  setActiveSearchIdx(-1)
                }}
                onFocus={() => {
                  if (searchSuggestions.length > 0) setShowSearchDropdown(true)
                }}
                onKeyDown={handleSearchKeyDown}
                className="pl-10 pr-9 h-11 rounded-xl border-slate-200 focus:border-violet-500 focus:ring-violet-500 text-xs"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isSearchingGeocode && <Loader2 className="w-3.5 h-3.5 text-violet-500 animate-spin" />}
                {searchQuery && !isSearchingGeocode && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setSearchSuggestions([])
                      setShowSearchDropdown(false)
                      setIsLocationSearch(false)
                    }}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dropdown danh sách 5 kết quả gợi ý địa chỉ dưới thanh tìm kiếm khi đang gõ */}
              {showSearchDropdown && (isSearchingGeocode || searchSuggestions.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">
                  {isSearchingGeocode && (
                    <div className="px-4 py-3 flex items-center gap-2.5 text-xs text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin text-violet-500 flex-shrink-0" />
                      Đang tìm kiếm tọa độ địa điểm...
                    </div>
                  )}
                  {!isSearchingGeocode && searchSuggestions.length > 0 && (
                    <>
                      <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 border-b border-violet-100 flex items-center justify-between">
                        <span>📍 Gợi ý địa điểm bản đồ (Bấm để bay tới)</span>
                        <span className="text-[10px] text-slate-400 font-normal">OpenStreetMap</span>
                      </div>
                      {searchSuggestions.map((item, idx) => {
                        const parts = (item.displayName || item.name || '').split(',').map((p) => p.trim())
                        const title = item.name || parts[0]
                        const cleanSubtitle = parts.slice(1).filter((p) => !/^\d{5,6}$/.test(p) && p !== 'Việt Nam').join(', ') || item.address
                        return (
                          <button
                            key={`search-sug-${item.lat}-${item.lng}-${idx}`}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault()
                              handleSelectLocation(item)
                            }}
                            onMouseEnter={() => setActiveSearchIdx(idx)}
                            className={`w-full px-3.5 py-2.5 text-left flex items-start gap-2.5 border-b border-slate-100 last:border-0 transition-colors ${
                              activeSearchIdx === idx ? 'bg-violet-50' : 'hover:bg-violet-50/60'
                            }`}
                          >
                            <MapPin className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-xs text-slate-900 truncate">{title}</p>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5" title={item.displayName}>
                                {cleanSubtitle || item.displayName || item.address}
                              </p>
                            </div>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex-shrink-0 self-center">
                              {item.category?.replace('OSM: ', '') || 'Địa điểm'}
                            </span>
                          </button>
                        )
                      })}
                      <div className="px-3.5 py-2 text-[10px] text-slate-400 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                        <span>↵ Nhấn Enter chọn địa điểm đầu tiên</span>
                        <span>↑↓ Điều hướng</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center flex-wrap sm:flex-nowrap gap-2">
              {/* Nút "Gần tôi nhất" với icon MapPin chuẩn từ lucide-react */}
              <button
                type="button"
                onClick={() => {
                  setSortBy('distance')
                  if (!activeCenter.isGps) {
                    handleToggleGps()
                  }
                }}
                disabled={isLocatingUser}
                className={`h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs shrink-0 ${
                  activeCenter.isGps || sortBy === 'distance'
                    ? 'bg-emerald-600 text-white shadow-emerald-200 ring-2 ring-emerald-300'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}
                title="Lọc thợ ảnh gần vị trí của bạn nhất"
              >
                {isLocatingUser ? (
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                ) : (
                  <MapPin className={`w-4 h-4 flex-shrink-0 ${activeCenter.isGps || sortBy === 'distance' ? 'text-white' : 'text-emerald-600'}`} />
                )}
                <span>Gần tôi nhất</span>
              </button>

              {/* Nút "Đánh giá cao nhất" với icon Star chuẩn từ lucide-react */}
              <button
                type="button"
                onClick={() => setSortBy(sortBy === 'rating' ? 'popular' : 'rating')}
                className={`h-11 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs shrink-0 border ${
                  sortBy === 'rating'
                    ? 'bg-amber-500 text-white border-amber-600 shadow-amber-200 ring-2 ring-amber-300'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                }`}
                title="Sắp xếp theo đánh giá sao cao nhất"
              >
                <Star className={`w-4 h-4 flex-shrink-0 ${sortBy === 'rating' ? 'text-white fill-white' : 'text-amber-500 fill-amber-400'}`} />
                <span>Đánh giá cao nhất</span>
              </button>

              {/* Sort Dropdown với icon ArrowUpDown chuẩn */}
              <div className="relative min-w-[170px] shrink-0">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1.5 text-slate-500">
                  <ArrowUpDown className="w-4 h-4 flex-shrink-0 text-violet-600" />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full h-11 pl-9 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                  aria-label="Tùy chọn sắp xếp"
                >
                  <option value="rating">Đánh giá cao nhất</option>
                  <option value="distance">Gần tôi nhất</option>
                  <option value="popular">Nhiều lượt chụp nhất</option>
                  <option value="price_asc">Giá tăng dần ↑</option>
                  <option value="price_desc">Giá giảm dần ↓</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none flex-shrink-0" />
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="md:hidden flex items-center gap-2 h-11 px-3.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-xl text-xs font-bold hover:bg-violet-100 shrink-0"
              >
                <Filter className="w-4 h-4 flex-shrink-0" />
                <span>Bộ lọc</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 bg-violet-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Category Chips with thumbnail images */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === 'all'
                  ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:bg-violet-50'
              }`}
            >
              <span className="text-base">📷</span>
              <span>Tất cả</span>
            </button>
            {CATEGORY_VISUALS.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`group flex items-center gap-2 pl-1 pr-3.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.value
                    ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-violet-300 hover:shadow-sm'
                }`}
                title={cat.tooltip}
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 relative">
                  <Image
                    src={cat.thumb}
                    alt={cat.label}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="32px"
                  />
                </div>
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

            {/* 3. Live GPS Filter Widget góc trái */}
            <div className="mb-6 p-3.5 rounded-2xl border transition-all bg-gradient-to-br from-violet-50/50 to-emerald-50/50 border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${activeCenter.isGps ? 'bg-emerald-500 animate-pulse ring-2 ring-emerald-200' : 'bg-slate-300'}`} />
                  <span className="text-xs font-bold text-slate-800">
                    {activeCenter.isGps ? 'GPS Đang Bật' : 'Định vị GPS'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleGps}
                  disabled={isLocatingUser}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                    activeCenter.isGps
                      ? 'bg-emerald-600 text-white shadow-emerald-200'
                      : 'bg-white text-violet-700 border border-violet-200 hover:bg-violet-50'
                  }`}
                >
                  {isLocatingUser ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Navigation className="w-3 h-3" />
                  )}
                  <span>{activeCenter.isGps ? 'GPS: Bật' : 'Bật GPS'}</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-600 leading-relaxed space-y-1">
                <p className="font-semibold text-slate-900 line-clamp-2">
                  📍 {activeCenter.name}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {activeCenter.lat.toFixed(4)}° N, {activeCenter.lng.toFixed(4)}° E
                </p>

                {/* Clean Slate / Không có thợ trong DB hoặc bán kính */}
                {(allPhotographers.length === 0 || filteredPhotographers.length === 0) && (
                  <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200/80 text-[10px] text-amber-800 font-medium">
                    Vị trí của bạn: {activeCenter.name} - Chưa có thợ trong bán kính tìm kiếm
                  </div>
                )}
              </div>
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
                  { value: 8, label: '8 km' },
                  { value: 15, label: '15 km' },
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
              <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                🎯 Bán kính ≤ 8km: Miễn phí di chuyển. Trên 8km: Phụ phí 15.000 VNĐ/km.
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
                Tiền cọc được giữ an toàn. Chỉ giải ngân cho thợ sau khi bạn nhận và duyệt hài lòng với bộ ảnh.
              </p>
            </div>
          </aside>

          {/* Results Column */}
          <main className="col-span-1 lg:col-span-3">

            {/* Clean Slate State (Khi chưa có thợ trong DB) */}
            {allPhotographers.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-200 max-w-xl mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">
                  Chưa có nhiếp ảnh gia nào được duyệt KYC (Clean Slate)
                </h3>
                
                {/* Dòng trạng thái vị trí Clean Slate chuẩn theo yêu cầu */}
                <div className="mb-4 inline-block px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-900">
                  Vị trí của bạn: {activeCenter.name} - Chưa có thợ trong bán kính tìm kiếm
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  FLASHY vận hành 100% dữ liệu thực và áp dụng quy trình thẩm định hồ sơ, thiết bị nghiêm ngặt. Khi thợ ảnh đăng ký và được admin duyệt KYC, danh sách sẽ hiển thị ngay tại đây.
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
            ) : filteredPhotographers.length === 0 && viewMode === 'grid' ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
                <div className="w-14 h-14 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Không tìm thấy thợ phù hợp</h3>
                
                {/* Dòng trạng thái không có thợ trong bán kính */}
                <div className="mb-4 inline-block px-3 py-1 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800">
                  Vị trí của bạn: {activeCenter.name} - Chưa có thợ trong bán kính tìm kiếm
                </div>

                <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
                  Hãy thử mở rộng bán kính tìm kiếm, đổi sang thể loại khác hoặc xóa bớt các bộ lọc hiện tại.
                </p>
                <Button onClick={clearAllFilters} variant="outline" className="rounded-xl text-xs h-9">
                  Xóa tất cả bộ lọc
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              /* GRID VIEW */
              <div>
                {/* Active Center Info Banner */}
                <div className="mb-4 bg-white border border-slate-200 rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-700 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      activeCenter.isGps ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'
                    }`}>
                      {activeCenter.isGps ? (
                        <Navigation className="w-4 h-4 animate-pulse" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        {activeCenter.isGps ? 'Mốc tính khoảng cách: GPS của bạn' : 'Mốc tính khoảng cách: Điểm chụp đã chọn'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {activeCenter.name} • {filteredPhotographers.length} thợ ảnh sẵn sàng
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                      ≤ 8km: 0đ di chuyển
                    </span>
                    <button
                      type="button"
                      onClick={() => setViewMode('map')}
                      className="px-2.5 py-1 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold rounded-lg border border-violet-200 transition-colors text-[11px] flex items-center gap-1"
                    >
                      <MapIcon className="w-3.5 h-3.5" />
                      Xem trên bản đồ
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredPhotographers.map((p) => {
                    const travel = calculateTravelSurcharge(p.distanceKm)
                    const portfolioPhotos = (p.portfolio && p.portfolio.length > 0)
                      ? p.portfolio
                      : p.portfolio_photos?.length
                        ? [...p.portfolio_photos, p.cover_image_url || ''].filter(Boolean)
                        : []
                    return (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="overflow-hidden rounded-2xl border-slate-200/80 hover:shadow-2xl hover:border-violet-300 transition-all duration-300 group flex flex-col h-full bg-white">
                          
                          {/* Portfolio 2×2 Grid Preview (replaces single cover) */}
                          {portfolioPhotos.length >= 4 ? (
                            <div className="relative h-44 overflow-hidden">
                              <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5">
                                {portfolioPhotos.slice(0, 4).map((url, idx) => (
                                  <div key={idx} className="relative overflow-hidden">
                                    <Image
                                      src={url}
                                      alt={`${p.display_name} portfolio ${idx + 1}`}
                                      fill
                                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                                      sizes="200px"
                                    />
                                  </div>
                                ))}
                              </div>
                              {/* Dark overlay for readability */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />
                              {/* Hover overlay: "Xem portfolio" */}
                              <div className="absolute inset-0 bg-violet-900/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                                <span className="text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/60 backdrop-blur-sm">
                                  👁 Xem {portfolioPhotos.length} ảnh portfolio
                                </span>
                              </div>
                              {/* Top Badges */}
                              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {p.distanceKm !== undefined && (
                                    <span className={`text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border ${
                                      travel.isFree
                                        ? 'bg-emerald-600 border-emerald-400'
                                        : 'bg-amber-600 border-amber-400'
                                    }`}>
                                      <Navigation className="w-2.5 h-2.5" />
                                      {formatDistance(p.distanceKm)} {travel.isFree ? '• Free' : `(+${formatVND(travel.surcharge)})`}
                                    </span>
                                  )}
                                  {p.is_sponsored && (
                                    <span className="bg-amber-400 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                      <Sparkles className="w-3 h-3 fill-slate-950" />
                                      Nổi bật
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
                              {/* Price tag */}
                              <div className="absolute bottom-2.5 left-2.5 text-white">
                                <p className="text-[10px] text-white/80 font-medium leading-none mb-0.5">Từ</p>
                                <p className="text-base font-black text-white leading-tight">
                                  {formatVND(p.starting_price || 350000)}
                                </p>
                              </div>
                            </div>
                          ) : (
                            /* Fallback: single cover image */
                            <div className="relative h-44 bg-slate-100 overflow-hidden">
                              <Image
                                src={portfolioPhotos[0] || p.cover_image_url || '/hero-bg.jpg'}
                                alt={p.display_name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  {p.distanceKm !== undefined && (
                                    <span className={`text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border ${
                                      travel.isFree ? 'bg-emerald-600 border-emerald-400' : 'bg-amber-600 border-amber-400'
                                    }`}>
                                      <Navigation className="w-2.5 h-2.5" />
                                      {formatDistance(p.distanceKm)}
                                    </span>
                                  )}
                                </div>
                                {p.is_ready_to_work && (
                                  <span className="bg-emerald-500/90 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    Sẵn sàng
                                  </span>
                                )}
                              </div>
                              <div className="absolute bottom-2.5 left-2.5 text-white">
                                <p className="text-base font-black">{formatVND(p.starting_price || 350000)}</p>
                              </div>
                            </div>
                          )}

                          {/* Profile Card Body */}
                          <CardContent className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              {/* Avatar + Name + KYC Badge */}
                              <div className="flex items-start gap-3 mb-3">
                                <div className="relative flex-shrink-0 -mt-7">
                                  <div className="w-12 h-12 rounded-full ring-2 ring-white shadow-lg overflow-hidden bg-white">
                                    <Image
                                      src={p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                                      alt={p.display_name}
                                      width={48}
                                      height={48}
                                      className="object-cover w-full h-full"
                                    />
                                  </div>
                                  {p.is_verified && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 bg-emerald-500 rounded-full flex items-center justify-center ring-1 ring-white">
                                      <CheckCircle2 className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 pt-1">
                                  <div className="flex items-center gap-1">
                                    <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-violet-600 transition-colors">
                                      {p.display_name}
                                    </h3>
                                    {p.is_verified && (
                                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                    <span className="truncate">{p.district}, {p.city}</span>
                                  </p>
                                </div>
                                {/* Rating Badge */}
                                <div className="flex-shrink-0 flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                  <span className="text-xs font-bold text-amber-700">{p.average_rating?.toFixed(1)}</span>
                                </div>
                              </div>

                              {/* Specialty Tags (concise) */}
                              <div className="flex flex-wrap gap-1 mb-3">
                                {p.specialties?.slice(0, 3).map((s, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-violet-50 text-violet-700 border border-violet-100 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                                  >
                                    {s}
                                  </span>
                                ))}
                                {(p.specialties?.length || 0) > 3 && (
                                  <span className="text-slate-400 text-[10px] self-center">+{(p.specialties?.length || 0) - 3}</span>
                                )}
                              </div>

                              {/* Stats row */}
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2.5 mb-3">
                                <span className="font-medium">{p.review_count} đánh giá</span>
                                <span className="text-slate-200">•</span>
                                <span>{p.completed_orders_count} đơn</span>
                                {p.distanceKm !== undefined && (
                                  <>
                                    <span className="text-slate-200">•</span>
                                    <span className={travel.isFree ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                                      {travel.isFree ? `${formatDistance(p.distanceKm)} free` : `+${formatVND(travel.surcharge)}`}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-2">
                              <Link href={`/photographers/${p.slug}`} className="w-full">
                                <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-semibold h-9 border-slate-200 hover:border-violet-400 hover:text-violet-700">
                                  Xem hồ sơ
                                </Button>
                              </Link>
                              <Link
                                href={`/book/${p.id}?dist=${p.distanceKm || 0}&loc=${encodeURIComponent(activeCenter.name)}&lat=${activeCenter.lat}&lng=${activeCenter.lng}`}
                                className="w-full"
                              >
                                <Button size="sm" className="w-full rounded-xl text-xs font-semibold h-9 bg-brand hover:opacity-90">
                                  Đặt lịch
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* MAP VIEW (OpenStreetMap / Leaflet with dynamic Pins & 8km Circle) */
              <div className="h-[520px] w-full rounded-2xl relative z-0 overflow-hidden mb-8">
                <PhotographerMapView
                  photographers={filteredPhotographers}
                  centerCoords={{ lat: activeCenter.lat, lng: activeCenter.lng }}
                  centerLabel={activeCenter.name}
                  isGpsMode={activeCenter.isGps}
                  selectedPhotographerId={selectedMapPhotographer}
                  onSelectPhotographer={setSelectedMapPhotographer}
                  onMapClickPin={handleMapClickPin}
                  onSelectCenter={(newCenter) => {
                    setActiveCenter({
                      lat: newCenter.lat,
                      lng: newCenter.lng,
                      name: newCenter.name,
                      isGps: false,
                    })
                    setGeolocationMode('custom')
                  }}
                  allowMapClickPin={true}
                />
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
              className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-5 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Filter className="w-4 h-4 text-violet-600" />
                    Bộ lọc thợ ảnh
                  </h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile GPS Toggle */}
                <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Định vị GPS</span>
                    <button
                      type="button"
                      onClick={handleToggleGps}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        activeCenter.isGps ? 'bg-emerald-600 text-white' : 'bg-violet-600 text-white'
                      }`}
                    >
                      {activeCenter.isGps ? 'GPS: Bật' : 'Bật GPS'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">{activeCenter.name}</p>
                </div>

                {/* Mobile Radius */}
                <div className="mb-5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                    Bán kính tìm kiếm
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[0, 5, 8, 15].map((rad) => (
                      <button
                        key={rad}
                        onClick={() => setMaxRadiusKm(rad)}
                        className={`h-8 rounded-lg text-xs font-semibold border ${
                          maxRadiusKm === rad
                            ? 'bg-violet-600 text-white border-violet-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {rad === 0 ? 'Tất cả' : `${rad}km`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile City Picker */}
                <div className="mb-5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                    Khu vực
                  </label>
                  <CityLocationPicker
                    value={selectedDistrict === 'all' ? '' : selectedDistrict}
                    onChange={(val) => setSelectedDistrict(val || 'all')}
                    placeholder="Chọn thành phố / quận..."
                    variant="input-field"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="w-1/2 rounded-xl text-xs h-10"
                >
                  Xóa lọc
                </Button>
                <Button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-1/2 bg-brand text-white rounded-xl text-xs h-10 font-bold"
                >
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
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            <p className="text-xs font-semibold text-slate-500">Đang tải danh sách nhiếp ảnh gia...</p>
          </div>
        </div>
      }
    >
      <PhotographersContent />
    </Suspense>
  )
}
