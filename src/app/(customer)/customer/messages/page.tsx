'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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
  Calendar,
  Sparkles,
  Paperclip,
  Check
} from 'lucide-react'
import { DEMO_PHOTOGRAPHERS } from '@/lib/data/mock-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface MessageItem {
  id: string
  sender: 'customer' | 'photographer'
  text: string
  time: string
  image?: string
}

interface ConversationItem {
  id: string
  photographer: typeof DEMO_PHOTOGRAPHERS[0]
  bookingId: string
  packageName: string
  lastMessage: string
  lastTime: string
  unread: number
  messages: MessageItem[]
}

const DEFAULT_CONVERSATIONS: ConversationItem[] = [
  {
    id: 'chat-1',
    photographer: DEMO_PHOTOGRAPHERS[0],
    bookingId: 'BK-892104',
    packageName: 'Vibe Sài Gòn',
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
    packageName: 'Quick Date',
    lastMessage: 'Bạn yên tâm nha, mình sẽ gợi ý từng dáng nhẹ nhàng tự nhiên nhất!',
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

const QUICK_SUGGESTIONS = [
  '📍 Địa điểm hẹn ở đâu đẹp nhất?',
  '👗 Gợi ý trang phục phù hợp concept?',
  '⏰ Có thể dời lịch sớm hơn 30 phút không?',
  '📸 Khi nào em nhận được ảnh chỉnh màu?'
]

const SAMPLE_PHOTO_ATTACHMENTS = [
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80',
]

function CustomerMessagesContent() {
  const searchParams = useSearchParams()
  const photographerQuery = searchParams.get('photographer') || searchParams.get('photographerId')
  const bookingQuery = searchParams.get('bookingId')

  const [conversations, setConversations] = useState<ConversationItem[]>(DEFAULT_CONVERSATIONS)
  const [activeChatId, setActiveChatId] = useState<string>('chat-1')
  const [inputText, setInputText] = useState<string>('')
  const [phoneWarning, setPhoneWarning] = useState<boolean>(false)
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showPhotoPicker, setShowPhotoPicker] = useState<boolean>(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load conversations from localStorage on mount and listen to changes
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('flashy_chat_threads_v1')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setConversations(parsed)
          }
        }
      } catch {}
    }

    handleSync()
    window.addEventListener('storage', handleSync)
    window.addEventListener('flashy_chat_updated', handleSync)
    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('flashy_chat_updated', handleSync)
    }
  }, [])

  // Handle URL query parameters to jump or create conversation
  useEffect(() => {
    if (photographerQuery) {
      const existing = conversations.find(c => c.photographer.id === photographerQuery || c.photographer.slug === photographerQuery)
      if (existing) {
        setActiveChatId(existing.id)
      } else {
        const targetPhoto = DEMO_PHOTOGRAPHERS.find(p => p.id === photographerQuery || p.slug === photographerQuery) || DEMO_PHOTOGRAPHERS[0]
        const newChat: ConversationItem = {
          id: `chat-${Date.now()}`,
          photographer: targetPhoto,
          bookingId: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
          packageName: 'Tư vấn dịch vụ',
          lastMessage: `Xin chào! Bạn quan tâm đến dịch vụ chụp của ${targetPhoto.display_name}?`,
          lastTime: 'Vừa xong',
          unread: 0,
          messages: [
            {
              id: `m-welcome-${Date.now()}`,
              sender: 'photographer',
              text: `Chào bạn! Mình là ${targetPhoto.display_name}. Rất vui được trao đổi với bạn về concept chụp sắp tới nhé!`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          ]
        }
        setConversations(prev => {
          const updated = [newChat, ...prev]
          try {
            localStorage.setItem('flashy_chat_threads_v1', JSON.stringify(updated))
          } catch {}
          return updated
        })
        setActiveChatId(newChat.id)
      }
    } else if (bookingQuery) {
      const match = conversations.find(c => c.bookingId === bookingQuery)
      if (match) {
        setActiveChatId(match.id)
      }
    }
  }, [photographerQuery, bookingQuery])

  // Scroll to bottom whenever active messages change
  const currentChat = conversations.find(c => c.id === activeChatId) || conversations[0]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentChat?.messages, isTyping])

  // Save to localStorage helper
  const persistConversations = (updated: ConversationItem[]) => {
    setConversations(updated)
    try {
      localStorage.setItem('flashy_chat_threads_v1', JSON.stringify(updated))
      window.dispatchEvent(new Event('flashy_chat_updated'))
    } catch {}
  }

  // Play audio chime
  const playNotificationChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1) // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc.start()
      osc.stop(ctx.currentTime + 0.3)
    } catch {}
  }

  // Phone number detection regex for privacy warning
  const phoneRegex = /(\+?84|0)(3|5|7|8|9)[0-9]{8}/g

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputText(val)
    setPhoneWarning(phoneRegex.test(val))
  }

  // Send message
  const sendMessage = (textToSend: string, imageToSend?: string) => {
    if (!textToSend.trim() && !imageToSend) return

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const newMsg: MessageItem = {
      id: `m-${Date.now()}`,
      sender: 'customer',
      text: textToSend.trim(),
      time: timeStr,
      image: imageToSend,
    }

    const updated = conversations.map(c => {
      if (c.id === currentChat.id) {
        return {
          ...c,
          lastMessage: imageToSend ? '[Ảnh đính kèm]' : textToSend.trim(),
          lastTime: timeStr,
          messages: [...c.messages, newMsg]
        }
      }
      return c
    })

    persistConversations(updated)
    setInputText('')
    setPhoneWarning(false)
    setShowPhotoPicker(false)

    // Simulate Photographer smart reply after 1.2s
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      playNotificationChime()

      let replyText = `Dạ anh/chị yên tâm nhé! Em đã ghi nhận và sẽ chuẩn bị chu đáo nhất cho buổi chụp 📸`
      const lower = textToSend.toLowerCase()
      if (lower.includes('địa điểm') || lower.includes('ở đâu')) {
        replyText = `Dạ em gợi ý mình gặp ở Bưu Điện TP hoặc Nhà Hát TP tầm 15:30 để đón ánh sáng đẹp nhất nhé bạn!`
      } else if (lower.includes('trang phục') || lower.includes('mặc')) {
        replyText = `Bạn nên chọn đồ màu pastel hoặc tone trắng/be để lên màu ảnh vintage trong trẻo nhé!`
      } else if (lower.includes('giờ') || lower.includes('lịch') || lower.includes('sớm') || lower.includes('muộn')) {
        replyText = `Dạ được bạn nha, em có thể linh hoạt trước 30 phút, hẹn gặp bạn đúng giờ nhé!`
      } else if (lower.includes('ảnh') || lower.includes('màu') || lower.includes('retouch')) {
        replyText = `Ảnh gốc sẽ có ngay sau buổi chụp, còn ảnh chỉnh màu sẽ trả đủ trong vòng 48h trên kho ảnh FLASHY ạ!`
      } else if (imageToSend) {
        replyText = `Moodboard/ảnh mẫu này quá đẹp! Em sẽ setup góc chụp và ánh sáng đúng theo phong cách này cho bạn nha.`
      }

      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const replyMsg: MessageItem = {
        id: `m-reply-${Date.now()}`,
        sender: 'photographer',
        text: replyText,
        time: replyTime,
      }

      setConversations(latest => {
        const withReply = latest.map(c => {
          if (c.id === currentChat.id) {
            return {
              ...c,
              lastMessage: replyText,
              lastTime: replyTime,
              unread: 0,
              messages: [...c.messages, replyMsg]
            }
          }
          return c
        })
        try {
          localStorage.setItem('flashy_chat_threads_v1', JSON.stringify(withReply))
          window.dispatchEvent(new Event('flashy_chat_updated'))
        } catch {}
        return withReply
      })
    }, 1200)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputText)
  }

  const filteredConversations = conversations.filter(c =>
    c.photographer.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.bookingId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Main Chat Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[750px]">
          
          {/* Left: Conversations list */}
          <div className="border-r border-slate-100 flex flex-col h-full bg-slate-50/50">
            <div className="p-4 border-b border-slate-100 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-black text-slate-900 text-lg">Tin Nhắn Trao Đổi</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Trò chuyện trực tiếp với thợ chụp</p>
                </div>
                <Badge variant="outline" className="text-[11px] text-emerald-600 border-emerald-200 bg-emerald-50">
                  Realtime Active
                </Badge>
              </div>
            </div>

            <div className="p-3 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm cuộc trò chuyện..."
                  className="pl-8 h-9 text-xs rounded-xl bg-slate-50 border-slate-200"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredConversations.map((c) => {
                const isActive = c.id === currentChat?.id
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
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-violet-600 font-mono font-medium">#{c.bookingId}</span>
                        <span className="text-[10px] text-slate-400">• {c.packageName}</span>
                      </div>
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
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Đang online • Lịch hẹn #{currentChat.bookingId} ({currentChat.packageName})
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
                <Link href={`/photographers/${currentChat.photographer.slug}`}>
                  <Button variant="ghost" size="sm" className="rounded-xl text-xs h-8 text-slate-600">
                    Hồ sơ thợ
                  </Button>
                </Link>
              </div>
            </div>

            {/* Privacy Shield Banner */}
            <div className="bg-amber-50/80 border-b border-amber-100 px-4 py-2 flex items-center justify-between text-[11px] text-amber-900">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Bảo vệ Escrow 48h: FLASHY tự động cảnh báo chia sẻ số điện thoại ngoài sàn nhằm ngăn ngừa rủi ro.</span>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
              {currentChat.messages.map((m) => {
                const isMe = m.sender === 'customer'
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[78%] rounded-2xl p-3 text-xs leading-relaxed ${
                        isMe
                          ? 'bg-violet-600 text-white rounded-tr-none shadow-sm'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm'
                      }`}
                    >
                      {m.image && (
                        <div className="mb-2 rounded-xl overflow-hidden relative w-48 h-32 border border-black/10">
                          <Image src={m.image} alt="Attachment" fill className="object-cover" />
                        </div>
                      )}
                      <div>{m.text}</div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                      <span>{m.time}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-violet-500" />}
                    </div>
                  </div>
                )
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-2xl w-fit rounded-tl-none shadow-sm animate-pulse">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span>{currentChat.photographer.display_name} đang soạn tin nhắn...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Phone Detection Warning Popup */}
            {phoneWarning && (
              <div className="p-2.5 mx-4 mb-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>
                  <strong>Cảnh báo an toàn:</strong> Bạn vừa nhập thông tin có thể là số điện thoại. Để đảm bảo cơ chế bảo hiểm Escrow 48h, vui lòng trao đổi trong nền tảng FLASHY.
                </span>
              </div>
            )}

            {/* Quick Suggestion Chips */}
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/70 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold whitespace-nowrap">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Gợi ý nhanh:
              </span>
              {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(suggestion)}
                  className="px-2.5 py-1 text-[11px] rounded-full bg-white border border-slate-200 hover:border-violet-400 hover:text-violet-700 text-slate-600 transition-all whitespace-nowrap shadow-xs"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Photo Attachment Picker Overlay */}
            {showPhotoPicker && (
              <div className="p-3 border-t border-slate-200 bg-slate-100 flex items-center gap-3">
                <span className="text-xs text-slate-600 font-semibold">Chọn ảnh concept mẫu:</span>
                <div className="flex gap-2">
                  {SAMPLE_PHOTO_ATTACHMENTS.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => sendMessage('Em gửi mẫu concept này anh xem thử nha!', img)}
                      className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-white hover:border-violet-600 cursor-pointer shadow-sm hover:scale-105 transition-all"
                    >
                      <Image src={img} alt="concept" fill className="object-cover" />
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPhotoPicker(false)}
                  className="ml-auto text-xs text-slate-400"
                >
                  Đóng
                </Button>
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleFormSubmit} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPhotoPicker(!showPhotoPicker)}
                className="h-10 w-10 rounded-xl text-slate-500 hover:text-violet-600 hover:bg-violet-50"
                title="Gửi ảnh concept mẫu"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Input
                value={inputText}
                onChange={handleTextChange}
                placeholder="Nhập tin nhắn trao đổi về buổi chụp..."
                className="flex-1 h-11 rounded-2xl text-xs bg-slate-50 border-slate-200 focus:bg-white"
              />
              <Button
                type="submit"
                disabled={!inputText.trim()}
                className="h-11 px-5 rounded-2xl bg-brand hover:opacity-90 font-bold text-xs shadow-md disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>

          </div>
        </div>

      </div>
    </div>
  )
}

export default function CustomerMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">Đang tải cuộc trò chuyện...</p>
          </div>
        </div>
      }
    >
      <CustomerMessagesContent />
    </Suspense>
  )
}

