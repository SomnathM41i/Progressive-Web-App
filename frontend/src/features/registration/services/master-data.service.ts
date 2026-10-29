import { api } from '@/services/api'
import { toApiError } from '@/services/api-error'

export interface MasterOption {
  value: string
  label: string
  id?: string
}

type MasterRow = Record<string, unknown>
type OptionMapper = (row: MasterRow) => MasterOption | null

const cache = new Map<string, Promise<MasterOption[]>>()
const rowCache = new Map<string, Promise<MasterRow[]>>()

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function rowsFrom(payload: unknown): MasterRow[] {
  if (Array.isArray(payload)) {
    return payload.filter(
      (row): row is MasterRow => typeof row === 'object' && row !== null,
    )
  }

  if (typeof payload !== 'object' || payload === null) return []
  const record = payload as Record<string, unknown>
  if (Array.isArray(record.data)) return rowsFrom(record.data)

  return []
}

function mapOption(
  row: MasterRow,
  valueKey: string,
  labelKey: string,
): MasterOption | null {
  const value = text(row[valueKey])
  const label = text(row[labelKey])
  if (!value || !label) return null

  return {
    value,
    label,
    id: text(row.id) || value,
  }
}

async function load(
  path: string,
  params: Record<string, string> | undefined,
  mapper: OptionMapper,
): Promise<MasterOption[]> {
  const key = `${path}?${new URLSearchParams(params).toString()}`
  const cached = cache.get(key)
  if (cached) return cached

  const request = api
    .get<unknown>(path, { params })
    .then(({ data }) => {
      const options = rowsFrom(data)
        .map(mapper)
        .filter(
          (option): option is MasterOption =>
            option !== null && !/^-{3,}/.test(option.label),
        )
      return options
    })
    .catch((error: unknown) => {
      cache.delete(key)
      throw toApiError(error)
    })

  cache.set(key, request)
  return request
}

function loadAllRows(path: string): Promise<MasterRow[]> {
  const cached = rowCache.get(path)
  if (cached) return cached

  const request = api
    .get<unknown>(path)
    .then(({ data }) => rowsFrom(data))
    .catch((error: unknown) => {
      rowCache.delete(path)
      throw toApiError(error)
    })

  rowCache.set(path, request)
  return request
}

function filterRowsBy(rows: MasterRow[], key: string, value: string): MasterRow[] {
  const wanted = value.trim().toLowerCase()
  return rows.filter((row) => text(row[key]).toLowerCase() === wanted)
}

function optionsFromRows(
  rows: MasterRow[],
  valueKey: string,
  labelKey: string,
): MasterOption[] {
  return rows
    .map((row) => mapOption(row, valueKey, labelKey))
    .filter(
      (option): option is MasterOption =>
        option !== null && !/^-{3,}/.test(option.label),
    )
}

function simple(path: string, valueKey: string, labelKey: string) {
  return () => load(path, undefined, (row) => mapOption(row, valueKey, labelKey))
}

function dependent(
  path: string,
  param: string,
  valueKey: string,
  labelKey: string,
  value: string,
) {
  return load(path, { [param]: value }, (row) => mapOption(row, valueKey, labelKey))
}

