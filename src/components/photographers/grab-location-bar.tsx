'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Navigation,
  MapPin,
  Search,
  Crosshair,
  Sparkles,
  Check,
  X,
  Loader2,
  AlertCircle,
  Clock,
  Coffee,
  Building2,
  TreePine,
  Landmark,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  getCurrentUserCoordinates,
  reverseGeocodeLocation,
  searchGeocodedLocations,
  POPULAR_SHOOTING_SPOTS,
  type ShootingSpot,
} from '@/lib/geolocation'

export interface ActiveLocationCenter {
  lat: number
  lng: number
  name: string
  district?: string
  city?: string
  isGps: boolean
}

interface GeoSuggestion {
  name: string
  address: string
  displayName?: string
  lat: number
  lng: number
  lon?: number
  category?: string
}

interface GrabLocationBarProps {
  activeCenter: ActiveLocationCenter
  onSelectCenter: (center: ActiveLocationCenter) => void
  onModeChange?: (mode: 'gps' | 'custom') => void
  currentMode: 'gps' | 'custom'
  gpsError: string | null
  setGpsError: (err: string | null) => void
}

// ── Custom debounce hook 300ms ─────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

// ── Category icon helper ───────────────────────────────────────────────────────
function SpotIcon({ category }: { category?: string }) {
  const cat = (category || '').toLowerCase()
  if (cat.includes('cafe') || cat.includes('coffee'))
    return <Coffee className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
  if (cat.includes('studio') || cat.includes('building'))
    return <Building2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
  if (cat.includes('park') || cat.includes('công viên'))
    return <TreePine className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
  if (cat.includes('landmark') || cat.includes('biểu tượng'))
    return <Landmark className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
  return <MapPin className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
}

