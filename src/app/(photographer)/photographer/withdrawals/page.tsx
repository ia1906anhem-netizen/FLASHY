'use client'

import { useState, useEffect } from 'react'
import {
  CreditCard,
  Building,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  PlusCircle,
  History
} from 'lucide-react'
import { formatVND } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getStoredBookings } from '@/lib/data/booking-store'

export default function PhotographerWithdrawalsPage() {
  const [availableBalance, setAvailableBalance] = useState<number>(0)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [selectedBank, setSelectedBank] = useState('vcb')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [photographerAccountName, setPhotographerAccountName] = useState('NGUYEN MINH TRI')

  const loadData = () => {
    // Compute withdrawable balance from completed bookings
    const bookings = getStoredBookings()
    const completed = bookings.filter((b) => ['ACCEPTED', 'COMPLETED'].includes(b.status))
    const gross = completed.reduce((sum, b) => sum + b.total_amount, 0)
    const comm = completed.reduce((sum, b) => sum + Math.round((b.total_amount * 6) / 100), 0)
    const totalEarned = gross - comm

    // Deduct already withdrawn
    const storedHistory = JSON.parse(localStorage.getItem('flashy_withdrawals') || '[]')
    const totalWithdrawn = storedHistory.reduce((sum: number, item: any) => sum + (item.amount || 0), 0)
    const netAvailable = Math.max(0, totalEarned - totalWithdrawn)

    setAvailableBalance(netAvailable)
    setHistory(storedHistory)

    try {
      const storedUser = localStorage.getItem('flashy_current_user')
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        if (parsed?.name || parsed?.full_name) {
          setPhotographerAccountName((parsed.name || parsed.full_name).toUpperCase())
        }
      }
    } catch {}
  }

  useEffect(() => {
    loadData()
    const handleUpdate = () => loadData()
    window.addEventListener('flashy_bookings_updated', handleUpdate)
    return () => window.removeEventListener('flashy_bookings_updated', handleUpdate)
  }, [])

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = Number(withdrawAmount)
    if (!amt || amt < 100000) {
      alert('Số tiền rút tối thiểu là 100.000đ!')
      return
    }
    if (amt > availableBalance) {
      alert('Số tiền rút vượt quá số dư khả dụng!')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      const newEntry = {
        id: `WD-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleString('vi-VN'),
        bank: 'Vietcombank - CN Tân Định',
        account_number: '•••• 8923',
        amount: amt,
        status: 'PROCESSING',
        status_label: 'Đang xử lý chuyển khoản',
      }

      const updatedHistory = [newEntry, ...history]
      localStorage.setItem('flashy_withdrawals', JSON.stringify(updatedHistory))

      setHistory(updatedHistory)
      setAvailableBalance(Math.max(0, availableBalance - amt))
      setWithdrawAmount('')
      setIsSubmitting(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 4000)
    }, 1200)
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Yêu Cầu Rút Tiền & Tài Khoản Nhận Thù Lao
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Rút tiền về tài khoản ngân hàng chính chủ sau khi khách hàng đã nghiệm thu buổi chụp
        </p>
      </div>

      {showSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            Yêu cầu rút tiền đã được tiếp nhận thành công! Hệ thống sẽ xử lý chuyển khoản trong vòng 2–4 giờ làm việc.
          </span>
        </div>
      )}

      {/* Balance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-3xl border-emerald-200 bg-gradient-to-br from-emerald-500/10 via-emerald-50/50 to-teal-50/40 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Số Dư Khả Dụng Để Rút
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-900 mb-1">{formatVND(availableBalance)}</div>
          <p className="text-[11px] text-emerald-700/80">Từ các đơn hàng khách đã duyệt nghiệm thu</p>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Thời Gian Xử Lý
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 mb-1">2 – 4 Giờ Làm Việc</div>
          <p className="text-[11px] text-slate-500">Chuyển khoản 24/7 qua cổng Napas 247</p>
        </Card>

        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Phí Rút Tiền
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-emerald-600 mb-1">Miễn Phí 100%</div>
          <p className="text-[11px] text-slate-500">FLASHY hỗ trợ toàn bộ phí chuyển khoản ngân hàng</p>
        </Card>
      </div>

      {/* Withdrawal Form */}
      <Card className="rounded-3xl border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-violet-600" />
          Tạo Lệnh Rút Tiền Mới
        </h3>

        <form onSubmit={handleWithdraw} className="space-y-5">
          {/* Bank Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Tài khoản thụ hưởng đã xác minh:</label>
            <div className="p-4 rounded-2xl border-2 border-violet-600 bg-violet-50/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  VCB
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Ngân hàng TMCP Ngoại Thương (Vietcombank)</h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Số TK: 0071 0008 8923 • Chủ TK: {photographerAccountName}
                  </p>
                </div>
              </div>
              <Badge className="bg-emerald-600 text-white">Chính chủ • Đã KYC</Badge>
            </div>
          </div>

          {availableBalance === 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                Số dư khả dụng hiện tại là <strong>0đ</strong>. Bạn cần hoàn tất buổi chụp và khách hàng duyệt nghiệm thu ảnh để phát sinh thù lao có thể rút về tài khoản ngân hàng.
              </span>
            </div>
          )}

          {/* Amount input */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Số tiền muốn rút (VND) *</label>
            <div className="relative">
              <Input
                type="number"
                min="100000"
                max={availableBalance}
                step="50000"
                placeholder="Ví dụ: 500000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="rounded-xl h-11 text-sm font-bold"
                required
              />
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {[500000, 1000000, 2000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setWithdrawAmount(amt.toString())}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700"
                >
                  +{formatVND(amt)}
                </button>
              ))}
              {availableBalance > 0 && (
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(availableBalance.toString())}
                  className="px-2.5 py-1 rounded-lg bg-violet-100 hover:bg-violet-200 text-[11px] font-bold text-violet-700"
                >
                  Tất cả ({formatVND(availableBalance)})
                </button>
              )}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || availableBalance === 0}
              className="bg-brand hover:opacity-90 text-white rounded-xl font-bold text-xs h-11 px-8 shadow-md"
            >
              {isSubmitting ? 'Đang gửi lệnh...' : 'Xác nhận rút về Vietcombank'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Withdrawal History */}
      <Card className="rounded-3xl border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
          <History className="w-4 h-4 text-violet-600" />
          Lịch Sử Rút Tiền
        </h3>

        {history.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400 space-y-2">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-1" />
            <p className="font-bold text-slate-600">Chưa có lệnh rút tiền nào</p>
            <p className="text-slate-400 max-w-sm mx-auto">
              Khi bạn hoàn thành các buổi chụp và gửi yêu cầu rút thù lao, lịch sử xử lý sẽ xuất hiện tại đây.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {history.map((item) => (
              <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900">{formatVND(item.amount)}</strong>
                    <span className="font-mono text-slate-400 text-[10px]">#{item.id}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {item.bank} ({item.account_number})
                  </p>
                  <p className="text-[10px] text-slate-400">{item.date}</p>
                </div>

                <div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      item.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {item.status_label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
