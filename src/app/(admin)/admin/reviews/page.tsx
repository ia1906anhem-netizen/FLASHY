'use client'

import { useState } from 'react'
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

export default function AdminReviewsPage() {
  const [search, setSearch] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'flagged' | 'hidden'>('all')

  const [reviews, setReviews] = useState([
    {
      id: 'REV-101',
      customer: 'Nguyễn Thu Trang',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      photographer: 'Trần Minh Trí',
      rating: 5,
      date: '10/04/2026',
      content:
        'Anh Trí chụp siêu có tâm, hướng dẫn pose dáng nhiệt tình cho hai đứa mình lần đầu chụp ngoại cảnh. Màu ảnh retro Sài Gòn đúng chuẩn concept yêu cầu!',
      photos: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=300',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=300',
      ],
      is_flagged: false,
      is_visible: true,
      helpful_count: 14,
    },
    {
      id: 'REV-102',
      customer: 'Trần Minh Hoàng',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      photographer: 'Lê Bảo Visuals',
      rating: 4,
      date: '08/04/2026',
      content:
        'Góc chụp đẹp, bắt khoảnh khắc rất tốt. Điểm trừ nhỏ là trả ảnh trễ hơn 4 tiếng so với hẹn nhưng anh có báo trước và tặng thêm 5 ảnh màu.',
      photos: [],
      is_flagged: false,
      is_visible: true,
      helpful_count: 6,
    },
    {
      id: 'REV-103',
      customer: 'Lê Hoàng Yến',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      photographer: 'Hoàng Yến Nhi',
      rating: 1,
      date: '05/04/2026',
      content:
        'Thợ đến trễ 45 phút, không hề liên lạc qua tin nhắn Flashy mà để khách đứng chờ ngoài trời nắng gắt. Đề nghị ban quản trị kiểm tra xử lý!',
      photos: [],
      is_flagged: true,
      flag_reason: 'Khách khiếu nại thợ đến trễ & dịch vụ không đúng cam kết',
      is_visible: true,
      helpful_count: 22,
    },
    {
      id: 'REV-104',
      customer: 'Ẩn danh',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      photographer: 'Trần Minh Trí',
      rating: 1,
      date: '02/04/2026',
      content: 'Chụp xấu tệ, liên hệ qua số 0909xxxxxx để đặt ngoài rẻ hơn nhiều',
      photos: [],
      is_flagged: true,
      flag_reason: 'Nghi vấn spam / lôi kéo giao dịch ngoài nền tảng',
      is_visible: false,
      helpful_count: 0,
    },
  ])

  const toggleVisibility = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_visible: !r.is_visible } : r))
    )
  }

  const dismissFlag = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_flagged: false } : r))
    )
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kiểm duyệt Đánh giá (Review Moderation)</h1>
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
            <p className="text-2xl font-bold text-slate-900 mt-1">342</p>
            <span className="text-[11px] text-emerald-600 font-medium">94% đánh giá 5 sao</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Đánh giá bị báo cáo</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">2</p>
            <span className="text-[11px] text-rose-700 font-medium">Cần xử lý kiểm duyệt</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Đã ẩn khỏi trang thợ</p>
            <p className="text-2xl font-bold text-slate-600 mt-1">1</p>
            <span className="text-[11px] text-slate-500">Do vi phạm điều khoản</span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium">Ảnh kèm đánh giá</p>
            <p className="text-2xl font-bold text-violet-600 mt-1">816 ảnh</p>
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
              {mode === 'all'
                ? 'Tất cả'
                : mode === 'flagged'
                ? 'Bị báo cáo'
                : 'Đã ẩn'}
            </Button>
          ))}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {filtered.map((rev) => (
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
                    <Image src={rev.avatar} alt={rev.customer} fill className="object-cover" />
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
                              i < rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
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
        ))}
      </div>
    </div>
  )
}
