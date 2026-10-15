import { FlaskConical } from 'lucide-react'

/**
 * Marks any screen whose content comes from the development preview module
 * rather than the API. Keeping this visible is what stops placeholder data from
 * being mistaken for real member data.
 */
export function PreviewNotice() {
  return (
    <div
      role="note"
      className="flex items-center gap-2 rounded-md border border-dashed border-gold/40 bg-gold/8 px-3 py-2 text-2xs text-gold"
    >
      <FlaskConical className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="font-semibold">
        Development preview — the data below is sample data; the API is not connected.
      </span>
    </div>
  )
}
