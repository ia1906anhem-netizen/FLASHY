import Link from 'next/link'
import { Camera, Sparkles, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      {/* Main footer */}
      <div className="container mx-auto px-4 max-w-7xl py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white">FLASHY</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Marketplace kết nối bạn với những nhiếp ảnh gia tài năng trên khắp Việt Nam. Đặt lịch nhanh, trải nghiệm đẹp.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-violet-600 flex items-center justify-center transition-colors duration-200 text-white">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-pink-600 flex items-center justify-center transition-colors duration-200 text-white">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-red-600 flex items-center justify-center transition-colors duration-200 text-white">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="text-white font-semibold mb-4">Marketplace</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/photographers', label: 'Tìm nhiếp ảnh gia' },
                { href: '/packages', label: 'Gói dịch vụ' },
                { href: '/how-it-works', label: 'Cách hoạt động' },
                { href: '/become-photographer', label: 'Trở thành Photographer' },
                { href: '/about', label: 'Về chúng tôi' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Pháp lý</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/privacy', label: 'Chính sách bảo mật' },
                { href: '/terms', label: 'Điều khoản sử dụng' },
                { href: '/marketplace-rules', label: 'Quy chế sàn TMĐT' },
                { href: '/faq', label: 'Câu hỏi thường gặp' },
                { href: '/contact', label: 'Liên hệ' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-slate-400">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <a href="mailto:support@flashy.vn" className="hover:text-white transition-colors">
                  support@flashy.vn
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-400">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>1800 xxxx (miễn phí)</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-400">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Quận 1, TP. Hồ Chí Minh</span>
              </li>
            </ul>
            <div className="mt-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Đăng ký kinh doanh
              </p>
              <p className="text-xs text-slate-400">
                Đang trong quá trình đăng ký với Bộ Công Thương
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 max-w-7xl py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} FLASHY. Bản quyền được bảo lưu.</p>
            <div className="flex items-center gap-4">
              <span>🇻🇳 Việt Nam</span>
              <span>·</span>
              <span>VND (₫)</span>
              <span>·</span>
              <span>Tiếng Việt</span>
            </div>
            <p className="text-center md:text-right">
              Phiên bản Demo – Không phát sinh giao dịch thật
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
