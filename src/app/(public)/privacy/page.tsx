import { ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'Chính Sách Bảo Mật Dữ Liệu Cá Nhân | FLASHY',
  description: 'Chính sách bảo mật dữ liệu cá nhân theo Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 và Nghị định 356/2025/NĐ-CP của FLASHY.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-sm">
          
          <div className="flex items-center gap-2 text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            Tuân thủ pháp luật Việt Nam
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
            Chính Sách Bảo Mật Dữ Liệu Cá Nhân
          </h1>
          
          <p className="text-xs text-slate-500 mb-8 pb-6 border-b border-slate-100">
            Cập nhật lần cuối: Tháng 03/2026 • Áp dụng theo Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15, Nghị định 356/2025/NĐ-CP và các quy định chuyển tiếp liên quan.
          </p>

          <div className="prose prose-slate max-w-none text-sm text-slate-700 space-y-6 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">1. Cam Kết Chung</h2>
              <p>
                FLASHY cam kết bảo vệ dữ liệu cá nhân của mọi chủ thể dữ liệu (bao gồm Khách hàng và Nhiếp ảnh gia) khi sử dụng dịch vụ trên nền tảng. Chúng tôi tôn trọng quyền riêng tư và xử lý dữ liệu cá nhân một cách minh bạch, an toàn và đúng mục đích đã thông báo.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">2. Các Loại Dữ Liệu Cá Nhân Được Thu Thập</h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li><strong>Thông tin nhận diện cơ bản:</strong> Họ tên, địa chỉ email, số điện thoại, ảnh đại diện.</li>
                <li><strong>Dữ liệu vị trí địa lý:</strong> Tọa độ ước lượng hoặc địa chỉ điểm chụp được người dùng chỉ định. Chúng tôi <em>không</em> công khai tọa độ GPS thời gian thực chính xác của người dùng.</li>
                <li><strong>Dữ liệu xác minh danh tính (KYC của thợ chụp):</strong> Ảnh giấy tờ tùy thân (CCCD/Hộ chiếu) và ảnh chân dung đối soát. Dữ liệu này chỉ phục vụ mục đích kiểm duyệt pháp lý nội bộ và được lưu trữ trong phân vùng bảo mật cao.</li>
                <li><strong>Hình ảnh và tác phẩm nhiếp ảnh:</strong> File ảnh gốc, ảnh chỉnh sửa và ảnh xem trước có watermark được lưu trữ trên hạ tầng Supabase Storage với quyền truy cập phân cấp (RLS).</li>
                <li><strong>Lịch sử giao dịch:</strong> Dữ liệu thanh toán qua cổng trung gian, điểm tích lũy Flashy Coins, biên lai ký quỹ Escrow.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">3. Mục Đích Xử Lý Dữ Liệu</h2>
              <p>Dữ liệu được thu thập nhằm mục đích:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li>Kết nối đặt lịch giữa khách hàng và nhiếp ảnh gia tự do.</li>
                <li>Vận hành quy trình thanh toán ký quỹ (Escrow 48h) và giải ngân an toàn.</li>
                <li>Bảo vệ số điện thoại và quyền riêng tư trong kênh tin nhắn nội bộ.</li>
                <li>Giải quyết tranh chấp, khiếu nại chất lượng dịch vụ khi có yêu cầu.</li>
                <li>Tuân thủ nghĩa vụ báo cáo theo quy định thương mại điện tử Việt Nam.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">4. Biện Pháp Bảo Vệ và Lưu Trữ Dữ Liệu</h2>
              <p>
                FLASHY áp dụng chính sách Row Level Security (RLS) ở tầng cơ sở dữ liệu PostgreSQL. Không một người dùng nào có thể truy vấn hoặc xem trộm ảnh cá nhân, giấy tờ KYC hay tin nhắn của người khác khi chưa được cấp quyền hợp lệ.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">5. Quyền Của Chủ Thể Dữ Liệu</h2>
              <p>
                Theo Luật Bảo vệ dữ liệu cá nhân, bạn có toàn quyền:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
                <li>Yêu cầu truy cập, trích xuất dữ liệu cá nhân đang lưu trữ.</li>
                <li>Yêu cầu chỉnh sửa, cập nhật thông tin không chính xác.</li>
                <li>Yêu cầu xóa dữ liệu cá nhân hoặc rút lại sự đồng ý khi chấm dứt sử dụng dịch vụ.</li>
                <li>Gửi phản ánh, khiếu nại về việc xử lý dữ liệu qua email: <strong>privacy@flashy.vn</strong>.</li>
              </ul>
            </section>

            <section className="bg-violet-50 p-5 rounded-2xl border border-violet-100 text-xs text-violet-950">
              <p className="font-bold mb-1">Lưu ý tuân thủ pháp lý:</p>
              <p className="text-slate-600 leading-relaxed">
                Tài liệu này được biên soạn nhằm hướng dẫn và công khai quy trình xử lý dữ liệu. Đối với phiên bản thương mại chính thức, ban quản trị FLASHY sẽ thực hiện thẩm định pháp lý và đăng ký hồ sơ đánh giá tác động xử lý dữ liệu cá nhân (DPIA) với Cục An ninh mạng và phòng, chống tội phạm sử dụng công nghệ cao (A05) - Bộ Công an.
              </p>
            </section>
          </div>

        </div>
      </div>
    </div>
  )
}
