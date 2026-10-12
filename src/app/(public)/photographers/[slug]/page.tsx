'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  MapPin,
  Star,
  ShieldCheck,
  Zap,
  Camera,
  Calendar,
  Clock,
  Sparkles,
  Award,
  CheckCircle2,
  Share2,
  Heart,
  ChevronRight,
  MessageCircle,
  FileCheck,
  AlertCircle
} from 'lucide-react'
import { DEMO_PHOTOGRAPHERS, DEMO_PACKAGES, DEMO_REVIEWS } from '@/lib/data/mock-data'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PhotographerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string

  const photographer = DEMO_PHOTOGRAPHERS.find(p => p.slug === slug) || DEMO_PHOTOGRAPHERS[0]
  const [activeTab, setActiveTab] = useState<'packages' | 'portfolio' | 'reviews'>('packages')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState<boolean>(false)

  // Filter reviews for this photographer or use demo reviews
  const reviews = DEMO_REVIEWS.filter(r => r.photographer_id === photographer.id || true)

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Cover Banner */}
      <div className="relative h-64 md:h-80 w-full bg-slate-900 overflow-hidden">
        <Image
          src={photographer.banner_url || photographer.cover_image_url || '/hero-bg.jpg'}
          alt={photographer.display_name}
          fill
          priority
          className="object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
        
        {/* Top actions */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-rose-600 flex items-center justify-center transition-colors"
          >
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-600 text-rose-600' : ''}`} />
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: photographer.display_name, url: window.location.href })
              }
            }}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-slate-900 flex items-center justify-center transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Profile Header Info Card */}
      <div className="container mx-auto px-4 max-w-6xl -mt-20 relative z-10 mb-8">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Avatar & Main Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl ring-4 ring-white shadow-xl overflow-hidden bg-slate-100 flex-shrink-0">
                <Image
                  src={photographer.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                  alt={photographer.display_name}
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900">
                    {photographer.display_name}
                  </h1>
                  {photographer.is_verified && (
                    <Badge variant="verified" className="gap-1 px-2.5 py-0.5 text-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Đã xác minh KYC
                    </Badge>
                  )}
                  {photographer.is_sponsored && (
                    <Badge variant="warning" className="gap-1 px-2.5 py-0.5 text-xs">
                      <Sparkles className="w-3 h-3" />
                      Nổi bật
                    </Badge>
                  )}
                </div>

                <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mb-2.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {photographer.address}
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-600 font-semibold">Phục vụ bán kính {photographer.service_radius_km}km</span>
                </p>

                {/* Rating & Stats row */}
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2.5 py-1 rounded-lg">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm">{photographer.average_rating?.toFixed(2)}</span>
                    <span className="text-slate-500 font-normal">({photographer.review_count} đánh giá)</span>
                  </div>
                  <div className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-lg">
                    {photographer.completed_orders_count} buổi chụp hoàn tất
                  </div>
                  {photographer.is_ready_to_work && (
                    <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 font-semibold px-2.5 py-1 rounded-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Nhận lịch ngay hôm nay
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Booking CTA Card on Right */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 md:min-w-[220px]">
              <Link href={`/book/${photographer.id}`} className="w-full">
                <Button className="w-full h-12 bg-brand hover:opacity-90 rounded-2xl text-base font-bold shadow-lg shadow-violet-500/25">
                  Đặt lịch ngay
                </Button>
              </Link>
              <Link href={`/customer/messages`} className="w-full">
                <Button variant="outline" className="w-full h-11 rounded-2xl font-semibold text-sm border-slate-300">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Nhắn tin trao đổi
                </Button>
              </Link>
            </div>
          </div>

          {/* Specialties and Bio */}
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Giới thiệu</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {photographer.bio}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Thể loại chuyên chụp</h3>
                <div className="flex flex-wrap gap-1.5">
                  {photographer.specialties?.map((s, i) => (
                    <span key={i} className="bg-violet-50 text-violet-700 font-semibold text-xs px-3 py-1 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Thiết bị & Cam kết</h3>
              <div className="space-y-1.5 text-slate-600">
                <p className="font-semibold text-slate-800">📸 Thiết bị sử dụng:</p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                  {photographer.equipment?.map((eq, i) => (
                    <li key={i}>{eq}</li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t border-slate-200/60 text-slate-600 space-y-1">
                <p className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đúng hẹn, trả file đúng hạn
                </p>
                <p className="flex items-center gap-1.5 text-violet-600 font-semibold">
                  <FileCheck className="w-3.5 h-3.5" />
                  Giữ tiền Escrow an toàn 48h
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="container mx-auto px-4 max-w-6xl mb-6">
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('packages')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'packages'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Gói dịch vụ & Báo giá ({DEMO_PACKAGES.length})
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'portfolio'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Album ảnh Portfolio ({photographer.portfolio_photos?.length || 4})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'reviews'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Đánh giá từ khách ({photographer.review_count})
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="container mx-auto px-4 max-w-6xl">
        {/* 1. PACKAGES TAB */}
        {activeTab === 'packages' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DEMO_PACKAGES.map((pkg) => (
              <Card key={pkg.id} className="rounded-2xl border-slate-200 hover:border-violet-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-2.5 py-0.5 rounded-full">
                        {pkg.category}
                      </span>
                      <h3 className="text-xl font-black text-slate-900 mt-1">{pkg.name}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-violet-700">
                        {formatVND(pkg.base_price)}
                      </span>
                      <p className="text-[11px] text-slate-400 font-medium">/ buổi chụp</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                    {pkg.description}
                  </p>

                  <div className="space-y-2.5 py-3 border-y border-slate-100 text-xs text-slate-700 mb-5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-4 h-4 text-slate-400" />
                        Thời gian chụp:
                      </span>
                      <span className="font-bold">{pkg.duration_minutes} phút</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-500">
                        <Camera className="w-4 h-4 text-slate-400" />
                        File gốc & File màu:
                      </span>
                      <span className="font-bold">
                        {pkg.original_photos} gốc / {pkg.edited_photos} chỉnh màu
                      </span>
                    </div>
                    {pkg.retouch_quota > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-slate-500">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          Retouch chuyên sâu:
                        </span>
                        <span className="font-bold text-amber-600">{pkg.retouch_quota} ảnh</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        Hạn bàn giao ảnh:
                      </span>
                      <span className="font-bold text-emerald-600">{pkg.delivery_days} ngày</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link href={`/book/${photographer.id}?pkg=${pkg.id}`} className="block">
                      <Button className="w-full bg-brand hover:opacity-90 rounded-xl font-bold text-sm h-11">
                        Chọn gói này & Đặt lịch
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 2. PORTFOLIO TAB */}
        {activeTab === 'portfolio' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photographer.portfolio_photos?.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer group bg-slate-100 shadow-sm"
                >
                  <Image
                    src={img}
                    alt={`Portfolio ${idx + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                </div>
              ))}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
              <div
                onClick={() => setSelectedImage(null)}
                className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md"
              >
                <div className="relative max-w-4xl max-h-[90vh] w-full h-[80vh]">
                  <Image
                    src={selectedImage}
                    alt="Full size preview"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
              <div className="text-center md:text-left">
                <div className="text-4xl font-black text-slate-900 mb-1">
                  {photographer.average_rating?.toFixed(2)}
                  <span className="text-base text-slate-400 font-normal"> / 5.0</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-1 text-amber-500 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Dựa trên {photographer.review_count} lượt đánh giá thực tế từ khách hàng
                </p>
              </div>

              <div className="bg-violet-50 p-4 rounded-xl border border-violet-100 text-xs text-violet-900 max-w-sm">
                <p className="font-bold flex items-center gap-1.5 mb-1 text-violet-700">
                  <ShieldCheck className="w-4 h-4" />
                  Đánh giá minh bạch 100%
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Chỉ khách hàng đã hoàn thành buổi chụp và thanh toán qua FLASHY mới có quyền gửi đánh giá.
                </p>
              </div>
            </div>

            {reviews.map((rev) => (
              <Card key={rev.id} className="rounded-2xl border-slate-200">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                        <Image
                          src={rev.customer_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={rev.customer_name || 'Khách hàng'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{rev.customer_name}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{new Date(rev.created_at).toLocaleDateString('vi-VN')}</span>
                          {rev.is_verified_booking && (
                            <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              Đã xác thực đơn hàng
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed mb-3">
                    {rev.comment || rev.content}
                  </p>

                  {rev.images && rev.images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {rev.images.map((img, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                          <Image src={img} alt="Ảnh feedback" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
