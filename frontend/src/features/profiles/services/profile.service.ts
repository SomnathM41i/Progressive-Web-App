import { resolveMediaUrl } from '@/features/profiles/media'
import type {
  GalleryPhoto,
  MembershipPlan,
  ProfileApiRecord,
  ProfileBiodata,
  ProfileDocument,
  ProfileEnvelope,
  ProfileField,
  ProfileSection,
  ProfileSettings,
} from '@/features/profiles/types'
import { api } from '@/services/api'
import { ApiError } from '@/services/api-error'

/**
 * Boundary between the "My Profile" screens and the SVR read API.
 *
 * Every endpoint in the collection's Registration Master → Get Masters folder
 * is a `POST` carrying the acting member's `MatriID` as form data. They are
 * reads — nothing here changes server state. The collection ships no saved
 * response examples, so the response envelope is normalised tolerantly (like
 * `interests.service.ts`) and field names are matched case-insensitively
 * against a candidate list rather than assumed.
 */

/** Keys the API family may use to carry the payload object. */
const DATA_KEYS = ['data', 'result', 'profile', 'details', 'settings', 'user', 'record'] as const

/**
 * Interprets the `status` field. The API answers HTTP 200 for failures too, so
 * `status` decides; anything that is not a recognised failure is treated as
 * success (the exact positive tokens per endpoint are unconfirmed).
 */
function isFailure(status: unknown): boolean {
  if (status === 0 || status === false) return true
  if (typeof status === 'string') {
    const normalised = status.trim().toLowerCase()
    return (
      normalised === 'error' ||
      normalised === 'failed' ||
      normalised === 'fail' ||
      normalised === '0'
    )
  }
  return false
}

function ensureJsonBody(data: unknown): asserts data is ProfileEnvelope<unknown> {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new ApiError({
      message: 'The server returned an unexpected response. Please try again.',
    })
  }
}

/** Reads the first value whose key matches (case-insensitively) one of `keys`. */
function pick(record: ProfileApiRecord, keys: string[]): unknown {
  const wanted = keys.map((key) => key.toLowerCase())
  for (const [key, value] of Object.entries(record)) {
    if (wanted.includes(key.toLowerCase()) && value !== null && value !== '') {
      return value
    }
  }
  return undefined
}

/** Coerces any scalar into a trimmed display string, or `null` when empty. */
function asText(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed ? trimmed : null
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) {
    const parts = value.map(asText).filter((part): part is string => part !== null)
    return parts.length ? parts.join(', ') : null
  }
  return null
}

/** Builds a field from a candidate key list, resolving media when asked. */
function field(
  record: ProfileApiRecord,
  label: string,
  keys: string[],
  options: { media?: boolean } = {},
): ProfileField {
  const value = asText(pick(record, keys))
  return {
    label,
    value: options.media ? resolveMediaUrl(value) : value,
    isMedia: options.media,
  }
}

/** Prefers the API's formatted label over its raw amount, e.g. `5 Lakh`. */
function labelledField(
  record: ProfileApiRecord,
  label: string,
  labelKey: string,
  keys: string[],
): ProfileField {
  const formatted = field(record, label, [labelKey])
  return formatted.value ? formatted : field(record, label, keys)
}

/**
 * Extracts the payload object from a response body, unwrapping one nested level
 * when the data lives behind a known key (`{ data: { ... } }`).
 */
function extractRecord(body: ProfileEnvelope<unknown>): ProfileApiRecord {
  const nested = pick(body as ProfileApiRecord, [...DATA_KEYS])
  if (typeof nested === 'object' && nested !== null && !Array.isArray(nested)) {
    return nested as ProfileApiRecord
  }
  if (Array.isArray(nested) && nested.length && typeof nested[0] === 'object') {
    return nested[0] as ProfileApiRecord
  }
  // No recognised wrapper — treat the body itself as the record.
  return body as ProfileApiRecord
}

/** Shared GET-style read: POST MatriID, normalise, return the payload record. */
async function fetchRecord(
  path: string,
  matriId: string,
  fallbackMessage: string,
): Promise<ProfileApiRecord> {
  const body = new URLSearchParams({ MatriID: matriId })
  const { data } = await api.post<ProfileEnvelope<unknown>>(path, body)

  ensureJsonBody(data)

  if (isFailure(data.status)) {
    throw new ApiError({ message: data.message || fallbackMessage })
  }

  return extractRecord(data)
}

