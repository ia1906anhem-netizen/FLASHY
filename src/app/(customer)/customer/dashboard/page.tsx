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
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getStoredBookings, getApprovedProviders, type ApprovedProvider } from '@/lib/data/booking-store'

function safeDecode(val?: string | null): string {
  if (!val) return ''
  let current = val
  try {
    while (current.includes('%')) {
      const decoded = decodeURIComponent(current)
      if (decoded === current) break
      current = decoded
    }
    return current
  } catch {
    return current
  }
}

export default function CustomerDashboardPage() {
  const [userName, setUserName] = useState<string>('Khách hàng')
  const [userCoins, setUserCoins] = useState<number>(0)
  const [userTier, setUserTier] = useState<string>('Tân thủ (Rookie)')
  const [activeBookings, setActiveBookings] = useState<any[]>([])
  const [recommendedPhotographers, setRecommendedPhotographers] = useState<ApprovedProvider[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const loadData = () => {
    try {
      const allCookies = document.cookie
      const matchEmail = allCookies.match(/flashy_email=([^;]+)/)
      const matchName = allCookies.match(/flashy_name=([^;]+)/)

      const email = matchEmail ? safeDecode(matchEmail[1]).trim().toLowerCase() : ''
      let name = matchName ? safeDecode(matchName[1]).trim() : ''

      if (!name && email) {
        try {
          const stored = localStorage.getItem('flashy_current_user')
          if (stored) {
            const p = JSON.parse(stored)
            if (p.full_name) name = safeDecode(p.full_name)
          }
        } catch {}
      }

      setUserName(safeDecode(name || (email ? email.split('@')[0] : 'Khách hàng')))

      // Real user coins from localStorage
      const coinsStored = Number(localStorage.getItem('flashy_user_coins') || '0')
      setUserCoins(coinsStored)
      setUserTier(
        coinsStored >= 500
          ? 'Thành viên Icon (VIP)'
          : coinsStored >= 200
          ? 'Thành viên Creator'
          : 'Tân thủ (Rookie)'
      )

      // Real stored bookings (empty on a clean site)
      const storedBookings = getStoredBookings()
      setActiveBookings(storedBookings)

      // Real approved providers from store (no mock data)
      const providers = getApprovedProviders()
      setRecommendedPhotographers(providers)
    } catch {
      setUserName('Khách hàng')
      setUserCoins(0)
      setActiveBookings([])
      setRecommendedPhotographers([])
    } finally {
      setIsLoaded(true)
    }
  }

  useEffect(() => {
    loadData()
    const handleUpdate = () => loadData()
    window.addEventListener('flashy_bookings_updated', handleUpdate)
    window.addEventListener('flashy_coins_updated', handleUpdate)
    window.addEventListener('flashy_providers_updated', handleUpdate)
    return () => {
      window.removeEventListener('flashy_bookings_updated', handleUpdate)
      window.removeEventListener('flashy_coins_updated', handleUpdate)
      window.removeEventListener('flashy_providers_updated', handleUpdate)
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Welcome Banner & Loyalty Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-stretch w-full">
          
          {/* Greeting card - takes 2 cols on lg, 1 col on mobile/tablet */}
          <div className="col-span-1 lg:col-span-2 w-full min-w-0 bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg flex flex-col justify-between">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-300 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full">
                  {userTier}
                </span>
                <span className="text-xs text-slate-300">TP. Hồ Chí Minh</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black mb-2 break-words">
                Xin chào, {safeDecode(userName)} ✨
              </h1>
              <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                Bạn đang có <strong className="text-white">{activeBookings.length} buổi chụp</strong> đang diễn ra. Hãy kiểm tra trạng thái và duyệt ảnh trong vòng 48 giờ để nhận tích lũy điểm xu!
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-white/10">
              <Link href="/photographers" className="inline-flex">
                <Button
                  size="sm"
                  className="h-9 px-4 bg-white text-slate-900 hover:bg-violet-50 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 inline-flex items-center"
                >
                  <Camera className="w-4 h-4 mr-1.5 text-violet-700" />
                  Đặt lịch chụp mới
                </Button>
              </Link>
              <Link href="/customer/messages" className="inline-flex">
                <Button
                  size="sm"
                  className="h-9 px-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold text-xs backdrop-blur-md shadow-sm transition-all active:scale-95 inline-flex items-center"
                >
                  <MessageCircle className="w-4 h-4 mr-1.5 text-violet-200" />
                  Hộp thư trao đổi
                </Button>
              </Link>
            </div>

            {/* Background design accents */}
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-violet-500/20 to-transparent pointer-events-none" />
          </div>

          {/* Loyalty Coin Widget - takes 1 col on lg, 1 col on mobile/tablet */}
          <div className="col-span-1 lg:col-span-1 w-full min-w-0 flex flex-col">
            <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between h-full w-full">
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
                    {userCoins >= 500
                      ? '🏆 Bạn đã đạt cấp độ cao nhất: Icon!'
                      : userCoins >= 200
                        ? `Cần thêm ${500 - userCoins} Xu nữa để thăng hạng Icon (500 Coins)`
                        : `Cần thêm ${200 - userCoins} Xu nữa để thăng hạng Creator (200 Coins)`}
                  </p>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${
                          userCoins >= 500
                            ? 100
                            : userCoins >= 200
                              ? Math.round(((userCoins - 200) / 300) * 100)
                              : Math.round((userCoins / 200) * 100)
                        }%`,
                      }}
                    />
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

          {recommendedPhotographers.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-200 text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-2.5">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">Chưa có nhiếp ảnh gia</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Hiện chưa có nhiếp ảnh gia nào được duyệt tại khu vực này. Danh sách sẽ tự động hiển thị ngay khi thợ chụp ảnh được phê duyệt KYC.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {recommendedPhotographers.slice(0, 4).map((p) => (
                <Card key={p.id} className="rounded-3xl border-slate-200 bg-white overflow-hidden hover:shadow-lg transition-all group">
                  <div className="relative h-40 bg-slate-100 overflow-hidden">
                    <Image
                      src={p.cover || '/hero-bg.jpg'}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {p.rating}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h4 className="font-bold text-slate-900 text-sm truncate mb-0.5">{p.name}</h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {p.district || p.location}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="font-black text-violet-700 text-xs">{formatVND(p.starting_price || 350000)}</span>
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
          )}
        </div>

      </div>
    </div>
  )
}
