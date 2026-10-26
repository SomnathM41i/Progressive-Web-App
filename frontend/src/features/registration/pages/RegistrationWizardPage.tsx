import { ChevronLeft } from 'lucide-react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'

import { PageLoader } from '@/components/loading/PageLoader'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { routes } from '@/config/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { RegistrationProvider } from '@/features/registration/context/RegistrationProvider'
import { useRegistration } from '@/features/registration/hooks/useRegistration'
import { AccountStepPage } from '@/features/registration/pages/AccountStepPage'
import { NriStepPage } from '@/features/registration/pages/NriStepPage'
import { BasicStepPage } from '@/features/registration/pages/BasicStepPage'
import { RegistrationReviewPage, SectionStepPage } from '@/features/registration/pages/SectionStepPage'
import {
  isRegistrationStep,
  nextRegistrationStep,
  previousRegistrationStep,
  registrationStepMeta,
  registrationStepPath,
  registrationStepProgress,
  registrationStepsFor,
} from '@/features/registration/steps'

export function RegistrationWizardPage() {
  return (
    <RegistrationProvider>
      <RegistrationWizard />
    </RegistrationProvider>
  )
}

function RegistrationWizard() {
  const { step: rawStep } = useParams()
  const location = useLocation()
  const { status } = useAuth()
  const { matriId, profileLocationType } = useRegistration()

  if (status === 'unknown') {
    return <PageLoader label="Checking your account…" />
  }

  if (!isRegistrationStep(rawStep)) {
    return <Navigate to={registrationStepPath('account')} replace />
  }

  const step = rawStep
  const steps = registrationStepsFor(profileLocationType)
  const meta = registrationStepMeta(step)

  if (!steps.includes(step)) {
    return <Navigate to={registrationStepPath('basic')} replace />
  }

  if (step === 'account' && status === 'authenticated') {
    if (!matriId) return <Navigate to={routes.home} replace />
    const next = nextRegistrationStep(step, profileLocationType)
    return <Navigate to={registrationStepPath(next ?? 'review')} replace />
  }

  if (step !== 'account') {
    if (status === 'unauthenticated') {
      return <Navigate to={routes.login} replace state={{ from: location.pathname }} />
    }

    if (!matriId) {
      return <Navigate to={routes.home} replace />
    }
  }

  const stepIndex = steps.indexOf(step)
  const previous = previousRegistrationStep(step, profileLocationType)
  const backPath =
    step === 'account'
      ? routes.welcome
      : previous
        ? registrationStepPath(previous)
        : routes.welcome

  return (
    <div className="flex flex-1 flex-col px-6 pt-safe pb-safe">
      <header className="flex h-14 shrink-0 items-center justify-between">
        <Link
          to={backPath}
          aria-label="Back"
          className="-ml-2 flex size-9 items-center justify-center rounded-full text-maroon transition hover:bg-rose"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </Link>
        <span className="text-xs font-medium text-muted">
          Step {stepIndex + 1} of {steps.length}
        </span>
      </header>

      <div className="mt-2">
        <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">
          Registration
        </p>
        <h1 className="mt-1 text-2xl text-maroon">{meta.title}</h1>
        <p className="mt-1.5 text-sm text-muted">{meta.description}</p>
        <ProgressBar
          value={registrationStepProgress(step, profileLocationType)}
          label={`Registration progress: ${meta.title}`}
          className="mt-4"
        />
      </div>

      <div className="mt-6 flex flex-1 flex-col pb-8">
        {step === 'account' ? (
          <AccountStepPage />
        ) : step === 'nri' ? (
          <NriStepPage />
        ) : step === 'basic' ? (
          <BasicStepPage />
        ) : step === 'review' ? (
          <RegistrationReviewPage />
        ) : step === 'contact' || step === 'education' || step === 'family' || step === 'horoscope' || step === 'partner' ? (
          <SectionStepPage section={step} />
        ) : (
          <Card className="flex flex-col items-center px-6 py-10 text-center">
            <Badge tone="brand">Step {stepIndex + 1}</Badge>
            <h2 className="mt-3 text-lg text-maroon">{meta.title}</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
              This step is not available yet. Your registration progress is saved in
              this browser for the current session.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
