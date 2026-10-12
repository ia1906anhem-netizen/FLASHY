'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Bell,
  Globe,
  Lock,
  CreditCard,
  Trash2,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Moon,
  Sun,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ToggleProps {
  enabled: boolean
  onToggle: () => void
}

function Toggle({ enabled, onToggle }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-violet-500' : 'bg-slate-200'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  )
}

export default function CustomerSettingsPage() {
  const [settings, setSettings] = useState({
    push_booking: true,
    push_promotions: true,
    push_reviews: false,
    email_booking: true,
    email_newsletter: false,
    dark_mode: false,
    language: 'vi',
    public_profile: true,
    share_location: false,
    marketing_consent: false,
  })

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => {
      const newVal = { ...prev, [key]: !prev[key] }
      toast.success('Đã lưu cài đặt')
      return newVal
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-violet-500" />
            Cài đặt
          </h1>
          <p className="text-slate-500 text-sm mt-1">Tùy chỉnh trải nghiệm FLASHY của bạn</p>
        </motion.div>

        {/* Notifications Settings */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-violet-500" />
            <h2 className="font-bold text-slate-800 text-sm">Thông báo</h2>
          </div>

          {[
            { key: 'push_booking' as const, label: 'Thông báo đặt chụp', desc: 'Cập nhật trạng thái đơn hàng, nhiếp ảnh gia xác nhận/từ chối' },
            { key: 'push_promotions' as const, label: 'Khuyến mãi & Voucher', desc: 'Thông báo ưu đãi, voucher mới và chương trình đặc biệt' },
            { key: 'push_reviews' as const, label: 'Nhắc nhở đánh giá', desc: 'Nhắc bạn để lại đánh giá sau buổi chụp' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between px-5 py-4 border-b border-slate-50 last:border-0">
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
              <Toggle enabled={settings[item.key]} onToggle={() => toggle(item.key)} />
            </div>
          ))}
        </motion.section>

        {/* Email Settings */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-500" />
            <h2 className="font-bold text-slate-800 text-sm">Email</h2>
          </div>

          {[
            { key: 'email_booking' as const, label: 'Xác nhận đơn hàng qua email', desc: 'Nhận hóa đơn và xác nhận đặt chụp qua email' },
            { key: 'email_newsletter' as const, label: 'Bản tin FLASHY', desc: 'Bài viết, mẹo nhiếp ảnh và tin tức mới nhất' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between px-5 py-4 border-b border-slate-50 last:border-0">
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
              <Toggle enabled={settings[item.key]} onToggle={() => toggle(item.key)} />
            </div>
          ))}
        </motion.section>

        {/* Privacy Settings */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            <h2 className="font-bold text-slate-800 text-sm">Quyền riêng tư</h2>
          </div>

          {[
            { key: 'public_profile' as const, label: 'Hồ sơ công khai', desc: 'Nhiếp ảnh gia có thể xem tên và avatar của bạn' },
            { key: 'share_location' as const, label: 'Chia sẻ vị trí GPS', desc: 'Cho phép tìm nhiếp ảnh gia gần bạn chính xác hơn' },
            { key: 'marketing_consent' as const, label: 'Đồng ý nhận marketing', desc: 'Theo Nghị định 13/2023/NĐ-CP và LBVDLCT 2025' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between px-5 py-4 border-b border-slate-50 last:border-0">
              <div>
                <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
              </div>
              <Toggle enabled={settings[item.key]} onToggle={() => toggle(item.key)} />
            </div>
          ))}
        </motion.section>

        {/* Appearance */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <h2 className="font-bold text-slate-800 text-sm">Giao diện</h2>
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              {settings.dark_mode ? <Moon className="w-5 h-5 text-violet-500" /> : <Sun className="w-5 h-5 text-amber-500" />}
              <div>
                <p className="text-sm font-semibold text-slate-800">Chế độ tối</p>
                <p className="text-xs text-slate-400">Dễ nhìn hơn trong điều kiện ánh sáng yếu</p>
              </div>
            </div>
            <Toggle enabled={settings.dark_mode} onToggle={() => { toggle('dark_mode'); toast.info('Chế độ tối đang phát triển') }} />
          </div>
        </motion.section>

        {/* Account Actions */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-500" />
            <h2 className="font-bold text-slate-800 text-sm">Tài khoản</h2>
          </div>

          {[
            { label: 'Chính sách bảo mật', href: '/privacy' },
            { label: 'Điều khoản dịch vụ', href: '/terms' },
            { label: 'Quy chế sàn giao dịch', href: '/marketplace-rules' },
            { label: 'Yêu cầu truy cập dữ liệu', onClick: () => toast.info('Gửi yêu cầu DSAR qua email: privacy@flashy.vn') },
          ].map((item, i) => (
            <div key={i} className="border-b border-slate-50 last:border-0">
              <a
                href={item.href || '#'}
                onClick={e => { if (item.onClick) { e.preventDefault(); item.onClick() } }}
                className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <p className="text-sm font-medium text-slate-700">{item.label}</p>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            </div>
          ))}
        </motion.section>

        {/* Danger Zone */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-red-50 rounded-2xl border border-red-200 p-5"
        >
          <h2 className="font-bold text-red-700 text-sm flex items-center gap-2 mb-3">
            <Trash2 className="w-4 h-4" />
            Vùng nguy hiểm
          </h2>
          <p className="text-xs text-red-600 mb-4">
            Xóa tài khoản sẽ xóa toàn bộ dữ liệu cá nhân của bạn. Hành động này không thể hoàn tác.
            Theo Luật BVDLCT 2025, bạn có quyền yêu cầu xóa dữ liệu trong vòng 72 giờ.
          </p>
          <Button
            variant="destructive"
            size="sm"
            className="bg-red-600 hover:bg-red-700"
            onClick={() => toast.error('Yêu cầu xóa tài khoản đã được ghi nhận. Vui lòng xác nhận qua email trong 24 giờ.')}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Yêu cầu xóa tài khoản
          </Button>
        </motion.section>

      </div>
    </div>
  )
}
