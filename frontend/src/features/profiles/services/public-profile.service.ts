import { api } from '@/services/api'
import { ApiError } from '@/services/api-error'
import { resolveMediaUrl } from '@/features/profiles/media'
import type { ProfilePreview } from '@/features/profiles/types'

interface PublicProfilesResponse {
  status?: string
  message?: string
  data?: {
    profiles?: Array<Record<string, unknown>>
    pagination?: {
      current_page?: number
      per_page?: number
      total_profiles?: number
      total_pages?: number
    }
  }
}

function isSuccess(status: unknown): boolean {
  if (typeof status === 'string') {
    const s = status.toLowerCase()
    return s === 'success' || s === 'true'
  }
  return status === 1 || status === true
}

function asText(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    if (trimmed.toUpperCase() === 'NULL') return null
    return trimmed
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return null
}

function pick(record: Record<string, unknown>, keys: string[]): unknown {
  const wanted = keys.map((key) => key.toLowerCase())
  for (const [key, value] of Object.entries(record)) {
    if (wanted.includes(key.toLowerCase()) && value !== null && value !== '') {
      return value
    }
  }
  return undefined
}

function toAge(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const match = value.match(/\d+/)
    if (match) return Number(match[0])
  }
  return 0
}

function mapProfile(row: Record<string, unknown>): ProfilePreview | null {
  const id = asText(pick(row, ['MatriID', 'matri_id', 'profile_id', 'id']))
  if (!id) return null

  const name =
    asText(pick(row, ['display_name', 'DisplayName', 'Name', 'FullName'])) ?? id
  const age = toAge(pick(row, ['Age', 'age']))
  const location =
    asText(pick(row, ['city', 'City', 'dist', 'District', 'taluka', 'Taluka'])) ?? ''
  const occupation = asText(pick(row, ['occupation', 'Occupation']))
  const photo = asText(pick(row, ['photo_url', 'photoUrl', 'Photo1', 'photo']))
  const gender = asText(pick(row, ['Gender', 'gender']))

  return {
    id,
    name,
    age,
    location,
    occupation: occupation ?? undefined,
    gender: gender === 'Male' ? 'Groom' : gender === 'Female' ? 'Bride' : undefined,
    photoUrl: photo ?? null,
    height: asText(pick(row, ['Height', 'height'])) ?? undefined,
    education: asText(pick(row, ['Education', 'education'])) ?? undefined,
    maritalStatus: asText(pick(row, ['Maritalstatus', 'MaritalStatus'])) ?? undefined,
  }
}

export type PublicProfileType = 'unmarried' | 'remarriage' | 'nri'

const ENDPOINTS: Record<PublicProfileType, string> = {
  unmarried: '/get_unmarried_profiles.php',
  remarriage: '/get_remarriage_profiles.php',
  nri: '/get_nri_profiles.php',
}

/* ── Photo helpers ───────────────────────────────────────────────────────── */

const PLACEHOLDER_PHOTO = /\/images\/nophoto\.jpg(\?|$)/i

/** True when the API fell back to the generic "no photo" placeholder. */
export function isPlaceholderPhoto(url: string | null | undefined): boolean {
  return typeof url === 'string' && PLACEHOLDER_PHOTO.test(url)
}

/**
 * `photoprocess.php` resizes on demand through its `square` query parameter.
 * Listing responses ask for 500px thumbnails; detail screens request a larger
 * render so the hero photo stays sharp on high-density screens.
 */
export function withPhotoSize(
  url: string | null | undefined,
  size = 1000,
): string | null {
  if (!url) return null
  if (isPlaceholderPhoto(url)) return null
  const resolved = resolveMediaUrl(url)
  if (!resolved) return null
  return resolved.replace(/([?&]square=)\d+/, `$1${size}`)
}

/* ── Public profile detail ───────────────────────────────────────────────── */

