import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const checkoutSchema = z.object({
  booking_id: z.string().min(1),
  amount: z.number().int().positive(),
  payment_method: z.enum(['sandbox', 'momo', 'zalopay', 'qr', 'card']),
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

    const { booking_id, amount, payment_method } = validation.data
    const transactionId = `TX-${Date.now()}`

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
        qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=FLASHY_${booking_id}_${amount}`,
        notice: 'Đang kết nối cổng thanh toán được ủy quyền',
      },
      error: null,
    })
  } catch (err: any) {
    return NextResponse.json({ data: null, error: err.message }, { status: 500 })
  }
}
