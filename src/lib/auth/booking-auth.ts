import { NextRequest } from 'next/server'
import { createClient } from '../supabase/server'

export interface SessionUser {
  id: string
  email?: string | null
  role?: string | null
}

export interface BookingData {
  id?: string
  booking_number?: string
  customer_id?: string | null
  userId?: string | null
  customer_email?: string | null
  photographer_id?: string | null
  photographerId?: string | null
  [key: string]: any
}

/**
 * IDOR Protection: Checks if session user is the customer, photographer, or an admin
 */
export function isAuthorizedForBooking(
  booking: BookingData,
  sessionUser: SessionUser
): boolean {
  if (!sessionUser || !sessionUser.id) return false

  // 1. Admins have permission to inspect/update any booking
  if (sessionUser.role === 'ADMIN') return true

  const sessionUserId = sessionUser.id.trim().toLowerCase()
  const sessionEmail = sessionUser.email ? sessionUser.email.trim().toLowerCase() : ''

  // 2. Customer authorization check
  const bookingCustomerId = (booking.customer_id || booking.userId || '').trim().toLowerCase()
  const bookingCustomerEmail = (booking.customer_email || '').trim().toLowerCase()

  if (bookingCustomerId) {
    if (bookingCustomerId === sessionUserId) return true
    if (sessionEmail && bookingCustomerId === sessionEmail) return true
  }

  if (sessionEmail && bookingCustomerEmail && bookingCustomerEmail === sessionEmail) {
    return true
  }

  // 3. Photographer authorization check
  const bookingPhotographerId = (booking.photographer_id || booking.photographerId || '').trim().toLowerCase()
  if (bookingPhotographerId) {
    if (bookingPhotographerId === sessionUserId) return true
    if (sessionEmail && bookingPhotographerId === sessionEmail) return true
  }

  // Handle demo photographer alias/slug
  if (sessionUser.role === 'PHOTOGRAPHER') {
    const isTriStreet = sessionEmail.includes('photo') || sessionEmail.includes('tri') || sessionUserId.includes('tri')
    if (isTriStreet && ['photographer-tri', 'tri-street', 'photo-1', 'tri_street', 'ph-1', '1'].includes(bookingPhotographerId)) {
      return true
    }
  }

  return false
}

/**
 * Extracts the authenticated user from Supabase session or demo cookie
 */
export async function getSessionUser(request: NextRequest): Promise<SessionUser | null> {
  // 1. Live Supabase session
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if (data?.user) {
      let role = 'CUSTOMER'
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()
        if (profile?.role) role = profile.role
      } catch {}

      return {
        id: data.user.id,
        email: data.user.email || null,
        role,
      }
    }
  } catch {}

  // 2. Demo role cookie fallback
  const demoRole = request.cookies.get('flashy_role')?.value
  const demoEmail = request.cookies.get('flashy_email')?.value
  const demoUserId = request.cookies.get('flashy_user_id')?.value

  if (demoRole) {
    const defaultEmail =
      demoRole === 'ADMIN'
        ? 'admin@flashy.vn'
        : demoRole === 'PHOTOGRAPHER'
        ? 'photo@flashy.vn'
        : 'customer@flashy.vn'

    const email = demoEmail || defaultEmail
    const id = demoUserId || (demoRole === 'CUSTOMER' ? (email === 'customer@flashy.vn' ? 'cust-1' : email) : email)
    return {
      id,
      email,
      role: demoRole,
    }
  }

  // 3. Authorization header fallback (Bearer token/userId)
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim()
    if (token) {
      return {
        id: token,
        email: token.includes('@') ? token : null,
        role: 'CUSTOMER',
      }
    }
  }

  // 4. Custom x-user-id header fallback for internal testing
  const xUserId = request.headers.get('x-user-id')
  if (xUserId) {
    return {
      id: xUserId,
      email: request.headers.get('x-user-email') || null,
      role: request.headers.get('x-user-role') || 'CUSTOMER',
    }
  }

  return null
}
