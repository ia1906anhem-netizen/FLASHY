'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronLeft,
  Download,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Eye,
  X,
  ChevronRight,
  Filter,
  AlertCircle,
  FileCheck,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { updateBookingStatus, addBookingReview, getBookingById } from '@/lib/data/booking-store'

export default function CustomerGalleryPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params?.id as string

  // Quota for this package
  const maxRetouchQuota = 10
  const [selectedRetouchIds, setSelectedRetouchIds] = useState<string[]>(['photo-1', 'photo-3'])
  const [activeTab, setActiveTab] = useState<'all' | 'edited' | 'original' | 'retouch'>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [isAccepted, setIsAccepted] = useState<boolean>(false)
  const [showAcceptSuccess, setShowAcceptSuccess] = useState<boolean>(false)
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false)
  const [reviewRating, setReviewRating] = useState<number>(5)
  const [reviewText, setReviewText] = useState<string>('')
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false)

  // Demo delivered photos
  const photos = [
    {
      id: 'photo-1',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=80',
      category: 'edited',
      name: 'IMG_4812_ColorGraded.jpg',
      size: '8.4 MB'
    },
    {
      id: 'photo-2',
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1000&auto=format&fit=crop&q=80',
      category: 'edited',
      name: 'IMG_4815_ColorGraded.jpg',
      size: '9.1 MB'
    },
    {
      id: 'photo-3',
      url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=1000&auto=format&fit=crop&q=80',
      category: 'edited',
      name: 'IMG_4820_ColorGraded.jpg',
      size: '7.8 MB'
    },
    {
      id: 'photo-4',
      url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1000&auto=format&fit=crop&q=80',
      category: 'edited',
      name: 'IMG_4825_ColorGraded.jpg',
      size: '8.9 MB'
    },
    {
      id: 'photo-5',
      url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1000&auto=format&fit=crop&q=80',
      category: 'original',
      name: 'IMG_4830_RAW.jpg',
      size: '24.2 MB'
    },
    {
      id: 'photo-6',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1000&auto=format&fit=crop&q=80',
      category: 'original',
      name: 'IMG_4835_RAW.jpg',
      size: '25.0 MB'
    },
  ]

  const filteredPhotos = photos.filter(p => {
    if (activeTab === 'all') return true
    if (activeTab === 'retouch') return selectedRetouchIds.includes(p.id)
    return p.category === activeTab
  })

  const toggleRetouchSelection = (id: string) => {
    if (selectedRetouchIds.includes(id)) {
      setSelectedRetouchIds(selectedRetouchIds.filter(x => x !== id))
    } else {
      if (selectedRetouchIds.length >= maxRetouchQuota) {
        alert(`Bạn đã chọn đủ số lượng tối đa ${maxRetouchQuota} ảnh retouch của gói này!`)
        return
      }
      setSelectedRetouchIds([...selectedRetouchIds, id])
    }
  }

  const handleAcceptDelivery = () => {
    setIsAccepted(true)
    setShowAcceptSuccess(true)
    updateBookingStatus(bookingId, 'ACCEPTED')
    try {
      const currentCoins = Number(localStorage.getItem('flashy_user_coins') || '0')
      localStorage.setItem('flashy_user_coins', String(currentCoins + 50))
      window.dispatchEvent(new Event('flashy_coins_updated'))
    } catch {}

    setTimeout(() => {
      setShowAcceptSuccess(false)
      setShowReviewModal(true)
    }, 2000)
  }

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    setReviewSubmitted(true)
    addBookingReview(bookingId, reviewRating, reviewText)
    setTimeout(() => {
      setShowReviewModal(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      
      {/* Top Navigation Bar */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3">
        <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <Link href={`/customer/bookings/${bookingId}`} className="text-slate-400 hover:text-white p-1 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-white">Kho Ảnh Bàn Giao #{bookingId || 'BK-892104'}</h1>
                <Badge variant="outline" className="border-violet-500 text-violet-300 text-[10px]">
                  {photos.length} tệp tin
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                {isAccepted ? '✓ Đã nghiệm thu bàn giao' : 'Đang xem trước có watermark (Hạn duyệt 48h)'}
              </p>
            </div>
          </div>

          {/* Right actions: Retouch counter & Accept button */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Retouch đã chọn:</span>
              <strong className="text-amber-400">{selectedRetouchIds.length}/{maxRetouchQuota}</strong>
            </div>

            {isAccepted ? (
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold h-9">
                <Download className="w-3.5 h-3.5 mr-1" />
                Tải toàn bộ gốc (ZIP)
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleAcceptDelivery}
                className="bg-brand hover:opacity-90 text-white rounded-xl text-xs font-black h-9 shadow-lg shadow-violet-500/25"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Duyệt & Nhận Ảnh
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl pt-6">
        
        {/* Review window countdown notice */}
        {!isAccepted && (
          <div className="mb-6 p-4 rounded-2xl bg-violet-950/60 border border-violet-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-violet-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Ảnh đang ở chế độ xem trước (Watermarked Preview)</p>
                <p className="text-slate-400">
                  Hãy bấm chọn tích sao vào những ảnh bạn muốn thợ retouch chuyên sâu (tối đa {maxRetouchQuota} ảnh). Khi bấm "Duyệt & Nhận Ảnh", toàn bộ watermark sẽ được gỡ bỏ.
                </p>
              </div>
            </div>
            <span className="font-mono bg-violet-900/80 px-2.5 py-1 rounded-lg text-violet-200 self-start sm:self-auto font-bold">
              Còn 34:12:08
            </span>
          </div>
        )}

        {/* Filter categories */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: `Tất cả ảnh (${photos.length})` },
            { id: 'edited', label: 'Ảnh chỉnh màu (4)' },
            { id: 'retouch', label: `Đã chọn Retouch (${selectedRetouchIds.length})` },
            { id: 'original', label: 'File gốc RAW (2)' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredPhotos.map((photo, index) => {
            const isRetouchSelected = selectedRetouchIds.includes(photo.id)
            return (
              <div
                key={photo.id}
                className={`relative aspect-[3/4] rounded-2xl overflow-hidden group bg-slate-800 border-2 transition-all cursor-pointer ${
                  isRetouchSelected ? 'border-amber-400 shadow-lg ring-2 ring-amber-400/30' : 'border-transparent'
                }`}
              >
                <Image
                  src={photo.url}
                  alt={photo.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Pre-acceptance Watermark Overlay */}
                {!isAccepted && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none overflow-hidden">
                    <span className="text-white/25 font-black text-xl tracking-widest rotate-[-35deg] uppercase border border-white/20 px-4 py-1 rounded">
                      FLASHY PREVIEW
                    </span>
                  </div>
                )}

                {/* Retouch Selector Tag (Top Left) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleRetouchSelection(photo.id)
                  }}
                  className={`absolute top-2 left-2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    isRetouchSelected
                      ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                      : 'bg-black/50 text-white/70 hover:bg-black/80 hover:text-white'
                  }`}
                  title="Chọn ảnh retouch chuyên sâu"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>

                {/* Lightbox Trigger on click */}
                <div
                  onClick={() => setLightboxIndex(index)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Eye className="w-6 h-6 text-white drop-shadow-md" />
                </div>

                {/* Filename strip at bottom */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-[10px] text-slate-300 truncate">
                  {photo.name}
                </div>
              </div>
            )
          })}
        </div>

      </div>

      {/* Lightbox Fullscreen Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>
              Ảnh {lightboxIndex + 1} / {filteredPhotos.length} • {filteredPhotos[lightboxIndex]?.name}
            </span>
            <button
              onClick={() => setLightboxIndex(null)}
              className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Image & Prev/Next */}
          <div className="relative flex-1 flex items-center justify-center my-2">
            <button
              onClick={() => setLightboxIndex((lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length)}
              className="absolute left-2 z-10 w-10 h-10 rounded-full bg-slate-800/80 text-white flex items-center justify-center hover:bg-slate-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="relative w-full h-[75vh]">
              <Image
                src={filteredPhotos[lightboxIndex]?.url}
                alt="Full size"
                fill
                className="object-contain"
              />

              {!isAccepted && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none">
                  <span className="text-white/20 font-black text-4xl tracking-widest rotate-[-35deg] uppercase border-2 border-white/20 px-8 py-2 rounded-xl">
                    FLASHY PREVIEW
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length)}
              className="absolute right-2 z-10 w-10 h-10 rounded-full bg-slate-800/80 text-white flex items-center justify-center hover:bg-slate-700"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Footer toolbar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => toggleRetouchSelection(filteredPhotos[lightboxIndex].id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                selectedRetouchIds.includes(filteredPhotos[lightboxIndex].id)
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {selectedRetouchIds.includes(filteredPhotos[lightboxIndex].id) ? 'Bỏ chọn Retouch' : 'Chọn Retouch ảnh này'}
            </button>

            {isAccepted && (
              <a
                href={filteredPhotos[lightboxIndex]?.url}
                download
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 text-white hover:bg-violet-700 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Tải ảnh gốc
              </a>
            )}
          </div>
        </div>
      )}

      {/* Acceptance Success Toast/Alert */}
      {showAcceptSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Đã Duyệt Bàn Giao Thành Công!</p>
            <p className="text-emerald-100">Khoản ký quỹ Escrow bắt đầu quy trình giải ngân cho thợ chụp.</p>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <h3 className="text-xl font-black text-white">Đánh Giá Buổi Chụp</h3>
              <p className="text-xs text-slate-400 mt-1">
                Nhận xét của bạn sẽ giúp cộng đồng có thêm góc nhìn khách quan và bạn nhận được <strong>+50 Xu Flashy</strong>!
              </p>
            </div>

            {reviewSubmitted ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="font-bold text-sm text-white">Cảm ơn đánh giá của bạn!</p>
                <p className="text-xs text-slate-400 mt-1">Đã cộng 50 Xu vào ví Flashy Coins của bạn.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-8 h-8 ${star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>

                <div>
                  <textarea
                    required
                    rows={3}
                    placeholder="Chia sẻ trải nghiệm về phong cách làm việc, sự tận tình và chất lượng ảnh..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowReviewModal(false)} className="flex-1 rounded-xl text-xs border-slate-700 text-slate-300">
                    Bỏ qua
                  </Button>
                  <Button type="submit" className="flex-1 bg-brand hover:opacity-90 rounded-xl text-xs font-bold text-white">
                    Gửi đánh giá (+50 Xu)
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
