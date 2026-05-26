import type { KnowledgeBase, KBCategory } from '@/lib/mock-knowledge-bases'
import { libraryCoverVariantForId } from '@/lib/product-media'
import type { Agent } from '@/components/mind-v2/agent-tab'
import { apiKbIdFromNumeric, numericKbIdFromApiId } from './kb-id'

type ApiKnowledgeBase = {
  id: string
  name?: string
  description?: string
  updated_at?: string
  knowledge_count?: number
  chunk_count?: number
  is_shared?: boolean
  organization_id?: string
  type?: string
  is_processing?: boolean
}

function formatRelativeUpdate(iso?: string): string {
  if (!iso) return 'Recently'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'Recently'
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 2) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString()
}

function inferCategory(kb: ApiKnowledgeBase): KBCategory {
  if (kb.is_shared || kb.organization_id) return 'team'
  return 'mine'
}

export function mapApiKnowledgeBase(kb: ApiKnowledgeBase): KnowledgeBase {
  const numericId = numericKbIdFromApiId(kb.id)
  const name = kb.name || 'Untitled library'
  const count = kb.knowledge_count ?? kb.chunk_count ?? 0
  return {
    id: numericId,
    name,
    description: kb.description || '',
    category: inferCategory(kb),
    count,
    lastUpdate: formatRelativeUpdate(kb.updated_at),
    color: 'from-teal-500/80 to-violet-500/70',
    coverVariant: libraryCoverVariantForId(numericId, name),
  }
}

type ApiAgent = {
  id: string
  name?: string
  description?: string
  avatar?: string
  is_builtin?: boolean
}

const AGENT_COLORS = [
  'from-teal-500/90 to-cyan-600/80',
  'from-violet-500/90 to-fuchsia-600/80',
  'from-amber-500/90 to-orange-600/80',
  'from-emerald-500/90 to-teal-600/80',
]

export function mapApiAgent(agent: ApiAgent, index: number): Agent {
  const numericId = numericKbIdFromApiId(agent.id)
  return {
    id: numericId,
    name: agent.name || 'Agent',
    description: agent.description || '',
    avatar: agent.avatar || '🤖',
    color: AGENT_COLORS[index % AGENT_COLORS.length],
    isOfficial: Boolean(agent.is_builtin),
  }
}

export function apiAgentIdFromUiAgentId(uiId: number): string | undefined {
  return apiKbIdFromNumeric(uiId)
}
