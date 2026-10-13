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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PHOTOGRAPHY_CATEGORIES } from '@/lib/constants'
import { CityLocationPicker } from '@/components/shared/city-location-picker'
import { formatVND } from '@/lib/utils'
import {
  getApprovedProviders,
  getStoredBookings,
  calculateDynamicStats,
  type ApprovedProvider,
  type DynamicStats,
} from '@/lib/data/booking-store'

// Local helper – formats a rating float to one decimal (e.g. 4.90 → "4.9")
function formatRating(v: number): string {
  return Number.isInteger(v) ? v.toFixed(1) : v.toString()
}

const PACKAGES = [
  {
    slug: 'flash-shot',
    name: 'Flash Shot ⚡',
    price: '79K–99K',
    duration: '15–20 phút',
    photos: '3–5 ảnh đã chỉnh',
    color: 'from-violet-500 to-purple-600',
    icon: '⚡',
    popular: false,
  },
  {
    slug: 'quick-date',
    name: 'Quick Date ☕',
    price: '150K–300K',
    duration: '30–60 phút',
    photos: '15 ảnh đã chỉnh',
    color: 'from-pink-500 to-rose-600',
    icon: '☕',
    popular: true,
  },
  {
    slug: 'vibe-sai-gon',
    name: 'Vibe Sài Gòn 🌆',
    price: '400K–700K',
    duration: '2–3 giờ',
    photos: '40 ảnh + 10 retouch',
    color: 'from-orange-500 to-amber-600',
    icon: '🌆',
    popular: false,
  },
  {
    slug: 'outdoor',
    name: 'Outdoor / Dã ngoại 🏔️',
    price: '800K–1.5M',
    duration: 'Nửa ngày',
    photos: '60 ảnh + 20 retouch',
    color: 'from-emerald-500 to-teal-600',
    icon: '🏔️',
    popular: false,
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
  }>>([])
  const [userCoins, setUserCoins] = useState<number>(0)
  const [isClientLoaded, setIsClientLoaded] = useState(false)

  useEffect(() => {
    const refreshData = () => {
      setDynamicStats(calculateDynamicStats())
      setFeaturedPhotographers(getApprovedProviders())
      
      // Load real customer reviews from completed bookings
      const bookings = getStoredBookings()
      const reviewed = bookings.filter(
        (b) => b.review && typeof b.review.rating === 'number' && b.review.rating > 0
      )
      const mapped = reviewed.map((b) => ({
        id: b.id,
        name: b.customer_name || 'Khách hàng',
        avatar: b.photographer_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop',
        rating: b.review?.rating || 5,
        date: b.review?.created_at
          ? new Date(b.review.created_at).toLocaleDateString('vi-VN')
          : 'Gần đây',
        content: b.review?.comment || 'Dịch vụ chụp ảnh chuyên nghiệp và chu đáo.',
        photographer: b.photographer_name,
        package: b.package_name,
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
    window.location.href = `/photographers?${params.toString()}`
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
      <section className="relative min-h-screen flex items-center justify-center">
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
                <span className="text-white/70 font-bold flex items-center gap-1 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-pink-400" />
                  Khu vực nhanh:
                </span>
                {['Tất cả', 'TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Đà Lạt', 'Quận 1', 'Quận 3'].map((dist) => (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => {
                      setSearchLocation(dist === 'Tất cả' ? '' : dist)
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {PHOTOGRAPHY_CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.value}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/photographers?category=${cat.value}`}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 hover:shadow-premium transition-all duration-300 group text-center"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                    {cat.icon}
                  </span>
                  <span className="text-xs font-medium text-foreground/80 group-hover:text-primary">
                    {cat.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SERVICE PACKAGES SECTION ============ */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3">Gói dịch vụ</Badge>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Bắt đầu từ <span className="text-gradient">79,000đ</span>
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
                      <p className="text-2xl font-black text-primary mb-3">{pkg.price}<span className="text-sm font-normal text-muted-foreground">đ</span></p>
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

          {featuredPhotographers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-dashed border-border/80 bg-card/60 backdrop-blur-sm p-10 md:p-14 text-center max-w-2xl mx-auto shadow-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Chưa có nhiếp ảnh gia nào được duyệt KYC
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-md mx-auto">
                FLASHY áp dụng chính sách kiểm duyệt danh tính và portfolio nghiêm ngặt để đảm bảo an toàn tuyệt đối cho khách hàng. Hệ thống sẽ tự động hiển thị danh sách ngay khi hồ sơ nhiếp ảnh gia được quản trị viên phê duyệt.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button size="lg" className="bg-brand text-white shadow-glow-purple font-bold w-full sm:w-auto" asChild>
                  <Link href="/become-photographer">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Trở thành thợ chụp & Nộp KYC
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                  <Link href="/photographers">Xem toàn bộ danh mục thợ ảnh</Link>
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredPhotographers.map((photographer, i) => (
                <motion.div
                  key={photographer.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/photographers/${photographer.slug}`}>
                    <div className="photographer-card group">
                      {/* Cover image */}
                      <div className="relative h-44 overflow-hidden">
                        <Image
                          src={photographer.cover}
                          alt={`Portfolio của ${photographer.name}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 photo-overlay" />

                        {/* Labels */}
                        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                          {photographer.is_sponsored && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-semibold">
                              Tài trợ
                            </span>
                          )}
                          {photographer.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-semibold">
                              {photographer.badge}
                            </span>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 glass px-2 py-1 rounded-full">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-white text-xs font-bold">
                            {photographer.reviews > 0 ? formatRating(photographer.rating) : 'Mới'}
                          </span>
                          <span className="text-white/60 text-xs">({photographer.reviews})</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-9 h-9 ring-2 ring-white shadow-sm">
                              <AvatarImage src={photographer.avatar} />
                              <AvatarFallback className="text-xs">{photographer.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-sm">{photographer.name}</span>
                                {photographer.is_verified && (
                                  <Shield className="w-3.5 h-3.5 text-violet-500 fill-violet-100" />
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {photographer.location}
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground mb-3">{photographer.specialty}</p>

                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs text-muted-foreground">Từ</span>
                            <span className="font-bold text-primary ml-1">{formatVND(photographer.starting_price)}</span>
                          </div>
                          <Button size="sm" className="h-7 px-3 text-xs bg-primary">
                            Đặt ngay
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

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
          <div className="relative rounded-3xl bg-gradient-to-br from-violet-600 via-purple-700 to-pink-600 overflow-hidden p-10 md:p-16">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-64 h-64 rounded-full bg-white/20" />
              <div className="absolute bottom-4 left-4 w-48 h-48 rounded-full bg-white/10" />
            </div>

            <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
              <div>
                <Badge className="bg-white/20 text-white border-white/30 mb-4">
                  <Award className="w-3 h-3 mr-1" />
                  Flashy Coins
                </Badge>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                  Tích điểm mỗi buổi chụp, đổi quà liền tay!
                </h2>
                <p className="text-white/80 mb-6 leading-relaxed">
                  Kiếm Flashy Coins sau mỗi đơn hoàn thành. Đổi điểm lấy voucher giảm giá, cafe miễn phí, và nhiều ưu đãi hấp dẫn.
                </p>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { tier: '🟤 Rookie', coins: '0–199 xu' },
                    { tier: '💜 Creator', coins: '200–499 xu' },
                    { tier: '⭐ Icon', coins: '500+ xu' },
                  ].map((tier) => (
                    <div key={tier.tier} className="bg-white/10 rounded-xl p-3 text-center">
                      <div className="font-semibold text-white text-sm mb-1">{tier.tier}</div>
                      <div className="text-white/60 text-xs">{tier.coins}</div>
                    </div>
                  ))}
                </div>
                <Button size="lg" className="bg-white text-violet-700 hover:bg-white/90 font-bold" asChild>
                  <Link href="/register" className="gap-2">
                    Tham gia miễn phí <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
              <div className="hidden md:block">
                <div className="relative">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/30 flex items-center justify-center">
                        <Award className="w-5 h-5 text-amber-300" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">Số dư xu tích lũy</div>
                        <div className="text-white/70 text-xs">
                          {userCoins >= 500 ? 'Hạng: Icon ⭐' : userCoins >= 200 ? 'Hạng: Creator 💜' : 'Hạng: Tân thủ 🟤'}
                        </div>
                      </div>
                    </div>
                    <div className="text-4xl font-black text-white mb-2">{userCoins} xu</div>
                    <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                      <div
                        className="bg-amber-400 rounded-full h-2 transition-all"
                        style={{ width: `${Math.min(100, Math.max(10, (userCoins / 500) * 100))}%` }}
                      />
                    </div>
                    <p className="text-white/70 text-xs">
                      {userCoins < 200
                        ? `Tích thêm ${200 - userCoins} xu để nâng cấp Creator 💜`
                        : userCoins < 500
                        ? `Tích thêm ${500 - userCoins} xu để đạt cấp Icon ⭐`
                        : 'Bạn đã đạt cấp độ Icon cao nhất ⭐'}
                    </p>
                    <div className="mt-4 space-y-2">
                      {[
                        { label: 'Hoàn xu sau mỗi đơn chụp', desc: '+2% giá trị đơn hoàn tất', value: '+2%' },
                        { label: 'Đổi xu lấy voucher', desc: '10 xu = 1.000đ trừ trực tiếp', value: '1:100' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-2 border-t border-white/10">
                          <div>
                            <div className="text-white font-medium">{item.label}</div>
                            <div className="text-white/50 text-[11px]">{item.desc}</div>
                          </div>
                          <span className="text-amber-300 font-bold">{item.value}</span>
                        </div>
                      ))}
                    </div>
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
              100% đánh giá minh bạch được đối soát qua hệ thống nghiệm thu ảnh và ký quỹ Escrow
            </p>
          </div>

          {realReviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-dashed border-border/80 bg-card/60 backdrop-blur-sm p-10 md:p-14 text-center max-w-2xl mx-auto shadow-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Star className="w-7 h-7 fill-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Chưa có đánh giá nào được gửi (Clean Slate)
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-md mx-auto">
                Hệ thống ở trạng thái mới hoàn toàn. Đánh giá thực tế từ khách hàng sẽ tự động xuất hiện ngay sau khi buổi chụp ảnh hoàn tất và ảnh được nghiệm thu thành công.
              </p>
              <Button size="lg" className="bg-brand text-white shadow-glow-purple font-bold" asChild>
                <Link href="/photographers">
                  <Camera className="w-4 h-4 mr-2" />
                  Khám phá dịch vụ & Trải nghiệm ngay
                </Link>
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {realReviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-premium transition-shadow duration-300"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/80 mb-4">&ldquo;{review.content}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={review.avatar} />
                      <AvatarFallback>{review.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-sm">{review.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Gói {review.package} · {review.date}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
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
                  '3 đơn đầu tiên: 0% hoa hồng',
                  'Thanh toán an toàn qua escrow',
                  'Huy chương & thưởng theo hiệu suất',
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
                    { label: 'Flash Shot × 10/tháng', income: '~790K–990K' },
                    { label: 'Quick Date × 15/tháng', income: '~2.2M–4.5M' },
                    { label: 'Vibe Sài Gòn × 8/tháng', income: '~3.2M–5.6M' },
                    { label: 'Mixed (Top Performer)', income: '~8M–15M' },
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
                a: 'Tùy gói: Flash Shot 2 ngày, Quick Date 3 ngày, Vibe Sài Gòn 5 ngày, Outdoor 7 ngày kể từ ngày chụp.'
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
              <Button size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                <Link href="/register">Tạo tài khoản miễn phí</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
