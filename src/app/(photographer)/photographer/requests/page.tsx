'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  MapPin,
  Package,
  Clock,
  DollarSign,
  Check,
  X,
  Eye,
  Calendar,
  User,
  Zap,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatVND, formatRelativeTimeVN } from '@/lib/utils'
import { toast } from 'sonner'

interface BookingRequest {
  id: string
  customer: {
    name: string
    avatar: string
    reviews_given: number
  }
  package: string
  shoot_date: string
  shoot_time: string
  location: string
  addons: string[]
  concept_notes: string
  total_amount: number
  deposit_amount: number
  distance_km: number
  requested_at: string
  status: 'pending' | 'accepted' | 'rejected'
}

const DEMO_REQUESTS: BookingRequest[] = [
  {
    id: 'REQ001',
    customer: { name: 'Thanh Huyền Lê', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop', reviews_given: 5 },
    package: 'Quick Date',
    shoot_date: '18/10/2026',
    shoot_time: '07:30',
    location: 'Hồ Con Rùa, Quận 3, TP.HCM',
    addons: ['Trang điểm cơ bản'],
    concept_notes: 'Em muốn chụp phong cách lifestyle nhẹ nhàng, màu pastel. Mặc áo dài trắng.',
    total_amount: 250000,
    deposit_amount: 75000,
    distance_km: 1.2,
    requested_at: new Date(Date.now() - 10 * 60000).toISOString(),
    status: 'pending',
  },
  {
    id: 'REQ002',
    customer: { name: 'Bảo Long Trương', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop', reviews_given: 2 },
    package: 'Vibe Sài Gòn',
    shoot_date: '20/10/2026',
    shoot_time: '16:00',
    location: 'Bến Nhà Rồng, Quận 4, TP.HCM',
    addons: [],
    concept_notes: 'Chụp ảnh couple với bạn gái. Phong cách street, tone màu film.',
    total_amount: 500000,
    deposit_amount: 150000,
    distance_km: 3.5,
    requested_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    status: 'pending',
  },
  {
    id: 'REQ003',
    customer: { name: 'Mai Anh Đỗ', avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=60&h=60&fit=crop', reviews_given: 8 },
    package: 'Flash Shot',
    shoot_date: '13/10/2026',
    shoot_time: '08:00',
    location: 'Quận 1, TP.HCM (gần trung tâm)',
    addons: [],
    concept_notes: 'Chụp nhanh để làm ảnh profile LinkedIn. Cần có nền sạch.',
    total_amount: 99000,
    deposit_amount: 29700,
    distance_km: 0.8,
    requested_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    status: 'accepted',
  },
]

export default function PhotographerRequestsPage() {
  const [requests, setRequests] = useState(DEMO_REQUESTS)
  const [selected, setSelected] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('pending')

  const pendingCount = requests.filter(r => r.status === 'pending').length

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)

  const handleAccept = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'accepted' as const } : r))
    setSelected(null)
    toast.success('✅ Đã chấp nhận yêu cầu! Khách hàng sẽ được thông báo ngay.')
  }

  const handleReject = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' as const } : r))
    setSelected(null)
    toast.error('Đã từ chối yêu cầu đặt chụp.')
  }

  const selectedReq = requests.find(r => r.id === selected)

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Bell className="w-6 h-6 text-violet-500" />
                Yêu cầu đặt chụp
                {pendingCount > 0 && (
                  <Badge className="bg-red-500 text-white border-0 text-xs px-2 animate-pulse">{pendingCount} mới</Badge>
                )}
              </h1>
              <p className="text-slate-500 text-sm mt-1">Phản hồi nhanh giúp tăng điểm đánh giá của bạn</p>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
          {(['pending', 'accepted', 'rejected', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                filter === f
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {f === 'pending' ? `Chờ xác nhận (${pendingCount})`
                : f === 'accepted' ? 'Đã chấp nhận'
                : f === 'rejected' ? 'Đã từ chối'
                : 'Tất cả'}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Request Cards */}
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Không có yêu cầu nào</p>
              </div>
            ) : (
              filtered.map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`bg-white rounded-2xl p-4 border shadow-sm cursor-pointer transition-all hover:shadow-md ${
                    selected === req.id ? 'border-violet-400 ring-2 ring-violet-100' : 
                    req.status === 'pending' ? 'border-amber-300' : 'border-slate-200'
                  }`}
                  onClick={() => setSelected(req.id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={req.customer.avatar} alt={req.customer.name} />
                      <AvatarFallback>{req.customer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-800">{req.customer.name}</p>
                        <Badge className={`text-[10px] border-0 px-2 ${
                          req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          req.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {req.status === 'pending' ? '⏳ Chờ' : req.status === 'accepted' ? '✓ Đã nhận' : '✗ Từ chối'}
                        </Badge>
                      </div>
                      <p className="text-xs text-violet-600 font-semibold mt-0.5">{req.package}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{req.shoot_date} {req.shoot_time}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{req.distance_km}km</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-black text-emerald-600">{formatVND(req.total_amount)}</span>
                        <span className="text-xs text-slate-400">{formatRelativeTimeVN(req.requested_at)}</span>
                      </div>
                    </div>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs border-red-200 text-red-600 hover:bg-red-50"
                        onClick={e => { e.stopPropagation(); handleReject(req.id) }}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Từ chối
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={e => { e.stopPropagation(); handleAccept(req.id) }}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Chấp nhận
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>

          {/* Detail Panel */}
          <AnimatePresence>
            {selectedReq && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 h-fit sticky top-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800">Chi tiết yêu cầu #{selectedReq.id}</h3>
                  <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <User className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="font-semibold text-slate-800">{selectedReq.customer.name}</p>
                      <p className="text-xs text-slate-400">{selectedReq.customer.reviews_given} đánh giá đã để lại</p>
                    </div>
                  </div>

                  {[
                    { icon: Package, label: 'Gói chụp', value: selectedReq.package },
                    { icon: Calendar, label: 'Ngày chụp', value: `${selectedReq.shoot_date} lúc ${selectedReq.shoot_time}` },
                    { icon: MapPin, label: 'Địa điểm', value: selectedReq.location },
                    { icon: DollarSign, label: 'Tổng tiền', value: formatVND(selectedReq.total_amount) },
                    { icon: Zap, label: 'Đặt cọc', value: formatVND(selectedReq.deposit_amount) },
                  ].map(row => (
                    <div key={row.label} className="flex gap-3">
                      <row.icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400">{row.label}</p>
                        <p className="font-semibold text-slate-800">{row.value}</p>
                      </div>
                    </div>
                  ))}

                  {selectedReq.addons.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Dịch vụ thêm</p>
                      <div className="flex gap-1 flex-wrap">
                        {selectedReq.addons.map(a => (
                          <Badge key={a} className="text-[10px] bg-violet-100 text-violet-700 border-0">{a}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedReq.concept_notes && (
                    <div className="p-3 bg-violet-50 rounded-xl">
                      <p className="text-xs text-violet-600 font-semibold mb-1">Ghi chú concept:</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{selectedReq.concept_notes}</p>
                    </div>
                  )}
                </div>

                {selectedReq.status === 'pending' && (
                  <div className="flex gap-2 mt-5">
                    <Button
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleReject(selectedReq.id)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Từ chối
                    </Button>
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleAccept(selectedReq.id)}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Chấp nhận
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Demo notice */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
          <strong>⚠ Chế độ Demo:</strong> Yêu cầu đặt chụp thực sẽ đến qua Supabase Realtime khi kết nối backend.
        </div>
      </div>
    </div>
  )
}
