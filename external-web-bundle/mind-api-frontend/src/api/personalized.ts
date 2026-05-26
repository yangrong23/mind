import { get, post } from '@/utils/request'

export type ReflectionKind = 'daily_review' | 'ai_insight'
export type ReflectionStatus = 'pending' | 'running' | 'succeeded' | 'failed'

export interface KnowledgeReference {
  id: string
  content: string
  knowledge_id: string
  knowledge_title: string
  knowledge_filename: string
  score: number
}

export interface PersonalizedReflection {
  id: string
  kind: ReflectionKind
  template_id: string
  since_at: string
  until_at: string
  kb_ids: string[]
  title: string
  markdown: string
  summary: string
  word_count: number
  locale: string
  knowledge_references: KnowledgeReference[]
  status: ReflectionStatus
  error_message?: string
  created_at: string
  completed_at?: string
}

export interface PersonalizedTemplate {
  id: string
  kind: ReflectionKind
  is_builtin: boolean
  default_window_days: number
  name: string
  description: string
}

export interface DailyReviewParams {
  template_id?: string
  model_id?: string
}

export interface AIInsightParams {
  template_id?: string
  model_id?: string
  kb_ids?: string[]
  since?: string
  until?: string
}

export function getDailyReview(params: DailyReviewParams = {}) {
  const q = new URLSearchParams()
  if (params.template_id) q.set('template_id', params.template_id)
  if (params.model_id) q.set('model_id', params.model_id)
  const qs = q.toString()
  return get(qs
    ? `/api/v1/users/me/personalized/daily-review?${qs}`
    : '/api/v1/users/me/personalized/daily-review'
  )
}

export function refreshDailyReview(params: DailyReviewParams = {}) {
  return post('/api/v1/users/me/personalized/daily-review/refresh', params)
}

export function getAIInsight(params: AIInsightParams = {}) {
  const q = new URLSearchParams()
  if (params.template_id) q.set('template_id', params.template_id)
  if (params.model_id) q.set('model_id', params.model_id)
  if (params.kb_ids?.length) q.set('kb_ids', params.kb_ids.join(','))
  if (params.since) q.set('since', params.since)
  if (params.until) q.set('until', params.until)
  const qs = q.toString()
  return get(qs
    ? `/api/v1/users/me/personalized/ai-insight?${qs}`
    : '/api/v1/users/me/personalized/ai-insight'
  )
}

export function refreshAIInsight(params: AIInsightParams = {}) {
  const body: Record<string, any> = {}
  if (params.template_id) body.template_id = params.template_id
  if (params.model_id) body.model_id = params.model_id
  if (params.kb_ids?.length) body.kb_ids = params.kb_ids
  if (params.since) body.since = params.since
  if (params.until) body.until = params.until
  return post('/api/v1/users/me/personalized/ai-insight/refresh', body)
}

export function listTemplates(kind?: ReflectionKind) {
  const q = new URLSearchParams()
  if (kind) q.set('kind', kind)
  const qs = q.toString()
  return get(qs
    ? `/api/v1/users/me/personalized/templates?${qs}`
    : '/api/v1/users/me/personalized/templates'
  )
}

export function getReflectionById(id: string) {
  return get(`/api/v1/users/me/personalized/reflections/${id}`)
}
