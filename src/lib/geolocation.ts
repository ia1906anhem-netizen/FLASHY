/**
 * FLASHY Geolocation & Distance Utilities
 * Hỗ trợ định vị GPS người dùng (tương tự Grab / Shopee) và tính toán khoảng cách
 * phục vụ tính năng tìm kiếm thợ ảnh / studio theo bán kính gần nhất.
 */

export interface Coordinates {
  latitude: number
  longitude: number
  accuracy?: number
}

export interface GeocodedLocation {
  district?: string
  city?: string
  formattedAddress: string
  coordinates: Coordinates
  distanceToCenterKm?: number
}

// Bảng tọa độ trung tâm các quận/thành phố lớn để reverse-geocode offline cực nhanh
export const DISTRICT_COORDINATES: Record<string, { city: string; lat: number; lng: number }> = {
  // TP. Hồ Chí Minh
  'Quận 1': { city: 'TP. Hồ Chí Minh', lat: 10.7769, lng: 106.7009 },
  'Quận 3': { city: 'TP. Hồ Chí Minh', lat: 10.7844, lng: 106.6844 },
  'Quận 4': { city: 'TP. Hồ Chí Minh', lat: 10.7617, lng: 106.7042 },
  'Quận 5': { city: 'TP. Hồ Chí Minh', lat: 10.7540, lng: 106.6660 },
  'Quận 6': { city: 'TP. Hồ Chí Minh', lat: 10.7481, lng: 106.6352 },
  'Quận 7': { city: 'TP. Hồ Chí Minh', lat: 10.7340, lng: 106.7218 },
  'Quận 8': { city: 'TP. Hồ Chí Minh', lat: 10.7241, lng: 106.6286 },
  'Quận 10': { city: 'TP. Hồ Chí Minh', lat: 10.7715, lng: 106.6676 },
  'Quận 11': { city: 'TP. Hồ Chí Minh', lat: 10.7629, lng: 106.6504 },
  'Quận 12': { city: 'TP. Hồ Chí Minh', lat: 10.8672, lng: 106.6413 },
  'Bình Thạnh': { city: 'TP. Hồ Chí Minh', lat: 10.8106, lng: 106.7091 },
  'Phú Nhuận': { city: 'TP. Hồ Chí Minh', lat: 10.7992, lng: 106.6803 },
  'Tân Bình': { city: 'TP. Hồ Chí Minh', lat: 10.8015, lng: 106.6526 },
  'Tân Phú': { city: 'TP. Hồ Chí Minh', lat: 10.7900, lng: 106.6282 },
  'Gò Vấp': { city: 'TP. Hồ Chí Minh', lat: 10.8387, lng: 106.6653 },
  'Bình Tân': { city: 'TP. Hồ Chí Minh', lat: 10.7653, lng: 106.6039 },
  'TP. Thủ Đức': { city: 'TP. Hồ Chí Minh', lat: 10.8499, lng: 106.7716 },

  // Hà Nội
  'Hoàn Kiếm': { city: 'Hà Nội', lat: 21.0285, lng: 105.8542 },
  'Ba Đình': { city: 'Hà Nội', lat: 21.0341, lng: 105.8236 },
  'Đống Đa': { city: 'Hà Nội', lat: 21.0180, lng: 105.8299 },
  'Hai Bà Trưng': { city: 'Hà Nội', lat: 21.0068, lng: 105.8532 },
  'Cầu Giấy': { city: 'Hà Nội', lat: 21.0313, lng: 105.7938 },
  'Thanh Xuân': { city: 'Hà Nội', lat: 20.9937, lng: 105.8115 },
  'Tây Hồ': { city: 'Hà Nội', lat: 21.0716, lng: 105.8230 },
  'Nam Từ Liêm': { city: 'Hà Nội', lat: 21.0142, lng: 105.7654 },
  'Bắc Từ Liêm': { city: 'Hà Nội', lat: 21.0729, lng: 105.7584 },
  'Long Biên': { city: 'Hà Nội', lat: 21.0362, lng: 105.8943 },
  'Hoàng Mai': { city: 'Hà Nội', lat: 20.9765, lng: 105.8522 },

  // Đà Nẵng
  'Hải Châu': { city: 'Đà Nẵng', lat: 16.0544, lng: 108.2208 },
  'Thanh Khê': { city: 'Đà Nẵng', lat: 16.0620, lng: 108.1884 },
  'Sơn Trà': { city: 'Đà Nẵng', lat: 16.0825, lng: 108.2432 },
  'Ngũ Hành Sơn': { city: 'Đà Nẵng', lat: 16.0125, lng: 108.2562 },
  'Liên Chiểu': { city: 'Đà Nẵng', lat: 16.0883, lng: 108.1444 },

  // Các tỉnh thành khác
  'Đà Lạt': { city: 'Đà Lạt', lat: 11.9404, lng: 108.4583 },
  'Nha Trang': { city: 'Nha Trang', lat: 12.2388, lng: 109.1967 },
  'Vũng Tàu': { city: 'Vũng Tàu', lat: 10.3460, lng: 107.0843 },
  'Cần Thơ': { city: 'Cần Thơ', lat: 10.0452, lng: 105.7469 },
  'Hội An': { city: 'Hội An', lat: 15.8801, lng: 108.3380 },
  'Huế': { city: 'Huế', lat: 16.4637, lng: 107.5909 },
  'Hải Phòng': { city: 'Hải Phòng', lat: 20.8449, lng: 106.6881 },
  'Quảng Ninh': { city: 'Quảng Ninh', lat: 20.9505, lng: 107.0734 },
  'Phú Quốc': { city: 'Phú Quốc', lat: 10.2899, lng: 103.9840 }
}

