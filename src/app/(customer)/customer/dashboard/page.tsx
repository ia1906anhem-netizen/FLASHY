'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  MapPin,
  Camera,
  Coins,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Star,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { DEMO_PHOTOGRAPHERS, DEMO_PACKAGES, DEMO_VOUCHERS } from '@/lib/data/mock-data'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const DEFAULT_DEMO_BOOKINGS = [
  {
    id: 'BK-892104',
    photographer: DEMO_PHOTOGRAPHERS[0],
    package_name: 'Vibe Sài Gòn',
    shooting_date: '15/04/2026',
    shooting_time: '15:30',
    location: 'Bến Bạch Đằng & Bưu điện Q.1',
    total_amount: 550000,
    deposit_paid: 165000,
    status: 'CONFIRMED',
    status_label: 'Đã xác nhận • Chờ chụp',
    status_color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'BK-781923',
    photographer: DEMO_PHOTOGRAPHERS[1],
    package_name: 'Quick Date',
    shooting_date: '10/04/2026',
    shooting_time: '09:00',
    location: 'Hồ Con Rùa, Quận 3',
    total_amount: 220000,
    deposit_paid: 66000,
    status: 'PHOTOS_DELIVERED',
    status_label: 'Đã giao ảnh • Đang duyệt 48h',
    status_color: 'bg-violet-50 text-violet-700 border-violet-200',
  }
]

