import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    // 1. Authorization: Verify CRON_SECRET header to prevent unauthorized trigger
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Không có quyền truy cập (Unauthorized)' }, { status: 401 })
    }

    const now = new Date()
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString()

    let releasedCount = 0
    let releasedBookings: string[] = []

    try {
      const supabase = await createAdminClient()

          // Query bookings eligible for release:
      // DELIVERED (or legacy PHOTOS_DELIVERED) >= 48h ago, no active dispute
      const { data: eligibleRecords } = await supabase
        .from('escrow_records')
        .select('id, booking_id, gross_amount, net_amount, package_amount, addons_amount, status')
        .in('status', ['DELIVERED', 'REVIEW_WINDOW'])
        .lte('delivery_confirmed_at', fortyEightHoursAgo)

      if (eligibleRecords && eligibleRecords.length > 0) {
        for (const record of eligibleRecords) {
          // Verify no active dispute exists for this booking
          const { data: activeDisputes } = await supabase
            .from('disputes')
            .select('id')
            .eq('booking_id', record.booking_id)
            .in('status', ['OPEN', 'UNDER_REVIEW', 'WAITING_FOR_EVIDENCE'])

                    if (!activeDisputes || activeDisputes.length === 0) {
            // Safe to release — compute CP3 payout split
            // 15% platform commission from package, 100% of addons to photographer
            const packageAmt = record.package_amount || record.gross_amount
            const addonsAmt = record.addons_amount || 0
            const platformCommission = Math.round((packageAmt * 15) / 100)
            const photographerPayout = packageAmt - platformCommission + addonsAmt

            await supabase
              .from('escrow_records')
              .update({
                status: 'RELEASED',
                released_at: now.toISOString(),
                platform_commission: platformCommission,
                photographer_payout: photographerPayout,
              })
              .eq('id', record.id)

            await supabase
              .from('bookings')
              .update({
                status: 'COMPLETED',
                completed_at: now.toISOString(),
              })
              .eq('id', record.booking_id)

            releasedCount++
            releasedBookings.push(record.booking_id)
          }
        }
      }
    } catch (e) {
      // In sandbox mode without live DB
    }

    return NextResponse.json({
      success: true,
      job: 'escrow_release_scheduler',
      executed_at: now.toISOString(),
      released_count: releasedCount,
      released_bookings: releasedBookings,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
