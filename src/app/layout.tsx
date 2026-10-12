import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { Providers } from '@/components/providers'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'FLASHY - Marketplace Nhiếp Ảnh Sáng Tạo',
    template: '%s | FLASHY',
  },
  description: 'Kết nối với nhiếp ảnh gia freelance tài năng. Đặt lịch chụp ảnh nhanh chóng, an toàn và sáng tạo tại Việt Nam.',
  keywords: ['nhiếp ảnh', 'chụp ảnh', 'photographer', 'booking', 'marketplace', 'Hồ Chí Minh', 'Việt Nam'],
  authors: [{ name: 'FLASHY Team' }],
  creator: 'FLASHY',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'FLASHY - Marketplace Nhiếp Ảnh Sáng Tạo',
    description: 'Kết nối với nhiếp ảnh gia freelance tài năng. Đặt lịch chụp ảnh nhanh chóng, an toàn và sáng tạo.',
    siteName: 'FLASHY',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FLASHY - Marketplace Nhiếp Ảnh Sáng Tạo',
    description: 'Kết nối với nhiếp ảnh gia freelance tài năng.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#7c3aed',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${beVietnamPro.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster
            position="top-center"
            richColors
            expand={true}
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily: 'Be Vietnam Pro, system-ui, sans-serif',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
