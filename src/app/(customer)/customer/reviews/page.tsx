'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Camera, Image as ImageIcon, Flag, ChevronRight, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateVN, formatVND } from '@/lib/utils'
import { toast } from 'sonner'

const DEMO_REVIEWS = [
  {
    id: '1',
    photographer: {
      name: 'Minh Tú Nguyễn',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop',
      slug: 'minh-tu-nguyen',
    },
    package: 'Quick Date',
    booking_amount: 150000,
    booking_date: '2026-09-20',
    rating: 5,
    content: 'Anh Minh Tú chụp rất chuyên nghiệp, ảnh ra đẹp hơn mình kỳ vọng nhiều. Góc chụp sáng tạo, biết cách tạo dáng tự nhiên. Nhất định sẽ quay lại!',
    images: [
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=120&h=120&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=120&h=120&fit=crop',
    ],
    created_at: '2026-09-22T10:00:00Z',
    status: 'published',
  },
  {
    id: '2',
    photographer: {
      name: 'Linh Chi Phạm',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop',
      slug: 'linh-chi-pham',
    },
    package: 'Flash Shot',
    booking_amount: 99000,
    booking_date: '2026-08-05',
    rating: 4,
    content: 'Chụp nhanh gọn, ảnh đẹp. Chỉ tiếc là ảnh giao hơi chậm so với deadline cam kết nhưng kết quả cuối cùng rất ổn.',
    images: [],
    created_at: '2026-08-07T14:30:00Z',
    status: 'published',
  },
]

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={`w-4 h-4 ${s <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
        />
      ))}
    </div>
  )
}

export default function CustomerReviewsPage() {
  const [reviews] = useState(DEMO_REVIEWS)

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500" />
            Đánh giá của tôi
          </h1>
          <p className="text-slate-500 text-sm mt-1">Các đánh giá bạn đã để lại cho nhiếp ảnh gia</p>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: 'Tổng đánh giá', value: reviews.length, color: 'text-violet-600' },
            {
              label: 'Điểm trung bình',
              value: (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) + '⭐',
              color: 'text-amber-600',
            },
            { label: 'Đã đăng', value: reviews.filter(r => r.status === 'published').length, color: 'text-emerald-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 border border-slate-200 text-center">
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Chưa có đánh giá nào</p>
              <p className="text-slate-400 text-sm mt-1">Sau khi hoàn thành buổi chụp, hãy để lại đánh giá cho nhiếp ảnh gia</p>
            </div>
          ) : (
            reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm"
              >
                {/* Top row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={review.photographer.avatar} alt={review.photographer.name} />
                      <AvatarFallback>{review.photographer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{review.photographer.name}</p>
                      <p className="text-xs text-slate-400">{review.package} · {formatDateVN(review.booking_date)}</p>
                    </div>
                  </div>
                  <Badge className={`text-xs border-0 ${
                    review.status === 'published'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {review.status === 'published' ? '✓ Đã đăng' : 'Đang xét duyệt'}
                  </Badge>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <StarRating value={review.rating} />
                  <span className="text-sm font-bold text-amber-600">{review.rating}/5</span>
                </div>

                {/* Content */}
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{review.content}</p>

                {/* Review Images */}
                {review.images.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {review.images.map((img, idx) => (
                      <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt="Review ảnh" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <button
                      className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 hover:border-violet-400 hover:text-violet-500 transition-colors"
                      onClick={() => toast.info('Thêm ảnh yêu cầu kết nối Supabase Storage')}
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400">{formatDateVN(review.created_at)}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-slate-400 gap-1 h-8"
                      onClick={() => toast.info('Tính năng báo cáo đang phát triển')}
                    >
                      <Flag className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-red-400 hover:text-red-600 gap-1 h-8"
                      onClick={() => toast.error('Để xóa đánh giá, vui lòng liên hệ hỗ trợ')}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 gap-1"
                      onClick={() => window.location.href = `/photographers/${review.photographer.slug}`}
                    >
                      Xem hồ sơ
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Demo notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
          <strong>⚠ Chế độ Demo:</strong> Đánh giá hiển thị là dữ liệu mẫu minh họa.
        </div>

      </div>
    </div>
  )
}
