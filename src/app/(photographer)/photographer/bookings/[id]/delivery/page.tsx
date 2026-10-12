'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronLeft,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Clock,
  Sparkles,
  Camera,
  FolderOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PhotographerDeliveryPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params?.id as string

  const [activeCategory, setActiveCategory] = useState<'edited' | 'original' | 'retouch'>('edited')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [deliverySubmitted, setDeliverySubmitted] = useState(false)

  // Demo uploaded files
  const [files, setFiles] = useState([
    {
      id: 'f-1',
      name: 'IMG_4812_ColorGraded.jpg',
      size: '8.4 MB',
      category: 'edited',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600',
    },
    {
      id: 'f-2',
      name: 'IMG_4815_ColorGraded.jpg',
      size: '9.1 MB',
      category: 'edited',
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600',
    },
    {
      id: 'f-3',
      name: 'IMG_4820_ColorGraded.jpg',
      size: '7.8 MB',
      category: 'edited',
      url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600',
    },
    {
      id: 'f-4',
      name: 'IMG_4830_RAW.jpg',
      size: '24.2 MB',
      category: 'original',
      url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600',
    }
  ])

  const handleSimulateUpload = () => {
    setIsUploading(true)
    setUploadProgress(10)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          // Add new photo
          const newPhoto = {
            id: `f-${Date.now()}`,
            name: `IMG_${Math.floor(1000 + Math.random() * 9000)}_${activeCategory}.jpg`,
            size: `${(Math.random() * 8 + 5).toFixed(1)} MB`,
            category: activeCategory,
            url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600',
          }
          setFiles((f) => [newPhoto, ...f])
          return 0
        }
        return prev + 30
      })
    }, 400)
  }

  const handleDeleteFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id))
  }

  const handleSubmitFinalDelivery = () => {
    if (files.filter(f => f.category === 'edited').length === 0) {
      alert('Vui lòng tải lên tối thiểu ảnh chỉnh màu trước khi gửi bàn giao!')
      return
    }
    setDeliverySubmitted(true)
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <Link href="/photographer/bookings" className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 mb-2 font-medium">
          <ChevronLeft className="w-4 h-4" />
          Quay lại danh sách đơn chụp
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              Tải Lên Bàn Giao File Ảnh #{bookingId || 'BK-892104'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Khách hàng: Nguyễn Thu Trang • Gói Vibe Sài Gòn (Yêu cầu: Toàn bộ ảnh gốc + 40 ảnh chỉnh màu)
            </p>
          </div>

          <Button
            onClick={handleSubmitFinalDelivery}
            disabled={deliverySubmitted}
            className="bg-brand hover:opacity-90 text-white rounded-xl text-xs font-bold h-11 px-6 shadow-md"
          >
            <FileCheck className="w-4 h-4 mr-1.5" />
            {deliverySubmitted ? '✓ Đã bàn giao cho khách' : 'Gửi bàn giao & Kích hoạt 48h'}
          </Button>
        </div>
      </div>

      {deliverySubmitted && (
        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <h4 className="font-bold text-sm text-emerald-800">Đã Hoàn Thành Gửi Bàn Giao!</h4>
            <p className="mt-1 leading-relaxed">
              Hệ thống đã thông báo cho khách hàng và bắt đầu đồng hồ kiểm duyệt <strong>48 giờ Escrow</strong>. Nếu khách hàng duyệt sớm hoặc sau 48h không có khiếu nại, tiền thù lao sẽ tự động chuyển sang số dư khả dụng để rút về tài khoản ngân hàng của bạn.
            </p>
          </div>
        </div>
      )}

      {/* Upload Zone Card */}
      <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
        
        {/* Category Picker */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { id: 'edited', label: '1. Ảnh chỉnh màu (Color Graded)' },
            { id: 'original', label: '2. Toàn bộ file gốc (RAW / JPEG)' },
            { id: 'retouch', label: '3. Ảnh Retouch chuyên sâu' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Drag & Drop Upload Zone */}
        <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center mx-auto mb-3">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mb-1">
            Kéo thả ảnh hoặc bấm để tải lên phân loại ({activeCategory.toUpperCase()})
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Hỗ trợ file JPG, PNG, RAW lên đến 50MB/file. Tải trực tiếp lên Supabase Storage với chữ ký bảo mật.
          </p>

          <Button
            onClick={handleSimulateUpload}
            disabled={isUploading}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold h-10 px-6"
          >
            {isUploading ? `Đang tải lên... ${uploadProgress}%` : '+ Chọn tệp từ máy tính'}
          </Button>

          {isUploading && (
            <div className="w-full max-w-xs mx-auto bg-slate-200 h-2 rounded-full overflow-hidden mt-4">
              <div
                className="bg-brand h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Uploaded Files Table / Grid */}
      <Card className="rounded-3xl border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 text-sm">
            Danh Sách Tệp Đã Tải Lên ({files.length} tệp)
          </h3>
          <span className="text-xs text-slate-400">
            Tổng dung lượng: 49.5 MB
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {files.map((file) => (
            <div key={file.id} className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group">
              <div className="relative aspect-video w-full bg-slate-200">
                <Image src={file.url} alt={file.name} fill className="object-cover" />
                <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/60 text-white uppercase">
                  {file.category}
                </span>
                <button
                  onClick={() => handleDeleteFile(file.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Xóa tệp"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-3 text-xs">
                <p className="font-bold text-slate-800 truncate">{file.name}</p>
                <p className="text-[11px] text-slate-400">{file.size}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  )
}
