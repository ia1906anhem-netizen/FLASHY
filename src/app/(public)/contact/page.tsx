'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-violet-600 uppercase tracking-wider bg-violet-50 px-3 py-1 rounded-full">
            Hỗ Trợ 24/7
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-3 mb-3">
            Liên Hệ Với FLASHY
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Bạn có thắc mắc về đơn đặt lịch, tài khoản thợ chụp hay cần hợp tác thương mại? Hãy để lại tin nhắn cho chúng tôi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Info cards */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-3">
                <Mail className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Email Hỗ Trợ</h4>
              <p className="text-xs text-slate-500 mb-2">Phản hồi trong vòng 2-4 giờ làm việc</p>
              <a href="mailto:support@flashy.vn" className="text-xs font-bold text-violet-600 hover:underline">
                support@flashy.vn
              </a>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <Phone className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Hotline CSKH</h4>
              <p className="text-xs text-slate-500 mb-2">8:00 - 21:00 hàng ngày (Thứ 2 - CN)</p>
              <a href="tel:19008888" className="text-xs font-bold text-emerald-600 hover:underline">
                1900 8888 (1.000đ/phút)
              </a>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Văn Phòng Điều Hành</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tòa nhà Innovation Hub, 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Đã Gửi Tin Nhắn Thành Công!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                  Cảm ơn bạn đã liên hệ. Đội ngũ Chăm sóc khách hàng FLASHY sẽ liên lạc lại trong thời gian sớm nhất.
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-xl">
                  Gửi tin nhắn khác
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Gửi Yêu Cầu Cho Đội Ngũ Hỗ Trợ</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">Họ và tên *</label>
                    <Input
                      required
                      placeholder="Nguyễn Văn A"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">Email liên hệ *</label>
                    <Input
                      required
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">Số điện thoại</label>
                    <Input
                      placeholder="0912 345 678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">Chủ đề *</label>
                    <Input
                      required
                      placeholder="Vấn đề đặt lịch / Tài khoản / Hợp tác"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Nội dung chi tiết *</label>
                  <Textarea
                    required
                    rows={4}
                    placeholder="Mô tả cụ thể câu hỏi hoặc mã đơn hàng cần giải đáp..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <Button type="submit" className="w-full h-11 bg-brand hover:opacity-90 rounded-xl font-bold text-sm">
                  <Send className="w-4 h-4 mr-2" />
                  Gửi tin nhắn hỗ trợ
                </Button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
