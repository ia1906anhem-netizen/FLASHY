import { describe, it, expect } from 'vitest'
import {
  calculateHaversineDistance,
  calculateDistanceKm,
  calculateTravelSurcharge,
  formatDistance,
  TRAVEL_SURCHARGE_FREE_RADIUS_KM,
  TRAVEL_SURCHARGE_RATE_PER_KM,
  DISTRICT_COORDINATES,
  findNearestDistrict,
  POPULAR_SHOOTING_SPOTS
} from '../../src/lib/geolocation'

describe('FLASHY Haversine Distance & Grab-Style Travel Surcharge', () => {
  it('calculates accurate Haversine distance between 2 coordinates in km', () => {
    // Quận 1 (10.7769, 106.7009) to Quận 3 (10.7844, 106.6844)
    const distQ1toQ3 = calculateHaversineDistance(10.7769, 106.7009, 10.7844, 106.6844)
    expect(distQ1toQ3).toBeGreaterThan(1.5)
    expect(distQ1toQ3).toBeLessThan(2.5)

    // Identity distance (same point should be 0)
    expect(calculateHaversineDistance(10.7769, 106.7009, 10.7769, 106.7009)).toBe(0)

    // Alias calculateDistanceKm behaves identically
    expect(calculateDistanceKm(10.7769, 106.7009, 10.7844, 106.6844)).toBe(distQ1toQ3)
  })

  it('correctly formats human-readable distances', () => {
    expect(formatDistance(0.5)).toBe('500 m')
    expect(formatDistance(0.85)).toBe('850 m')
    expect(formatDistance(1.23)).toBe('1.2 km')
    expect(formatDistance(12.5)).toBe('12.5 km')
    expect(formatDistance(null)).toBe('')
    expect(formatDistance(undefined)).toBe('')
  })

  describe('FLASHY Travel Surcharge Policy (>8km @ 15.000 VNĐ / km)', () => {
    it('provides free travel within standard radius <= 8km (surcharge = 0 VNĐ)', () => {
      const resultZero = calculateTravelSurcharge(0)
      expect(resultZero.isFree).toBe(true)
      expect(resultZero.extraKm).toBe(0)
      expect(resultZero.surcharge).toBe(0)

      const result5km = calculateTravelSurcharge(5.0)
      expect(result5km.isFree).toBe(true)
      expect(result5km.extraKm).toBe(0)
      expect(result5km.surcharge).toBe(0)

      const result8km = calculateTravelSurcharge(8.0)
      expect(result8km.isFree).toBe(true)
      expect(result8km.extraKm).toBe(0)
      expect(result8km.surcharge).toBe(0)
    })

    it('calculates surcharge = (distance - 8) * 15.000 VNĐ when distance > 8km', () => {
      // 9.0 km -> extra 1.0 km -> 15.000 VNĐ
      const result9km = calculateTravelSurcharge(9.0)
      expect(result9km.isFree).toBe(false)
      expect(result9km.extraKm).toBe(1.0)
      expect(result9km.surcharge).toBe(15000)

      // 12.0 km -> extra 4.0 km -> 60.000 VNĐ
      const result12km = calculateTravelSurcharge(12.0)
      expect(result12km.isFree).toBe(false)
      expect(result12km.extraKm).toBe(4.0)
      expect(result12km.surcharge).toBe(60000)

      // 15.5 km -> extra 7.5 km -> 112.500 VNĐ
      const result15_5km = calculateTravelSurcharge(15.5)
      expect(result15_5km.isFree).toBe(false)
      expect(result15_5km.extraKm).toBe(7.5)
      expect(result15_5km.surcharge).toBe(112500)
    })

    it('handles null, undefined and negative values gracefully', () => {
      expect(calculateTravelSurcharge(null).isFree).toBe(true)
      expect(calculateTravelSurcharge(undefined).isFree).toBe(true)
      expect(calculateTravelSurcharge(-5).isFree).toBe(true)
    })
  })

  describe('Offline Reverse Geocoding & Popular Shooting Spots', () => {
    it('correctly maps coordinates to nearest district', () => {
      // Exact coordinates of District 1
      const nearest = findNearestDistrict({ latitude: 10.7769, longitude: 106.7009 })
      expect(nearest.district).toBe('Quận 1')
      expect(nearest.city).toBe('TP. Hồ Chí Minh')
    })

    it('ensures all popular shooting spots have valid coordinates and non-empty metadata', () => {
      expect(POPULAR_SHOOTING_SPOTS.length).toBeGreaterThan(5)
      POPULAR_SHOOTING_SPOTS.forEach((spot) => {
        expect(spot.name).toBeTruthy()
        expect(spot.lat).toBeGreaterThan(8) // Vietnam latitude range
        expect(spot.lat).toBeLessThan(24)
        expect(spot.lng).toBeGreaterThan(102) // Vietnam longitude range
        expect(spot.lng).toBeLessThan(110)
      })
    })
  })
})
