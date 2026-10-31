import { useEffect, useRef, useState } from 'react'
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  Filter,
  GraduationCap,
  Heart,
  MapPin,
  Navigation,
  Ruler,
  Search,
  UserRound,
  UsersRound,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

import { Spinner } from '@/components/loading/Spinner'
import { ScreenHeader } from '@/components/navigation/ScreenHeader'
import { ErrorState } from '@/components/states/ErrorState'
import { AppScreen } from '@/components/ui/AppScreen'
import { IconButton } from '@/components/ui/IconButton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ProfileCard } from '@/features/profiles/components/ProfileCard'
import { profileService } from '@/features/profiles/services/profile.service'
import type { ProfilePreview } from '@/features/profiles/types'
import { HEIGHT_CODES, heightLabel } from '@/features/registration/constants'
import {
  masterDataService,
  type MasterOption,
} from '@/features/registration/services/master-data.service'
import { MultiFilterRow } from '@/features/search/components/MultiFilterRow'
import { searchService } from '@/features/search/services/search.service'
import type { SearchFilters, SearchResult } from '@/features/search/types'

/** Districts are listed per state, and members are based in Maharashtra. */
const SEARCH_STATE = 'Maharashtra'

const GENDER_OPTIONS: MasterOption[] = [
  { value: 'Female', label: 'Bride' },
  { value: 'Male', label: 'Groom' },
]
const HEIGHT_OPTIONS: MasterOption[] = HEIGHT_CODES.map((value) => ({
  value,
  label: heightLabel(value),
}))

const DEFAULT_FILTERS: SearchFilters = {
  gender: 'Female',
  startAge: '',
  endAge: '',
  startHeight: '',
  endHeight: '',
  religion: [],
  caste: [],
  district: [],
  taluka: [],
  education: [],
  occupation: [],
  income: [],
  maritalStatus: [],
  workingLocation: '',
  photoOnly: true,
}

interface StaticOptions {
  startAges: MasterOption[]
  endAges: MasterOption[]
  religions: MasterOption[]
  districts: MasterOption[]
  educations: MasterOption[]
  occupations: MasterOption[]
  incomes: MasterOption[]
  maritalStatuses: MasterOption[]
}

const NO_OPTIONS: StaticOptions = {
  startAges: [],
  endAges: [],
  religions: [],
  districts: [],
  educations: [],
  occupations: [],
  incomes: [],
  maritalStatuses: [],
}

/** One failed list leaves that row on "Any" without blocking the others. */
function settled(result: PromiseSettledResult<MasterOption[]>): MasterOption[] {
  return result.status === 'fulfilled' ? result.value : []
}

/** Merges lists from several parents; the same name can appear under each. */
function uniqueOptions(lists: MasterOption[][]): MasterOption[] {
  const seen = new Set<string>()
  return lists.flat().filter((option) => {
    if (seen.has(option.value)) return false
    seen.add(option.value)
    return true
  })
}

function isReversed(start: string, end: string): boolean {
  return start !== '' && end !== '' && Number(start) > Number(end)
}

interface FilterRowProps {
  label: string
  icon: LucideIcon
  value: string
  anyLabel: string
  options: MasterOption[]
  disabled?: boolean
  onChange: (value: string) => void
}

