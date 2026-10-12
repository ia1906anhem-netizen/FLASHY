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

  // Helper: exact match or subpath match (e.g. /photographer or /photographer/..., but NOT /photographers)
  const isMatch = (base: string) => pathname === base || pathname.startsWith(`${base}/`)

  // Admin route protection
  if (PROTECTED_ADMIN_ROUTES.some(isMatch)) {
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

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      if (supabaseUrl && supabaseKey) {
        const supabase = createServerClient(
          supabaseUrl,
          supabaseKey,
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
    } catch {
      // Fallback
    }
  }

  // Customer route protection
  if (PROTECTED_CUSTOMER_ROUTES.some(isMatch)) {
    if (!user && !demoRole) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Photographer route protection
  if (PROTECTED_PHOTOGRAPHER_ROUTES.some(isMatch)) {
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

  // Auth routes - redirect to dashboard or intended target if already authenticated
  if (AUTH_ROUTES.some(route => pathname === route)) {
    const redirectParam = request.nextUrl.searchParams.get('redirect')
    if (user || demoRole) {
      const role = demoRole || 'CUSTOMER'
      // If there's a valid redirect param that is not an auth route itself
      if (redirectParam && !AUTH_ROUTES.some(r => redirectParam.startsWith(r))) {
        // Prevent customer from being redirected to admin/photographer private areas
        const isTargetAllowed = 
          role === 'ADMIN' ? true :
          role === 'PHOTOGRAPHER' ? !redirectParam.startsWith('/admin') :
          !redirectParam.startsWith('/admin') && !redirectParam.startsWith('/photographer/') && redirectParam !== '/photographer'

        if (isTargetAllowed) {
          return NextResponse.redirect(new URL(redirectParam, request.url))
        }
      }

      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      if (role === 'PHOTOGRAPHER') {
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
