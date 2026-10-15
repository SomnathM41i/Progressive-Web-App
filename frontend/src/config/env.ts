/**
 * Single place where build-time configuration is read.
 *
 * Nothing else in the app should touch `import.meta.env` directly, so that the
 * environment surface stays small and easy to audit.
 */

function readBoolean(value: string | undefined): boolean {
  return value === 'true' || value === '1'
}

function readNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const env = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  apiTimeout: readNumber(import.meta.env.VITE_API_TIMEOUT, 15_000),

  /**
   * Preview of the authenticated experience, driven purely by
   * `VITE_ENABLE_DEV_PREVIEW`.
   *
   * The API collection has not been integrated yet, so there is no real session
   * to restore. When this flag is on we render the dashboard with clearly
   * labelled placeholder data instead of pretending authentication works.
   *
   * It defaults to off (the committed `.env.production` sets it false), so a real
   * release never shows placeholder data. A demo deployment opts in explicitly via
   * `.env.production.local`, which is gitignored.
   */
  devPreview: readBoolean(import.meta.env.VITE_ENABLE_DEV_PREVIEW),
} as const
