/** Demo presets for the create-assistant flow — name, persona, library bundles. */

export const ASSISTANT_NAME_SUGGESTIONS = [
  "Research aide",
  "Meeting recap",
  "Course companion",
  "Product strategist",
  "Writing coach",
] as const

export const ASSISTANT_PERSONA_TEMPLATES: { id: string; label: string; text: string }[] = [
  {
    id: "research",
    label: "Research",
    text: "Synthesize PDFs and notes into briefs with citations. Prefer bullet summaries, flag gaps, and never invent sources outside linked libraries.",
  },
  {
    id: "meetings",
    label: "Meetings",
    text: "Extract decisions, owners, and deadlines from recordings. Write concise follow-ups and highlight open questions.",
  },
  {
    id: "study",
    label: "Study",
    text: "Explain concepts step-by-step, build review outlines, and quiz me from course materials only.",
  },
  {
    id: "writing",
    label: "Writing",
    text: "Polish drafts while preserving my voice. Suggest structure first, then line edits grounded in linked sources.",
  },
]

export const ASSISTANT_LIBRARY_BUNDLES: {
  id: string
  label: string
  description: string
  kbNamePatterns: string[]
}[] = [
  {
    id: "product",
    label: "Product stack",
    description: "PRDs, research, and team notes",
    kbNamePatterns: ["Product", "Team", "Research"],
  },
  {
    id: "learning",
    label: "Learning pack",
    description: "Courseware and study notes",
    kbNamePatterns: ["Study", "Education", "Course"],
  },
  {
    id: "all-mine",
    label: "All mine",
    description: "Every personal library you own",
    kbNamePatterns: ["mine"],
  },
]

export function aiSuggestAssistantName(seed?: string): string {
  const pool = [...ASSISTANT_NAME_SUGGESTIONS]
  if (seed?.trim()) {
    const topic = seed.trim().split(/\s+/).slice(0, 2).join(" ")
    return `${topic} aide`
  }
  return pool[Math.floor(Math.random() * pool.length)]
}

export function aiSuggestAssistantPersona(name: string): string {
  const n = name.toLowerCase()
  if (n.includes("research") || n.includes("product")) return ASSISTANT_PERSONA_TEMPLATES[0].text
  if (n.includes("meeting") || n.includes("recap")) return ASSISTANT_PERSONA_TEMPLATES[1].text
  if (n.includes("study") || n.includes("course")) return ASSISTANT_PERSONA_TEMPLATES[2].text
  if (n.includes("writ") || n.includes("coach")) return ASSISTANT_PERSONA_TEMPLATES[3].text
  return `You are ${name.trim() || "a Mindar assistant"}. Answer only from linked libraries, cite sources, and keep replies actionable.`
}
