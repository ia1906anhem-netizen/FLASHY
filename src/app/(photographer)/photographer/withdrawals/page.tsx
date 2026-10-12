'use client'

import { useState } from 'react'
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

export default function PhotographerWithdrawalsPage() {
  const [availableBalance, setAvailableBalance] = useState(3510000)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [selectedBank, setSelectedBank] = useState('vcb')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [history, setHistory] = useState([
    {
      id: 'WD-104921',
      date: '02/04/2026 14:15',
      bank: 'Vietcombank - CN Tân Định',
      account_number: '•••• 8923',
      amount: 5000000,
      status: 'COMPLETED',
      status_label: 'Đã chuyển thành công',
    },
    {
      id: 'WD-098124',
      date: '15/03/2026 09:30',
      bank: 'Vietcombank - CN Tân Định',
      account_number: '•••• 8923',
      amount: 3000000,
      status: 'COMPLETED',
      status_label: 'Đã chuyển thành công',
    }
  ])

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
      setAvailableBalance(availableBalance - amt)
      const newEntry = {
        id: `WD-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        bank: 'Vietcombank - CN Tân Định',
        account_number: '•••• 8923',
        amount: amt,
        status: 'PROCESSING',
        status_label: 'Đang xử lý chuyển khoản',
      }
      setHistory([newEntry, ...history])
      setWithdrawAmount('')
      setIsSubmitting(false)
      setShowSuccess(true)
    }, 1000)
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Yêu Cầu Rút Tiền Về Tài Khoản
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Chuyển khoản trực tiếp vào tài khoản ngân hàng chính chủ trong vòng 2 - 4 giờ làm việc
        </p>
      </div>

      {/* Top Banner: Available Balance & Bank Account info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Balance */}
        <Card className="rounded-3xl border-slate-200 bg-gradient-to-br from-violet-900 to-indigo-900 text-white p-6 shadow-md flex flex-col justify-between">
          <div>
            <span className="text-xs text-violet-200 font-semibold uppercase tracking-wider block mb-1">
              Số dư khả dụng để rút
            </span>
            <div className="text-3xl font-black mb-1">
              {formatVND(availableBalance)}
            </div>
            <p className="text-xs text-violet-200">
              Chỉ bao gồm các đơn đã hết hạn 48h kiểm duyệt Escrow hoặc khách đã duyệt nghiệm thu.
            </p>
          </div>
          <div className="pt-4 border-t border-white/10 text-[11px] text-violet-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Bảo đảm an toàn giao dịch 100%
          </div>
        </Card>

        {/* Linked Bank Account Card */}
        <Card className="md:col-span-2 rounded-3xl border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Building className="w-4 h-4 text-violet-600" />
                Tài Khoản Ngân Hàng Đã Liên Kết
              </h3>
              <Badge variant="verified">Đã xác minh chủ tài khoản</Badge>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
              <p className="font-bold text-slate-900 text-sm">Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)</p>
              <p className="font-mono text-slate-600 font-bold">STK: 1029 3847 8923</p>
              <p className="text-slate-500">Chủ tài khoản: <strong>NGUYEN MINH TRI</strong> (Trùng khớp CCCD KYC)</p>
              <p className="text-[11px] text-slate-400">Chi nhánh: Chi nhánh Tân Định, TP. Hồ Chí Minh</p>
            </div>
          </div>

          <div className="pt-3 text-[11px] text-slate-400">
            * Nhằm bảo đảm an toàn, tên chủ tài khoản ngân hàng phải trùng khớp hoàn toàn với hồ sơ CCCD đã định danh KYC.
          </div>
        </Card>
      </div>

      {/* Withdrawal Form */}
      <Card className="rounded-3xl border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          Tạo Lệnh Rút Tiền Mới
        </h3>

        {showSuccess && (
          <div className="p-4 mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Lệnh rút tiền đã được tạo thành công! Tiền sẽ về tài khoản Vietcombank trong vài phút.</span>
          </div>
        )}

        <form onSubmit={handleWithdraw} className="space-y-4 max-w-lg">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Số tiền muốn rút (VND) *</label>
            <div className="relative">
              <Input
                type="number"
                min="100000"
                max={availableBalance}
                step="50000"
                placeholder="Ví dụ: 1000000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="rounded-xl h-11 text-sm font-bold"
                required
              />
            </div>
            <div className="flex gap-2 mt-2">
              {[500000, 1000000, 2000000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setWithdrawAmount(amt.toString())}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700"
                >
                  +{formatVND(amt)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setWithdrawAmount(availableBalance.toString())}
                className="px-2.5 py-1 rounded-lg bg-violet-100 hover:bg-violet-200 text-[11px] font-bold text-violet-700"
              >
                Tất cả số dư
              </button>
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

        <div className="divide-y divide-slate-100 text-xs">
          {history.map((item) => (
            <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <strong className="text-slate-900">{formatVND(item.amount)}</strong>
                  <span className="font-mono text-slate-400 text-[10px]">#{item.id}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.bank} ({item.account_number})</p>
                <p className="text-[10px] text-slate-400">{item.date}</p>
              </div>

              <div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  item.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {item.status_label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  )
}
