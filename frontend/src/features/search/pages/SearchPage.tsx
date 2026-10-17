import { useMemo, useRef, useState } from 'react'
import { BriefcaseBusiness, CalendarDays, ChevronDown, Filter, GraduationCap, Heart, MapPin, Ruler, Search, UserRound, UsersRound, Wallet } from 'lucide-react'

import { ScreenHeader } from '@/components/navigation/ScreenHeader'
import { AppScreen } from '@/components/ui/AppScreen'
import { IconButton } from '@/components/ui/IconButton'
import { PREVIEW_DASHBOARD } from '@/features/dashboard/dev/preview-dashboard'
import { ProfileCard } from '@/features/profiles/components/ProfileCard'
import type { ProfilePreview } from '@/features/profiles/types'
import { env } from '@/config/env'

const sampleProfiles = env.devPreview ? [...PREVIEW_DASHBOARD.recommended, ...PREVIEW_DASHBOARD.recentlyAdded] : []
const profileFilters: Record<string, { education: string; height: number; income: number; caste: string; maritalStatus: string }> = {
  'p-1001': { education: 'Graduate', height: 5.4, income: 4, caste: 'Maratha', maritalStatus: 'Never married' },
  'p-1002': { education: 'Graduate', height: 5.3, income: 8, caste: 'Maratha', maritalStatus: 'Never married' },
  'p-1003': { education: 'Graduate', height: 5.5, income: 5, caste: 'Maratha', maritalStatus: 'Never married' },
  'p-2001': { education: 'Graduate', height: 5.8, income: 6, caste: 'Maratha', maritalStatus: 'Never married' },
  'p-2002': { education: 'Postgraduate', height: 5.9, income: 7, caste: 'Maratha', maritalStatus: 'Never married' },
}

interface SearchFilters {
  gender: string
  age: string
  location: string
  education: string
  occupation: string
  caste: string
  height: string
  income: string
  maritalStatus: string
}

const defaults: SearchFilters = {
  gender: 'Bride',
  age: '22–30',
  location: 'पुणे',
  education: 'Graduate',
  occupation: 'Any occupation',
  caste: 'Any caste',
  height: '5.0–6.0 ft',
  income: '2–10 lakh',
  maritalStatus: 'Never married',
}

function matchesFilters(profile: ProfilePreview, filters: SearchFilters, photoOnly: boolean) {
  const detail = profileFilters[profile.id]
  const [minAge, maxAge] = filters.age === 'Any age' ? [0, 100] : filters.age.split('–').map(Number)
  const [minHeight, maxHeight] = filters.height === 'Any height'
    ? [0, 10]
    : filters.height === 'Above 6 ft'
      ? [6, Number.POSITIVE_INFINITY]
      : filters.height.split('–').map((value) => Number.parseFloat(value))
  const minIncome = filters.income === 'Any income' ? 0 : filters.income === '10+ lakh' ? 10 : 2
  const maxIncome = filters.income === '2–10 lakh' ? 10 : Number.POSITIVE_INFINITY
  return (
    (!profile.gender || profile.gender === filters.gender) &&
    profile.age >= minAge && profile.age <= maxAge &&
    (filters.location === 'Any location' || profile.location === filters.location) &&
    (filters.education === 'Any education' || detail?.education === filters.education) &&
    (filters.occupation === 'Any occupation' || profile.occupation === filters.occupation) &&
    (filters.caste === 'Any caste' || detail?.caste === filters.caste) &&
    (filters.height === 'Any height' || (!!detail && detail.height >= minHeight && detail.height <= maxHeight)) &&
    (filters.income === 'Any income' || (!!detail && detail.income >= minIncome && detail.income <= maxIncome)) &&
    (filters.maritalStatus === 'Any status' || detail?.maritalStatus === filters.maritalStatus) &&
    (!photoOnly || !!profile.photoUrl)
  )
}

