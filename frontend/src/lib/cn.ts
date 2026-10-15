/**
 * Tiny class-name joiner.
 *
 * The app rarely needs conditional classes and never needs conflict resolution,
 * so a dependency-free helper is enough.
 */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}