const DETAILS_PATH = '/get_profile_details.php'
const BASIC_PATH = '/get-basic-details.php'
const EDUCATION_PATH = '/get-education_occupation-details.php'
const FAMILY_PATH = '/get-family-details.php'
const HOROSCOPE_PATH = '/get-horoscope-details.php'
const PARTNER_PATH = '/get-partner-preference-details.php'

export interface PublicProfileField {
  label: string
  value: string | null
}

export interface PublicProfileSection {
  key: string
  title: string
  fields: PublicProfileField[]
  notes: PublicProfileField[]
}

export interface PublicProfile {
  id: string
  name: string
  age: number
  birthYear?: number
  gender?: 'Bride' | 'Groom'
  height?: string
  education?: string
  occupation?: string
  maritalStatus?: string
  locationType?: string
  city?: string
  taluka?: string
  district?: string
  photoUrl: string | null
  photos: string[]
  profileUrl?: string
  overview: PublicProfileField[]
  sections: PublicProfileSection[]
}

/** Human labels for every key the public profile endpoints return. */
const LABELS: Record<string, string> = {
  // Details
  MatriID: 'Matrimony ID',
  display_name: 'Display name',
  Age: 'Age',
  birth_year: 'Birth year',
  Height: 'Height',
  Education: 'Education',
  Occupation: 'Occupation',
  City: 'City',
  Taluka: 'Taluka',
  Dist: 'District',
  profile_location_type: 'Location type',
  Maritalstatus: 'Marital status',
  Gender: 'Gender',
  // Basic
  Name: 'Full name',
  DOB: 'Date of birth',
  Weight: 'Weight',
  BloodGroup: 'Blood group',
  Complexion: 'Complexion',
  SpecialCases: 'Special cases',
  SpecialReason: 'Special case details',
  Email: 'Email',
  Profilecreatedby: 'Profile created by',
  MaritalStatus: 'Marital status',
  NoOfChildren: 'Children',
  ChildrenStatus: 'Children status',
  ChildAcceptance: 'Child acceptance',
  Religion: 'Religion',
  Caste: 'Caste',
  Subcaste: 'Subcaste',
  CountryCode: 'Country code',
  Mobile: 'Mobile',
  AboutUs: 'About',
  // Education & career
  EducationDetails: 'Education details',
  Annualincome: 'Annual income',
  AnnualincomeLabel: 'Annual income',
  Income_in: 'Income currency',
  OccuDetails: 'Occupation details',
  Employedin: 'Employed in',
  WorkingHours: 'Working hours',
  WorkingLocation: 'Working location',
  IIT: 'IIT / IIM / NIT',
  Institute: 'Institute',
  EduDate: 'Education updated',
  // Family
  FamilyValues: 'Family values',
  FamilyType: 'Family type',
  FamilyStatus: 'Family status',
  Brothers: 'Brothers',
  BrothersMarried: 'Brothers married',
  Sisters: 'Sisters',
  SistersMarried: 'Sisters married',
  Father: "Father's name",
  FatherOccupation: "Father's occupation",
  Mother: "Mother's name",
  MotherOccupation: "Mother's occupation",
  MotherTongue: 'Mother tongue',
  Relatives: 'Relatives',
  Property: 'Property',
  LivingStatus: 'Living status',
  AboutFamily: 'About family',
  FamilyWealth: 'Family wealth',
  Uncle: "Uncle's name",
  unclecity: "Uncle's city",
  FamilyDate: 'Family details updated',
  // Horoscope
  Gothra: 'Gotra',
  Star: 'Star',
  Moonsign: 'Moon sign',
  Charan: 'Charan',
  Gan: 'Gan',
  Nadi: 'Nadi',
  Horosmatch: 'Horoscope match',
  Shani: 'Shani',
  Manglik: 'Manglik',
  BirthPlace: 'Place of birth',
  BirthTime: 'Time of birth',
  BirthCountry: 'Country of birth',
  Kuldivat: 'Kuldivat',
  Devak: 'Devak',
  Navrasnm: 'Navras',
  HoroscopeFile: 'Horoscope file',
  HorosApprove: 'Horoscope approval',
  Horodate: 'Horoscope updated',
  // Partner preference
  Looking: 'Looking for',
  FromAge: 'Age from',
  ToAge: 'Age to',
  Expectation: 'Expectations',
  Country: 'Country',
  State: 'State',
  District: 'District',
  HeightFrom: 'Height from',
  HeightTo: 'Height to',
  IncomeFrom: 'Income from',
  IncomeFromLabel: 'Income from',
  IncomeTo: 'Income to',
  IncomeToLabel: 'Income to',
}

