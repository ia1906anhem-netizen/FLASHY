import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

// Routes that require authentication
const PROTECTED_CUSTOMER_ROUTES = ['/customer', '/book']
const PROTECTED_PHOTOGRAPHER_ROUTES = ['/photographer']
const PROTECTED_ADMIN_ROUTES = ['/admin']

// Routes that redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/login', '/register', '/forgot-password']

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const pathname = request.nextUrl.pathname
  const demoRole = request.cookies.get('flashy_role')?.value

  // Admin route protection
  if (PROTECTED_ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    // 1. Check demo role cookie first
    if (demoRole === 'ADMIN') {
      return supabaseResponse
    }

    // 2. Check live Supabase user
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll() {},
        },
      }
    )

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // Customer route protection
  if (PROTECTED_CUSTOMER_ROUTES.some(route => pathname.startsWith(route))) {
    if (!user && !demoRole) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Photographer route protection
  if (PROTECTED_PHOTOGRAPHER_ROUTES.some(route => pathname.startsWith(route))) {
    if (demoRole === 'PHOTOGRAPHER' || demoRole === 'ADMIN') {
      return supabaseResponse
    }

    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Auth routes - redirect to dashboard if already logged in (unless redirecting explicitly)
  if (AUTH_ROUTES.some(route => pathname === route)) {
    const hasRedirectParam = request.nextUrl.searchParams.has('redirect')
    if (!hasRedirectParam && (user || demoRole)) {
      if (demoRole === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      if (demoRole === 'PHOTOGRAPHER') {
        return NextResponse.redirect(new URL('/photographer/dashboard', request.url))
      }
      return NextResponse.redirect(new URL('/customer/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     * - api/webhooks (webhook endpoints must be accessible without auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/webhooks).*)',
  ],
}
