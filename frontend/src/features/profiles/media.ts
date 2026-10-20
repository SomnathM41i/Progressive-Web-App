/**
 * Media URL resolution for the profile section.
 *
 * The legacy API returns relative paths (for example `/gallary/....jpg`) that
 * are only meaningful against the API's own origin. Anything returned to the UI
 * must therefore be resolved to an absolute URL before an `<img>` or download
 * link can use it.
 */

const MEDIA_BASE_URL = 'https://shivrajmaratha.com'

/**
 * Turns a relative media path into an absolute URL.
 *
 * - Absolute `http(s)` URLs are returned unchanged.
 * - Protocol-relative URLs (`//cdn…`) inherit the page's protocol.
 * - Root-relative paths (`/...`) are prefixed with the media origin.
 * - Bare paths (`gallary/x.jpg`) get a separating slash.
 * - Empty, missing or whitespace-only values return `null` so callers render a
 *   placeholder rather than a broken image.
 */
export function resolveMediaUrl(path: string | null | undefined): string | null {
  const value = path?.trim()
  if (!value) return null
  if (value.startsWith('//')) return `${window.location.protocol}${value}`
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  if (value.startsWith('/')) return `${MEDIA_BASE_URL}${value}`
  return `${MEDIA_BASE_URL}/${value}`
}