export default function GrabLocationBar({
  activeCenter,
  onSelectCenter,
  onModeChange,
  currentMode,
  gpsError,
  setGpsError,
}: GrabLocationBarProps) {
  const [isLocating, setIsLocating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [recentSelections, setRecentSelections] = useState<GeoSuggestion[]>([])

  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isSelectingRef = useRef(false)
  const debouncedQuery = useDebounce(searchQuery, 300)

  // ── Live Geocoding: Nominatim search sau 300ms debounce ───────────────────
  useEffect(() => {
    if (isSelectingRef.current) {
      isSelectingRef.current = false
      return
    }
    const clean = debouncedQuery.trim()
    if (!clean || clean.length < 2) {
      setSuggestions([])
      setIsSearching(false)
      return
    }
    let cancelled = false
    setIsSearching(true)
    searchGeocodedLocations(clean)
      .then((results) => {
        if (!cancelled) {
          setSuggestions(results.slice(0, 5))
          setShowDropdown(true)
        }
      })
      .catch(() => {
        if (!cancelled) setSuggestions([])
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false)
      })
    return () => {
      cancelled = true
    }
  }, [debouncedQuery])

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
        setActiveIdx(-1)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // ── GPS Locate ────────────────────────────────────────────────────────────
  const handleLocateGPS = async () => {
    setIsLocating(true)
    setGpsError(null)
    try {
      const coords = await getCurrentUserCoordinates()
      const geo = await reverseGeocodeLocation(coords.latitude, coords.longitude)
      onSelectCenter({
        lat: coords.latitude,
        lng: coords.longitude,
        name: geo.formattedAddress,
        district: geo.district,
        city: geo.city,
        isGps: true,
      })
      if (onModeChange) onModeChange('gps')
    } catch (err: any) {
      setGpsError(err?.message || 'Không thể lấy vị trí GPS. Vui lòng cho phép quyền định vị.')
    } finally {
      setIsLocating(false)
    }
  }

  // ── Chọn địa điểm → cập nhật center → map.flyTo([lat, lon], 16) sẽ chạy qua useEffect ───
  const handleSelectSuggestion = useCallback(
    (item: GeoSuggestion) => {
      isSelectingRef.current = true
      const lat = item.lat
      const lon = item.lon ?? item.lng
      const placeDisplayName = item.displayName || item.name || item.address

      onSelectCenter({
        lat,
        lng: lon,
        name: placeDisplayName,
        district: item.address ? item.address.split(',')[0].trim() : undefined,
        isGps: false,
      })
      if (onModeChange) onModeChange('custom')

      // Lưu lịch sử chọn gần đây (tối đa 3)
      setRecentSelections((prev) => {
        const filtered = prev.filter(
          (r) => !(Math.abs(r.lat - lat) < 0.001 && Math.abs(r.lng - lon) < 0.001)
        )
        return [item, ...filtered].slice(0, 3)
      })

      // Đóng Dropdown gợi ý và cập nhật lại tên địa điểm trên ô input
      setSearchQuery(placeDisplayName)
      setSuggestions([])
      setShowDropdown(false)
      setActiveIdx(-1)
    },
    [onSelectCenter, onModeChange]
  )

  // ── Keyboard: ArrowUp / ArrowDown / Enter / Escape ────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
        e.preventDefault()
        setIsSearching(true)
        searchGeocodedLocations(searchQuery.trim()).then((results) => {
          setIsSearching(false)
          if (results.length > 0) {
            handleSelectSuggestion(results[0])
          }
        })
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const pick = activeIdx >= 0 ? suggestions[activeIdx] : suggestions[0]
      if (pick) handleSelectSuggestion(pick)
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      setActiveIdx(-1)
      inputRef.current?.blur()
    }
  }

  const showingDropdown =
    showDropdown && currentMode === 'custom' &&
    (isSearching || suggestions.length > 0 || searchQuery.length >= 2)

  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/90 shadow-sm mb-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-violet-600" />
            Định vị thợ chụp — Chuẩn Grab/Marketplace
          </span>
          <h3 className="font-black text-slate-900 text-sm mt-1">
            Chọn điểm chụp để tính khoảng cách &amp; phụ thu di chuyển
          </h3>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => { if (onModeChange) onModeChange('gps'); if (!activeCenter.isGps) handleLocateGPS() }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentMode === 'gps' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            Vị trí hiện tại
          </button>
          <button
            type="button"
            onClick={() => { if (onModeChange) onModeChange('custom') }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentMode === 'custom' ? 'bg-violet-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Điểm chụp tùy chọn
          </button>
        </div>
      </div>

      {/* ── Mode 1: GPS ──────────────────────────────────────────────────────── */}
      {currentMode === 'gps' && (
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-xs">
                  {activeCenter.isGps ? 'Đang dùng GPS của bạn' : 'Chưa kích hoạt GPS'}
                </span>
                {activeCenter.isGps && (
                  <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">● Bật</span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5 truncate max-w-xs">
                {activeCenter.name}{' '}
                <span className="font-mono text-[10px] text-slate-400">
                  ({activeCenter.lat.toFixed(4)}°N, {activeCenter.lng.toFixed(4)}°E)
                </span>
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={handleLocateGPS}
            disabled={isLocating}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold h-9 px-4 shadow-sm shrink-0"
          >
            {isLocating ? (
              <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Đang lấy GPS...</>
            ) : (
              <><Crosshair className="w-3.5 h-3.5 mr-1.5" />{activeCenter.isGps ? 'Cập nhật GPS' : 'Kích hoạt GPS'}</>
            )}
          </Button>
        </div>
      )}

      {/* ── Mode 2: Tìm kiếm địa điểm tùy chọn ─────────────────────────────── */}
      {currentMode === 'custom' && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 relative" ref={dropdownRef}>

            {/* Input + Dropdown */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Gõ địa điểm: Landmark 81, Cafe Cộng, Hồ Hoàn Kiếm, đường Nguyễn Huệ..."
                value={searchQuery}
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowDropdown(true)
                  setActiveIdx(-1)
                }}
                onFocus={() => setShowDropdown(true)}
                onKeyDown={handleKeyDown}
                className="pl-10 pr-9 h-11 rounded-xl text-xs border-slate-200 focus:border-violet-500 focus:ring-violet-500"
              />

              {/* Spinner / Clear button */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isSearching && <Loader2 className="w-3.5 h-3.5 text-violet-500 animate-spin" />}
                {searchQuery && !isSearching && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setSuggestions([]); setShowDropdown(false); inputRef.current?.focus() }}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* ── Autocomplete Dropdown ──────────────────────────────────── */}
              {showingDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl z-[100] overflow-hidden">

                  {/* Loading */}
                  {isSearching && (
                    <div className="px-4 py-3 flex items-center gap-2.5 text-xs text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin text-violet-500 flex-shrink-0" />
                      Đang tìm kiếm trên OpenStreetMap...
                    </div>
                  )}

                  {/* Results */}
                  {!isSearching && suggestions.length > 0 && (
                    <>
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100">
                        📍 {suggestions.length} kết quả phù hợp
                      </div>
                      {suggestions.map((item, idx) => {
                        const parts = (item.displayName || item.name || '').split(',').map((p) => p.trim())
                        const title = item.name || parts[0]
                        const cleanSubtitle = parts.slice(1).filter((p) => !/^\d{5,6}$/.test(p) && p !== 'Việt Nam').join(', ') || item.address
                        return (
                          <button
                            key={`${item.lat}-${item.lng}-${idx}`}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(item) }}
                            onMouseEnter={() => setActiveIdx(idx)}
                            className={`w-full px-3.5 py-2.5 text-left flex items-start gap-2.5 border-b border-slate-100 last:border-0 transition-colors ${
                              activeIdx === idx ? 'bg-violet-50' : 'hover:bg-violet-50/60'
                            }`}
                          >
                            <SpotIcon category={item.category} />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-xs text-slate-900 truncate">{title}</p>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5" title={item.displayName || item.address}>
                                {cleanSubtitle || item.displayName || item.address}
                              </p>
                            </div>
                            {item.category && (
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex-shrink-0 self-center">
                                {item.category.replace('OSM: ', '')}
                              </span>
                            )}
                            {activeIdx === idx && <Check className="w-3.5 h-3.5 text-violet-500 flex-shrink-0 self-center" />}
                          </button>
                        )
                      })}
                      <div className="px-3 py-2 text-[10px] text-slate-400 bg-slate-50/70 border-t border-slate-100">
                        ↵ Enter chọn đầu tiên &nbsp;·&nbsp; ↑↓ Điều hướng &nbsp;·&nbsp; Esc Đóng
                      </div>
                    </>
                  )}

                  {/* No results */}
                  {!isSearching && suggestions.length === 0 && searchQuery.length >= 2 && (
                    <div className="p-4 text-center">
                      <MapPin className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                      <p className="text-xs font-semibold text-slate-600">Không tìm thấy địa điểm phù hợp</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Thử từ khóa khác hoặc bấm trực tiếp lên{' '}
                        <strong className="text-violet-600">bản đồ</strong> để ghim vị trí.
                      </p>
                    </div>
                  )}

                  {/* Hint khi chưa gõ đủ */}
                  {!isSearching && suggestions.length === 0 && searchQuery.length < 2 && (
                    <div className="p-3 text-[11px] text-slate-500">
                      <p className="font-semibold mb-1">💡 Thử tìm:</p>
                      <ul className="space-y-0.5 text-slate-400 list-disc list-inside">
                        <li>Đường Nguyễn Huệ, Quận 1</li>
                        <li>Landmark 81, Bình Thạnh</li>
                        <li>Hồ Hoàn Kiếm, Hà Nội</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Active Center Badge */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-50 border border-violet-200 text-xs min-w-0 sm:max-w-[210px]">
              <MapPin className="w-4 h-4 text-violet-600 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-violet-700 font-bold block">Điểm chụp đang chọn:</span>
                <span className="font-bold text-slate-900 text-xs truncate block">{activeCenter.name}</span>
              </div>
            </div>
          </div>

          {/* Quick Popular Spot Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] text-slate-400 font-bold whitespace-nowrap mr-1 shrink-0">🔥 Điểm hot:</span>
            {POPULAR_SHOOTING_SPOTS.slice(0, 6).map((spot) => {
              const isActive = activeCenter.name.includes(spot.name)
              return (
                <button
                  key={spot.id}
                  type="button"
                  onClick={() => handleSelectSuggestion({ name: spot.name, address: spot.address, lat: spot.lat, lng: spot.lng, category: spot.category })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                    isActive
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700'
                  }`}
                >
                  {spot.category === 'cafe' && '☕ '}
                  {spot.category === 'studio' && '🏢 '}
                  {spot.category === 'park' && '🌿 '}
                  {spot.category === 'landmark' && '🏛️ '}
                  {spot.name.split('&')[0].trim()}
                </button>
              )
            })}
          </div>

          {/* Recent selections */}
          {recentSelections.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] text-slate-400 font-bold whitespace-nowrap mr-1 shrink-0 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Gần đây:
              </span>
              {recentSelections.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap border bg-slate-50 text-slate-700 border-slate-200 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 transition-all shrink-0 max-w-[160px] truncate"
                >
                  📍 {item.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── GPS Error Alert ───────────────────────────────────────────────────── */}
      {gpsError && (
        <div className="mt-3 bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <p className="font-semibold">{gpsError}</p>
          </div>
          <button type="button" onClick={() => setGpsError(null)} className="text-rose-400 hover:text-rose-600 ml-2 flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

