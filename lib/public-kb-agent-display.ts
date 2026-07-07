import { MINDER_COPILOT_PROFILE } from "@/lib/mind-agent-catalog"
import type { PublicKbSettings } from "@/lib/public-kb-settings"

export type PublicKbAgentDisplay = {
  agentId: number | null
  name: string
  avatar: string
  color: string
  tagline: string
  /** Short intro — shown on entry cards, not the library title. */
  greetingLine: string
  /** Muted trust line, e.g. source count — never the full KB name. */
  contextMeta: string
  capabilities: string[]
  recommendedQuestions: string[]
  disclaimer?: string
  strengthDetail?: string
  groundingLabel: string
}

function buildContextMeta(sourceCount?: number): string {
  if (sourceCount != null && sourceCount > 0) {
    const label = sourceCount === 1 ? "source" : "sources"
    return `${sourceCount} ${label} · cited in every answer`
  }
  return "Cited sources in every answer"
}

/** Public KB chat entry — always the subscriber's Mindar, library-scoped. */
export function resolvePublicKbAgentDisplay(
  settings?: PublicKbSettings | null,
  sourceCount?: number
): PublicKbAgentDisplay | null {
  if (!settings?.isPublic) return null

  const capabilities =
    settings.agentCapabilities?.length
      ? settings.agentCapabilities
      : settings.skills.length > 0
        ? settings.skills.map((s) => s.label).slice(0, 4)
        : MINDER_COPILOT_PROFILE.capabilities

  const tagline =
    settings.agentTagline?.trim() ||
    "Your Mindar · grounded on this library"

  const greetingLine =
    settings.skills[0]?.instruction?.trim().slice(0, 120) ||
    "Ask anything about this library — replies cite sources and run on your account."

  return {
    agentId: 0,
    name: "Mindar",
    avatar: "🧠",
    color: "from-zinc-500 to-stone-600",
    tagline,
    greetingLine,
    contextMeta: buildContextMeta(sourceCount),
    capabilities,
    recommendedQuestions: settings.recommendedQuestions ?? [],
    disclaimer: settings.disclaimer,
    strengthDetail: MINDER_COPILOT_PROFILE.strengthDetail,
    groundingLabel: "Your agent · your billing · answers only from this library's sources.",
  }
}
