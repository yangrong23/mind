import { get, post, put, del } from '@/utils/request'

/**
 * Notes API client.
 *
 * Notes are stored as files in the user/auth service via the /files endpoint
 * with category="note". This file wraps that REST API with a notes-shaped
 * interface so view components can stay focused on UX.
 */

export interface NoteFile {
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

export interface NoteListResponse {
  data: {
    items: NoteFile[]
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

export const NOTES_BASE = '/api/v1/files'

export function listNotes(opts?: { since?: number; limit?: number; offset?: number }) {
  const params = new URLSearchParams()
  if (opts?.since !== undefined) params.set('since', String(opts.since))
  if (opts?.limit !== undefined) params.set('limit', String(opts.limit))
  if (opts?.offset !== undefined) params.set('offset', String(opts.offset))
  const qs = params.toString()
  return get(`${NOTES_BASE}${qs ? `?${qs}` : ''}`) as Promise<NoteListResponse>
}

export function initUploadNote(payload: {
  name: string
  mime_type: string
  size_bytes: number
  category?: 'note' | 'audio' | 'attachment'
  checksum?: string
}) {
  return post(NOTES_BASE, { category: 'note', ...payload }) as Promise<InitUploadResponse>
}

export function confirmUpload(fileId: string) {
  return post(`${NOTES_BASE}/${fileId}/confirm`) as Promise<{ data: NoteFile }>
}

export function getNoteDownloadURL(fileId: string) {
  return get(`${NOTES_BASE}/${fileId}/download-url`) as Promise<{ data: { download_url: string } }>
}

export function renameNote(fileId: string, name: string) {
  return put(`${NOTES_BASE}/${fileId}`, { name }) as Promise<{ data: NoteFile }>
}

export function deleteNote(fileId: string) {
  return del(`${NOTES_BASE}/${fileId}`) as Promise<{ success: boolean }>
}

/**
 * Save a markdown note. The auth service uses presigned-URL S3 uploads:
 *   1) POST /files → { file_id, upload_url, storage_key }
 *   2) PUT upload_url with the file body
 *   3) POST /files/:id/confirm → returns the persisted UserFile
 *
 * This helper performs all three steps and returns the final NoteFile.
 */
export async function createMarkdownNote(name: string, markdown: string): Promise<NoteFile> {
  const blob = new Blob([markdown], { type: 'text/markdown' })
  const init = await initUploadNote({
    name: name.endsWith('.md') ? name : `${name}.md`,
    mime_type: 'text/markdown',
    size_bytes: blob.size,
    category: 'note',
  })

  const { upload_url, file_id, duplicate } = init.data
  if (!duplicate && upload_url) {
    await fetch(upload_url, {
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': 'text/markdown' },
    })
  }

  const confirmed = await confirmUpload(file_id)
  return confirmed.data
}

export async function fetchNoteContent(file: NoteFile): Promise<string> {
  let url = file.download_url
  if (!url) {
    const resp = await getNoteDownloadURL(file.id)
    url = resp.data.download_url
  }
  if (!url) throw new Error('No download URL available')
  const r = await fetch(url)
  return r.text()
}
