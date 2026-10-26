import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { Spinner } from '@/components/loading/Spinner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SelectField } from '@/components/ui/SelectField'
import { TextField } from '@/components/ui/TextField'
import { HEIGHT_CODES, WEIGHT_MAX, WEIGHT_MIN } from '@/features/registration/constants'
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
  child_acceptance: string
}

const initialForm: FormState = {
  Name: '', DOB: '', Height: '', Weight: '', BloodGroup: '', Complexion: '',
  SpecialCases: '', SpecialReason: '', ConfirmEmail: '', Gender: '',
  Profilecreatedby: '', maritalstatus: '', PE_HaveChildren: 'none',
  childrenlivingstatus: '', religion: '', caste: '', subcaste: '',
  countrycode: '', Mobile: '', aboutus: '', child_acceptance: 'Do Not Accept Children',
}

function heightLabel(code: string): string {
  const totalInches = 47 + Number(code)
  return `${Math.floor(totalInches / 12)}Ft ${totalInches % 12} inch`
}

function heightCodeFromLabel(value: string): string {
  if (!value) return ''
  if (HEIGHT_CODES.includes(value)) return value
  const match = /(\d+)\s*Ft\s*(\d+)\s*inch/i.exec(value)
  if (!match) return ''
  const code = String(Number(match[1]) * 12 + Number(match[2]) - 47)
  return HEIGHT_CODES.includes(code) ? code : ''
}

const HEIGHT_OPTIONS = HEIGHT_CODES.map((value) => ({ value, label: heightLabel(value) }))
const WEIGHT_OPTIONS = Array.from({ length: WEIGHT_MAX - WEIGHT_MIN + 1 }, (_, i) => String(i + WEIGHT_MIN)).map((value) => ({ value, label: `${value} kg` }))

function accountDate(account: Record<string, unknown> | undefined): string {
  if (!account) return ''
  const day = String(account.dob ?? '').padStart(2, '0')
  const month = String(account.dobMonth ?? '').padStart(2, '0')
  const year = String(account.dobYear ?? '')
  return day && month && year ? `${year}-${month}-${day}` : ''
}

