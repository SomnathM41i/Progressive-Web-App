import { useState } from 'react'
import type { FormEvent } from 'react'
import { Send } from 'lucide-react'

import { Page } from '@/components/ui/Page'

const startingMessages = [
  { text: 'Hello Swati, I liked your profile.', own: false, time: '10:30 AM' },
  { text: 'Thank you! I liked yours too.', own: true, time: '10:31 AM' },
  { text: 'What do you enjoy doing in your free time?', own: true, time: '10:32 AM' },
  {
    text: 'I enjoy travelling and spending time with family.',
    own: false,
    time: '10:33 AM',
  },
]

export function ChatPage() {
  const [messages, setMessages] = useState(startingMessages)
  const [draft, setDraft] = useState('')
  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    setMessages([...messages, { text, own: true, time: 'Now' }])
    setDraft('')
  }
  return (
    <Page title="Messages" subtitle="Continue getting to know your matches.">
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        <header className="flex items-center gap-3 border-b border-line p-4">
          <div className="flex size-11 items-center justify-center rounded-full bg-rose text-xl">
            👩🏻
          </div>
          <div>
            <p className="font-semibold text-ink">स्वाती जोशी</p>
            <p className="text-xs text-emerald-700">Online</p>
          </div>
          <button className="ml-auto text-sm font-semibold text-maroon">Call</button>
        </header>
        <div className="flex min-h-[52vh] flex-col gap-3 bg-[#fffaf8] p-4">
          {messages.map((message, index) => (
            <div
              key={`${message.time}-${index}`}
              className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-soft ${message.own ? 'self-end rounded-br-md bg-[#edf7e5] text-ink' : 'self-start rounded-bl-md bg-white text-ink'}`}
            >
              <p>{message.text}</p>
              <p className="mt-1 text-right text-2xs text-muted">{message.time}</p>
            </div>
          ))}
        </div>
        <form
          onSubmit={sendMessage}
          className="flex items-center gap-2 border-t border-line p-3"
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a message…"
            className="h-11 min-w-0 flex-1 rounded-full border border-line bg-white px-4 text-sm outline-none focus:border-maroon"
          />
          <button
            aria-label="Send message"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-maroon text-white"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
      <p className="text-center text-xs text-muted">
        Sample conversation shown as a preview.
      </p>
    </Page>
  )
}