/**
 * Tính khoảng cách giữa 2 tọa độ GPS bằng công thức Haversine (đơn vị: km)
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Bán kính trái đất (km)
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return Math.round(distance * 10) / 10 // Làm tròn 1 chữ số thập phân (vd: 8.5 km)
}

/**
 * Alias cho calculateHaversineDistance để duy trì tính tương thích
 */
export const calculateDistanceKm = calculateHaversineDistance

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Chính sách phụ thu di chuyển của FLASHY:
 * - Bán kính <= 8km: Miễn phí di chuyển (Phụ phí = 0 VNĐ)
 * - Bán kính > 8km: Phụ phí = (Khoảng cách - 8) * 15.000 VNĐ/km
 */
export const TRAVEL_SURCHARGE_FREE_RADIUS_KM = 8
export const TRAVEL_SURCHARGE_RATE_PER_KM = 15000

export interface TravelSurchargeResult {
  distanceKm: number
  isFree: boolean
  extraKm: number
  surcharge: number
  ratePerKm: number
  freeRadiusKm: number
  formattedSurcharge: string
}

export function calculateTravelSurcharge(distanceKm: number | null | undefined): TravelSurchargeResult {
  const dist = typeof distanceKm === 'number' && !isNaN(distanceKm) ? Math.max(0, distanceKm) : 0
  const isFree = dist <= TRAVEL_SURCHARGE_FREE_RADIUS_KM

  if (isFree) {
    return {
      distanceKm: dist,
      isFree: true,
      extraKm: 0,
      surcharge: 0,
      ratePerKm: TRAVEL_SURCHARGE_RATE_PER_KM,
      freeRadiusKm: TRAVEL_SURCHARGE_FREE_RADIUS_KM,
      formattedSurcharge: '0 VNĐ',
    }
  }

  const extraKm = Math.round((dist - TRAVEL_SURCHARGE_FREE_RADIUS_KM) * 10) / 10
  const surcharge = Math.round(extraKm * TRAVEL_SURCHARGE_RATE_PER_KM)

  return {
    distanceKm: dist,
    isFree: false,
    extraKm,
    surcharge,
    ratePerKm: TRAVEL_SURCHARGE_RATE_PER_KM,
    freeRadiusKm: TRAVEL_SURCHARGE_FREE_RADIUS_KM,
    formattedSurcharge: `${new Intl.NumberFormat('vi-VN').format(surcharge)} VNĐ`,
  }
}

