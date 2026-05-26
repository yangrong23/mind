import { get, post, put, del } from '@/utils/request'

/**
 * Recordings API client.
 *
 * Recordings are audio files stored via the user/auth service /files endpoint
 * with category="audio". This shape is identical to notes; we just expose a
 * recordings-flavoured surface so view components stay clean.
 */

export interface RecordingFile {
  id: string
  user_id: string
  tenant_id: number
  name: string
  mime_type: string
  size_bytes: number
  category: 'note' | 'audio' | 'attachment'
  checksum?: string
  sync_version: number
  deleted_at?: string | null
  created_at: string
  updated_at: string
  download_url?: string
}

export interface RecordingListResponse {
  data: {
    items: RecordingFile[]
    total: number
    max_version: number
  }
}

export interface InitUploadResponse {
  data: {
    file_id: string
    upload_url?: string
    storage_key?: string
    duplicate?: boolean
    download_url?: string
  }
}

const BASE = '/api/v1/files'

export function listRecordings(opts?: { since?: number; limit?: number; offset?: number }) {
  const params = new URLSearchParams()
  if (opts?.since !== undefined) params.set('since', String(opts.since))
  if (opts?.limit !== undefined) params.set('limit', String(opts.limit))
  if (opts?.offset !== undefined) params.set('offset', String(opts.offset))
  const qs = params.toString()
  return get(`${BASE}${qs ? `?${qs}` : ''}`) as Promise<RecordingListResponse>
}

export function deleteRecording(fileId: string) {
  return del(`${BASE}/${fileId}`) as Promise<{ success: boolean }>
}

export function renameRecording(fileId: string, name: string) {
  return put(`${BASE}/${fileId}`, { name }) as Promise<{ data: RecordingFile }>
}

export function getRecordingDownloadURL(fileId: string) {
  return get(`${BASE}/${fileId}/download-url`) as Promise<{ data: { download_url: string } }>
}

/**
 * Upload an audio recording. Three-step flow:
 *   1) POST /files → presigned upload_url
 *   2) PUT upload_url with file body
 *   3) POST /files/:id/confirm → final RecordingFile
 */
export async function uploadRecording(file: File): Promise<RecordingFile> {
  const init = await (post(BASE, {
    name: file.name,
    mime_type: file.type || 'audio/mpeg',
    size_bytes: file.size,
    category: 'audio',
  }) as Promise<InitUploadResponse>)

  const { upload_url, file_id, duplicate } = init.data
  if (!duplicate && upload_url) {
    await fetch(upload_url, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type || 'audio/mpeg' },
    })
  }

  const confirmed = await (post(`${BASE}/${file_id}/confirm`) as Promise<{ data: RecordingFile }>)
  return confirmed.data
}
