'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare,
  Send,
  Search,
  Image as ImageIcon,
  Info,
  Phone,
  MoreVertical,
  Clock,
  CheckCheck,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTimeVN } from '@/lib/utils'
import { toast } from 'sonner'

const DEMO_CONVERSATIONS = [
  {
    id: 'c1',
    customer: {
      name: 'Hoa Mai Nguyễn',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop',
    },
    booking_ref: 'FL9A2B3C',
    package: 'Quick Date',
    last_message: 'Anh ơi, chỗ hẹn là cà phê Nhĩ Hà đúng không ạ?',
    last_message_time: new Date(Date.now() - 5 * 60000).toISOString(),
    unread: 2,
    shoot_date: '15/10/2026',
  },
  {
    id: 'c2',
    customer: {
      name: 'Bình An Trần',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=60&h=60&fit=crop',
    },
    booking_ref: 'FL7D8E9F',
    package: 'Vibe Sài Gòn',
    last_message: 'Em đã chọn xong 10 ảnh retouch rồi ạ. Anh check nhé!',
    last_message_time: new Date(Date.now() - 3 * 3600000).toISOString(),
    unread: 0,
    shoot_date: '12/10/2026',
  },
  {
    id: 'c3',
    customer: {
      name: 'Thanh Huyền Lê',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop',
    },
    booking_ref: 'FL1A2B3C',
    package: 'Flash Shot',
    last_message: 'Cảm ơn anh nhiều lắm! Ảnh đẹp quá 😍',
    last_message_time: new Date(Date.now() - 2 * 86400000).toISOString(),
    unread: 0,
    shoot_date: '08/10/2026',
  },
]

interface MessageItem {
  id: string
  role: 'customer' | 'photographer'
  text: string
  time: string
  read: boolean
}

const DEMO_MESSAGES: Record<string, MessageItem[]> = {
  c1: [
    { id: 'm1', role: 'customer', text: 'Anh ơi cho em hỏi, mình mặc gì đi chụp ạ?', time: new Date(Date.now() - 30 * 60000).toISOString(), read: true },
    { id: 'm2', role: 'photographer', text: 'Bạn mặc màu tươi sáng hoặc pastel là đẹp nhất nhé! Tránh kẻ sọc nhỏ và họa tiết quá rối.', time: new Date(Date.now() - 25 * 60000).toISOString(), read: true },
    { id: 'm3', role: 'customer', text: 'Dạ em hiểu rồi. Còn địa điểm thì mình gặp ở đâu ạ?', time: new Date(Date.now() - 10 * 60000).toISOString(), read: true },
    { id: 'm4', role: 'customer', text: 'Anh ơi, chỗ hẹn là cà phê Nhĩ Hà đúng không ạ?', time: new Date(Date.now() - 5 * 60000).toISOString(), read: false },
  ],
  c2: [
    { id: 'm5', role: 'customer', text: 'Em đã chọn xong 10 ảnh retouch rồi ạ. Anh check nhé!', time: new Date(Date.now() - 3 * 3600000).toISOString(), read: true },
  ],
  c3: [
    { id: 'm6', role: 'photographer', text: 'Mình đã giao đủ 5 ảnh nhé! Hy vọng bạn thích 📸', time: new Date(Date.now() - 2 * 86400000 - 60000).toISOString(), read: true },
    { id: 'm7', role: 'customer', text: 'Cảm ơn anh nhiều lắm! Ảnh đẹp quá 😍', time: new Date(Date.now() - 2 * 86400000).toISOString(), read: true },
  ],
}

interface ConversationDisplay {
  id: string
  customer: {
    name: string
    avatar: string
  }
  booking_ref: string
  package: string
  last_message: string
  last_message_time: string
  unread: number
  shoot_date: string
  isSyncedThread?: boolean
}

