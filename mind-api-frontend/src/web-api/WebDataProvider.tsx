import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  platformSettingsPath,
  type PlatformSettingsSection,
} from '@/lib/platform-settings-sections'
import {
  createKnowledgeBase,
  deleteKnowledgeBase,
  listKnowledgeBases,
  updateKnowledgeBase,
} from '@/api/knowledge-base'
import { listAgents } from '@/api/agent'
import { listNotes, type NoteFile } from '@/api/notes'
import type { KnowledgeBase } from '@/lib/mock-knowledge-bases'
import type { Agent } from '@/components/mind-v2/agent-tab'
import type { WebCreateKbPayload } from '@/components/mind-v2/web-create-kb-dialog'
import { apiKbIdFromNumeric, numericKbIdFromApiId } from './kb-id'
import { mapApiAgent, mapApiKnowledgeBase } from './mappers'

export type WebDataContextValue = {
  knowledgeBases: KnowledgeBase[]
  knowledgeBasesLoading: boolean
  refreshKnowledgeBases: () => Promise<void>
  createKnowledgeBaseFromWeb: (payload: WebCreateKbPayload) => Promise<KnowledgeBase | null>
  updateKnowledgeBaseMeta: (numericId: number, payload: WebCreateKbPayload) => Promise<void>
  deleteKnowledgeBaseById: (numericId: number) => Promise<void>
  agents: Agent[]
  agentsLoading: boolean
  refreshAgents: () => Promise<void>
  notes: NoteFile[]
  notesLoading: boolean
  refreshNotes: () => Promise<void>
  openSystemSettings: (section?: PlatformSettingsSection) => void
  openKnowledgeBaseSettings: (numericKbId: number) => void
}

const WebDataContext = createContext<WebDataContextValue | null>(null)

export function useWebData(): WebDataContextValue {
  const ctx = useContext(WebDataContext)
  if (!ctx) throw new Error('useWebData must be used within WebDataProvider')
  return ctx
}

export function WebDataProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [knowledgeBasesLoading, setKnowledgeBasesLoading] = useState(true)
  const [agents, setAgents] = useState<Agent[]>([])
  const [agentsLoading, setAgentsLoading] = useState(true)
  const [notes, setNotes] = useState<NoteFile[]>([])
  const [notesLoading, setNotesLoading] = useState(true)

  const refreshKnowledgeBases = useCallback(async () => {
    setKnowledgeBasesLoading(true)
    try {
      const res: { success?: boolean; data?: unknown[] } = await listKnowledgeBases()
      const rows = Array.isArray(res?.data) ? res.data : []
      setKnowledgeBases(rows.map((row) => mapApiKnowledgeBase(row as Parameters<typeof mapApiKnowledgeBase>[0])))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load libraries')
      setKnowledgeBases([])
    } finally {
      setKnowledgeBasesLoading(false)
    }
  }, [])

  const refreshAgents = useCallback(async () => {
    setAgentsLoading(true)
    try {
      const res = await listAgents()
      const rows = res?.data ?? []
      setAgents(rows.map((a, i) => mapApiAgent(a, i)))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load agents')
      setAgents([])
    } finally {
      setAgentsLoading(false)
    }
  }, [])

  const refreshNotes = useCallback(async () => {
    setNotesLoading(true)
    try {
      const res = await listNotes({ limit: 200 })
      setNotes(res?.data?.items ?? [])
    } catch {
      setNotes([])
    } finally {
      setNotesLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshKnowledgeBases()
    void refreshAgents()
    void refreshNotes()
  }, [refreshKnowledgeBases, refreshAgents, refreshNotes])

  const createKnowledgeBaseFromWeb = useCallback(
    async (payload: WebCreateKbPayload): Promise<KnowledgeBase | null> => {
      try {
        const res: { success?: boolean; data?: { id: string } } = await createKnowledgeBase({
          name: payload.name,
          description: payload.description,
          type: 'document',
        })
        if (!res?.data?.id) {
          toast.error('Create library failed')
          return null
        }
        const numericId = numericKbIdFromApiId(res.data.id)
        const listRes: { data?: unknown[] } = await listKnowledgeBases()
        const rows = Array.isArray(listRes?.data) ? listRes.data : []
        const mapped = rows.map((row) =>
          mapApiKnowledgeBase(row as Parameters<typeof mapApiKnowledgeBase>[0])
        )
        setKnowledgeBases(mapped)
        const created = mapped.find((k) => k.id === numericId)
        if (created) return created
        return {
          id: numericId,
          name: payload.name,
          description: payload.description,
          category: payload.category,
          count: 0,
          lastUpdate: 'Just now',
          color: 'from-teal-500/80 to-violet-500/70',
          coverVariant: payload.coverVariant,
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Create library failed')
        return null
      }
    },
    [refreshKnowledgeBases]
  )

  const updateKnowledgeBaseMeta = useCallback(
    async (numericId: number, payload: WebCreateKbPayload) => {
      const apiId = apiKbIdFromNumeric(numericId)
      if (!apiId) return
      try {
        await updateKnowledgeBase(apiId, {
          name: payload.name,
          description: payload.description,
        })
        await refreshKnowledgeBases()
        toast.success('Library updated')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Update failed')
      }
    },
    [refreshKnowledgeBases]
  )

  const deleteKnowledgeBaseById = useCallback(
    async (numericId: number) => {
      const apiId = apiKbIdFromNumeric(numericId)
      if (!apiId) return
      try {
        await deleteKnowledgeBase(apiId)
        await refreshKnowledgeBases()
        toast.success('Library deleted')
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Delete failed')
      }
    },
    [refreshKnowledgeBases]
  )

  const openSystemSettings = useCallback(
    (section: PlatformSettingsSection = 'general') => {
      navigate(platformSettingsPath(section))
    },
    [navigate]
  )

  const openKnowledgeBaseSettings = useCallback((numericKbId: number) => {
    const apiId = apiKbIdFromNumeric(numericKbId)
    if (!apiId) return
    window.location.assign(`/platform/knowledge-bases/${apiId}`)
  }, [])

  const value = useMemo<WebDataContextValue>(
    () => ({
      knowledgeBases,
      knowledgeBasesLoading,
      refreshKnowledgeBases,
      createKnowledgeBaseFromWeb,
      updateKnowledgeBaseMeta,
      deleteKnowledgeBaseById,
      agents,
      agentsLoading,
      refreshAgents,
      notes,
      notesLoading,
      refreshNotes,
      openSystemSettings,
      openKnowledgeBaseSettings,
    }),
    [
      knowledgeBases,
      knowledgeBasesLoading,
      refreshKnowledgeBases,
      createKnowledgeBaseFromWeb,
      updateKnowledgeBaseMeta,
      deleteKnowledgeBaseById,
      agents,
      agentsLoading,
      refreshAgents,
      notes,
      notesLoading,
      refreshNotes,
      openSystemSettings,
      openKnowledgeBaseSettings,
    ]
  )

  return <WebDataContext.Provider value={value}>{children}</WebDataContext.Provider>
}
