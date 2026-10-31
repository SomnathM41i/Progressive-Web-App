import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/loading/Spinner'
import { SelectField } from '@/components/ui/SelectField'
import { TextField } from '@/components/ui/TextField'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { routes } from '@/config/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  buildSessionFromProfile,
  persistAuthSession,
} from '@/features/auth/services/auth.service'
import {
  CHILD_ACCEPTANCE_OPTIONS,
  CHILDREN_STATUS_OPTIONS,
  DEFAULT_PROFILE_CREATED_BY,
  DEFAULT_TERMS_ACCEPTED,
  FIXED_REGNO,
  FIXED_RELATION_ID,
  INDIA_COUNTRY_ID,
  NO_OF_CHILDREN_OPTIONS,
  PROFILE_LOCATION_TYPES,
  isValidMobile,
} from '@/features/registration/constants'
import { useRegistration } from '@/features/registration/hooks/useRegistration'
import { masterDataService } from '@/features/registration/services/master-data.service'
import type { MasterOption } from '@/features/registration/services/master-data.service'
import { registrationService } from '@/features/registration/services/registration.service'
import {
  nextRegistrationStep,
  registrationStepPath,
  registrationStepsFor,
} from '@/features/registration/steps'
import type { RegistrationAccount } from '@/features/registration/types'
import { useToast } from '@/hooks/useToast'
import { toApiError } from '@/services/api-error'
import { cn } from '@/lib/cn'

interface AccountFormState {
  fname: string
  lname: string
  middle_name: string
  email: string
  pass: string
  confirm_pass: string
  gender: 'Male' | 'Female' | ''
  dob: string
  dobMonth: string
  dobYear: string
  Profilecreatedby: string
  Relation_id: string
  maritalstatus: string
  noofchildren: string
  childrenstatus: string
  child_acceptance: string
  religion: string
  caste: string
  subcaste: string
  countrycode: string
  mobile: string
  aboutus: string
  profile_location_type: (typeof PROFILE_LOCATION_TYPES)[number]
  terms_accepted: '1' | ''
  regno: string
}

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
] as const

const MONTH_OPTIONS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
].map((label, index) => ({ value: String(index + 1).padStart(2, '0'), label }))

const NO_OF_CHILDREN_SELECT_OPTIONS = NO_OF_CHILDREN_OPTIONS.map((value) => ({
  value,
  label: value,
}))

const CHILDREN_STATUS_SELECT_OPTIONS = CHILDREN_STATUS_OPTIONS.map((value) => ({
  value,
  label: value,
}))

const CHILD_ACCEPTANCE_SELECT_OPTIONS = CHILD_ACCEPTANCE_OPTIONS.map((value) => ({
  value,
  label: value,
}))

const initialState: AccountFormState = {
  fname: '',
  lname: '',
  middle_name: '',
  email: '',
  pass: '',
  confirm_pass: '',
  gender: '',
  dob: '',
  dobMonth: '',
  dobYear: '',
  Profilecreatedby: DEFAULT_PROFILE_CREATED_BY,
  Relation_id: FIXED_RELATION_ID,
  maritalstatus: '',
  noofchildren: 'None',
  childrenstatus: '',
  child_acceptance: 'Do Not Accept Children',
  religion: '',
  caste: '',
  subcaste: '',
  countrycode: '',
  mobile: '',
  aboutus: '',
  profile_location_type: 'Indian Resident',
  terms_accepted: '',
  regno: FIXED_REGNO,
}

function isAdult(day: string, month: string, year: string): boolean {
  const date = Number(day)
  const monthNumber = Number(month)
  const yearNumber = Number(year)
  if (!date || !monthNumber || !yearNumber) return false

  const today = new Date()
  let age = today.getFullYear() - yearNumber
  const monthDiff = today.getMonth() + 1 - monthNumber
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date)) {
    age -= 1
  }
  return age >= 18
}

function isRealDate(day: string, month: string, year: string): boolean {
  const date = Number(day)
  const monthNumber = Number(month)
  const yearNumber = Number(year)
  if (!date || !monthNumber || !yearNumber) return false
  const value = new Date(yearNumber, monthNumber - 1, date)
  return (
    value.getFullYear() === yearNumber &&
    value.getMonth() === monthNumber - 1 &&
    value.getDate() === date
  )
}

