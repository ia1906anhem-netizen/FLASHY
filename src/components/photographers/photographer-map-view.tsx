'use client'

import 'leaflet/dist/leaflet.css'
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import L from 'leaflet'
import Image from 'next/image'
import Link from 'next/link'
import {
  Navigation,
  MapPin,
  Star,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Car,
  CheckCircle2,
  AlertCircle,
  LocateFixed,
  Camera,
  X,
  ChevronRight,
  Search,
  Loader2,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatVND } from '@/lib/utils'
import {
  calculateHaversineDistance,
  formatDistance,
  calculateTravelSurcharge,
  TRAVEL_SURCHARGE_FREE_RADIUS_KM,
  TRAVEL_SURCHARGE_RATE_PER_KM,
  searchGeocodedLocations,
  type GeocodedLocationItem,
  type Coordinates
} from '@/lib/geolocation'
import type { PhotographerWithDistance } from '@/types'

interface PhotographerMapViewProps {
  photographers: PhotographerWithDistance[]
  centerCoords: { lat: number; lng: number }
  centerLabel?: string
  isGpsMode?: boolean
  selectedPhotographerId?: string | null
  onSelectPhotographer?: (id: string) => void
  onMapClickPin?: (coords: { lat: number; lng: number }) => void
  onSelectCenter?: (center: { lat: number; lng: number; name: string }) => void
  allowMapClickPin?: boolean
}