/** Long-form values rendered as note cards instead of label/value rows. */
const NOTE_KEYS = new Set(['AboutUs', 'AboutFamily', 'Expectation', 'SpecialReason'])

/** Raw numeric keys hidden when the API also supplies a formatted label. */
const REDUNDANT_KEYS: Record<string, string> = {
  Annualincome: 'AnnualincomeLabel',
  IncomeFrom: 'IncomeFromLabel',
  IncomeTo: 'IncomeToLabel',
}

/** Internal bookkeeping keys that are not profile data. */
const SKIP_KEYS = new Set(['MatriID', 'RegStep'])

/**
 * Details sold through the contact unlock (`ViewUserContactDetails.php`). The
 * section endpoints return them for any member, so they must never be rendered
 * here or the plan gate means nothing.
 */
const PLAN_GATED_KEYS = new Set([
  'Name',
  'DOB',
  'Email',
  'Mobile',
  'Father',
  'Mother',
  'BirthPlace',
  'BirthTime',
  'HoroscopeFile',
])

/** HTTP 200 carries failures too, so the JSON `status` decides. */
function isFailure(status: unknown): boolean {
  if (status === 0 || status === false) return true
  if (typeof status !== 'string') return false
  return ['error', 'failed', 'fail', '0'].includes(status.trim().toLowerCase())
}

function hasValue(record: Record<string, unknown>, key: string): boolean {
  return asText(record[key]) !== null
}

/**
 * Converts one endpoint payload into a renderable section. Only keys with a
 * label are surfaced, so a field the API adds later stays private until someone
 * decides it belongs on a public profile. When `seen` is supplied, keys already rendered elsewhere
 * are skipped — used only for fields that genuinely repeat across endpoints
 * (Height, Weight, Complexion, AboutUs and friends).
 */
function toSection(
  key: string,
  title: string,
  record: Record<string, unknown>,
  seen?: Set<string>,
): PublicProfileSection {
  const fields: PublicProfileField[] = []
  const notes: PublicProfileField[] = []

  for (const [rawKey, rawValue] of Object.entries(record)) {
    if (SKIP_KEYS.has(rawKey) || PLAN_GATED_KEYS.has(rawKey)) continue

    const label = LABELS[rawKey]
    if (!label) continue

    const labelPair = REDUNDANT_KEYS[rawKey]
    if (labelPair && hasValue(record, labelPair)) continue

    const dedupeKey = rawKey.toLowerCase()
    if (seen) {
      if (seen.has(dedupeKey)) continue
      seen.add(dedupeKey)
    }

    const value = asText(rawValue)
    const entry: PublicProfileField = { label, value }
    if (NOTE_KEYS.has(rawKey)) notes.push(entry)
    else fields.push(entry)
  }

  return { key, title, fields, notes }
}

/**
 * Partner preferences reuse keys such as `City`, `District`, `Religion` and
 * `Education` for the *preferred* values, so they must never be deduped against
 * the member's own details.
 */
