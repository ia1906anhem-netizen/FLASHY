import { FileText, AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Điều Khoản Dịch Vụ | FLASHY',
  description: 'Điều khoản dịch vụ và thỏa thuận sử dụng nền tảng FLASHY.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm">
          
          <div className="flex items-center gap-2 text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">
            <FileText className="w-4 h-4" />
            Thỏa thuận người dùng
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
            Điều Khoản Dịch Vụ Nền Tảng FLASHY
          </h1>
          
          <p className="text-xs text-slate-500 mb-8 pb-6 border-b border-slate-100">
            Có hiệu lực từ tháng 03/2026 • Áp dụng cho cả khách hàng và nhiếp ảnh gia tự do.
          </p>

          <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-6 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">1. Định Nghĩa & Phạm Vi</h2>
              <p>
                FLASHY là sàn giao dịch thương mại điện tử cung cấp dịch vụ kết nối giữa Khách hàng (người có nhu cầu chụp ảnh) và Nhiếp ảnh gia tự do (người cung cấp dịch vụ chụp ảnh và chỉnh sửa ảnh). FLASHY không trực tiếp sở hữu thiết bị hoặc cung cấp dịch vụ chụp ảnh dưới tư cách người sử dụng lao động.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">2. Quy Định Đặt Lịch & Thanh Toán Ký Quỹ (Escrow)</h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li>Khi đặt lịch, khách hàng đồng ý thanh toán số tiền cọc hoặc toàn bộ giá trị gói thông qua cổng thanh toán được tích hợp.</li>
                <li>Khoản tiền thanh toán sẽ được hệ thống giữ lại trong trạng thái ký quỹ (Escrow) và không được giải ngân ngay lập tức cho thợ chụp.</li>
                <li>Sau khi thợ chụp bàn giao đủ ảnh, khách hàng có 48 giờ để kiểm tra ảnh. Nếu khách hàng bấm "Duyệt ảnh" hoặc hết thời hạn 48 giờ mà không có khiếu nại hợp lệ, khoản thanh toán sẽ được giải ngân cho thợ chụp sau khi trừ phí hoa hồng nền tảng.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">3. Chính Sách Hủy Lịch & Hoàn Tiền</h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li><strong>Hủy trước thời hạn quy định của gói (từ 4h - 48h tùy gói):</strong> Hoàn lại 100% tiền cọc cho khách hàng.</li>
                <li><strong>Hủy muộn hoặc vắng mặt không lý do chính đáng:</strong> Tiền cọc sẽ được chuyển bồi hoàn chi phí chuẩn bị và thời gian cho bên bị ảnh hưởng.</li>
                <li><strong>Trường hợp bất khả kháng (thời tiết mưa bão, sự cố y tế):</strong> Hai bên có thể thỏa thuận dời lịch chụp mà không mất phí.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">4. Bản Quyền Hình Ảnh & Sử Dụng Tác Phẩm</h2>
              <p>
                Khách hàng nhận được quyền sử dụng cá nhân không giới hạn đối với tất cả ảnh đã nhận. Nhiếp ảnh gia được quyền sử dụng ảnh chụp cho mục đích xây dựng portfolio nghệ thuật cá nhân trừ khi khách hàng yêu cầu giữ kín riêng tư tại thời điểm đặt lịch.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">5. Hành Vi Bị Nghiêm Cấm</h2>
              <p>Người dùng không được phép:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li>Lợi dụng nền tảng để giao dịch chui ngoài sàn nhằm trốn tránh cơ chế bảo vệ thanh toán.</li>
                <li>Đăng tải hình ảnh đồi trụy, vi phạm thuần phong mỹ tục hoặc xâm phạm quyền hình ảnh của bên thứ ba.</li>
                <li>Gian lận đánh giá sao hoặc tạo đơn hàng ảo.</li>
              </ul>
            </section>
          </div>

        </div>
      </div>
    </div>
  )
}