export default function PhotographerMapView({
  photographers,
  centerCoords,
  centerLabel = 'Vị trí của bạn',
  isGpsMode = false,
  selectedPhotographerId,
  onSelectPhotographer,
  onMapClickPin,
  onSelectCenter,
  allowMapClickPin = true,
}: PhotographerMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const centerCircleRef = useRef<L.Circle | null>(null)
  const centerMarkerRef = useRef<L.Marker | null>(null)
  // Track previous center to avoid unnecessary flyTo on non-center changes
  const prevCenterRef = useRef<{ lat: number; lng: number } | null>(null)

  const [activePhotographerId, setActivePhotographerId] = useState<string | null>(
    selectedPhotographerId || photographers[0]?.id || null
  )

  // ── In-Map Google Maps Live Search State ──
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const searchDropdownRef = useRef<HTMLDivElement>(null)
  const isSelectingRef = useRef(false)

  // ── Debounce 300ms gọi /api/geocode/search cho ô tìm kiếm ──
  useEffect(() => {
    if (isSelectingRef.current) {
      isSelectingRef.current = false
      return
    }
    const clean = searchQuery.trim()
    if (!clean || clean.length < 2) {
      setSuggestions([])
      setIsLoading(false)
      setIsDropdownOpen(false)
      return
    }
    let cancelled = false
    setIsLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(clean)}`)
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) {
            setSuggestions(Array.isArray(data) ? data : [])
            setIsDropdownOpen(Array.isArray(data) && data.length > 0)
          }
        }
      } catch {
        if (!cancelled) setSuggestions([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [searchQuery])

  // Đóng dropdown tìm kiếm khi click ngoài
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
        setActiveIdx(-1)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // Chọn địa điểm từ gợi ý trên bản đồ → flyTo mượt mà & cập nhật vị trí trung tâm
  const handleSelectSuggestion = useCallback(
    (item: any) => {
      isSelectingRef.current = true
      const lat = parseFloat(item.lat)
      const lon = parseFloat(item.lon ?? item.lng)
      const title = item.name || item.display_name?.split(',')[0] || 'Địa điểm'
      const placeDisplayName = item.display_name || title

      // Kích hoạt lệnh map.flyTo([lat, lon], 15, { animate: true, duration: 1.5 })
      if (mapInstanceRef.current && !isNaN(lat) && !isNaN(lon)) {
        mapInstanceRef.current.flyTo([lat, lon], 15, {
          animate: true,
          duration: 1.5,
        })
      }

      // Đóng Dropdown gợi ý và cập nhật lại tên địa điểm trên ô input
      setSearchQuery(title)
      setSuggestions([])
      setIsDropdownOpen(false)
      setActiveIdx(-1)

      // Cập nhật lại ghim vị trí trung tâm (Center Marker) và tự động tính toán lại khoảng cách
      if (onSelectCenter && !isNaN(lat) && !isNaN(lon)) {
        onSelectCenter({ lat, lng: lon, name: placeDisplayName })
      }
    },
    [onSelectCenter]
  )

  // Lắng nghe sự kiện bay bản đồ từ ô tìm kiếm bên ngoài (window custom event)
  useEffect(() => {
    function handleFlyEvent(e: any) {
      const { lat, lon } = e.detail || {}
      if (mapInstanceRef.current && lat && lon) {
        const parsedLat = parseFloat(lat)
        const parsedLon = parseFloat(lon)
        mapInstanceRef.current.flyTo([parsedLat, parsedLon], 15, {
          animate: true,
          duration: 1.5,
        })
        // Đồng bộ prevCenterRef để useEffect centerCoords không fly kép
        prevCenterRef.current = { lat: parsedLat, lng: parsedLon }
      }
    }
    window.addEventListener('flashy_fly_to_location', handleFlyEvent)
    return () => {
      window.removeEventListener('flashy_fly_to_location', handleFlyEvent)
    }
  }, [])

  // Keyboard navigation cho ô tìm kiếm trên bản đồ (Enter / Arrow keys / Esc)
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || suggestions.length === 0) {
      if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
        e.preventDefault()
        setIsLoading(true)
        fetch(`/api/geocode/search?q=${encodeURIComponent(searchQuery.trim())}`)
          .then((r) => r.json())
          .then((data) => {
            if (Array.isArray(data) && data.length > 0) {
              handleSelectSuggestion(data[0])
            }
          })
          .finally(() => setIsLoading(false))
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
      setIsDropdownOpen(false)
      setActiveIdx(-1)
    }
  }

  // Sync internal state with external prop
  useEffect(() => {
    if (selectedPhotographerId) {
      setActivePhotographerId(selectedPhotographerId)
    }
  }, [selectedPhotographerId])

  const selectedPhotographer = useMemo(() => {
    return photographers.find((p) => p.id === activePhotographerId) || photographers[0] || null
  }, [photographers, activePhotographerId])

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    // Ensure Leaflet default images don't 404
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    if (!mapInstanceRef.current) {
      const defaultLat = centerCoords?.lat || 10.7769
      const defaultLng = centerCoords?.lng || 106.7009

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 16,
        zoomControl: false,
      })

      // Add zoom control to top-right
      L.control.zoom({ position: 'topright' }).addTo(map)

      // Add OpenStreetMap France mirror tile layer (ổn định, không CORS tại Việt Nam)
      L.tileLayer('https://a.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; OpenStreetMap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        crossOrigin: true,
      }).addTo(map)

      // Layer group for dynamic markers
      const markersLayer = L.layerGroup().addTo(map)
      markersLayerRef.current = markersLayer

      // Map Click event for placing custom shooting location pin
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onMapClickPin) {
          onMapClickPin({ lat: e.latlng.lat, lng: e.latlng.lng })
        }
        map.flyTo([e.latlng.lat, e.latlng.lng], 16, { animate: true, duration: 1.5 })
      })

      mapInstanceRef.current = map

      // Tự động nhận diện lại khung hình mới sau 100ms
      const t100 = setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize()
      }, 100)
      const t300 = setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize()
      }, 300)

      return () => {
        clearTimeout(t100)
        clearTimeout(t300)
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
          markersLayerRef.current = null
        }
      }
    }
  }, [])

  // ResizeObserver to automatically invalidate size whenever the container gets dimensions
  useEffect(() => {
    if (!mapContainerRef.current) return
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize()
      }
    })
    resizeObserver.observe(mapContainerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // ── FlyTo: Chỉ bay về tọa độ mới khi centerCoords thực sự thay đổi ──
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    const prev = prevCenterRef.current
    const lat = centerCoords?.lat || 10.7769
    const lng = centerCoords?.lng || 106.7009
    // Bỏ qua nếu tọa độ không thay đổi (tránh flyTo khi marker click)
    if (prev && Math.abs(prev.lat - lat) < 0.00001 && Math.abs(prev.lng - lng) < 0.00001) return
    prevCenterRef.current = { lat, lng }
    map.flyTo([lat, lng], 15, { animate: true, duration: 1.5 })
  }, [centerCoords])

  // Update center marker, circle, and photographer markers
  useEffect(() => {
    const map = mapInstanceRef.current
    const markersLayer = markersLayerRef.current
    if (!map || !markersLayer) return

    map.invalidateSize()
    markersLayer.clearLayers()

    const centerLat = centerCoords?.lat || 10.7769
    const centerLng = centerCoords?.lng || 106.7009

    // 1. Center Circle (8km Free Travel Radius - Grab/Shopee Food Standard)
    if (centerCircleRef.current) {
      centerCircleRef.current.remove()
    }
    const circle = L.circle([centerLat, centerLng], {
      radius: 8000,
      pathOptions: {
        fillColor: '#8b5cf6',
        fillOpacity: 0.15,
        color: '#7c3aed',
        weight: 2,
      },
      fillColor: '#8b5cf6',
      fillOpacity: 0.15,
      color: '#7c3aed',
      weight: 2,
    } as any).addTo(map)

    circle.bindTooltip(`Bán kính 8km: Miễn phí di chuyển thợ chụp`, {
      sticky: true,
      className: 'text-xs font-semibold px-2 py-1 rounded-lg bg-white shadow-md text-violet-900 border border-violet-200',
    })
    centerCircleRef.current = circle

    // 2. Center Pin (Customer location or custom shooting pin)
    const centerIconHtml = `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
        <span class="absolute w-10 h-10 rounded-full ${isGpsMode ? 'bg-emerald-500/30 ring-4 ring-emerald-400/40' : 'bg-violet-500/30 ring-4 ring-violet-400/40'} animate-ping"></span>
        <div class="w-8 h-8 rounded-full ${isGpsMode ? 'bg-emerald-600' : 'bg-violet-600'} text-white shadow-xl flex items-center justify-center border-2 border-white ring-2 ${isGpsMode ? 'ring-emerald-300' : 'ring-violet-300'}">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
            <circle cx="12" cy="9" r="2.5" fill="currentColor"></circle>
          </svg>
        </div>
      </div>
    `
    const centerIcon = L.divIcon({
      html: centerIconHtml,
      className: 'flashy-center-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    })

    if (centerMarkerRef.current) {
      centerMarkerRef.current.remove()
    }
    const centerMarker = L.marker([centerCoords.lat, centerCoords.lng], { icon: centerIcon })
      .addTo(map)
      .bindPopup(
        `<div class="p-2 text-xs font-sans">
          <p class="font-bold text-slate-900">${isGpsMode ? '📍 GPS Vị trí của bạn' : '🎯 Mốc điểm chụp được chọn'}</p>
          <p class="text-slate-600 text-[11px] mt-0.5">${centerLabel}</p>
          <p class="text-violet-700 font-semibold text-[10px] mt-1">Bán kính 8km: Miễn phí di chuyển thợ ảnh</p>
        </div>`
      )
    centerMarker.openPopup()
    centerMarkerRef.current = centerMarker

    // 3. Photographer Markers
    photographers.forEach((p) => {
      if (!p.latitude || !p.longitude) return

      const distance = calculateHaversineDistance(
        centerCoords.lat,
        centerCoords.lng,
        p.latitude,
        p.longitude
      )
      const isFreeTravel = distance <= TRAVEL_SURCHARGE_FREE_RADIUS_KM
      const isSelected = p.id === activePhotographerId

      const markerHtml = `
        <div class="relative cursor-pointer transition-all duration-200 transform -translate-x-1/2 -translate-y-full hover:scale-110 ${isSelected ? 'scale-110 z-50' : 'z-20'}">
          <div class="flex flex-col items-center">
            <div class="px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md whitespace-nowrap mb-1 flex items-center gap-1 ${
              isSelected
                ? 'bg-violet-600 text-white ring-2 ring-white'
                : 'bg-white text-slate-800 border border-slate-200'
            }">
              <span>${formatVND(p.starting_price || 350000)}</span>
              <span class="${isFreeTravel ? 'text-emerald-500 font-extrabold' : 'text-amber-500 font-extrabold'}">
                • ${formatDistance(distance)}
              </span>
            </div>
            <div class="relative w-9 h-9 rounded-full overflow-hidden border-2 shadow-lg ${
              isSelected
                ? 'border-violet-600 ring-4 ring-violet-200'
                : isFreeTravel
                ? 'border-emerald-500 ring-2 ring-emerald-100'
                : 'border-amber-500 ring-2 ring-amber-100'
            } bg-white">
              <img src="${p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}" alt="${p.display_name}" class="w-full h-full object-cover" />
            </div>
            <div class="w-2 h-2 rotate-45 -mt-1 ${isSelected ? 'bg-violet-600' : 'bg-white'} border-r border-b ${isSelected ? 'border-violet-600' : 'border-slate-300'}"></div>
          </div>
        </div>
      `

      const photogIcon = L.divIcon({
        html: markerHtml,
        className: 'flashy-photog-marker',
        iconSize: [60, 60],
        iconAnchor: [30, 60],
      })

      const marker = L.marker([p.latitude, p.longitude], { icon: photogIcon }).addTo(markersLayer)
      marker.on('click', () => {
        setActivePhotographerId(p.id)
        if (onSelectPhotographer) {
          onSelectPhotographer(p.id)
        }
        if (mapInstanceRef.current && p.latitude && p.longitude) {
          mapInstanceRef.current.panTo([p.latitude, p.longitude], { animate: true })
        }
        setTimeout(() => {
          const cardElem = document.getElementById(`photog-card-${p.id}`)
          if (cardElem) {
            cardElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }
        }, 50)
      })
    })

  }, [centerCoords, centerLabel, photographers, activePhotographerId, isGpsMode])

  // Recenter map on user's active center
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([centerCoords.lat, centerCoords.lng], 15, { duration: 1.2 })
    }
  }

  // Selected Photographer Travel Calculation
  const selectedDistance = useMemo(() => {
    if (!selectedPhotographer || !selectedPhotographer.latitude || !selectedPhotographer.longitude) return null
    return calculateHaversineDistance(
      centerCoords.lat,
      centerCoords.lng,
      selectedPhotographer.latitude,
      selectedPhotographer.longitude
    )
  }, [selectedPhotographer, centerCoords])

  const travelSurcharge = useMemo(() => {
    return calculateTravelSurcharge(selectedDistance)
  }, [selectedDistance])

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col lg:flex-row h-auto lg:h-[520px] w-full">
      {/* Fix Tailwind CSS Preflight tile distortion */}
      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-container img {
          max-width: none !important;
          max-height: none !important;
        }
      ` }} />
      
      {/* Map Interactive Canvas */}
      <div className="relative w-full lg:flex-1 h-[520px] bg-slate-100 overflow-hidden">
        
        {/* Leaflet Map Div */}
        <div
          ref={mapContainerRef}
          className="h-[520px] w-full rounded-2xl relative z-0 overflow-hidden"
          style={{ height: '520px', width: '100%' }}
        />

        {/* Top Google Maps Floating Search Bar & Status */}
        <div className="absolute top-3 left-3 right-14 z-20 flex flex-col sm:flex-row items-start sm:items-center gap-2 pointer-events-none">
          {/* Live In-Map Search Box with Dropdown */}
          <div className="relative w-full max-w-xs sm:max-w-sm pointer-events-auto" ref={searchDropdownRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm địa điểm trên bản đồ..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setIsDropdownOpen(true)
                  setActiveIdx(-1)
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setIsDropdownOpen(true)
                }}
                onKeyDown={handleSearchKeyDown}
                className="w-full bg-white/95 backdrop-blur-md pl-9 pr-8 py-2 rounded-xl border border-slate-200/90 shadow-md text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              {isLoading && (
                <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-violet-600" />
              )}
              {searchQuery && !isLoading && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSuggestions([])
                    setIsDropdownOpen(false)
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* In-Map Autocomplete Dropdown */}
            {isDropdownOpen && (isLoading || suggestions.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-2xl overflow-hidden z-50">
                {isLoading && (
                  <div className="px-3.5 py-2.5 text-xs text-slate-500 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-500" />
                    <span>Đang tìm kiếm trên bản đồ...</span>
                  </div>
                )}
                {!isLoading &&
                  suggestions.map((item, idx) => {
                    const parts = (item.display_name || item.name || '').split(',').map((p: string) => p.trim())
                    const title = item.name || parts[0]
                    const cleanSub = parts.slice(1).filter((p: string) => !/^\d{5,6}$/.test(p) && p !== 'Việt Nam').join(', ')
                    return (
                      <button
                        key={item.place_id || `sug-${idx}`}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleSelectSuggestion(item)
                        }}
                        onMouseEnter={() => setActiveIdx(idx)}
                        className={`w-full px-3 py-2.5 text-left flex items-start gap-2.5 border-b border-slate-100 last:border-0 transition-colors ${
                          activeIdx === idx ? 'bg-violet-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-violet-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs text-slate-900 truncate">{title}</p>
                          <p className="text-[11px] text-slate-500 truncate" title={item.display_name}>
                            {cleanSub || item.display_name}
                          </p>
                        </div>
                        {activeIdx === idx && <Check className="w-3.5 h-3.5 text-violet-600 shrink-0 self-center" />}
                      </button>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Thẻ thông tin địa điểm: Mốc điểm chụp được chọn */}
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-violet-200 shadow-md text-xs font-semibold text-slate-800 flex items-center gap-2 pointer-events-auto">
            <div className={`w-2.5 h-2.5 rounded-full ${isGpsMode ? 'bg-emerald-500 animate-pulse' : 'bg-violet-600'}`} />
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-violet-700 font-bold uppercase tracking-wider">
                {isGpsMode ? '📍 Vị trí GPS của bạn' : '🎯 Mốc điểm chụp được chọn'}
              </span>
              <span className="font-bold text-slate-900 text-xs truncate max-w-[200px] sm:max-w-xs md:max-w-sm" title={centerLabel}>
                {centerLabel || 'Trung tâm Quận 1'}
              </span>
            </div>
          </div>

          <Badge className="bg-violet-700/95 text-white border-0 text-xs shadow-sm pointer-events-auto hidden md:inline-flex shrink-0">
            Bán kính 8km miễn phí di chuyển
          </Badge>
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={handleRecenter}
            className="bg-white/95 hover:bg-white text-slate-700 hover:text-violet-700 p-2.5 rounded-xl border border-slate-200 shadow-md text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Về tâm bản đồ"
          >
            <LocateFixed className="w-4 h-4 text-violet-600" />
            <span className="hidden sm:inline">Về điểm trung tâm</span>
          </button>

          {allowMapClickPin && (
            <div className="bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-[11px] font-medium hidden md:flex items-center gap-1.5">
              <span>💡 Bấm bất kỳ đâu trên bản đồ để đổi mốc điểm chụp</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Drawer: Scrollable Photographer Cards & Travel Surcharge Breakdown */}
      <div className="w-full lg:w-[420px] flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50/60 z-10 h-auto lg:h-[520px] overflow-hidden">
        
        {/* Pinned Top Bar */}
        <div className="p-4 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Camera className="w-4 h-4 text-violet-600" />
              Thợ chụp trong khu vực
              <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold">
                {photographers.length}
              </span>
            </h4>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
              Bán kính 8km miễn phí
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-violet-500 shrink-0" />
            <span className="truncate">Điểm chụp: <strong className="text-slate-700">{centerLabel}</strong></span>
          </div>
        </div>

        {/* Scrollable Photographer Cards List */}
        <div className="flex-1 overflow-y-auto max-h-[580px] p-3 space-y-3 scrollbar-thin">
          {photographers.length > 0 ? (
            photographers.map((p) => {
              const isSelected = p.id === activePhotographerId
              const distance = p.latitude && p.longitude
                ? calculateHaversineDistance(centerCoords.lat, centerCoords.lng, p.latitude, p.longitude)
                : null
              const surchargeInfo = calculateTravelSurcharge(distance)

              return (
                <div
                  key={p.id}
                  id={`photog-card-${p.id}`}
                  onClick={() => {
                    setActivePhotographerId(p.id)
                    if (onSelectPhotographer) onSelectPhotographer(p.id)
                    if (p.latitude && p.longitude && mapInstanceRef.current) {
                      mapInstanceRef.current.setView([p.latitude, p.longitude], Math.max(mapInstanceRef.current.getZoom(), 14), { animate: true })
                    }
                  }}
                  className={`rounded-2xl transition-all duration-300 p-4 cursor-pointer ${
                    isSelected
                      ? 'bg-white border-2 border-violet-600 shadow-xl ring-2 ring-violet-200/80 -translate-y-0.5'
                      : 'bg-white border border-slate-200/90 hover:border-violet-300 hover:bg-slate-50/80 shadow-xs'
                  }`}
                >
                  {/* Card Header: Avatar & Info */}
                  <div className="flex items-start gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden ring-2 ring-slate-100 shadow-xs flex-shrink-0 bg-slate-100">
                      <Image
                        src={p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={p.display_name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-slate-900 text-sm truncate flex items-center gap-1">
                          {p.display_name}
                          {p.is_verified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                        </h4>
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs shrink-0">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{p.average_rating?.toFixed(1) || '5.0'}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{p.district || p.city}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-semibold text-violet-700">
                          {distance !== null ? formatDistance(distance) : '-- km'}
                        </span>
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Giá từ</span>
                          <span className="font-bold text-slate-900 text-sm text-primary">
                            {formatVND(p.starting_price || 350000)}
                          </span>
                        </div>

                        {/* Free / Surcharge Badge */}
                        <div className="text-right">
                          {surchargeInfo.isFree ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Miễn phí (≤8km)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <Car className="w-3 h-3" /> +{formatVND(surchargeInfo.surcharge)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail when Card is Selected */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-violet-100 space-y-2.5 animate-in fade-in duration-200">
                      {/* Surcharge Note */}
                      <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed ${
                        surchargeInfo.isFree
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {surchargeInfo.isFree ? (
                          <div className="flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Thợ ở trong bán kính <strong>≤ 8km</strong> chuẩn FLASHY (Phí di chuyển: 0đ)</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between font-medium">
                            <span className="flex items-center gap-1">
                              <Car className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              Vượt bán kính chuẩn +{surchargeInfo.extraKm}km:
                            </span>
                            <strong className="text-amber-900 font-bold">+{formatVND(surchargeInfo.surcharge)}</strong>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={`/photographers/${p.slug}`}
                          className="w-full"
                        >
                          <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-semibold h-8 border-slate-200 hover:border-violet-300">
                            Xem hồ sơ
                          </Button>
                        </Link>
                        <Link
                          href={`/book/${p.id}?dist=${distance || 0}&lat=${centerCoords.lat}&lng=${centerCoords.lng}&loc=${encodeURIComponent(centerLabel)}`}
                          className="w-full"
                        >
                          <Button size="sm" className="w-full rounded-xl text-xs font-bold h-8 bg-brand hover:opacity-90 shadow-sm text-white">
                            Đặt lịch ngay
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center p-4">
              <Camera className="w-8 h-8 text-slate-300 mb-2" />
              <p className="font-bold text-slate-700 text-xs">Không tìm thấy thợ ảnh</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Thử mở rộng bán kính hoặc chọn địa điểm khác.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
