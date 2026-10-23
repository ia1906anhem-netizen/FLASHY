'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  Clock,
  MapPin,
  Camera,
  Coins,
  ChevronRight,
  ShieldCheck,
  Star,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Filter,
  RefreshCw,
  RotateCcw,
  Heart,
  CloudDownload,
  Download,
  X,
  ExternalLink,
  Check
} from 'lucide-react'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  getStoredBookings,
  PersistentBooking,
  getFavoritePhotographers,
  toggleFavoritePhotographer,
} from '@/lib/data/booking-store'
import { BookingModal } from '@/components/packages/booking-modal'

export default function CustomerBookingsPage() {
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'review' | 'completed'>('all')
  const [bookings, setBookings] = useState<PersistentBooking[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Re-book Modal State
  const [isRebookModalOpen, setIsRebookModalOpen] = useState(false)
  const [rebookPhotographer, setRebookPhotographer] = useState<{
    id: string
    display_name: string
    avatar_url?: string
    slug?: string
    is_top_rated?: boolean
  } | null>(null)

  // Cloud Photo Vault Modal State
  const [vaultBooking, setVaultBooking] = useState<PersistentBooking | null>(null)
  const [isDownloadingZip, setIsDownloadingZip] = useState(false)
  const [downloadSuccessNote, setDownloadSuccessNote] = useState<string | null>(null)

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const loadData = () => {
    const list = getStoredBookings()
    setBookings(list)
    setFavorites(getFavoritePhotographers())
    setIsLoaded(true)
  }

  useEffect(() => {
    loadData()
    const handleUpdate = () => loadData()
    const handleFavUpdate = () => setFavorites(getFavoritePhotographers())

    window.addEventListener('flashy_bookings_updated', handleUpdate)
    window.addEventListener('flashy_favorites_updated', handleFavUpdate)

    return () => {
      window.removeEventListener('flashy_bookings_updated', handleUpdate)
      window.removeEventListener('flashy_favorites_updated', handleFavUpdate)
    }
  }, [])

  // Handle Re-book click
  const handleOpenRebook = (b: PersistentBooking) => {
    setRebookPhotographer({
      id: b.photographer_id,
      display_name: b.photographer_name,
      avatar_url: b.photographer_avatar,
      slug: b.photographer_slug,
      is_top_rated: b.is_top_rated,
    })
    setIsRebookModalOpen(true)
  }

  // Handle Favorite toggle
  const handleToggleFav = (photographerId: string, photographerName: string) => {
    const isNowFav = toggleFavoritePhotographer(photographerId)
    setFavorites(getFavoritePhotographers())
    if (isNowFav) {
      showToast(`❤️ Đã thêm "${photographerName}" vào danh sách Nhiếp ảnh gia Yêu thích!`)
    } else {
      showToast(`Đã bỏ "${photographerName}" khỏi danh sách Yêu thích.`)
    }
  }

  // Handle Download All HD ZIP in Vault
  const handleDownloadAllZip = () => {
    setIsDownloadingZip(true)
    setTimeout(() => {
      setIsDownloadingZip(false)
      setDownloadSuccessNote('Đã bắt đầu tải file ZIP chứa trọn bộ ảnh gốc chất lượng cao HD 4K!')
      setTimeout(() => setDownloadSuccessNote(null), 4000)
    }, 1200)
  }

  const filtered = bookings.filter((b) => {
    if (filterTab === 'active') {
      return ['CONFIRMED', 'PHOTOGRAPHER_ARRIVED', 'SHOOTING', 'EDITING'].includes(b.status)
    }
    if (filterTab === 'review') {
      return b.status === 'PHOTOS_DELIVERED'
    }
    if (filterTab === 'completed') {
      return ['ACCEPTED', 'COMPLETED'].includes(b.status)
    }
    return true
  })

  const activeCount = bookings.filter((b) =>
    ['CONFIRMED', 'PHOTOGRAPHER_ARRIVED', 'SHOOTING', 'EDITING'].includes(b.status)
  ).length
  const reviewCount = bookings.filter((b) => b.status === 'PHOTOS_DELIVERED').length
  const completedCount = bookings.filter((b) => ['ACCEPTED', 'COMPLETED'].includes(b.status)).length

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Lịch Sử Đơn Hàng & Kho Ảnh
              </h1>
              <Badge className="bg-violet-100 text-violet-800 border-violet-200 font-bold">
                Anti-Circumvention
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Quản lý các buổi chụp, đặt lại thợ quen với ưu đãi giảm phí sàn 10% và truy cập Kho ảnh Cloud vĩnh viễn
            </p>
          </div>

          <Link href="/photographers">
            <Button size="sm" className="bg-brand text-white rounded-xl font-bold text-xs h-10 shadow-md">
              <Camera className="w-3.5 h-3.5 mr-1.5" />
              Đặt lịch buổi chụp mới
            </Button>
          </Link>
        </div>

        {/* Anti-Circumvention Loyalty Value Proposition Banner */}
        <div className="p-4 mb-6 rounded-3xl bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm flex items-center gap-2">
                Đặc quyền Đặt Lại Nhiếp Ảnh Gia Cũ Qua FLASHY
                <span className="text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                  Ưu đãi 2 chiều
                </span>
              </h4>
              <p className="text-xs text-violet-200 mt-0.5 leading-relaxed">
                Khi đặt lại thợ qua app: Thợ được <strong>giảm phí sàn từ 15% xuống 10%</strong> (hoặc 8% cho Top Rated), bạn được bảo vệ cọc qua <strong>Escrow 48h</strong> và lưu trữ <strong>Kho Ảnh Cloud HD trọn đời</strong>!
              </p>
            </div>
          </div>
          <Link href="/customer/loyalty">
            <Button size="sm" variant="outline" className="text-violet-900 bg-white hover:bg-violet-50 font-bold text-xs rounded-xl h-9 whitespace-nowrap self-start md:self-auto">
              Xem chính sách & Xu
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {[
            { id: 'all', label: `Tất cả đơn (${bookings.length})` },
            { id: 'active', label: `Sắp diễn ra (${activeCount})` },
            { id: 'review', label: `Chờ duyệt ảnh 48h (${reviewCount})` },
            { id: 'completed', label: `Đã hoàn tất (${completedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterTab === tab.id
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {isLoaded && filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 md:p-14 border border-slate-200 text-center shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1.5">
              {filterTab === 'all'
                ? 'Bạn chưa có lịch hẹn chụp ảnh nào'
                : 'Không có buổi chụp trong mục này'}
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed max-w-sm mx-auto">
              {filterTab === 'all'
                ? 'Hãy tìm kiếm những thợ ảnh tài năng tại TP.HCM, chọn phong cách yêu thích và đặt lịch trải nghiệm ngay hôm nay!'
                : 'Hiện tại bạn không có lịch hẹn nào thuộc trạng thái này.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <Link href="/photographers">
                <Button className="bg-brand text-white hover:opacity-90 rounded-xl font-bold text-xs h-11 px-6 shadow-md">
                  <Camera className="w-4 h-4 mr-2" />
                  Khám phá thợ ảnh & Đặt lịch ngay
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Bookings List */
          <div className="space-y-4">
            {filtered.map((b) => {
              const isFav = favorites.includes(b.photographer_id)
              const isCompleted = ['ACCEPTED', 'COMPLETED'].includes(b.status)
              const hasCloudVault = isCompleted || b.status === 'PHOTOS_DELIVERED' || (b.cloud_photos && b.cloud_photos.length > 0)

              return (
                <Card
                  key={b.id}
                  className="rounded-3xl border-slate-200 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <CardContent className="p-6">
                    {/* Top Row: Photographer Info & Badges */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                          <Image
                            src={
                              b.photographer_avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                            }
                            alt={b.photographer_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-sm">{b.photographer_name}</h3>
                            {b.is_top_rated && (
                              <Badge className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0 border-amber-300">
                                ⭐ Top Rated
                              </Badge>
                            )}
                            <span className="font-mono text-[10px] text-slate-400">#{b.booking_number}</span>
                          </div>
                          <p className="text-xs text-violet-700 font-semibold mt-0.5">Gói {b.package_name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {b.is_rebook && (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 flex items-center gap-1">
                            <RotateCcw className="w-3 h-3" />
                            Đơn đặt lại (Khách cũ)
                          </span>
                        )}
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${b.status_color}`}>
                          {b.status_label}
                        </span>
                      </div>
                    </div>

                    {/* Middle Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span>
                          {b.shooting_time} • {b.shooting_date}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{b.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span>
                          Tổng: {formatVND(b.total_amount)}
                          {b.discount_amount ? (
                            <span className="text-emerald-600 font-bold ml-1">
                              (Đã giảm {formatVND(b.discount_amount)})
                            </span>
                          ) : (
                            ` (Cọc: ${formatVND(b.deposit_amount)})`
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Selected Addons preview */}
                    {b.selected_addons && b.selected_addons.length > 0 && (
                      <div className="pb-3 text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-700">Dịch vụ thêm:</span>
                        {b.selected_addons.map((ad) => (
                          <span key={ad.id} className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 font-medium">
                            {ad.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 48-Hour Review Alert Box if delivered */}
                    {b.status === 'PHOTOS_DELIVERED' && (
                      <div className="p-3.5 mb-4 rounded-2xl bg-violet-50 border border-violet-200 text-violet-900 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-violet-600 flex-shrink-0" />
                          <span>Ảnh đã sẵn sàng! Đang trong thời hạn kiểm duyệt 48 giờ để nhận xét hoặc chọn retouch.</span>
                        </div>
                        <Link href={`/customer/bookings/${b.id}/gallery`}>
                          <Button size="sm" className="bg-violet-600 text-white rounded-xl text-xs font-bold h-8">
                            Duyệt ảnh
                          </Button>
                        </Link>
                      </div>
                    )}

                    {/* Completed order review note */}
                    {b.review && (
                      <div className="p-3 mb-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex text-amber-500">
                            {Array.from({ length: b.review.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-current" />
                            ))}
                          </div>
                          <span className="italic">"{b.review.comment}"</span>
                        </div>
                        <span className="text-[10px] text-amber-700 font-bold">Đã đánh giá</span>
                      </div>
                    )}

                    {/* Bottom Action Bar: ANTI-CIRCUMVENTION BUTTONS */}
                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      {/* Left: Escrow Protection or Favorite Button */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleFav(b.photographer_id, b.photographer_name)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            isFav
                              ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-2xs'
                              : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                          }`}
                          title={isFav ? 'Bỏ yêu thích' : 'Thêm vào danh sách yêu thích'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                          <span>{isFav ? 'Đã yêu thích' : 'Thêm vào Yêu thích'}</span>
                        </button>

                        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Bảo vệ Escrow</span>
                        </div>
                      </div>

                      {/* Right: Re-book, Cloud Vault, Chat, Details */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* 1. Nút "Kho Ảnh Cloud" */}
                        {hasCloudVault && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setVaultBooking(b)}
                            className="rounded-xl text-xs font-bold h-9 bg-violet-50/60 hover:bg-violet-100/70 border-violet-200 text-violet-800"
                          >
                            <CloudDownload className="w-3.5 h-3.5 mr-1 text-violet-600" />
                            Kho Ảnh Cloud
                          </Button>
                        )}

                        {/* 2. Nút "Đặt lại nhiếp ảnh gia này" (Re-book) cho các đơn hoàn thành hoặc đã giao */}
                        {isCompleted && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenRebook(b)}
                            className="bg-brand text-white hover:opacity-90 rounded-xl text-xs font-bold h-9 shadow-md flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Đặt lại thợ này
                          </Button>
                        )}

                        <Link href={`/customer/messages?photographer=${b.photographer_id}&bookingId=${b.id}`}>
                          <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold h-9">
                            <MessageCircle className="w-3.5 h-3.5 mr-1" />
                            Chat
                          </Button>
                        </Link>

                        {b.status === 'PHOTOS_DELIVERED' ? (
                          <Link href={`/customer/bookings/${b.id}/gallery`}>
                            <Button size="sm" className="bg-violet-600 text-white rounded-xl text-xs font-bold h-9 shadow-sm">
                              <ImageIcon className="w-3.5 h-3.5 mr-1" />
                              Xem & Tải ảnh
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/customer/bookings/${b.id}`}>
                            <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold h-9">
                              Chi tiết
                              <ChevronRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* RE-BOOK MODAL */}
      {rebookPhotographer && (
        <BookingModal
          isOpen={isRebookModalOpen}
          onClose={() => {
            setIsRebookModalOpen(false)
            setRebookPhotographer(null)
          }}
          photographer={rebookPhotographer}
          isRebook={true}
        />
      )}

      {/* KHO ẢNH CLOUD MODAL (Cloud Photo Vault & HD Download) */}
      {vaultBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setVaultBooking(null)}
          />

          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setVaultBooking(null)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Vault Header */}
              <div className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-violet-900 to-indigo-900 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CloudDownload className="w-3 h-3 text-amber-300" />
                    FLASHY Cloud Vault
                  </span>
                  <span className="text-white/60">•</span>
                  <span className="text-xs text-violet-200 font-mono">Đơn #{vaultBooking.booking_number}</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight">
                  Kho Ảnh Cloud Gốc Chất Lượng Cao HD
                </h2>
                <p className="text-xs text-violet-200 mt-1">
                  Buổi chụp ngày {vaultBooking.shooting_date} cùng Nhiếp ảnh gia {vaultBooking.photographer_name}
                </p>
              </div>

              {/* Vault Body */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Cloud Assurance Banner */}
                <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-violet-900">Bảo lưu ảnh vĩnh viễn trên FLASHY Cloud</p>
                      <p className="text-[11px] text-violet-700">
                        File ảnh gốc nguyên bản RAW &amp; ColorGraded HD không bị nén, sẵn sàng tải lại bất kỳ lúc nào.
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={handleDownloadAllZip}
                    disabled={isDownloadingZip}
                    className="bg-brand text-white font-bold text-xs rounded-xl h-10 px-5 shadow-sm whitespace-nowrap self-start sm:self-auto"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    {isDownloadingZip ? 'Đang chuẩn bị file...' : 'Tải trọn bộ HD (ZIP)'}
                  </Button>
                </div>

                {downloadSuccessNote && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{downloadSuccessNote}</span>
                  </div>
                )}

                {/* Photo Grid Preview */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Danh sách file ảnh trong Kho Cloud ({vaultBooking.cloud_photos?.length || 5} file HD)
                    </h3>
                    <Link
                      href={`/customer/bookings/${vaultBooking.id}/gallery`}
                      className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1"
                    >
                      Mở giao diện duyệt ảnh chi tiết
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {(vaultBooking.cloud_photos && vaultBooking.cloud_photos.length > 0
                      ? vaultBooking.cloud_photos
                      : [
                          { id: 'hd-1', name: 'IMG_4812_HD_Original.jpg', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1600&q=95', size: '12.4 MB', category: 'edited' },
                          { id: 'hd-2', name: 'IMG_4815_HD_ColorGraded.jpg', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1600&q=95', size: '14.1 MB', category: 'edited' },
                          { id: 'hd-3', name: 'IMG_4820_HD_Retouched.jpg', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=1600&q=95', size: '11.8 MB', category: 'retouched' },
                          { id: 'hd-4', name: 'IMG_4825_RAW_Master.cr3', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1600&q=95', size: '28.9 MB', category: 'original' },
                          { id: 'hd-5', name: 'IMG_4830_Retouch_Face.jpg', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1600&q=95', size: '15.2 MB', category: 'retouched' },
                        ]
                    ).map((photo) => (
                      <div
                        key={photo.id}
                        className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 group hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="relative aspect-4/3 overflow-hidden bg-slate-200">
                          <Image
                            src={photo.url}
                            alt={photo.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                            {photo.category === 'retouched' ? '✨ Retouched HD' : photo.category === 'original' ? 'RAW 4K' : 'Color Graded'}
                          </span>
                        </div>
                        <div className="p-3 bg-white space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-mono text-slate-700 truncate max-w-[140px] font-medium" title={photo.name}>
                              {photo.name}
                            </span>
                            <span className="text-slate-400 font-semibold">{photo.size}</span>
                          </div>
                          <a
                            href={photo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={photo.name}
                            className="block"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full h-8 text-[11px] font-bold rounded-xl border-slate-200 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-300"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Tải ảnh HD ({photo.size})
                            </Button>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vault Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Kho ảnh được mã hóa và bảo mật bởi FLASHY Cloud Storage
                </span>
                <Button
                  size="sm"
                  onClick={() => setVaultBooking(null)}
                  className="bg-slate-900 text-white rounded-xl text-xs font-bold h-9 px-5"
                >
                  Đóng Kho Ảnh
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
