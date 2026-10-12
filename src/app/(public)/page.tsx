'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Search,
  MapPin,
  Star,
  Shield,
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
import { formatVND, formatRating } from '@/lib/utils'
import { PHOTOGRAPHY_CATEGORIES } from '@/lib/constants'

// ---- Demo Data (clearly labeled as demonstration content) ----
const DEMO_PHOTOGRAPHERS = [
  {
    id: '1',
    name: 'Minh Tú Nguyễn',
    slug: 'minh-tu-nguyen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    cover: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=280&fit=crop',
    location: 'Quận 1, TP.HCM',
    specialty: 'Lifestyle · Couple',
    rating: 4.9,
    reviews: 127,
    starting_price: 150000,
    is_verified: true,
    is_sponsored: true,
    badge: '⭐ Star of Q4',
  },
  {
    id: '2',
    name: 'Linh Chi Phạm',
    slug: 'linh-chi-pham',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
    cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=280&fit=crop',
    location: 'Quận 3, TP.HCM',
    specialty: 'Portrait · Concept',
    rating: 4.8,
    reviews: 89,
    starting_price: 99000,
    is_verified: true,
    is_sponsored: false,
    badge: null,
  },
  {
    id: '3',
    name: 'Hoàng Anh Trần',
    slug: 'hoang-anh-tran',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    cover: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=280&fit=crop',
    location: 'Bình Thạnh, TP.HCM',
    specialty: 'Outdoor · Travel',
    rating: 4.95,
    reviews: 234,
    starting_price: 400000,
    is_verified: true,
    is_sponsored: false,
    badge: '🥇 Golden Badge',
  },
  {
    id: '4',
    name: 'Kim Ngọc Lê',
    slug: 'kim-ngoc-le',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    cover: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=400&h=280&fit=crop',
    location: 'Quận 7, TP.HCM',
    specialty: 'Wedding · Áo dài',
    rating: 4.85,
    reviews: 156,
    starting_price: 79000,
    is_verified: true,
    is_sponsored: true,
    badge: null,
  },
]

const DEMO_REVIEWS = [
  {
    id: '1',
    name: 'Phương Anh Nguyễn',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=60&h=60&fit=crop',
    rating: 5,
    date: 'Tháng 11, 2026',
    content: 'Trải nghiệm tuyệt vời! Nhiếp ảnh gia rất chuyên nghiệp, ảnh đẹp hơn mong đợi nhiều. Sẽ đặt lịch lại cho lần sau.',
    photographer: 'Minh Tú Nguyễn',
    package: 'Quick Date',
  },
  {
    id: '2',
    name: 'Tuấn Khải Lê',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop',
    rating: 5,
    date: 'Tháng 10, 2026',
    content: 'Ảnh kỷ yếu của tụi mình siêu xịn nhờ anh Hoàng Anh! Giao ảnh đúng hẹn, chỉnh sửa đẹp, giá hợp lý.',
    photographer: 'Hoàng Anh Trần',
    package: 'Vibe Sài Gòn',
  },
  {
    id: '3',
    name: 'Bảo Châu Trần',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop',
    rating: 5,
    date: 'Tháng 10, 2026',
    content: 'Flash Shot 79K mà ảnh ra chất không kém gì studio đắt tiền. Booking qua app siêu tiện, thanh toán an toàn.',
    photographer: 'Kim Ngọc Lê',
    package: 'Flash Shot',
  },
]

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

const STATS = [
  { value: '2,000+', label: 'Nhiếp ảnh gia', icon: Camera },
  { value: '50,000+', label: 'Buổi chụp', icon: Zap },
  { value: '4.9★', label: 'Đánh giá TB', icon: Star },
  { value: '98%', label: 'Khách hài lòng', icon: Users },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchLocation, setSearchLocation] = useState('Hồ Chí Minh')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (searchLocation) params.set('city', searchLocation)
    window.location.href = `/photographers?${params.toString()}`
  }

  return (
    <div className="w-full">
      {/* ============ HERO SECTION ============ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
              Kết nối với hơn <strong className="text-white">2,000+</strong> nhiếp ảnh gia freelance tài năng.
              Đặt lịch nhanh, thanh toán an toàn, nhận ảnh đẹp.
            </p>

            {/* Search bar */}
            <motion.div
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <form onSubmit={handleSearch}>
                <div className="flex flex-col sm:flex-row gap-3 glass rounded-2xl p-3">
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
                  <div className="flex items-center gap-2 sm:w-48 bg-white/10 rounded-xl px-4 py-2">
                    <MapPin className="w-4 h-4 text-white/60 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Thành phố"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="flex-1 bg-transparent text-white placeholder:text-white/50 outline-none text-sm w-full"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-brand text-white hover:opacity-90 shadow-glow-purple font-bold px-6 sm:w-auto w-full"
                  >
                    Tìm ngay
                  </Button>
                </div>
              </form>

              {/* Popular categories */}
              <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
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
            <div className="grid grid-cols-4 gap-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl md:text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-white/60">{stat.label}</div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DEMO_PHOTOGRAPHERS.map((photographer, i) => (
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
                        <span className="text-white text-xs font-bold">{formatRating(photographer.rating)}</span>
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
                        <div className="text-white font-semibold">Số dư xu của bạn</div>
                        <div className="text-white/60 text-sm">Cấp độ: Creator 💜</div>
                      </div>
                    </div>
                    <div className="text-4xl font-black text-white mb-2">350 xu</div>
                    <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                      <div className="bg-amber-400 rounded-full h-2" style={{ width: '70%' }} />
                    </div>
                    <p className="text-white/60 text-sm">Còn 150 xu nữa để đạt cấp Icon ⭐</p>
                    <div className="mt-4 space-y-2">
                      {[
                        { label: 'Quick Date với Minh Tú', coins: '+30 xu', time: '2 ngày trước' },
                        { label: 'Đổi voucher cafe', coins: '-50 xu', time: '1 tuần trước' },
                      ].map((tx, i) => (
                        <div key={i} className="flex items-center justify-between text-sm py-2 border-t border-white/10">
                          <div>
                            <div className="text-white font-medium">{tx.label}</div>
                            <div className="text-white/40 text-xs">{tx.time}</div>
                          </div>
                          <span className={tx.coins.startsWith('+') ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                            {tx.coins}
                          </span>
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
              Khách hàng nói gì về FLASHY?
            </h2>
            <p className="text-muted-foreground text-sm">
              * Các đánh giá dưới đây là nội dung demo minh họa, không phải đánh giá thực tế
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {DEMO_REVIEWS.map((review, i) => (
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
                Tham gia cộng đồng 2,000+ nhiếp ảnh gia freelance. Thiết lập lịch theo ý bạn, nhận đơn hàng tự động, nhận thanh toán an toàn qua hệ thống escrow.
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
              Hơn 2,000 nhiếp ảnh gia đang sẵn sàng phục vụ bạn ngay hôm nay
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
