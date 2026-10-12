import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('flashy_role')
  response.cookies.delete('flashy_email')
  return response
}
