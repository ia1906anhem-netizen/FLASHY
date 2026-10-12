'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  FolderOpen,
  Plus,
  Trash2,
  Camera,
  CheckCircle2,
  Sparkles,
  Eye,
  Star
} from 'lucide-react'
import { DEMO_PHOTOGRAPHERS } from '@/lib/data/mock-data'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function PhotographerPortfolioPage() {
  const photographer = DEMO_PHOTOGRAPHERS[0]
  const [photos, setFiles] = useState(photographer.portfolio_photos || [])
  const [newUrl, setNewUrl] = useState('')

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUrl) return
    setFiles([newUrl, ...photos])
    setNewUrl('')
  }

  const handleDelete = (index: number) => {
    setFiles(photos.filter((_, i) => i !== index))
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý Album & Portfolio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Những tác phẩm tiêu biểu hiển thị trên trang hồ sơ công khai của bạn
          </p>
        </div>

        <form onSubmit={handleAddPhoto} className="flex gap-2">
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Dán link ảnh mới (Unsplash/CDN)..."
            className="h-10 text-xs rounded-xl w-64"
          />
          <Button type="submit" size="sm" className="bg-brand text-white rounded-xl text-xs font-bold h-10 px-4">
            <Plus className="w-4 h-4 mr-1" />
            Thêm ảnh
          </Button>
        </form>
      </div>

      {/* Grid of Portfolio Works */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos.map((img, idx) => (
          <div key={idx} className="relative aspect-[3/4] rounded-3xl overflow-hidden group bg-slate-100 border border-slate-200 shadow-sm">
            <Image src={img} alt={`Portfolio ${idx}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {idx === 0 ? 'Ảnh bìa chính' : `Ảnh ${idx + 1}`}
            </div>

            <button
              onClick={() => handleDelete(idx)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="Xóa khỏi portfolio"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

    </div>
  )
}
