import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Spinner } from '@/components/loading/Spinner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { MultiSelectField } from '@/components/ui/MultiSelectField'
import { SelectField } from '@/components/ui/SelectField'
import { TextField } from '@/components/ui/TextField'
import { TextareaField } from '@/components/ui/TextareaField'
import { routes } from '@/config/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useRegistration } from '@/features/registration/hooks/useRegistration'
import { masterDataService } from '@/features/registration/services/master-data.service'
import type { MasterOption } from '@/features/registration/services/master-data.service'
import { registrationService } from '@/features/registration/services/registration.service'
import {
  nextRegistrationStep,
  registrationStepPath,
} from '@/features/registration/steps'
import type {
  ContactDetails,
  EducationDetails,
  FamilyDetails,
  HoroscopeDetails,
  PartnerPreferenceDetails,
} from '@/features/registration/types'
import {
  BIRTH_AMPM_OPTIONS,
  BIRTH_HOURS,
  BIRTH_MINUTES,
  BIRTH_SECONDS,
  GAN_OPTIONS,
  HEIGHT_CODES,
  NADI_OPTIONS,
  heightCodeFromLabel,
  heightLabel,
  type RegistrationStepId,
} from '@/features/registration/constants'
import { useToast } from '@/hooks/useToast'
import { toApiError } from '@/services/api-error'

type SectionName = 'contact' | 'education' | 'family' | 'horoscope' | 'partner'
type SectionPayload =
  | ContactDetails
  | EducationDetails
  | FamilyDetails
  | HoroscopeDetails
  | PartnerPreferenceDetails
type Values = Record<string, string>
type MasterName =
  | 'countries'
  | 'residencies'
  | 'callingTimes'
  | 'educations'
  | 'incomes'
  | 'occupations'
  | 'employedIn'
  | 'workingHours'
  | 'iitUniversities'
  | 'familyValues'
  | 'familyTypes'
  | 'familyStatuses'
  | 'motherTongues'
  | 'brothers'
  | 'sisters'
  | 'familyWealth'
  | 'gothras'
  | 'nakshatras'
  | 'moonSigns'
  | 'horoscopeMatches'
  | 'shani'
  | 'manglik'
  | 'birthAmPm'
  | 'religions'
  | 'maritalStatuses'
  | 'complexions'
  | 'fromAges'
  | 'toAges'
interface Field {
  key: string
  label: string
  master?: MasterName
  required?: boolean
  multiline?: boolean
  multiple?: boolean
  optional?: boolean
}
interface SectionConfig {
  title: string
  fields: Field[]
  readMap: Record<string, string>
  submit: (payload: never) => Promise<{ message: string | null }>
  read: (id: string) => Promise<Record<string, unknown>>
}

const field = (
  key: string,
  label: string,
  master?: MasterName,
  required = false,
  multiline = false,
): Field => ({ key, label, master, required, multiline })
const multiField = (
  key: string,
  label: string,
  master?: MasterName,
  required = false,
): Field => ({ key, label, master, required, multiple: true })