/**
 * Định dạng khoảng cách thân thiện với người dùng (ví dụ: "850 m" hoặc "3.2 km")
 */
export function formatDistance(km: number | null | undefined): string {
  if (km === null || km === undefined || isNaN(km)) return ''
  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  }
  return `${km.toFixed(1)} km`
}

/**
 * Lấy tọa độ GPS hiện tại từ trình duyệt bằng HTML5 Geolocation API
 */
export function getCurrentUserCoordinates(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Trình duyệt của bạn không hỗ trợ định vị GPS.'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
      },
      (error) => {
        let message = 'Không thể lấy vị trí hiện tại.'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Bạn đã từ chối quyền truy cập vị trí. Vui lòng cho phép quyền định vị trong cài đặt trình duyệt để tìm thợ ảnh gần bạn nhất.'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Tín hiệu GPS không khả dụng hoặc thiết bị chưa bật định vị.'
            break
          case error.TIMEOUT:
            message = 'Yêu cầu định vị bị quá thời gian. Vui lòng thử lại.'
            break
        }
        reject(new Error(message))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // Cache vị trí trong 1 phút
      }
    )
  })
}

/**
 * Tìm quận/huyện và thành phố gần nhất dựa trên tọa độ GPS (Offline Reverse Geocoding)
 */
export function findNearestDistrict(
  coords: Coordinates
): GeocodedLocation {
  let nearestDistrict = 'Quận 1'
  let nearestCity = 'TP. Hồ Chí Minh'
  let minDistance = Infinity

  for (const [district, info] of Object.entries(DISTRICT_COORDINATES)) {
    const dist = calculateDistanceKm(
      coords.latitude,
      coords.longitude,
      info.lat,
      info.lng
    )
    if (dist < minDistance) {
      minDistance = dist
      nearestDistrict = district
      nearestCity = info.city
    }
  }

  return {
    district: nearestDistrict,
    city: nearestCity,
    formattedAddress: `${nearestDistrict}, ${nearestCity}`,
    coordinates: coords,
    distanceToCenterKm: minDistance
  }
}

/**
 * Lấy tọa độ mặc định của một địa danh / quận huyện (nếu có trong bảng tra cứu)
 */
export function getCoordinatesByLocation(locationName?: string): { lat: number; lng: number } {
  if (!locationName) return { lat: 10.7769, lng: 106.7009 } // Mặc định Quận 1
  const clean = locationName.trim()

  // So khớp trực tiếp
  if (DISTRICT_COORDINATES[clean]) {
    return {
      lat: DISTRICT_COORDINATES[clean].lat,
      lng: DISTRICT_COORDINATES[clean].lng
    }
  }

  // So khớp mềm
  for (const [district, info] of Object.entries(DISTRICT_COORDINATES)) {
    if (clean.toLowerCase().includes(district.toLowerCase()) || district.toLowerCase().includes(clean.toLowerCase())) {
      return { lat: info.lat, lng: info.lng }
    }
    if (clean.toLowerCase().includes(info.city.toLowerCase())) {
      return { lat: info.lat, lng: info.lng }
    }
  }

  return { lat: 10.7769, lng: 106.7009 }
}

/**
 * Danh sách các địa điểm chụp ảnh / check-in nổi tiếng (Cafe, Studio, Công viên, Landmark)
 * phục vụ Chế độ 2: Tùy chọn điểm chụp & ghim bản đồ (Grab-style)
 */
export interface ShootingSpot {
  id: string
  name: string
  category: 'cafe' | 'studio' | 'park' | 'landmark' | 'street'
  categoryLabel: string
  address: string
  district: string
  city: string
  lat: number
  lng: number
  description?: string
}

