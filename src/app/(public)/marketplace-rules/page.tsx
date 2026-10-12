import { BookOpen, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Quy Chế Hoạt Động Sàn Thương Mại Điện Tử | FLASHY',
  description: 'Quy chế hoạt động sàn giao dịch thương mại điện tử FLASHY tuân thủ Nghị định 52/2013/NĐ-CP và Nghị định 85/2021/NĐ-CP.',
}

export default function MarketplaceRulesPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm">
          
          <div className="flex items-center gap-2 text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">
            <BookOpen className="w-4 h-4" />
            Quy chế sàn thương mại điện tử
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
            Quy Chế Hoạt Động Sàn Giao Dịch FLASHY
          </h1>
          
          <p className="text-xs text-slate-500 mb-8 pb-6 border-b border-slate-100">
            Căn cứ Nghị định số 52/2013/NĐ-CP, Nghị định số 85/2021/NĐ-CP của Chính phủ về thương mại điện tử và các quy chuẩn áp dụng.
          </p>

          <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-6 leading-relaxed">
            
            {/* Ministry of Industry and trade notice box */}
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-800 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Thông báo tuân thủ quy chuẩn Bộ Công Thương
              </div>
              <p className="text-amber-900 leading-relaxed">
                FLASHY là nền tảng đang trong giai đoạn thử nghiệm có kiểm soát (Sandbox). Hệ thống được thiết kế đầy đủ các phân hệ quản lý người bán, quy trình đăng ký, xử lý khiếu nại và công khai thông tin nhà cung cấp theo chuẩn sàn TMĐT. Nền tảng sẽ nộp hồ sơ thông báo/đăng ký website cung cấp dịch vụ thương mại điện tử tại Cổng thông tin Quản lý hoạt động thương mại điện tử (<a href="http://online.gov.vn" target="_blank" rel="noopener noreferrer" className="underline font-bold">online.gov.vn</a>) trước khi chính thức mở rộng thương mại công khai.
              </p>
            </div>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">1. Nguyên Tắc Hoạt Động</h2>
              <p>
                Sàn giao dịch FLASHY hoạt động dựa trên nguyên tắc công khai, minh bạch, bảo vệ quyền lợi hợp pháp của người tiêu dùng và quyền tự do cung cấp dịch vụ của các cá nhân, tổ chức nhiếp ảnh theo quy định của pháp luật Việt Nam.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">2. Quy Trình Giao Dịch</h2>
              <ol className="list-decimal list-inside space-y-2 pl-2 text-slate-600">
                <li><strong>Dành cho Người mua (Khách hàng):</strong> Tìm kiếm thợ -&gt; Xem bảng giá và portfolio -&gt; Đặt lịch -&gt; Thanh toán cọc vào Escrow -&gt; Đi chụp -&gt; Nhận ảnh đám mây -&gt; Kiểm tra 48h -&gt; Nghiệm thu và đánh giá.</li>
                <li><strong>Dành cho Người bán (Nhiếp ảnh gia):</strong> Đăng ký tài khoản -&gt; Khai báo hồ sơ và năng lực -&gt; Xác thực danh tính (KYC) -&gt; Công khai bảng giá -&gt; Tiếp nhận đơn -&gt; Bàn giao sản phẩm đúng hẹn -&gt; Rút tiền về tài khoản ngân hàng.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">3. Cơ Chế Giải Quyết Khiếu Nại & Tranh Chấp</h2>
              <p>
                Khi phát sinh tranh chấp trong buổi chụp hoặc chất lượng ảnh bàn giao:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li><strong>Bước 1 (Tự thỏa thuận):</strong> Khách hàng và thợ chụp trao đổi trực tiếp trong khung chat nội bộ FLASHY để tìm giải pháp (chụp bù, chỉnh sửa thêm).</li>
                <li><strong>Bước 2 (Trọng tài nền tảng):</strong> Trong vòng 48h sau khi nhận ảnh, khách hàng gửi yêu cầu mở tranh chấp qua hệ thống. Khoản tiền ký quỹ sẽ được phong tỏa ngay lập tức.</li>
                <li><strong>Bước 3 (Xử lý của Admin):</strong> Bộ phận Chăm sóc khách hàng kiểm tra bằng chứng (thời gian điểm hẹn, ảnh chụp, nhật ký trò chuyện) và đưa ra phán quyết trong vòng tối đa 03 ngày làm việc: Hoàn trả tiền cho khách hàng hoặc giải ngân cho thợ chụp.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">4. Trách Nhiệm Của Ban Quản Lý Sàn FLASHY</h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li>Duy trì hoạt động ổn định của hệ thống kỹ thuật, bảo vệ an toàn thông tin cá nhân.</li>
                <li>Kiểm duyệt danh tính, năng lực của nhiếp ảnh gia trước khi cho phép nhận đơn thanh toán thực tế.</li>
                <li>Cung cấp thông tin giao dịch cho cơ quan quản lý nhà nước có thẩm quyền khi có yêu cầu bằng văn bản.</li>
                <li>Đảm bảo cơ chế lưu trữ lịch sử đặt hẹn tối thiểu 24 tháng theo quy định.</li>
              </ul>
            </section>

          </div>

        </div>
      </div>
    </div>
  )
}