/** Extracts an array of records from a body under any candidate list key. */
function extractArray(body: ProfileEnvelope<unknown>, keys: string[]): ProfileApiRecord[] {
  for (const key of keys) {
    const value = pick(body as ProfileApiRecord, [key])
    if (Array.isArray(value)) return value as ProfileApiRecord[]
  }
  // Search one level of nesting for the first array of objects.
  for (const value of Object.values(body)) {
    if (Array.isArray(value) && value.length && typeof value[0] === 'object') {
      return value as ProfileApiRecord[]
    }
  }
  return []
}

/*
 * ── Section readers ────────────────────────────────────────────────────────
 *
 * Each maps the raw record to a `ProfileSection` (ordered rows + notes). Field
 * key lists are drawn from the collection's update-form field names, which
 * mirror the read payloads; the first matching key that holds a value wins.
 */

function mapBasic(record: ProfileApiRecord): ProfileSection {
  return {
    fields: [
      field(record, 'Name', ['Name', 'FullName', 'full_name']),
      field(record, 'Profile ID', ['MatriID', 'matri_id']),
      field(record, 'Gender', ['Gender', 'gender']),
      field(record, 'Date of birth', ['DOB', 'dob', 'DateOfBirth']),
      field(record, 'Age', ['Age', 'age']),
      field(record, 'Height', ['Height', 'height']),
      field(record, 'Weight', ['Weight', 'weight']),
      field(record, 'Blood group', ['BloodGroup', 'bgroup', 'blood_group']),
      field(record, 'Complexion', ['Complexion', 'complexion']),
      field(record, 'Special case', ['SpecialCases', 'scases']),
      field(record, 'Profile created by', ['Profilecreatedby', 'profile_created_by']),
      field(record, 'Marital status', ['MaritalStatus', 'maritalstatus']),
      field(record, 'Children', ['NoOfChildren', 'noofchildren']),
      field(record, 'Children status', ['ChildrenStatus', 'childrenstatus']),
      field(record, 'Religion', ['Religion', 'religion']),
      field(record, 'Caste', ['Caste', 'caste']),
      field(record, 'Sub-caste', ['Subcaste', 'subcaste']),
      field(record, 'Country code', ['CountryCode', 'countrycode']),
      field(record, 'Mobile', ['Mobile', 'mobile']),
      field(record, 'Email', ['Email', 'ConfirmEmail', 'email']),
    ],
    notes: [field(record, 'About', ['AboutUs', 'aboutus'])],
  }
}

function mapContact(record: ProfileApiRecord): ProfileSection {
  return {
    fields: [
      field(record, 'Address', ['Address', 'address']),
      field(record, 'Country', ['Country', 'country']),
      field(record, 'State', ['State', 'state']),
      field(record, 'District', ['District', 'dist']),
      field(record, 'Taluka', ['Taluka', 'taluka']),
      field(record, 'City', ['City', 'city']),
      field(record, 'Pincode', ['Pincode', 'pincode']),
      field(record, 'Mobile', ['Mobile', 'mobile']),
      field(record, 'Alternate mobile', ['Mobile2', 'mobile2']),
      field(record, 'Phone', ['Phone', 'phone']),
      field(record, 'Work phone', ['WorkPhone', 'work_phone']),
      field(record, 'Residence status', ['ResidenceStatus', 'residence']),
      field(record, 'Calling time', ['CallingTime', 'calling']),
      field(record, 'Work address', ['WorkAddress', 'work_address']),
      field(record, 'Working city', ['WorkingCity', 'working_city']),
      field(record, 'Working taluka', ['WorkingTaluka', 'working_taluka']),
      field(record, 'Working district', ['WorkingDistrict', 'WorkingDist', 'working_dist']),
      field(record, 'Working state', ['WorkingState', 'working_state']),
      field(record, 'Working country', ['WorkingCountry', 'working_country']),
    ],
    notes: [],
  }
}

