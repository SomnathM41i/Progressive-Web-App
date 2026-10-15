import { useState } from 'react'
import { Check, Heart, X } from 'lucide-react'

import { Page } from '@/components/ui/Page'

const requests = [
  { name: 'स्वाती जोशी', age: 26, city: 'मुंबई', work: 'Teacher', status: 'New' },
  { name: 'पूजा कुलकर्णी', age: 25, city: 'पुणे', work: 'Doctor', status: 'New' },
  { name: 'माधुरी कदम', age: 24, city: 'नाशिक', work: 'Engineer', status: 'Viewed' },
]

export function InterestsPage() {
  const [tab, setTab] = useState<'received' | 'sent'>('received')
  const [hidden, setHidden] = useState<string[]>([])
  const visible = requests.filter((request) => !hidden.includes(request.name))
  return (
    <Page
      title="Interests"
      subtitle="Manage requests from people who like your profile."
    >
      <div className="grid grid-cols-2 border-b border-line text-center text-sm">
        {(['received', 'sent'] as const).map((value) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`border-b-2 py-3 font-semibold ${tab === value ? 'border-maroon text-maroon' : 'border-transparent text-muted'}`}
          >
            {value === 'received' ? 'Received' : 'Sent'}
          </button>
        ))}
      </div>
      <ul className="space-y-3">
        {(tab === 'received' ? visible : requests.slice(1)).map((request, index) => (
          <li
            key={request.name}
            className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 shadow-soft"
          >
            <div
              className={`flex size-16 shrink-0 items-center justify-center rounded-xl text-2xl ${index % 2 ? 'bg-rose' : 'bg-amber-50'}`}
            >
              {index % 2 ? '👩🏻' : '👩🏽'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{request.name}</p>
              <p className="mt-0.5 text-xs text-muted">
                {request.age} yrs · {request.city}
              </p>
              <p className="text-xs text-muted">{request.work}</p>
              <span className="mt-1 inline-block rounded-full bg-rose px-2 py-0.5 text-2xs font-semibold text-maroon">
                {request.status}
              </span>
            </div>
            {tab === 'received' && (
              <div className="flex flex-col gap-2">
                <button
                  aria-label="Accept interest"
                  onClick={() => setHidden([...hidden, request.name])}
                  className="flex size-9 items-center justify-center rounded-full bg-emerald-600 text-white"
                >
                  <Check className="size-4" />
                </button>
                <button
                  aria-label="Decline interest"
                  onClick={() => setHidden([...hidden, request.name])}
                  className="flex size-9 items-center justify-center rounded-full border border-line text-muted"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {visible.length === 0 && tab === 'received' ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-muted">
          <Heart className="mx-auto mb-3 size-7 text-maroon" />
          You’re all caught up.
        </div>
      ) : null}
      <p className="text-center text-xs text-muted">
        Sample requests shown until your account is connected.
      </p>
    </Page>
  )
}
