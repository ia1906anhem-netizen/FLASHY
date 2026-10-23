'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Search,
  MapPin,
  Star,
  Shield,
  ShieldCheck,
  Zap,
  Camera,
  Clock,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Award,
  Users,
  TrendingUp,
  Play,
  Navigation,
  Loader2,
  Coins,
  Ticket,
  Maximize2,
  X,
  Coffee,
  Plane,
  Calendar,
  User,
  Palette,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PHOTOGRAPHY_CATEGORIES } from '@/lib/constants'
import { CityLocationPicker, type SelectedLocationData } from '@/components/shared/city-location-picker'
import { formatVND } from '@/lib/utils'
import {
  getCurrentUserCoordinates,
  findNearestDistrict,
  type Coordinates
} from '@/lib/geolocation'
import {
  getApprovedProviders,
  getStoredBookings,
  calculateDynamicStats,
  seedMockPhotographers,
  type ApprovedProvider,
  type DynamicStats,
} from '@/lib/data/booking-store'

// Local helper – formats a rating float to one decimal (e.g. 4.90 → "4.9")
function formatRating(v: number): string {
  return Number.isInteger(v) ? v.toFixed(1) : v.toString()
}

const PACKAGES = [
  {
    slug: 'flashy-express',
    name: 'FLASHY EXPRESS ⚡',
    price: '350.000 VNĐ',
    duration: '45–60 phút',
    photos: '5–10 ảnh màu + File gốc',
    color: 'from-violet-500 to-purple-600',
    icon: '⚡',
    popular: false,
  },
  {
    slug: 'flashy-casual',
    name: 'FLASHY CASUAL 📷',
    price: '800.000 VNĐ',
    duration: '90 phút',
    photos: '10 ảnh màu (5 retouch kỹ) + File gốc',
    color: 'from-pink-500 to-rose-600',
    icon: '📷',
    popular: true,
  },
  {
    slug: 'flashy-pro',
    name: 'FLASHY PRO 🎯',
    price: '1.500.000 VNĐ',
    duration: '120 phút',
    photos: '15 ảnh màu (10 retouch kỹ) + File gốc',
    color: 'from-orange-500 to-amber-600',
    icon: '🎯',
    popular: false,
  },
  {
    slug: 'flashy-signature',
    name: 'FLASHY SIGNATURE 👑',
    price: '3.200.000 VNĐ',
    duration: '150 phút',
    photos: '20 ảnh màu (15 retouch kỹ) + File gốc',
    color: 'from-emerald-500 to-teal-600',
    icon: '👑',
    popular: false,
  },
]

// ─── MOCK DATA: 4 Featured Photographers (luôn hiển thị kể cả khi store rỗng) ───
const MOCK_HOMEPAGE_PHOTOGRAPHERS = [
  {
    id: 'mock-hcm-001',
    name: 'Minh Khoa (MK Visual)',
    slug: 'minh-khoa-mk-visual',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    cover: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=400&fit=crop',
    location: 'Quận 1, TP. Hồ Chí Minh',
    specialty: 'Lifestyle · Street · Cafe Portrait',
    rating: 4.97, reviews: 128, starting_price: 800000,
    is_verified: true, is_sponsored: true, badge: '🏆 Top Rated',
    portfolio: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=300&fit=crop',
    ],
  },
  {
    id: 'mock-hn-001',
    name: 'Phương Nghi (Nghi Phim)',
    slug: 'phuong-nghi-nghi-phim',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    cover: 'https://images.unsplash.com/photo-1555921015-5532091f6026?w=800&h=400&fit=crop',
    location: 'Hoàn Kiếm, Hà Nội',
    specialty: 'Film Portrait · Couple · Analog',
    rating: 5.0, reviews: 47, starting_price: 800000,
    is_verified: true, is_sponsored: true, badge: '🎞️ Film Style',
    portfolio: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507081323647-4d250478b919?w=300&h=300&fit=crop',
    ],
  },
  {
    id: 'mock-hcm-002',
    name: 'Linh Đan (Dandelion Studio)',
    slug: 'linh-dan-dandelion-studio',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    cover: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=400&fit=crop',
    location: 'Quận 3, TP. Hồ Chí Minh',
    specialty: 'Áo dài · Tết · Couple · Concept',
    rating: 4.92, reviews: 84, starting_price: 1500000,
    is_verified: true, is_sponsored: false, badge: '✨ KYC Verified',
    portfolio: [
      'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=300&h=300&fit=crop',
    ],
  },
  {
    id: 'mock-hn-003',
    name: 'Bảo Châu (Studio Mây)',
    slug: 'bao-chau-studio-may',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    cover: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&h=400&fit=crop',
    location: 'Đống Đa, Hà Nội',
    specialty: 'Áo dài · Concept · Kỷ yếu',
    rating: 4.95, reviews: 76, starting_price: 3200000,
    is_verified: true, is_sponsored: false, badge: '🌸 Signature',
    portfolio: [
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=300&h=300&fit=crop',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=300&fit=crop',
    ],
  },
]

