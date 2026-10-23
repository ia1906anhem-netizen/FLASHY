import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { calculateFinancialSplit } from '@/lib/utils/commission'

const checkoutSchema = z.object({
  booking_id: z.string().min(1),
  amount: z.number().int().positive(),
  payment_method: z.enum(['sandbox', 'momo', 'zalopay', 'qr', 'card']),
  package_price: z.number().int().nonnegative().optional(),
  addons_total: z.number().int().nonnegative().optional(),
  travel_fee: z.number().int().nonnegative().optional(),
  studio_fee: z.number().int().nonnegative().optional(),
  return_url: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = checkoutSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { data: null, error: 'Thông tin thanh toán không hợp lệ', details: validation.error.format() },
        { status: 400 }
      )
    }

    const {
      booking_id,
      amount,
      payment_method,
      package_price,
      addons_total,
      travel_fee,
      studio_fee,
    } = validation.data

    const transactionId = `TX-${Date.now()}`

    // Marketplace Financial Split:
    // Nhóm 1: Doanh thu Dịch vụ (Gross Service Value) = Giá Gói Gốc + Giá Add-ons (Hoa hồng 15%)
    // Nhóm 2: Phụ phí Hoàn trả (Reimbursement Fees) = Phụ Thu Di Chuyển + Thuê Studio (100% thợ)
    const financialSplit = calculateFinancialSplit({
      packagePrice: package_price || 0,
      addonsTotal: addons_total || 0,
      travelFee: travel_fee || 0,
      studioFee: studio_fee || 0,
      totalAmount: amount,
    })

    const financialSplitPayload = {
      package_price: financialSplit.packagePrice,
      addons_total: financialSplit.addonsTotal,
      gross_service_value: financialSplit.grossServiceValue,
      platform_take_rate: `${financialSplit.platformRatePercent}%`,
      platform_fee: financialSplit.platformFee,
      photographer_service_payout: financialSplit.photographerServiceShare,
      travel_fee: financialSplit.travelFee,
      studio_fee: financialSplit.studioFee,
      reimbursement_fees: financialSplit.reimbursementFees,
      photographer_reimbursement_payout: financialSplit.photographerReimbursementShare,
      total_amount: financialSplit.totalAmount,
      photographer_net: financialSplit.photographerNet,
      deposit_amount: financialSplit.depositAmount,
      rule_note: 'Hoa hồng sàn 15% áp dụng trên Doanh thu Dịch vụ (Gói + Add-ons). Phụ phí di chuyển & Studio chuyển 100% cho Thợ.',
    }

    if (payment_method === 'sandbox') {
      // Sandbox flow with verified disclaimer
      return NextResponse.json({
        data: {
          transaction_id: transactionId,
          booking_id,
          amount,
          provider: 'sandbox',
          status: 'FUNDS_CONFIRMED',
          is_sandbox: true,
          financial_split: financialSplitPayload,
          notice: 'Thanh toán thử nghiệm – Không phát sinh giao dịch thật',
          checkout_url: null,
          confirmed_at: new Date().toISOString(),
        },
        error: null,
      })
    }

    // For external providers (MoMo / ZaloPay / VietQR) when credentials configured
    return NextResponse.json({
      data: {
        transaction_id: transactionId,
        booking_id,
        amount,
        provider: payment_method,
        status: 'AWAITING_PAYMENT',
        is_sandbox: false,
        financial_split: financialSplitPayload,
        qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=FLASHY_${booking_id}_${amount}`,
        notice: 'Đang kết nối cổng thanh toán được ủy quyền',
      },
      error: null,
    })
  } catch (err: any) {
    return NextResponse.json({ data: null, error: err.message }, { status: 500 })
  }
}