export const POPULAR_SHOOTING_SPOTS: ShootingSpot[] = [
  // TP. Hồ Chí Minh
  {
    id: 'spot-hcm-hub-thu-duc',
    name: 'Trường Đại học Ngân hàng TP.HCM (HUB) - Cơ sở Thủ Đức',
    category: 'landmark',
    categoryLabel: 'Khuôn viên trường & Kỷ yếu',
    address: '56 Hoàng Diệu 2, Phường Linh Chiểu, TP. Thủ Đức',
    district: 'TP. Thủ Đức',
    city: 'TP. Hồ Chí Minh',
    lat: 10.8582,
    lng: 106.7681,
    description: 'Khuôn viên xanh, kiến trúc hiện đại, điểm chụp kỷ yếu & check-in sinh viên hàng đầu'
  },
  {
    id: 'spot-hcm-hub-q1',
    name: 'Trường Đại học Ngân hàng TP.HCM (HUB) - Cơ sở Quận 1',
    category: 'landmark',
    categoryLabel: 'Kiến trúc cổ điển Q.1',
    address: '36 Tôn Thất Đạm, Phường Nguyễn Thái Bình, Quận 1',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    lat: 10.7712,
    lng: 106.7041,
    description: 'Tòa nhà kiến trúc Pháp cổ kính ngay trung tâm tài chính Quận 1'
  },
  {
    id: 'spot-hcm-1',
    name: 'Bưu điện Trung tâm TP & Nhà thờ Đức Bà',
    category: 'landmark',
    categoryLabel: 'Kiến trúc cổ điển',
    address: '02 Công xã Paris, Phường Bến Nghé, Quận 1',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    lat: 10.7798,
    lng: 106.6999,
    description: 'Địa điểm chụp ảnh vintage, áo dài, kỷ yếu hàng đầu Sài Gòn'
  },
  {
    id: 'spot-hcm-nguyen-hue',
    name: 'Đường Nguyễn Huệ (Phố đi bộ Nguyễn Huệ)',
    category: 'street',
    categoryLabel: 'Phố đi bộ & Trục chính Q.1',
    address: 'Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    lat: 10.7738,
    lng: 106.7038,
    description: 'Trục đường trung tâm sầm uất, view UBND TP và các tòa nhà cao ốc'
  },
  {
    id: 'spot-hcm-2',
    name: 'Bến Bạch Đằng & Cầu Ba Son',
    category: 'landmark',
    categoryLabel: 'View sông & Hoàng hôn',
    address: 'Đường Tôn Đức Thắng, Phường Bến Nghé, Quận 1',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    lat: 10.7744,
    lng: 106.7067,
    description: 'Check-in hoàng hôn rực rỡ, góc nhìn hiện đại sang Thủ Thiêm'
  },
  {
    id: 'spot-hcm-3',
    name: 'Landmark 81 & Công viên Central Park',
    category: 'park',
    categoryLabel: 'Hiện đại & Cảnh quan',
    address: '208 Nguyễn Hữu Cảnh, Phường 22, Bình Thạnh',
    district: 'Bình Thạnh',
    city: 'TP. Hồ Chí Minh',
    lat: 10.7951,
    lng: 106.7218,
    description: 'Không gian mở ven sông, concept lifestyle, dã ngoại, lookbook'
  },
  {
    id: 'spot-hcm-4',
    name: 'Studio Minimalist Concept Q.3',
    category: 'studio',
    categoryLabel: 'Studio ánh sáng tự nhiên',
    address: 'Đường Tú Xương, Phường Võ Thị Sáu, Quận 3',
    district: 'Quận 3',
    city: 'TP. Hồ Chí Minh',
    lat: 10.7812,
    lng: 106.6872,
    description: 'Ánh sáng cửa sổ lớn, tone trắng Hàn Quốc, profile cá nhân & couple'
  },
  {
    id: 'spot-hcm-5',
    name: 'Quán Cà Phê Chung Cư Cổ 42 Nguyễn Huệ',
    category: 'cafe',
    categoryLabel: 'Quán Cafe Vintage',
    address: '42 Nguyễn Huệ, Phường Bến Nghé, Quận 1',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    lat: 10.7749,
    lng: 106.7032,
    description: 'Ban công nhìn thẳng phố đi bộ, tone hoài niệm retro'
  },
  {
    id: 'spot-hcm-6',
    name: 'Cầu Ánh Sao & Hồ Bán Nguyệt',
    category: 'park',
    categoryLabel: 'Công viên & Đi dạo',
    address: 'Khu đô thị Phú Mỹ Hưng, Phường Tân Phú, Quận 7',
    district: 'Quận 7',
    city: 'TP. Hồ Chí Minh',
    lat: 10.7292,
    lng: 106.7202,
    description: 'Cầu đi bộ uốn lượn, cảnh quan yên tĩnh, chụp couple & gia đình'
  },
  {
    id: 'spot-hcm-7',
    name: 'Thảo Cầm Viên Sài Gòn',
    category: 'park',
    categoryLabel: 'Thiên nhiên & Rừng nhiệt đới',
    address: '02 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    lat: 10.7876,
    lng: 106.7053,
    description: 'Concept nàng thơ, cây cổ thụ xanh mát, ánh nắng xiên tự nhiên'
  },
  {
    id: 'spot-hcm-8',
    name: 'Khu Phố Tây Thảo Điền & Cà phê Ven Sông',
    category: 'cafe',
    categoryLabel: 'Quán Cafe & Brunch',
    address: 'Đường Xuân Thủy, Phường Thảo Điền, TP. Thủ Đức',
    district: 'TP. Thủ Đức',
    city: 'TP. Hồ Chí Minh',
    lat: 10.8037,
    lng: 106.7328,
    description: 'Kiến trúc phong cách Âu, quán ăn aesthetic ngoài trời'
  },
  // Hà Nội
  {
    id: 'spot-hn-1',
    name: 'Hồ Hoàn Kiếm & Phố Cổ Hà Nội',
    category: 'landmark',
    categoryLabel: 'Biểu tượng lịch sử',
    address: 'Hàng Trống, Hoàn Kiếm, Hà Nội',
    district: 'Hoàn Kiếm',
    city: 'Hà Nội',
    lat: 21.0285,
    lng: 105.8542,
    description: 'Cầu Thê Húc, Tháp Rùa, phố cổ ngập tràn nét truyền thống'
  },
  {
    id: 'spot-hn-2',
    name: 'Hồ Tây & Đường Thanh Niên',
    category: 'landmark',
    categoryLabel: 'Hoàng hôn & Ven hồ',
    address: 'Đường Thanh Niên, Tây Hồ, Hà Nội',
    district: 'Tây Hồ',
    city: 'Hà Nội',
    lat: 21.0504,
    lng: 105.8368,
    description: 'View hoàng hôn tím lãng mạn bậc nhất thủ đô'
  },
  // Đà Nẵng
  {
    id: 'spot-dn-1',
    name: 'Cầu Rồng & Bờ Sông Hàn',
    category: 'landmark',
    categoryLabel: 'Cảnh quan sông nước',
    address: 'Đường Trần Hưng Đạo, Sơn Trà, Đà Nẵng',
    district: 'Sơn Trà',
    city: 'Đà Nẵng',
    lat: 16.0612,
    lng: 108.2272,
    description: 'Cầu Rồng phun lửa, bờ kè sông Hàn thoáng đãng'
  },
  {
    id: 'spot-dn-2',
    name: 'Bãi Biển Mỹ Khê',
    category: 'park',
    categoryLabel: 'Biển & Bình minh',
    address: 'Đường Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, Đà Nẵng',
    district: 'Sơn Trà',
    city: 'Đà Nẵng',
    lat: 16.0682,
    lng: 108.2464,
    description: 'Bờ cát trắng mịn, bình minh rạng ngời, ảnh bikini & lifestyle'
  }
]

