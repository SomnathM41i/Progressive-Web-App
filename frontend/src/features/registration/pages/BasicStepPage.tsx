import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { Spinner } from '@/components/loading/Spinner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SelectField } from '@/components/ui/SelectField'
import { TextField } from '@/components/ui/TextField'
import { TextareaField } from '@/components/ui/TextareaField'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  CHILDREN_STATUS_OPTIONS,
  HEIGHT_CODES,
  NO_OF_CHILDREN_OPTIONS,
  heightCodeFromLabel,
  heightLabel,
  WEIGHT_MAX,
  WEIGHT_MIN,
  isValidMobile,
} from '@/features/registration/constants'
import { useRegistration } from '@/features/registration/hooks/useRegistration'
import { masterDataService } from '@/features/registration/services/master-data.service'
import type { MasterOption } from '@/features/registration/services/master-data.service'
import { registrationService } from '@/features/registration/services/registration.service'
import { nextRegistrationStep, registrationStepPath } from '@/features/registration/steps'
import type { BasicDetails, Gender } from '@/features/registration/types'
import { useToast } from '@/hooks/useToast'
import { toApiError } from '@/services/api-error'

interface FormState {
  Name: string
  DOB: string
  Height: string
  Weight: string
  BloodGroup: string
  Complexion: string
  SpecialCases: string
  SpecialReason: string
  ConfirmEmail: string
  Gender: Gender | ''
  Profilecreatedby: string
  maritalstatus: string
  PE_HaveChildren: string
  childrenlivingstatus: string
  religion: string
  caste: string
  subcaste: string
  countrycode: string
  Mobile: string
  aboutus: string
}

const initialForm: FormState = {
  Name: '', DOB: '', Height: '', Weight: '', BloodGroup: '', Complexion: '',
  SpecialCases: '', SpecialReason: '', ConfirmEmail: '', Gender: '',
  Profilecreatedby: '', maritalstatus: '', PE_HaveChildren: 'none',
  childrenlivingstatus: '', religion: '', caste: '', subcaste: '',
  countrycode: '', Mobile: '', aboutus: '',
}

const HEIGHT_OPTIONS = HEIGHT_CODES.map((value) => ({ value, label: heightLabel(value) }))
const WEIGHT_OPTIONS = Array.from({ length: WEIGHT_MAX - WEIGHT_MIN + 1 }, (_, i) => String(i + WEIGHT_MIN)).map((value) => ({ value, label: `${value} kg` }))
const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
] as const
const CHILDREN_COUNT_OPTIONS = NO_OF_CHILDREN_OPTIONS.map((value) => ({
  value: value.toLowerCase(),
  label: value,
}))
const CHILDREN_STATUS_SELECT_OPTIONS = CHILDREN_STATUS_OPTIONS.map((value) => ({
  value,
  label: value,
}))

function accountDate(account: Record<string, unknown> | undefined): string {
  if (!account) return ''
  const day = Number(account.dob)
  const month = Number(account.dobMonth)
  const year = Number(account.dobYear)
  if (
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    !Number.isInteger(year) ||
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12 ||
    year < 1900
  ) {
    return ''
  }
  const candidate = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return isRealDate(candidate) ? candidate : ''
}

function apiDate(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ''
}

/**
 * Maps a saved country code to the country id the write endpoint expects.
 *
 * `get-basic-details` returns the phone code (`91`), while `update-basic-details`
 * stores the country id (`99` for India). The select is built from country ids,
 * so writing the read value back would corrupt the saved country.
 */
function countryIdFromCode(options: MasterOption[], value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''

  // The read endpoint returns a phone code, so match that first: a phone code
  // can collide with an unrelated country id (91 is India's code and Guyana's
  // id), and phone codes are what this field actually carries.
  const digits = trimmed.replace(/\D/g, '')
  if (!digits) return ''

  const matches = options.filter((option) => {
    const parenthetical = option.label.match(/\(([^)]*)\)\s*$/)
    return parenthetical
      ? parenthetical[1].replace(/\D/g, '') === digits
      : false
  })

  // Country id 91 is Guyana while India's phone code is 91, so an ambiguous
  // match must not be guessed — the caller shows a warning instead.
  return matches.length === 1 ? matches[0].value : ''
}

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

function isAdult(value: string): boolean {
  if (!isRealDate(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const today = new Date()
  let age = today.getFullYear() - year
  const monthDiff = today.getMonth() + 1 - month
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age -= 1
  }
  return age >= 18
}

function latestAdultDate(): string {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 18)
  return date.toISOString().slice(0, 10)
}

