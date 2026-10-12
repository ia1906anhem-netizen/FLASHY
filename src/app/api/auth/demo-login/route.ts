import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const role = (body.role || 'CUSTOMER').toUpperCase()
    const email = body.email || (
      role === 'ADMIN'
        ? 'admin@flashy.vn'
        : role === 'PHOTOGRAPHER'
        ? 'photographer@flashy.vn'
        : 'customer@flashy.vn'
    )

    let redirectTo = '/customer/dashboard'
    if (role === 'ADMIN') {
      redirectTo = '/admin'
    } else if (role === 'PHOTOGRAPHER') {
      redirectTo = '/photographer/dashboard'
    }

    const response = NextResponse.json({
      success: true,
      role,
      email,
      redirectTo,
    })

    // Set secure authentication cookies
    response.cookies.set('flashy_role', role, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    })

    response.cookies.set('flashy_email', email, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    })

    return response
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi xử lý đăng nhập' },
      { status: 400 }
    )
  }
}
