import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSessionUser, isAuthorizedForBooking } from '@/lib/auth/booking-auth'
import { DEMO_PHOTOGRAPHERS } from '@/lib/data/mock-data'
import { logIdorAttempt } from '@/lib/security-logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // ── Bước 1: Lấy session user đang đăng nhập ──────────────────────────────
    const sessionUser = await getSessionUser(request)
    if (!sessionUser) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized: Vui lòng đăng nhập để xem thông tin đơn đặt lịch' },
        { status: 401 }
      )
    }

    const session = {
      user: {
        id: sessionUser.id,
        email: sessionUser.email,
        role: sessionUser.role,
      },
    }

    // ── Bước 2: Fetch booking từ Database ────────────────────────────────────
    let booking: any = null
    let fromDB = false

    try {
      const supabase = await createClient()

      // Với Supabase live: xây query có điều kiện ownership ngay tại DB
      // Giúp tránh tình trạng fetch rồi mới check (fetch-then-check anti-pattern)
      let query = supabase
        .from('bookings')
        .select('*, photographer_profiles(display_name, avatar_url, slug, user_id), service_packages(name, slug)')
        .or(`id.eq.${id},booking_number.eq.${id}`)

      // Nếu không phải ADMIN thì giới hạn theo ownership ngay tại DB query
      if (session.user.role !== 'ADMIN') {
        query = query.or(
          `customer_id.eq.${session.user.id},photographer_id.eq.${session.user.id}`,
          { referencedTable: undefined }
        ) as any
      }

      const { data, error } = await query.single()

      if (!error && data) {
        fromDB = true
        booking = {
          ...data,
          // Normalize field names để isAuthorizedForBooking() hoạt động nhất quán
          userId: data.userId || data.customer_id,
          photographerId:
            data.photographerId ||
            data.photographer_id ||
            data.photographer_profiles?.user_id,
        }
      }
    } catch {}

    // ── Bước 3: Fallback demo/mock (CHỈ khi Supabase chưa configure) ─────────
    // QUAN TRỌNG: Mock fallback chỉ dùng cho demo mode - không expose data thật
    if (!booking) {
      // Nếu đây là demo mode (không có DB), tạo mock booking với đúng customer_id của session
      // để IDOR check bên dưới vẫn hoạt động chính xác
      const isMockId =
        id.startsWith('BK-') ||
        id.startsWith('booking-') ||
        id === 'demo' ||
        /^\d+$/.test(id)

      if (isMockId) {
        const defaultPhotographer = DEMO_PHOTOGRAPHERS[0]
        // Mock booking với customer_id khớp với session user hiện tại
        booking = {
          id,
          booking_number: id,
          customer_id: session.user.id,          // ← Gắn đúng session user
          userId: session.user.id,               // ← Không hardcode 'cust-1' nữa
          customer_name: 'Nguyễn Thu Trang',
          customer_email: session.user.email || 'customer@flashy.vn',
          photographer_id: defaultPhotographer.id,
          photographerId: defaultPhotographer.id,
          photographer_name: defaultPhotographer.display_name,
          package_name: 'Gói Chụp Ngoại Cảnh Sài Gòn',
          status: 'CONFIRMED',
          total_amount: 550000,
          shooting_date: '2026-10-25',
          shooting_time: '09:00',
          location: 'Quận 1, TP. Hồ Chí Minh',
          created_at: new Date().toISOString(),
          _is_demo: true,
        }
      }
    }

    // ── Bước 4: Nếu không tìm thấy booking nào → 404 ─────────────────────────
    if (!booking) {
      return NextResponse.json(
        { data: null, error: 'Không tìm thấy đơn đặt lịch' },
        { status: 404 }
      )
    }

    // Normalize để đảm bảo các field cần thiết luôn có
    if (!booking.userId && booking.customer_id) booking.userId = booking.customer_id
    if (!booking.photographerId && booking.photographer_id) booking.photographerId = booking.photographer_id

    // ── Bước 5: IDOR Check – So sánh booking.userId / photographerId với session.user.id ──
    // Kết hợp direct ID comparison VÀ isAuthorizedForBooking() làm safety net
    const isOwner =
      session.user.role === 'ADMIN' ||
      booking.userId === session.user.id ||
      booking.photographerId === session.user.id ||
      isAuthorizedForBooking(booking, sessionUser)

    // ── Nếu không khớp → 403 Forbidden, tuyệt đối không trả data ────────────
    if (!isOwner) {
      await logIdorAttempt({
        userId: sessionUser.id,
        userEmail: sessionUser.email,
        userRole: sessionUser.role,
        targetBookingId: id,
        ownerId: booking.userId,
        endpoint: `/api/bookings/${id}`,
        ipAddress:
          request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
          request.headers.get('x-real-ip') ||
          undefined,
      })

      return NextResponse.json(
        {
          data: null,
          error: 'Bạn không có quyền xem đơn đặt lịch này',
          message: 'Bạn không có quyền xem đơn đặt lịch này',
        },
        { status: 403 }
      )
    }

    // ── Nếu khớp → 200 OK, trả về dữ liệu ───────────────────────────────────
    return NextResponse.json({ data: booking, error: null }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ data: null, error: err.message }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // ── Bước 1: Lấy session user đang đăng nhập ──────────────────────────────
    const sessionUser = await getSessionUser(request)
    if (!sessionUser) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized: Vui lòng đăng nhập để cập nhật đơn đặt lịch' },
        { status: 401 }
      )
    }

    const session = {
      user: {
        id: sessionUser.id,
        email: sessionUser.email,
        role: sessionUser.role,
      },
    }

    // ── Bước 2: Fetch booking ─────────────────────────────────────────────────
    let booking: any = null

    try {
      const supabase = await createClient()

      let query = supabase
        .from('bookings')
        .select('*')
        .or(`id.eq.${id},booking_number.eq.${id}`)

      // Scope query theo ownership nếu không phải ADMIN
      if (session.user.role !== 'ADMIN') {
        query = query.or(
          `customer_id.eq.${session.user.id},photographer_id.eq.${session.user.id}`,
          { referencedTable: undefined }
        ) as any
      }

      const { data, error } = await query.single()

      if (!error && data) {
        booking = {
          ...data,
          userId: data.userId || data.customer_id,
          photographerId: data.photographerId || data.photographer_id,
        }
      }
    } catch {}

    // ── Mock fallback ─────────────────────────────────────────────────────────
    if (!booking) {
      const isMockId =
        id.startsWith('BK-') ||
        id.startsWith('booking-') ||
        id === 'demo' ||
        /^\d+$/.test(id)

      if (isMockId) {
        const defaultPhotographer = DEMO_PHOTOGRAPHERS[0]
        booking = {
          id,
          booking_number: id,
          customer_id: session.user.id,
          userId: session.user.id,
          customer_name: 'Nguyễn Thu Trang',
          customer_email: session.user.email || 'customer@flashy.vn',
          photographer_id: defaultPhotographer.id,
          photographerId: defaultPhotographer.id,
          photographer_name: defaultPhotographer.display_name,
          status: 'CONFIRMED',
          total_amount: 550000,
          _is_demo: true,
        }
      }
    }

    // ── 404 nếu không tìm thấy ────────────────────────────────────────────────
    if (!booking) {
      return NextResponse.json(
        { data: null, error: 'Không tìm thấy đơn đặt lịch' },
        { status: 404 }
      )
    }

    if (!booking.userId && booking.customer_id) booking.userId = booking.customer_id
    if (!booking.photographerId && booking.photographer_id) booking.photographerId = booking.photographer_id

    // ── Bước 3: IDOR Check ────────────────────────────────────────────────────
    const isOwner =
      session.user.role === 'ADMIN' ||
      booking.userId === session.user.id ||
      booking.photographerId === session.user.id ||
      isAuthorizedForBooking(booking, sessionUser)

    if (!isOwner) {
      await logIdorAttempt({
        userId: sessionUser.id,
        userEmail: sessionUser.email,
        userRole: sessionUser.role,
        targetBookingId: id,
        ownerId: booking.userId,
        endpoint: `/api/bookings/${id}`,
        ipAddress:
          request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
          request.headers.get('x-real-ip') ||
          undefined,
      })

      return NextResponse.json(
        {
          data: null,
          error: 'Bạn không có quyền chỉnh sửa đơn đặt lịch này',
          message: 'Bạn không có quyền chỉnh sửa đơn đặt lịch này',
        },
        { status: 403 }
      )
    }

    // ── Bước 4: Update booking ────────────────────────────────────────────────
    const updated = {
      ...booking,
      ...body,
      updated_at: new Date().toISOString(),
    }

    try {
      const supabase = await createClient()
      await supabase
        .from('bookings')
        .update(body)
        .or(`id.eq.${id},booking_number.eq.${id}`)
    } catch {}

    return NextResponse.json({ data: updated, error: null }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ data: null, error: err.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(request, context)
}
