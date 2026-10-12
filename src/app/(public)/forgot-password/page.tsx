'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Camera, Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      setSubmitted(true)
    } catch (err) {
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-brand flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">FLASHY</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900">Khôi Phục Mật Khẩu</h1>
          <p className="text-xs text-slate-500 mt-1">
            Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu
          </p>
        </div>

        <Card className="rounded-3xl border-slate-200 shadow-xl bg-white p-6 md:p-8">
          <CardContent className="p-0">
            {submitted ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Đã Gửi Hướng Dẫn!</h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  Chúng tôi đã gửi email khôi phục tới <strong>{email}</strong>. Vui lòng kiểm tra hòm thư chính và thư mục Spam.
                </p>
                <Link href="/login">
                  <Button variant="outline" className="rounded-xl w-full text-xs">
                    Quay lại đăng nhập
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Email tài khoản</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      type="email"
                      required
                      placeholder="tenban@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-brand hover:opacity-90 rounded-xl font-bold text-sm shadow-md"
                >
                  {loading ? 'Đang gửi...' : 'Gửi liên kết khôi phục'}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>

                <div className="text-center pt-2">
                  <Link href="/login" className="text-xs text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