function withCurrent(options: MasterOption[], value: string): MasterOption[] {
  if (!value || options.some((option) => option.value === value)) return options
  return [{ value, label: value }, ...options]
}

function hasSpecialCase(value: string): boolean {
  const normalised = value.trim().toLowerCase()
  return Boolean(normalised) && normalised !== 'none' && normalised !== 'no'
}

interface BasicStepPageProps {
  /** Uses the form from My Profile and returns to its editor after saving. */
  profileEdit?: boolean
  onSaved?: () => void
}

export function BasicStepPage({ profileEdit = false, onSaved }: BasicStepPageProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const { matriId, profileLocationType, draft, saveSection } = useRegistration()
  const account = draft.sections.account as Record<string, unknown> | undefined
  const accountName = [account?.fname, account?.middle_name, account?.lname]
    .filter(Boolean)
    .join(' ')
  const [form, setForm] = useState<FormState>(() => ({
    ...initialForm,
    Name: accountName || user?.name || '',
    DOB: accountDate(account), ConfirmEmail: String(account?.email ?? ''),
    Gender: (account?.gender as Gender | undefined) ?? '',
    Profilecreatedby: String(account?.Profilecreatedby ?? ''),
    maritalstatus: String(account?.maritalstatus ?? ''),
    PE_HaveChildren: String(account?.noofchildren ?? 'none').toLowerCase(),
    childrenlivingstatus: String(account?.childrenstatus ?? ''),
    religion: String(account?.religion ?? ''), caste: String(account?.caste ?? ''),
    subcaste: String(account?.subcaste ?? ''), countrycode: String(account?.countrycode ?? ''),
    Mobile: String(account?.mobile ?? ''), aboutus: String(account?.aboutus ?? ''),
  }))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [options, setOptions] = useState<Record<string, MasterOption[]>>({})
  const [castes, setCastes] = useState<MasterOption[]>([])
  const [subcastes, setSubcastes] = useState<MasterOption[]>([])
  const dirty = useRef(new Set<keyof FormState>())
  const loadedAboutUs = useRef(String(account?.aboutus ?? ''))
  const [readStatus, setReadStatus] = useState<'reading' | 'ready' | 'error'>('reading')
  const [readError, setReadError] = useState<string | null>(null)
  const [readWarning, setReadWarning] = useState('')
  const [readNonce, setReadNonce] = useState(0)

  useEffect(() => {
    if (!matriId) return

    let active = true

    registrationService
      .getBasicDetails(matriId)
      .then(async (record) => {
        // Country labels carry the phone code, while the basic record returns
        // the phone code and the form works with country ids.
        const countries = await masterDataService.countries().catch(() => [])
        if (!active) return

        const read = (key: string) => {
          const entry = Object.entries(record).find(
            ([name]) => name.toLowerCase() === key.toLowerCase(),
          )
          return entry?.[1] === null || entry?.[1] === undefined
            ? ''
            : String(entry[1])
        }
        const readAboutUs = read('aboutus')
        if (readAboutUs) loadedAboutUs.current = readAboutUs

        const countryCode = read('CountryCode')
        const countryId = countryIdFromCode(countries, countryCode)
        if (countryCode && !countryId) {
          setReadWarning(
            'Your saved country code could not be matched. Please confirm it before saving.',
          )
        }

        setForm((current) => {
          const next = { ...current }
          const assign = <K extends keyof FormState>(
            key: K,
            value: FormState[K] | '',
          ) => {
            if (!dirty.current.has(key) && value) next[key] = value as FormState[K]
          }

          // A saved name is authoritative; the account/login name is only a
          // fallback for fields the server has not filled in.
          assign('Name', read('Name'))
          assign('DOB', apiDate(read('DOB')))
          assign('Height', heightCodeFromLabel(read('Height')))
          assign('Weight', read('Weight'))
          assign('BloodGroup', read('BloodGroup'))
          assign('Complexion', read('Complexion'))
          assign('SpecialCases', read('SpecialCases'))
          assign('SpecialReason', read('SpecialReason'))
          assign('ConfirmEmail', read('ConfirmEmail') || read('Email'))
          assign('Gender', (read('Gender') as Gender) || '')
          assign('Profilecreatedby', read('Profilecreatedby'))
          assign('maritalstatus', read('MaritalStatus'))
          assign(
            'PE_HaveChildren',
            (read('PE_HaveChildren') || read('NoOfChildren')).toLowerCase(),
          )
          assign(
            'childrenlivingstatus',
            read('childrenlivingstatus') || read('ChildrenStatus'),
          )
          assign('religion', read('religion'))
          assign('caste', read('caste'))
          assign('subcaste', read('subcaste'))
          assign('Mobile', read('Mobile'))
          assign('aboutus', read('aboutus'))
          if (countryId) assign('countrycode', countryId)

          return next
        })

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
  }, [matriId, readNonce])

  useEffect(() => {
    let active = true
    Promise.allSettled([
      masterDataService.bloodGroups(),
      masterDataService.complexions(),
      masterDataService.specialCases(),
      masterDataService.relations(),
      masterDataService.maritalStatuses(),
      masterDataService.religions(),
      masterDataService.countries(),
    ]).then((results) => {
      if (!active) return
      const pick = (index: number) => {
        const result = results[index]
        return result.status === 'fulfilled' ? result.value : []
      }
      setOptions((current) => ({
        ...current,
        blood: pick(0),
        complexions: pick(1),
        cases: pick(2),
        relations: pick(3),
        maritalStatuses: pick(4),
        religions: pick(5),
        countries: pick(6),
      }))
      const failed = results.find((result) => result.status === 'rejected')
      if (failed?.status === 'rejected') {
        toast.error('Could not load some form options', {
          description: toApiError(failed.reason).message,
        })
      }
    })
    return () => { active = false }
  }, [toast])

  useEffect(() => {
    let active = true
    if (!form.religion) {
      return () => { active = false }
    }
    masterDataService
      .castes(form.religion)
      .then((items) => {
        if (active) setCastes(items)
      })
      .catch(() => {
        if (active) setCastes([])
      })
    return () => { active = false }
  }, [form.religion])

  useEffect(() => {
    let active = true
    if (!form.caste) {
      return () => { active = false }
    }
    masterDataService
      .subcastes(form.caste)
      .then((items) => {
        if (active) setSubcastes(items)
      })
      .catch(() => {
        if (active) setSubcastes([])
      })
    return () => { active = false }
  }, [form.caste])

  function markDirty(...keys: Array<keyof FormState>) {
    for (const key of keys) dirty.current.add(key)
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    markDirty(key)
    if (key === 'religion') {
      setCastes([])
      setSubcastes([])
      markDirty('caste', 'subcaste')
      setForm((current) => ({
        ...current,
        religion: value,
        caste: '',
        subcaste: '',
      }))
      setErrors((current) => ({
        ...current,
        religion: '',
        caste: '',
        subcaste: '',
      }))
      return
    }
    if (key === 'caste') {
      setSubcastes([])
      markDirty('subcaste')
      setForm((current) => ({ ...current, caste: value, subcaste: '' }))
      setErrors((current) => ({ ...current, caste: '', subcaste: '' }))
      return
    }
    if (key === 'maritalstatus') {
      if (value === 'Unmarried') {
        markDirty('PE_HaveChildren', 'childrenlivingstatus')
      }
      setForm((current) => ({
        ...current,
        maritalstatus: value,
        ...(value === 'Unmarried'
          ? { PE_HaveChildren: 'none', childrenlivingstatus: '' }
          : {}),
      }))
      setErrors((current) => ({
        ...current,
        maritalstatus: '',
        PE_HaveChildren: '',
        childrenlivingstatus: '',
      }))
      return
    }
    if (key === 'SpecialCases') {
      if (!hasSpecialCase(value)) markDirty('SpecialReason')
      setForm((current) => ({
        ...current,
        SpecialCases: value,
        ...(hasSpecialCase(value) ? {} : { SpecialReason: '' }),
      }))
      setErrors((current) => ({ ...current, SpecialCases: '', SpecialReason: '' }))
      return
    }
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function validate() {
    const next: Record<string, string> = {}
    if (!form.Height) next.Height = 'Select your height'
    if (!form.Weight) next.Weight = 'Select your weight'
    if (!form.Name.trim()) next.Name = 'Enter your full name'
    // Older profiles hold Marathi names; only a name being typed here is checked.
    else if (dirty.current.has('Name') && !/^[A-Za-z][A-Za-z ]*$/.test(form.Name.trim())) {
      next.Name = 'Use letters only'
    }
    if (!form.DOB) next.DOB = 'Select your date of birth'
    else if (!isRealDate(form.DOB)) next.DOB = 'Select a valid date'
    else if (!isAdult(form.DOB)) next.DOB = 'You must be at least 18 years old'
    if (!form.Gender) next.Gender = 'Select gender'
    if (!form.Profilecreatedby) next.Profilecreatedby = 'Select created by'
    if (!form.maritalstatus) next.maritalstatus = 'Select marital status'
    if (form.maritalstatus && form.maritalstatus !== 'Unmarried') {
      if (!form.PE_HaveChildren) next.PE_HaveChildren = 'Select number of children'
      if (form.PE_HaveChildren !== 'none' && !form.childrenlivingstatus) {
        next.childrenlivingstatus = 'Select children status'
      }
    }
    if (!form.religion) next.religion = 'Select religion'
    if (!form.caste) next.caste = 'Select caste'
    if (!form.countrycode) next.countrycode = 'Select country code'
    if (!form.ConfirmEmail.trim()) next.ConfirmEmail = 'Enter email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ConfirmEmail.trim())) {
      next.ConfirmEmail = 'Enter a valid email'
    }
    if (!form.Mobile.trim()) next.Mobile = 'Enter mobile number'
    else if (dirty.current.has('Mobile') && !isValidMobile(form.Mobile, form.countrycode)) {
      next.Mobile = 'Enter a valid mobile number'
    }
    if (!form.aboutus.trim()) next.aboutus = 'Add a short profile description'
    else if (
      form.aboutus.trim().length < 20 &&
      form.aboutus.trim() !== loadedAboutUs.current.trim()
    ) {
      next.aboutus = 'Write at least 20 characters'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  // Profile editing must never save a half-loaded form over real details.
  const readBlocked = profileEdit && readStatus !== 'ready'

  function retryRead() {
    setReadStatus('reading')
    setReadError(null)
    setReadWarning('')
    setReadNonce((value) => value + 1)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!matriId) { toast.error('Missing profile ID'); return }
    if (readBlocked) {
      toast.error('Your saved details are not loaded yet', {
        description: readError ?? 'Please retry loading them before saving.',
      })
      return
    }
    if (!validate()) { toast.error('Please fix the highlighted fields'); return }
    const payload: BasicDetails = {
      MatriID: matriId, Name: form.Name.trim(), DOB: form.DOB,
      Height: form.Height, Weight: form.Weight, BloodGroup: form.BloodGroup,
      Complexion: form.Complexion, SpecialCases: form.SpecialCases,
      ...(hasSpecialCase(form.SpecialCases) && form.SpecialReason.trim()
        ? { SpecialReason: form.SpecialReason.trim() }
        : {}),
      ConfirmEmail: form.ConfirmEmail.trim(), Gender: form.Gender as Gender,
      Profilecreatedby: form.Profilecreatedby, maritalstatus: form.maritalstatus,
      PE_HaveChildren: form.PE_HaveChildren || 'none',
      childrenlivingstatus:
        form.maritalstatus === 'Unmarried' || form.PE_HaveChildren === 'none'
          ? ''
          : (form.childrenlivingstatus as BasicDetails['childrenlivingstatus']),
      religion: form.religion, caste: form.caste, subcaste: form.subcaste,
      countrycode: form.countrycode, Mobile: form.Mobile.trim(), aboutus: form.aboutus.trim(),
      profile_location_type: profileLocationType || 'Indian Resident',
    }
    if (profileEdit) {
      // The profile editor has no reliable NRI read field. Avoid changing the
      // saved residency type while editing unrelated basic details.
      delete (payload as Partial<BasicDetails>).profile_location_type
    }
    setSubmitting(true)
    try {
      const result = await registrationService.submitBasicDetails(payload)
      saveSection('basic', payload)
      toast.success('Basic details saved', { description: result.message || undefined })
      if (onSaved) {
        onSaved()
      } else {
        const next = nextRegistrationStep('basic', profileLocationType)
        void navigate(registrationStepPath(next ?? 'review'), { replace: true })
      }
    } catch (error) {
      toast.error('Could not save basic details', { description: toApiError(error).message })
    } finally { setSubmitting(false) }
  }

  const select = (
    key: keyof FormState,
    label: string,
    items: MasterOption[],
    placeholder: string,
    required = true,
    disabled = false,
  ) => {
    const value = String(form[key] ?? '')
    return (
      <SelectField
        label={label}
        value={value}
        onChange={(event) => update(key, event.target.value)}
        options={withCurrent(items, value)}
        placeholder={placeholder}
        error={errors[key]}
        required={required}
        disabled={disabled}
      />
    )
  }

  return (
    <form className="flex flex-1 flex-col pb-2" onSubmit={handleSubmit} noValidate>
      {profileEdit && readStatus === 'reading' ? (
        <p className="mb-3 flex items-center gap-2 text-xs text-muted">
          <Spinner /> Loading your saved details…
        </p>
      ) : null}
      {readStatus === 'error' ? (
        <div
          role="alert"
          className="mb-4 rounded-card border border-danger/25 bg-danger-soft/60 p-4"
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
      {readWarning ? (
        <div
          role="status"
          className="mb-4 rounded-card border border-warning/30 bg-warning-soft/70 p-3 text-xs leading-relaxed text-warning"
        >
          {readWarning}
        </div>
      ) : null}
      <div className="space-y-4">
        <Card className="registration-section-card space-y-4">
          <h2 className="text-base font-semibold text-maroon">Account details</h2>
          <p className="text-sm text-muted">
            Correct the details saved when your account was created. Child
            acceptance is kept as saved and is not changed on this step.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Full name"
              value={form.Name}
              onChange={(event) => update('Name', event.target.value)}
              hint="Use your full name as registered."
              error={errors.Name}
              autoComplete="name"
              required
            />
            <TextField
              label="Date of birth"
              type="date"
              value={form.DOB}
              onChange={(event) => update('DOB', event.target.value)}
              max={latestAdultDate()}
              error={errors.DOB}
              autoComplete="bday"
              required
            />
            {select('Gender', 'Gender', [...GENDER_OPTIONS], 'Select gender')}
            {select(
              'Profilecreatedby',
              'Profile created by',
              options.relations ?? [],
              'Select relation',
            )}
            {select(
              'maritalstatus',
              'Marital status',
              options.maritalStatuses ?? [],
              'Select marital status',
            )}
            {form.maritalstatus && form.maritalstatus !== 'Unmarried' ? (
              <>
                {select(
                  'PE_HaveChildren',
                  'Number of children',
                  CHILDREN_COUNT_OPTIONS,
                  'Select number of children',
                )}
                {form.PE_HaveChildren !== 'none'
                  ? select(
                      'childrenlivingstatus',
                      'Children status',
                      CHILDREN_STATUS_SELECT_OPTIONS,
                      'Select children status',
                    )
                  : null}
              </>
            ) : null}
          </div>
        </Card>

        <Card className="registration-section-card space-y-4">
          <h2 className="text-base font-semibold text-maroon">
            Religion and community
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {select(
              'religion',
              'Religion',
              options.religions ?? [],
              'Select religion',
            )}
            {select(
              'caste',
              'Caste',
              castes,
              'Select caste',
              false,
              !form.religion,
            )}
            {select(
              'subcaste',
              'Subcaste',
              subcastes,
              'Select subcaste',
              false,
              !form.caste,
            )}
          </div>
        </Card>

        <Card className="registration-section-card space-y-4">
          <h2 className="text-base font-semibold text-maroon">Contact</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Email"
              type="email"
              value={form.ConfirmEmail}
              onChange={(event) => update('ConfirmEmail', event.target.value)}
              error={errors.ConfirmEmail}
              autoComplete="email"
              required
            />
            <TextField
              label="Mobile number"
              type="tel"
              inputMode="numeric"
              value={form.Mobile}
              onChange={(event) => update('Mobile', event.target.value)}
              maxLength={15}
              error={errors.Mobile}
              autoComplete="tel-national"
              required
            />
            {select(
              'countrycode',
              'Country code',
              options.countries ?? [],
              'Select country code',
            )}
          </div>
          <TextareaField
            label="About you"
            value={form.aboutus}
            onChange={(event) => update('aboutus', event.target.value)}
            error={errors.aboutus}
            required
          />
        </Card>

        <Card className="registration-section-card space-y-4">
          <h2 className="text-base font-semibold text-maroon">Physical details</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField label="Height" value={form.Height} onChange={(e) => update('Height', e.target.value)} options={HEIGHT_OPTIONS} placeholder="Select height code" error={errors.Height} required />
            <SelectField label="Weight" value={form.Weight} onChange={(e) => update('Weight', e.target.value)} options={WEIGHT_OPTIONS} placeholder="Select weight" error={errors.Weight} required />
            {select('BloodGroup', 'Blood group', options.blood ?? [], 'Select blood group', false)}
            {select('Complexion', 'Complexion', options.complexions ?? [], 'Select complexion', false)}
            {select('SpecialCases', 'Special case', options.cases ?? [], 'Select if applicable', false)}
            {hasSpecialCase(form.SpecialCases) && <TextField label="Special case details" value={form.SpecialReason} onChange={(e) => update('SpecialReason', e.target.value)} />}
          </div>
        </Card>
      </div>
      <div className="registration-submit-bar mt-4">
        <Button type="submit" fullWidth size="lg" disabled={submitting || readBlocked}>
          {submitting ? <><Spinner /> Saving details</> : 'Save and continue'}
        </Button>
      </div>
    </form>
  )
}
