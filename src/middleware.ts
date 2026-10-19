import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

// Routes that require authentication
const PROTECTED_CUSTOMER_ROUTES = ['/customer', '/book']
const PROTECTED_PHOTOGRAPHER_ROUTES = ['/photographer']
const PROTECTED_ADMIN_ROUTES = ['/admin']

// Routes that redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/login', '/register', '/forgot-password']

// ============================================================
// IN-MEMORY RATE LIMITER (OWASP A07 & A05 Protection)
// ============================================================
interface RateLimitRecord {
  count: number
  resetTime: number
}

// In-memory sliding/fixed window storage per IP & route group
const rateLimitStore = new Map<string, RateLimitRecord>()

function cleanupExpiredRecords(now: number) {
  if (rateLimitStore.size > 2000) {
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }
}

function checkRateLimit(
  ip: string,
  prefix: string,
  maxRequests: number,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; resetTime: number; retryAfterSec: number } {
  const now = Date.now()
  cleanupExpiredRecords(now)

  const key = `${prefix}:${ip}`
  const existing = rateLimitStore.get(key)

  if (!existing || now > existing.resetTime) {
    const newRecord: RateLimitRecord = { count: 1, resetTime: now + windowMs }
    rateLimitStore.set(key, newRecord)
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: newRecord.resetTime,
      retryAfterSec: Math.ceil(windowMs / 1000),
    }
  }

  if (existing.count >= maxRequests) {
    const retryAfterSec = Math.max(1, Math.ceil((existing.resetTime - now) / 1000))
    return {
      allowed: false,
      remaining: 0,
      resetTime: existing.resetTime,
      retryAfterSec,
    }
  }

  existing.count++
  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetTime: existing.resetTime,
    retryAfterSec: Math.ceil((existing.resetTime - now) / 1000),
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // ── RATE LIMITING CHECK ──────────────────────────────────────────────────
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'

  const isAuthRoute =
    AUTH_ROUTES.some((route) => pathname === route) ||
    pathname.startsWith('/api/auth')
  const isApiRoute =
    pathname.startsWith('/api') && !pathname.startsWith('/api/webhooks')

  if (isAuthRoute) {
    // 10 requests per minute for authentication routes (Brute-force protection)
    const { allowed, remaining, resetTime, retryAfterSec } = checkRateLimit(
      clientIp,
      'auth',
      10,
      60_000
    )

    if (!allowed) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json(
          {
            error: 'Quá nhiều yêu cầu xác thực. Vui lòng thử lại sau giây lát (Too Many Requests - Rate Limit Exceeded)',
            retryAfter: retryAfterSec,
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(retryAfterSec),
              'X-RateLimit-Limit': '10',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
            },
          }
        )
      }

      return new NextResponse(
        `<!DOCTYPE html><html><head><title>429 Too Many Requests</title><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #090d16; color: #fff; text-align: center; padding: 20px;"><div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 40px; max-width: 480px;"><div style="font-size: 48px; margin-bottom: 16px;">⏳</div><h1 style="color: #f43f5e; font-size: 22px; margin-bottom: 12px; font-weight: 800;">429 - Quá nhiều yêu cầu xác thực</h1><p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">Để bảo vệ an toàn tài khoản, hệ thống giới hạn tối đa 10 lần yêu cầu mỗi phút. Vui lòng đợi <strong>${retryAfterSec} giây</strong> trước khi thử lại.</p><a href="/" style="display: inline-block; padding: 10px 24px; border-radius: 12px; background: linear-gradient(135deg, #7c3aed, #ec4899); color: #fff; text-decoration: none; font-weight: 600; font-size: 14px;">Trở về trang chủ</a></div></body></html>`,
        {
          status: 429,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Retry-After': String(retryAfterSec),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
          },
        }
      )
    }
  } else if (isApiRoute) {
    // 60 requests per minute for general API routes (DDoS / Scraping protection)
    const { allowed, remaining, resetTime, retryAfterSec } = checkRateLimit(
      clientIp,
      'api',
      60,
      60_000
    )

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Tần suất gọi API vượt quá giới hạn (60 requests/phút). Vui lòng thử lại sau (Rate Limit Exceeded)',
          retryAfter: retryAfterSec,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSec),
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
          },
        }
      )
    }
  }

  const { supabaseResponse, user } = await updateSession(request)
  const demoRole = request.cookies.get('flashy_role')?.value

  // Helper: exact match or subpath match (e.g. /photographer or /photographer/..., but NOT /photographers)
  const isMatch = (base: string) => pathname === base || pathname.startsWith(`${base}/`)

  // Resolve effective user role
  let userRole: 'CUSTOMER' | 'PHOTOGRAPHER' | 'ADMIN' | null = null
  if (demoRole === 'ADMIN' || demoRole === 'PHOTOGRAPHER' || demoRole === 'CUSTOMER') {
    userRole = demoRole
  }

  if (!userRole && user) {
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

        if (profile?.role) {
          userRole = profile.role as any
        }
      }
    } catch {
      // Fallback
    }
    if (!userRole) {
      userRole = 'CUSTOMER'
    }
  }

  const isAuthenticated = Boolean(userRole || user)

  // 1. Admin route protection (/admin/*): Strictly ADMIN only
  if (PROTECTED_ADMIN_ROUTES.some(isMatch)) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    if (userRole !== 'ADMIN') {
      // Customer or Photographer attempting to access /admin/* -> Block and redirect to /unauthorized
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    return supabaseResponse
  }

  // 2. Photographer route protection (/photographer/*): Strictly PHOTOGRAPHER and ADMIN
  if (PROTECTED_PHOTOGRAPHER_ROUTES.some(isMatch)) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    if (userRole === 'CUSTOMER') {
      // Customer attempting to access /photographer/* -> Strictly block and redirect to /unauthorized
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    return supabaseResponse
  }

  // 3. Customer route protection (/customer/*, /book/*): Requires authentication
  if (PROTECTED_CUSTOMER_ROUTES.some(isMatch)) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Auth routes - redirect to dashboard or intended target if already authenticated
  if (AUTH_ROUTES.some(route => pathname === route)) {
    const redirectParam = request.nextUrl.searchParams.get('redirect')
    if (isAuthenticated) {
      const role = userRole || 'CUSTOMER'
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
