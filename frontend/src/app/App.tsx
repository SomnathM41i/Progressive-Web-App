import { StartupError } from '@/app/StartupError'
import { SplashScreen } from '@/components/loading/SplashScreen'
import { useAppInitialization } from '@/hooks/useAppInitialization'
import { AppRouter } from '@/app/router'
import { OfflineBanner } from '@/components/feedback/OfflineBanner'

/**
 * Top-level application composition.
 *
 * The splash is rendered while the startup lifecycle runs. Once initialisation
 * is complete the router takes over. Startup failures are surfaced explicitly
 * rather than silently falling through to the UI.
 */
export function App() {
  const { status, error, retry } = useAppInitialization()

  if (status === 'initializing') {
    return <SplashScreen />
  }

  if (status === 'failed' && error) {
    return <StartupError message={error.message} onRetry={retry} />
  }

  return (
    <>
      <OfflineBanner />
      <AppRouter />
    </>
  )
}
