import type { Agent } from "@/components/mind-v2/agent-tab"
import { getMindAgentCatalog } from "@/lib/mind-agent-catalog"
import {
  formatMaterialsSyncedNote,
  publicAgentDisplayName,
  publicAgentTagline,
  type PublicKbSettings,
} from "@/lib/public-kb-settings"

export function agentFromPublicKbSettings(
  settings: PublicKbSettings | null | undefined,
  libraryName: string
): Agent {
  const catalog = settings?.boundAgentId != null ? getMindAgentCatalog(settings.boundAgentId) : undefined
  const displayName = publicAgentDisplayName(settings)
  const tagline = publicAgentTagline(settings, libraryName)
  return {
    id: settings?.boundAgentId ?? 999,
    name: displayName,
    description: tagline || `Scoped to “${libraryName}”`,
    avatar: catalog?.avatar ?? "✦",
    color: catalog?.color ?? "from-teal-500/90 to-violet-500/80",
    profile: catalog?.profile,
  }
}

export type LibraryAssistantChatMeta = {
  displayName: string
  tagline: string
  disclaimer: string
  exampleQuestions: string[]
  syncNote?: string | null
}

export function libraryAssistantChatMeta(
  settings: PublicKbSettings | null | undefined,
  libraryName: string
): LibraryAssistantChatMeta {
  return {
    displayName: publicAgentDisplayName(settings),
    tagline: publicAgentTagline(settings, libraryName),
    disclaimer: settings?.disclaimer?.trim() ?? "",
    exampleQuestions: settings?.exampleQuestions ?? [],
    syncNote: formatMaterialsSyncedNote(settings?.lastSyncedAt),
  }
}
