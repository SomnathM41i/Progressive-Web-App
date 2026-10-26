import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/loading/Spinner'
import { SelectField } from '@/components/ui/SelectField'
import { TextField } from '@/components/ui/TextField'
import { Card } from '@/components/ui/Card'
import { DEFAULT_NRI_TYPE } from '@/features/registration/constants'
import { useRegistration } from '@/features/registration/hooks/useRegistration'
import { masterDataService } from '@/features/registration/services/master-data.service'
import type { MasterOption } from '@/features/registration/services/master-data.service'
import { registrationService } from '@/features/registration/services/registration.service'
import {
  nextRegistrationStep,
  registrationStepPath,
} from '@/features/registration/steps'
import type { NriDetails } from '@/features/registration/types'
import { useToast } from '@/hooks/useToast'
import { toApiError } from '@/services/api-error'

const NRI_TYPE_OPTIONS = ['NRI', 'OCI', 'PIO', 'Foreign Citizen'].map((value) => ({
  value,
  label: value,
}))

const RESIDENCY_STATUS_OPTIONS = ['Resident', 'Non-Resident'].map((value) => ({
  value,
  label: value,
}))

const VISA_TYPE_OPTIONS = [
  'Work Visa',
  'Student Visa',
  'Dependent Visa',
  'Business Visa',
  'Other',
  'Not Applicable',
].map((value) => ({ value, label: value }))

const RELOCATE_OPTIONS = ['Yes', 'No', 'Depends'].map((value) => ({
  value,
  label: value,
}))

const SETTLEMENT_OPTIONS = ['India', 'Abroad', 'Undecided'].map((value) => ({
  value,
  label: value,
}))

interface NriFormState {
  nri_type: string
  nri_citizenship: string
  nri_current_country: string
  nri_current_state: string
  nri_current_city: string
  nri_residency_status: string
  nri_visa_type: string
  nri_visa_expiry: string
  nri_years_abroad: string
  nri_overseas_mobile: string
  nri_income_currency: string
  nri_willing_to_relocate: string
  nri_settlement_preference: string
  nri_native_place: string
  nri_preferred_country: string
}

const initialState: NriFormState = {
  nri_type: DEFAULT_NRI_TYPE,
  nri_citizenship: '',
  nri_current_country: '',
  nri_current_state: '',
  nri_current_city: '',
  nri_residency_status: '',
  nri_visa_type: '',
  nri_visa_expiry: '',
  nri_years_abroad: '',
  nri_overseas_mobile: '',
  nri_income_currency: '',
  nri_willing_to_relocate: '',
  nri_settlement_preference: '',
  nri_native_place: '',
  nri_preferred_country: '',
}

