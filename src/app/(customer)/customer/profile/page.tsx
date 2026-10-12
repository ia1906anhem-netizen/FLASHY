'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Camera,
  Phone,
  Mail,
  MapPin,
  Bell,
  Shield,
  Edit2,
  Save,
  X,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'

const DEMO_PROFILE = {
  display_name: 'Nguyễn Hoa Mai',
  email: 'hoamai@example.com',
  phone: '0901234567',
  avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
  location: 'Quận 3, TP. Hồ Chí Minh',
  membership_tier: 'Creator',
  loyalty_coins: 320,
  joined: '2024-03-15',
  total_bookings: 12,
  verified_email: true,
  verified_phone: false,
}

export default function CustomerProfilePage() {
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState(DEMO_PROFILE)
  const [form, setForm] = useState({
    display_name: DEMO_PROFILE.display_name,
    phone: DEMO_PROFILE.phone,
    location: DEMO_PROFILE.location,
  })

  const handleSave = () => {
    setProfile(prev => ({ ...prev, ...form }))
    setEditing(false)
    toast.success('Đã cập nhật hồ sơ thành công!')
  }

  const handleCancel = () => {
    setForm({
      display_name: profile.display_name,
      phone: profile.phone,
      location: profile.location,
    })
    setEditing(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-black text-slate-900">Hồ sơ cá nhân</h1>
            <p className="text-slate-500 text-sm mt-1">Quản lý thông tin tài khoản của bạn</p>
          </div>
          {!editing ? (
            <Button onClick={() => setEditing(true)} variant="outline" size="sm" className="gap-2">
              <Edit2 className="w-4 h-4" />
              Chỉnh sửa
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="ghost" size="sm" className="gap-2">
                <X className="w-4 h-4" />
                Hủy
              </Button>
              <Button onClick={handleSave} size="sm" className="gap-2 bg-violet-600 hover:bg-violet-700 text-white">
                <Save className="w-4 h-4" />
                Lưu thay đổi
              </Button>
            </div>
          )}
        </motion.div>

        {/* Avatar & Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
        >
          <div className="flex items-start gap-6">
            <div className="relative flex-shrink-0">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                <AvatarFallback className="bg-violet-100 text-violet-700 text-2xl font-bold">
                  {profile.display_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <button
                className="absolute bottom-0 right-0 w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-violet-700 transition-colors"
                title="Đổi ảnh đại diện"
                onClick={() => toast.info('Tính năng đổi ảnh yêu cầu kết nối Supabase Storage')}
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="display_name" className="text-xs font-semibold text-slate-500 uppercase">Tên hiển thị</Label>
                    <Input
                      id="display_name"
                      value={form.display_name}
                      onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-slate-900">{profile.display_name}</h2>
                  <p className="text-slate-500 text-sm">{profile.email}</p>
                </>
              )}

              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Badge className="bg-violet-100 text-violet-700 border-0 font-semibold">
                  {profile.membership_tier}
                </Badge>
                <Badge className="bg-amber-100 text-amber-700 border-0 font-semibold">
                  ⚡ {profile.loyalty_coins} Flashy Coins
                </Badge>
                <span className="text-xs text-slate-400">
                  {profile.total_bookings} lần đặt chụp
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4"
        >
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <User className="w-4 h-4 text-violet-500" />
            Thông tin liên hệ
          </h3>

          {/* Email */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <Mail className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Email</p>
                <p className="text-sm font-semibold text-slate-800">{profile.email}</p>
              </div>
            </div>
            {profile.verified_email ? (
              <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">✓ Đã xác minh</Badge>
            ) : (
              <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info('Gửi email xác minh')}>
                Xác minh
              </Button>
            )}
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Phone className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Số điện thoại</p>
                {editing ? (
                  <Input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="mt-1 h-8 text-sm w-48"
                    placeholder="0901234567"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-800">{profile.phone}</p>
                )}
              </div>
            </div>
            {!editing && (
              profile.verified_phone ? (
                <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">✓ Đã xác minh</Badge>
              ) : (
                <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info('Xác minh OTP yêu cầu cấu hình SMS provider')}>
                  Xác minh OTP
                </Button>
              )
            )}
          </div>

          {/* Location */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center">
                <MapPin className="w-4 h-4 text-rose-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Địa chỉ</p>
                {editing ? (
                  <Input
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    className="mt-1 h-8 text-sm w-64"
                    placeholder="Quận, Thành phố"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-800">{profile.location}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3"
        >
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-4 h-4 text-violet-500" />
            Bảo mật tài khoản
          </h3>

          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div>
              <p className="text-sm font-semibold text-slate-800">Đổi mật khẩu</p>
              <p className="text-xs text-slate-400">Cập nhật mật khẩu đăng nhập</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.info('Yêu cầu đổi mật khẩu đã được gửi vào email của bạn')}>
              Đổi mật khẩu
            </Button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Xóa tài khoản</p>
              <p className="text-xs text-slate-400">Yêu cầu xóa toàn bộ dữ liệu cá nhân</p>
            </div>
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => toast.error('Chức năng xóa tài khoản cần xác nhận qua email')}>
              Yêu cầu xóa
            </Button>
          </div>
        </motion.div>

        {/* Demo notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
          <strong>⚠ Chế độ Demo:</strong> Hồ sơ hiển thị là dữ liệu mẫu. Kết nối Supabase để lưu thông tin thực.
        </div>

      </div>
    </div>
  )
}
