'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Users,
  Search,
  ShieldCheck,
  Ban,
  CheckCircle2,
  Filter,
  UserCheck,
  MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'CUSTOMER' | 'PHOTOGRAPHER' | 'ADMIN'>('all')

  const [users, setUsers] = useState([
    {
      id: 'USR-01',
      name: 'Nguyễn Thu Trang',
      email: 'thutrang.nguyen@example.com',
      role: 'CUSTOMER',
      joined: '10/01/2026',
      bookings: 3,
      coins: 280,
      is_active: true,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
    },
    {
      id: 'USR-02',
      name: 'Minh Trí (TriStreet)',
      email: 'minhtri.photo@example.com',
      role: 'PHOTOGRAPHER',
      joined: '12/12/2025',
      bookings: 48,
      coins: 0,
      is_active: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
    },
    {
      id: 'USR-03',
      name: 'Trần Minh Hoàng',
      email: 'hoang.tran@example.com',
      role: 'CUSTOMER',
      joined: '02/02/2026',
      bookings: 2,
      coins: 140,
      is_active: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    },
    {
      id: 'USR-04',
      name: 'Lê Bảo Visuals',
      email: 'lebao.art@example.com',
      role: 'PHOTOGRAPHER',
      joined: '15/01/2026',
      bookings: 31,
      coins: 0,
      is_active: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    },
    {
      id: 'USR-00',
      name: 'Quản Trị Viên FLASHY',
      email: 'admin@flashy.vn',
      role: 'ADMIN',
      joined: '01/01/2025',
      bookings: 0,
      coins: 0,
      is_active: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
    }
  ])

  const toggleUserActive = (id: string) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        return { ...u, is_active: !u.is_active }
      }
      return u
    }))
  }

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý Người Dùng & Phân Quyền
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Danh sách tài khoản khách hàng, thợ chụp và quản trị viên hệ thống
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo họ tên hoặc email người dùng..."
            className="pl-10 h-10 rounded-xl text-xs"
          />
        </div>

        <div className="flex gap-2">
          {['all', 'CUSTOMER', 'PHOTOGRAPHER', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                roleFilter === r
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {r === 'all' ? 'Tất cả' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                <th className="pb-3 font-bold">Người Dùng</th>
                <th className="pb-3 font-bold">Vai Trò</th>
                <th className="pb-3 font-bold">Ngày Tham Gia</th>
                <th className="pb-3 font-bold">Số Đơn</th>
                <th className="pb-3 font-bold">Trạng Thái</th>
                <th className="pb-3 font-bold">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60">
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                        <Image src={u.avatar} alt={u.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <Badge variant={u.role === 'ADMIN' ? 'default' : u.role === 'PHOTOGRAPHER' ? 'verified' : 'secondary'} className="text-[10px]">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="py-3.5 text-slate-500">{u.joined}</td>
                  <td className="py-3.5 font-bold text-slate-800">{u.bookings} đơn</td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {u.is_active ? 'Hoạt động' : 'Tạm khóa'}
                    </span>
                  </td>
                  <td className="py-3.5">
                    {u.role !== 'ADMIN' && (
                      <button
                        onClick={() => toggleUserActive(u.id)}
                        className={`text-xs font-bold hover:underline ${
                          u.is_active ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {u.is_active ? 'Khóa tài khoản' : 'Mở khóa'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  )
}