export default function PhotographerMessagesPage() {
  const [conversations, setConversations] = useState<ConversationDisplay[]>(DEMO_CONVERSATIONS)
  const [selectedConv, setSelectedConv] = useState<string | null>(DEMO_CONVERSATIONS[0].id)
  const [messages, setMessages] = useState<Record<string, MessageItem[]>>(DEMO_MESSAGES)
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')

  // Load and sync conversations from localStorage and listen to real-time events
  useEffect(() => {
    const syncFromStorage = () => {
      try {
        const savedThreads = localStorage.getItem('flashy_chat_threads_v1')
        let syncedList: ConversationDisplay[] = [...DEMO_CONVERSATIONS]
        let syncedMsgMap: Record<string, MessageItem[]> = { ...DEMO_MESSAGES }

        const photoMsgs = localStorage.getItem('flashy_photographer_msgs_v1')
        if (photoMsgs) {
          try {
            const parsedPhotoMsgs = JSON.parse(photoMsgs)
            syncedMsgMap = { ...syncedMsgMap, ...parsedPhotoMsgs }
          } catch {}
        }

        if (savedThreads) {
          const parsedThreads = JSON.parse(savedThreads)
          if (Array.isArray(parsedThreads) && parsedThreads.length > 0) {
            const formattedFromCustomer: ConversationDisplay[] = parsedThreads.map((t: any) => ({
              id: t.id,
              customer: {
                name: 'Thu Trang (Khách đặt)',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop',
              },
              booking_ref: t.bookingId || 'BK-892104',
              package: t.packageName || 'Vibe Sài Gòn',
              last_message: t.lastMessage || 'Chào bạn!',
              last_message_time: new Date().toISOString(),
              unread: 0,
              shoot_date: 'Hôm nay',
              isSyncedThread: true,
            }))

            parsedThreads.forEach((t: any) => {
              if (Array.isArray(t.messages)) {
                syncedMsgMap[t.id] = t.messages.map((m: any) => ({
                  id: m.id,
                  role: m.sender === 'photographer' ? 'photographer' : 'customer',
                  text: m.text,
                  time: new Date().toISOString(),
                  read: true,
                }))
              }
            })

            syncedList = [
              ...formattedFromCustomer,
              ...DEMO_CONVERSATIONS.filter(dc => !formattedFromCustomer.some(sc => sc.id === dc.id)),
            ]
          }
        }

        setConversations(syncedList)
        setMessages(syncedMsgMap)
      } catch {}
    }

    syncFromStorage()
    window.addEventListener('storage', syncFromStorage)
    window.addEventListener('flashy_chat_updated', syncFromStorage)
    return () => {
      window.removeEventListener('storage', syncFromStorage)
      window.removeEventListener('flashy_chat_updated', syncFromStorage)
    }
  }, [])

  const conv = selectedConv ? conversations.find(c => c.id === selectedConv) : null
  const convMessages = selectedConv ? (messages[selectedConv] || []) : []

  const filtered = conversations.filter(c =>
    c.customer.name.toLowerCase().includes(search.toLowerCase()) ||
    c.booking_ref.toLowerCase().includes(search.toLowerCase())
  )

  const handleSend = (overrideText?: string) => {
    const textToSend = overrideText || draft.trim()
    if (!textToSend || !selectedConv) return
    const newMsg: MessageItem = {
      id: `m${Date.now()}`,
      role: 'photographer',
      text: textToSend,
      time: new Date().toISOString(),
      read: true,
    }

    setMessages(prev => {
      const updated = {
        ...prev,
        [selectedConv]: [...(prev[selectedConv] || []), newMsg],
      }
      try {
        localStorage.setItem('flashy_photographer_msgs_v1', JSON.stringify(updated))
      } catch {}
      return updated
    })

    setConversations(prev =>
      prev.map(c =>
        c.id === selectedConv
          ? { ...c, last_message: textToSend, last_message_time: new Date().toISOString() }
          : c
      )
    )

    // Sync back to customer threads
    try {
      const savedThreads = localStorage.getItem('flashy_chat_threads_v1')
      if (savedThreads) {
        const parsedThreads = JSON.parse(savedThreads)
        if (Array.isArray(parsedThreads)) {
          const updatedThreads = parsedThreads.map((t: any) => {
            if (t.id === selectedConv) {
              return {
                ...t,
                lastMessage: textToSend,
                lastTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                messages: [
                  ...(t.messages || []),
                  {
                    id: `m-${Date.now()}`,
                    sender: 'photographer',
                    text: textToSend,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ],
              }
            }
            return t
          })
          localStorage.setItem('flashy_chat_threads_v1', JSON.stringify(updatedThreads))
          window.dispatchEvent(new Event('flashy_chat_updated'))
        }
      }
    } catch {}

    setDraft('')
    toast.success('Đã gửi tin nhắn đến khách hàng')
  }

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      {/* Conversation List */}
      <div className={`w-full md:w-80 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100">
          <h1 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-violet-500" />
            Tin nhắn
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm cuộc trò chuyện..."
              className="pl-9 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.map(conv => (
            <button
              key={conv.id}
              onClick={() => setSelectedConv(conv.id)}
              className={`w-full flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 text-left ${selectedConv === conv.id ? 'bg-violet-50 border-l-2 border-l-violet-500' : ''}`}
            >
              <div className="relative">
                <Avatar className="w-11 h-11">
                  <AvatarImage src={conv.customer.avatar} alt={conv.customer.name} />
                  <AvatarFallback>{conv.customer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {conv.unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-bold text-slate-800 truncate">{conv.customer.name}</p>
                  <span className="text-xs text-slate-400 flex-shrink-0 ml-1">{formatRelativeTimeVN(conv.last_message_time)}</span>
                </div>
                <p className="text-xs text-violet-600 font-medium mt-0.5">{conv.package} · #{conv.booking_ref}</p>
                <p className={`text-xs mt-0.5 truncate ${conv.unread > 0 ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                  {conv.last_message}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="p-3 bg-amber-50 border-t border-amber-200 text-xs text-amber-700">
          ⚠ Realtime chat yêu cầu kết nối Supabase
        </div>
      </div>

      {/* Chat Area */}
      {selectedConv && conv ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <button className="md:hidden text-slate-400 mr-1" onClick={() => setSelectedConv(null)}>
                ← 
              </button>
              <Avatar className="w-9 h-9">
                <AvatarImage src={conv.customer.avatar} alt={conv.customer.name} />
                <AvatarFallback>{conv.customer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-bold text-slate-800">{conv.customer.name}</p>
                <p className="text-xs text-violet-600">{conv.package} · {conv.shoot_date}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0"
                title="Thông tin đơn hàng"
                onClick={() => toast.info(`Đơn hàng #${conv.booking_ref} - ${conv.package}`)}
              >
                <Info className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0"
                title="Tùy chọn khác"
                onClick={() => toast.info('Tính năng báo cáo tin nhắn')}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="text-center">
              <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                📸 Buổi chụp: {conv.shoot_date} · #{conv.booking_ref}
              </span>
            </div>
            {convMessages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'photographer' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'customer' && (
                  <Avatar className="w-7 h-7 mr-2 mt-1 flex-shrink-0">
                    <AvatarImage src={conv.customer.avatar} />
                    <AvatarFallback>{conv.customer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[75%] ${msg.role === 'photographer' ? 'chat-bubble-sent' : 'bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-2.5'}`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <div className={`flex items-center gap-1 mt-1 ${msg.role === 'photographer' ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] opacity-60">{formatRelativeTimeVN(msg.time)}</span>
                    {msg.role === 'photographer' && (
                      <CheckCheck className={`w-3 h-3 ${msg.read ? 'text-blue-300' : 'opacity-50'}`} />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Replies for Photographer */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">Trả lời nhanh:</span>
            {[
              'Dạ mình đã chuẩn bị thiết bị xong, hẹn gặp bạn đúng giờ nhé! 📸',
              'Em gửi bạn trước vài góc chụp tham khảo nha!',
              'Ảnh đang được hoàn thiện màu, sẽ gửi bạn đúng hạn 48h ạ.'
            ].map((quick, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(quick)}
                className="px-2.5 py-1 text-[11px] rounded-full bg-white border border-slate-200 hover:border-violet-400 hover:text-violet-700 text-slate-600 transition-all whitespace-nowrap"
              >
                {quick}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="bg-white border-t border-slate-200 p-3 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-9 h-9 p-0 flex-shrink-0"
              onClick={() => toast.info('Gửi ảnh yêu cầu kết nối Supabase Storage')}
            >
              <ImageIcon className="w-5 h-5 text-slate-400" />
            </Button>
            <Input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Nhắn tin với khách hàng..."
              className="flex-1 text-sm"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!draft.trim()}
              size="sm"
              className="w-9 h-9 p-0 flex-shrink-0 bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Chọn cuộc trò chuyện</p>
            <p className="text-slate-400 text-sm">Chọn tin nhắn từ danh sách để xem</p>
          </div>
        </div>
      )}
    </div>
  )
}