/**
 * Reverse Geocoding thực tế: Chuyển đổi tọa độ (lat, lng) sang tên địa điểm cụ thể.
 * Ưu tiên gọi OpenStreetMap Nominatim API, tự động fallback về bảng tra cứu offline nếu timeout hoặc lỗi mạng.
 */
export async function reverseGeocodeLocation(
  lat: number,
  lng: number
): Promise<{ formattedAddress: string; district?: string; city?: string; isOfflineFallback?: boolean }> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2500)

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'FLASHY-Marketplace-App',
          'Accept-Language': 'vi,en',
        },
        signal: controller.signal,
      }
    )
    clearTimeout(timeoutId)

    if (res.ok) {
      const data = await res.json()
      const addr = data.address || {}

      const district =
        addr.suburb ||
        addr.district ||
        addr.city_district ||
        addr.quarter ||
        addr.neighbourhood ||
        addr.county ||
        addr.town
      const city = addr.city || addr.state || addr.province || 'Việt Nam'

      // Tạo chuỗi địa chỉ súc tích
      const road = addr.road || addr.pedestrian || addr.amenity || ''
      let shortAddr = ''
      if (road && district) {
        shortAddr = `${road}, ${district}, ${city}`
      } else if (data.display_name) {
        // Cắt 3 thành phần đầu cho gọn
        shortAddr = data.display_name.split(',').slice(0, 3).map((s: string) => s.trim()).join(', ')
      } else {
        shortAddr = [district, city].filter(Boolean).join(', ')
      }

      if (shortAddr) {
        return {
          formattedAddress: shortAddr,
          district,
          city,
          isOfflineFallback: false,
        }
      }
    }
  } catch {
    // Lỗi mạng hoặc quá thời gian, chuyển sang offline fallback
  }

  // Fallback offline dựa trên tọa độ
  const offline = findNearestDistrict({ latitude: lat, longitude: lng })
  return {
    formattedAddress: `${offline.district}, ${offline.city}`,
    district: offline.district,
    city: offline.city,
    isOfflineFallback: true,
  }
}