const SAME_ADDRESS_MAP: Record<string, string> = {
  address: 'work_address',
  country: 'working_country',
  state: 'working_state',
  dist: 'working_dist',
  taluka: 'working_taluka',
  city: 'working_city',
  pincode: 'work_pincode',
  mobile: 'work_phone',
  residence: 'work_residence',
}
const CONTACT_WORK_KEYS = new Set(Object.values(SAME_ADDRESS_MAP))
const BIRTH_TIME_KEYS = new Set(['bhour', 'bminute', 'bsecond', 'bampm'])
const PARTNER_DYNAMIC_KEYS = new Set([
  'caste1',
  'state1',
  'district1',
  'taluka1',
  'city1',
])
const PARTNER_LOCATION_PARENTS: Record<string, string> = {
  state1: 'country1',
  district1: 'state1',
  taluka1: 'district1',
  city1: 'taluka1',
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

function countFrom(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (/^none$/i.test(trimmed)) return 0
  const match = /\d+/.exec(trimmed)
  return match ? Number(match[0]) : null
}

function mergeOptions(results: PromiseSettledResult<MasterOption[]>[]): MasterOption[] {
  const merged = new Map<string, MasterOption>()
  for (const result of results) {
    if (result.status !== 'fulfilled') continue
    for (const option of result.value) {
      if (!merged.has(option.value)) merged.set(option.value, option)
    }
  }
  return [...merged.values()]
}

function workAddressValues(values: Values): Values {
  return Object.fromEntries(
    Object.entries(SAME_ADDRESS_MAP).map(([home, work]) => [work, values[home] ?? '']),
  )
}

function hasDifferentWorkAddress(values: Values): boolean {
  return Object.entries(SAME_ADDRESS_MAP).some(([home, work]) => {
    const workValue = values[work]?.trim() ?? ''
    return Boolean(workValue) && workValue !== (values[home]?.trim() ?? '')
  })
}

const config: Record<SectionName, SectionConfig> = {
  contact: {
    title: 'Contact details',
    submit: registrationService.submitContactDetails as SectionConfig['submit'],
    read: registrationService.getContactDetails,
    fields: [
      field('address', 'Home address', undefined, true),
      field('country', 'Country', 'countries', true),
      field('state', 'State', undefined, true),
      field('dist', 'District', undefined, true),
      field('taluka', 'Taluka'),
      field('city', 'City', undefined, true),
      field('residence', 'Residence status', 'residencies'),
      field('mobile', 'Mobile number', undefined, true),
      field('mobile2', 'Alternate mobile'),
      field('pincode', 'Postal code'),
      field('calling', 'Preferred calling time', 'callingTimes'),
      field('work_phone', 'Work phone'),
      field('work_residence', 'Work residence status', 'residencies'),
      field('work_address', 'Work address'),
      field('work_pincode', 'Work postal code'),
      field('working_country', 'Work country', 'countries'),
      field('working_state', 'Work state'),
      field('working_dist', 'Work district'),
      field('working_taluka', 'Work taluka'),
      field('working_city', 'Work city'),
    ],
    readMap: {
      address: 'Address',
      country: 'Country',
      state: 'State',
      dist: 'District',
      taluka: 'Taluka',
      city: 'City',
      residence: 'ResidenceStatus',
      mobile: 'Mobile',
      mobile2: 'Mobile2',
      pincode: 'Pincode',
      calling: 'CallingTime',
      work_phone: 'Phone',
      work_residence: 'WorkResidence',
      work_address: 'WorkAddress',
      work_pincode: 'WorkPincode',
      working_country: 'WorkingCountry',
      working_state: 'WorkingState',
      working_dist: 'WorkingDistrict',
      working_taluka: 'WorkingTaluka',
      working_city: 'WorkingCity',
    },
  },
  education: {
    title: 'Education and career',
    submit: registrationService.submitEducationDetails as SectionConfig['submit'],
    read: registrationService.getEducationDetails,
    fields: [
      field('education', 'Education', 'educations', true),
      field('edetails', 'Education details', undefined, false, true),
      field('Annualincome', 'Annual income', 'incomes', true),
      field('Month_income', 'Monthly income', 'incomes'),
      field('occupation', 'Occupation', 'occupations', true),
      field('odetails', 'Occupation details', undefined, false, true),
      field('employedin', 'Employed in', 'employedIn'),
      field('workloc', 'Work location'),
      field('workinghrs', 'Working hours', 'workingHours'),
      field('iit', 'IIT university', 'iitUniversities'),
      field('instu', 'Institution name'),
    ],
    readMap: {
      education: 'Education',
      edetails: 'EducationDetails',
      Annualincome: 'Annualincome',
      Month_income: 'Month_income',
      occupation: 'Occupation',
      odetails: 'OccuDetails',
      employedin: 'Employedin',
      workloc: 'WorkingLocation',
      workinghrs: 'WorkingHours',
      iit: 'IIT',
      instu: 'Institute',
    },
  },
  family: {
    title: 'Family details',
    submit: registrationService.submitFamilyDetails as SectionConfig['submit'],
    read: registrationService.getFamilyDetails,
    fields: [
      field('fvalues', 'Family values', 'familyValues'),
      field('ftype', 'Family type', 'familyTypes'),
      field('fstatus', 'Family status', 'familyStatuses'),
      field('relative', 'Relatives', undefined, false, true),
      field('mother_tounge', 'Mother tongue', 'motherTongues'),
      field('brothers', 'Brothers', 'brothers'),
      field('sisters', 'Sisters', 'sisters'),
      field('bmarried', 'Married brothers'),
      field('smarried', 'Married sisters'),
      field('father', 'Father name'),
      field('fatherOccupation', 'Father occupation', 'occupations'),
      field('mother', 'Mother name'),
      field('motheroccupation', 'Mother occupation', 'occupations'),
      field('living_status', 'Family living status'),
      field('aboufamily', 'About family', undefined, true, true),
      field('unclename', 'Uncle name'),
      field('unclecity', 'Uncle city'),
      multiField('family_wealth', 'Family wealth', 'familyWealth'),
      multiField('property_types', 'Property types', 'familyWealth'),
      field('property_details', 'Property details', undefined, false, true),
      field('investment_types', 'Investment types (comma separated)'),
      field('investment_details', 'Investment details', undefined, false, true),
      field('monthly_rental_income', 'Monthly rental income'),
    ],
    readMap: {
      fvalues: 'FamilyValues',
      ftype: 'FamilyType',
      fstatus: 'FamilyStatus',
      relative: 'Relatives',
      mother_tounge: 'MotherTongue',
      brothers: 'Brothers',
      sisters: 'Sisters',
      bmarried: 'BrothersMarried',
      smarried: 'SistersMarried',
      father: 'Father',
      fatherOccupation: 'FatherOccupation',
      mother: 'Mother',
      motheroccupation: 'MotherOccupation',
      living_status: 'LivingStatus',
      aboufamily: 'AboutFamily',
      unclename: 'Uncle',
      unclecity: 'unclecity',
      family_wealth: 'FamilyWealth',
      property_types: 'Property',
      property_details: 'PropertyDetails',
      investment_types: 'InvestmentTypes',
      investment_details: 'InvestmentDetails',
      monthly_rental_income: 'MonthlyRentalIncome',
    },
  },
  horoscope: {
    title: 'Horoscope',
    submit: registrationService.submitHoroscopeDetails as SectionConfig['submit'],
    read: registrationService.getHoroscopeDetails,
    fields: [
      field('gothra', 'Gothra', 'gothras'),
      field('star', 'Nakshatra', 'nakshatras'),
      field('moonsign', 'Moon sign', 'moonSigns'),
      field('charan', 'Charan'),
      field('gan', 'Gan'),
      field('nadi', 'Nadi'),
      field('hmatch', 'Horoscope match', 'horoscopeMatches'),
      field('shani', 'Shani', 'shani'),
      field('manglik', 'Manglik', 'manglik'),
      field('bcountry', 'Birth country', 'countries'),
      field('bplace', 'Birth place'),
      field('devak', 'Devak'),
      field('kuldivat', 'Family deity'),
      field('navrasnm', 'Birth name'),
      field('bhour', 'Birth hour'),
      field('bminute', 'Birth minute'),
      field('bsecond', 'Birth second'),
      field('bampm', 'AM/PM', 'birthAmPm'),
    ],
    readMap: {
      gothra: 'Gothra',
      star: 'Star',
      moonsign: 'Moonsign',
      charan: 'Charan',
      gan: 'Gan',
      nadi: 'Nadi',
      hmatch: 'Horosmatch',
      shani: 'Shani',
      manglik: 'Manglik',
      bcountry: 'BirthCountry',
      bplace: 'BirthPlace',
      devak: 'Devak',
      kuldivat: 'Kuldivat',
      navrasnm: 'Navrasnm',
    },
  },
  partner: {
    title: 'Partner preference',
    submit: registrationService.submitPartnerPreference as SectionConfig['submit'],
    read: registrationService.getPartnerPreference,
    fields: [
      multiField('looking', 'Marital status preference', 'maritalStatuses', true),
      field('fromage', 'Minimum age', 'fromAges', true),
      field('toage', 'Maximum age', 'toAges', true),
      field('expectation', 'Expectations', undefined, false, true),
      field('heightfrom', 'Minimum height'),
      field('heightto', 'Maximum height'),
      multiField('religion1', 'Religions', 'religions'),
      multiField('caste1', 'Castes'),
      multiField('complexion1', 'Complexions', 'complexions'),
      multiField('rstatus1', 'Residency status', 'residencies'),
      field('country1', 'Country preference', 'countries'),
      multiField('state1', 'States'),
      multiField('district1', 'Districts'),
      multiField('taluka1', 'Talukas'),
      multiField('city1', 'Cities'),
      multiField('education1', 'Education', 'educations'),
      multiField('occupation1', 'Occupation', 'occupations'),
      field('income_from', 'Minimum income', 'incomes'),
      field('income_to', 'Maximum income', 'incomes'),
    ],
    readMap: {
      looking: 'Looking',
      fromage: 'FromAge',
      toage: 'ToAge',
      expectation: 'Expectation',
      heightfrom: 'HeightFrom',
      heightto: 'HeightTo',
      caste1: 'Caste',
      religion1: 'Religion',
      complexion1: 'Complexion',
      rstatus1: 'Rstatus1',
      country1: 'Country',
      state1: 'State',
      district1: 'District',
      taluka1: 'Taluka',
      city1: 'City',
      education1: 'Education',
      occupation1: 'Occupation',
      income_from: 'IncomeFrom',
      income_to: 'IncomeTo',
    },
  },
}

function valueMap(record: Record<string, unknown> | undefined): Values {
  if (!record) return {}
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.join(', ') : String(value ?? ''),
    ]),
  )
}

