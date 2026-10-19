'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { MapPin, ChevronDown, X, Search, Navigation, Loader2 } from 'lucide-react'
import { VN_CITIES } from '@/lib/constants'
import {
  getCurrentUserCoordinates,
  findNearestDistrict,
  type Coordinates
} from '@/lib/geolocation'

// ─── District data per city ───────────────────────────────────────────────────
export const CITY_DISTRICTS: Record<string, string[]> = {
  'TP. Hồ Chí Minh': [
    'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6',
    'Quận 7', 'Quận 8', 'Quận 10', 'Quận 11', 'Quận 12',
    'Bình Thạnh', 'Phú Nhuận', 'Tân Bình', 'Tân Phú',
    'Gò Vấp', 'Bình Tân', 'TP. Thủ Đức',
  ],
  'Hà Nội': [
    'Hoàn Kiếm', 'Ba Đình', 'Đống Đa', 'Hai Bà Trưng',
    'Hoàng Mai', 'Thanh Xuân', 'Cầu Giấy', 'Nam Từ Liêm',
    'Bắc Từ Liêm', 'Long Biên', 'Tây Hồ',
  ],
  'Đà Nẵng': [
    'Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn',
    'Liên Chiểu', 'Cẩm Lệ', 'Hoà Vang',
  ],
  'Cần Thơ': [
    'Ninh Kiều', 'Bình Thuỷ', 'Cái Răng', 'Ô Môn', 'Thốt Nốt',
  ],
  'Nha Trang': ['Lộc Thọ', 'Vạn Thạnh', 'Vĩnh Nguyên', 'Vĩnh Hải', 'Phương Sơn'],
  'Đà Lạt': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6'],
  'Vũng Tàu': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 7', 'Thắng Nhất', 'Thắng Tam'],
  'Huế': ['Phú Hội', 'Vĩnh Ninh', 'Phước Vĩnh', 'An Hoà', 'Hương Long', 'Kim Long'],
  'Quảng Ninh': ['Hạ Long', 'Cẩm Phả', 'Uông Bí', 'Móng Cái'],
  'Hải Phòng': ['Hồng Bàng', 'Ngô Quyền', 'Lê Chân', 'Hải An', 'Kiến An', 'Đồ Sơn'],
  'Hội An': ['Minh An', 'Sơn Phong', 'Cẩm Phô', 'Cẩm Châu', 'Cẩm An', 'Cửa Đại'],
  'Phú Quốc': ['Dương Đông', 'An Thới', 'Dương Tơ', 'Cửa Cạn'],
}

const HOT_CITIES = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Đà Lạt']

export const HCMC_DISTRICTS = CITY_DISTRICTS['TP. Hồ Chí Minh']

export interface SelectedLocationData {
  location: string
  district?: string
  city?: string
  coordinates?: Coordinates
  isCurrentLocation?: boolean
}

interface CityLocationPickerProps {
  value: string
  onChange: (location: string) => void
  onLocationSelect?: (data: SelectedLocationData) => void
  placeholder?: string
  variant?: 'hero-glass' | 'input-field'
  align?: 'left' | 'right' | 'auto'
  className?: string
  buttonClassName?: string
}