export function NriStepPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { matriId, profileLocationType, draft, saveSection } = useRegistration()

  const [form, setForm] = useState<NriFormState>(() => ({
    ...initialState,
    ...draft.sections.nri,
  }))
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [countries, setCountries] = useState<MasterOption[]>([])

  useEffect(() => {
    let active = true
    masterDataService
      .countries()
      .then((options) => {
        if (active) setCountries(options)
      })
      .catch(() => {
        if (active) setCountries([])
      })

    return () => {
      active = false
    }
  }, [])

  function update<K extends keyof NriFormState>(key: K, value: NriFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!form.nri_citizenship.trim()) next.nri_citizenship = 'Enter citizenship'
    if (!form.nri_current_country.trim()) next.nri_current_country = 'Select country'
    if (!form.nri_residency_status.trim())
      next.nri_residency_status = 'Select residency status'
    if (!form.nri_visa_type.trim()) next.nri_visa_type = 'Select visa type'
    if (
      form.nri_visa_type &&
      form.nri_visa_type !== 'Not Applicable' &&
      !form.nri_visa_expiry.trim()
    ) {
      next.nri_visa_expiry = 'Enter visa expiry'
    }
    if (!form.nri_willing_to_relocate.trim())
      next.nri_willing_to_relocate = 'Select an option'
    if (!form.nri_settlement_preference.trim()) {
      next.nri_settlement_preference = 'Select settlement preference'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!matriId) {
      toast.error('Missing profile ID')
      return
    }
    if (!validate()) {
      toast.error('Please fix the highlighted fields')
      return
    }

    setSubmitting(true)

    const payload: NriDetails = {
      MatriID: matriId,
      nri_type: form.nri_type || DEFAULT_NRI_TYPE,
      nri_citizenship: form.nri_citizenship.trim(),
      nri_current_country: form.nri_current_country.trim(),
      nri_current_state: form.nri_current_state.trim(),
      nri_current_city: form.nri_current_city.trim(),
      nri_residency_status: form.nri_residency_status.trim(),
      nri_visa_type: form.nri_visa_type.trim(),
      nri_visa_expiry: form.nri_visa_expiry.trim(),
      nri_years_abroad: form.nri_years_abroad.trim(),
      nri_overseas_mobile: form.nri_overseas_mobile.trim(),
      nri_income_currency: form.nri_income_currency.trim(),
      nri_willing_to_relocate: form.nri_willing_to_relocate.trim(),
      nri_settlement_preference: form.nri_settlement_preference.trim(),
      nri_native_place: form.nri_native_place.trim(),
      nri_preferred_country: form.nri_preferred_country.trim(),
    }

    try {
      const result = await registrationService.submitNriDetails(payload)
      saveSection('nri', payload)
      toast.success('NRI details saved', { description: result.message || undefined })
      const next = nextRegistrationStep('nri', profileLocationType)
      void navigate(next ? registrationStepPath(next) : '/register/review', {
        replace: true,
      })
    } catch (error) {
      const apiError = toApiError(error)
      toast.error('Could not save NRI details', { description: apiError.message })
    } finally {
      setSubmitting(false)
    }
  }

  const countryOptions = countries.map((country) => ({
    value: country.label.replace(/\s*\([^)]*\)\s*$/, ''),
    label: country.label,
  }))

  return (
    <form className="flex flex-1 flex-col pb-6" onSubmit={handleSubmit} noValidate>
      <div className="space-y-5">
        <Card className="space-y-4">
          <h2 className="text-base font-semibold text-maroon">Overseas details</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="NRI type"
              value={form.nri_type}
              onChange={(event) => update('nri_type', event.target.value)}
              options={NRI_TYPE_OPTIONS}
              required
            />
            <TextField
              label="Citizenship"
              value={form.nri_citizenship}
              onChange={(event) => update('nri_citizenship', event.target.value)}
              error={errors.nri_citizenship}
              required
            />
            <SelectField
              label="Current country"
              value={form.nri_current_country}
              onChange={(event) => update('nri_current_country', event.target.value)}
              options={countryOptions}
              error={errors.nri_current_country}
              placeholder="Select country"
              required
            />
            <TextField
              label="Current state"
              value={form.nri_current_state}
              onChange={(event) => update('nri_current_state', event.target.value)}
            />
            <TextField
              label="Current city"
              value={form.nri_current_city}
              onChange={(event) => update('nri_current_city', event.target.value)}
            />
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-base font-semibold text-maroon">Visa and residency</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Residency status"
              value={form.nri_residency_status}
              onChange={(event) => update('nri_residency_status', event.target.value)}
              options={RESIDENCY_STATUS_OPTIONS}
              error={errors.nri_residency_status}
              placeholder="Select residency status"
              required
            />
            <SelectField
              label="Visa type"
              value={form.nri_visa_type}
              onChange={(event) => update('nri_visa_type', event.target.value)}
              options={VISA_TYPE_OPTIONS}
              error={errors.nri_visa_type}
              placeholder="Select visa type"
              required
            />
            <TextField
              label="Visa expiry"
              value={form.nri_visa_expiry}
              onChange={(event) => update('nri_visa_expiry', event.target.value)}
              error={errors.nri_visa_expiry}
              placeholder="YYYY-MM-DD"
              disabled={form.nri_visa_type === 'Not Applicable'}
            />
            <TextField
              label="Years abroad"
              value={form.nri_years_abroad}
              onChange={(event) =>
                update(
                  'nri_years_abroad',
                  event.target.value.replace(/\D/g, '').slice(0, 2),
                )
              }
              inputMode="numeric"
            />
            <TextField
              label="Overseas mobile"
              value={form.nri_overseas_mobile}
              onChange={(event) => update('nri_overseas_mobile', event.target.value)}
              placeholder="+971501234567"
            />
            <TextField
              label="Income currency"
              value={form.nri_income_currency}
              onChange={(event) => update('nri_income_currency', event.target.value)}
              placeholder="AED"
            />
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-base font-semibold text-maroon">Preference</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Willing to relocate"
              value={form.nri_willing_to_relocate}
              onChange={(event) =>
                update('nri_willing_to_relocate', event.target.value)
              }
              options={RELOCATE_OPTIONS}
              error={errors.nri_willing_to_relocate}
              placeholder="Select an option"
              required
            />
            <SelectField
              label="Settlement preference"
              value={form.nri_settlement_preference}
              onChange={(event) =>
                update('nri_settlement_preference', event.target.value)
              }
              options={SETTLEMENT_OPTIONS}
              error={errors.nri_settlement_preference}
              placeholder="Select preference"
              required
            />
            <TextField
              label="Native place"
              value={form.nri_native_place}
              onChange={(event) => update('nri_native_place', event.target.value)}
            />
            <SelectField
              label="Preferred country"
              value={form.nri_preferred_country}
              onChange={(event) => update('nri_preferred_country', event.target.value)}
              options={countryOptions}
              placeholder="Select country"
            />
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={submitting}
          leadingIcon={submitting ? <Spinner className="size-4" /> : undefined}
        >
          {submitting ? 'Saving…' : 'Save and continue'}
        </Button>
      </div>
    </form>
  )
}
