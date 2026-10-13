import { NextRequest, NextResponse } from 'next/server'
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
      // Database not available or table empty
    }

    // Default clean slate: empty array
    return NextResponse.json({
      data: [],
      total: 0,
      error: null,
    })
  } catch (err: any) {
    return NextResponse.json({ data: null, error: err.message }, { status: 500 })
  }
}
