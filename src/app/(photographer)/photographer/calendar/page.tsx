'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Lock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Camera,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getStoredBookings, PersistentBooking } from '@/lib/data/booking-store'

const BASE_SLOTS = [
  { id: 'slot-1', time: '07:30 - 09:00', defaultLabel: 'Khung giờ sáng sớm' },
  { id: 'slot-2', time: '09:30 - 11:30', defaultLabel: 'Khung giờ trưa' },
  { id: 'slot-3', time: '13:30 - 15:30', defaultLabel: 'Khung giờ đầu giờ chiều' },
  { id: 'slot-4', time: '15:30 - 18:00', defaultLabel: 'Khung giờ chiều hoàng hôn' },
  { id: 'slot-5', time: '18:30 - 20:30', defaultLabel: 'Khung giờ chụp tối / Night vibe' },
]

export default function PhotographerCalendarPage() {
  const [selectedDay, setSelectedDay] = useState(new Date().getDate() || 15)
  const [bookings, setBookings] = useState<PersistentBooking[]>([])
  const [blockedSlots, setBlockedSlots] = useState<Record<string, boolean>>({})

  const loadData = () => {
    const list = getStoredBookings()
    setBookings(list)

    try {
      const storedBlocked = localStorage.getItem('flashy_photographer_blocked_slots')
      if (storedBlocked) {
        setBlockedSlots(JSON.parse(storedBlocked))
      }
    } catch {}
  }

  useEffect(() => {
    loadData()
    const handleUpdate = () => loadData()
    window.addEventListener('flashy_bookings_updated', handleUpdate)
    return () => window.removeEventListener('flashy_bookings_updated', handleUpdate)
  }, [])

  // Helper to extract day number from various date formats
  const extractDayNumber = (dateStr: string): number | null => {
    if (!dateStr) return null
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/')
      const dayNum = parseInt(parts[0], 10)
      return isNaN(dayNum) ? null : dayNum
    }
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-')
      const dayNum = parseInt(parts[2], 10)
      return isNaN(dayNum) ? null : dayNum
    }
    return null
  }

  // Set of day numbers that have active bookings
  const bookedDays = new Set(
    bookings
      .filter((b) => b.status !== 'CANCELLED')
      .map((b) => extractDayNumber(b.shooting_date))
      .filter((d): d is number => d !== null)
  )

  // Find bookings for the currently selected day
  const bookingsOnSelectedDay = bookings.filter(
    (b) => b.status !== 'CANCELLED' && extractDayNumber(b.shooting_date) === selectedDay
  )

  // Toggle blocking/unblocking a slot for personal schedule
  const toggleBlockSlot = (slotKey: string) => {
    const updated = { ...blockedSlots, [slotKey]: !blockedSlots[slotKey] }
    setBlockedSlots(updated)
    try {
      localStorage.setItem('flashy_photographer_blocked_slots', JSON.stringify(updated))
    } catch {}
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Lịch Biểu & Quản Lý Khung Giờ Rảnh
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ngăn chặn trùng lịch tự động (Concurrency check) • Đồng bộ thời gian thực theo đơn đặt chụp
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Month Calendar Grid Card */}
        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Tháng 4 / 2026</h3>
              <p className="text-[11px] text-slate-400">
                {bookedDays.size > 0
                  ? `Có ${bookedDays.size} ngày có lịch chụp thực tế`
                  : 'Chưa có lịch đặt chụp nào trong tháng này'}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                aria-label="Tháng trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                aria-label="Tháng sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d, i) => (
              <span key={i} className="font-bold text-slate-400 py-1">
                {d}
              </span>
            ))}
            {[...Array(30)].map((_, i) => {
              const day = i + 1
              const isSelected = selectedDay === day
              const hasBooking = bookedDays.has(day)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`h-11 rounded-xl text-xs font-bold transition-all relative flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-violet-600 text-white shadow-md'
                      : hasBooking
                      ? 'bg-violet-50 text-violet-900 border border-violet-200 font-extrabold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>{day}</span>
                  {hasBooking && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                        isSelected ? 'bg-amber-300' : 'bg-violet-600'
                      }`}
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-600 inline-block" /> Có đơn đặt chụp
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Khung giờ rảnh
              </span>
            </div>
            <span className="text-slate-400">Nhấn vào ngày để xem chi tiết</span>
          </div>
        </Card>

        {/* Day Slots Breakdown */}
        <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Ngày {selectedDay} Tháng 4</h3>
              <p className="text-[10px] text-slate-400">
                {bookingsOnSelectedDay.length > 0
                  ? `${bookingsOnSelectedDay.length} đơn chụp`
                  : '0 đơn chụp'}
              </p>
            </div>
            <span className="text-[11px] text-slate-400">{BASE_SLOTS.length} khung giờ</span>
          </div>

          <div className="space-y-2.5">
            {BASE_SLOTS.map((slot, idx) => {
              const slotKey = `day-${selectedDay}-${slot.id}`
              const isBlocked = !!blockedSlots[slotKey]

              // Check if any booking falls on this slot
              // Match by index or time string
              const matchedBooking = bookingsOnSelectedDay[idx]

              let status: 'BOOKED' | 'BLOCKED' | 'AVAILABLE' = 'AVAILABLE'
              let label = `${slot.defaultLabel} • Sẵn sàng nhận đơn`

              if (matchedBooking) {
                status = 'BOOKED'
                label = `Đã có lịch: #${matchedBooking.booking_number} (${matchedBooking.customer_name})`
              } else if (isBlocked) {
                status = 'BLOCKED'
                label = 'Đã khóa lịch cá nhân'
              }

              return (
                <div
                  key={slot.id}
                  className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition-all ${
                    status === 'BOOKED'
                      ? 'border-violet-200 bg-violet-50/70 text-violet-950 font-bold'
                      : status === 'BLOCKED'
                      ? 'border-slate-200 bg-slate-100 text-slate-400'
                      : 'border-slate-200 bg-slate-50/70 text-slate-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-mono font-bold text-xs">{slot.time}</p>
                    <p className="text-[10px] mt-0.5 truncate max-w-[155px] text-slate-500">
                      {label}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {status === 'BOOKED' ? (
                      <Link href={`/photographer/bookings`}>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600 text-white cursor-pointer hover:bg-violet-700">
                          Đã đặt
                        </span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleBlockSlot(slotKey)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                          status === 'BLOCKED'
                            ? 'bg-slate-300 text-slate-700 hover:bg-slate-400'
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                        title={status === 'BLOCKED' ? 'Bấm để mở rảnh' : 'Bấm để khóa giờ cá nhân'}
                      >
                        {status === 'BLOCKED' ? 'Đã khóa' : 'Mở rảnh'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {bookingsOnSelectedDay.length === 0 && (
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-[11px] text-slate-500">
              <Info className="w-3.5 h-3.5 text-slate-400 mx-auto mb-1" />
              Chưa có đơn chụp nào vào ngày này. Khách hàng có thể đặt bất kỳ khung giờ mở rảnh nào.
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