export function CityLocationPicker({
  value,
  onChange,
  onLocationSelect,
  placeholder = 'Chọn thành phố',
  variant = 'hero-glass',
  align = 'auto',
  className = '',
  buttonClassName = '',
}: CityLocationPickerProps) {
  const isHero = variant === 'hero-glass'

  const getSelectedCity = (val: string) => {
    if (!val) return ''
    if (VN_CITIES.includes(val)) return val
    const parts = val.split(',')
    const cityPart = parts[parts.length - 1]?.trim()
    return VN_CITIES.find(c => c === cityPart || cityPart?.includes(c)) || VN_CITIES[0]
  }

  const [isOpen, setIsOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState<string>(() => getSelectedCity(value) || VN_CITIES[0])
  const [filterQuery, setFilterQuery] = useState('')
  const [dropdownStyles, setDropdownStyles] = useState<React.CSSProperties>({})
  const [isMounted, setIsMounted] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setIsMounted(true) }, [])

  useEffect(() => {
    if (value) {
      const city = getSelectedCity(value)
      if (city) setSelectedCity(city)
    }
  }, [value])

  const recalcPosition = useCallback(() => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const vpWidth = window.innerWidth
    const panelWidth = Math.min(420, vpWidth - 24)
    let left = rect.left
    if (left + panelWidth > vpWidth - 12) {
      left = Math.max(12, rect.right - panelWidth)
    }
    setDropdownStyles({
      position: 'fixed',
      top: rect.bottom + 6,
      left,
      width: panelWidth,
      zIndex: 9999,
    })
  }, [])

  useEffect(() => {
    if (!isOpen) return
    recalcPosition()
    window.addEventListener('scroll', recalcPosition, true)
    window.addEventListener('resize', recalcPosition)
    return () => {
      window.removeEventListener('scroll', recalcPosition, true)
      window.removeEventListener('resize', recalcPosition)
    }
  }, [isOpen, recalcPosition])

  useEffect(() => {
    if (!isOpen) return
    const handle = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        const portal = document.getElementById('flashy-location-portal')
        if (portal && portal.contains(e.target as Node)) return
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    document.addEventListener('touchstart', handle)
    return () => {
      document.removeEventListener('mousedown', handle)
      document.removeEventListener('touchstart', handle)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false) }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setLocationError(null)
      setTimeout(() => searchRef.current?.focus(), 60)
    }
  }, [isOpen])

  const handleGetCurrentLocation = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setIsLocating(true)
    setLocationError(null)
    try {
      const coords = await getCurrentUserCoordinates()
      const geocoded = findNearestDistrict(coords)
      if (geocoded.city) {
        setSelectedCity(geocoded.city)
      }
      const targetLocation = geocoded.district || geocoded.formattedAddress
      onChange(targetLocation)
      onLocationSelect?.({
        location: targetLocation,
        district: geocoded.district,
        city: geocoded.city,
        coordinates: coords,
        isCurrentLocation: true
      })
      setIsOpen(false)
    } catch (err: any) {
      setLocationError(err?.message || 'Không thể lấy vị trí hiện tại.')
    } finally {
      setIsLocating(false)
    }
  }

  const handleSelectCity = (city: string) => {
    setSelectedCity(city)
    setFilterQuery('')
    onChange(city)
    onLocationSelect?.({
      location: city,
      city,
      isCurrentLocation: false
    })
  }

  const handleSelectDistrict = (district: string) => {
    onChange(district)
    setIsOpen(false)
    setFilterQuery('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onChange('')
    setFilterQuery('')
  }

  const districts = CITY_DISTRICTS[selectedCity] ?? []
  const filteredDistricts = filterQuery
    ? districts.filter(d => d.toLowerCase().includes(filterQuery.toLowerCase()))
    : districts

  const filteredCities = filterQuery
    ? VN_CITIES.filter(c => c.toLowerCase().includes(filterQuery.toLowerCase()))
    : VN_CITIES

  const displayLabel = value || placeholder

  const triggerButton = isHero ? (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      className={`flex items-center gap-2.5 w-full h-11 bg-white/10 hover:bg-white/15 active:scale-[0.99] text-white rounded-xl px-3.5 text-xs sm:text-sm font-medium transition-all text-left border border-white/10 hover:border-white/20 group backdrop-blur-md shadow-sm ${buttonClassName}`}
    >
      <div className="w-6 h-6 rounded-lg bg-violet-500/25 text-violet-300 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/35 transition-colors">
        <MapPin className="w-3.5 h-3.5" />
      </div>
      <span className="flex-1 truncate">{displayLabel}</span>
      <ChevronDown className={`w-4 h-4 text-white/50 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180 text-white' : 'group-hover:text-white/80'}`} />
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      className={`flex items-center gap-2.5 w-full h-11 px-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 transition-all text-left shadow-sm ${buttonClassName}`}
    >
      <div className="w-6 h-6 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
        <MapPin className="w-3.5 h-3.5" />
      </div>
      <span className="flex-1 truncate">{displayLabel}</span>
      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180 text-slate-700' : ''}`} />
    </button>
  )

  const panel = (
    <div
      id="flashy-location-portal"
      role="dialog"
      aria-label="Chọn địa điểm chụp ảnh"
      onClick={e => e.stopPropagation()}
      className={`rounded-2xl shadow-2xl border overflow-hidden flex flex-col ${isHero ? 'bg-slate-900/97 border-white/10 text-white backdrop-blur-2xl' : 'bg-white border-slate-200 text-slate-900'}`}
      style={dropdownStyles}
    >
      <div className={`flex items-center justify-between px-3.5 pt-3 pb-2.5 border-b ${isHero ? 'border-white/10' : 'border-slate-100'}`}>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
          <span className={`text-[11px] font-bold uppercase tracking-widest ${isHero ? 'text-violet-300' : 'text-violet-600'}`}>
            Chọn địa điểm
          </span>
        </div>
        <div className="flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className={`text-[10px] font-semibold flex items-center gap-0.5 px-2 py-0.5 rounded-full transition-colors ${isHero ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10' : 'text-rose-500 hover:bg-rose-50'}`}
            >
              <X className="w-3 h-3" />
              Bỏ chọn
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${isHero ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:bg-slate-100'}`}
            aria-label="Đóng"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className={`px-3 py-2 border-b ${isHero ? 'border-white/10' : 'border-slate-100'}`}>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Tìm tỉnh / quận..."
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            onClick={e => e.stopPropagation()}
            className={`w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border outline-none transition-all ${isHero ? 'bg-slate-800/80 border-slate-700/70 text-white placeholder:text-slate-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-violet-400'}`}
          />
          {filterQuery && (
            <button type="button" onClick={e => { e.stopPropagation(); setFilterQuery('') }} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Nút Lấy Vị trí GPS Hiện tại (Tương tự Grab / Shopee) */}
      <div className={`px-3 py-2 border-b ${isHero ? 'border-white/10 bg-slate-800/30' : 'border-slate-100 bg-violet-50/40'}`}>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
            isHero
              ? 'bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 hover:from-violet-600/50 hover:to-fuchsia-600/50 text-white border border-violet-500/30 shadow-sm'
              : 'bg-white hover:bg-violet-100/70 text-violet-700 border border-violet-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isHero ? 'bg-violet-500/30 text-violet-300' : 'bg-violet-100 text-violet-600'
            }`}>
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
              ) : (
                <Navigation className="w-3.5 h-3.5 text-violet-500 group-hover:scale-110 transition-transform" />
              )}
            </div>
            <div className="text-left">
              <p className="font-bold leading-tight flex items-center gap-1.5">
                <span>{isLocating ? 'Đang xác định vị trí...' : 'Sử dụng vị trí hiện tại'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </p>
              <p className={`text-[10px] ${isHero ? 'text-slate-400' : 'text-slate-500'}`}>
                Tự động đề xuất thợ ảnh & studio gần nhất
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isHero ? 'bg-violet-500/30 text-violet-200' : 'bg-violet-100 text-violet-700'
          }`}>
            GPS
          </span>
        </button>

        {locationError && (
          <p className="text-[11px] text-rose-500 mt-1.5 px-1 leading-snug">
            ⚠️ {locationError}
          </p>
        )}
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden" style={{ maxHeight: 320 }}>
        <div className={`flex flex-col w-36 flex-shrink-0 overflow-y-auto border-r [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${isHero ? 'border-white/10 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
          {filteredCities.length === 0 ? (
            <p className="text-[11px] text-slate-400 text-center py-6 px-2">Không tìm thấy</p>
          ) : (
            filteredCities.map(city => {
              const isActive = city === selectedCity
              const isHot = HOT_CITIES.includes(city)
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleSelectCity(city)}
                  className={`flex items-center gap-1 w-full text-left px-3 py-2.5 text-xs font-medium transition-all relative ${isActive ? (isHero ? 'bg-violet-600/20 text-violet-200 font-bold' : 'bg-violet-50 text-violet-700 font-bold') : (isHero ? 'text-slate-300 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')}`}
                >
                  {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-violet-500" />}
                  <span className="pl-1 truncate leading-tight flex-1">{city}</span>
                  {isHot && !isActive && (
                    <span className={`flex-shrink-0 text-[8px] font-black uppercase px-1 py-px rounded ${isHero ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-600'}`}>Hot</span>
                  )}
                </button>
              )
            })
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 [scrollbar-width:thin] [scrollbar-color:#64748b_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-500/50">
          <div className="mb-2.5">
            <button
              type="button"
              onClick={() => { onChange(selectedCity); setIsOpen(false); setFilterQuery('') }}
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all ${value === selectedCity ? 'bg-violet-600 text-white border-violet-500 shadow-sm' : (isHero ? 'bg-violet-600/15 text-violet-300 border-violet-500/30 hover:bg-violet-600/25' : 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100')}`}
            >
              <MapPin className="w-3 h-3 flex-shrink-0" />
              Toàn bộ {selectedCity}
            </button>
          </div>

          <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isHero ? 'text-slate-500' : 'text-slate-400'}`}>
            Quận / Huyện
          </p>

          {filteredDistricts.length === 0 ? (
            <p className="text-[11px] text-slate-400 py-4 text-center">Không tìm thấy quận nào</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {filteredDistricts.map(district => {
                const isSelected = value === district
                return (
                  <button
                    key={district}
                    type="button"
                    onClick={() => handleSelectDistrict(district)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all active:scale-95 ${isSelected ? 'bg-violet-600 text-white border-violet-500 shadow-sm' : (isHero ? 'bg-slate-700/60 text-slate-200 border-slate-600/50 hover:bg-slate-700 hover:border-violet-500/50 hover:text-white' : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50')}`}
                  >
                    {district}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className={`px-3.5 py-2 border-t text-[10px] ${isHero ? 'border-white/10 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
        💡 Chọn tỉnh/thành hoặc quận cụ thể để lọc thợ ảnh • Nhấn <kbd className={`px-1 py-px rounded text-[9px] font-mono ${isHero ? 'bg-white/10' : 'bg-slate-100'}`}>Esc</kbd> để đóng
      </div>
    </div>
  )

  return (
    <div
      ref={containerRef}
      className={`w-full relative ${isOpen ? 'z-[70]' : 'z-20'} ${className}`}
    >
      {triggerButton}
      {isOpen && isMounted && createPortal(panel, document.body)}
    </div>
  )
}
