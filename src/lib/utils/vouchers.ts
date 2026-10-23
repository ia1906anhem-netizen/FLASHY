'use client'

import { DEMO_VOUCHERS } from '@/lib/data/mock-data'

export interface PlatformVoucher {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_RETOUCH'
  discount_value: number
  max_discount?: number
  min_order_value?: number | null
  description: string
  is_rebook_only?: boolean
  badge?: string
}

export const SYSTEM_VOUCHERS: PlatformVoucher[] = [
  {
    id: 'sys-rebook-10',
    code: 'REBOOK10',
    type: 'PERCENTAGE',
    discount_value: 10,
    max_discount: 100000,
    min_order_value: 0,
    description: 'Giảm 10% (Tối đa 100k) đặc quyền Khách cũ Đặt lại qua FLASHY',
    is_rebook_only: true,
    badge: 'Ưu đãi Khách cũ',
  },
  {
    id: 'sys-flashy-new',
    code: 'FLASHYNEW',
    type: 'PERCENTAGE',
    discount_value: 10,
    max_discount: 50000,
    min_order_value: 150000,
    description: 'Giảm 10% Cho Lần Đặt Đầu Tiên (Tối đa 50.000đ)',
    badge: 'Khách mới',
  },
  {
    id: 'sys-coin-50k',
    code: 'COIN50K',
    type: 'FIXED',
    discount_value: 50000,
    max_discount: 50000,
    min_order_value: 300000,
    description: 'Voucher Giảm 50.000đ cho đơn từ 300.000đ',
    badge: 'Flashy Coins',
  },
  {
    id: 'sys-flashy-vip',
    code: 'FLASHYVIP',
    type: 'PERCENTAGE',
    discount_value: 15,
    max_discount: 150000,
    min_order_value: 500000,
    description: 'Giảm 15% (Tối đa 150.000đ) cho gói chụp cao cấp',
    badge: 'VIP Member',
  },
]

export function getAllAvailableVouchers(): PlatformVoucher[] {
  let adminVouchers: PlatformVoucher[] = []
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('flashy_admin_vouchers')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          adminVouchers = parsed
            .filter((v: any) => v.is_active !== false)
            .map((v: any) => ({
              id: v.id,
              code: v.code.toUpperCase(),
              type: v.type === 'FIXED' ? 'FIXED' : 'PERCENTAGE',
              discount_value: Number(v.discount_value) || 0,
              max_discount: Number(v.max_discount) || undefined,
              min_order_value: Number(v.min_order_value) || 0,
              description: v.description || `Mã ưu đãi ${v.code}`,
              badge: 'FLASHY Promo',
            }))
        }
      }
    } catch {}
  }

  // Merge avoiding duplicates
  const map = new Map<string, PlatformVoucher>()
  SYSTEM_VOUCHERS.forEach((v) => map.set(v.code, v))
  DEMO_VOUCHERS.forEach((v) => {
    if (!map.has(v.code)) {
      map.set(v.code, {
        id: v.id,
        code: v.code,
        type: v.type,
        discount_value: v.discount_value,
        max_discount: v.max_discount || undefined,
        min_order_value: v.min_order_value || 0,
        description: v.description || 'Ưu đãi FLASHY',
        badge: 'Ưu đãi',
      })
    }
  })
  adminVouchers.forEach((v) => map.set(v.code, v))

  return Array.from(map.values())
}

export function validateAndApplyVoucher(
  code: string,
  grossAmount: number,
  options?: { isRebook?: boolean }
): {
  valid: boolean
  discount: number
  voucher?: PlatformVoucher
  error?: string
} {
  const cleanCode = code.trim().toUpperCase()
  if (!cleanCode) {
    return { valid: false, discount: 0, error: 'Vui lòng nhập mã voucher' }
  }

  const all = getAllAvailableVouchers()
  const found = all.find((v) => v.code === cleanCode)

  if (!found) {
    return {
      valid: false,
      discount: 0,
      error: `Mã ưu đãi "${cleanCode}" không tồn tại hoặc đã hết hạn`,
    }
  }

  if (found.min_order_value && grossAmount < found.min_order_value) {
    return {
      valid: false,
      discount: 0,
      error: `Đơn hàng chưa đạt giá trị tối thiểu ${found.min_order_value.toLocaleString('vi-VN')}đ`,
    }
  }

  // Calculate discount
  let discount = 0
  if (found.type === 'PERCENTAGE') {
    discount = Math.round((grossAmount * found.discount_value) / 100)
    if (found.max_discount && discount > found.max_discount) {
      discount = found.max_discount
    }
  } else {
    discount = found.discount_value
  }

  // Cap at grossAmount
  discount = Math.min(discount, grossAmount)

  return {
    valid: true,
    discount,
    voucher: found,
  }
}