const GAN_LABELS: Record<(typeof GAN_OPTIONS)[number], string> = {
  Dev: 'Dev Gan',
  Manushya: 'Manushya Gan',
  Rakshas: 'Rakshas Gan',
}

const NADI_LABELS: Record<(typeof NADI_OPTIONS)[number], string> = {
  Adi: 'Adi',
  Madhya: 'Madhya',
  Antya: 'Antya',
}

const GAN_API_VALUES: Record<string, (typeof GAN_OPTIONS)[number]> = {
  dev: 'Dev',
  'dev gan': 'Dev',
  manushya: 'Manushya',
  'manushya gan': 'Manushya',
  rakshas: 'Rakshas',
  'rakshas gan': 'Rakshas',
}

const NADI_API_VALUES: Record<string, (typeof NADI_OPTIONS)[number]> = {
  adi: 'Adi',
  adhya: 'Adi',
  madhya: 'Madhya',
  antya: 'Antya',
}

function normalizeHoroscopeValues(values: Values): Values {
  const next = { ...values }
  const ganKey = (next.gan ?? '').trim().toLowerCase()
  const gan = GAN_API_VALUES[ganKey] ?? GAN_API_VALUES[ganKey.replace(/\s*gan$/, '')]
  if (gan) next.gan = gan
  const nadi = NADI_API_VALUES[(next.nadi ?? '').trim().toLowerCase()]
  if (nadi) next.nadi = nadi
  if (next.bampm) next.bampm = next.bampm.trim().toUpperCase()
  return next
}

interface ReadValuesResult {
  values: Values
  known: Set<string>
}

function readValues(
  section: SectionName,
  record: Record<string, unknown>,
  readMap: Record<string, string>,
): ReadValuesResult {
  const mapped: Values = {}
  const known = new Set<string>()
  for (const [key, apiKey] of Object.entries(readMap)) {
    const raw = record[apiKey]
    if (raw === undefined || raw === null) continue
    known.add(key)
    mapped[key] = Array.isArray(raw) ? raw.join(', ') : String(raw)
  }

  if (section === 'horoscope') {
    const time = String(record.BirthTime ?? record.TOB ?? '')
    const match = /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])?/.exec(time)
    if (match) {
      const rawHour = Number(match[1])
      const explicitAmPm = (match[4] ?? '').toUpperCase()
      const hour = rawHour > 12 || rawHour === 0 ? rawHour % 12 || 12 : rawHour
      const ampm =
        explicitAmPm || (rawHour >= 12 ? 'PM' : 'AM')
      mapped.bhour = String(hour).padStart(2, '0')
      mapped.bminute = match[2]
      mapped.bsecond = match[3] ?? '00'
      mapped.bampm = ampm
      known.add('bhour')
      known.add('bminute')
      known.add('bsecond')
      known.add('bampm')
    }
  }

  if (section === 'partner') {
    if (mapped.heightfrom) mapped.heightfrom = heightCodeFromLabel(mapped.heightfrom)
    if (mapped.heightto) mapped.heightto = heightCodeFromLabel(mapped.heightto)

    const aliases: Record<string, string[]> = {
      district1: ['District', 'PE_District', 'district'],
      taluka1: ['Taluka', 'PE_Taluka', 'taluka'],
      city1: ['City', 'PE_City', 'city'],
    }
    for (const [key, apiKeys] of Object.entries(aliases)) {
      if (mapped[key]) continue
      for (const apiKey of apiKeys) {
        const raw = record[apiKey]
        if (raw === undefined || raw === null || raw === '') continue
        known.add(key)
        mapped[key] = Array.isArray(raw) ? raw.join(', ') : String(raw)
        break
      }
    }
  }

  return {
    values: section === 'horoscope' ? normalizeHoroscopeValues(mapped) : mapped,
    known,
  }
}

