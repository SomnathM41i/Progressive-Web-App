import { useRef, useState } from 'react'

import { ScreenHeader } from '@/components/navigation/ScreenHeader'
import { AppScreen } from '@/components/ui/AppScreen'
import { env } from '@/config/env'

const sampleRequests = [
  { id: 'i-1', name: 'स्वाती जोशी', age: 26, city: 'मुंबई', details: 'B.Ed., Teacher', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&h=220&q=80' },
  { id: 'i-2', name: 'पूजा कुलकर्णी', age: 25, city: 'पुणे', details: 'BCA, Software engineer', photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=180&h=220&q=80' },
  { id: 'i-3', name: 'प्राजक्ता कदम', age: 24, city: 'नाशिक', details: 'MBA, Banking', photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=180&h=220&q=80' },
  { id: 'i-4', name: 'किरण शिंदे', age: 28, city: 'पुणे', details: 'MBA, Engineer', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=180&h=220&q=80' },
]

const requests = env.devPreview ? sampleRequests : []

export function InterestsPage() {
  const [tab, setTab] = useState<'received' | 'sent'>('received')
  const [dismissed, setDismissed] = useState<string[]>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const received = requests.filter((request) => !dismissed.includes(request.id))
  const visibleRequests = tab === 'received' ? received : requests.slice(1, 3)

  function changeTab(nextTab: 'received' | 'sent') {
    setTab(nextTab)
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0
  }

  function dismissRequest(requestId: string) {
    setDismissed((current) => [...current, requestId])
  }

  return (
    <AppScreen safeBottom={false}>
      <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <ScreenHeader title="Interests" />

        <div className="grid h-10 shrink-0 grid-cols-2 border-b border-line bg-white text-center text-[11px]">
          <button type="button" onClick={() => changeTab('received')} className={`relative font-semibold ${tab === 'received' ? 'text-maroon' : 'text-muted'}`}>Received{tab === 'received' ? <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-maroon" /> : null}</button>
          <button type="button" onClick={() => changeTab('sent')} className={`relative font-semibold ${tab === 'sent' ? 'text-maroon' : 'text-muted'}`}>Sent{tab === 'sent' ? <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-maroon" /> : null}</button>
        </div>

        <div className="px-3">
          {visibleRequests.length ? <ul className="divide-y divide-[#f1ecea]">{visibleRequests.map((request) => (
            <li key={request.id} className="flex min-h-[5.75rem] items-center gap-2.5 py-2.5">
              <img src={request.photo} alt="" loading="lazy" className="h-[4.1rem] w-[3.15rem] shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-ink">{request.name}</p>
                <p className="mt-0.5 text-[10px] text-muted">{request.age} yrs, {request.city}</p>
                <p className="truncate text-[10px] text-muted">{request.details}</p>
                {tab === 'received' ? <div className="mt-1.5 flex gap-1.5"><button type="button" onClick={() => dismissRequest(request.id)} className="h-6 min-w-[3.4rem] rounded-md bg-[#2d9b5b] px-2 text-[10px] font-semibold text-white">Accept</button><button type="button" onClick={() => dismissRequest(request.id)} className="h-6 min-w-[3.4rem] rounded-md border border-[#b82b3e] px-2 text-[10px] font-semibold text-[#a91931]">Decline</button></div> : <p className="mt-1.5 text-[10px] font-medium text-maroon">Interest sent</p>}
              </div>
            </li>
          ))}</ul> : <div className="px-4 py-12 text-center text-xs text-muted">{requests.length ? 'No interests in this section yet.' : 'Your interest requests will appear here when your account is connected.'}</div>}
        </div>
      </div>
    </AppScreen>
  )
}