export const masterDataService = {
  countries: () =>
    load('/get-country-list.php', undefined, (row) => {
      const value = text(row.id)
      const name = text(row.nicename)
      if (!value || !name) return null
      const code = text(row.phonecode)
      return { value, label: code ? `${name} (${code})` : name, id: value }
    }),
  relations: simple('/get-profile-created_by-relations.php', 'relation', 'relation'),
  maritalStatuses: simple('/get-maritial_status-list.php', 'status', 'status'),
  religions: simple('/get-religion-list.php', 'religion', 'religion'),
  castes: (religion: string) =>
    dependent('/get-caste-list.php', 'religion', 'caste', 'caste', religion),
  subcastes: (caste: string) =>
    dependent('/get-subcaste-list.php', 'caste', 'subcast', 'subcast', caste),
  days: simple('/get-day-list.php', 'day', 'day'),
  years: simple('/get-year-list.php', 'year', 'year'),
  residencies: simple(
    '/get-residency-list.php',
    'residency_status',
    'residency_status',
  ),
  states: (country: string) =>
    dependent('/get-state-list.php', 'country', 'state', 'state', country),
  districts: (state: string) =>
    dependent('/get-district-list.php', 'state', 'dist', 'dist', state),
  cities: (district: string) =>
    dependent('/get-city-list.php', 'district', 'city', 'city', district),
  citiesForTaluka: async (taluka: string) => {
    const direct = await dependent(
      '/get-city-list.php',
      'taluka',
      'city',
      'city',
      taluka,
    )
    if (direct.length) return direct
    const rows = await loadAllRows('/get-all-city-list.php')
    return optionsFromRows(filterRowsBy(rows, 'taluka', taluka), 'city', 'city')
  },
  allCities: async () =>
    optionsFromRows(await loadAllRows('/get-all-city-list.php'), 'city', 'city'),
  talukas: (district: string) =>
    dependent('/get-taluka-list.php', 'district', 'taluka', 'taluka', district),
  talukasForDistrict: async (district: string) => {
    const direct = await dependent(
      '/get-taluka-list.php',
      'district',
      'taluka',
      'taluka',
      district,
    )
    if (direct.length) return direct
    const rows = await loadAllRows('/get-all-talukas.php')
    return optionsFromRows(filterRowsBy(rows, 'district', district), 'taluka', 'taluka')
  },
  allTalukas: async () =>
    optionsFromRows(await loadAllRows('/get-all-talukas.php'), 'taluka', 'taluka'),
  educations: simple('/get-education-list.php', 'edu', 'edu'),
  incomes: simple('/get-income-list.php', 'value', 'income'),
  occupations: simple('/get-occupations-list.php', 'occu', 'occu'),
  allOccupations: simple('/get-all-occupations-list.php', 'occu', 'occu'),
  employedIn: simple('/get-employed_in-list.php', 'employed', 'employed'),
  workingHours: simple('/get-working_hours-list.php', 'hours', 'hours'),
  bloodGroups: simple('/get-blood_group-list.php', 'type', 'type'),
  complexions: simple('/get-complexion-list.php', 'complexion', 'complexion'),
  specialCases: simple('/get-special_case-list.php', 'case_type', 'case_type'),
  iitUniversities: simple('/get-iit-universities-list.php', 'name', 'name'),
  familyValues: simple('/get-family_values-list.php', 'family_values', 'family_values'),
  familyTypes: simple('/get-family_type-list.php', 'family_typ', 'family_typ'),
  familyStatuses: simple('/get-family_status-list.php', 'family_status', 'family_status'),
  motherTongues: simple('/get-mother_tounge-list.php', 'mother_tounge', 'mother_tounge'),
  brothers: simple('/get-no_of_brother-list.php', 'number', 'number'),
  sisters: simple('/get-no_of_sister-list.php', 'number', 'number'),
  familyWealth: simple('/get-family_wealth-list.php', 'wealth', 'wealth'),
  callingTimes: simple('/get-calling_time-list.php', 'call_time', 'call_time'),
  nakshatras: simple('/get-nakshatra-list.php', 'nakshatra', 'nakshatra'),
  gothras: simple('/get-gothra-list.php', 'gothra', 'gothra'),
  moonSigns: simple('/get-moon_sign-list.php', 'moon_sign', 'moon_sign'),
  horoscopeMatches: simple('/get-horoscope_match-list.php', 'type', 'type'),
  shani: simple('/get-shani-list.php', 'type', 'type'),
  manglik: simple('/get-manglik-list.php', 'type', 'type'),
  birthAmPm: simple('/get-brithampm-list.php', 'birthampm', 'birthampm'),
  fromAges: simple('/get-fromage-list.php', 'fromage', 'fromage'),
  toAges: simple('/get-toage-list.php', 'toage', 'toage'),
}
