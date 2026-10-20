import { useCallback, useState } from 'react'

/**
 * Device-level record of interests this member has sent.
 *
 * The legacy API has no confirmed "interest status" field on profile reads, so
 * after `send-interest.php` succeeds the target id is remembered in
 * localStorage (keyed by the member's MatriID, same device-storage idea as the
 * shortlist). Profile pages then show a disabled "Interest sent" instead of
 * offering the same request again.
 *
 * This is a UX guard, not server truth: another device still starts fresh.
 */

const STORAGE_PREFIX = 'svr.sent-interests.'

function readSent(memberId: string): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + memberId)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : []
  } catch {
    return []
  }
}

function writeSent(memberId: string, ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + memberId, JSON.stringify(ids))
  } catch {
    // Storage full or unavailable — the record is best-effort only.
  }
}

export interface SentInterests {
  /** True when an interest to `targetId` was already sent from this device. */
  hasSent: (targetId: string) => boolean
  /** Records a successful send so later visits keep the sent state. */
  markSent: (targetId: string) => void
}

export function useSentInterests(memberId: string | undefined): SentInterests {
  const [snapshot, setSnapshot] = useState(() => ({
    memberId,
    ids: memberId ? readSent(memberId) : [],
  }))

  // Re-read when the signed-in member changes. Adjusting state during render
  // is React's endorsed alternative to a synchronizing effect here.
  if (snapshot.memberId !== memberId) {
    setSnapshot({ memberId, ids: memberId ? readSent(memberId) : [] })
  }

  const markSent = useCallback(
    (targetId: string) => {
      if (!memberId) return
      setSnapshot((prev) => {
        const base = prev.memberId === memberId ? prev.ids : readSent(memberId)
        if (prev.memberId === memberId && base.includes(targetId)) return prev
        const next = [...base, targetId]
        writeSent(memberId, next)
        return { memberId, ids: next }
      })
    },
    [memberId],
  )

  const hasSent = useCallback(
    (targetId: string) => snapshot.ids.includes(targetId),
    [snapshot.ids],
  )

  return { hasSent, markSent }
}