// ─── MOCK DATA: Category Image Banner Cards ───────────────────────────────────
const CATEGORY_CARDS = [
  {
    value: 'lifestyle',
    label: 'Lifestyle',
    desc: 'Đời thường · Cafe · Dạo phố',
    img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=280&fit=crop',
    gradient: 'from-violet-600/80 to-purple-900/60',
  },
  {
    value: 'tet_ao_dai',
    label: 'Áo dài / Tết',
    desc: 'Truyền thống · Lễ hội · Xuân',
    img: 'https://images.unsplash.com/photo-1526510747491-58f928ec870f?w=400&h=280&fit=crop',
    gradient: 'from-rose-600/80 to-pink-900/60',
  },
  {
    value: 'couple',
    label: 'Chụp đôi',
    desc: 'Couple · Lãng mạn · Kỷ niệm',
    img: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&h=280&fit=crop',
    gradient: 'from-pink-600/80 to-red-900/60',
  },
  {
    value: 'street',
    label: 'Street Style',
    desc: 'Streetwear · Đô thị · Urban',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=280&fit=crop',
    gradient: 'from-slate-700/80 to-slate-900/70',
  },
  {
    value: 'graduation',
    label: 'Kỷ yếu',
    desc: 'Tốt nghiệp · Ký ức · Lớp học',
    img: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=280&fit=crop',
    gradient: 'from-emerald-600/80 to-teal-900/60',
  },
  {
    value: 'outdoor',
    label: 'Dã ngoại',
    desc: 'Outdoor · Thiên nhiên · Adventure',
    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=280&fit=crop',
    gradient: 'from-amber-600/80 to-orange-900/60',
  },
]

// ─── SUB-CATEGORY PILL CHIPS: Lucide icons + modern styling ──────────────────
const SUB_CATEGORY_CHIPS = [
  { value: 'quick_date', label: 'Quick Date', icon: Coffee },
  { value: 'travel', label: 'Du lịch', icon: Plane },
  { value: 'events', label: 'Sự kiện', icon: Calendar },
  { value: 'portrait', label: 'Chân dung', icon: User },
  { value: 'concept', label: 'Concept Photography', icon: Palette },
]

