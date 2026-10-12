import { NextRequest, NextResponse } from 'next/server'
import { DEMO_PHOTOGRAPHERS } from '@/lib/data/mock-data'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const district = searchParams.get('district')
    const query = searchParams.get('q')

    // Try Supabase first
    try {
      const supabase = await createClient()
      let dbQuery = supabase
        .from('photographer_profiles')
        .select('*, profiles(full_name, avatar_url, phone)')
        .eq('is_approved', true)

      if (district) {
        dbQuery = dbQuery.eq('district', district)
      }

      const { data, error } = await dbQuery
      if (!error && data && data.length > 0) {
        return NextResponse.json({ data, error: null })
      }
    } catch (e) {
      // Fallback to rich demo data
    }

    // Filter demo data
    let result = DEMO_PHOTOGRAPHERS
    if (district && district !== 'all') {
      result = result.filter(p => p.district === district)
    }
    if (query) {
      const q = query.toLowerCase()
      result = result.filter(p => p.display_name.toLowerCase().includes(q) || p.bio?.toLowerCase().includes(q))
    }

    return NextResponse.json({
      data: result,
      total: result.length,
      error: null,
    })
  } catch (err: any) {
    return NextResponse.json({ data: null, error: err.message }, { status: 500 })
  }
}
