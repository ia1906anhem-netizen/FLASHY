import Link from 'next/link'
import Image from 'next/image'
import { Camera, Heart, Shield, Sparkles, Users, Award, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Về Chúng Tôi | FLASHY',
  description: 'Câu chuyện hình thành và sứ mệnh cách mạng hóa ngành nhiếp ảnh dịch vụ của FLASHY.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-violet-600 uppercase tracking-wider bg-violet-50 px-3 py-1 rounded-full">
            Sứ Mệnh FLASHY
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mt-3 mb-4">
            Mang Nghệ Thuật Nhiếp Ảnh Đến Gần Mọi Người
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Chúng tôi tin rằng việc lưu giữ những khoảnh khắc đẹp trong cuộc sống không nên bị rào cản bởi mức giá đắt đỏ hay sự bất an khi đặt lịch trực tuyến.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <h2 className="text-2xl font-black text-slate-900">Câu Chuyện Ra Đời</h2>
              <p>
                FLASHY khởi nguồn từ một quan sát đơn giản tại TP. Hồ Chí Minh: Rất nhiều bạn trẻ, cặp đôi, nhóm bạn muốn có những bức ảnh dạo phố, cà phê hoặc kỷ yếu thật đẹp nhưng các studio truyền thống thường tính giá hàng triệu đồng cho những buổi chụp phức tạp.
              </p>
              <p>
                Mặt khác, hàng nghìn bạn trẻ đam mê nhiếp ảnh với tay nghề xuất sắc và máy ảnh xịn xò lại gặp khó khăn trong việc tìm kiếm khách hàng ổn định, thường xuyên lo lắng về việc bị quỵt tiền cọc hoặc bị bùng lịch vào phút chót.
              </p>
              <p className="font-semibold text-violet-700">
                FLASHY ra đời như một chiếc cầu nối an toàn, minh bạch và hiện đại — nơi bất kỳ ai cũng có thể book được thợ chụp có tâm chỉ với từ 79.000đ.
              </p>
            </div>

            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-md">
              <Image
                src="/hero-bg.jpg"
                alt="Đội ngũ FLASHY"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* 4 Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Tận Tâm & Trẻ Trung</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tạo ra những trải nghiệm chụp ảnh thoải mái, thân thiện, như đi chơi cùng một người bạn biết chụp hình.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Minh Bạch & An Toàn</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mọi giao dịch đều qua cơ chế giữ tiền Escrow 48h. Thợ chụp được xác minh danh tính và kiểm định tay nghề.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Chất Lượng Vượt Trội</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cam kết trả toàn bộ ảnh gốc và ảnh chỉnh màu đúng hạn, lưu trữ đám mây riêng tư tốc độ cao.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
