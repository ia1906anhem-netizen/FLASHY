import { describe, it, expect } from 'vitest'
import {
  calculateFullBookingCommission,
  calculateFinancialSplit,
  calculateAddonCommission,
} from '../../src/lib/utils/commission'

describe('Marketplace Commission & Checkout Logic for FLASHY', () => {
  it('Nhóm 1: Doanh thu Dịch vụ (Gói + Add-ons) chịu 15% hoa hồng sàn', () => {
    const packagePrice = 800000 // Gói CASUAL
    const addonsTotal = 250000 // Thêm 30 phút chụp + Retouch
    const split = calculateFinancialSplit({
      packagePrice,
      addonsTotal,
      travelFee: 0,
      studioFee: 0,
    })

    // Gross Service Value = 800k + 250k = 1.050.000 VNĐ
    expect(split.grossServiceValue).toBe(1050000)
    // Hoa hồng sàn = 1.050.000 * 15% = 157.500 VNĐ
    expect(split.platformFee).toBe(157500)
    // Tiền công chụp thợ thực nhận = 1.050.000 * 85% = 892.500 VNĐ
    expect(split.photographerServiceShare).toBe(892500)
    expect(split.photographerServiceShare + split.platformFee).toBe(split.grossServiceValue)
  })

  it('Nhóm 2: Phụ phí Hoàn trả (Di chuyển ngoài 8km + Studio) chuyển 100% cho Thợ, 0% phí sàn', () => {
    const travelFee = 75000 // 5km vượt chuẩn × 15.000đ/km
    const studioFee = 150000 // 1 giờ thuê studio
    const split = calculateFinancialSplit({
      packagePrice: 500000,
      addonsTotal: 0,
      travelFee,
      studioFee,
    })

    expect(split.reimbursementFees).toBe(225000)
    expect(split.photographerReimbursementShare).toBe(225000) // 100% về thợ
  })

  it('Công thức Backend / Checkout: Tổng Khách Thanh Toán, Hoa Hồng Sàn & Thu Nhập Thợ Thực Nhận', () => {
    // Ví dụ: Gói gốc 1.500.000 VNĐ, Add-ons 300.000 VNĐ, Phụ thu di chuyển 120.000 VNĐ (8km vượt)
    const packagePrice = 1500000
    const addonsTotal = 300000
    const travelFee = 120000 // 8km × 15.000 VNĐ/km

    const split = calculateFinancialSplit({
      packagePrice,
      addonsTotal,
      travelFee,
    })

    // 1. Tổng Khách Thanh Toán = (Giá Gói Gốc + Giá Add-ons) + Phụ Thu Di Chuyển
    // = (1.500.000 + 300.000) + 120.000 = 1.920.000 VNĐ
    expect(split.totalAmount).toBe(1920000)

    // 2. Hoa Hồng App Thu = (Giá Gói Gốc + Giá Add-ons) * 15%
    // = 1.800.000 * 15% = 270.000 VNĐ
    expect(split.platformFee).toBe(270000)

    // 3. Thu Nhập Thợ Thực Nhận (Escrow Payout) = ((Gói + Add-ons) * 85%) + Phụ Thu Di Chuyển
    // = (1.800.000 * 85%) + 120.000 = 1.530.000 + 120.000 = 1.650.000 VNĐ
    expect(split.photographerNet).toBe(1650000)

    // Kiểm tra tính toàn vẹn dòng tiền: Khách trả = Phí sàn + Thợ thực nhận
    expect(split.platformFee + split.photographerNet).toBe(split.totalAmount)

    // 4. Tiền cọc 30% qua Escrow
    expect(split.depositAmount).toBe(Math.round(1920000 * 0.3))
  })

  it('calculateFullBookingCommission bóc tách rành mạch 2 nhóm Dịch vụ vs Hoàn trả', () => {
    const result = calculateFullBookingCommission({
      packageSlug: 'flashy-pro',
      packageAmountVnd: 1500000,
      photographerCompletedCount: 10,
      addons: [
        { name: 'Thêm thời gian chụp: 30 phút', amountVnd: 250000 },
        { name: 'Thêm ảnh Retouch kỹ: 5 ảnh', amountVnd: 200000 },
      ],
      travelFee: 60000, // 4km vượt × 15.000đ/km
      studioFee: 150000,
    })

    // Nhóm 1 Gross Service Value: 1.500.000 + 450.000 = 1.950.000 VNĐ
    expect(result.grossServiceValue).toBe(1950000)
    expect(result.totalPlatformCommissionVnd).toBe(Math.round(1950000 * 0.15)) // 292.500
    expect(result.photographerServicePayout).toBe(1950000 - 292500) // 1.657.500

    // Nhóm 2 Reimbursement: 60.000 + 150.000 = 210.000 VNĐ
    expect(result.reimbursementFees).toBe(210000)
    expect(result.photographerReimbursementPayout).toBe(210000)

    // Tổng đơn & Thực nhận
    expect(result.totalGrossVnd).toBe(1950000 + 210000)
    expect(result.totalNetPayoutVnd).toBe(1657500 + 210000)
    expect(result.totalPlatformCommissionVnd + result.totalNetPayoutVnd).toBe(result.totalGrossVnd)
  })

  it('Star of the Quarter được hưởng 0% hoa hồng trên Nhóm 1 (Dịch vụ)', () => {
    const result = calculateFullBookingCommission({
      packageSlug: 'flashy-signature',
      packageAmountVnd: 3200000,
      hasStarOfTheQuarterBenefit: true,
      addons: [{ name: 'Giao ảnh hỏa tốc 24h', amountVnd: 800000 }],
      travelFee: 150000,
    })

    expect(result.packageRatePercent).toBe(0)
    expect(result.totalPlatformCommissionVnd).toBe(0)
    expect(result.photographerServicePayout).toBe(4000000) // 100% dịch vụ
    expect(result.photographerReimbursementPayout).toBe(150000) // 100% phụ thu
    expect(result.totalNetPayoutVnd).toBe(4150000)
  })

  it('Addon riêng biệt: Di chuyển/Studio được tự động phân loại sang reimbursement với 0% hoa hồng', () => {
    const travelAddon = calculateAddonCommission({
      name: 'Phụ thu di chuyển 6km',
      amountVnd: 90000,
    })
    expect(travelAddon.category).toBe('reimbursement')
    expect(travelAddon.ratePercent).toBe(0)
    expect(travelAddon.commissionVnd).toBe(0)
    expect(travelAddon.netPartnerVnd).toBe(90000)

    const serviceAddon = calculateAddonCommission({
      name: 'Thêm ảnh Retouch kỹ: 5 ảnh',
      amountVnd: 200000,
    })
    expect(serviceAddon.category).toBe('service')
    expect(serviceAddon.ratePercent).toBe(15)
    expect(serviceAddon.commissionVnd).toBe(30000)
    expect(serviceAddon.netPartnerVnd).toBe(170000)
  })
})

