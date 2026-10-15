import logo from '@/assets/images/shivraj-logo.png'

const TAGLINE = 'योग्य नात्यांची विश्वासार्ह सुरुवात'

/**
 * Branded startup screen shown while the application initialises.
 *
 * It is a full-screen composition rather than a bare spinner: the logo reveals,
 * the wordmark settles and a slim progress bar fills. All motion is CSS driven
 * and collapses automatically under `prefers-reduced-motion`.
 */
export function SplashScreen() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-cream px-8"
      role="status"
      aria-live="polite"
      aria-label="Starting Shivaraj Maratha"
    >
      {/* Warm brand glow behind the emblem. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 size-[22rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-gold/25 to-transparent blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-1/2 size-[26rem] -translate-x-1/2 rounded-full bg-gradient-to-t from-saffron/15 to-transparent blur-3xl"
      />

      <div className="relative flex flex-col items-center">
        <div className="animate-logo-reveal rounded-full bg-white/70 p-5 shadow-card ring-1 ring-gold/25">
          <img
            src={logo}
            alt="Shivaraj Maratha"
            width={112}
            height={112}
            className="size-24 object-contain sm:size-28"
          />
        </div>

        <h1 className="mt-6 text-2xl text-maroon sm:text-3xl">शिवराज मराठा</h1>
        <p className="mt-1 text-xs font-medium tracking-[0.14em] text-gold uppercase">
          वधू वर सूचक केंद्र
        </p>

        <p className="mt-6 max-w-xs text-center text-sm leading-relaxed text-muted">
          {TAGLINE}
        </p>

        <div className="mt-10 h-1 w-40 overflow-hidden rounded-full bg-maroon/10">
          <div className="h-full w-full origin-left animate-progress rounded-full bg-gradient-to-r from-saffron to-gold" />
        </div>
      </div>

      <p className="absolute bottom-10 text-2xs tracking-wide text-muted/70">
        शिवराज मराठा ® — Since 2013
      </p>
    </div>
  )
}
