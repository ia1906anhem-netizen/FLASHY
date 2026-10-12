import { createBrowserClient } from '@supabase/ssr'

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  return !!url && !!key && !url.includes('placeholder') && !key.includes('placeholder')
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) {
    return createDemoBrowserClient()
  }

  try {
    return createBrowserClient(url, key)
  } catch (err) {
    console.warn('Supabase browser client init fallback:', err)
    return createDemoBrowserClient()
  }
}

function createDemoBrowserClient(): any {
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
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: (_table: string) => chainable(),
    storage: {
      from: (_bucket: string) => ({
        upload: noop,
        download: noop,
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
    channel: (_name: string) => ({
      on: () => ({ subscribe: () => ({}) }),
    }),
    removeChannel: () => {},
  }
}