const SECTION_DEFS = [
  { key: 'basic', title: 'Basic & lifestyle', path: BASIC_PATH, dedupe: true },
  { key: 'education', title: 'Education & career', path: EDUCATION_PATH, dedupe: true },
  { key: 'family', title: 'Family details', path: FAMILY_PATH, dedupe: true },
  { key: 'horoscope', title: 'Horoscope details', path: HOROSCOPE_PATH, dedupe: true },
  { key: 'partner', title: 'Partner preferences', path: PARTNER_PATH, dedupe: false },
] as const

/** Detail keys already shown in the overview block. */
const OVERVIEW_KEYS = [
  'MatriID',
  'display_name',
  'Gender',
  'Age',
  'birth_year',
  'Height',
  'Maritalstatus',
  'Education',
  'Occupation',
  'profile_location_type',
  'City',
  'Taluka',
  'Dist',
] as const

/** Normalises the `{ status, message, data }` envelope used by every read. */
function payloadOf(data: unknown): Record<string, unknown> | null {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return null
  const body = data as Record<string, unknown>
  const candidates = ['data', 'result', 'profile', 'details']
  for (const key of candidates) {
    const value = body[key]
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const nested = value as Record<string, unknown>
      // `data` may wrap the record under another key (e.g. `data.profile`).
      const inner = payloadOf(nested)
      return inner && Object.keys(nested).length === 1 ? inner : nested
    }
  }
  return body
}

async function fetchSection(
  path: string,
  matriId: string,
): Promise<Record<string, unknown> | null> {
  const body = new URLSearchParams({ MatriID: matriId })
  const { data } = await api.post<Record<string, unknown>>(path, body)
  if (typeof data !== 'object' || data === null) return null
  if (isFailure(data.status)) return null
  return payloadOf(data)
}

/**
 * The gallery endpoint returns every uploaded photo, including ones the public
 * details endpoint deliberately withholds (photo approval / `paidphoto`
 * visibility). Rendering it would bypass that rule, so the detail screen only
 * shows the photo the public API decided is visible.
 */
function approvedPhotos(heroPhoto: string | null): string[] {
  return heroPhoto ? [heroPhoto] : []
}

export interface PublicProfilePagination {
  current_page?: number
  per_page?: number
  total_profiles?: number
  total_pages?: number
}

export interface PublicProfileService {
  list: (
    type: PublicProfileType,
    params?: { gender?: 'Male' | 'Female'; page?: number; limit?: number },
  ) => Promise<{ profiles: ProfilePreview[]; pagination?: PublicProfilePagination }>
  fetchDetails: (matriId: string) => Promise<PublicProfile>
  /** Card-level summary from the details endpoint only, without the section fetches. */
  fetchSummary: (matriId: string) => Promise<ProfilePreview>
}

