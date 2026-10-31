import { api } from '@/services/api'
import { ApiError } from '@/services/api-error'

export const DOCUMENT_TYPE_OPTIONS = [
  { value: '', label: 'Select document type' },
  { value: '0', label: 'Salary slip' },
  { value: '1', label: 'Income tax return (ITR)' },
  { value: '2', label: 'Graduation certificate' },
  { value: '3', label: 'Post-graduation certificate' },
  { value: '4', label: 'Other degree or certificate' },
] as const

export type DocumentType = (typeof DOCUMENT_TYPE_OPTIONS)[number]['value']

interface UploadEnvelope {
  status?: unknown
  message?: unknown
  Message?: unknown
  msg?: unknown
}

export interface UploadOutcome {
  message: string | null
}

function isFailure(status: unknown): boolean {
  if (status === 0 || status === false) return true
  if (typeof status !== 'string') return false
  return ['error', 'failed', 'fail', '0'].includes(status.trim().toLowerCase())
}

function readMessage(body: UploadEnvelope): string | null {
  for (const value of [body.message, body.Message, body.msg]) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

export const HOROSCOPE_FILE_TYPES = ['pdf', 'image/']

export function validateFile(file: File, allowed: string[]): void {
  if (file.size === 0) {
    throw new ApiError({ message: 'This file is empty. Please choose another file.' })
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ApiError({ message: 'File is too large. Maximum size is 5 MB.' })
  }
  if (allowed.length) {
    const type = file.type.toLowerCase()
    const name = file.name.toLowerCase()
    const ok = allowed.some((ext) => type.includes(ext) || name.endsWith(ext))
    if (!ok) {
      throw new ApiError({ message: 'Unsupported file type. Please upload a valid file.' })
    }
  }
}

async function upload(
  path: string,
  matriId: string,
  fileKey: string,
  file: File,
  fallbackMessage: string,
  extra: Record<string, string> = {},
  allowed: string[] = [],
): Promise<UploadOutcome> {
  validateFile(file, allowed)

  const form = new FormData()
  form.append('MatriID', matriId)
  for (const [key, value] of Object.entries(extra)) form.append(key, value)
  form.append(fileKey, file)

  try {
    const { data } = await api.post<UploadEnvelope>(path, form, { timeout: 60000 })
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new ApiError({ message: 'The server returned an unexpected response.' })
    }
    if (isFailure(data.status)) {
      throw new ApiError({ message: readMessage(data) ?? fallbackMessage })
    }
    return { message: readMessage(data) }
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && (error as any).code === 'ECONNABORTED') {
      throw new ApiError({ message: 'Upload timed out. Please try again with a smaller file or better connection.' })
    }
    throw error
  }
}

export const profileUploadService = {
  uploadProfilePhoto: (matriId: string, file: File) =>
    upload(
      '/upload-profile.php',
      matriId,
      'profile',
      file,
      'Could not upload your profile photo.',
      {},
      ['image/'],
    ),
  uploadGalleryPhoto: (matriId: string, file: File) =>
    upload(
      '/upload-photos-gallery.php',
      matriId,
      'photos',
      file,
      'Could not upload your gallery photo.',
      {},
      ['image/'],
    ),
  uploadBiodata: (matriId: string, file: File) =>
    upload(
      '/upload-biodata.php',
      matriId,
      'biodata',
      file,
      'Could not upload your biodata.',
      {},
      ['pdf', 'image/'],
    ),
  uploadDocument: (matriId: string, docType: DocumentType, file: File) =>
    upload(
      '/upload-document.php',
      matriId,
      'uploaded_file',
      file,
      'Could not upload your document.',
      { doc_type: docType },
      ['pdf', 'image/'],
    ),
}
