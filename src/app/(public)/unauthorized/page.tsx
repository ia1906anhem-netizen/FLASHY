import Link from 'next/link'
import { ShieldAlert, ArrowLeft, Home, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: '403 - Quyền truy cập bị từ chối | FLASHY',
  description: 'Bạn không có quyền truy cập vào trang này.',
}

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 shadow-inner">
          <ShieldAlert className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-100 px-3 py-1 rounded-full">
            403 • Quyền Truy Cập Bị Từ Chối (Forbidden)
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Khu Vực Bị Giới Hạn
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Tài khoản của bạn không có quyền truy cập vào đường dẫn này. Khách hàng không được phép truy cập vào trang Quản trị viên (Admin) hoặc Studio Nhiếp ảnh gia (Photographer).
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-800 space-y-1">
          <p className="font-bold">Gợi ý phân quyền:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li><strong>Khách hàng (Customer):</strong> Truy cập <Link href="/customer/dashboard" className="underline font-semibold">Dashboard Khách hàng</Link>.</li>
            <li><strong>Nhiếp ảnh gia (Photographer):</strong> Cần đăng nhập với tài khoản đối tác Studio.</li>
            <li><strong>Quản trị viên (Admin):</strong> Cần tài khoản quản trị hệ thống FLASHY.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/customer/dashboard" className="w-full sm:w-auto">
            <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md text-xs font-bold h-11">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Về Dashboard
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold h-11">
              <LogIn className="w-4 h-4 mr-1.5" />
              Đổi tài khoản
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold h-11">
              <Home className="w-4 h-4 mr-1.5" />
              Trang chủ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
