/** Public knowledge base publishing — web create/edit + plaza */

export type PublicKbAgentSkill = {
  id: string
  label: string
  instruction: string
}

export type PublicKbSettings = {
  /** Owner chose to list this library in the public plaza */
  isPublic: boolean
  /** One-line role shown on library detail */
  agentTagline?: string
  /** 3–4 chips shown to subscribers */
  agentCapabilities?: string[]
  /** Publisher-curated starter questions */
  recommendedQuestions?: string[]
  /** e.g. learning / medical disclaimer */
  disclaimer?: string
  skills: PublicKbAgentSkill[]
  /** Studio / content-factory outputs visible to all signed-in users */
  shareFactoryOutputsWithEveryone: boolean
}

export const DEFAULT_PUBLIC_KB_SETTINGS: PublicKbSettings = {
  isPublic: false,
  skills: [],
  shareFactoryOutputsWithEveryone: true,
}

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
]

export function newPublicKbSkillId() {
  return `skill-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