function FilterRow({ label, icon: Icon, value, anyLabel, options, disabled, onChange }: FilterRowProps) {
  return (
    <label className="grid min-h-[3.35rem] grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] items-center gap-3">
      <span className="flex min-w-0 items-center gap-3 text-[13px] text-ink">
        <Icon className="size-[18px] shrink-0 text-[#5f5b5c]" strokeWidth={1.7} />
        <span className="truncate">{label}</span>
      </span>
      <span className="relative">
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full appearance-none rounded-xl border border-[#eee9e7] bg-white pr-8 pl-3 text-[13px] text-ink outline-none focus:border-maroon/50 disabled:opacity-55"
        >
          {anyLabel ? <option value="">{anyLabel}</option> : null}
          {options.map((option) => (
            <option key={option.id ?? option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-ink" />
      </span>
    </label>
  )
}

/**
 * Advanced search (`advance-search.php`). Every dropdown is filled from the
 * master APIs except height, which has no master endpoint and uses the app's
 * shared height codes. Results appear below the filters, 24 per page.
 */
export function SearchPage() {
  const { user } = useAuth()
  const memberId = user?.profileId

  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [defaultGender, setDefaultGender] = useState(DEFAULT_FILTERS.gender)
  const [options, setOptions] = useState(NO_OPTIONS)
  const [castes, setCastes] = useState<MasterOption[]>([])
  const [talukas, setTalukas] = useState<MasterOption[]>([])
  const [optionsFailed, setOptionsFailed] = useState(false)
  const [optionsNonce, setOptionsNonce] = useState(0)

  // `null` until the first search, so "no results" is never shown before one.
  const [result, setResult] = useState<SearchResult | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [pendingMore, setPendingMore] = useState(false)
  const [moreError, setMoreError] = useState<string | null>(null)
  // The filters behind the visible results, so "Load more" cannot mix searches.
  const [searchedFilters, setSearchedFilters] = useState<SearchFilters | null>(null)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLElement>(null)
  const latestSearch = useRef(0)
  const genderTouched = useRef(false)

  useEffect(() => {
    let cancelled = false

    void Promise.allSettled([
      masterDataService.fromAges(),
      masterDataService.toAges(),
      masterDataService.religions(),
      masterDataService.districts(SEARCH_STATE),
      masterDataService.educations(),
      masterDataService.occupations(),
      masterDataService.incomes(),
      masterDataService.maritalStatuses(),
    ]).then((results) => {
      if (cancelled) return
      const [startAges, endAges, religions, districts, educations, occupations, incomes, maritalStatuses] =
        results.map(settled)
      setOptions({ startAges, endAges, religions, districts, educations, occupations, incomes, maritalStatuses })
      setOptionsFailed(results.some((entry) => entry.status === 'rejected'))
    })

    return () => {
      cancelled = true
    }
  }, [optionsNonce])

  // With no religion chosen, caste offers the castes of every religion.
  // Lists travel as "|"-joined keys so the effects re-run on content, not identity.
  const religionKey = filters.religion.join('|')
  const districtKey = filters.district.join('|')
  const allReligionsKey = options.religions.map((option) => option.value).join('|')

  useEffect(() => {
    const names = (religionKey || allReligionsKey).split('|').filter(Boolean)
    let cancelled = false

    void Promise.allSettled(names.map((name) => masterDataService.castes(name))).then((results) => {
      if (cancelled) return
      const list = uniqueOptions(results.map(settled))
      setCastes(list)
      // Drop castes no longer offered, unless a failed list makes that unknowable.
      if (names.length && results.every((entry) => entry.status === 'fulfilled')) {
        const offered = new Set(list.map((option) => option.value))
        setFilters((current) => ({
          ...current,
          caste: current.caste.filter((value) => offered.has(value)),
        }))
      }
    })

    return () => {
      cancelled = true
    }
  }, [religionKey, allReligionsKey])

  useEffect(() => {
    const names = districtKey.split('|').filter(Boolean)
    let cancelled = false

    void Promise.allSettled(names.map((name) => masterDataService.talukasForDistrict(name))).then(
      (results) => {
        if (cancelled) return
        const list = uniqueOptions(results.map(settled))
        setTalukas(list)
        if (results.every((entry) => entry.status === 'fulfilled')) {
          const offered = new Set(list.map((option) => option.value))
          setFilters((current) => ({
            ...current,
            taluka: current.taluka.filter((value) => offered.has(value)),
          }))
        }
      },
    )

    return () => {
      cancelled = true
    }
  }, [districtKey])

  // Default to the opposite gender once the member's own is known.
  useEffect(() => {
    if (!memberId) return
    let cancelled = false

    profileService
      .fetchBasic(memberId)
      .then((section) => {
        if (cancelled) return
        const own = section.fields.find((field) => field.label === 'Gender')?.value
        if (own !== 'Male' && own !== 'Female') return
        const opposite = own === 'Male' ? 'Female' : 'Male'
        setDefaultGender(opposite)
        if (!genderTouched.current) {
          setFilters((current) => ({ ...current, gender: opposite }))
        }
      })
      .catch(() => {
        // Keeps the default; the member can still choose in the first row.
      })

    return () => {
      cancelled = true
    }
  }, [memberId])

  function update<K extends keyof SearchFilters>(field: K, value: SearchFilters[K]) {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  function resetFilters() {
    latestSearch.current += 1
    genderTouched.current = false
    setFilters({ ...DEFAULT_FILTERS, gender: defaultGender })
    setResult(null)
    setSearchedFilters(null)
    setSearchError(null)
    setMoreError(null)
    setSearching(false)
    setPendingMore(false)
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0
  }

  const ageReversed = isReversed(filters.startAge, filters.endAge)
  const heightReversed = isReversed(filters.startHeight, filters.endHeight)
  const rangeError = ageReversed
    ? '"Age from" cannot be more than "Age to".'
    : heightReversed
      ? '"Height from" cannot be more than "Height to".'
      : null

  async function runSearch() {
    if (!memberId || searching || rangeError) return

    const runId = ++latestSearch.current
    const snapshot = filters
    setSearching(true)
    setSearchError(null)
    setMoreError(null)

    try {
      const next = await searchService.search(memberId, snapshot)
      if (runId !== latestSearch.current) return
      setResult(next)
      setSearchedFilters(snapshot)
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (err) {
      if (runId !== latestSearch.current) return
      setResult(null)
      setSearchError(err instanceof Error ? err.message : 'The search could not be completed.')
    } finally {
      if (runId === latestSearch.current) setSearching(false)
    }
  }

  async function loadMore() {
    if (!memberId || !searchedFilters || !result || pendingMore) return

    const runId = latestSearch.current
    setPendingMore(true)
    setMoreError(null)

    try {
      const next = await searchService.search(memberId, searchedFilters, result.page + 1)
      if (runId !== latestSearch.current) return
      setResult((current) => {
        if (!current) return current
        const seen = new Set(current.profiles.map((profile) => profile.id))
        return {
          ...next,
          totalResults: next.totalResults || current.totalResults,
          profiles: [...current.profiles, ...next.profiles.filter((profile) => !seen.has(profile.id))],
        }
      })
    } catch (err) {
      // A failed "load more" keeps the pages already on screen.
      if (runId === latestSearch.current) {
        setMoreError(err instanceof Error ? err.message : 'Could not load more profiles.')
      }
    } finally {
      if (runId === latestSearch.current) setPendingMore(false)
    }
  }

  const profiles: ProfilePreview[] = result?.profiles ?? []

  return (
    <AppScreen>
      <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <ScreenHeader
          title="Advanced Search"
          trailing={
            <IconButton label="Reset filters" size="sm" variant="plain" onClick={resetFilters}>
              <Filter className="size-5" />
            </IconButton>
          }
        />

        <div className="px-4 pt-2">
          {optionsFailed ? (
            <p className="mb-2 flex items-center justify-between gap-3 rounded-xl bg-white p-3 text-xs text-muted">
              Some filter options could not be loaded.
              <button
                type="button"
                onClick={() => setOptionsNonce((value) => value + 1)}
                className="shrink-0 font-semibold text-maroon"
              >
                Retry
              </button>
            </p>
          ) : null}

          <FilterRow
            label="Looking for"
            icon={UserRound}
            value={filters.gender}
            anyLabel=""
            options={GENDER_OPTIONS}
            onChange={(value) => {
              genderTouched.current = true
              update('gender', value)
            }}
          />
          <FilterRow
            label="Age from"
            icon={CalendarDays}
            value={filters.startAge}
            anyLabel="Any age"
            options={options.startAges}
            onChange={(value) => update('startAge', value)}
          />
          <FilterRow
            label="Age to"
            icon={CalendarDays}
            value={filters.endAge}
            anyLabel="Any age"
            options={options.endAges}
            onChange={(value) => update('endAge', value)}
          />
          <FilterRow
            label="Height from"
            icon={Ruler}
            value={filters.startHeight}
            anyLabel="Any height"
            options={HEIGHT_OPTIONS}
            onChange={(value) => update('startHeight', value)}
          />
          <FilterRow
            label="Height to"
            icon={Ruler}
            value={filters.endHeight}
            anyLabel="Any height"
            options={HEIGHT_OPTIONS}
            onChange={(value) => update('endHeight', value)}
          />
          <MultiFilterRow
            label="Religion"
            icon={UsersRound}
            values={filters.religion}
            anyLabel="Any religion"
            options={options.religions}
            onChange={(values) => update('religion', values)}
          />
          <MultiFilterRow
            label="Caste"
            icon={UsersRound}
            values={filters.caste}
            anyLabel="Any caste"
            options={castes}
            onChange={(values) => update('caste', values)}
          />
          <MultiFilterRow
            label="District"
            icon={MapPin}
            values={filters.district}
            anyLabel="Any district"
            options={options.districts}
            onChange={(values) => update('district', values)}
          />
          <MultiFilterRow
            label="Taluka"
            icon={MapPin}
            values={filters.taluka}
            anyLabel={filters.district.length ? 'Any taluka' : 'Select a district first'}
            options={talukas}
            disabled={!filters.district.length}
            onChange={(values) => update('taluka', values)}
          />
          <MultiFilterRow
            label="Education"
            icon={GraduationCap}
            values={filters.education}
            anyLabel="Any education"
            options={options.educations}
            onChange={(values) => update('education', values)}
          />
          <MultiFilterRow
            label="Occupation"
            icon={BriefcaseBusiness}
            values={filters.occupation}
            anyLabel="Any occupation"
            options={options.occupations}
            onChange={(values) => update('occupation', values)}
          />
          <MultiFilterRow
            label="Annual income"
            icon={Wallet}
            values={filters.income}
            anyLabel="Any income"
            options={options.incomes}
            onChange={(values) => update('income', values)}
          />
          <MultiFilterRow
            label="Marital status"
            icon={Heart}
            values={filters.maritalStatus}
            anyLabel="Any status"
            options={options.maritalStatuses}
            onChange={(values) => update('maritalStatus', values)}
          />

          <label className="grid min-h-[3.35rem] grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] items-center gap-3">
            <span className="flex min-w-0 items-center gap-3 text-[13px] text-ink">
              <Navigation className="size-[18px] shrink-0 text-[#5f5b5c]" strokeWidth={1.7} />
              <span className="truncate">Working location</span>
            </span>
            <input
              type="text"
              value={filters.workingLocation}
              onChange={(event) => update('workingLocation', event.target.value)}
              placeholder="e.g. Pune, Mumbai"
              className="h-10 w-full rounded-xl border border-[#eee9e7] bg-white px-3 text-[13px] text-ink outline-none focus:border-maroon/50"
            />
          </label>

          <div className="flex min-h-[3.5rem] items-center justify-between gap-3 px-1">
            <span id="photo-only-label" className="text-[13px] text-ink">
              Profiles with photos
            </span>
            <button
              role="switch"
              aria-checked={filters.photoOnly}
              aria-labelledby="photo-only-label"
              type="button"
              onClick={() => update('photoOnly', !filters.photoOnly)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${filters.photoOnly ? 'bg-maroon' : 'bg-gray-300'}`}
            >
              <span
                className={`absolute top-1 size-5 rounded-full bg-white shadow-sm transition-transform ${filters.photoOnly ? 'translate-x-[1.55rem]' : 'translate-x-1'}`}
              />
            </button>
          </div>

          <section ref={resultsRef} aria-label="Search results" className="scroll-mt-16">
            {searchError ? (
              <div className="py-4">
                <ErrorState description={searchError} onRetry={() => void runSearch()} />
              </div>
            ) : result ? (
              <div className="pt-3 pb-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-ink">Search results</h2>
                  <span className="text-xs text-muted">
                    {result.totalResults || profiles.length} profiles
                  </span>
                </div>

                {profiles.length ? (
                  <ul className="grid grid-cols-1 gap-4">
                    {profiles.map((profile) => (
                      <li key={profile.id}>
                        <ProfileCard profile={profile} className="w-full" />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-xl bg-white p-4 text-center text-xs text-muted">
                    No matches found. Try adjusting your filters.
                  </p>
                )}

                {result.hasNext ? (
                  <div className="flex flex-col items-center gap-2 py-3">
                    {moreError ? (
                      <p role="alert" className="text-xs text-danger">
                        {moreError}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      disabled={pendingMore}
                      onClick={() => void loadMore()}
                      className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-2.5 text-sm font-semibold text-maroon hover:bg-rose disabled:opacity-55"
                    >
                      {pendingMore ? <Spinner className="size-3.5" label="Loading more" /> : null}
                      {pendingMore ? 'Loading…' : moreError ? 'Retry' : 'Load more'}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        </div>
      </div>

      <footer className="shrink-0 space-y-2 border-t border-line bg-[#fffdfa] px-4 pt-2.5 pb-2">
        {rangeError ? (
          <p role="alert" className="text-center text-xs text-danger">
            {rangeError}
          </p>
        ) : null}
        <button
          type="button"
          disabled={searching || !memberId || rangeError !== null}
          onClick={() => void runSearch()}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-maroon text-sm font-semibold text-white shadow-brand transition hover:bg-maroon-dark disabled:opacity-55"
        >
          {searching ? <Spinner className="size-4" label="Searching" /> : <Search className="size-4" />}
          {searching ? 'Searching…' : 'Search'}
        </button>
        <button type="button" onClick={resetFilters} className="h-8 w-full text-sm font-medium text-maroon">
          Reset
        </button>
      </footer>
    </AppScreen>
  )
}
