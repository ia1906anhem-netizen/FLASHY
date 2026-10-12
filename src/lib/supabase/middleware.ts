import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''

/**
 * Returns true when Supabase credentials look like real credentials
 * (not placeholder values and not empty).
 */
function isSupabaseConfigured(): boolean {
  return (
    !!SUPABASE_URL &&
    !SUPABASE_URL.includes('placeholder') &&
    !!SUPABASE_KEY &&
    !SUPABASE_KEY.includes('placeholder') &&
    SUPABASE_KEY.length > 100
  )
}

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request })

  // If Supabase is not properly configured (demo / local mode),
  // skip session refresh and return no user.
  if (!isSupabaseConfigured()) {
    return { supabaseResponse, user: null }
  }

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          const updatedResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            updatedResponse.cookies.set(name, value, options)
          )
          // Re-assign so callers use the updated response with cookies set
          Object.assign(supabaseResponse, updatedResponse)
        },
      },
    }
  )

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    return { supabaseResponse, user }
  } catch {
    // Auth call failed (e.g. network error, invalid key) — treat as unauthenticated
    return { supabaseResponse, user: null }
  }
}
