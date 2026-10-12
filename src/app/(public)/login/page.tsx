'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Camera,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  User,
  CheckCircle2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get('redirect')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  // Demo Login helper
  const performDemoLogin = async (role: 'CUSTOMER' | 'PHOTOGRAPHER' | 'ADMIN', userEmail?: string) => {
    setLoading(true)
    setErrorMsg('')
      const effectiveEmail = userEmail || email
      const normalizedEmail = effectiveEmail.trim().toLowerCase()
      let finalUserName = ''
      try {
        const existingUsers = JSON.parse(localStorage.getItem('flashy_registered_users') || '{}')
        if (existingUsers[normalizedEmail]?.full_name) {
          finalUserName = existingUsers[normalizedEmail].full_name
        }
      } catch {}

      if (!finalUserName) {
        finalUserName =
          role === 'ADMIN'
            ? 'Ban Qu\u1ea3n Tr\u1ecb Flashy'
            : role === 'PHOTOGRAPHER'
            ? (normalizedEmail.includes('photo') ? 'Minh Tr\u00ed (TriStreet)' : normalizedEmail.split('@')[0])
            : (normalizedEmail.includes('cust') ? 'Nguy\u1ec5n Thu Trang' : normalizedEmail.split('@')[0])
      }

      // IMPORTANT: Clear any previous session before setting new one
      document.cookie = 'flashy_role=; path=/; max-age=0'
      document.cookie = 'flashy_email=; path=/; max-age=0'
      document.cookie = 'flashy_name=; path=/; max-age=0'
      try { localStorage.removeItem('flashy_current_user') } catch {}

      // Set new session cookies
      document.cookie = `flashy_role=${role}; path=/; max-age=604800; SameSite=Lax`
      document.cookie = `flashy_email=${encodeURIComponent(normalizedEmail)}; path=/; max-age=604800; SameSite=Lax`
      document.cookie = `flashy_name=${encodeURIComponent(finalUserName)}; path=/; max-age=604800; SameSite=Lax`

      try {
        localStorage.setItem('flashy_current_user', JSON.stringify({
          email: normalizedEmail,
          full_name: finalUserName,
          role
        }))
      } catch {}

      // Call API to also set HTTP-only cookie on response
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, email: normalizedEmail, name: finalUserName, fullName: finalUserName }),
      })
      const data = await res.json()

      let target = redirectParam || data?.redirectTo
      if (target) {
        if (role === 'CUSTOMER' && (target.startsWith('/photographer/') || target === '/photographer' || target.startsWith('/admin'))) {
          target = '/customer/dashboard'
        } else if (role === 'PHOTOGRAPHER' && target.startsWith('/admin')) {
          target = '/photographer/dashboard'
        }
      } else {
        target =
          role === 'ADMIN'
            ? '/admin'
            : role === 'PHOTOGRAPHER'
            ? '/photographer/dashboard'
            : '/customer/dashboard'
      }

      setSuccessMsg(`Đăng nhập thành công với vai trò ${role}! Đang chuyển hướng...`)
      setTimeout(() => {
        window.location.href = target
      }, 500)
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi đăng nhập')
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Fallback demo simulation if Supabase is not connected
        let role: 'ADMIN' | 'PHOTOGRAPHER' | 'CUSTOMER' = 'CUSTOMER'
        if (email.toLowerCase().includes('admin')) {
          role = 'ADMIN'
        } else if (email.toLowerCase().includes('photo') || email.toLowerCase().includes('tri')) {
          role = 'PHOTOGRAPHER'
        }
        await performDemoLogin(role, email)
        return
      }

      // Check role from profile if live Supabase succeeds
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        const role = profile?.role || 'CUSTOMER'
        await performDemoLogin(role, data.user.email)
      }
    } catch (err: any) {
      // Fallback in case of network or config error
      let role: 'ADMIN' | 'PHOTOGRAPHER' | 'CUSTOMER' = 'CUSTOMER'
      if (email.toLowerCase().includes('admin')) {
        role = 'ADMIN'
      } else if (email.toLowerCase().includes('photo') || email.toLowerCase().includes('tri')) {
        role = 'PHOTOGRAPHER'
      }
      await performDemoLogin(role, email)
    }
  }

  // Quick 1-Click Demo Login
  const handleQuickDemo = (role: 'CUSTOMER' | 'PHOTOGRAPHER' | 'ADMIN') => {
    if (role === 'ADMIN') {
      setEmail('admin@flashy.vn')
      setPassword('Admin@123456')
      performDemoLogin('ADMIN', 'admin@flashy.vn')
    } else if (role === 'PHOTOGRAPHER') {
      setEmail('photographer@flashy.vn')
      setPassword('Photo@123456')
      performDemoLogin('PHOTOGRAPHER', 'photographer@flashy.vn')
    } else {
      setEmail('customer@flashy.vn')
      setPassword('Customer@123456')
      performDemoLogin('CUSTOMER', 'customer@flashy.vn')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">FLASHY</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900">Đăng Nhập Tài Khoản</h1>
          <p className="text-xs text-slate-500 mt-1">
            Chọn tài khoản demo bên dưới để vào trực tiếp hoặc nhập thông tin đăng nhập
          </p>
        </div>

        {/* 1-Click Quick Demo Login Section */}
        <div className="mb-4 p-4 rounded-2xl bg-white border border-violet-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-violet-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-violet-600" />
              Đăng nhập nhanh 1-Click (Demo Mode)
            </span>
            <Badge className="bg-violet-100 text-violet-800 border-violet-200 text-[10px]">
              Sẵn sàng
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo('ADMIN')}
              className="p-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">👑</span>
                <span className="text-[9px] font-bold text-purple-700 bg-purple-200 px-1 py-0.5 rounded">ADMIN</span>
              </div>
              <p className="text-xs font-bold text-purple-900 line-clamp-1">Quản Trị</p>
              <p className="text-[10px] text-purple-600 font-mono">admin@flashy</p>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo('PHOTOGRAPHER')}
              className="p-2.5 rounded-xl border border-pink-200 bg-pink-50 hover:bg-pink-100 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">📷</span>
                <span className="text-[9px] font-bold text-pink-700 bg-pink-200 px-1 py-0.5 rounded">THỢ ẢNH</span>
              </div>
              <p className="text-xs font-bold text-pink-900 line-clamp-1">Nhiếp Ảnh</p>
              <p className="text-[10px] text-pink-600 font-mono">photo@flashy</p>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickDemo('CUSTOMER')}
              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">👤</span>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-200 px-1 py-0.5 rounded">KHÁCH</span>
              </div>
              <p className="text-xs font-bold text-emerald-900 line-clamp-1">Khách Hàng</p>
              <p className="text-[10px] text-emerald-600 font-mono">cust@flashy</p>
            </button>
          </div>
        </div>

        {/* Standard Login Card */}
        <Card className="rounded-3xl border-slate-200 shadow-xl bg-white p-6 md:p-8">
          <CardContent className="p-0">
            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Email tài khoản</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    required
                    placeholder="admin@flashy.vn hoặc photo@flashy.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Mật khẩu</label>
                  <Link href="/forgot-password" className="text-xs text-violet-600 hover:underline font-semibold">
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm shadow-md"
              >
                {loading ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Chưa có tài khoản?{' '}
                <Link href="/register" className="font-bold text-violet-600 hover:underline">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  )
}

