'use client'

import { useState } from 'react'
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Lock,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PhotographerCalendarPage() {
  const [selectedDay, setSelectedDay] = useState(15)

  const slots = [
    { time: '07:30 - 09:00', status: 'AVAILABLE', label: 'Khung giờ rảnh' },
    { time: '09:00 - 11:30', status: 'AVAILABLE', label: 'Khung giờ rảnh' },
    { time: '14:00 - 15:30', status: 'AVAILABLE', label: 'Khung giờ rảnh' },
    { time: '15:30 - 18:00', status: 'BOOKED', label: 'Đã có lịch: #BK-892104 (Thu Trang)' },
    { time: '18:30 - 20:30', status: 'BLOCKED', label: 'Đã khóa lịch cá nhân' },
  ]

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Lịch Biểu & Quản Lý Khung Giờ Rảnh
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ngăn chặn trùng lịch tự động (Concurrency check) • Khách hàng chỉ có thể đặt trong khung giờ mở
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Month Calendar Grid Card */}
        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Tháng 4 / 2026</h3>
            <div className="flex gap-1">
              <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d, i) => (
              <span key={i} className="font-bold text-slate-400 py-1">{d}</span>
            ))}
            {[...Array(30)].map((_, i) => {
              const day = i + 1
              const isSelected = selectedDay === day
              const hasBooking = day === 10 || day === 15
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`h-11 rounded-xl text-xs font-bold transition-all relative flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-violet-600 text-white shadow-md'
                      : hasBooking
                      ? 'bg-violet-50 text-violet-900 border border-violet-200'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>{day}</span>
                  {hasBooking && (
                    <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-amber-300' : 'bg-violet-600'}`} />
                  )}
                </button>
              )
            })}
          </div>
        </Card>

        {/* Day Slots Breakdown */}
        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">
              Ngày {selectedDay} Tháng 4
            </h3>
            <span className="text-[11px] text-slate-400">5 khung giờ</span>
          </div>

          <div className="space-y-2.5">
            {slots.map((slot, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                  slot.status === 'BOOKED'
                    ? 'border-violet-200 bg-violet-50/70 text-violet-950 font-bold'
                    : slot.status === 'BLOCKED'
                    ? 'border-slate-200 bg-slate-100 text-slate-400'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <p className="font-mono font-bold">{slot.time}</p>
                  <p className="text-[10px] mt-0.5 truncate max-w-[170px]">{slot.label}</p>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  slot.status === 'BOOKED'
                    ? 'bg-violet-600 text-white'
                    : slot.status === 'BLOCKED'
                    ? 'bg-slate-300 text-slate-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {slot.status === 'BOOKED' ? 'Đã đặt' : slot.status === 'BLOCKED' ? 'Đã khóa' : 'Mở rảnh'}
                </span>
              </div>
            ))}
          </div>
        </Card>

      </div>

    </div>
  )
}
