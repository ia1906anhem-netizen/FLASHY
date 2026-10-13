'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Camera,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  UploadCloud,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { addOrUpdateApprovedProvider } from '@/lib/data/booking-store'

export default function PhotographerOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  // Form State
  const [displayName, setDisplayName] = useState('Minh Trí Visuals')
  const [bio, setBio] = useState('Chuyên chụp ảnh dạo phố, phong cách film vintage hoài niệm.')
  const [district, setDistrict] = useState('Quận 1')
  const [radiusKm, setRadiusKm] = useState(15)
  const [equipment, setEquipment] = useState('Sony A7IV, FE 35mm f/1.4 GM')
  const [specialties, setSpecialties] = useState<string[]>(['Street', 'Couple', 'Vibe Sài Gòn'])
  const [kycSubmitted, setKycSubmitted] = useState(false)

  const handleFinishOnboarding = () => {
    try {
      addOrUpdateApprovedProvider({
        name: displayName || 'Minh Trí Visuals',
        location: `${district}, TP. Hồ Chí Minh`,
        district,
        city: 'Hồ Chí Minh',
        specialty: specialties.join(' · ') || 'Street · Couple',
        rating: 5.0,
        reviews: 0,
        starting_price: 120000,
        is_verified: true,
        kyc_status: 'VERIFIED',
        badge: '⭐ Đã duyệt KYC',
      })
    } catch (err) {
      console.error('Failed to save provider on onboarding', err)
    }
    router.push('/photographer/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="verified" className="mb-2">Gia nhập FLASHY Pro</Badge>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Khởi Tạo Hồ Sơ Nhiếp Ảnh Gia
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bước {step} trên 4 • Hoàn thành để mở khóa nhận lịch chụp và hưởng 0% hoa hồng 3 đơn đầu
          </p>

          {/* Stepper bar */}
          <div className="flex gap-2 max-w-xs mx-auto mt-4">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  step >= s ? 'bg-violet-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        <Card className="rounded-3xl border-slate-200 bg-white p-6 md:p-8 shadow-sm">
          <CardContent className="p-0">
            
            {/* STEP 1: Basic Profile */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-base mb-2">1. Thông Tin Nghệ Danh & Giới Thiệu</h3>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nghệ danh hiển thị *</label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ví dụ: Minh Trí (TriStreet)"
                    className="rounded-xl h-11"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tiểu sử ngắn gọn (Bio) *</label>
                  <Textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Giới thiệu phong cách chụp ảnh và kinh nghiệm của bạn..."
                    className="rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Thiết bị máy ảnh & Ống kính đang dùng</label>
                  <Input
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                    placeholder="Ví dụ: Sony A7IV, Canon EOS R6, Fuji XT5..."
                    className="rounded-xl h-11"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button onClick={() => setStep(2)} className="bg-brand hover:opacity-90 rounded-xl font-bold text-xs h-11 px-6">
                    Tiếp tục: Khu vực hoạt động
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Location & Radius */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-base mb-2">2. Khu Vực & Bán Kính Hoạt Động</h3>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Quận / Huyện trung tâm *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="Quận 1">Quận 1 (Trung tâm)</option>
                    <option value="Quận 3">Quận 3</option>
                    <option value="Bình Thạnh">Bình Thạnh</option>
                    <option value="Thành phố Thủ Đức">Thành phố Thủ Đức</option>
                    <option value="Quận 5">Quận 5 (Chợ Lớn)</option>
                    <option value="Quận 7">Quận 7 (Phú Mỹ Hưng)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Bán kính hỗ trợ di chuyển miễn phí: {radiusKm} km</label>
                  <input
                    type="range"
                    min="3"
                    max="30"
                    step="1"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="w-full accent-violet-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>3 km (Nội quận)</span>
                    <span>30 km (Toàn thành phố)</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl text-xs h-11">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
                  </Button>
                  <Button onClick={() => setStep(3)} className="bg-brand hover:opacity-90 rounded-xl font-bold text-xs h-11 px-6">
                    Tiếp tục: Mẫu Portfolio
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Portfolio Sample */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-base mb-2">3. Tải Lên Tác Phẩm Tiêu Biểu (Portfolio)</h3>
                <p className="text-xs text-slate-500">
                  Tải lên tối thiểu 4 bức ảnh đẹp nhất để khách hàng xem trước khi đặt lịch.
                </p>

                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50">
                  <UploadCloud className="w-8 h-8 text-violet-600 mx-auto mb-2" />
                  <p className="font-bold text-xs text-slate-800">Đã tích hợp 4 ảnh demo mẫu vào hồ sơ</p>
                  <p className="text-[11px] text-slate-400">Bạn có thể quản lý thêm album sau trong mục Portfolio.</p>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)} className="rounded-xl text-xs h-11">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
                  </Button>
                  <Button onClick={() => setStep(4)} className="bg-brand hover:opacity-90 rounded-xl font-bold text-xs h-11 px-6">
                    Tiếp tục: Xác minh KYC
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: KYC Verification (Section 10.3 requirement) */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-base mb-1">4. Xác Minh Danh Tính (KYC Kiểm Thử)</h3>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <p className="font-bold mb-1">Chế độ kiểm thử (Sandbox Integration):</p>
                  <p className="text-amber-800 leading-relaxed">
                    Theo tiêu chuẩn bảo vệ dữ liệu, hệ thống không yêu cầu nạp CCCD thật của người dùng trong môi trường thử nghiệm. Bấm nút dưới đây để tạo hồ sơ định danh mẫu.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mã định danh mẫu:</span>
                    <span className="font-mono font-bold text-slate-800">KYC-SYNTH-8921</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trạng thái hồ sơ:</span>
                    <span className="font-bold text-emerald-600">Sẵn sàng kích hoạt</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setStep(3)} className="rounded-xl text-xs h-11">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
                  </Button>
                  <Button onClick={handleFinishOnboarding} className="bg-brand hover:opacity-90 rounded-xl font-black text-xs h-11 px-8 text-white shadow-md">
                    Hoàn tất hồ sơ & Vào Studio
                  </Button>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

      </div>
    </div>
  )
}