function mapEducation(record: ProfileApiRecord): ProfileSection {
  return {
    fields: [
      field(record, 'Education', ['Education', 'education']),
      field(record, 'Institute', ['Institute', 'instu', 'InstituteName']),
      labelledField(record, 'Annual income', 'AnnualincomeLabel', ['Annualincome', 'AnnualIncome', 'annual_income']),
      field(record, 'Monthly income', ['Month_income', 'MonthlyIncome']),
      field(record, 'Occupation', ['Occupation', 'occupation']),
      field(record, 'Employed in', ['Employedin', 'employedin']),
      field(record, 'Working hours', ['WorkingHours', 'workinghrs']),
      field(record, 'Working location', ['WorkingLocation', 'workloc']),
      field(record, 'IIT / IIM / NIT', ['IIT', 'iit']),
    ],
    notes: [
      field(record, 'Education details', ['EducationDetails', 'edetails']),
      field(record, 'Occupation details', ['OccuDetails', 'odetails']),
    ],
  }
}

function mapFamily(record: ProfileApiRecord): ProfileSection {
  return {
    fields: [
      field(record, 'Family values', ['FamilyValues', 'fvalues']),
      field(record, 'Family type', ['FamilyType', 'ftype']),
      field(record, 'Family status', ['FamilyStatus', 'fstatus']),
      field(record, 'Mother tongue', ['MotherTongue', 'mother_tounge']),
      field(record, 'Father', ['Father', 'father']),
      field(record, 'Father occupation', ['FatherOccupation', 'fatherOccupation']),
      field(record, 'Mother', ['Mother', 'mother']),
      field(record, 'Mother occupation', ['MotherOccupation', 'motheroccupation']),
      field(record, 'Brothers', ['Brothers', 'brothers']),
      field(record, 'Brothers married', ['BrothersMarried', 'bmarried']),
      field(record, 'Sisters', ['Sisters', 'sisters']),
      field(record, 'Sisters married', ['SistersMarried', 'smarried']),
      field(record, 'Living status', ['LivingStatus', 'living_status']),
      field(record, 'Uncle', ['Uncle', 'unclename']),
      field(record, 'Uncle city', ['UncleCity', 'unclecity']),
      field(record, 'Relatives', ['Relatives', 'relative']),
      field(record, 'Family wealth', ['FamilyWealth', 'family_wealth']),
      field(record, 'Property', ['Property', 'property_types']),
      field(record, 'Investments', ['Investments', 'investment_types']),
      field(record, 'Monthly rental income', ['MonthlyRentalIncome', 'monthly_rental_income']),
    ],
    notes: [field(record, 'About family', ['AboutFamily', 'aboufamily'])],
  }
}

function mapHoroscope(record: ProfileApiRecord): ProfileSection {
  return {
    fields: [
      field(record, 'Gothra', ['Gothra', 'gothra']),
      field(record, 'Star / Nakshatra', ['Star', 'star', 'Nakshatra']),
      field(record, 'Moon sign', ['Moonsign', 'moonsign']),
      field(record, 'Charan', ['Charan', 'charan']),
      field(record, 'Gan', ['Gan', 'gan']),
      field(record, 'Nadi', ['Nadi', 'nadi']),
      field(record, 'Horoscope match', ['Horosmatch', 'hmatch']),
      field(record, 'Shani', ['Shani', 'shani']),
      field(record, 'Manglik', ['Manglik', 'manglik']),
      field(record, 'Devak', ['Devak', 'devak']),
      field(record, 'Kuldivat', ['Kuldivat', 'kuldivat']),
      field(record, 'Naav / Ras', ['Navrasnm', 'navrasnm']),
      field(record, 'Birth country', ['BirthCountry', 'bcountry']),
      field(record, 'Birth place', ['BirthPlace', 'bplace']),
      field(record, 'Birth time', ['BirthTime', 'bhour']),
      field(record, 'Horoscope file', ['HoroscopeFile', 'fileToUpload'], { media: true }),
    ],
    notes: [],
  }
}

function mapPartnerPreference(record: ProfileApiRecord): ProfileSection {
  return {
    fields: [
      field(record, 'Looking for', ['Looking', 'looking']),
      field(record, 'Age from', ['FromAge', 'fromage']),
      field(record, 'Age to', ['ToAge', 'toage']),
      field(record, 'Height from', ['HeightFrom', 'heightfrom']),
      field(record, 'Height to', ['HeightTo', 'heightto']),
      field(record, 'Religion', ['Religion', 'religion1']),
      field(record, 'Caste', ['Caste', 'caste1']),
      field(record, 'Education', ['Education', 'education1']),
      field(record, 'Occupation', ['Occupation', 'occupation1']),
      field(record, 'Complexion', ['Complexion', 'complexion1']),
      field(record, 'Residence status', ['ResidenceStatus', 'rstatus1']),
      field(record, 'Country', ['Country', 'country1']),
      field(record, 'State', ['State', 'state1']),
      labelledField(record, 'Income from', 'IncomeFromLabel', ['IncomeFrom', 'income_from']),
      labelledField(record, 'Income to', 'IncomeToLabel', ['IncomeTo', 'income_to']),
    ],
    notes: [field(record, 'Expectation', ['Expectation', 'expectation'])],
  }
}

