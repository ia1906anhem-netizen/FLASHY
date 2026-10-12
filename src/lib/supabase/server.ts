import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''

/**
 * Returns true when Supabase credentials look like real credentials.
 */
export function isSupabaseConfigured(): boolean {
  return (
    !!SUPABASE_URL &&
    !SUPABASE_URL.includes('placeholder') &&
    !!SUPABASE_KEY &&
    !SUPABASE_KEY.includes('placeholder') &&
    SUPABASE_KEY.length > 20
  )
}

export async function createClient() {
  const cookieStore = await cookies()

  // If Supabase is not configured, return a no-op mock client
  if (!isSupabaseConfigured()) {
    return createDemoClient()
  }

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_KEY,
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
            // setAll called from Server Component - can be ignored
          }
        },
      },
    }
  )
}

/**
 * A minimal demo client that returns empty/null responses for all operations.
 * Used when Supabase credentials are not configured for local demo mode.
 */
function createDemoClient(): any {
  const noop = () => Promise.resolve({ data: null, error: null })
  const chainable = (): any => {
    const obj: any = {
      select: () => chainable(),
      insert: () => chainable(),
      update: () => chainable(),
      delete: () => chainable(),
      eq: () => chainable(),
      neq: () => chainable(),
      in: () => chainable(),
      order: () => chainable(),
      limit: () => chainable(),
      single: () => Promise.resolve({ data: null, error: null }),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      then: (resolve: any) => resolve({ data: null, error: null }),
    }
    return obj
  }

  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Demo mode: Supabase not configured' } }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Demo mode: Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: (_table: string) => chainable(),
    storage: {
      from: (_bucket: string) => ({
        upload: noop,
        download: noop,
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        createSignedUrl: noop,
      }),
    },
    channel: (_name: string) => ({
      on: () => ({ subscribe: () => ({}) }),
    }),
    removeChannel: () => {},
  }
}