function ageFromBirthDate(day: string, month: string, year: string): number | null {
  const date = Number(day)
  const monthNumber = Number(month)
  const yearNumber = Number(year)
  if (!date || !monthNumber || !yearNumber) return null
  if (!isRealDate(day, month, year)) return null

  const today = new Date()
  let age = today.getFullYear() - yearNumber
  const monthDiff = today.getMonth() + 1 - monthNumber
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date)) age -= 1
  return age > 0 ? age : null
}

function suggestedAbout(form: AccountFormState): string {
  const name = [form.fname, form.middle_name, form.lname]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ')
  if (!name) return ''

  const age = ageFromBirthDate(form.dob, form.dobMonth, form.dobYear)
  const details = [
    age ? `${age} years old` : '',
    form.maritalstatus.trim().toLowerCase(),
    form.gender.trim().toLowerCase(),
  ]
    .filter(Boolean)
    .join(', ')
  const community = [form.religion.trim(), form.caste.trim()].filter(Boolean).join(' ')

  let sentence = `I am ${name}`
  if (details) sentence += `, ${details}`
  if (community) sentence += `, from the ${community} community`
  return `${sentence}. I am looking for a compatible life partner.`
}

export function AccountStepPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { adoptSession } = useAuth()
  const { saveAccount, profileLocationType, setProfileLocationType } = useRegistration()

  const [form, setForm] = useState<AccountFormState>({
    ...initialState,
    profile_location_type:
      (profileLocationType as AccountFormState['profile_location_type']) ||
      initialState.profile_location_type,
  })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const aboutEdited = useRef(false)

  const [relations, setRelations] = useState<MasterOption[]>([])
  const [maritalStatuses, setMaritalStatuses] = useState<MasterOption[]>([])
  const [religions, setReligions] = useState<MasterOption[]>([])
  const [castes, setCastes] = useState<MasterOption[]>([])
  const [subcastes, setSubcastes] = useState<MasterOption[]>([])
  const [countries, setCountries] = useState<MasterOption[]>([])
  const [days, setDays] = useState<MasterOption[]>([])
  const [years, setYears] = useState<MasterOption[]>([])

  useEffect(() => {
    let active = true

    Promise.allSettled([
      masterDataService.relations(),
      masterDataService.maritalStatuses(),
      masterDataService.religions(),
      masterDataService.countries(),
      masterDataService.days(),
      masterDataService.years(),
    ]).then((results) => {
      if (!active) return
      const pick = (index: number) => {
        const result = results[index]
        return result.status === 'fulfilled' ? result.value : []
      }
      const relationOptions = pick(0)
      const statusOptions = pick(1)
      const religionOptions = pick(2)
      const countryOptions = pick(3)
      const dayOptions = pick(4)
      const yearOptions = pick(5)

      setRelations(relationOptions)
      setMaritalStatuses(statusOptions)
      setReligions(religionOptions)
      setCountries(countryOptions)
      setDays(dayOptions)
      setYears([...yearOptions].reverse())
      setForm((current) => {
        if (current.countrycode) return current
        const india = countryOptions.find((option) => option.label.startsWith('India '))
        return india ? { ...current, countrycode: india.value } : current
      })

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
  }, [toast])

  useEffect(() => {
    let active = true
    if (!form.religion)
      return () => {
        active = false
      }

    masterDataService
      .castes(form.religion)
      .then((options) => {
        if (active) setCastes(options)
      })
      .catch(() => {
        if (active) setCastes([])
      })

    return () => {
      active = false
    }
  }, [form.religion])

  useEffect(() => {
    let active = true
    if (!form.caste)
      return () => {
        active = false
      }

    masterDataService
      .subcastes(form.caste)
      .then((options) => {
        if (active) setSubcastes(options)
      })
      .catch(() => {
        if (active) setSubcastes([])
      })

    return () => {
      active = false
    }
  }, [form.caste])

  function update<K extends keyof AccountFormState>(
    key: K,
    value: AccountFormState[K],
  ) {
    if (key === 'aboutus') aboutEdited.current = true
    setForm((current) => {
      const next = { ...current, [key]: value }
      if (key !== 'aboutus' && !aboutEdited.current) {
        next.aboutus = suggestedAbout(next)
      }
      return next
    })
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function updateReligion(value: string) {
    setCastes([])
    setSubcastes([])
    setForm((current) => {
      const next = { ...current, religion: value, caste: '', subcaste: '' }
      if (!aboutEdited.current) next.aboutus = suggestedAbout(next)
      return next
    })
    setErrors((current) => ({ ...current, religion: '', caste: '', subcaste: '' }))
  }

  function updateCaste(value: string) {
    setSubcastes([])
    setForm((current) => {
      const next = { ...current, caste: value, subcaste: '' }
      if (!aboutEdited.current) next.aboutus = suggestedAbout(next)
      return next
    })
    setErrors((current) => ({ ...current, caste: '', subcaste: '' }))
  }

  function updateProfileCreatedBy(value: string) {
    const relation = relations.find((option) => option.value === value)
    setForm((current) => ({
      ...current,
      Profilecreatedby: value,
      Relation_id: value === 'Self' ? FIXED_RELATION_ID : (relation?.id ?? value),
    }))
    setErrors((current) => ({ ...current, Profilecreatedby: '' }))
  }

  function updateMaritalStatus(value: string) {
    setForm((current) => {
      const next = {
        ...current,
        maritalstatus: value,
        ...(value === 'Unmarried'
          ? {
              noofchildren: 'None',
              childrenstatus: '',
              child_acceptance: 'Do Not Accept Children',
            }
          : {}),
      }
      if (!aboutEdited.current) next.aboutus = suggestedAbout(next)
      return next
    })
    setErrors((current) => ({
      ...current,
      maritalstatus: '',
      noofchildren: '',
      childrenstatus: '',
      child_acceptance: '',
    }))
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    const namePattern = /^[A-Za-z][A-Za-z ]*$/

    if (!form.fname.trim()) next.fname = 'Enter first name'
    else if (!namePattern.test(form.fname.trim())) next.fname = 'Use letters only'
    if (!form.lname.trim()) next.lname = 'Enter last name'
    else if (!namePattern.test(form.lname.trim())) next.lname = 'Use letters only'
    if (form.middle_name.trim() && !namePattern.test(form.middle_name.trim())) {
      next.middle_name = 'Middle name must contain only letters'
    }
    if (!form.email.trim()) next.email = 'Enter email'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Enter a valid email'
    }
    if (!form.pass.trim()) next.pass = 'Enter password'
    else if (form.pass.trim().length < 6) next.pass = 'Use at least 6 characters'
    if (!form.confirm_pass.trim()) next.confirm_pass = 'Confirm password'
    else if (form.pass.trim() !== form.confirm_pass.trim()) {
      next.confirm_pass = 'Passwords do not match'
    }
    if (!form.gender) next.gender = 'Select gender'
    if (!form.dob || !form.dobMonth || !form.dobYear) {
      next.dob = 'Select birth day, month and year'
    } else if (!isRealDate(form.dob, form.dobMonth, form.dobYear)) {
      next.dob = 'Select a valid birth date'
    } else if (!isAdult(form.dob, form.dobMonth, form.dobYear)) {
      next.dob = 'You must be at least 18 years old'
    }
    if (!form.Profilecreatedby.trim()) next.Profilecreatedby = 'Select created by'
    if (!form.maritalstatus.trim()) next.maritalstatus = 'Select marital status'
    if (form.maritalstatus && form.maritalstatus !== 'Unmarried') {
      if (!form.noofchildren.trim()) next.noofchildren = 'Select number of children'
      if (form.noofchildren !== 'None' && !form.childrenstatus.trim()) {
        next.childrenstatus = 'Select children status'
      }
      if (!form.child_acceptance.trim()) {
        next.child_acceptance = 'Select child acceptance'
      }
    }
    if (!form.religion.trim()) next.religion = 'Select religion'
    if (!form.caste.trim()) next.caste = 'Select caste'
    if (!form.countrycode.trim()) next.countrycode = 'Select country code'
    if (!form.mobile.trim()) next.mobile = 'Enter mobile number'
    else if (!isValidMobile(form.mobile, form.countrycode)) {
      next.mobile =
        form.countrycode === INDIA_COUNTRY_ID
          ? 'Enter a 10-digit mobile number'
          : 'Enter a valid mobile number'
    }
    if (!form.aboutus.trim()) next.aboutus = 'Add a short profile description'
    else if (form.aboutus.trim().length < 20) {
      next.aboutus = 'Write at least 20 characters'
    }
    if (form.terms_accepted !== '1') next.terms_accepted = 'Accept terms and conditions'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) {
      toast.error('Please fix the highlighted fields')
      return
    }

    setSubmitting(true)

    const payload: RegistrationAccount = {
      fname: form.fname.trim(),
      lname: form.lname.trim(),
      middle_name: form.middle_name.trim() || undefined,
      email: form.email.trim(),
      pass: form.pass.trim(),
      gender: form.gender === 'Female' ? 'Female' : 'Male',
      dob: form.dob,
      dobMonth: form.dobMonth,
      dobYear: form.dobYear,
      Profilecreatedby: form.Profilecreatedby,
      Relation_id: form.Relation_id,
      maritalstatus: form.maritalstatus,
      noofchildren: form.noofchildren as RegistrationAccount['noofchildren'],
      childrenstatus:
        form.maritalstatus === 'Unmarried' || form.noofchildren === 'None'
          ? ''
          : (form.childrenstatus as RegistrationAccount['childrenstatus']),
      child_acceptance:
        form.child_acceptance as RegistrationAccount['child_acceptance'],
      religion: form.religion.trim(),
      caste: form.caste.trim(),
      subcaste: form.subcaste.trim(),
      countrycode: form.countrycode.trim(),
      mobile: form.mobile.trim(),
      aboutus: form.aboutus.trim(),
      profile_location_type: form.profile_location_type,
      terms_accepted: DEFAULT_TERMS_ACCEPTED,
      regno: FIXED_REGNO,
    }

    try {
      const result = await registrationService.registerAccount(payload)
      saveAccount(payload, result.matriId)
      setProfileLocationType(payload.profile_location_type)

      const session = buildSessionFromProfile({
        matriId: result.matriId,
        name: `${payload.fname} ${payload.lname}`.trim(),
        email: payload.email,
        phone: payload.mobile,
      })
      persistAuthSession(session)
      adoptSession(session)

      toast.success('Account created', {
        description: result.message || `Profile ID: ${result.matriId}`,
      })

      const next = nextRegistrationStep('account', payload.profile_location_type)
      void navigate(next ? registrationStepPath(next) : routes.home, { replace: true })
    } catch (error) {
      const apiError = toApiError(error)
      toast.error('Could not create account', { description: apiError.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="flex flex-1 flex-col pb-2" onSubmit={handleSubmit} noValidate>
      <div className="space-y-5">
        <Card className="registration-section-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-maroon">Profile type</h2>
            <Badge tone="brand">
              Step 1 of {registrationStepsFor(form.profile_location_type).length}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {PROFILE_LOCATION_TYPES.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => {
                  update('profile_location_type', option)
                  setProfileLocationType(option)
                }}
                className={cn(
                  'h-11 rounded-full text-sm font-semibold transition',
                  form.profile_location_type === option
                    ? 'bg-maroon text-white'
                    : 'bg-rose text-maroon hover:bg-rose-dark',
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </Card>

        <Card className="registration-section-card space-y-4">
          <h2 className="text-base font-semibold text-maroon">Personal details</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="First name"
              value={form.fname}
              onChange={(event) => update('fname', event.target.value)}
              error={errors.fname}
              autoComplete="given-name"
              required
            />
            <TextField
              label="Middle name"
              value={form.middle_name}
              onChange={(event) => update('middle_name', event.target.value)}
              error={errors.middle_name}
              autoComplete="additional-name"
            />
            <TextField
              label="Last name"
              value={form.lname}
              onChange={(event) => update('lname', event.target.value)}
              error={errors.lname}
              autoComplete="family-name"
              required
            />
            <SelectField
              label="Gender"
              value={form.gender}
              onChange={(event) =>
                update('gender', event.target.value as 'Male' | 'Female')
              }
              options={GENDER_OPTIONS}
              error={errors.gender}
              placeholder="Select gender"
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <SelectField
              label="Birth day"
              value={form.dob}
              onChange={(event) => update('dob', event.target.value)}
              options={days}
              error={errors.dob}
              placeholder="Day"
              required
            />
            <SelectField
              label="Birth month"
              value={form.dobMonth}
              onChange={(event) => update('dobMonth', event.target.value)}
              options={MONTH_OPTIONS}
              error={errors.dob}
              placeholder="Month"
              required
            />
            <SelectField
              label="Birth year"
              value={form.dobYear}
              onChange={(event) => update('dobYear', event.target.value)}
              options={years}
              error={errors.dob}
              placeholder="Year"
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Marital status"
              value={form.maritalstatus}
              onChange={(event) => updateMaritalStatus(event.target.value)}
              options={maritalStatuses}
              error={errors.maritalstatus}
              placeholder="Select marital status"
              required
            />
            <SelectField
              label="Profile created by"
              value={form.Profilecreatedby}
              onChange={(event) => updateProfileCreatedBy(event.target.value)}
              options={relations}
              error={errors.Profilecreatedby}
              placeholder="Select relation"
              required
            />
          </div>
          {form.maritalstatus && form.maritalstatus !== 'Unmarried' ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField
                  label="Number of children"
                  value={form.noofchildren}
                  onChange={(event) => update('noofchildren', event.target.value)}
                  options={NO_OF_CHILDREN_SELECT_OPTIONS}
                  error={errors.noofchildren}
                  required
                />
                {form.noofchildren !== 'None' ? (
                  <SelectField
                    label="Children status"
                    value={form.childrenstatus}
                    onChange={(event) => update('childrenstatus', event.target.value)}
                    options={CHILDREN_STATUS_SELECT_OPTIONS}
                    error={errors.childrenstatus}
                    placeholder="Select children status"
                    required
                  />
                ) : null}
              </div>
              <SelectField
                label="Child acceptance"
                value={form.child_acceptance}
                onChange={(event) => update('child_acceptance', event.target.value)}
                options={CHILD_ACCEPTANCE_SELECT_OPTIONS}
                error={errors.child_acceptance}
                required
              />
            </>
          ) : null}
        </Card>

        <Card className="registration-section-card space-y-4">
          <h2 className="text-base font-semibold text-maroon">
            Religion and community
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Religion"
              value={form.religion}
              onChange={(event) => updateReligion(event.target.value)}
              options={religions}
              error={errors.religion}
              placeholder="Select religion"
              required
            />
            <SelectField
              label="Caste"
              value={form.caste}
              onChange={(event) => updateCaste(event.target.value)}
              options={castes}
              error={errors.caste}
              placeholder={form.religion ? 'Select caste' : 'Select religion first'}
              disabled={!form.religion}
              required
            />
            <SelectField
              label="Subcaste (optional)"
              value={form.subcaste}
              onChange={(event) => update('subcaste', event.target.value)}
              options={subcastes}
              placeholder={form.caste ? 'Select subcaste' : 'Select caste first'}
              disabled={!form.caste}
              className="sm:col-span-2"
            />
          </div>
        </Card>

        <Card className="registration-section-card space-y-4">
          <h2 className="text-base font-semibold text-maroon">Contact and login</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => update('email', event.target.value)}
              error={errors.email}
              autoComplete="email"
              required
            />
            <SelectField
              label="Country code"
              value={form.countrycode}
              onChange={(event) => update('countrycode', event.target.value)}
              options={countries}
              error={errors.countrycode}
              placeholder="Select country"
              required
            />
            <TextField
              label="Mobile number"
              value={form.mobile}
              onChange={(event) =>
                update('mobile', event.target.value.replace(/\D/g, '').slice(0, 15))
              }
              error={errors.mobile}
              inputMode="numeric"
              autoComplete="tel-national"
              required
            />
            <div className="hidden sm:block" aria-hidden="true" />
            <TextField
              label="Password"
              type="password"
              value={form.pass}
              onChange={(event) => update('pass', event.target.value)}
              error={errors.pass}
              autoComplete="new-password"
              required
            />
            <TextField
              label="Confirm password"
              type="password"
              value={form.confirm_pass}
              onChange={(event) => update('confirm_pass', event.target.value)}
              error={errors.confirm_pass}
              autoComplete="new-password"
              required
            />
          </div>
          <TextField
            label="About yourself"
            value={form.aboutus}
            onChange={(event) => update('aboutus', event.target.value)}
            error={errors.aboutus}
            placeholder="Write a short description of yourself (minimum 20 characters)"
            required
          />
        </Card>
      </div>

      <div className="mt-5">
        <label className="flex items-start gap-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.terms_accepted === DEFAULT_TERMS_ACCEPTED}
            onChange={(event) =>
              update(
                'terms_accepted',
                event.target.checked ? DEFAULT_TERMS_ACCEPTED : '',
              )
            }
            aria-invalid={errors.terms_accepted ? true : undefined}
            aria-describedby={errors.terms_accepted ? 'terms-accepted-error' : undefined}
            className="mt-0.5 size-4 shrink-0 accent-maroon focus-visible:outline-maroon"
          />
          <span>
            I agree to the{' '}
            <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-maroon underline">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-maroon underline">
              Privacy Policy
            </a>
            .
          </span>
        </label>
        {errors.terms_accepted ? (
          <p id="terms-accepted-error" role="alert" className="mt-1.5 text-2xs text-danger">
            {errors.terms_accepted}
          </p>
        ) : null}
      </div>

      <div className="registration-submit-bar mt-4">
        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={submitting}
          leadingIcon={submitting ? <Spinner className="size-4" /> : undefined}
        >
          {submitting ? 'Creating account…' : 'Create account and continue'}
        </Button>
      </div>
    </form>
  )
}
