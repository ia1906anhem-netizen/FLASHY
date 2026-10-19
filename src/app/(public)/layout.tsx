import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (authUser) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()
    profile = data
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={profile} />
      <main className="flex-1 pt-20 md:pt-24">{children}</main>
      <Footer />
    </div>
  )
}
