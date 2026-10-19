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
export function calculateDistanceKm(
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
  return Math.round(distance * 10) / 10 // Làm tròn 1 chữ số thập phân
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
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