function mapMembership(record: ProfileApiRecord): MembershipPlan {
  return {
    planName: asText(pick(record, ['plan_name', 'PlanName'])),
    activationDate: asText(pick(record, ['activation_date', 'ActivationDate'])),
    expiryDate: asText(pick(record, ['expiry_date', 'ExpiryDate'])),
    durationDays: asText(pick(record, ['plan_duration_days', 'PlanDurationDays'])),
    amount: asText(pick(record, ['plan_amount', 'PlanAmount'])),
    totalContacts: asText(pick(record, ['total_contacts', 'TotalContacts'])),
    remainingContacts: asText(pick(record, ['remaining_contacts', 'RemainingContacts'])),
    paymentMode: asText(pick(record, ['payment_mode', 'PaymentMode'])),
    invoiceId: asText(pick(record, ['invoice_id', 'InvoiceId'])),
  }
}

/*
 * ── Endpoints ──────────────────────────────────────────────────────────────
 */

const BASIC_PATH = '/get-basic-details.php'
const CONTACT_PATH = '/get-contact-details.php'
const EDUCATION_PATH = '/get-education_occupation-details.php'
const FAMILY_PATH = '/get-family-details.php'
const HOROSCOPE_PATH = '/get-horoscope-details.php'
const PARTNER_PREFERENCE_PATH = '/get-partner-preference-details.php'
const PHOTO_GALLERY_PATH = '/get-photo-gallery.php'
const DOCUMENT_PATH = '/get-document.php'
const BIODATA_PATH = '/get-biodata.php'
const SETTINGS_PATH = '/get-My-Settings.php'
const MEMBERSHIP_PATH = '/getMyMembershipPlanDetails.php'

/** Maps a raw API row to a gallery photo (id + resolved URL required). */
function toPhoto(row: ProfileApiRecord, index: number): GalleryPhoto | null {
  const url = resolveMediaUrl(asText(pick(row, ['url', 'Url', 'path', 'photo', 'image'])))
  if (!url) return null
  return {
    id: asText(pick(row, ['id', 'Id', 'photo_id'])) ?? String(index),
    name: asText(pick(row, ['name', 'Name', 'title'])) ?? `Photo ${index + 1}`,
    status: asText(pick(row, ['status', 'Status'])) ?? undefined,
    url,
  }
}

/** Maps a raw API row to a document entry. */
function toDocument(row: ProfileApiRecord, index: number): ProfileDocument | null {
  const url = resolveMediaUrl(asText(pick(row, ['url', 'Url', 'path', 'file', 'document'])))
  if (!url) return null
  return {
    id: asText(pick(row, ['id', 'Id', 'document_id'])) ?? String(index),
    name: asText(pick(row, ['name', 'Name', 'title', 'document_name'])) ?? `Document ${index + 1}`,
    status: asText(pick(row, ['status', 'Status'])) ?? undefined,
    url,
  }
}

export interface ProfileService {
  fetchBasic: (matriId: string) => Promise<ProfileSection>
  fetchContact: (matriId: string) => Promise<ProfileSection>
  fetchEducation: (matriId: string) => Promise<ProfileSection>
  fetchFamily: (matriId: string) => Promise<ProfileSection>
  fetchHoroscope: (matriId: string) => Promise<ProfileSection>
  fetchPartnerPreference: (matriId: string) => Promise<ProfileSection>
  fetchPhotos: (matriId: string) => Promise<GalleryPhoto[]>
  fetchDocuments: (matriId: string) => Promise<ProfileDocument[]>
  fetchBiodata: (matriId: string) => Promise<ProfileBiodata>
  fetchSettings: (matriId: string) => Promise<ProfileSettings>
  fetchMembership: (matriId: string) => Promise<MembershipPlan>
}

