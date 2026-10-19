'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle, ShieldCheck, Sparkles } from 'lucide-react'

export default function FaqPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  const faqs = [
    {
      q: 'FLASHY là gì và hoạt động như thế nào?',
      a: 'FLASHY là nền tảng thương mại điện tử kết nối khách hàng với các nhiếp ảnh gia tự do uy tín tại Việt Nam. Bạn có thể tìm thợ quanh khu vực, xem portfolio thực tế, đặt lịch với mức giá niêm yết rõ ràng từ 79.000đ và nhận toàn bộ ảnh qua đám mây riêng tư.'
    },
    {
      q: 'Tiền cọc của tôi có an toàn không nếu thợ không đến?',
      a: 'Hoàn toàn an toàn! FLASHY sử dụng cơ chế giữ tiền Escrow 48 giờ. Số tiền bạn thanh toán được giữ an toàn và không chuyển cho thợ trước buổi chụp. Nếu thợ hủy lịch hoặc không đến điểm hẹn, bạn được hoàn lại 100% tiền cọc ngay lập tức.'
    },
    {
      q: 'Tôi nhận được bao nhiêu ảnh sau buổi chụp?',
      a: 'Tùy thuộc vào gói dịch vụ bạn chọn: Gói FLASHY EXPRESS nhận toàn bộ ảnh gốc (~30 ảnh) + 5 ảnh chỉnh màu nghệ thuật. Gói FLASHY CASUAL nhận toàn bộ ảnh gốc (~100 ảnh) + 15 ảnh chỉnh màu + 5 ảnh retouch chân dung. Bạn có thể chọn thêm ảnh retouch theo nhu cầu.'
    },
    {
      q: 'Thời gian nhận ảnh sau buổi chụp là bao lâu?',
      a: 'Ảnh được bàn giao qua hệ thống đám mây FLASHY trong vòng từ 2 đến 5 ngày tùy gói. Nếu bạn có nhu cầu nhận ảnh gấp trong 24 giờ, có thể chọn thêm dịch vụ add-on "Giao ảnh hỏa tốc".'
    },
    {
      q: 'Flashy Coins là gì và làm sao để tích lũy?',
      a: 'Flashy Coins là điểm thưởng dành cho khách hàng thân thiết. Mỗi đơn đặt lịch hoàn tất thành công, bạn sẽ nhận được 2% giá trị đơn hàng quy đổi thành xu. Xu có thể dùng để đổi voucher giảm giá chụp ảnh hoặc e-voucher cà phê từ các đối tác liên kết.'
    },
    {
      q: 'Làm thế nào để trở thành nhiếp ảnh gia đối tác của FLASHY?',
      a: 'Bạn chỉ cần nhấn vào nút "Trở thành thợ chụp", điền thông tin cá nhân, tải lên các tác phẩm portfolio và gửi hồ sơ xác minh danh tính (KYC). Đội ngũ FLASHY sẽ duyệt hồ sơ trong vòng 24 giờ. Chính sách hoa hồng cố định 15% minh bạch, thợ nhận 85% giá gói và 100% phụ phí Add-ons / di chuyển!'
    },
    {
      q: 'Nếu tôi không ưng ý với ảnh chụp thì sao?',
      a: 'Sau khi nhận ảnh, bạn có 48 giờ để kiểm tra. Trong thời gian này, bạn có thể gửi yêu cầu chỉnh sửa lại màu sắc/retouch hoặc mở khiếu nại nếu dịch vụ không đúng cam kết ban đầu. Ban quản trị FLASHY sẽ vào cuộc hỗ trợ bảo vệ quyền lợi của bạn.'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-violet-600 uppercase tracking-wider bg-violet-50 px-3 py-1 rounded-full">
            Giải Đáp Thắc Mắc
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mt-3 mb-4">
            Câu Hỏi Thường Gặp (FAQ)
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Tổng hợp mọi thông tin quan trọng về quy trình đặt lịch, thanh toán ký quỹ Escrow và bàn giao ảnh tại FLASHY.
          </p>
        </div>

        <div className="space-y-3 mb-12">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm hover:text-violet-600 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center text-xs font-black flex-shrink-0">
                      {idx + 1}
                    </span>
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180 text-violet-600' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
