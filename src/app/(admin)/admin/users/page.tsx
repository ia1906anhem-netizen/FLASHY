'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Users,
  Search,
  ShieldCheck,
  Ban,
  CheckCircle2,
  Filter,
  UserCheck,
  MoreVertical,
  UserX
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getRegisteredUsersList } from '@/lib/data/booking-store'

interface UserItem {
  id: string
  name: string
  email: string
  role: 'CUSTOMER' | 'PHOTOGRAPHER' | 'ADMIN'
  joined: string
  bookings: number
  coins: number
  is_active: boolean
  avatar?: string
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'CUSTOMER' | 'PHOTOGRAPHER' | 'ADMIN'>('all')
  const [users, setUsers] = useState<UserItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const loadUsers = () => {
    const list = getRegisteredUsersList()
    setUsers(list)
    setIsLoaded(true)
  }

  useEffect(() => {
    loadUsers()
    window.addEventListener('flashy_admin_updated', loadUsers)
    window.addEventListener('storage', loadUsers)
    return () => {
      window.removeEventListener('flashy_admin_updated', loadUsers)
      window.removeEventListener('storage', loadUsers)
    }
  }, [])

  const toggleUserActive = (id: string) => {
    try {
      const raw = localStorage.getItem('flashy_registered_users')
      if (raw) {
        const parsed = JSON.parse(raw)
        // Find user by id or key
        for (const k of Object.keys(parsed)) {
          if (parsed[k].id === id || k === id || parsed[k].email === id) {
            parsed[k].is_active = parsed[k].is_active === false ? true : false
            break
          }
        }
        localStorage.setItem('flashy_registered_users', JSON.stringify(parsed))
      }
    } catch {}

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          return { ...u, is_active: !u.is_active }
        }
        return u
      })
    )
  }

  const filtered = users.filter((u) => {
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
            Danh sách tài khoản khách hàng, thợ chụp và quản trị viên hệ thống (Thời gian thực)
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-sm">
          Tổng số tài khoản: <span className="font-bold text-violet-700">{users.length}</span>
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
          {users.length === 0 ? (
            <div className="py-14 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="w-12 h-12 mx-auto rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mb-3">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">Chưa có tài khoản người dùng nào (Clean Slate)</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Hệ thống chưa có người dùng đăng ký. Khi khách hàng hoặc nhiếp ảnh gia tạo tài khoản thật, danh sách sẽ tự động cập nhật ngay tại đây.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              Không tìm thấy người dùng nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
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
                          {u.avatar ? (
                            <Image src={u.avatar} alt={u.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-violet-100 text-violet-700 font-bold text-xs">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <Badge
                        variant={u.role === 'ADMIN' ? 'default' : u.role === 'PHOTOGRAPHER' ? 'verified' : 'secondary'}
                        className="text-[10px]"
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3.5 text-slate-500">{u.joined}</td>
                    <td className="py-3.5 font-bold text-slate-800">{u.bookings} đơn</td>
                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
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
          )}
        </div>
      </Card>
    </div>
  )
}
