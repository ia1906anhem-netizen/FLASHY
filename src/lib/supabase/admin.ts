import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function isSupabaseAdminConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const secretKey = process.env.SUPABASE_SECRET_KEY || ''
  return (
    !!url &&
    !url.includes('placeholder') &&
    !!secretKey &&
    !secretKey.includes('your-supabase') &&
    !secretKey.includes('placeholder') &&
    secretKey.length > 20
  )
}

function createDemoAdminClient(): any {
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
      admin: {
        getUserById: () => Promise.resolve({ data: { user: null }, error: null }),
        deleteUser: () => Promise.resolve({ data: null, error: null }),
        listUsers: () => Promise.resolve({ data: { users: [] }, error: null }),
      },
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
    from: (_table: string) => chainable(),
    storage: {
      from: (_bucket: string) => ({
        upload: noop,
        download: noop,
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  }
}

/**
 * Admin-only Supabase client using service role key.
 * NEVER expose this client to frontend code.
 * Safe fallback enabled to prevent runtime crashes when credentials are not yet configured.
 */
export async function createAdminClient() {
  const cookieStore = await cookies()

  if (!isSupabaseAdminConfigured()) {
    return createDemoAdminClient()
  }

  try {
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
  } catch (err) {
    console.warn('Supabase admin client init fallback:', err)
    return createDemoAdminClient()
  }
}
