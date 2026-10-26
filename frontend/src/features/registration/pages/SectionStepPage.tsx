import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Spinner } from '@/components/loading/Spinner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SelectField } from '@/components/ui/SelectField'
import { TextField } from '@/components/ui/TextField'
import { TextareaField } from '@/components/ui/TextareaField'
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
import type { RegistrationStepId } from '@/features/registration/constants'
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
  | 'complexions'
interface Field {
  key: string
  label: string
  master?: MasterName
  required?: boolean
  multiline?: boolean
  optional?: boolean
}
interface SectionConfig {
  title: string
  fields: Field[]
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
      field('working_city', 'Work city'),
    ],
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
      field('family_wealth', 'Family wealth', 'familyWealth'),
      field('property_types', 'Property types (comma separated)'),
      field('property_details', 'Property details', undefined, false, true),
      field('investment_types', 'Investment types (comma separated)'),
      field('investment_details', 'Investment details', undefined, false, true),
      field('monthly_rental_income', 'Monthly rental income'),
    ],
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
  },
  partner: {
    title: 'Partner preference',
    submit: registrationService.submitPartnerPreference as SectionConfig['submit'],
    read: registrationService.getPartnerPreference,
    fields: [
      field('looking', 'Marital status preference (comma separated)', undefined, true),
      field('fromage', 'Minimum age', undefined, true),
      field('toage', 'Maximum age', undefined, true),
      field('expectation', 'Expectations', undefined, false, true),
      field('heightfrom', 'Minimum height code'),
      field('heightto', 'Maximum height code'),
      field('religion1', 'Religions (comma separated)'),
      field('caste1', 'Castes (comma separated)'),
      field('complexion1', 'Complexions (comma separated)'),
      field('rstatus1', 'Residency status (comma separated)'),
      field('country1', 'Countries (comma separated)'),
      field('state1', 'States (comma separated)'),
      field('education1', 'Education (comma separated)'),
      field('occupation1', 'Occupation (comma separated)'),
      field('income_from', 'Minimum income'),
      field('income_to', 'Maximum income'),
    ],
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

export function SectionStepPage({ section }: { section: SectionName }) {
  const navigate = useNavigate()
  const toast = useToast()
  const { matriId, profileLocationType, draft, saveSection } = useRegistration()
  const sectionConfig = config[section]
  const [values, setValues] = useState<Values>(() =>
    valueMap(draft.sections[section] as unknown as Record<string, unknown> | undefined),
  )
  const [horoscopeFile, setHoroscopeFile] = useState<File | null>(null)
  const [options, setOptions] = useState<Record<string, MasterOption[]>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    const names = [
      ...new Set(
        sectionConfig.fields
          .map((item) => item.master)
          .filter((item): item is MasterName => Boolean(item)),
      ),
    ]
    Promise.all(
      names.map(async (name) => [name, await masterDataService[name]()] as const),
    )
      .then((items) => {
        if (active) setOptions(Object.fromEntries(items))
      })
      .catch((error: unknown) => {
        if (active)
          toast.error('Could not load form options', {
            description: toApiError(error).message,
          })
      })
    return () => {
      active = false
    }
  }, [section, sectionConfig, toast])

  useEffect(() => {
    if (section !== 'contact') return
    let active = true
    const requests: Promise<readonly [string, MasterOption[]]>[] = []
    const homeCountryId = options.countries?.find(
      (item) => item.label.replace(/\s*\([^)]*\)\s*$/, '') === values.country,
    )?.value
    const workCountryId = options.countries?.find(
      (item) => item.label.replace(/\s*\([^)]*\)\s*$/, '') === values.working_country,
    )?.value
    if (homeCountryId)
      requests.push(
        masterDataService
          .states(homeCountryId)
          .then((items) => ['state', items] as const),
      )
    if (values.state)
      requests.push(
        masterDataService
          .districts(values.state)
          .then((items) => ['dist', items] as const),
      )
    if (values.dist)
      requests.push(
        masterDataService.cities(values.dist).then((items) => ['city', items] as const),
      )
    if (workCountryId)
      requests.push(
        masterDataService
          .states(workCountryId)
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
          .cities(values.working_dist)
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
    options.countries,
    values.country,
    values.state,
    values.dist,
    values.working_country,
    values.working_state,
    values.working_dist,
    toast,
  ])

  useEffect(() => {
    if (!matriId || draft.sections[section]) return
    let active = true
    sectionConfig
      .read(matriId)
      .then((record) => {
        if (active && Object.keys(record).length) setValues(valueMap(record))
      })
      .catch(() => {
        // A read endpoint may return an empty record for a profile that has not saved this section yet.
      })
    return () => {
      active = false
    }
  }, [draft.sections, matriId, section, sectionConfig])

  const requiredKeys = useMemo(
    () => sectionConfig.fields.filter((item) => item.required).map((item) => item.key),
    [sectionConfig],
  )
  function update(key: string, value: string) {
    const cleared: Record<string, string> = {
      country: 'state,dist,city',
      state: 'dist,city',
      dist: 'city',
      working_country: 'working_state,working_dist,working_city',
      working_state: 'working_dist,working_city',
      working_dist: 'working_city',
    }
    setValues((current) => ({
      ...current,
      [key]: value,
      ...Object.fromEntries(
        (cleared[key] ?? '')
          .split(',')
          .filter(Boolean)
          .map((child) => [child, '']),
      ),
    }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!matriId) {
      toast.error('Missing profile ID')
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
    const payload: Record<string, unknown> = {
      MatriID: matriId,
      ...Object.fromEntries(
        sectionConfig.fields.map(({ key }) => [key, values[key]?.trim() ?? '']),
      ),
    }
    if (section === 'education') {
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
      toast.success(`${sectionConfig.title} saved`, {
        description: result.message || undefined,
      })
      const next = nextRegistrationStep(
        section as RegistrationStepId,
        profileLocationType,
      )
      void navigate(registrationStepPath(next ?? 'review'), { replace: true })
    } catch (error) {
      toast.error(`Could not save ${sectionConfig.title.toLowerCase()}`, {
        description: toApiError(error).message,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="flex flex-1 flex-col pb-6" onSubmit={handleSubmit} noValidate>
      <Card className="grid gap-4 sm:grid-cols-2">
        <h2 className="text-base font-semibold text-maroon sm:col-span-2">
          {sectionConfig.title}
        </h2>
        {sectionConfig.fields.map((item) => {
          const locationKey = [
            'state',
            'dist',
            'city',
            'working_state',
            'working_dist',
            'working_city',
          ].includes(item.key)
          const fieldOptions = locationKey
            ? options[item.key]
            : item.master
              ? options[item.master]
              : undefined
          const locationParents: Record<string, string> = {
            state: 'country',
            dist: 'state',
            city: 'dist',
            working_state: 'working_country',
            working_dist: 'working_state',
            working_city: 'working_dist',
          }
          if (['gan', 'nadi', 'bampm'].includes(item.key)) {
            const valuesByKey: Record<string, string[]> = {
              gan: ['Dev Gan', 'Manushya Gan', 'Rakshas Gan'],
              nadi: ['Adhya', 'Madhya', 'Antya'],
              bampm: ['AM', 'PM'],
            }
            return (
              <SelectField
                key={item.key}
                label={item.label}
                value={values[item.key] ?? ''}
                onChange={(event) => update(item.key, event.target.value)}
                options={valuesByKey[item.key].map((value) => ({
                  value,
                  label: value,
                }))}
                placeholder={`Select ${item.label.toLowerCase()}`}
                error={errors[item.key]}
              />
            )
          }
          if (item.key === 'country' || item.key === 'working_country') {
            const countryOptions = (options.countries ?? []).map((option) => ({
              value: option.label.replace(/\s*\([^)]*\)\s*$/, ''),
              label: option.label.replace(/\s*\([^)]*\)\s*$/, ''),
            }))
            return (
              <SelectField
                key={item.key}
                label={item.label}
                value={values[item.key] ?? ''}
                onChange={(event) => update(item.key, event.target.value)}
                options={countryOptions}
                placeholder={`Select ${item.label.toLowerCase()}`}
                error={errors[item.key]}
                required={item.required}
              />
            )
          }
          if (item.master || locationKey)
            return (
              <SelectField
                key={item.key}
                label={item.label}
                value={values[item.key] ?? ''}
                onChange={(event) => update(item.key, event.target.value)}
                options={fieldOptions ?? []}
                placeholder={`Select ${item.label.toLowerCase()}`}
                error={errors[item.key]}
                required={item.required}
                disabled={locationKey && !values[locationParents[item.key]]}
              />
            )
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
        })}
        {section === 'horoscope' && (
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-maroon sm:col-span-2">
            Horoscope file (optional)
            <input
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
      <Button type="submit" fullWidth className="mt-5" disabled={submitting}>
        {submitting ? (
          <>
            <Spinner /> Saving details
          </>
        ) : (
          'Save and continue'
        )}
      </Button>
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
    account: 'account',
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
    const data = { ...draftRecord, ...record }
    return Object.entries(data)
      .filter(
        ([key, value]) =>
          !['MatriID', 'pass', 'fileToUpload'].includes(key) &&
          value !== '' &&
          value !== undefined &&
          value !== null,
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
        <Card key={section} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-maroon capitalize">
              {section === 'nri' ? 'NRI details' : section}
            </h2>
            {section !== 'account' && (
              <Link
                className="text-sm font-medium text-maroon underline"
                to={registrationStepPath(editSteps[section])}
              >
                Edit
              </Link>
            )}
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
        Each step saves its details separately. Reviewing these details does not submit
        or finalize your registration.
      </p>
    </div>
  )
}
