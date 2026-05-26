/** Public knowledge base publishing — web create/edit + plaza agent profile */

export type PublicKbAgentSkill = {
  id: string
  label: string
  instruction: string
}

export type PublicKbGroundingMode = "library-only" | "library-preferred"

export type PublicKbUpdateCadence = "daily" | "weekly" | "monthly" | "manual"

export type PublicKbSettings = {
  /** Owner chose to list this library in the public plaza */
  isPublic: boolean
  boundAgentId: number | null
  /** Base agent record name (legacy + fallback display name) */
  boundAgentName: string
  /** Public-facing assistant name shown on plaza / chat */
  displayName: string
  /** One-line scenario for plaza cards and detail */
  tagline: string
  /** 3–4 short capability tags */
  capabilities: string[]
  skills: PublicKbAgentSkill[]
  /** 2–4 conversation starters for detail + chat empty state */
  exampleQuestions: string[]
  groundingMode: PublicKbGroundingMode
  disclaimer: string
  /** Studio / content-factory outputs visible to all signed-in users */
  shareFactoryOutputsWithEveryone: boolean
  updateCadence?: PublicKbUpdateCadence
  /** ISO date — drives plaza freshness + chat sync note */
  lastSyncedAt?: string
}

export const DEFAULT_PUBLIC_KB_SETTINGS: PublicKbSettings = {
  isPublic: false,
  boundAgentId: null,
  boundAgentName: "",
  displayName: "",
  tagline: "",
  capabilities: [],
  skills: [],
  exampleQuestions: [],
  groundingMode: "library-only",
  disclaimer: "",
  shareFactoryOutputsWithEveryone: true,
  updateCadence: "weekly",
}

export const PUBLIC_KB_CAPABILITY_PRESETS = [
  "Cited answers",
  "Exam prep",
  "Executive briefs",
  "Study mode",
  "Playbook Q&A",
  "Compliance lens",
  "Onboarding help",
  "Compare sources",
] as const

export const PUBLIC_KB_DISCLAIMER_PRESETS: { id: string; label: string; text: string }[] = [
  {
    id: "general",
    label: "General",
    text: "Answers use this library's sources only and may be incomplete. Verify before acting.",
  },
  {
    id: "education",
    label: "Education",
    text: "Study aid only — not an official exam or institution endorsement.",
  },
  {
    id: "health",
    label: "Health",
    text: "Not medical advice. Consult a qualified professional.",
  },
  {
    id: "legal",
    label: "Legal",
    text: "Not legal advice. Information is drawn from uploaded materials only.",
  },
]

export const PUBLIC_KB_SKILL_PRESETS: { label: string; instruction: string }[] = [
  {
    label: "Summarize sources",
    instruction: "Answer from uploaded sources only; lead with a tight summary and cite filenames.",
  },
  {
    label: "Draft deliverables",
    instruction: "Turn library evidence into reports, briefs, or slide outlines with explicit section headings.",
  },
  {
    label: "Study mode",
    instruction: "Explain concepts for learners; offer flashcard-friendly bullets when asked.",
  },
  {
    label: "Compare & contrast",
    instruction: "When sources disagree, surface both sides with citations before recommending a view.",
  },
]

export function newPublicKbSkillId() {
  return `skill-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function publicAgentDisplayName(settings?: Partial<PublicKbSettings> | null): string {
  if (!settings) return "Library assistant"
  const name = settings.displayName?.trim() || settings.boundAgentName?.trim()
  return name || "Library assistant"
}

export function publicAgentTagline(
  settings?: Partial<PublicKbSettings> | null,
  fallback?: string
): string {
  return settings?.tagline?.trim() || fallback?.trim() || ""
}

export function deriveWhatItCanDo(skills: PublicKbAgentSkill[]): string[] {
  if (skills.length === 0) return []
  return skills.slice(0, 4).map((s) => {
    const label = s.label.trim()
    const hint = s.instruction.trim().split(/[.!?]/)[0]?.trim()
    if (!hint || hint.length < 12) return label
    return `${label} — ${hint.length > 72 ? `${hint.slice(0, 71)}…` : hint}`
  })
}

export function plazaCapabilitySummary(capabilities: string[], max = 2): string {
  return capabilities.filter(Boolean).slice(0, max).join(" · ")
}

/** Short tiles for “What I can do” (skill labels preferred, else capability tags). */
export function plazaAgentCapabilityTiles(settings?: Partial<PublicKbSettings> | null): string[] {
  const skillLabels = (settings?.skills ?? []).map((s) => s.label.trim()).filter(Boolean)
  if (skillLabels.length > 0) return skillLabels.slice(0, 4)
  return (settings?.capabilities ?? []).filter(Boolean).slice(0, 4)
}

export function formatPlazaSourcesLine(contentCount: number): string {
  const n = contentCount > 0 ? contentCount.toLocaleString("en-US") : "0"
  return `${n} sources · cited in every answer`
}

export function formatPlazaFreshness(
  lastSyncedAt?: string,
  lastUpdateLabel?: string
): string | null {
  if (lastUpdateLabel === "Today") return "Updated today"
  if (lastSyncedAt) {
    const d = new Date(lastSyncedAt)
    if (!Number.isNaN(d.getTime())) {
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
      if (diffDays <= 0) return "Updated today"
      if (diffDays === 1) return "Updated yesterday"
      return `Synced ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    }
  }
  if (lastUpdateLabel === "Yesterday") return "Updated yesterday"
  return null
}

export function formatMaterialsSyncedNote(lastSyncedAt?: string): string | null {
  if (!lastSyncedAt) return null
  const d = new Date(lastSyncedAt)
  if (Number.isNaN(d.getTime())) return null
  return `Materials synced · ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
}

export function groundingModeLabel(mode: PublicKbGroundingMode): string {
  return mode === "library-only"
    ? "Answers from this library only"
    : "Library-first, may use general knowledge"
}

export function normalizePublicKbSettings(
  partial?: Partial<PublicKbSettings> | null
): PublicKbSettings {
  if (!partial) return { ...DEFAULT_PUBLIC_KB_SETTINGS }
  const displayName = partial.displayName?.trim() || partial.boundAgentName?.trim() || ""
  return {
    ...DEFAULT_PUBLIC_KB_SETTINGS,
    ...partial,
    displayName,
    boundAgentName: partial.boundAgentName?.trim() || displayName,
    tagline: partial.tagline?.trim() ?? "",
    capabilities: partial.capabilities ?? [],
    skills: partial.skills ?? [],
    exampleQuestions: (partial.exampleQuestions ?? []).map((q) => q.trim()).filter(Boolean),
    disclaimer: partial.disclaimer?.trim() ?? DEFAULT_PUBLIC_KB_SETTINGS.disclaimer,
    groundingMode: partial.groundingMode ?? DEFAULT_PUBLIC_KB_SETTINGS.groundingMode,
  }
}

export function validatePublicKbSettings(settings: PublicKbSettings): string | null {
  if (!settings.isPublic) return null
  if (settings.boundAgentId == null) return "Select an agent to bind."
  if (!publicAgentDisplayName(settings)) return "Add a public assistant name."
  if (!settings.tagline.trim()) return "Add a one-line tagline."
  if (settings.capabilities.filter(Boolean).length < 1) return "Add at least one capability tag."
  if (settings.skills.length < 1 && settings.capabilities.length < 2)
    return "Add at least one skill or two capability tags."
  if (settings.exampleQuestions.length < 2) return "Add at least two example questions."
  if (settings.groundingMode === "library-only" && !settings.disclaimer.trim())
    return "Add a disclaimer for library-only grounding."
  return null
}
