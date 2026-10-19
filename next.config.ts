import type { NextConfig } from 'next'

// Security headers áp dụng cho tất cả các route
const securityHeaders = [
  {
    // Chống Clickjacking: chỉ cho phép nhúng trong iframe từ cùng origin
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    // Ngăn trình duyệt đoán MIME type (MIME sniffing attack)
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // Kiểm soát thông tin Referer gửi đi: chỉ gửi origin khi cross-origin
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Kích hoạt bộ lọc XSS tích hợp của trình duyệt cũ
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    // Cho phép dùng các tính năng trình duyệt có kiểm soát
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  },
]

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Cấu hình HTTP Security Headers cho toàn bộ ứng dụng
  async headers() {
    return [
      {
        // Áp dụng cho tất cả các route (kể cả API routes)
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },

  images: {
    qualities: [25, 50, 75, 85, 90, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app'],
    },
  },
}

export default nextConfig
