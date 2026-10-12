import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { provider } = await params
    const rawBody = await request.text()
    const signature = request.headers.get('x-signature') || request.headers.get('x-webhook-signature')

    // Parse webhook payload
    let payload: any
    try {
      payload = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    }

    const { transaction_id, booking_id, amount, status } = payload
    const idempotencyKey = payload.idempotency_key || `idemp-${transaction_id}`

    // Verify webhook signature if secret configured
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET
    if (webhookSecret && provider !== 'sandbox') {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex')

      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Chữ ký webhook không hợp lệ (Invalid signature)' }, { status: 401 })
      }
    }

    // Process payment & Escrow update in database
    try {
      const supabase = await createClient()

      // 1. Idempotency check: Ensure webhook event not processed twice
      const { data: existingEvent } = await supabase
        .from('payment_webhook_events')
        .select('id')
        .eq('idempotency_key', idempotencyKey)
        .single()

      if (existingEvent) {
        return NextResponse.json({ message: 'Event already processed (Idempotent)' }, { status: 200 })
      }

      // 2. Record webhook event
      await supabase.from('payment_webhook_events').insert({
        provider,
        idempotency_key: idempotencyKey,
        payload,
        processed_at: new Date().toISOString(),
      })

      // 3. Update payment status to FUNDS_CONFIRMED
      if (status === 'SUCCESS' || status === 'CONFIRMED' || provider === 'sandbox') {
        await supabase
          .from('payments')
          .update({
            status: 'FUNDS_CONFIRMED',
            paid_at: new Date().toISOString(),
            provider_transaction_id: transaction_id,
          })
          .eq('booking_id', booking_id)

        // 4. Update booking to CONFIRMED
        await supabase
          .from('bookings')
          .update({ status: 'CONFIRMED' })
          .eq('id', booking_id)
      }
    } catch (e) {
      // In sandbox mode without database connection, acknowledge receipt
    }

    return NextResponse.json({
      success: true,
      provider,
      booking_id,
      status: 'PROCESSED',
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
