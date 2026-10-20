import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ChevronLeft, EllipsisVertical, Phone, Send, Smile } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { AppScreen } from '@/components/ui/AppScreen'
import { useToast } from '@/hooks/useToast'

interface ChatMessage {
  text: string
  own: boolean
  time: string
}

const startingMessages: ChatMessage[] = [
  { text: 'नमस्कार स्वातीजी, आपले प्रोफाइल आवडले.', own: false, time: '10:30 AM' },
  { text: 'धन्यवाद!', own: true, time: '10:31 AM' },
  { text: 'आपण कुठे काम करता?', own: true, time: '10:32 AM' },
  { text: 'मी मुंबई येथे शिक्षिका आहे.', own: false, time: '10:32 AM' },
  { text: 'छान! आपल्याशी बोलून आनंद झाला. 😊', own: true, time: '10:33 AM' },
]

const profilePhoto =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&h=128&q=80'

export function ChatPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [messages, setMessages] = useState(startingMessages)
  const [draft, setDraft] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    setMessages((current) => [...current, { text, own: true, time: 'Now' }])
    setDraft('')
  }

  return (
    <AppScreen safeBottom={false} className="bg-[#fffaf8]">
      <header className="sticky top-0 z-30 flex h-[var(--app-main-header-height)] shrink-0 items-center gap-2 border-b border-line bg-white px-3 shadow-bar">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => void navigate(-1)}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-maroon hover:bg-rose"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="relative size-10 shrink-0">
          <img src={profilePhoto} alt="" className="size-full rounded-full object-cover" />
          <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-white bg-emerald-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">स्वाती जोशी</p>
          <p className="text-[10px] text-muted">Online</p>
        </div>
        <button
          type="button"
          aria-label="Call Swati"
          onClick={() => toast.info('Calling will be available when your account is connected')}
          className="flex size-10 items-center justify-center rounded-full text-maroon hover:bg-rose"
        >
          <Phone className="size-[18px]" />
        </button>
        <button
          type="button"
          aria-label="More conversation options"
          onClick={() => toast.info('Conversation options will be available soon')}
          className="flex size-10 items-center justify-center rounded-full text-maroon hover:bg-rose"
        >
          <EllipsisVertical className="size-[18px]" />
        </button>
      </header>

      <div
        aria-label="Conversation with Swati Joshi"
        aria-live="polite"
        className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-y-contain px-3 py-3"
      >
        <p className="mx-auto max-w-[92%] rounded-full bg-cream-dark px-3 py-1 text-center text-[10px] text-muted">
          Messaging will be available once your account is connected.
        </p>
        {messages.map((message, index) => (
          <div
            key={`${message.time}-${index}`}
            className={`max-w-[82%] rounded-2xl px-3 py-2.5 shadow-soft ${message.own ? 'self-end rounded-br-md bg-[#e9f4df] text-ink' : 'self-start rounded-bl-md bg-white text-ink'}`}
          >
            <p className="text-[13px] leading-[1.55]">{message.text}</p>
            <p className="mt-0.5 text-right text-[9px] text-muted">{message.time}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="flex shrink-0 items-center gap-2 border-t border-line bg-white px-3 py-2.5 pb-safe"
      >
        <div className="flex h-10 min-w-0 flex-1 items-center rounded-full border border-line bg-white pl-3.5 pr-1.5">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type a message..."
            aria-label="Message"
            className="min-w-0 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-muted"
          />
          <button
            type="button"
            aria-label="Add emoji"
            onClick={() => setDraft((value) => `${value}😊`)}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-rose hover:text-maroon"
          >
            <Smile className="size-[18px]" />
          </button>
        </div>
        <button
          type="submit"
          aria-label="Send message"
          disabled={!draft.trim()}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-maroon text-white shadow-soft transition hover:bg-maroon-dark disabled:opacity-70"
        >
          <Send className="size-[17px]" />
        </button>
      </form>
    </AppScreen>
  )
}