export interface GeocodedLocationItem {
  name: string
  address: string
  displayName: string
  lat: number
  lng: number
  lon: number
  category?: string
}

/**
 * Tìm kiếm địa điểm động — Photon API (komoot) + fallback proxy + catalog offline
 * Photon không bị CORS, không cần API key, ổn định hơn Nominatim cho client-side.
 */
export async function searchGeocodedLocations(query: string): Promise<GeocodedLocationItem[]> {
  if (!query || query.trim().length < 2) return []
  const clean = query.trim()
  const cleanLower = clean.toLowerCase()
  const results: GeocodedLocationItem[] = []

  // 1. Gọi trực tiếp API proxy siêu nhạy đa nguồn /api/geocode/search (Nominatim + Photon)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)

    try {
      const proxyRes = await fetch(`/api/geocode/search?q=${encodeURIComponent(clean)}`, {
        signal: controller.signal,
      })
      if (proxyRes.ok) {
        const proxyData = await proxyRes.json()
        if (Array.isArray(proxyData) && proxyData.length > 0) {
          for (const item of proxyData.slice(0, 6)) {
            const lat = parseFloat(item.lat)
            const lon = parseFloat(item.lon)
            if (isNaN(lat) || isNaN(lon)) continue
            const parts = (item.display_name || '').split(',').map((p: string) => p.trim())
            const title = item.name || parts[0] || 'Địa điểm'
            const subtitle = parts.slice(1, 4).join(', ')
            results.push({
              name: title,
              address: subtitle || item.display_name,
              displayName: item.display_name || `${title}, ${subtitle}`,
              lat,
              lng: lon,
              lon,
              category: item.type ? `OSM: ${item.type}` : 'Địa điểm',
            })
          }
          if (results.length > 0) {
            clearTimeout(timeoutId)
            return results
          }
        }
      }
    } catch {
      // Proxy fail → fallback sang Photon direct
    } finally {
      clearTimeout(timeoutId)
    }
  } catch {
    // Controller error
  }

  // 2. Fallback: Photon API (komoot) trực tiếp
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3500)

    let rawItems: any[] = []

    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(clean)}&limit=5&lang=vi&lat=10.7769&lon=106.7009`
      const res = await fetch(photonUrl, { signal: controller.signal })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data?.features)) {
          rawItems = data.features
            .filter((f: any) => {
              const country = (f.properties?.country || '').toLowerCase()
              return (
                country === 'vietnam' ||
                country === 'việt nam' ||
                country === 'viet nam' ||
                !country
              )
            })
            .slice(0, 5)
        }
      }
    } catch {
      // Cả Photon direct cũng fail → xuống catalog offline
    } finally {
      clearTimeout(timeoutId)
    }

    clearTimeout(timeoutId)

    // Map kết quả Photon GeoJSON sang GeocodedLocationItem
    if (rawItems.length > 0) {
      for (const f of rawItems) {
        const props = f.properties || {}
        const coords = f.geometry?.coordinates || [0, 0]
        const lon = coords[0]
        const lat = coords[1]
        if (typeof lat !== 'number' || typeof lon !== 'number') continue

        const displayParts = [
          props.name,
          props.street,
          props.district || props.suburb || props.quarter,
          props.city || props.town || props.village,
          props.state,
        ].filter(Boolean)

        const title = props.name || displayParts[0] || 'Địa điểm'
        const subtitle = displayParts.slice(1).join(', ')
        const displayName = displayParts.join(', ')

        results.push({
          name: title,
          address: subtitle || displayName,
          displayName,
          lat,
          lng: lon,
          lon,
          category: props.osm_type ? `OSM: ${props.osm_type}` : 'Địa điểm',
        })
      }
    }
  } catch {
    // Timeout hoặc lỗi tổng thể → xuống catalog địa phương
  }


  // 2. Bổ sung từ danh bạ điểm chụp nổi tiếng nếu Nominatim chưa đủ 5 kết quả
  if (results.length < 5) {
    const spotMatches = POPULAR_SHOOTING_SPOTS.filter(
      (s) =>
        s.name.toLowerCase().includes(cleanLower) ||
        s.address.toLowerCase().includes(cleanLower) ||
        s.district.toLowerCase().includes(cleanLower) ||
        cleanLower.includes(s.name.toLowerCase()) ||
        cleanLower.includes(s.district.toLowerCase())
    )

    for (const s of spotMatches) {
      if (!results.some((r) => Math.abs(r.lat - s.lat) < 0.001 && Math.abs(r.lng - s.lng) < 0.001)) {
        results.push({
          name: s.name,
          address: s.address,
          displayName: `${s.name}, ${s.address}, ${s.district}`,
          lat: s.lat,
          lng: s.lng,
          lon: s.lng,
          category: s.categoryLabel,
        })
      }
      if (results.length >= 5) break
    }
  }

  // 3. Bổ sung từ bảng quận/huyện nếu vẫn còn chỗ
  if (results.length < 5) {
    for (const [dist, info] of Object.entries(DISTRICT_COORDINATES)) {
      if (dist.toLowerCase().includes(cleanLower) || cleanLower.includes(dist.toLowerCase())) {
        if (!results.some((r) => r.name.includes(dist))) {
          results.push({
            name: `Khu vực ${dist}`,
            address: `${dist}, ${info.city}`,
            displayName: `${dist}, ${info.city}, Việt Nam`,
            lat: info.lat,
            lng: info.lng,
            lon: info.lng,
            category: 'Khu vực / Quận huyện',
          })
        }
      }
      if (results.length >= 5) break
    }
  }

  return results.slice(0, 5)
}
