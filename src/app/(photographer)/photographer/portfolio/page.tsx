'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  FolderOpen,
  Plus,
  Trash2,
  Camera,
  CheckCircle2,
  Sparkles,
  Eye,
  Star,
  UploadCloud,
  ImageIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const SAMPLE_DEMO_PHOTOS = [
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
]

export default function PhotographerPortfolioPage() {
  const [photos, setPhotos] = useState<string[]>([])
  const [newUrl, setNewUrl] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('flashy_photographer_portfolio')
      if (stored) {
        setPhotos(JSON.parse(stored))
      } else {
        // Default clean state: empty array []
        setPhotos([])
      }
    } catch {
      setPhotos([])
    }
    setIsLoaded(true)
  }, [])

  const savePhotos = (updated: string[]) => {
    setPhotos(updated)
    try {
      localStorage.setItem('flashy_photographer_portfolio', JSON.stringify(updated))
    } catch {}
  }

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUrl.trim()) return
    const updated = [newUrl.trim(), ...photos]
    savePhotos(updated)
    setNewUrl('')
  }

  const handleDelete = (index: number) => {
    const updated = photos.filter((_, i) => i !== index)
    savePhotos(updated)
  }

  const handleLoadDemo = () => {
    savePhotos(SAMPLE_DEMO_PHOTOS)
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý Album & Portfolio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Những tác phẩm tiêu biểu hiển thị trên trang hồ sơ công khai của bạn ({photos.length} ảnh)
          </p>
        </div>

        {/* Add photo input */}
        <form onSubmit={handleAddPhoto} className="flex gap-2">
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Dán link ảnh mới (URL)..."
            className="h-10 text-xs rounded-xl w-64 bg-white"
          />
          <Button
            type="submit"
            size="sm"
            className="bg-brand text-white rounded-xl text-xs font-bold h-10 px-4 shadow-sm hover:opacity-90 flex-shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            Thêm ảnh
          </Button>
        </form>
      </div>

      {/* Empty State when no photos exist */}
      {isLoaded && photos.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 md:p-14 border border-slate-200 text-center shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1.5">
            Chưa có tác phẩm nào trong Portfolio
          </h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed max-w-sm mx-auto">
            Hồ sơ portfolio đang trống. Hãy thêm các tác phẩm ấn tượng nhất của bạn để thể hiện phong cách chụp, thu hút khách hàng và gia tăng đơn đặt lịch!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              type="button"
              onClick={handleLoadDemo}
              variant="outline"
              className="rounded-xl font-bold text-xs h-10 px-5 text-violet-700 border-violet-200 hover:bg-violet-50"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-violet-600" />
              Nạp bộ ảnh mẫu thử nghiệm
            </Button>
          </div>
        </div>
      ) : (
        /* Grid of Portfolio Works */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-[3/4] rounded-3xl overflow-hidden group bg-slate-100 border border-slate-200 shadow-sm"
            >
              <Image
                src={img}
                alt={`Portfolio ${idx}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />

              <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {idx === 0 ? 'Ảnh bìa chính' : `Ảnh ${idx + 1}`}
              </div>

              <button
                type="button"
                onClick={() => handleDelete(idx)}
                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-rose-700"
                title="Xóa khỏi portfolio"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