export default function CustomerDashboardPage() {
  const [userName, setUserName] = useState<string>('Khách hàng')
  const [userCoins, setUserCoins] = useState<number>(0)
  const [userTier, setUserTier] = useState<string>('Tân thủ (Rookie)')
  const [activeBookings, setActiveBookings] = useState<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const allCookies = document.cookie
      const matchEmail = allCookies.match(/flashy_email=([^;]+)/)
      const matchName = allCookies.match(/flashy_name=([^;]+)/)
      const matchRole = allCookies.match(/flashy_role=([^;]+)/)

      const email = matchEmail ? decodeURIComponent(matchEmail[1]).trim().toLowerCase() : ''
      const role = matchRole ? matchRole[1].trim() : ''
      let name = matchName ? decodeURIComponent(matchName[1]).trim() : ''

      // Fallback: read from localStorage current user
      if (!name && email) {
        try {
          const stored = localStorage.getItem('flashy_current_user')
          if (stored) {
            const p = JSON.parse(stored)
            if (p.email?.toLowerCase() === email && p.full_name) {
              name = p.full_name
            }
          }
          // Also check registered users store
          if (!name) {
            const regUsers = localStorage.getItem('flashy_registered_users')
            if (regUsers) {
              const users = JSON.parse(regUsers)
              if (users[email]?.full_name) name = users[email].full_name
            }
          }
        } catch {}
      }

      const DEMO_EMAILS = ['customer@flashy.vn', 'cust@flashy.vn', 'photographer@flashy.vn', 'photo@flashy.vn', 'admin@flashy.vn']
      const isDemoUser = !email || DEMO_EMAILS.some(d => email === d || email.includes(d.split('@')[0]))

      if (isDemoUser && (email.includes('cust') || email.includes('customer'))) {
        setUserName(name || 'Nguyễn Thu Trang')
        setUserCoins(280)
        setUserTier('Thành viên Creator')
        setActiveBookings(DEFAULT_DEMO_BOOKINGS)
      } else if (!email) {
        // Not logged in at all
        setUserName('Khách hàng')
        setUserCoins(0)
        setUserTier('Tân thủ (Rookie)')
        setActiveBookings([])
      } else {
        // Real registered user with their own email
        setUserName(name || email.split('@')[0])
        setUserCoins(50) // Welcome bonus coins for new users
        setUserTier('Tân thủ (Rookie)')

        // Load this user's bookings (isolated per email)
        const userKey = `flashy_bookings_${email}`
        const savedBookings = localStorage.getItem(userKey)
        if (savedBookings) {
          const parsed = JSON.parse(savedBookings)
          setActiveBookings(Array.isArray(parsed) ? parsed : [])
        } else {
          setActiveBookings([])
        }
      }
    } catch {
      // Silently fail - show empty state
      setUserName('Khách hàng')
      setUserCoins(0)
      setActiveBookings([])
    } finally {
      setIsLoaded(true)
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Welcome Banner & Loyalty Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Greeting card */}
          <div className="lg:col-span-2 bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-300 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full">
                  {userTier}
                </span>
                <span className="text-xs text-slate-300">TP. Hồ Chí Minh</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black mb-2">
                Xin chào, {userName} ✨
              </h1>
              <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                Bạn đang có <strong className="text-white">{activeBookings.length} buổi chụp</strong> đang diễn ra. Hãy kiểm tra trạng thái và duyệt ảnh trong vòng 48 giờ để nhận tích lũy điểm xu!
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-white/10">
              <Link href="/photographers">
                <Button size="sm" className="bg-white text-slate-950 hover:bg-slate-100 rounded-xl font-bold text-xs shadow-md">
                  <Camera className="w-3.5 h-3.5 mr-1.5" />
                  Đặt lịch chụp mới
                </Button>
              </Link>
              <Link href="/customer/messages">
                <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10 rounded-xl text-xs">
                  <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                  Hộp thư trao đổi
                </Button>
              </Link>
            </div>

            {/* Background design accents */}
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-violet-500/20 to-transparent pointer-events-none" />
          </div>

          {/* Loyalty Coin Widget */}
          <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Flashy Coins</h3>
                    <p className="text-[11px] text-slate-500">Điểm thưởng tích lũy</p>
                  </div>
                </div>
                <Badge variant="warning" className="text-xs font-bold">{userTier}</Badge>
              </div>

              <div className="mb-4">
                <div className="text-3xl font-black text-amber-600 mb-1">
                  {userCoins} <span className="text-xs text-slate-500 font-normal">Xu</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {userCoins >= 500 ? 'Đã đạt hạng Icon cao cấp' : `Cần thêm ${Math.max(0, 500 - userCoins)} Xu nữa để thăng hạng Icon (500+ Xu)`}
                </p>
                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, Math.round((userCoins / 500) * 100))}%` }} />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link href="/customer/loyalty" className="text-violet-600 font-bold hover:underline flex items-center gap-1">
                Lịch sử tích xu
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/customer/vouchers" className="text-amber-700 font-bold hover:underline flex items-center gap-1">
                Đổi voucher ngay
                <Ticket className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>

        {/* Active Bookings Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Lịch Hẹn Chụp Ảnh Của Bạn
              </h2>
              <p className="text-xs text-slate-500">
                Theo dõi tiến độ từ lúc đặt cọc đến khi nhận ảnh và hết hạn duyệt 48h
              </p>
            </div>
            <Link href="/customer/bookings" className="text-xs font-bold text-violet-600 hover:underline flex items-center gap-1">
              Xem tất cả đơn
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-3">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Chưa có lịch hẹn chụp nào</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
                Tài khoản của bạn chưa có lịch chụp nào đang diễn ra. Hãy khám phá các nhiếp ảnh gia tài năng tại TP.HCM và đặt lịch buổi chụp đầu tiên của bạn với bảo hiểm cọc Escrow 48h!
              </p>
              <Link href="/photographers">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl px-5 h-10 shadow-md">
                  Khám phá & Đặt lịch ngay 📸
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeBookings.map((b) => (
                <Card key={b.id} className="rounded-3xl border-slate-200 bg-white hover:shadow-md transition-all overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                          <Image
                            src={b.photographer?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={b.photographer?.display_name || b.photographer_name || 'Photographer'}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400">#{b.id}</span>
                          <h3 className="font-bold text-slate-900 text-sm">{b.photographer?.display_name || b.photographer_name || 'Nhiếp ảnh gia'}</h3>
                          <p className="text-xs text-violet-600 font-semibold">{b.package_name}</p>
                        </div>
                      </div>

                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${b.status_color || 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        {b.status_label || 'Đã xác nhận'}
                      </span>
                    </div>

                    {/* Booking details */}
                    <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl mb-4">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Thời gian: <strong>{b.shooting_time} - {b.shooting_date}</strong>
                      </p>
                      <p className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        Địa điểm: <strong>{b.location}</strong>
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-slate-700">
                        <span>Tổng tiền: <strong>{formatVND(b.total_amount)}</strong></span>
                        <span className="text-emerald-600 font-semibold">Đã cọc Escrow: {formatVND(b.deposit_paid || b.deposit_amount || 0)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link href={`/customer/bookings/${b.id}`} className="w-full">
                        <Button variant="outline" size="sm" className="w-full rounded-xl text-xs font-bold h-9">
                          Chi tiết lịch hẹn
                        </Button>
                      </Link>

                      {b.status === 'PHOTOS_DELIVERED' ? (
                        <Link href={`/customer/bookings/${b.id}/gallery`} className="w-full">
                          <Button size="sm" className="w-full bg-violet-600 hover:bg-violet-700 rounded-xl text-xs font-bold h-9 text-white shadow-sm">
                            <ImageIcon className="w-3.5 h-3.5 mr-1" />
                            Xem & Duyệt ảnh
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/customer/messages`} className="w-full">
                          <Button size="sm" className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold h-9">
                            <MessageCircle className="w-3.5 h-3.5 mr-1" />
                            Nhắn tin với thợ
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Photographers */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Gợi Ý Nhiếp Ảnh Gia Quanh Bạn
              </h2>
              <p className="text-xs text-slate-500">
                Được đánh giá cao bởi các khách hàng tại TP. Hồ Chí Minh
              </p>
            </div>
            <Link href="/photographers" className="text-xs font-bold text-violet-600 hover:underline">
              Khám phá thêm →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DEMO_PHOTOGRAPHERS.slice(0, 4).map((p) => (
              <Card key={p.id} className="rounded-3xl border-slate-200 bg-white overflow-hidden hover:shadow-lg transition-all group">
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  <Image
                    src={p.portfolio_photos?.[0] || p.cover_image_url || '/hero-bg.jpg'}
                    alt={p.display_name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {p.average_rating}
                  </div>
                </div>

                <CardContent className="p-4">
                  <h4 className="font-bold text-slate-900 text-sm truncate mb-0.5">{p.display_name}</h4>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {p.district}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="font-black text-violet-700 text-xs">{formatVND(p.starting_price || 79000)}</span>
                    <Link href={`/book/${p.id}`}>
                      <Button size="sm" className="h-7 px-3 bg-brand text-white rounded-lg text-[11px] font-bold">
                        Đặt lịch
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
