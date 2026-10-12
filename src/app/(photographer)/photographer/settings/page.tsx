'use client'

import { useState } from 'react'
import {
  Settings,
  Bell,
  Lock,
  CreditCard,
  Calendar,
  Shield,
  Smartphone,
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PhotographerSettingsPage() {
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Notification toggles
  const [notifyNewBooking, setNotifyNewBooking] = useState(true)
  const [notifyMessages, setNotifyMessages] = useState(true)
  const [notifyPayouts, setNotifyPayouts] = useState(true)
  const [notifyMarketing, setNotifyMarketing] = useState(false)

  // Working preferences
  const [autoAcceptBooking, setAutoAcceptBooking] = useState(false)
  const [maxBookingsPerDay, setMaxBookingsPerDay] = useState('2')
  const [minLeadTimeHours, setMinLeadTimeHours] = useState('12')

  // Bank payout info
  const [bankName, setBankName] = useState('Vietcombank')
  const [accountNumber, setAccountNumber] = useState('1029384756')
  const [accountHolder, setAccountHolder] = useState('TRAN MINH TRI')

  const handleSave = () => {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cài đặt tài khoản nhiếp ảnh gia</h1>
          <p className="text-slate-500 text-sm mt-1">
            Thiết lập lịch làm việc, thông báo đơn chụp và tài khoản nhận thanh toán
          </p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-violet-600 hover:bg-violet-700 text-white gap-2 shadow-sm"
        >
          <Save className="h-4 w-4" />
          Lưu tất cả cài đặt
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>Cài đặt của bạn đã được lưu thành công trên hệ thống Flashy!</span>
        </div>
      )}

      {/* Booking Preferences */}
      <Card className="border-slate-200">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-violet-600" />
            <h2 className="text-base font-semibold text-slate-900">Quy tắc nhận lịch & Ca chụp</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-900">Tự động nhận lịch (Instant Booking)</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tự động xác nhận đơn khi khách đặt lịch vào khung giờ trống mà không cần duyệt thủ công.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAcceptBooking}
                  onChange={(e) => setAutoAcceptBooking(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Số ca chụp tối đa mỗi ngày
                </label>
                <select
                  value={maxBookingsPerDay}
                  onChange={(e) => setMaxBookingsPerDay(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                >
                  <option value="1">1 ca / ngày (Tập trung chất lượng)</option>
                  <option value="2">2 ca / ngày (Sáng và Chiều)</option>
                  <option value="3">3 ca / ngày (Năng động)</option>
                  <option value="4">4 ca / ngày</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Khoảng cách báo trước tối thiểu (Lead time)
                </label>
                <select
                  value={minLeadTimeHours}
                  onChange={(e) => setMinLeadTimeHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                >
                  <option value="4">4 tiếng trước giờ chụp</option>
                  <option value="12">12 tiếng trước giờ chụp</option>
                  <option value="24">24 tiếng trước giờ chụp (Khuyên dùng)</option>
                  <option value="48">48 tiếng trước giờ chụp</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payout Bank Account */}
      <Card className="border-slate-200">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              <h2 className="text-base font-semibold text-slate-900">Tài khoản ngân hàng nhận nhuận bút</h2>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
              Đã xác thực tên chủ tài khoản
            </Badge>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Ngân hàng thụ hưởng</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value="Vietcombank">Vietcombank (VCB)</option>
                <option value="Techcombank">Techcombank (TCB)</option>
                <option value="MBBank">MB Bank (Quân đội)</option>
                <option value="ACB">ACB (Á Châu)</option>
                <option value="VPBank">VPBank</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Số tài khoản</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Tên chủ thẻ (In hoa không dấu)</label>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm font-mono uppercase bg-slate-100"
                readOnly
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            * Tên chủ tài khoản ngân hàng phải trùng khớp với tên trên CCCD/Hộ chiếu trong hồ sơ xác thực KYC để bảo vệ an toàn dòng tiền.
          </p>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border-slate-200">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-semibold text-slate-900">Thông báo & Tin nhắn</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                title: 'Yêu cầu đặt lịch mới',
                desc: 'Nhận thông báo chuông và đẩy ngay khi có khách gửi yêu cầu chụp ảnh',
                checked: notifyNewBooking,
                setter: setNotifyNewBooking,
              },
              {
                title: 'Tin nhắn trò chuyện từ khách',
                desc: 'Thông báo tin nhắn trao đổi concept và điểm hẹn',
                checked: notifyMessages,
                setter: setNotifyMessages,
              },
              {
                title: 'Tiền giải ngân Escrow & Rút tiền',
                desc: 'Cập nhật biến động số dư và thông báo tiền về tài khoản ngân hàng',
                checked: notifyPayouts,
                setter: setNotifyPayouts,
              },
              {
                title: 'Chương trình khuyến mãi & Thưởng thợ',
                desc: 'Thông báo về chiến dịch flash deal, hoàn phí sàn và sự kiện cộng đồng',
                checked: notifyMarketing,
                setter: setNotifyMarketing,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => item.setter(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
