import splashBackground from '@/assets/images/splash-background.webp'
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
      className="fixed inset-0 z-50 flex flex-col items-center justify-end overflow-hidden bg-cream px-8 pt-safe pb-24"
      role="status"
      aria-live="polite"
      aria-label="Starting Shivaraj Maratha"
    >
      <img
        src={splashBackground}
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 size-full object-cover"
      />
      {/* Warm brand glow behind the emblem. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 size-[22rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-maroon/15 to-transparent blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-1/2 size-[26rem] -translate-x-1/2 rounded-full bg-gradient-to-t from-rose to-transparent blur-3xl"
      />

      <div className="relative flex flex-col items-center">
        <div className="animate-logo-reveal rounded-full bg-white/80 p-5 shadow-card ring-1 ring-line backdrop-blur-sm">
          <img
            src={logo}
            alt="Shivaraj Maratha"
            width={112}
            height={112}
            className="size-24 object-contain sm:size-28"
          />
        </div>

        {/* Frosted panel keeps the wordmark legible over the photo without
            dimming the whole background. */}
        <div className="mt-6 flex flex-col items-center rounded-3xl border border-white/60 bg-white/85 px-6 py-5 shadow-card backdrop-blur-md">
          <h1 className="text-2xl text-maroon sm:text-3xl">शिवराज मराठा</h1>
          <p className="mt-1 text-xs font-medium tracking-[0.14em] text-maroon/80 uppercase">
            वधू वर सूचक केंद्र
          </p>

          <p className="mt-4 max-w-xs text-center text-sm leading-relaxed text-ink">
            {TAGLINE}
          </p>

          <div className="mt-5 h-1 w-40 overflow-hidden rounded-full bg-rose">
            <div className="h-full w-full origin-left animate-progress rounded-full bg-maroon" />
          </div>
        </div>
      </div>

      <p className="absolute bottom-10 text-2xs tracking-wide text-maroon [text-shadow:0_1px_3px_rgba(255,253,250,0.95)]">
        शिवराज मराठा ® — Since 2013
      </p>
    </div>
  )
}
