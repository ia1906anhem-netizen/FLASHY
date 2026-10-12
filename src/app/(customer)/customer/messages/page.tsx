'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Send,
  Camera,
  Image as ImageIcon,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Search,
  CheckCheck,
  Phone,
  Info,
  Calendar
} from 'lucide-react'
import { DEMO_PHOTOGRAPHERS } from '@/lib/data/mock-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export default function CustomerMessagesPage() {
  const [activeChatId, setActiveChatId] = useState<string>('chat-1')
  const [inputText, setInputText] = useState<string>('')
  const [phoneWarning, setPhoneWarning] = useState<boolean>(false)

  // Demo conversations
  const conversations = [
    {
      id: 'chat-1',
      photographer: DEMO_PHOTOGRAPHERS[0],
      bookingId: 'BK-892104',
      lastMessage: 'Dạ anh chuẩn bị xong 40 ảnh màu rồi, em xem trong kho ảnh nhé!',
      lastTime: '14:25',
      unread: 1,
      messages: [
        {
          id: 'm-1',
          sender: 'photographer',
          text: 'Chào bạn Thu Trang! Mình là Minh Trí đây, rất vui được đồng hành cùng bạn trong buổi chụp Vibe Sài Gòn chiều nay.',
          time: '13:00',
        },
        {
          id: 'm-2',
          sender: 'customer',
          text: 'Chào anh Trí! Chiều nay mình hẹn ở Bưu điện Thành phố trước hay Bến Bạch Đằng trước ạ?',
          time: '13:15',
        },
        {
          id: 'm-3',
          sender: 'photographer',
          text: 'Mình nên chụp Bưu điện tầm 15:30 để lấy ánh sáng trong, rồi qua Bạch Đằng đón hoàng hôn lúc 17:00 là đẹp nhất nhé bạn!',
          time: '13:20',
        },
        {
          id: 'm-4',
          sender: 'photographer',
          text: 'Dạ anh chuẩn bị xong 40 ảnh màu rồi, em xem trong kho ảnh nhé!',
          time: '14:25',
        }
      ]
    },
    {
      id: 'chat-2',
      photographer: DEMO_PHOTOGRAPHERS[1],
      bookingId: 'BK-781923',
      lastMessage: 'Cảm ơn bạn đã book lịch nhé, hẹn gặp sáng thứ Bảy!',
      lastTime: 'Hôm qua',
      unread: 0,
      messages: [
        {
          id: 'm-10',
          sender: 'customer',
          text: 'Chào bạn, gói Quick Date có hướng dẫn tạo dáng cho người mới không ạ?',
          time: '10:00',
        },
        {
          id: 'm-11',
          sender: 'photographer',
          text: 'Bạn yên tâm nha, mình sẽ gợi ý từng dáng nhẹ nhàng tự nhiên nhất!',
          time: '10:05',
        }
      ]
    }
  ]

  const currentChat = conversations.find(c => c.id === activeChatId) || conversations[0]

  // Phone number detection regex for privacy warning (Section 7.2 requirement)
  const phoneRegex = /(\+?84|0)(3|5|7|8|9)[0-9]{8}/g

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputText(val)
    if (phoneRegex.test(val)) {
      setPhoneWarning(true)
    } else {
      setPhoneWarning(false)
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    // Append mock message
    currentChat.messages.push({
      id: `m-${Date.now()}`,
      sender: 'customer',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })
    setInputText('')
    setPhoneWarning(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Main Chat Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[750px]">
          
          {/* Left: Conversations list */}
          <div className="border-r border-slate-100 flex flex-col h-full bg-slate-50/50">
            <div className="p-4 border-b border-slate-100 bg-white">
              <h2 className="font-black text-slate-900 text-lg">Tin Nhắn Trao Đổi</h2>
              <p className="text-xs text-slate-500 mt-0.5">Trò chuyện trực tiếp với nhiếp ảnh gia</p>
            </div>

            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm cuộc trò chuyện..."
                  className="pl-8 h-9 text-xs rounded-xl bg-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {conversations.map((c) => {
                const isActive = c.id === activeChatId
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveChatId(c.id)}
                    className={`p-4 cursor-pointer transition-colors flex items-start gap-3 ${
                      isActive ? 'bg-violet-50/80 border-l-4 border-violet-600' : 'hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="relative w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-slate-200">
                      <Image
                        src={c.photographer.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={c.photographer.display_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="font-bold text-slate-900 text-xs truncate">{c.photographer.display_name}</h4>
                        <span className="text-[10px] text-slate-400">{c.lastTime}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{c.lastMessage}</p>
                      <span className="text-[10px] text-violet-600 font-mono mt-1 inline-block">#{c.bookingId}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right: Active Chat Area */}
          <div className="md:col-span-2 flex flex-col h-full bg-white">
            
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-slate-100">
                  <Image
                    src={currentChat.photographer.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={currentChat.photographer.display_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900 text-sm">{currentChat.photographer.display_name}</h3>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Đang online • Lịch hẹn #{currentChat.bookingId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/customer/bookings/${currentChat.bookingId}/gallery`}>
                  <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold h-8 border-violet-200 text-violet-700 hover:bg-violet-50">
                    <ImageIcon className="w-3.5 h-3.5 mr-1" />
                    Kho ảnh
                  </Button>
                </Link>
              </div>
            </div>

            {/* Privacy Shield Banner (Section 7.2) */}
            <div className="bg-amber-50/70 border-b border-amber-100 px-4 py-2 flex items-center justify-between text-[11px] text-amber-900">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Bảo vệ quyền riêng tư: FLASHY tự động cảnh báo chia sẻ số điện thoại ngoài sàn nhằm ngăn ngừa gian lận.</span>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
              {currentChat.messages.map((m) => {
                const isMe = m.sender === 'customer'
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed ${
                        isMe
                          ? 'bg-violet-600 text-white rounded-tr-none shadow-sm'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
                  </div>
                )
              })}
            </div>

            {/* Phone Detection Warning Popup */}
            {phoneWarning && (
              <div className="p-2.5 mx-4 mb-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>
                  <strong>Cảnh báo an toàn:</strong> Bạn vừa nhập thông tin có thể là số điện thoại. Để đảm bảo cơ chế bảo hiểm Escrow 48h, vui lòng trao đổi và thanh toán trong nền tảng FLASHY.
                </span>
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
              <Input
                value={inputText}
                onChange={handleTextChange}
                placeholder="Nhập tin nhắn trao đổi về buổi chụp..."
                className="flex-1 h-11 rounded-2xl text-xs bg-slate-50 border-slate-200"
              />
              <Button type="submit" className="h-11 px-5 rounded-2xl bg-brand hover:opacity-90 font-bold text-xs shadow-md">
                <Send className="w-4 h-4" />
              </Button>
            </form>

          </div>
        </div>

      </div>
    </div>
  )
}
