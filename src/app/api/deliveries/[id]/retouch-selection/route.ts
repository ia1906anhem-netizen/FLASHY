import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getSessionUser, isAuthorizedForBooking } from '@/lib/auth/booking-auth'

const retouchSchema = z.object({
  booking_id: z.string().min(1),
  selected_photo_ids: z.array(z.string()).min(1),
  max_allowed_quota: z.number().int().positive(),
  notes: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // ── Bước 1: Xác thực session ──────────────────────────────────────────────
    const sessionUser = await getSessionUser(request)
    if (!sessionUser) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized: Vui lòng đăng nhập để chọn ảnh retouch' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = retouchSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { data: null, error: 'Dữ liệu không hợp lệ', details: validation.error.format() },
        { status: 400 }
      )
    }

    const { selected_photo_ids, max_allowed_quota, notes, booking_id } = validation.data

    // ── Bước 2: Verify booking ownership (IDOR Protection) ───────────────────
    try {
      const supabase = await createClient()
      const { data: booking, error } = await supabase
        .from('bookings')
        .select('id, customer_id, photographer_id')
        .eq('id', booking_id)
        .single()

      if (!error && booking) {
        const authorized =
          sessionUser.role === 'ADMIN' ||
          isAuthorizedForBooking(
            {
              customer_id: booking.customer_id,
              photographer_id: booking.photographer_id,
            },
            sessionUser
          )

        if (!authorized) {
          return NextResponse.json(
            { data: null, error: 'Bạn không có quyền thực hiện thao tác này' },
            { status: 403 }
          )
        }
      }
    } catch {}

    // ── Bước 3: Validate quota ────────────────────────────────────────────────
    if (selected_photo_ids.length > max_allowed_quota) {
      return NextResponse.json(
        {
          data: null,
          error: `Số lượng ảnh chọn (${selected_photo_ids.length}) vượt quá hạn mức cho phép của gói (${max_allowed_quota} ảnh).`,
        },
        { status: 422 }
      )
    }

    return NextResponse.json({
      data: {
        delivery_id: id,
        booking_id,
        selected_count: selected_photo_ids.length,
        max_quota: max_allowed_quota,
        selected_photo_ids,
        submitted_at: new Date().toISOString(),
        status: 'SUBMITTED',
      },
      error: null,
    })
  } catch (err: any) {
    return NextResponse.json({ data: null, error: err.message }, { status: 500 })
  }
}
