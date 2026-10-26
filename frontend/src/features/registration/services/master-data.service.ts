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
        .filter((option): option is MasterOption => option !== null)
      return options
    })
    .catch((error: unknown) => {
      cache.delete(key)
      throw toApiError(error)
    })

  cache.set(key, request)
  return request
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
  talukas: (district: string) =>
    dependent('/get-taluka-list.php', 'district', 'taluka', 'taluka', district),
  educations: simple('/get-education-list.php', 'edu', 'edu'),
  incomes: simple('/get-income-list.php', 'income', 'income'),
  occupations: simple('/get-occupations-list.php', 'occu', 'occu'),
  allOccupations: simple('/get-all-occupations-list.php', 'occu', 'occu'),
  employedIn: simple('/get-employed_in-list.php', 'employed', 'employed'),
  workingHours: simple('/get-working_hours-list.php', 'hours', 'hours'),
  bloodGroups: simple('/get-blood_group-list.php', 'type', 'type'),
  complexions: simple('/get-complexion-list.php', 'complexion', 'complexion'),
  specialCases: simple('/get-special_case-list.php', 'case_type', 'case_type'),
  iitUniversities: simple('/get-iit-universities-list.php', 'university', 'university'),
  familyValues: simple('/get-family_values-list.php', 'value', 'value'),
  familyTypes: simple('/get-family_type-list.php', 'type', 'type'),
  familyStatuses: simple('/get-family_status-list.php', 'status', 'status'),
  motherTongues: simple('/get-mother_tounge-list.php', 'language', 'language'),
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
}