export const publicProfileService: PublicProfileService = {
  async list(type, params = {}) {
    const query: Record<string, string | number> = {
      page: params.page ?? 1,
      limit: params.limit ?? 12,
    }
    if (params.gender) query.gender = params.gender

    const { data } = await api.get<PublicProfilesResponse>(ENDPOINTS[type], { params: query })
    if (!data || !isSuccess(data.status)) {
      throw new ApiError({ message: data?.message ?? 'Could not load profiles.' })
    }

    const profiles = Array.isArray(data.data?.profiles) ? data.data?.profiles : []
    return {
      profiles: profiles
        .map((row) => mapProfile(row))
        .filter((profile): profile is ProfilePreview => profile !== null),
      pagination: data.data?.pagination,
    }
  },

  async fetchSummary(matriId) {
    const { data } = await api.get<Record<string, unknown>>(DETAILS_PATH, {
      params: { MatriID: matriId },
    })

    const record = typeof data === 'object' && data !== null ? payloadOf(data) : null
    if (!record || isFailure(data.status)) {
      throw new ApiError({ message: 'Could not load this profile.' })
    }

    const profile = mapProfile(record)
    if (!profile) throw new ApiError({ message: 'Could not load this profile.' })
    return { ...profile, photoUrl: withPhotoSize(profile.photoUrl, 500) }
  },

  async fetchDetails(matriId) {
    const { data } = await api.get<Record<string, unknown>>(DETAILS_PATH, {
      params: { MatriID: matriId },
    })

    if (typeof data !== 'object' || data === null) {
      throw new ApiError({ message: 'The server returned an unexpected response.' })
    }
    if (isFailure(data.status)) {
      throw new ApiError({
        message: typeof data.message === 'string' ? data.message : 'Could not load this profile.',
      })
    }

    const record = payloadOf(data)
    if (!record || !asText(pick(record, ['MatriID', 'matri_id', 'display_name']))) {
      throw new ApiError({ message: 'Could not load this profile.' })
    }

    const id = asText(pick(record, ['MatriID', 'matri_id'])) ?? matriId
    const name = asText(pick(record, ['display_name', 'Name'])) ?? id
    const genderRaw = asText(pick(record, ['Gender', 'gender']))
    const photoRaw = asText(pick(record, ['photo_url', 'Photo1', 'photo']))

    const seen = new Set<string>()
    const overviewFields: PublicProfileField[] = [
      { label: LABELS.MatriID, value: id },
      { label: LABELS.display_name, value: name },
      { label: LABELS.Gender, value: genderRaw },
      { label: LABELS.Age, value: asText(pick(record, ['Age'])) },
      { label: LABELS.birth_year, value: asText(pick(record, ['birth_year'])) },
      { label: LABELS.Height, value: asText(pick(record, ['Height'])) },
      { label: LABELS.Maritalstatus, value: asText(pick(record, ['Maritalstatus'])) },
      { label: LABELS.Education, value: asText(pick(record, ['Education'])) },
      { label: LABELS.Occupation, value: asText(pick(record, ['Occupation'])) },
      { label: LABELS.profile_location_type, value: asText(pick(record, ['profile_location_type'])) },
      { label: LABELS.City, value: asText(pick(record, ['City'])) },
      { label: LABELS.Taluka, value: asText(pick(record, ['Taluka'])) },
      { label: LABELS.Dist, value: asText(pick(record, ['Dist'])) },
    ]
    for (const key of OVERVIEW_KEYS) {
      if (asText(record[key]) !== null) seen.add(key.toLowerCase())
    }

    const sectionResults = await Promise.allSettled(
      SECTION_DEFS.map((def) => fetchSection(def.path, id)),
    )

    const sections: PublicProfileSection[] = []
    sectionResults.forEach((result, index) => {
      const def = SECTION_DEFS[index]
      if (result.status !== 'fulfilled' || !result.value) return
      sections.push(
        toSection(def.key, def.title, result.value, def.dedupe ? seen : undefined),
      )
    })

    const heroPhoto = withPhotoSize(photoRaw, 1000)
    const photos = approvedPhotos(heroPhoto)

    return {
      id,
      name,
      age: toAge(pick(record, ['Age'])),
      birthYear: toAge(pick(record, ['birth_year'])) || undefined,
      gender: genderRaw === 'Male' ? 'Groom' : genderRaw === 'Female' ? 'Bride' : undefined,
      height: asText(pick(record, ['Height'])) ?? undefined,
      education: asText(pick(record, ['Education'])) ?? undefined,
      occupation: asText(pick(record, ['Occupation'])) ?? undefined,
      maritalStatus: asText(pick(record, ['Maritalstatus'])) ?? undefined,
      locationType: asText(pick(record, ['profile_location_type'])) ?? undefined,
      city: asText(pick(record, ['City'])) ?? undefined,
      taluka: asText(pick(record, ['Taluka'])) ?? undefined,
      district: asText(pick(record, ['Dist'])) ?? undefined,
      photoUrl: heroPhoto,
      photos,
      profileUrl: asText(pick(record, ['profile_url'])) ?? undefined,
      overview: overviewFields,
      sections,
    }
  },
}