export function SearchPage() {
  const [filters, setFilters] = useState(defaults)
  const [photoOnly, setPhotoOnly] = useState(true)
  const [hasSearched, setHasSearched] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const matches = useMemo(() => sampleProfiles.filter((profile) => matchesFilters(profile, filters, photoOnly)), [filters, photoOnly])

  function updateFilter(field: keyof SearchFilters, value: string) {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  function resetFilters() {
    setFilters(defaults)
    setPhotoOnly(true)
    setHasSearched(false)
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0
  }

  const rows = [
    { label: 'Looking for', key: 'gender', icon: UserRound, options: ['Bride', 'Groom'] },
    { label: 'Age', key: 'age', icon: CalendarDays, options: ['Any age', '22–30', '25–35', '30–40'] },
    { label: 'Location', key: 'location', icon: MapPin, options: ['Any location', 'पुणे', 'सातारा', 'मुंबई'] },
    { label: 'Education', key: 'education', icon: GraduationCap, options: ['Any education', 'Graduate', 'Postgraduate'] },
    { label: 'Occupation', key: 'occupation', icon: BriefcaseBusiness, options: ['Any occupation', 'Teacher', 'Software engineer', 'Engineer', 'Business'] },
    { label: 'Caste', key: 'caste', icon: UsersRound, options: ['Any caste', 'Maratha'] },
    { label: 'Height', key: 'height', icon: Ruler, options: ['Any height', '5.0–6.0 ft', 'Above 6 ft'] },
    { label: 'Annual income', key: 'income', icon: Wallet, options: ['Any income', '2–10 lakh', '10+ lakh'] },
    { label: 'Marital status', key: 'maritalStatus', icon: Heart, options: ['Any status', 'Never married', 'Divorced', 'Widowed'] },
  ] as const

  return (
    <AppScreen>
      <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <ScreenHeader title="Advanced Search" trailing={<IconButton label="Reset filters" size="sm" variant="plain" onClick={resetFilters}><Filter className="size-5" /></IconButton>} />
        <div className="px-4 pt-2">
          {rows.map(({ label, key, icon: Icon, options }) => (
            <label key={key} className="grid min-h-[3.35rem] grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] items-center gap-3">
              <span className="flex min-w-0 items-center gap-3 text-[13px] text-ink"><Icon className="size-[18px] shrink-0 text-[#5f5b5c]" strokeWidth={1.7} /><span className="truncate">{label}</span></span>
              <span className="relative">
                <select value={filters[key]} onChange={(event) => updateFilter(key, event.target.value)} className="h-10 w-full appearance-none rounded-xl border border-[#eee9e7] bg-white pl-3 pr-8 text-[13px] text-ink outline-none focus:border-maroon/50">
                  {options.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-ink" />
              </span>
            </label>
          ))}

          <div className="flex min-h-[3.5rem] items-center justify-between gap-3 px-1">
            <label htmlFor="photo-only" className="text-[13px] text-ink">Profiles with photos</label>
            <button id="photo-only" role="switch" aria-checked={photoOnly} type="button" onClick={() => setPhotoOnly((current) => !current)} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${photoOnly ? 'bg-maroon' : 'bg-gray-300'}`}>
              <span className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition-transform ${photoOnly ? 'translate-x-[1.55rem]' : 'translate-x-1'}`} />
            </button>
          </div>

          {hasSearched ? (
            <section className="pb-5 pt-3">
              <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold text-ink">Search results</h2><span className="text-xs text-muted">{matches.length} profiles</span></div>
              {matches.length ? <ul className="grid grid-cols-2 gap-3">{matches.map((profile) => <li key={profile.id}><ProfileCard profile={profile} className="w-full" /></li>)}</ul> : <p className="rounded-xl bg-white p-4 text-center text-xs text-muted">{sampleProfiles.length ? 'No matches found. Try adjusting your filters.' : 'Search results will appear here when profiles are connected.'}</p>}
            </section>
          ) : null}
        </div>
      </div>

      <footer className="shrink-0 space-y-2 border-t border-line bg-[#fffdfa] px-4 pt-2.5 pb-2">
        <button type="button" onClick={() => setHasSearched(true)} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-maroon text-sm font-semibold text-white shadow-brand transition hover:bg-maroon-dark"><Search className="size-4" />Search</button>
        <button type="button" onClick={resetFilters} className="h-8 w-full text-sm font-medium text-maroon">Reset</button>
      </footer>
    </AppScreen>
  )
}
