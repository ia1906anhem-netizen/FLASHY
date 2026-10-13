'use client'

import React, { useState } from 'react'
import {
  MapPin,
  Flame,
  Building2,
  Sparkles,
  Edit3,
  Check,
  ChevronRight,
  Compass,
  Search,
  Camera
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export interface SelectedLocation {
  name: string
  address?: string
  district?: string
  category?: string
}

interface LocationTabPickerProps {
  value: string
  onChange: (locationName: string, meta?: SelectedLocation) => void
  serviceRadiusKm?: number
  photographerName?: string
}

const FAMOUS_SPOTS = [
  {
    name: 'Bưu điện Thành Phố & Nhà thờ Đức Bà',
    district: 'Quận 1',
    address: '02 Công xã Paris, Bến Nghé, Quận 1',
    tag: 'Kiến trúc Pháp • Vintage',
    hot: true,
  },
  {
    name: 'Bến Bạch Đằng & Cầu Ba Son',
    district: 'Quận 1',
    address: 'Đường Tôn Đức Thắng, Bến Nghé, Quận 1',
    tag: 'Hoàng hôn • View sông thơ mộng',
    hot: true,
  },
  {
    name: 'Phố đi bộ Nguyễn Huệ & Trụ sở UBND',
    district: 'Quận 1',
    address: 'Đường Nguyễn Huệ, Bến Nghé, Quận 1',
    tag: 'Street style • Phố đêm rực rỡ',
    hot: true,
  },
  {
    name: 'Hồ Con Rùa & Dinh Độc Lập',
    district: 'Quận 3',
    address: 'Công trường Quốc Tế & Nam Kỳ Khởi Nghĩa, Quận 3',
    tag: 'Retro thanh xuân • Vibe Sài Gòn',
    hot: true,
  },
  {
    name: 'Cầu Ánh Sao & Hồ Bán Nguyệt',
    district: 'Quận 7',
    address: 'Khu đô thị Phú Mỹ Hưng, Tân Phú, Quận 7',
    tag: 'Couple lãng mạn • Hoàng hôn',
    hot: false,
  },
  {
    name: 'Landmark 81 & Công viên Central Park',
    district: 'Bình Thạnh',
    address: '208 Nguyễn Hữu Cảnh, Phường 22, Bình Thạnh',
    tag: 'Hiện đại • Không gian xanh',
    hot: true,
  },
  {
    name: 'Khu phố Tây Thảo Điền & Cà phê ven sông',
    district: 'TP. Thủ Đức',
    address: 'Khu biệt thự & Đường Xuân Thủy, Thảo Điền',
    tag: 'Châu Âu • Brunch aesthetic',
    hot: false,
  },
  {
    name: 'Bảo tàng Mỹ thuật TP. Hồ Chí Minh',
    district: 'Quận 1',
    address: '97A Phó Đức Chính, Phường Nguyễn Thái Bình, Quận 1',
    tag: 'Art & Cổ điển • Áo dài',
    hot: true,
  },
  {
    name: 'Chợ Lớn & Chùa Bà Thiên Hậu',
    district: 'Quận 5',
    address: '710 Nguyễn Trãi, Phường 11, Quận 5',
    tag: 'Hong Kong vibe • Văn hóa Hoa',
    hot: false,
  },
  {
    name: 'Chợ Bến Thành & Ga Ngầm Metro',
    district: 'Quận 1',
    address: 'Quảng trường Quách Thị Trang, Bến Thành, Quận 1',
    tag: 'Biểu tượng Sài Gòn',
    hot: false,
  },
]

const DISTRICT_DATA: Record<string, Array<{ name: string; tag: string }>> = {
  'Quận 1': [
    { name: 'Bưu điện Trung tâm TP & Nhà thờ Đức Bà', tag: 'Công xã Paris' },
    { name: 'Bến Bạch Đằng & Cầu đi bộ Ba Son', tag: 'Tôn Đức Thắng' },
    { name: 'Phố đi bộ Nguyễn Huệ & Căn hộ cà phê 42', tag: 'Nguyễn Huệ' },
    { name: 'Bảo tàng Mỹ thuật TP.HCM', tag: 'Phó Đức Chính' },
    { name: 'Thảo Cầm Viên Sài Gòn', tag: 'Nguyễn Bỉnh Khiêm (Vintage xanh)' },
    { name: 'Trung tâm Quận 1 (Hẹn linh hoạt)', tag: 'Khu vực trung tâm Q.1' },
  ],
  'Quận 3': [
    { name: 'Hồ Con Rùa & Cà phê biệt thự phố', tag: 'Phạm Ngọc Thạch' },
    { name: 'Nhà thờ Tân Định (Nhà thờ màu hồng)', tag: 'Hai Bà Trưng' },
    { name: 'Bảo tàng Chứng tích Chiến tranh', tag: 'Võ Văn Tần' },
    { name: 'Trung tâm Quận 3 (Hẹn linh hoạt)', tag: 'Khu vực Q.3' },
  ],
  'TP. Thủ Đức / Q.2': [
    { name: 'Khu phố Tây Thảo Điền & Cà phê ven sông', tag: 'Xuân Thủy, Q.2' },
    { name: 'Cầu Ba Son bờ Thủ Thiêm & Bến buýt sông', tag: 'Bờ Thủ Thiêm' },
    { name: 'Công viên Sala Đại Quang Minh', tag: 'Khu đô thị Sala' },
    { name: 'Khu du lịch The BCR & Cù lao Phước Thiện', tag: 'Dã ngoại ngoại thành' },
  ],
  'Quận 7': [
    { name: 'Cầu Ánh Sao & Hồ Bán Nguyệt Phú Mỹ Hưng', tag: 'Tôn Dật Tiên' },
    { name: 'Công viên hoa anh đào Sakura Park', tag: 'Phú Mỹ Hưng' },
    { name: 'Bến du thuyền Nam Sài Gòn', tag: 'Khu Riverside' },
  ],
  'Bình Thạnh': [
    { name: 'Công viên bờ sông Vinhomes Landmark 81', tag: 'Nguyễn Hữu Cảnh' },
    { name: 'Làng du lịch Bình Quới 1 & 2', tag: 'Bình Quới (Vùng quê sông nước)' },
    { name: 'Cầu Thủ Thiêm 1 bờ Bình Thạnh', tag: 'Nguyễn Hữu Cảnh' },
  ],
  'Quận 5': [
    { name: 'Chùa Bà Thiên Hậu & Khu phố Hào Sĩ Phường', tag: 'Trần Hưng Đạo - Nguyễn Trãi' },
    { name: 'Chợ hoa Hồ Thị Kỷ (tiếp giáp Q.10)', tag: 'Phố hoa rực rỡ' },
  ],
  'Phú Nhuận & Tân Bình': [
    { name: 'Công viên Gia Định & Cà phê đường ray xe lửa', tag: 'Hoàng Minh Giám' },
    { name: 'Công viên Hoàng Văn Thụ', tag: 'Trần Quốc Hoàn' },
  ],
}

const CONCEPTS = [
  {
    title: 'Studio ánh sáng tự nhiên',
    desc: 'Không gian máy lạnh, đạo cụ sẵn, concept Hàn Quốc / Tối giản',
    suggest: 'Studio đối tác liên kết FLASHY (Q.1 / Q.3)',
    icon: '🏢',
  },
  {
    title: 'Quán Cà Phê Vintage / Retro',
    desc: 'Bàn gỗ, sách cũ, ánh sáng vàng ấm cúng hoài niệm',
    suggest: 'Cà phê chung cư Nguyễn Huệ hoặc phố biệt thự Q.3',
    icon: '☕',
  },
  {
    title: 'Đường phố Urban & Phố Đêm',
    desc: 'Bắt trọn năng lượng giới trẻ, đèn neon & ánh sáng bokeh',
    suggest: 'Phố đi bộ, Cầu đi bộ Ba Son, Ngã tư sầm uất',
    icon: '🌆',
  },
  {
    title: 'Dã ngoại & Cảnh quan xanh',
    desc: 'Ánh nắng xiên, thảm cỏ, concept nàng thơ & picnic',
    suggest: 'Công viên Sala, Central Park hoặc Thảo Cầm Viên',
    icon: '🌿',
  },
  {
    title: 'Bảo tàng & Kiến trúc cổ điển',
    desc: 'Trang nghiêm, tinh tế, thích hợp Áo dài & Concept thanh lịch',
    suggest: 'Bảo tàng Mỹ thuật, Dinh Độc Lập, Bưu điện TP',
    icon: '🏛️',
  },
]

export function LocationTabPicker({
  value,
  onChange,
  serviceRadiusKm = 15,
  photographerName,
}: LocationTabPickerProps) {
  const [activeTab, setActiveTab] = useState<'famous' | 'district' | 'concept' | 'custom'>('famous')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Quận 1')
  const [customInput, setCustomInput] = useState<string>(value || '')

  const handleSelectSpot = (spotName: string, district?: string, tag?: string) => {
    onChange(spotName, {
      name: spotName,
      district,
      category: tag,
    })
    setCustomInput(spotName)
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (customInput.trim()) {
      onChange(customInput.trim(), { name: customInput.trim() })
    }
  }

  return (
    <div className="space-y-3.5">
      {/* Selected Location Pill Display */}
      <div className="p-3 rounded-2xl bg-violet-50/80 border border-violet-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-violet-700 tracking-wider block">
              Địa điểm đã chọn:
            </span>
            <p className="text-sm font-bold text-slate-900 truncate">
              {value || 'Chưa chọn địa điểm chụp'}
            </p>
          </div>
        </div>
        {value && (
          <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 text-[11px] px-2.5 py-0.5 rounded-full flex-shrink-0">
            <Check className="w-3 h-3 mr-1" />
            Đã chọn
          </Badge>
        )}
      </div>

      {/* Tabs Header Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto scrollbar-none border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('famous')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'famous'
              ? 'bg-white text-violet-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          Điểm Chụp Nổi Tiếng
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('district')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'district'
              ? 'bg-white text-violet-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-blue-500" />
          Theo Quận / Huyện
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('concept')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'concept'
              ? 'bg-white text-violet-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          Loại Không Gian
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('custom')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'custom'
              ? 'bg-white text-violet-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
          Tự Nhập Địa Chỉ
        </button>
      </div>

      {/* Tab 1: FAMOUS HOT SPOTS */}
      {activeTab === 'famous' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
          {FAMOUS_SPOTS.map((spot) => {
            const isSelected = value === spot.name
            return (
              <div
                key={spot.name}
                onClick={() => handleSelectSpot(spot.name, spot.district, spot.tag)}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-violet-600 bg-violet-50/70 ring-2 ring-violet-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-violet-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-slate-900">{spot.name}</span>
                      {spot.hot && (
                        <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-black rounded-md">
                          HOT
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{spot.address}</p>
                    <span className="inline-block mt-1 text-[10px] font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">
                      {spot.tag}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tab 2: BY DISTRICT */}
      {activeTab === 'district' && (
        <div className="space-y-3">
          {/* District Selector Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {Object.keys(DISTRICT_DATA).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDistrict(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedDistrict === d
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Spots in Selected District */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {DISTRICT_DATA[selectedDistrict]?.map((item) => {
              const fullSpotName = `${item.name} (${selectedDistrict})`
              const isSelected = value === fullSpotName || value === item.name
              return (
                <div
                  key={item.name}
                  onClick={() => handleSelectSpot(item.name, selectedDistrict, item.tag)}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-violet-600 bg-violet-50/70 ring-2 ring-violet-500/20'
                      : 'border-slate-200 bg-white hover:border-violet-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-xs text-slate-900">{item.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{item.tag}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tab 3: BY CONCEPT / SPACE */}
      {activeTab === 'concept' && (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {CONCEPTS.map((c) => {
            const isSelected = value.includes(c.title) || value === c.suggest
            return (
              <div
                key={c.title}
                onClick={() => handleSelectSpot(c.suggest, undefined, c.title)}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-violet-600 bg-violet-50/70 ring-2 ring-violet-500/20'
                    : 'border-slate-200 bg-white hover:border-violet-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5 flex-shrink-0">{c.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs text-slate-900">{c.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{c.desc}</p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-violet-700">
                      <ChevronRight className="w-3 h-3" />
                      <span>Gợi ý: {c.suggest}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tab 4: CUSTOM MANUAL INPUT */}
      {activeTab === 'custom' && (
        <form onSubmit={handleCustomSubmit} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Nhập địa chỉ nhà riêng, quán cafe hoặc địa điểm tùy chọn:
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Ví dụ: 124 Nguyễn Đình Chiểu, Phường Đa Kao, Quận 1..."
                value={customInput}
                onChange={(e) => {
                  setCustomInput(e.target.value)
                  onChange(e.target.value, { name: e.target.value })
                }}
                className="pl-10 h-11 rounded-xl bg-white"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Bạn có thể nhập chi tiết số nhà, tên tòa nhà hoặc điểm hẹn riêng biệt để nhiếp ảnh gia dễ tìm.
            </p>
          </div>
        </form>
      )}

      {/* Radius Policy Helper Footnote */}
      <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
        <Compass className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
        <span>
          {photographerName ? `Nhiếp ảnh gia ${photographerName}` : 'Nhiếp ảnh gia'} hỗ trợ di chuyển miễn phí trong bán kính{' '}
          <strong className="text-slate-700">{serviceRadiusKm}km</strong> quanh TP. Hồ Chí Minh.
        </span>
      </p>
    </div>
  )
}
