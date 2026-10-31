import { ChevronLeft, Mail, MailCheck } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

import loginBackground from '@/assets/images/splash-background.webp'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/loading/Spinner'
import { TextField } from '@/components/ui/TextField'
import { routes } from '@/config/routes'
import { authService } from '@/features/auth/services/auth.service'
import { useToast } from '@/hooks/useToast'
import { toApiError } from '@/services/api-error'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Forgot password: submits the registered email to `forgot-password.php`.
 * What the member receives is decided by the server, so the confirmation shows
 * the server's message rather than promising a specific next step.
 */
export function ForgotPasswordPage() {
  const toast = useToast()

  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState<string | null>(null)

  const trimmedEmail = email.trim()
  const showInvalid = trimmedEmail.length > 0 && !EMAIL_PATTERN.test(trimmedEmail)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || !EMAIL_PATTERN.test(trimmedEmail)) return
    setSubmitting(true)

    try {
      setConfirmation(await authService.forgotPassword(trimmedEmail))
    } catch (error) {
      const apiError = toApiError(error)
      toast.error('Could not process your request', { description: apiError.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex flex-1 flex-col px-6 pt-safe pb-safe">
      <img
        src={loginBackground}
        alt=""
        aria-hidden="true"
        decoding="async"
        className="absolute inset-0 size-full object-cover"
      />

      <header className="relative flex h-14 items-center">
        <Link
          to={routes.login}
          aria-label="Back to login"
          className="-ml-2 flex size-9 items-center justify-center rounded-full bg-white/80 text-maroon shadow-sm backdrop-blur-sm transition hover:bg-white"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </Link>
      </header>

      <div className="relative flex flex-1 flex-col justify-end pt-6 pb-8">
        <div className="rounded-3xl border border-white/60 bg-white/85 p-6 shadow-card backdrop-blur-md">
          {confirmation ? (
            <div role="status">
              <span className="flex size-11 items-center justify-center rounded-full bg-rose text-maroon">
                <MailCheck className="size-5" aria-hidden="true" />
              </span>
              <h1 className="mt-4 text-2xl text-maroon">Check your email</h1>
              <p className="mt-1.5 text-sm text-muted">{confirmation}</p>
              <p className="mt-1 text-sm break-words text-ink">{trimmedEmail}</p>

              <Link
                to={routes.login}
                className="mt-6 block text-center text-sm font-semibold text-maroon"
              >
                Back to login
              </Link>
              <button
                type="button"
                onClick={() => setConfirmation(null)}
                className="mt-3 block w-full text-center text-xs text-muted hover:text-maroon"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl text-maroon">Forgot password?</h1>
              <p className="mt-1.5 text-sm text-muted">
                Enter the email registered with your account.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  leadingIcon={<Mail className="size-4" />}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  error={showInvalid ? 'Enter a valid email address' : undefined}
                  required
                />

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  disabled={submitting || !EMAIL_PATTERN.test(trimmedEmail)}
                  leadingIcon={submitting ? <Spinner className="size-4" /> : undefined}
                >
                  {submitting ? 'Submitting…' : 'Continue'}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-muted">
                Remembered your password?{' '}
                <Link to={routes.login} className="font-semibold text-maroon">
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
