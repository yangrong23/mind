import type { Agent } from "@/components/mind-v2/agent-tab"
import type { AgentCapabilityProfile } from "@/lib/mind-agent-catalog"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"

export type CustomAgentRecord = Agent & {
  linkedKbIds: number[]
  systemPrompt?: string
  createdAt: number
}

export function customAgentFromForm(payload: {
  name: string
  persona: string
  linkedKbIds: number[]
  id: number
}): CustomAgentRecord {
  const name = payload.name.trim() || "Custom assistant"
  const profile: AgentCapabilityProfile = {
    tagline: payload.persona.trim().slice(0, 72) || "Your instructions shape every reply",
    capabilities: ["Custom persona", "Save threads", "@ Link in chat"],
  }
  return {
    id: payload.id,
    name,
    description: payload.persona.trim() || "Custom assistant",
    avatar: "✨",
    color: "from-violet-400 to-indigo-600",
    profile,
    linkedKbIds: [],
    systemPrompt: payload.persona.trim(),
    createdAt: Date.now(),
  }
}

export type AgentContactSection = {
  id: string
  title: string
  subtitle?: string
  contacts: AgentContactRow[]
}

export type AgentContactRow = Agent & {
  preview: string
  timeLabel?: string
  linkedKbIds?: number[]
  isCustom?: boolean
}

export function buildAgentContactSections(
  mindar: Agent,
  mindarProfile: AgentCapabilityProfile,
  defaultAgents: Agent[],
  _allKnowledgeBases: KnowledgeBase[],
  customAgents: CustomAgentRecord[]
): AgentContactSection[] {
  const sections: AgentContactSection[] = []

  sections.push({
    id: "mindar",
    title: "",
    contacts: [
      {
        ...mindar,
        profile: mindarProfile,
        preview: mindarProfile.tagline,
        timeLabel: "Now",
        linkedKbIds: [],
      },
    ],
  })

  const assistants: AgentContactRow[] = [
    ...customAgents.map((a) => ({
      ...a,
      preview: a.profile?.tagline ?? a.description,
      linkedKbIds: [],
      isCustom: true,
    })),
    ...defaultAgents.map((a, i) => {
      const catalogPreview =
        "contactPreview" in a && typeof (a as { contactPreview?: string }).contactPreview === "string"
          ? (a as { contactPreview: string }).contactPreview
          : undefined
      return {
        ...a,
        preview: catalogPreview ?? a.profile?.tagline ?? a.description,
        timeLabel: (["Yesterday", "Mon", "Sun", "Fri", "Thu"] as const)[i],
        linkedKbIds: [],
      }
    }),
  ]

  sections.push({
    id: "assistants",
    title: "My assistants",
    subtitle: "Optional personas — link libraries with @ in chat",
    contacts: assistants,
  })

  return sections
}
