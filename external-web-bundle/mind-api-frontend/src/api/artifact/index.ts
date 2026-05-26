import { get, post, del } from '../../utils/request'

export type ArtifactKind = 'html' | 'brief' | 'mindmap' | 'slides' | 'quiz' | 'podcast' | 'ppt' | 'flashcard' | 'audio_overview' | 'infographic' | 'report'

export interface ArtifactSubmitRequest {
  kb_id: string
  kind: ArtifactKind
  title?: string
  params?: Record<string, any>
  source_refs?: Array<{ kind: string; id: string }>
}

export interface Artifact {
  id: string
  tenant_id: number
  kb_id: string
  created_by: string
  kind: string
  title: string
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'cancelled'
  params: string
  source_refs: string
  payload_uri: string
  payload_meta: string
  error_message: string
  created_at: string
  updated_at: string
  completed_at: string | null
  visibility: string
  is_official: boolean
  download_url?: string
}

export function submitArtifact(data: ArtifactSubmitRequest) {
  return post('/api/v1/artifacts', data)
}

export function listArtifacts(params: { kb_id?: string; limit?: number; offset?: number }) {
  const query = new URLSearchParams()
  if (params.kb_id) query.set('kb_id', params.kb_id)
  if (params.limit) query.set('limit', String(params.limit))
  if (params.offset) query.set('offset', String(params.offset))
  const qs = query.toString()
  return get(qs ? `/api/v1/artifacts?${qs}` : '/api/v1/artifacts')
}

export function getArtifact(id: string) {
  return get(`/api/v1/artifacts/${id}`)
}

export function cancelArtifact(id: string) {
  return del(`/api/v1/artifacts/${id}`)
}

export function downloadArtifactUrl(id: string): string {
  return `/api/v1/artifacts/${id}/download`
}

// audio_overview 专用：换取一个 5 分钟有效的 HMAC 签名 URL，
// 可直接挂到 <audio :src>（浏览器原生 GET 不会带 Authorization header，
// 因此必须用 token 而不是走鉴权接口）。
export interface ArtifactStreamToken {
  token: string
  url: string
  expires_at: number
}

export function issueArtifactStreamToken(id: string): Promise<ArtifactStreamToken> {
  return post(`/api/v1/artifacts/${id}/stream-token`, {}) as unknown as Promise<ArtifactStreamToken>
}
