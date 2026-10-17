import { useState } from 'react'
import { BadgeCheck, EllipsisVertical, Heart, MessageCircle } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { ComingSoon } from '@/components/states/ComingSoon'
import { ScreenHeader } from '@/components/navigation/ScreenHeader'
import { AppScreen } from '@/components/ui/AppScreen'
import { IconButton } from '@/components/ui/IconButton'
import { routes } from '@/config/routes'
import type { ProfileDetail } from '@/features/profiles/types'
import { useShortlist } from '@/features/shortlist/hooks/useShortlist'
import { useToast } from '@/hooks/useToast'

interface DetailState { profile?: ProfileDetail }

const previewDetails: Record<string, Partial<ProfileDetail>> = {
  'p-2001': { height: '5′8″', education: 'B.E. (Computer)', annualIncome: '6 lakh', caste: 'Maratha', maritalStatus: 'Never married', hometown: 'Pune, Maharashtra' },
  'p-2002': { height: '5′9″', education: 'M.B.A.', annualIncome: '7 lakh', caste: 'Maratha', maritalStatus: 'Never married', hometown: 'Nashik, Maharashtra' },
  'p-1001': { height: '5′4″', education: 'B.Ed.', annualIncome: '4 lakh', caste: 'Maratha', maritalStatus: 'Never married', hometown: 'Satara, Maharashtra' },
  'p-1002': { height: '5′3″', education: 'B.E. (Computer)', annualIncome: '8 lakh', caste: 'Maratha', maritalStatus: 'Never married', hometown: 'Pune, Maharashtra' },
  'p-1003': { height: '5′5″', education: 'B.Sc. Nursing', annualIncome: '5 lakh', caste: 'Maratha', maritalStatus: 'Never married', hometown: 'Kolhapur, Maharashtra' },
}

export function ProfileDetailPage() {
  const location = useLocation()
  const toast = useToast()
  const { isShortlisted, toggle } = useShortlist()
  const [interestSent, setInterestSent] = useState(false)
  const profile = (location.state as DetailState | null)?.profile
  const details = profile ? { ...previewDetails[profile.id], ...profile } : undefined

  if (!profile || !details) {
    return (
      <AppScreen>
        <ScreenHeader title="Profile details" />
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4">
          <ComingSoon title="Profile details" description="Open a profile from the dashboard or search to see its details here." action={<Link to={routes.home} className="text-xs font-semibold text-maroon">Back to dashboard</Link>} />
        </main>
      </AppScreen>
    )
  }

  const saved = isShortlisted(profile.id)
  const rows = [
    ['Height', details.height],
    ['Education', details.education],
    ['Occupation', details.occupation],
    ['Annual income', details.annualIncome],
    ['Caste', details.caste],
    ['Marital status', details.maritalStatus],
    ['Native place', details.hometown ?? details.location],
  ]

  return (
    <AppScreen>
      <ScreenHeader title="Profile details" trailing={<IconButton label="More profile options" size="sm" variant="plain" onClick={() => toast.info('More profile options will be available soon')}><EllipsisVertical className="size-[18px]" /></IconButton>} />

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-4">
        <div className="relative mx-3 mt-2 h-[25vh] min-h-44 max-h-56 overflow-hidden rounded-xl bg-rose shadow-soft">
          {profile.photoUrl ? <img src={profile.photoUrl} alt={`${profile.name}'s profile`} className="size-full object-cover object-[center_34%]" /> : <div className="flex size-full items-center justify-center text-5xl font-semibold text-maroon">{profile.name.slice(0, 1)}</div>}
          <span className="absolute top-2 right-2 rounded-full bg-black/55 px-2 py-1 text-[10px] font-medium text-white">1 / 1</span>
          <button type="button" aria-label={saved ? 'Remove from shortlist' : 'Add to shortlist'} aria-pressed={saved} onClick={() => toggle(profile)} className="absolute right-2 bottom-2 flex size-9 items-center justify-center rounded-full bg-white text-maroon shadow-card"><Heart className="size-[18px]" fill={saved ? 'currentColor' : 'none'} /></button>
        </div>

        <section className="px-4 pt-2.5">
          <div className="flex items-center gap-1.5"><h2 className="truncate text-base font-semibold text-ink">{profile.name}</h2>{profile.isVerified ? <BadgeCheck className="size-4 shrink-0 fill-emerald-600 text-white" aria-label="Verified" /> : null}</div>
          <p className="mt-0.5 text-[11px] text-muted">{profile.age} yrs, {details.height ?? 'Height not provided'}, {profile.location}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">{[profile.gender, details.education, details.occupation].filter(Boolean).map((tag) => <span key={tag} className="rounded-full border border-line bg-white px-2.5 py-1 text-[10px] text-muted">{tag}</span>)}</div>
        </section>

        <section className="px-4 pt-3 pb-1">
          <h3 className="mb-1 text-xs font-semibold text-maroon">Personal details</h3>
          <dl className="divide-y divide-line/80">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[43%_57%] gap-2 py-1 text-[10px] leading-tight"><dt className="text-muted">{label}</dt><dd className="text-ink">{value ?? 'Not provided'}</dd></div>)}</dl>
        </section>
      </main>

      <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-line bg-white px-3 py-2.5">
        <button type="button" onClick={() => { setInterestSent(true); toast.info('Interest requests will be available when your account is connected') }} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-maroon px-2 text-[11px] font-semibold text-maroon hover:bg-rose"><Heart className="size-4" />{interestSent ? 'Interest sent' : 'Send interest'}</button>
        <Link to={routes.chat} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-maroon px-2 text-[11px] font-semibold text-white shadow-brand hover:bg-maroon-dark"><MessageCircle className="size-4" />Chat now</Link>
      </footer>
    </AppScreen>
  )
}
