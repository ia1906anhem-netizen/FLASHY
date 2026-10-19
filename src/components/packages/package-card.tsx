'use client'

import React from 'react'
import Link from 'next/link'
import {
  Smartphone,
  Camera,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  Calendar,
  Layers,
  UserCheck,
  ShieldCheck,
  ArrowRight
} from 'lucide-react'
import { ServicePackage } from '@/types'
import { formatVND } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface PackageCardProps {
  pkg: ServicePackage
  index?: number
  isSelected?: boolean
  onSelect?: (pkg: ServicePackage) => void
  onBookNow?: (pkg: ServicePackage) => void
  actionHref?: string
  actionLabel?: string
  compact?: boolean
  className?: string
}

export function PackageCard({
  pkg,
  index = 0,
  isSelected = false,
  onSelect,
  onBookNow,
  actionHref,
  actionLabel = 'Đặt lịch gói này',
  compact = false,
  className = '',
}: PackageCardProps) {
  const isExpress = pkg.slug.includes('express')
  const isCasual = pkg.slug.includes('casual')
  const isPro = pkg.slug.includes('pro')
  const isSignature = pkg.slug.includes('signature')
  const isPopular = pkg.is_popular || isCasual

  // Device icon helper
  const renderDeviceIcon = () => {
    if (isExpress) return <Smartphone className="w-4 h-4 text-violet-600 flex-shrink-0" />
    if (isSignature) return <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
    return <Camera className="w-4 h-4 text-indigo-600 flex-shrink-0" />
  }

  // Tier tag color
  const getBadgeInfo = () => {
    if (isExpress) return { text: '⚡ Giao ảnh trong ngày', bg: 'bg-emerald-500 text-white' }
    if (isCasual) return { text: '🔥 Phổ biến nhất', bg: 'bg-violet-600 text-white' }
    if (isPro) return { text: '⭐ Đạt chuẩn Pro', bg: 'bg-indigo-600 text-white' }
    if (isSignature) return { text: '👑 Đã gồm Makeup & Tóc', bg: 'bg-gradient-to-r from-amber-500 to-rose-500 text-white' }
    return { text: `Gói ${index + 1}`, bg: 'bg-slate-800 text-white' }
  }

  const badge = getBadgeInfo()

  return (
    <Card
      onClick={() => onSelect?.(pkg)}
      className={`relative flex flex-col justify-between rounded-3xl overflow-hidden transition-all duration-300 ${
        isSelected
          ? 'border-2 border-violet-600 shadow-xl bg-white ring-4 ring-violet-100'
          : isPopular
          ? 'border-2 border-violet-500/80 shadow-lg bg-white hover:border-violet-600 hover:shadow-xl'
          : 'border border-slate-200 bg-white hover:border-violet-300 hover:shadow-md'
      } ${onSelect ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Top Banner Badge */}
      <div className={`absolute top-0 right-0 font-bold text-[11px] px-3.5 py-1 rounded-bl-2xl shadow-sm ${badge.bg}`}>
        {badge.text}
      </div>

      <CardContent className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="mb-4 pr-16">
            <span className="text-[11px] font-black uppercase tracking-wider text-violet-600 bg-violet-50 px-2.5 py-1 rounded-lg">
              GÓI {index + 1}
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-2 tracking-tight">
              {pkg.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {pkg.description}
            </p>
          </div>

          {/* Pricing */}
          <div className="mb-5 pb-5 border-b border-slate-100">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl md:text-3xl font-black text-violet-700 tracking-tight">
                {formatVND(pkg.base_price)}
              </span>
              <span className="text-xs font-semibold text-slate-400">/ buổi chụp</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
              Giá niêm yết minh bạch • Không phí ẩn
            </p>
          </div>

          {/* CP3 Specification Fields Grid */}
          <div className="space-y-3 text-xs mb-6">
            {/* 1. Thiết bị */}
            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="mt-0.5">{renderDeviceIcon()}</div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Thiết bị sử dụng
                </span>
                <p className="text-slate-800 font-semibold text-xs leading-snug">
                  {pkg.equipment || 'Thiết bị chụp chuyên nghiệp'}
                </p>
              </div>
            </div>

            {/* 2. Thời lượng & Phân khúc thợ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <Clock className="w-4 h-4 text-violet-500 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Thời lượng
                  </span>
                  <span className="font-bold text-slate-800 text-xs">
                    {pkg.duration_text || `${pkg.duration_minutes} phút`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <UserCheck className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Phân khúc thợ
                  </span>
                  <span className="font-bold text-slate-800 text-[11px] truncate block" title={pkg.photographer_tier}>
                    {pkg.photographer_tier || 'Nhiếp ảnh gia FLASHY'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Sản phẩm bàn giao */}
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-violet-50/50 border border-violet-100">
              <Layers className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-violet-600 block tracking-wider">
                  Sản phẩm bàn giao
                </span>
                <p className="text-slate-800 font-semibold text-xs leading-snug">
                  {pkg.deliverables || `${pkg.original_photos}+ file gốc, ${pkg.edited_photos} ảnh chỉnh màu`}
                </p>
              </div>
            </div>

            {/* 4. Hạn trả ảnh */}
            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <Calendar className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Hạn trả ảnh
                </span>
                <p className="text-emerald-700 font-bold text-xs leading-snug">
                  {pkg.delivery_time || `${pkg.delivery_days} ngày làm việc`}
                </p>
              </div>
            </div>

            {/* 5. Dịch vụ bao gồm */}
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50/40 border border-amber-100">
              <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-700 block tracking-wider">
                  Dịch vụ bao gồm
                </span>
                <p className="text-slate-700 text-[11px] leading-relaxed font-medium">
                  {pkg.service_includes || 'Hướng dẫn tạo dáng, di chuyển nội thành'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {actionHref ? (
            <Link href={actionHref} className="block w-full">
              <Button
                className={`w-full rounded-2xl font-bold text-xs h-12 shadow-sm transition-all ${
                  isPopular || isSignature
                    ? 'bg-brand text-white hover:opacity-90'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {actionLabel}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          ) : onBookNow ? (
            <Button
              onClick={() => onBookNow(pkg)}
              className={`w-full rounded-2xl font-bold text-xs h-12 shadow-sm transition-all ${
                isPopular || isSignature
                  ? 'bg-brand text-white hover:opacity-90'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {actionLabel}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : onSelect ? (
            <Button
              variant={isSelected ? 'default' : 'outline'}
              className={`w-full rounded-2xl font-bold text-xs h-11 ${
                isSelected ? 'bg-brand text-white' : 'border-violet-300 text-violet-700 hover:bg-violet-50'
              }`}
            >
              {isSelected ? '✓ Đang chọn gói này' : 'Chọn gói này'}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