// ─── MOCK DATA: 3 Reviews kèm ảnh sản phẩm hoàn thiện ───────────────────────────────────
const MOCK_REVIEWS = [
  {
    id: 'r-001',
    name: 'Ngọc Anh',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    date: '18/10/2026',
    content: 'Anh Minh Khoa chụp rất tự nhiên và chuyên nghiệp. Mình không phải người lên đồ giỏi nhưng anh hướng dẫn tạo dáng siêu chill, ảnh ra đẹp hơn mình tưởng 100%!',
    photographer: 'Minh Khoa (MK Visual)',
    package: 'FLASHY CASUAL',
    productPhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=600&fit=crop',
  },
  {
    id: 'r-002',
    name: 'Minh Phúc',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    date: '15/10/2026',
    content: 'Đặt gói Áo dài cho bạn gái dịp Tết, chị Linh Đan chụp lung linh lắm. Màu phim rất đặc trưng, ảnh lên mạng được khen nhiều. Nhất định quay lại!',
    photographer: 'Linh Đan (Dandelion Studio)',
    package: 'FLASHY PRO',
    productPhoto: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=600&fit=crop',
  },
  {
    id: 'r-003',
    name: 'Thu Hương',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    date: '10/10/2026',
    content: 'Escrow FLASHY an tâm lắm, tiền giữ đến lúc nhận ảnh xong mới release. Chị Phương Nghi chụp ảnh film rất có hồn, nhận ảnh xong mình ôm điện thoại coi cả tiếng không chán!',
    photographer: 'Phương Nghi (Nghi Phim)',
    package: 'FLASHY SIGNATURE',
    productPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Search,
    title: 'Tìm nhiếp ảnh gia',
    desc: 'Tìm kiếm theo vị trí, phong cách, ngân sách. Xem portfolio và đánh giá thực tế.',
  },
  {
    step: '02',
    icon: Camera,
    title: 'Chọn gói & đặt lịch',
    desc: 'Chọn gói dịch vụ phù hợp, thêm dịch vụ bổ sung, chọn ngày giờ thuận tiện.',
  },
  {
    step: '03',
    icon: Shield,
    title: 'Thanh toán an toàn',
    desc: 'Tiền được giữ an toàn qua hệ thống escrow. Chỉ giải phóng sau khi bạn nhận ảnh.',
  },
  {
    step: '04',
    icon: Star,
    title: 'Nhận ảnh & đánh giá',
    desc: 'Tải ảnh về, chọn ảnh retouch, để lại đánh giá để giúp cộng đồng.',
  },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLocation, setSearchLocation] = useState('Hồ Chí Minh')

  const [dynamicStats, setDynamicStats] = useState<DynamicStats>({
    photographersCount: 0,
    bookingsCount: 0,
    averageRating: 'Chưa có dữ liệu',
    satisfactionRate: 'Chưa có dữ liệu',
    totalReviews: 0,
  })
  const [featuredPhotographers, setFeaturedPhotographers] = useState<ApprovedProvider[]>([])
  const [realReviews, setRealReviews] = useState<Array<{
    id: string
    name: string
    avatar: string
    rating: number
    date: string
    content: string
    photographer: string
    package: string
    productPhoto?: string
  }>>([])
  const [previewPhoto, setPreviewPhoto] = useState<{ src: string; caption: string; photographer: string } | null>(null)
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null)
  const [userCoins, setUserCoins] = useState<number>(0)
  const [isClientLoaded, setIsClientLoaded] = useState(false)
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null)
  const [isLocatingNearby, setIsLocatingNearby] = useState(false)

  useEffect(() => {
    // Auto-seed mock photographers vào localStorage
    seedMockPhotographers()

    const refreshData = () => {
      setDynamicStats(calculateDynamicStats())
      setFeaturedPhotographers(getApprovedProviders())
      
      // Load real customer reviews from completed bookings
      const bookings = getStoredBookings()
      const reviewed = bookings.filter(
        (b) => b.review && typeof b.review.rating === 'number' && b.review.rating > 0
      )
      const sampleDeliverablePhotos = [
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop',
      ]
      const mapped = reviewed.map((b, idx) => ({
        id: b.id,
        name: b.customer_name || 'Khách hàng',
        avatar: (b as any).customer_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop',
        rating: b.review?.rating || 5,
        date: b.review?.created_at
          ? new Date(b.review.created_at).toLocaleDateString('vi-VN')
          : 'Gần đây',
        content: b.review?.comment || 'Dịch vụ chụp ảnh chuyên nghiệp và chu đáo. Ảnh nhận về chất lượng rất cao và vượt mong đợi!',
        photographer: b.photographer_name,
        package: b.package_name,
        productPhoto: (b as any).deliverables?.[0] || sampleDeliverablePhotos[idx % sampleDeliverablePhotos.length],
      }))
      setRealReviews(mapped)

      // Real user coins from localStorage
      const coinsStored = Number(localStorage.getItem('flashy_user_coins') || '0')
      setUserCoins(coinsStored)

      setIsClientLoaded(true)
    }

    refreshData()

    window.addEventListener('flashy_bookings_updated', refreshData)
    window.addEventListener('flashy_providers_updated', refreshData)
    window.addEventListener('flashy_coins_updated', refreshData)
    window.addEventListener('storage', refreshData)

    return () => {
      window.removeEventListener('flashy_bookings_updated', refreshData)
      window.removeEventListener('flashy_providers_updated', refreshData)
      window.removeEventListener('flashy_coins_updated', refreshData)
      window.removeEventListener('storage', refreshData)
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (searchLocation) params.set('city', searchLocation)
    if (userCoords) {
      params.set('lat', userCoords.latitude.toString())
      params.set('lng', userCoords.longitude.toString())
    }
    window.location.href = `/photographers?${params.toString()}`
  }

  const handleQuickNearby = async () => {
    setIsLocatingNearby(true)
    try {
      const coords = await getCurrentUserCoordinates()
      setUserCoords(coords)
      const geocoded = findNearestDistrict(coords)
      if (geocoded.district) setSearchLocation(geocoded.district)
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      params.set('city', geocoded.district || geocoded.city || 'all')
      params.set('lat', coords.latitude.toString())
      params.set('lng', coords.longitude.toString())
      params.set('nearby', 'true')
      window.location.href = `/photographers?${params.toString()}`
    } catch (err: any) {
      alert(err?.message || 'Không thể lấy vị trí hiện tại. Vui lòng bật định vị trên trình duyệt của bạn.')
    } finally {
      setIsLocatingNearby(false)
    }
  }

  const statsDisplay = [
    {
      value: isClientLoaded
        ? dynamicStats.photographersCount > 0
          ? `${dynamicStats.photographersCount}+`
          : '0'
        : '0',
      label: 'Nhiếp ảnh gia',
      icon: Camera,
    },
    {
      value: isClientLoaded
        ? dynamicStats.bookingsCount > 0
          ? `${dynamicStats.bookingsCount}`
          : '0'
        : '0',
      label: 'Buổi chụp',
      icon: Zap,
    },
    {
      value: isClientLoaded
        ? (typeof dynamicStats.averageRating === 'number'
            ? `${dynamicStats.averageRating}/5`
            : dynamicStats.averageRating === 'Chưa có dữ liệu'
              ? 'N/A'
              : String(dynamicStats.averageRating))
        : 'N/A',
      label: 'Đánh giá TB',
      icon: Star,
    },
    {
      value: isClientLoaded
        ? (dynamicStats.satisfactionRate === 'Chưa có dữ liệu'
            ? 'N/A'
            : String(dynamicStats.satisfactionRate))
        : 'N/A',
      label: 'Khách hài lòng',
      icon: Users,
    },
  ]

  return (
    <div className="w-full">
      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-screen flex items-center justify-center -mt-20 md:-mt-24">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="/hero-bg.jpg"
            alt="Nhiếp ảnh gia đang chụp ảnh tại Sài Gòn"
            fill
            priority
            className="object-cover"
            quality={90}
          />
          <div className="absolute inset-0 hero-gradient-overlay" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-violet-400/40"
              style={{
                left: `${15 + i * 14}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            />
          ))}
        </div>

        {/* Hero content */}
        <div className="relative z-10 container mx-auto px-4 max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Top badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-white/90 text-sm font-medium mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Marketplace nhiếp ảnh #1 Việt Nam</span>
              <span className="px-1.5 py-0.5 rounded-full bg-violet-500/30 text-xs">Beta</span>
            </motion.div>

            {/* Main headline */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Bắt trọn mọi{' '}
              <span className="relative">
                <span className="text-gradient">khoảnh khắc</span>
              </span>
              <br />
              đáng nhớ
            </h1>

            <p className="text-lg md:text-xl text-white/75 mb-10 max-w-2xl mx-auto leading-relaxed">
              Kết nối với{' '}
              {isClientLoaded && dynamicStats.photographersCount > 0 ? (
                <>
                  hơn <strong className="text-white">{dynamicStats.photographersCount}+</strong> nhiếp ảnh gia freelance tài năng.
                </>
              ) : (
                <>các nhiếp ảnh gia freelance tài năng đã qua xác minh KYC an toàn.</>
              )}{' '}
              Đặt lịch nhanh, thanh toán an toàn, nhận ảnh đẹp.
            </p>

            {/* Search bar */}
            <motion.div
              className="max-w-2xl mx-auto relative z-30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <form onSubmit={handleSearch} className="relative z-30">
                <div className="flex flex-col sm:flex-row gap-3 glass rounded-2xl p-3 relative z-30">
                  <div className="flex items-center gap-2 flex-1 bg-white/10 rounded-xl px-4 py-2">
                    <Search className="w-4 h-4 text-white/60 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm phong cách, dịp chụp..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent text-white placeholder:text-white/50 outline-none text-sm"
                    />
                  </div>
                  <div className="sm:w-56">
                    <CityLocationPicker
                      value={searchLocation}
                      onChange={(val) => setSearchLocation(val)}
                      onLocationSelect={(data) => {
                        if (data.coordinates) {
                          setUserCoords(data.coordinates)
                        }
                      }}
                      placeholder="Chọn thành phố / quận"
                      variant="hero-glass"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-brand text-white hover:opacity-90 shadow-glow-purple font-bold px-6 sm:w-auto w-full relative z-10"
                  >
                    Tìm ngay
                  </Button>
                </div>
              </form>

              {/* Location Quick Tabs */}
              <div className="flex items-center gap-1.5 mt-3.5 flex-wrap justify-center text-xs relative z-10">
                {/* Nút định vị GPS tự động tức thì */}
                <button
                  type="button"
                  onClick={handleQuickNearby}
                  disabled={isLocatingNearby}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 bg-gradient-to-r from-pink-500 via-rose-500 to-violet-600 text-white shadow-glow-purple hover:scale-105 active:scale-95 border border-white/20"
                >
                  {isLocatingNearby ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Navigation className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  )}
                  <span>{isLocatingNearby ? 'Đang dò GPS...' : 'Gần tôi nhất (GPS)'}</span>
                </button>

                <span className="text-white/60 font-medium flex items-center gap-1 text-[11px] ml-1">
                  <MapPin className="w-3 h-3 text-pink-400" />
                  Khu vực:
                </span>
                {['Tất cả', 'TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Đà Lạt', 'Quận 1', 'Quận 3'].map((dist) => (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => {
                      setSearchLocation(dist === 'Tất cả' ? '' : dist)
                      setUserCoords(null)
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      (dist === 'Tất cả' && !searchLocation) || searchLocation === dist
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'glass text-white/80 hover:text-white hover:bg-white/20'
                    }`}
                  >
                    {dist}
                  </button>
                ))}
              </div>

              {/* Popular categories */}
              <div className="flex items-center gap-2 mt-3 flex-wrap justify-center relative z-10">
                <span className="text-white/50 text-xs">Hot:</span>
                {['Lifestyle', 'Couple', 'Kỷ yếu', 'Áo dài', 'Outdoor'].map((tag) => (
                  <Link
                    key={tag}
                    href={`/photographers?style=${tag}`}
                    className="text-xs text-white/70 hover:text-white glass px-3 py-1 rounded-full transition-colors duration-200"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.div
          className="absolute bottom-8 left-0 right-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="grid grid-cols-4 gap-2 sm:gap-6">
              {statsDisplay.map((stat) => (
                <div key={stat.label} className="text-center min-w-0">
                  <div className="text-2xl md:text-3xl font-bold text-white leading-none truncate">
                    {stat.value}
                  </div>
                  <div className="text-[11px] sm:text-xs text-white/60 mt-1 truncate">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronRight className="w-5 h-5 text-white/40 rotate-90" />
        </motion.div>
      </section>

      {/* ============ CATEGORIES SECTION ============ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="secondary" className="mb-3">Phong cách chụp</Badge>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Mọi phong cách,{' '}
                <span className="text-gradient">mọi khoảnh khắc</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Từ street style đến concept photography — FLASHY có nhiếp ảnh gia cho mọi nhu cầu của bạn
              </p>
            </motion.div>
          </div>

          {/* Image Banner Category Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {CATEGORY_CARDS.map((cat, i) => (
              <motion.div
                key={cat.value}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <Link
                  href={`/photographers?category=${cat.value}`}
                  className="group block relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Background Image */}
                  <Image
                    src={cat.img}
                    alt={cat.label}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient} group-hover:opacity-90 transition-opacity duration-300`} />
                  {/* Text */}
                  <div className="absolute inset-0 flex flex-col justify-end p-3">
                    <span className="text-white font-bold text-sm leading-tight drop-shadow-md">{cat.label}</span>
                    <span className="text-white/70 text-[10px] mt-0.5 leading-tight">{cat.desc}</span>
                  </div>
                  {/* Hover arrow */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <ChevronRight className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Quick Filter Chips: Lucide icons, white pill cards, gradient active & mobile scroll */}
          <div className="mt-8">
            <div className="flex items-center justify-start sm:justify-center gap-2.5 overflow-x-auto no-scrollbar scrollbar-hide py-2 px-1 -mx-4 sm:mx-0 px-4 sm:px-0 scroll-smooth">
              {SUB_CATEGORY_CHIPS.map((cat) => {
                const Icon = cat.icon
                const isActive = activeSubCategory === cat.value
                return (
                  <Link
                    key={cat.value}
                    href={`/photographers?category=${cat.value}`}
                    onClick={() => {
                      setActiveSubCategory(isActive ? null : cat.value)
                    }}
                    className={`group flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white border-transparent shadow-md shadow-purple-500/25 ring-2 ring-purple-400/40'
                        : 'bg-white dark:bg-card text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-border/80 shadow-sm hover:border-violet-300 dark:hover:border-violet-500 hover:text-violet-700 dark:hover:text-violet-300 hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-violet-600 dark:text-violet-400'
                    }`} />
                    <span>{cat.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============ SERVICE PACKAGES SECTION ============ */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3">Gói dịch vụ</Badge>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Bắt đầu từ <span className="text-gradient">350.000đ</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Gói chụp linh hoạt phù hợp với mọi ngân sách và mục đích
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PACKAGES.map((pkg, i) => (
              <motion.div
                key={pkg.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/packages#${pkg.slug}`}>
                  <div className={`relative rounded-2xl overflow-hidden group cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-card-hover`}>
                    {/* Gradient header */}
                    <div className={`h-28 bg-gradient-to-br ${pkg.color} p-5 flex items-end`}>
                      <span className="text-3xl">{pkg.icon}</span>
                      {pkg.popular && (
                        <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
                          Phổ biến ✨
                        </span>
                      )}
                    </div>
                    {/* Content */}
                    <div className="bg-card border border-t-0 border-border/50 p-4 rounded-b-2xl">
                      <h3 className="font-bold text-base mb-1">{pkg.name}</h3>
                      <p className="text-2xl font-black text-primary mb-3">{pkg.price}</p>
                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {pkg.duration}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5" />
                          {pkg.photos}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" asChild size="lg">
              <Link href="/packages" className="gap-2">
                Xem chi tiết tất cả gói <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============ FEATURED PHOTOGRAPHERS ============ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-end justify-between mb-10">
            <div>
              <Badge variant="secondary" className="mb-3">Nhiếp ảnh gia</Badge>
              <h2 className="text-3xl md:text-4xl font-black">
                Được đánh giá cao nhất
              </h2>
            </div>
            <Button variant="ghost" asChild className="hidden md:flex gap-2">
              <Link href="/photographers">
                Xem tất cả <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Merge: hiển thị mock + real providers (mock trước nếu store chưa có data) */}
          {(() => {
            const storePhotographers = featuredPhotographers.slice(0, 4)
            // Ưu tiên storePhotographers nếu có, fallback sang mock
            const displayPhotographers = storePhotographers.length > 0
              ? storePhotographers
              : MOCK_HOMEPAGE_PHOTOGRAPHERS

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {displayPhotographers.map((photographer, i) => {
                  const portfolioPhotos = (photographer as any).portfolio as string[] | undefined
                  return (
                    <motion.div
                      key={photographer.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Link href={`/photographers/${photographer.slug}`}>
                        <div className="photographer-card group overflow-hidden rounded-2xl border border-border/60 hover:border-violet-300 hover:shadow-2xl transition-all duration-300 bg-card">

                          {/* Portfolio 2×2 Grid */}
                          {portfolioPhotos && portfolioPhotos.length >= 4 ? (
                            <div className="relative h-44 overflow-hidden">
                              <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5">
                                {portfolioPhotos.slice(0, 4).map((url: string, idx: number) => (
                                  <div key={idx} className="relative overflow-hidden">
                                    <Image
                                      src={url}
                                      alt={`Portfolio ${idx + 1}`}
                                      fill
                                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                                      sizes="150px"
                                    />
                                  </div>
                                ))}
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />
                              {/* Hover: xem portfolio */}
                              <div className="absolute inset-0 bg-violet-900/65 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <span className="text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/50 backdrop-blur-sm">
                                  👁 Xem {portfolioPhotos.length} ảnh portfolio
                                </span>
                              </div>
                              {/* Rating chip */}
                              <div className="absolute bottom-2 right-2 flex items-center gap-1 glass px-2 py-1 rounded-full">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="text-white text-xs font-bold">{formatRating(photographer.rating)}</span>
                                <span className="text-white/60 text-xs">({photographer.reviews})</span>
                              </div>
                              {/* Badges */}
                              <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                                {(photographer as any).is_sponsored && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-semibold">Nổi bật</span>
                                )}
                                {(photographer as any).badge && (
                                  <span className="px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-semibold">{(photographer as any).badge}</span>
                                )}
                              </div>
                            </div>
                          ) : (
                            /* Fallback: single cover image */
                            <div className="relative h-44 overflow-hidden">
                              <Image
                                src={(photographer as any).cover || ''}
                                alt={`Portfolio của ${photographer.name}`}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 photo-overlay" />
                              <div className="absolute bottom-2 right-2 flex items-center gap-1 glass px-2 py-1 rounded-full">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="text-white text-xs font-bold">
                                  {photographer.reviews > 0 ? formatRating(photographer.rating) : 'Mới'}
                                </span>
                                <span className="text-white/60 text-xs">({photographer.reviews})</span>
                              </div>
                              <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                                {(photographer as any).is_sponsored && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-semibold">Tài trợ</span>
                                )}
                                {(photographer as any).badge && (
                                  <span className="px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-semibold">{(photographer as any).badge}</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Card Info */}
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-9 h-9 ring-2 ring-white shadow-sm flex-shrink-0">
                                  <AvatarImage src={(photographer as any).avatar} />
                                  <AvatarFallback className="text-xs">{photographer.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="font-semibold text-sm truncate">{photographer.name}</span>
                                    {(photographer as any).is_verified && (
                                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{(photographer as any).location}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-3">
                              {((photographer as any).specialty as string).split(' · ').slice(0, 2).map((s: string) => (
                                <span key={s} className="text-[10px] font-medium bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded-md">{s}</span>
                              ))}
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-xs text-muted-foreground">Từ</span>
                                <span className="font-bold text-primary ml-1">{formatVND((photographer as any).starting_price)}</span>
                              </div>
                              <Button size="sm" className="h-7 px-3 text-xs bg-primary">
                                Đặt ngay
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            )
          })()}

          <div className="text-center mt-6 md:hidden">
            <Button variant="outline" asChild>
              <Link href="/photographers" className="gap-2">
                Xem tất cả nhiếp ảnh gia <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-3">Cách hoạt động</Badge>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Đặt lịch chụp trong{' '}
              <span className="text-gradient">4 bước đơn giản</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                className="relative text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                {/* Connector line */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent" />
                )}

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-brand mx-auto mb-4 flex items-center justify-center shadow-glow-purple">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-3xl font-black text-primary/20 mb-2">{step.step}</div>
                  <h3 className="font-bold text-base mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="xl" className="bg-brand text-white shadow-glow-purple" asChild>
              <Link href="/photographers" className="gap-2">
                Tìm thợ chụp ngay <Sparkles className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============ LOYALTY SECTION ============ */}
      <section className="py-20 bg-background overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="relative rounded-3xl bg-gradient-to-br from-violet-600 via-purple-700 to-pink-600 overflow-hidden p-8 sm:p-10 md:p-14 shadow-2xl">
            {/* Background pattern & ambient glows */}
            <div className="absolute inset-0 pointer-events-none opacity-25">
              <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-pink-400/40 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-violet-400/40 blur-3xl" />
              <div className="absolute top-1/2 right-1/4 w-56 h-56 rounded-full bg-amber-300/30 blur-2xl" />
              <div className="absolute top-8 right-12 w-28 h-28 rounded-full border border-white/10" />
            </div>

            <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
              <div>
                <Badge className="bg-white/20 text-white border-white/30 mb-4 backdrop-blur-xs">
                  <Award className="w-3.5 h-3.5 mr-1 text-amber-300" />
                  Flashy Coins & Đổi quà
                </Badge>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                  Tích điểm mỗi buổi chụp, đổi quà liền tay!
                </h2>
                <p className="text-white/80 mb-6 leading-relaxed text-sm md:text-base">
                  Kiếm Flashy Coins sau mỗi đơn hoàn thành. Đổi điểm lấy voucher giảm giá, cafe miễn phí, và nhiều ưu đãi độc quyền dành cho khách hàng thân thiết.
                </p>
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
                  {[
                    { tier: '🟤 Rookie', coins: '0–199 xu' },
                    { tier: '💜 Creator', coins: '200–499 xu' },
                    { tier: '⭐ Icon', coins: '500+ xu' },
                  ].map((tier) => (
                    <div key={tier.tier} className="bg-white/10 backdrop-blur-xs rounded-xl p-3 text-center border border-white/10 hover:bg-white/15 transition-colors">
                      <div className="font-semibold text-white text-xs sm:text-sm mb-1">{tier.tier}</div>
                      <div className="text-white/70 text-[11px] sm:text-xs">{tier.coins}</div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="lg" className="bg-white text-violet-700 hover:bg-white/90 font-bold shadow-lg" asChild>
                    <Link href="/register" className="gap-2">
                      Tham gia tích xu ngay <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <div className="text-white/75 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Tự động hoàn xu sau mỗi đơn hoàn tất
                  </div>
                </div>
              </div>

              {/* Right column: Graphic Mascot/Coins/Voucher + Loyalty Card */}
              <div className="relative mt-6 md:mt-0">
                {/* Floating Mascot / Coins / Voucher Illustration graphic in the top-right corner */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 15 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  animate={{
                    y: [-4, 6, -4],
                    rotate: [-1, 1.5, -1],
                  }}
                  transition={{
                    y: { repeat: Infinity, duration: 4.5, ease: "easeInOut" },
                    rotate: { repeat: Infinity, duration: 6, ease: "easeInOut" },
                  }}
                  className="absolute -top-12 -right-3 sm:-top-14 sm:-right-6 md:-top-16 md:-right-8 z-20 pointer-events-none"
                >
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden border-2 border-white/40 shadow-2xl ring-4 ring-white/10 bg-purple-900/60 backdrop-blur-sm group">
                    <Image
                      src="/flashy-coins-mascot.jpg"
                      alt="FLASHY Mascot - Coins & Voucher"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-950/50 via-transparent to-transparent" />
                  </div>
                  
                  {/* Floating Voucher Badge attached to Mascot */}
                  <div className="absolute -bottom-2 -left-4 bg-gradient-to-r from-amber-400 via-orange-400 to-pink-500 text-slate-950 font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-full shadow-xl flex items-center gap-1 border border-white/60 whitespace-nowrap animate-pulse">
                    <Ticket className="w-3 h-3 text-slate-950" />
                    VOUCHER 50K
                  </div>
                  
                  {/* Floating Gold Coin Badge */}
                  <div className="absolute -top-2 -left-2 bg-amber-400 text-slate-900 font-bold text-[9px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5 border border-amber-200">
                    <Coins className="w-2.5 h-2.5" /> +2% Xu
                  </div>
                </motion.div>

                {/* Loyalty Balance Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-white/20 shadow-xl relative z-10">
                  <div className="flex items-center gap-3 mb-4 pr-20 md:pr-24">
                    <div className="w-11 h-11 rounded-xl bg-amber-400/30 flex items-center justify-center shrink-0 border border-amber-300/40">
                      <Coins className="w-6 h-6 text-amber-300" />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">Ví xu FLASHY của bạn</div>
                      <div className="text-amber-200 text-xs font-medium">
                        {userCoins >= 500 ? 'Hạng: Icon ⭐ (Đặc quyền VIP)' : userCoins >= 200 ? 'Hạng: Creator 💜' : 'Hạng: Tân thủ 🟤'}
                      </div>
                    </div>
                  </div>

                  <div className="text-4xl font-black text-white mb-2 tracking-tight">
                    {userCoins} <span className="text-2xl font-bold text-amber-300">xu</span>
                  </div>

                  <div className="w-full bg-white/15 rounded-full h-2.5 mb-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full h-2.5 transition-all shadow-sm"
                      style={{ width: `${Math.min(100, Math.max(10, (userCoins / 500) * 100))}%` }}
                    />
                  </div>
                  <p className="text-white/80 text-xs">
                    {userCoins < 200
                      ? `Tích thêm ${200 - userCoins} xu để nâng cấp Creator 💜`
                      : userCoins < 500
                      ? `Tích thêm ${500 - userCoins} xu để đạt cấp Icon ⭐`
                      : 'Bạn đã đạt cấp độ Icon cao nhất ⭐'}
                  </p>

                  <div className="mt-5 space-y-2.5">
                    {[
                      { label: 'Hoàn xu sau mỗi đơn chụp', desc: '+2% giá trị đơn hoàn tất qua Escrow', value: '+2% Xu' },
                      { label: 'Đổi xu lấy voucher trừ trực tiếp', desc: '10 xu = 1.000đ trừ thẳng vào đơn', value: '10 xu = 1K' },
                      { label: 'Voucher ưu đãi tháng sinh nhật', desc: 'Giảm 20% gói chụp dành riêng cho thành viên', value: '-20%' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-2 border-t border-white/10">
                        <div>
                          <div className="text-white font-medium">{item.label}</div>
                          <div className="text-white/60 text-[11px]">{item.desc}</div>
                        </div>
                        <span className="text-amber-300 font-bold ml-2 shrink-0 bg-white/10 px-2 py-0.5 rounded border border-white/10">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3">Đánh giá từ khách hàng</Badge>
            <h2 className="text-3xl md:text-4xl font-black mb-3">
              Trải nghiệm thực tế tại FLASHY
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              100% đánh giá minh bạch được đối soát qua hệ thống nghiệm thu ảnh và ký quỹ Escrow bảo vệ khách hàng
            </p>
          </div>

          {/* Luôn đảm bảo hiển thị đúng 3 Card nằm ngang cân đối (lấy real review + bù mock review cho đủ 3) */}
          {(() => {
            const samplePhotos = [
              'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=600&fit=crop',
              'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=600&fit=crop',
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop',
            ]
            const combined: Array<{
              id: string
              name: string
              avatar: string
              rating: number
              date: string
              content: string
              photographer: string
              package: string
              productPhoto: string
            }> = realReviews.map((r, idx) => ({
              ...r,
              productPhoto: r.productPhoto || samplePhotos[idx % samplePhotos.length],
            }))

            for (const mock of MOCK_REVIEWS) {
              if (combined.length >= 3) break
              if (!combined.some(r => r.id === mock.id)) {
                combined.push(mock)
              }
            }
            const displayReviews = combined.slice(0, 3)

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displayReviews.map((review, i) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card border border-border/60 hover:border-violet-500/40 rounded-2xl p-5 shadow-sm hover:shadow-premium transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Customer Info & Star rating */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar className="w-10 h-10 border-2 border-violet-100 dark:border-violet-900/40 shrink-0">
                            <AvatarImage src={review.avatar} alt={review.name} />
                            <AvatarFallback>{review.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-foreground truncate flex items-center gap-1.5">
                              {review.name}
                              <span className="inline-flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-full border border-emerald-200/60">
                                <ShieldCheck className="w-2.5 h-2.5 mr-0.5" /> Xác thực
                              </span>
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate">
                              {review.date} · Gói {review.package}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-200/50">
                          {[...Array(review.rating)].map((_, j) => (
                            <Star key={j} className="w-3 h-3 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                      </div>

                      {/* Side-by-side Review Content + Completed Product Photo */}
                      <div className="flex gap-3.5 items-stretch my-3 bg-muted/20 dark:bg-muted/10 p-3 rounded-xl border border-border/40">
                        {/* Left: Review Text & Photographer info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed italic line-clamp-4">
                            &ldquo;{review.content}&rdquo;
                          </p>
                          <div className="mt-2 pt-2 border-t border-border/30 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Camera className="w-3 h-3 text-violet-500 shrink-0" />
                            <span className="truncate">Thợ: <strong className="text-foreground font-semibold">{review.photographer}</strong></span>
                          </div>
                        </div>

                        {/* Right: Finished Product Photo Thumbnail */}
                        <div
                          onClick={() => setPreviewPhoto({
                            src: review.productPhoto,
                            caption: `Ảnh hoàn thành buổi chụp của ${review.name} (${review.package})`,
                            photographer: review.photographer,
                          })}
                          className="relative w-24 h-28 sm:w-28 sm:h-32 rounded-lg overflow-hidden shrink-0 border border-border/70 shadow-xs group-hover:shadow-md transition-all cursor-pointer group/photo"
                          title="Bấm để xem ảnh phóng to"
                        >
                          <Image
                            src={review.productPhoto}
                            alt={`Sản phẩm thực tế buổi chụp của ${review.name}`}
                            fill
                            className="object-cover group-hover/photo:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 120px, 120px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90" />
                          <span className="absolute bottom-1.5 inset-x-1 text-center bg-black/60 backdrop-blur-xs text-white text-[9px] font-medium py-0.5 px-1 rounded flex items-center justify-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-amber-300 shrink-0" />
                            Ảnh nghiệm thu
                          </span>
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity">
                            <Maximize2 className="w-2.5 h-2.5" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer: Escrow Verified badge */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle className="w-3 h-3" /> Nghiệm thu Escrow 100%
                      </span>
                      <span className="text-[10px] text-muted-foreground/80">Ảnh thợ chụp cho khách</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          })()}
        </div>
      </section>

      {/* ============ BECOME PHOTOGRAPHER CTA ============ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">Dành cho nhiếp ảnh gia</Badge>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Biến đam mê thành{' '}
                <span className="text-gradient">thu nhập</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Tham gia cộng đồng nhiếp ảnh gia freelance tài năng. Thiết lập lịch theo ý bạn, nhận đơn hàng tự động, nhận thanh toán an toàn qua hệ thống escrow.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  'Phí sàn 15% cố định • Thợ nhận 85% thù lao',
                  'Thợ nhận 100% phụ phí Add-ons & di chuyển',
                  'Thanh toán an toàn qua ký quỹ Escrow 48h',
                  'Thưởng Star of the Quarter (0% phí sàn)',
                  'Hỗ trợ 24/7 từ đội ngũ FLASHY',
                ].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Button size="lg" className="bg-brand text-white shadow-glow-purple" asChild>
                  <Link href="/become-photographer">Đăng ký ngay</Link>
                </Button>
                <Button variant="ghost" size="lg" asChild>
                  <Link href="/how-it-works" className="gap-2">
                    <Play className="w-4 h-4" />
                    Xem demo
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-950/30 dark:to-pink-950/30 rounded-2xl p-6 border border-border">
                <div className="text-center mb-6">
                  <TrendingUp className="w-12 h-12 text-violet-500 mx-auto mb-3" />
                  <h3 className="font-bold text-xl mb-1">Thu nhập trung bình</h3>
                  <p className="text-muted-foreground text-sm">Nhiếp ảnh gia active trên FLASHY</p>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'FLASHY EXPRESS × 15/tháng', income: '~4.46M' },
                    { label: 'FLASHY CASUAL × 10/tháng', income: '~6.8M' },
                    { label: 'FLASHY PRO × 8/tháng', income: '~10.2M' },
                    { label: 'Mixed CP3 (Top Performer)', income: '~15M–25M' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-bold text-emerald-600">{item.income}đ</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  * Ước tính minh họa. Thu nhập thực tế phụ thuộc vào hiệu suất và số đơn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3">FAQ</Badge>
            <h2 className="text-3xl font-black">Câu hỏi thường gặp</h2>
          </div>
          <div className="space-y-3">
            {[
              {
                q: 'FLASHY có an toàn không?',
                a: 'Hoàn toàn an toàn! Tiền của bạn được giữ bởi hệ thống escrow và chỉ chuyển cho nhiếp ảnh gia sau khi bạn nhận và chấp nhận ảnh trong vòng 48 giờ.'
              },
              {
                q: 'Nếu nhiếp ảnh gia không đến thì sao?',
                a: 'Bạn có thể mở khiếu nại. Đội ngũ FLASHY sẽ xem xét và hoàn tiền 100% theo chính sách bảo vệ khách hàng.'
              },
              {
                q: 'Tôi có thể thêm dịch vụ sau khi đặt không?',
                a: 'Bạn có thể thảo luận với nhiếp ảnh gia qua chat để thêm dịch vụ bổ sung trước buổi chụp, tùy thuộc vào sự đồng ý của hai bên.'
              },
              {
                q: 'Bao lâu tôi nhận được ảnh?',
                a: 'Tùy gói: FLASHY EXPRESS trả ngay trong ngày (AirDrop/Drive), FLASHY CASUAL 3–5 ngày, FLASHY PRO 5–7 ngày, FLASHY SIGNATURE 7–10 ngày qua Cloud kể từ ngày chụp.'
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border/50 rounded-2xl p-5"
              >
                <h3 className="font-semibold mb-2 flex items-start gap-2">
                  <span className="text-primary mt-0.5">Q.</span>
                  {faq.q}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed pl-5">{faq.a}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link href="/faq">Xem tất cả câu hỏi</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="py-24 relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-brand opacity-10" />
        <div className="relative z-10 container mx-auto px-4 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-2xl bg-brand mx-auto mb-6 flex items-center justify-center shadow-glow-purple">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Sẵn sàng tạo nên<br />
              <span className="text-gradient">những bức ảnh đẹp?</span>
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
              {isClientLoaded && dynamicStats.photographersCount > 0
                ? `Hơn ${dynamicStats.photographersCount}+ nhiếp ảnh gia đã sẵn sàng phục vụ bạn ngay hôm nay`
                : 'Cộng đồng nhiếp ảnh gia freelance tài năng sẵn sàng phục vụ bạn ngay hôm nay'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" className="bg-brand text-white hover:opacity-90 shadow-glow-purple font-bold" asChild>
                <Link href="/photographers" className="gap-2">
                  Tìm thợ chụp ngay <Sparkles className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="border-2 border-violet-500/50 bg-slate-900/80 text-white font-bold backdrop-blur-sm shadow-sm transition-all duration-300 hover:border-amber-400 hover:bg-gradient-to-r hover:from-violet-600/30 hover:to-orange-500/30 hover:text-white hover:shadow-glow-purple"
                asChild
              >
                <Link href="/register">Tạo tài khoản miễn phí</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lightbox Preview Modal for Product Photos */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-slate-900 border border-white/20 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative aspect-[4/3] w-full bg-black">
              <Image
                src={previewPhoto.src}
                alt={previewPhoto.caption}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>
            <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-white/10">
              <div>
                <p className="font-semibold text-sm">{previewPhoto.caption}</p>
                <p className="text-xs text-white/60">Nhiếp ảnh gia: {previewPhoto.photographer}</p>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-auto shrink-0 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Nghiệm thu Escrow 100%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
