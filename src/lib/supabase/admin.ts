import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Admin-only Supabase client using service role key.
 * NEVER expose this client to frontend code.
 * Only use in Server Actions and Route Handlers with proper authorization.
 */
export async function createAdminClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // ignore in Server Components
          }
        },
      },
    }
  )
}
