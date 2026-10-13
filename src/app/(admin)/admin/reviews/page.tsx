'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Star,
  Search,
  CheckCircle2,
  AlertTriangle,
  Flag,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Camera,
  ThumbsUp,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { getStoredBookings } from '@/lib/data/booking-store'

interface ReviewItem {
  id: string
  customer: string
  avatar: string
  photographer: string
  rating: number
  date: string
  content: string
  photos: string[]
  is_flagged: boolean
  flag_reason?: string
  is_visible: boolean
  helpful_count: number
}

export default function AdminReviewsPage() {
  const [search, setSearch] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'flagged' | 'hidden'>('all')
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const loadReviews = () => {
    let list: ReviewItem[] = []
    try {
      const raw = localStorage.getItem('flashy_admin_reviews')
      if (raw) {
        list = JSON.parse(raw)
      }
    } catch {}

    // Also pull reviews submitted in bookings
    const bookings = getStoredBookings()
    const existingIds = new Set(list.map((r) => r.id))

    for (const b of bookings) {
      if (b.review && !existingIds.has(`REV-${b.id}`)) {
        list.push({
          id: `REV-${b.id}`,
          customer: b.customer_name || 'Khách hàng',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
          photographer: b.photographer_name,
          rating: b.review.rating || 5,
          date: b.review.created_at
            ? new Date(b.review.created_at).toLocaleDateString('vi-VN')
            : new Date().toLocaleDateString('vi-VN'),
          content: b.review.comment || 'Dịch vụ tuyệt vời!',
          photos: [],
          is_flagged: false,
          is_visible: true,
          helpful_count: 0,
        })
      }
    }

    setReviews(list)
    setIsLoaded(true)
  }

  useEffect(() => {
    loadReviews()
    window.addEventListener('flashy_bookings_updated', loadReviews)
    window.addEventListener('flashy_admin_updated', loadReviews)
    window.addEventListener('storage', loadReviews)
    return () => {
      window.removeEventListener('flashy_bookings_updated', loadReviews)
      window.removeEventListener('flashy_admin_updated', loadReviews)
      window.removeEventListener('storage', loadReviews)
    }
  }, [])

  const saveReviewsToStore = (updated: ReviewItem[]) => {
    setReviews(updated)
    try {
      localStorage.setItem('flashy_admin_reviews', JSON.stringify(updated))
    } catch {}
  }

  const toggleVisibility = (id: string) => {
    const updated = reviews.map((r) =>
      r.id === id ? { ...r, is_visible: !r.is_visible } : r
    )
    saveReviewsToStore(updated)
  }

  const dismissFlag = (id: string) => {
    const updated = reviews.map((r) =>
      r.id === id ? { ...r, is_flagged: false } : r
    )
    saveReviewsToStore(updated)
  }

  const filtered = reviews.filter((r) => {
    const matchSearch =
      r.customer.toLowerCase().includes(search.toLowerCase()) ||
      r.photographer.toLowerCase().includes(search.toLowerCase()) ||
      r.content.toLowerCase().includes(search.toLowerCase())
    if (filterMode === 'flagged') return matchSearch && r.is_flagged
    if (filterMode === 'hidden') return matchSearch && !r.is_visible
    return matchSearch
  })

  const flaggedCount = reviews.filter((r) => r.is_flagged).length
  const hiddenCount = reviews.filter((r) => !r.is_visible).length
  const photosCount = reviews.reduce((sum, r) => sum + r.photos.length, 0)
  const fiveStarPct =
    reviews.length > 0
      ? Math.round(
          (reviews.filter((r) => r.rating === 5).length / reviews.length) * 100
        )
      : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Kiểm duyệt Đánh giá (Review Moderation)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Kiểm tra và kiểm duyệt đánh giá của khách hàng, xử lý báo cáo vi phạm nội dung và giao dịch ngoài sàn
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Tổng số đánh giá</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{reviews.length}</p>
            <span className="text-[11px] text-emerald-600 font-medium">
              {reviews.length > 0 ? `${fiveStarPct}% đánh giá 5 sao` : '0 đánh giá mới'}
            </span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Đánh giá bị báo cáo</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{flaggedCount}</p>
            <span className="text-[11px] text-rose-700 font-medium">
              {flaggedCount > 0 ? 'Cần xử lý kiểm duyệt' : 'Không có vi phạm'}
            </span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Đã ẩn khỏi trang thợ</p>
            <p className="text-2xl font-bold text-slate-600 mt-1">{hiddenCount}</p>
            <span className="text-[11px] text-slate-500">Do vi phạm điều khoản</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Ảnh kèm đánh giá</p>
            <p className="text-2xl font-bold text-violet-600 mt-1">{photosCount} ảnh</p>
            <span className="text-[11px] text-slate-500">Người thật việc thật</span>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên khách, thợ ảnh, nội dung đánh giá..."
            className="pl-9 bg-white"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'flagged', 'hidden'] as const).map((mode) => (
            <Button
              key={mode}
              variant={filterMode === mode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterMode(mode)}
              className={filterMode === mode ? 'bg-violet-600 text-white' : 'text-slate-600'}
            >
              {mode === 'all' ? 'Tất cả' : mode === 'flagged' ? 'Bị báo cáo' : 'Đã ẩn'}
            </Button>
          ))}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card className="border-slate-200 bg-white p-14 text-center rounded-3xl shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Chưa có đánh giá nào (Clean Slate)</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Hệ thống chưa có lượt đánh giá nào từ khách hàng. Sau khi một đơn chụp hoàn tất và khách gửi sao/nhận xét, nội dung sẽ lập tức hiển thị tại đây.
            </p>
          </Card>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs">
            Không tìm thấy đánh giá nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          filtered.map((rev) => (
            <Card
              key={rev.id}
              className={`border transition-all ${
                rev.is_flagged
                  ? 'border-rose-200 bg-rose-50/20'
                  : !rev.is_visible
                  ? 'border-slate-200 bg-slate-50/50 opacity-75'
                  : 'border-slate-200'
              }`}
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-200">
                      {rev.avatar ? (
                        <Image src={rev.avatar} alt={rev.customer} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-violet-100 text-violet-700 font-bold">
                          {rev.customer.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 text-sm">{rev.customer}</p>
                        <span className="text-xs text-slate-400">đánh giá cho</span>
                        <p className="font-semibold text-violet-700 text-sm">{rev.photographer}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">• {rev.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {rev.is_flagged && (
                      <Badge className="bg-rose-100 text-rose-800 border-rose-200 gap-1 text-xs">
                        <AlertTriangle className="h-3 w-3" />
                        Báo cáo vi phạm
                      </Badge>
                    )}
                    {!rev.is_visible && (
                      <Badge variant="outline" className="text-slate-500 text-xs">
                        Đang bị ẩn
                      </Badge>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleVisibility(rev.id)}
                      className="h-8 text-xs gap-1"
                    >
                      {rev.is_visible ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5 text-slate-500" />
                          Ẩn đánh giá
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5 text-emerald-600" />
                          Hiện lại
                        </>
                      )}
                    </Button>

                    {rev.is_flagged && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissFlag(rev.id)}
                        className="h-8 text-xs text-slate-600 hover:bg-slate-100"
                      >
                        Bỏ qua báo cáo
                      </Button>
                    )}
                  </div>
                </div>

                {rev.is_flagged && rev.flag_reason && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                    <Flag className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Lý do báo cáo: {rev.flag_reason}</span>
                  </div>
                )}

                <p className="text-xs text-slate-700 leading-relaxed">{rev.content}</p>

                {rev.photos.length > 0 && (
                  <div className="flex gap-2 pt-2">
                    {rev.photos.map((src, i) => (
                      <div
                        key={i}
                        className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200"
                      >
                        <Image src={src} alt="Review attachment" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