export function BasicStepPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { matriId, profileLocationType, draft, saveSection } = useRegistration()
  const account = draft.sections.account as Record<string, unknown> | undefined
  const [form, setForm] = useState<FormState>(() => ({
    ...initialForm,
    Name: [account?.fname, account?.middle_name, account?.lname].filter(Boolean).join(' '),
    DOB: accountDate(account), ConfirmEmail: String(account?.email ?? ''),
    Gender: (account?.gender as Gender | undefined) ?? '',
    Profilecreatedby: String(account?.Profilecreatedby ?? ''),
    maritalstatus: String(account?.maritalstatus ?? ''),
    PE_HaveChildren: String(account?.noofchildren ?? 'none').toLowerCase(),
    childrenlivingstatus: String(account?.childrenstatus ?? ''),
    religion: String(account?.religion ?? ''), caste: String(account?.caste ?? ''),
    subcaste: String(account?.subcaste ?? ''), countrycode: String(account?.countrycode ?? ''),
    Mobile: String(account?.mobile ?? ''), aboutus: String(account?.aboutus ?? ''),
    child_acceptance: String(account?.child_acceptance ?? 'Do Not Accept Children'),
  }))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [options, setOptions] = useState<Record<string, MasterOption[]>>({})

  useEffect(() => {
    if (!matriId) return
    let active = true
    registrationService.getBasicDetails(matriId).then((record) => {
      if (!active) return
      const read = (key: string) => {
        const entry = Object.entries(record).find(([name]) => name.toLowerCase() === key.toLowerCase())
        return entry?.[1] === null || entry?.[1] === undefined ? '' : String(entry[1])
      }
      setForm((current) => ({
        ...current,
        Name: read('Name') || current.Name,
        DOB: read('DOB') || current.DOB,
        Height: heightCodeFromLabel(read('Height')) || current.Height,
        Weight: read('Weight') || current.Weight,
        BloodGroup: read('BloodGroup') || current.BloodGroup,
        Complexion: read('Complexion') || current.Complexion,
        SpecialCases: read('SpecialCases') || current.SpecialCases,
        SpecialReason: read('SpecialReason') || current.SpecialReason,
        ConfirmEmail: read('ConfirmEmail') || current.ConfirmEmail,
        Gender: (read('Gender') || current.Gender) as Gender | '',
        Profilecreatedby: read('Profilecreatedby') || current.Profilecreatedby,
        maritalstatus: read('maritalstatus') || current.maritalstatus,
        PE_HaveChildren: read('PE_HaveChildren') || current.PE_HaveChildren,
        childrenlivingstatus: read('childrenlivingstatus') || current.childrenlivingstatus,
        religion: read('religion') || current.religion,
        caste: read('caste') || current.caste,
        subcaste: read('subcaste') || current.subcaste,
        countrycode: read('countrycode') || current.countrycode,
        Mobile: read('Mobile') || current.Mobile,
        aboutus: read('aboutus') || current.aboutus,
        child_acceptance: read('child_acceptance') || current.child_acceptance,
      }))
    }).catch(() => {
      // New accounts may not have a saved basic-details record yet.
    })
    return () => { active = false }
  }, [matriId])

  useEffect(() => {
    let active = true
    Promise.all([
      masterDataService.bloodGroups(), masterDataService.complexions(),
      masterDataService.specialCases(),
    ]).then(([blood, complexions, cases]) => {
      if (active) setOptions((current) => ({ ...current, blood, complexions, cases }))
    }).catch((error: unknown) => {
      if (active) toast.error('Could not load form options', { description: toApiError(error).message })
    })
    return () => { active = false }
  }, [toast])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function validate() {
    const next: Record<string, string> = {}
    if (!form.Height) next.Height = 'Select your height'
    if (!form.Weight) next.Weight = 'Select your weight'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!matriId) { toast.error('Missing profile ID'); return }
    if (!validate()) { toast.error('Please fix the highlighted fields'); return }
    const payload: BasicDetails = {
      MatriID: matriId, Name: form.Name.trim(), DOB: form.DOB,
      Height: form.Height, Weight: form.Weight, BloodGroup: form.BloodGroup,
      Complexion: form.Complexion, SpecialCases: form.SpecialCases,
      ...(form.SpecialReason.trim() ? { SpecialReason: form.SpecialReason.trim() } : {}),
      ConfirmEmail: form.ConfirmEmail.trim(), Gender: form.Gender as Gender,
      Profilecreatedby: form.Profilecreatedby, maritalstatus: form.maritalstatus,
      PE_HaveChildren: form.PE_HaveChildren || 'none',
      childrenlivingstatus: form.childrenlivingstatus as BasicDetails['childrenlivingstatus'],
      religion: form.religion, caste: form.caste, subcaste: form.subcaste,
      countrycode: form.countrycode, Mobile: form.Mobile.trim(), aboutus: form.aboutus.trim(),
      profile_location_type: profileLocationType || 'Indian Resident',
      child_acceptance: form.child_acceptance as BasicDetails['child_acceptance'],
    }
    setSubmitting(true)
    try {
      const result = await registrationService.submitBasicDetails(payload)
      saveSection('basic', payload)
      toast.success('Basic details saved', { description: result.message || undefined })
      const next = nextRegistrationStep('basic', profileLocationType)
      void navigate(registrationStepPath(next ?? 'review'), { replace: true })
    } catch (error) {
      toast.error('Could not save basic details', { description: toApiError(error).message })
    } finally { setSubmitting(false) }
  }

  const select = (key: keyof FormState, label: string, items: MasterOption[], placeholder: string) => (
    <SelectField label={label} value={String(form[key])} onChange={(event) => update(key, event.target.value)} options={items} placeholder={placeholder} error={errors[key]} required />
  )

  return (
    <form className="flex flex-1 flex-col pb-6" onSubmit={handleSubmit} noValidate>
      <div className="space-y-4">
        <Card className="space-y-4">
          <h2 className="text-base font-semibold text-maroon">Physical details</h2>
          <p className="text-sm text-muted">
            Your name, age, gender and background are already saved from the account
            step. Add your physical details here.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField label="Height" value={form.Height} onChange={(e) => update('Height', e.target.value)} options={HEIGHT_OPTIONS} placeholder="Select height code" error={errors.Height} required />
            <SelectField label="Weight" value={form.Weight} onChange={(e) => update('Weight', e.target.value)} options={WEIGHT_OPTIONS} placeholder="Select weight" error={errors.Weight} required />
            {select('BloodGroup', 'Blood group', options.blood ?? [], 'Select blood group')}
            {select('Complexion', 'Complexion', options.complexions ?? [], 'Select complexion')}
            {select('SpecialCases', 'Special case', options.cases ?? [], 'Select if applicable')}
            {form.SpecialCases && <TextField label="Special case details" value={form.SpecialReason} onChange={(e) => update('SpecialReason', e.target.value)} />}
          </div>
        </Card>
      </div>
      <Button type="submit" fullWidth className="mt-5" disabled={submitting}>
        {submitting ? <><Spinner /> Saving details</> : 'Save and continue'}
      </Button>
    </form>
  )
}