interface SectionStepPageProps {
  section: SectionName
  /** Reads current server values and returns to My Profile after saving. */
  profileEdit?: boolean
  onSaved?: () => void
}

export function SectionStepPage({
  section,
  profileEdit = false,
  onSaved,
}: SectionStepPageProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const { matriId, profileLocationType, draft, saveSection } = useRegistration()
  const sectionConfig = config[section]
  const draftRecord = draft.sections[section] as unknown as
    | Record<string, unknown>
    | undefined
  const [values, setValues] = useState<Values>(() => {
    const initial = valueMap(draftRecord)
    return section === 'horoscope' ? normalizeHoroscopeValues(initial) : initial
  })
  const [known, setKnown] = useState<Set<string>>(
    () =>
      new Set(
        Object.entries(valueMap(draftRecord))
          .filter(([, value]) => value.trim())
          .map(([key]) => key),
      ),
  )
  const dirty = useRef(new Set<string>())
  const sameWorkAddressTouched = useRef(false)
  const iitTouched = useRef(false)
  const [sameWorkAddress, setSameWorkAddress] = useState(
    () => !hasDifferentWorkAddress(valueMap(draftRecord)),
  )
  const [isIitGraduate, setIsIitGraduate] = useState(() => {
    if (section !== 'education') return false
    const initial = valueMap(draftRecord)
    return Boolean((initial.iit ?? '').trim() || (initial.instu ?? '').trim())
  })
  const [horoscopeFile, setHoroscopeFile] = useState<File | null>(null)
  const [existingHoroscopeFile, setExistingHoroscopeFile] = useState('')
  const [options, setOptions] = useState<Record<string, MasterOption[]>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [readStatus, setReadStatus] = useState<'reading' | 'ready' | 'error'>(
    matriId && (profileEdit || !draft.sections[section]) ? 'reading' : 'ready',
  )
  const [readError, setReadError] = useState<string | null>(null)
  const [readNonce, setReadNonce] = useState(0)
  const horoscopeInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let active = true
    const names = [
      ...new Set(
        sectionConfig.fields
          .map((item) => item.master)
          .filter((item): item is MasterName => Boolean(item)),
      ),
    ]
    Promise.allSettled(
      names.map(async (name) => [name, await masterDataService[name]()] as const),
    ).then((results) => {
      if (!active) return
      const loaded = results
        .filter(
          (
            result,
          ): result is PromiseFulfilledResult<readonly [MasterName, MasterOption[]]> =>
            result.status === 'fulfilled',
        )
        .map((result) => result.value)
      if (loaded.length) {
        setOptions((current) => ({ ...current, ...Object.fromEntries(loaded) }))
      }
      const failed = results.find((result) => result.status === 'rejected')
      if (failed?.status === 'rejected') {
        toast.error('Could not load some form options', {
          description: toApiError(failed.reason).message,
        })
      }
    })
    return () => {
      active = false
    }
  }, [section, sectionConfig, toast])

  useEffect(() => {
    if (section !== 'contact') return
    let active = true
    const requests: Promise<readonly [string, MasterOption[]]>[] = []
    if (values.country)
      requests.push(
        masterDataService.states(values.country).then((items) => ['state', items] as const),
      )
    if (values.state)
      requests.push(
        masterDataService
          .districts(values.state)
          .then((items) => ['dist', items] as const),
      )
    if (values.dist)
      requests.push(
        masterDataService
          .talukasForDistrict(values.dist)
          .then((items) => ['taluka', items] as const),
      )
    if (values.taluka)
      requests.push(
        masterDataService
          .citiesForTaluka(values.taluka)
          .then((items) => ['city', items] as const),
      )
    if (values.working_country)
      requests.push(
        masterDataService
          .states(values.working_country)
          .then((items) => ['working_state', items] as const),
      )
    if (values.working_state)
      requests.push(
        masterDataService
          .districts(values.working_state)
          .then((items) => ['working_dist', items] as const),
      )
    if (values.working_dist)
      requests.push(
        masterDataService
          .talukasForDistrict(values.working_dist)
          .then((items) => ['working_taluka', items] as const),
      )
    if (values.working_taluka)
      requests.push(
        masterDataService
          .citiesForTaluka(values.working_taluka)
          .then((items) => ['working_city', items] as const),
      )
    Promise.all(requests)
      .then((items) => {
        if (active)
          setOptions((current) => ({ ...current, ...Object.fromEntries(items) }))
      })
      .catch((error: unknown) => {
        if (active)
          toast.error('Could not load location options', {
            description: toApiError(error).message,
          })
      })
    return () => {
      active = false
    }
  }, [
    section,
    values.country,
    values.state,
    values.dist,
    values.taluka,
    values.working_country,
    values.working_state,
    values.working_dist,
    values.working_taluka,
    toast,
  ])

  useEffect(() => {
    if (section !== 'partner') return
    let active = true
    const religions = splitList(values.religion1 ?? '')

    Promise.allSettled(religions.map((religion) => masterDataService.castes(religion)))
      .then((results) => {
        if (!active) return
        const castes = religions.length ? mergeOptions(results) : []
        setOptions((current) => ({ ...current, caste1: castes }))
        const allowed = new Set(castes.map((option) => option.value))
        setValues((current) => {
          const selected = splitList(current.caste1 ?? '')
          const kept = selected.filter((item) => allowed.has(item))
          if (kept.length === selected.length) return current
          dirty.current.add('caste1')
          return { ...current, caste1: kept.join(',') }
        })
      })
      .catch(() => {
        if (active) toast.error('Could not load caste options')
      })
    return () => {
      active = false
    }
  }, [section, values.religion1, toast])

  useEffect(() => {
    if (section !== 'partner') return
    let active = true
    const countries = splitList(values.country1 ?? '')
    const states = splitList(values.state1 ?? '')
    const districts = splitList(values.district1 ?? '')
    const talukas = splitList(values.taluka1 ?? '')

    const loadAll = (
      items: string[],
      loader: (value: string) => Promise<MasterOption[]>,
    ) => Promise.allSettled(items.map((item) => loader(item))).then(mergeOptions)

    Promise.all([
      countries.length ? loadAll(countries, masterDataService.states) : [],
      states.length ? loadAll(states, masterDataService.districts) : [],
      districts.length
        ? loadAll(districts, masterDataService.talukasForDistrict)
        : [],
      talukas.length ? loadAll(talukas, masterDataService.citiesForTaluka) : [],
    ])
      .then(([stateOptions, districtOptions, talukaOptions, cityOptions]) => {
        if (!active) return
        setOptions((current) => ({
          ...current,
          state1: stateOptions,
          district1: districtOptions,
          taluka1: talukaOptions,
          city1: cityOptions,
        }))
      })
      .catch((error: unknown) => {
        if (active)
          toast.error('Could not load partner location options', {
            description: toApiError(error).message,
          })
      })
    return () => {
      active = false
    }
  }, [
    section,
    values.country1,
    values.state1,
    values.district1,
    values.taluka1,
    toast,
  ])

  useEffect(() => {
    if (!matriId || (!profileEdit && draft.sections[section])) return
    let active = true
    sectionConfig
      .read(matriId)
      .then((record) => {
        if (!active) return
        if (!Object.keys(record).length) {
          setReadStatus('ready')
          return
        }
        const result = readValues(section, record, sectionConfig.readMap)
        if (section === 'horoscope') {
          const file = record.HoroscopeFile
          if (typeof file === 'string' && file.trim()) {
            setExistingHoroscopeFile(file.trim())
          }
        }
        setKnown((current) => new Set([...current, ...result.known]))
        setValues((current) => {
          const next = { ...current }
          for (const [key, value] of Object.entries(result.values)) {
            if (
              !dirty.current.has(key) &&
              (profileEdit || !next[key]?.trim())
            ) {
              next[key] = value
            }
          }
          return next
        })
        if (section === 'contact' && !sameWorkAddressTouched.current) {
          setSameWorkAddress(!hasDifferentWorkAddress(result.values))
        }
        if (
          section === 'education' &&
          !iitTouched.current &&
          ((result.values.iit ?? '').trim() || (result.values.instu ?? '').trim())
        ) {
          setIsIitGraduate(true)
        }
        setReadStatus('ready')
      })
      .catch((error: unknown) => {
        if (!active) return
        setReadStatus('error')
        setReadError(toApiError(error).message)
      })
    return () => {
      active = false
    }
  }, [draft.sections, matriId, profileEdit, readNonce, section, sectionConfig])

  const requiredKeys = useMemo(
    () => sectionConfig.fields.filter((item) => item.required).map((item) => item.key),
    [sectionConfig],
  )
  function update(key: string, value: string) {
    const cleared: Record<string, string> = {
      country: 'state,dist,taluka,city',
      state: 'dist,taluka,city',
      dist: 'taluka,city',
      taluka: 'city',
      working_country: 'working_state,working_dist,working_taluka,working_city',
      working_state: 'working_dist,working_taluka,working_city',
      working_dist: 'working_taluka,working_city',
      working_taluka: 'working_city',
      ...(section === 'partner'
        ? {
            country1: 'state1,district1,taluka1,city1',
            state1: 'district1,taluka1,city1',
            district1: 'taluka1,city1',
            taluka1: 'city1',
          }
        : {}),
    }
    const clearedKeys = (cleared[key] ?? '').split(',').filter(Boolean)
    if (section === 'contact' && sameWorkAddress) {
      const workChildren: Record<string, string> = {
        country: 'working_state,working_dist,working_taluka,working_city',
        state: 'working_dist,working_taluka,working_city',
        dist: 'working_taluka,working_city',
        taluka: 'working_city',
      }
      for (const child of (workChildren[key] ?? '').split(',').filter(Boolean)) {
        if (!clearedKeys.includes(child)) clearedKeys.push(child)
      }
    }
    dirty.current.add(key)
    for (const child of clearedKeys) dirty.current.add(child)
    if (section === 'education' && (key === 'iit' || key === 'instu') && value.trim()) {
      iitTouched.current = true
      setIsIitGraduate(true)
    }
    if (section === 'family' && (key === 'brothers' || key === 'sisters')) {
      dirty.current.add(key === 'brothers' ? 'bmarried' : 'smarried')
    }
    setValues((current) => {
      const next: Values = {
        ...current,
        [key]: value,
        ...Object.fromEntries(clearedKeys.map((child) => [child, ''])),
      }
      if (section === 'contact' && sameWorkAddress && SAME_ADDRESS_MAP[key]) {
        next[SAME_ADDRESS_MAP[key]] = value
      }
      if (section === 'family') {
        if (key === 'brothers' || key === 'sisters') {
          const total = countFrom(value)
          const child = key === 'brothers' ? 'bmarried' : 'smarried'
          const married = countFrom(next[child] ?? '')
          if (total === null) next[child] = ''
          else if (married !== null && married > total) next[child] = String(total)
        }
      }
      return next
    })
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function toggleSameWorkAddress(checked: boolean) {
    sameWorkAddressTouched.current = true
    setSameWorkAddress(checked)
    if (checked) {
      setValues((current) => ({ ...current, ...workAddressValues(current) }))
    }
  }

  function toggleIitGraduate(checked: boolean) {
    iitTouched.current = true
    setIsIitGraduate(checked)
  }

  // Profile editing must never save a half-loaded form over real details.
  const readBlocked = profileEdit && readStatus !== 'ready'

  function retryRead() {
    setReadStatus('reading')
    setReadError(null)
    setReadNonce((value) => value + 1)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!matriId) {
      toast.error('Missing profile ID')
      return
    }
    if (readBlocked) {
      toast.error('Your saved details are not loaded yet', {
        description: readError ?? 'Please retry loading them before saving.',
      })
      return
    }
    const nextErrors = Object.fromEntries(
      requiredKeys
        .filter((key) => !values[key]?.trim())
        .map((key) => [key, 'This field is required']),
    )
    if (section === 'partner' && Number(values.fromage) > Number(values.toage))
      nextErrors.toage = 'Maximum age must be greater than minimum age'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      toast.error('Please fix the highlighted fields')
      return
    }
    setSubmitting(true)
    const included = new Set([...known, ...dirty.current, ...requiredKeys])
    const payload: Record<string, unknown> = {
      MatriID: matriId,
      ...Object.fromEntries(
        sectionConfig.fields
          .filter(({ key }) => included.has(key))
          .map(({ key }) => [key, values[key]?.trim() ?? '']),
      ),
    }
    if (section === 'education' && !isIitGraduate) {
      // Send empty values instead of omitting the keys: a missing key leaves
      // previously saved IIT details untouched on the server.
      payload.iit = ''
      payload.instu = ''
    }
    if (section === 'contact' && sameWorkAddress) {
      Object.assign(payload, workAddressValues(values))
    }
    if (section === 'education' && !profileEdit) {
      const basic = draft.sections.basic
      const repeatedBasicFields: Record<string, string> = {
        height: values.height || basic?.Height || '',
        weight: values.weight || basic?.Weight || '',
        bgroup: values.bgroup || basic?.BloodGroup || '',
        complexion: values.complexion || basic?.Complexion || '',
        scases: values.scases || basic?.SpecialCases || '',
        otherdist: values.otherdist || basic?.SpecialReason || '',
        aboutus: values.aboutus || basic?.aboutus || '',
      }
      Object.assign(payload, repeatedBasicFields)
    }
    try {
      if (section === 'family') {
        for (const key of ['property_types', 'investment_types']) {
          if (!(key in payload)) continue
          const raw = String(payload[key] ?? '')
          payload[key] = raw
            ? raw
                .split(',')
                .map((part) => part.trim())
                .filter(Boolean)
            : []
        }
      }
      if (section === 'horoscope' && horoscopeFile) payload.fileToUpload = horoscopeFile
      const result = await sectionConfig.submit(payload as never)
      const savedPayload = { ...payload }
      delete savedPayload.fileToUpload
      saveSection(section as never, savedPayload as unknown as SectionPayload as never)
      if (section === 'horoscope') {
        setHoroscopeFile(null)
        setExistingHoroscopeFile('')
        if (horoscopeInputRef.current) horoscopeInputRef.current.value = ''
      }
      toast.success(`${sectionConfig.title} saved`, {
        description: result.message || undefined,
      })
      if (onSaved) {
        onSaved()
      } else {
        const next = nextRegistrationStep(
          section as RegistrationStepId,
          profileLocationType,
        )
        void navigate(registrationStepPath(next ?? 'review'), { replace: true })
      }
    } catch (error) {
      toast.error(`Could not save ${sectionConfig.title.toLowerCase()}`, {
        description: toApiError(error).message,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const countryOptions = (options.countries ?? []).map((option) => {
    const name = option.label.replace(/\s*\([^)]*\)\s*$/, '')
    return { value: name, label: name }
  })

  function renderField(item: Field) {
    const locationKey = [
      'state',
      'dist',
      'taluka',
      'city',
      'working_state',
      'working_dist',
      'working_taluka',
      'working_city',
    ].includes(item.key)
    const partnerDynamicKey = PARTNER_DYNAMIC_KEYS.has(item.key)
    const fieldOptions =
      locationKey || partnerDynamicKey
        ? options[item.key]
        : item.master
          ? options[item.master]
          : undefined
    const locationParents: Record<string, string> = {
      state: 'country',
      dist: 'state',
      taluka: 'dist',
      city: 'taluka',
      working_state: 'working_country',
      working_dist: 'working_state',
      working_taluka: 'working_dist',
      working_city: 'working_taluka',
    }
    const partnerParent = PARTNER_LOCATION_PARENTS[item.key]
    const partnerDisabled = Boolean(partnerParent) && !values[partnerParent]?.trim()
    const casteDisabled = item.key === 'caste1' && !values.religion1?.trim()

    if (['gan', 'nadi'].includes(item.key)) {
      const valuesByKey: Record<string, { value: string; label: string }[]> = {
        gan: GAN_OPTIONS.map((value) => ({
          value,
          label: GAN_LABELS[value],
        })),
        nadi: NADI_OPTIONS.map((value) => ({
          value,
          label: NADI_LABELS[value],
        })),
      }
      return (
        <SelectField
          key={item.key}
          label={item.label}
          value={values[item.key] ?? ''}
          onChange={(event) => update(item.key, event.target.value)}
          options={valuesByKey[item.key]}
          placeholder={`Select ${item.label.toLowerCase()}`}
          error={errors[item.key]}
        />
      )
    }

    if (item.key === 'bmarried' || item.key === 'smarried') {
      const total = countFrom(
        values[item.key === 'bmarried' ? 'brothers' : 'sisters'] ?? '',
      )
      const current = values[item.key] ?? ''
      const optionsForCount =
        total === null
          ? []
          : Array.from({ length: total + 1 }, (_, index) => ({
              value: String(index),
              label: String(index),
            }))
      const selectOptions =
        current && !optionsForCount.some((option) => option.value === current)
          ? [{ value: current, label: current }, ...optionsForCount]
          : optionsForCount
      return (
        <SelectField
          key={item.key}
          label={item.label}
          value={current}
          onChange={(event) => update(item.key, event.target.value)}
          options={selectOptions}
          placeholder={`Select ${item.label.toLowerCase()}`}
          error={errors[item.key]}
          required={item.required}
          disabled={total === null}
        />
      )
    }

    if (item.multiple) {
      return (
        <MultiSelectField
          key={item.key}
          label={item.label}
          value={values[item.key] ?? ''}
          onChange={(value) => update(item.key, value)}
          options={fieldOptions ?? []}
          placeholder={`Select ${item.label.toLowerCase()}`}
          error={errors[item.key]}
          disabled={partnerDisabled || casteDisabled}
        />
      )
    }

    if (
      ['country', 'working_country', 'bcountry', 'country1'].includes(item.key)
    ) {
      const currentCountry = values[item.key] ?? ''
      const optionsWithCurrent =
        currentCountry &&
        !countryOptions.some((option) => option.value === currentCountry)
          ? [{ value: currentCountry, label: currentCountry }, ...countryOptions]
          : countryOptions
      return (
        <SelectField
          key={item.key}
          label={item.label}
          value={currentCountry}
          onChange={(event) => update(item.key, event.target.value)}
          options={optionsWithCurrent}
          placeholder={`Select ${item.label.toLowerCase()}`}
          error={errors[item.key]}
          required={item.required}
        />
      )
    }

    if (item.key === 'heightfrom' || item.key === 'heightto') {
      return (
        <SelectField
          key={item.key}
          label={item.label}
          value={values[item.key] ?? ''}
          onChange={(event) => update(item.key, event.target.value)}
          options={HEIGHT_CODES.map((code) => ({
            value: code,
            label: heightLabel(code),
          }))}
          placeholder={`Select ${item.label.toLowerCase()}`}
          error={errors[item.key]}
        />
      )
    }

    const parentSelected =
      !locationKey || Boolean(values[locationParents[item.key]])
    if (
      locationKey &&
      parentSelected &&
      fieldOptions &&
      fieldOptions.length === 0
    ) {
      return (
        <TextField
          key={item.key}
          label={item.label}
          value={values[item.key] ?? ''}
          onChange={(event) => update(item.key, event.target.value)}
          placeholder={`Enter ${item.label.toLowerCase()}`}
          error={errors[item.key]}
          required={item.required}
        />
      )
    }

    if (item.master || locationKey || partnerDynamicKey) {
      const currentValue = values[item.key] ?? ''
      const sourceOptions = fieldOptions ?? []
      const optionsWithCurrent =
        currentValue &&
        !sourceOptions.some((option) => option.value === currentValue)
          ? [{ value: currentValue, label: currentValue }, ...sourceOptions]
          : sourceOptions
      return (
        <SelectField
          key={item.key}
          label={item.label}
          value={currentValue}
          onChange={(event) => update(item.key, event.target.value)}
          options={optionsWithCurrent}
          placeholder={`Select ${item.label.toLowerCase()}`}
          error={errors[item.key]}
          required={item.required}
          disabled={locationKey && !values[locationParents[item.key]]}
        />
      )
    }

    return item.multiline ? (
      <TextareaField
        key={item.key}
        label={item.label}
        value={values[item.key] ?? ''}
        onChange={(event) => update(item.key, event.target.value)}
        error={errors[item.key]}
        required={item.required}
        className="sm:col-span-2"
      />
    ) : (
      <TextField
        key={item.key}
        label={item.label}
        value={values[item.key] ?? ''}
        onChange={(event) => update(item.key, event.target.value)}
        error={errors[item.key]}
        required={item.required}
      />
    )
  }

  return (
    <form className="flex flex-1 flex-col pb-2" onSubmit={handleSubmit} noValidate>
      <Card className="registration-section-card grid gap-4 sm:grid-cols-2">
        <h2 className="text-base font-semibold text-maroon sm:col-span-2">
          {sectionConfig.title}
        </h2>
        {profileEdit && readStatus === 'reading' ? (
          <p className="flex items-center gap-2 text-xs text-muted sm:col-span-2">
            <Spinner /> Loading your saved details…
          </p>
        ) : null}
        {readStatus === 'error' ? (
          <div
            role="alert"
            className="rounded-card border border-danger/25 bg-danger-soft/60 p-4 sm:col-span-2"
          >
            <p className="text-sm font-semibold text-ink">
              Could not load your saved details
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {profileEdit
                ? 'Saving is disabled until your current details load, so nothing is overwritten. Your edits stay on screen.'
                : 'You can still fill this step, but fields you do not change may not match what is already saved.'}
            </p>
            {readError ? <p className="mt-1 text-xs text-danger">{readError}</p> : null}
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={retryRead}
            >
              Try again
            </Button>
          </div>
        ) : null}
        {sectionConfig.fields.map((item) => {
          if (section === 'horoscope' && BIRTH_TIME_KEYS.has(item.key)) return null
          if (
            section === 'education' &&
            !isIitGraduate &&
            (item.key === 'iit' || item.key === 'instu')
          )
            return null
          if (
            section === 'contact' &&
            sameWorkAddress &&
            CONTACT_WORK_KEYS.has(item.key)
          )
            return null

          const rendered = renderField(item)
          if (section === 'contact' && item.key === 'pincode') {
            return (
              <Fragment key={item.key}>
                {rendered}
                <label className="flex items-start gap-3 text-sm text-ink sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={sameWorkAddress}
                    onChange={(event) => toggleSameWorkAddress(event.target.checked)}
                    className="mt-0.5 size-4 shrink-0 accent-maroon focus-visible:outline-maroon"
                  />
                  <span>Work address same as home address</span>
                </label>
              </Fragment>
            )
          }
          if (section === 'education' && item.key === 'workinghrs') {
            return (
              <Fragment key={item.key}>
                {rendered}
                <label className="flex items-start gap-3 text-sm text-ink sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={isIitGraduate}
                    onChange={(event) => toggleIitGraduate(event.target.checked)}
                    className="mt-0.5 size-4 shrink-0 accent-maroon focus-visible:outline-maroon"
                  />
                  <span>IIT graduate</span>
                </label>
              </Fragment>
            )
          }
          return rendered
        })}
        {section === 'horoscope' && (
          <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2">
            <span className="text-xs font-semibold text-maroon">Birth time</span>
            <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
              <SelectField
                label="Hour"
                value={values.bhour ?? ''}
                onChange={(event) => update('bhour', event.target.value)}
                options={BIRTH_HOURS.map((value) => ({ value, label: value }))}
                placeholder="Hour"
                error={errors.bhour}
              />
              <SelectField
                label="Minute"
                value={values.bminute ?? ''}
                onChange={(event) => update('bminute', event.target.value)}
                options={BIRTH_MINUTES.map((value) => ({ value, label: value }))}
                placeholder="Minute"
                error={errors.bminute}
              />
              <SelectField
                label="Second"
                value={values.bsecond ?? ''}
                onChange={(event) => update('bsecond', event.target.value)}
                options={BIRTH_SECONDS.map((value) => ({ value, label: value }))}
                placeholder="Second"
                error={errors.bsecond}
              />
              <SelectField
                label="AM/PM"
                value={values.bampm ?? ''}
                onChange={(event) => update('bampm', event.target.value)}
                options={BIRTH_AMPM_OPTIONS.map((value) => ({
                  value,
                  label: value,
                }))}
                placeholder="AM/PM"
                error={errors.bampm}
              />
            </div>
          </div>
        )}
        {section === 'horoscope' && (
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-maroon sm:col-span-2">
            Horoscope file (optional)
            {existingHoroscopeFile && (
              <span className="font-normal text-muted">
                Current file: {existingHoroscopeFile}
              </span>
            )}
            <input
              ref={horoscopeInputRef}
              type="file"
              name="fileToUpload"
              onChange={(event) => setHoroscopeFile(event.target.files?.[0] ?? null)}
              className="rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm font-normal text-ink"
            />
            {horoscopeFile && (
              <span className="font-normal text-muted">
                Selected: {horoscopeFile.name}
              </span>
            )}
          </label>
        )}
      </Card>
      <div className="registration-submit-bar mt-4">
        <Button type="submit" fullWidth size="lg" disabled={submitting || readBlocked}>
          {submitting ? (
            <>
              <Spinner /> Saving details
            </>
          ) : (
            'Save and continue'
          )}
        </Button>
      </div>
    </form>
  )
}

const REVIEW_READS: [string, (id: string) => Promise<Record<string, unknown>>][] = [
  ['basic', registrationService.getBasicDetails],
  ['contact', registrationService.getContactDetails],
  ['education', registrationService.getEducationDetails],
  ['family', registrationService.getFamilyDetails],
  ['horoscope', registrationService.getHoroscopeDetails],
  ['partner', registrationService.getPartnerPreference],
]

export function RegistrationReviewPage() {
  const { matriId, draft, profileLocationType } = useRegistration()
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<Record<string, Record<string, unknown>>>({})
  useEffect(() => {
    if (!matriId) return
    let active = true
    Promise.allSettled(
      REVIEW_READS.map(async ([key, read]) => [key, await read(matriId)] as const),
    )
      .then((results) => {
        if (!active) return
        const fulfilled = results.filter(
          (
            result,
          ): result is PromiseFulfilledResult<
            readonly [string, Record<string, unknown>]
          > => result.status === 'fulfilled',
        )
        setRecords(Object.fromEntries(fulfilled.map((result) => result.value)))
        const rejected = results.find((result) => result.status === 'rejected')
        if (rejected?.status === 'rejected')
          toast.error('Some saved details could not be loaded', {
            description: toApiError(rejected.reason).message,
          })
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [matriId, toast])
  const sections = [
    'account',
    ...(profileLocationType === 'NRI' ? ['nri'] : []),
    'basic',
    'contact',
    'education',
    'family',
    'horoscope',
    'partner',
  ]
  const editSteps: Record<string, RegistrationStepId> = {
    account: 'basic',
    nri: 'nri',
    basic: 'basic',
    contact: 'contact',
    education: 'education',
    family: 'family',
    horoscope: 'horoscope',
    partner: 'partner',
  }
  const summaryValue = (
    section: string,
    record: Record<string, unknown> | undefined,
  ) => {
    const draftRecord = (
      draft.sections as Record<string, Record<string, unknown> | undefined>
    )[section]
    const accountFallback =
      section === 'account' && user
        ? {
            Name: user.name,
            Email: user.email,
            Mobile: user.phone,
          }
        : undefined
    const data = { ...accountFallback, ...record, ...draftRecord }
    return Object.entries(data)
      .filter(
        ([key, value]) =>
          !['MatriID', 'pass', 'fileToUpload'].includes(key) &&
          value !== '' &&
          value !== undefined &&
          value !== null &&
          !(Array.isArray(value) && value.length === 0),
      )
      .map(
        ([key, value]) =>
          `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`,
      )
  }
  return (
    <div className="space-y-4 pb-6">
      {loading && (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Spinner /> Loading saved details
        </p>
      )}
      {sections.map((section) => (
        <Card key={section} className="registration-section-card space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-maroon capitalize">
              {section === 'nri' ? 'NRI details' : section}
            </h2>
            <Link
              className="text-sm font-medium text-maroon underline"
              to={registrationStepPath(editSteps[section])}
            >
              Edit
            </Link>
          </div>
          <ul className="space-y-1 text-sm text-muted">
            {summaryValue(section, records[section]).map((line) => (
              <li key={line}>{line}</li>
            ))}
            {summaryValue(section, records[section]).length === 0 && (
              <li>No saved details returned.</li>
            )}
          </ul>
        </Card>
      ))}
      <p className="text-sm text-muted">
        Your details are saved step by step. You can head to your dashboard when
        you are ready.
      </p>
      <Button
        type="button"
        fullWidth
        size="lg"
        onClick={() => void navigate(routes.home)}
      >
        Go to dashboard
      </Button>
    </div>
  )
}
