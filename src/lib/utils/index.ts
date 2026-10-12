import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format Vietnamese Dong currency
 * @param amount - amount in VND (integer)
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format a compact VND amount (e.g., 1.2M for 1,200,000)
 */
export function formatVNDCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M đ`
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K đ`
  }
  return `${amount} đ`
}

/**
 * Format date in Vietnamese locale
 */
export function formatDateVN(date: string | Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(typeof date === 'string' ? new Date(date) : date)
}

/**
 * Format datetime in Vietnamese locale
 */
export function formatDateTimeVN(date: string | Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(typeof date === 'string' ? new Date(date) : date)
}

/**
 * Format relative time in Vietnamese
 */
export function formatRelativeTimeVN(date: string | Date): string {
  const now = new Date()
  const target = typeof date === 'string' ? new Date(date) : date
  const diffMs = now.getTime() - target.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Vừa xong'
  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  if (diffDays < 7) return `${diffDays} ngày trước`
  return formatDateVN(target)
}

/**
 * Generate a slug from a Vietnamese string
 */
export function slugify(text: string): string {
  const vietnameseMap: Record<string, string> = {
    à: 'a', á: 'a', ả: 'a', ã: 'a', ạ: 'a',
    ă: 'a', ắ: 'a', ặ: 'a', ẳ: 'a', ẵ: 'a', ằ: 'a',
    â: 'a', ấ: 'a', ậ: 'a', ẩ: 'a', ẫ: 'a', ầ: 'a',
    è: 'e', é: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e',
    ê: 'e', ế: 'e', ệ: 'e', ể: 'e', ễ: 'e', ề: 'e',
    ì: 'i', í: 'i', ỉ: 'i', ĩ: 'i', ị: 'i',
    ò: 'o', ó: 'o', ỏ: 'o', õ: 'o', ọ: 'o',
    ô: 'o', ố: 'o', ộ: 'o', ổ: 'o', ỗ: 'o', ồ: 'o',
    ơ: 'o', ớ: 'o', ợ: 'o', ở: 'o', ỡ: 'o', ờ: 'o',
    ù: 'u', ú: 'u', ủ: 'u', ũ: 'u', ụ: 'u',
    ư: 'u', ứ: 'u', ự: 'u', ử: 'u', ữ: 'u', ừ: 'u',
    ỳ: 'y', ý: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y',
    đ: 'd',
  }
  return text
    .toLowerCase()
    .split('')
    .map(c => vietnameseMap[c] || c)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Generate initials from a display name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

/**
 * Format a star rating
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

/**
 * Calculate time remaining in a review window
 */
export function getReviewWindowRemaining(deliveredAt: string): {
  hours: number
  minutes: number
  isExpired: boolean
} {
  const delivered = new Date(deliveredAt)
  const windowEnd = new Date(delivered.getTime() + 48 * 60 * 60 * 1000)
  const now = new Date()
  const remaining = windowEnd.getTime() - now.getTime()

  if (remaining <= 0) {
    return { hours: 0, minutes: 0, isExpired: true }
  }

  const hours = Math.floor(remaining / (60 * 60 * 1000))
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / 60000)
  return { hours, minutes, isExpired: false }
}

/**
 * Safely mask a phone number for display
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return '***'
  return phone.slice(0, 3) + '****' + phone.slice(-3)
}

/**
 * Generate a booking number
 */
export function generateBookingNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `FL${timestamp}${random}`
}