const profileServiceImpl: ProfileService = {
  async fetchBasic(matriId) {
    const record = await fetchRecord(BASIC_PATH, matriId, 'Could not load your basic details.')
    return mapBasic(record)
  },

  async fetchContact(matriId) {
    const record = await fetchRecord(CONTACT_PATH, matriId, 'Could not load your contact details.')
    return mapContact(record)
  },

  async fetchEducation(matriId) {
    const record = await fetchRecord(
      EDUCATION_PATH,
      matriId,
      'Could not load your education and career details.',
    )
    return mapEducation(record)
  },

  async fetchFamily(matriId) {
    const record = await fetchRecord(FAMILY_PATH, matriId, 'Could not load your family details.')
    return mapFamily(record)
  },

  async fetchHoroscope(matriId) {
    const record = await fetchRecord(
      HOROSCOPE_PATH,
      matriId,
      'Could not load your horoscope details.',
    )
    return mapHoroscope(record)
  },

  async fetchPartnerPreference(matriId) {
    const record = await fetchRecord(
      PARTNER_PREFERENCE_PATH,
      matriId,
      'Could not load your partner preference.',
    )
    return mapPartnerPreference(record)
  },

  async fetchPhotos(matriId) {
    const body = new URLSearchParams({ MatriID: matriId })
    const { data } = await api.post<ProfileEnvelope<unknown>>(PHOTO_GALLERY_PATH, body)
    ensureJsonBody(data)
    if (isFailure(data.status)) {
      throw new ApiError({ message: data.message || 'Could not load your photos.' })
    }
    const rows = extractArray(data, ['gallery', 'photos', 'data', 'results'])
    return rows
      .map(toPhoto)
      .filter((photo): photo is GalleryPhoto => photo !== null)
  },

  async fetchDocuments(matriId) {
    const body = new URLSearchParams({ MatriID: matriId })
    const { data } = await api.post<ProfileEnvelope<unknown>>(DOCUMENT_PATH, body)
    ensureJsonBody(data)
    if (isFailure(data.status)) {
      throw new ApiError({ message: data.message || 'Could not load your documents.' })
    }
    const rows = extractArray(data, ['documents', 'data', 'results'])
    return rows
      .map(toDocument)
      .filter((document): document is ProfileDocument => document !== null)
  },

  async fetchBiodata(matriId) {
    const body = new URLSearchParams({ MatriID: matriId })
    const { data } = await api.post<ProfileEnvelope<unknown>>(BIODATA_PATH, body)
    ensureJsonBody(data)
    if (isFailure(data.status)) {
      // "No biodata uploaded" is a normal empty state, not an error.
      return { available: false, url: null }
    }
    const record = extractRecord(data)
    const url = resolveMediaUrl(
      asText(pick(record, ['url', 'Url', 'path', 'file', 'biodata'])),
    )
    return { available: url !== null, url }
  },

  async fetchSettings(matriId) {
    const record = await fetchRecord(SETTINGS_PATH, matriId, 'Could not load your settings.')

    const knownKeys = new Set(
      [
        'horoscope_visibility',
        'horoscopevisibility',
        'phone_visibility',
        'phonevisibility',
        'photo_visibility',
        'photovisibility',
      ].map((key) => key.toLowerCase()),
    )

    const extra: Array<{ key: string; value: string }> = []
    for (const [key, value] of Object.entries(record)) {
      if (knownKeys.has(key.toLowerCase())) continue
      const text = asText(value)
      if (text) extra.push({ key, value: text })
    }

    return {
      horoscopeVisibility: asText(
        pick(record, ['horoscope_visibility', 'HoroscopeVisibility', 'horoscopevisibility']),
      ),
      phoneVisibility: asText(
        pick(record, ['phone_visibility', 'PhoneVisibility', 'phonevisibility']),
      ),
      photoVisibility: asText(
        pick(record, ['photo_visibility', 'PhotoVisibility', 'photovisibility']),
      ),
      extra,
    }
  },

  async fetchMembership(matriId) {
    const body = new URLSearchParams({ MatriID: matriId })
    const { data } = await api.post<ProfileEnvelope<unknown>>(MEMBERSHIP_PATH, body)
    ensureJsonBody(data)

    // A member without a plan returns no plan_info — an empty state, not an error.
    if (isFailure(data.status)) {
      return mapMembership({})
    }

    const record = extractRecord(data)
    const nested = pick(record, ['plan_info', 'plan', 'PlanInfo'])
    if (typeof nested === 'object' && nested !== null && !Array.isArray(nested)) {
      return mapMembership(nested as ProfileApiRecord)
    }
    return mapMembership(record)
  },
}

export const profileService: ProfileService = profileServiceImpl
