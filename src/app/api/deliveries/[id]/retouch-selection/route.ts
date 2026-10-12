import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

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
    const body = await request.json()
    const validation = retouchSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { data: null, error: 'Dữ liệu không hợp lệ', details: validation.error.format() },
        { status: 400 }
      )
    }

    const { selected_photo_ids, max_allowed_quota, notes, booking_id } = validation.data

    // Strict validation: Reject if selections exceed quota (Section 8.4 requirement)
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
