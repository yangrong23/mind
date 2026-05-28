import type { LibraryCoverVariant } from "@/lib/product-media"
import { LIBRARY_COVER_PRESETS } from "@/lib/library-cover-presets"
import {
  PUBLIC_KB_CAPABILITY_PRESETS,
  PUBLIC_KB_DISCLAIMER_PRESETS,
  PUBLIC_KB_SKILL_PRESETS,
  newPublicKbSkillId,
  type PublicKbSettings,
} from "@/lib/public-kb-settings"

export type LibraryCreateAiContext = {
  name: string
  description: string
  category: "mine" | "team"
  bindableAgents: { id: number; name: string; description?: string }[]
}

const COVER_KEYWORDS: { keywords: RegExp; variant: LibraryCoverVariant }[] = [
  { keywords: /patent|legal|law|compliance/i, variant: "legal" },
  { keywords: /study|exam|course|learn|education/i, variant: "education" },
  { keywords: /design|brand|ui|ux/i, variant: "design" },
  { keywords: /engineer|code|dev|api|tech/i, variant: "engineering" },
  { keywords: /research|paper|thesis/i, variant: "research" },
  { keywords: /read|book|essay/i, variant: "reading" },
  { keywords: /product|roadmap|pm/i, variant: "product" },
  { keywords: /health|clinical|med/i, variant: "health" },
]

function hashPick<T>(seed: string, items: readonly T[]): T {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return items[Math.abs(h) % items.length]!
}

function inferCoverVariant(name: string, description: string): LibraryCoverVariant {
  const text = `${name} ${description}`
  for (const row of COVER_KEYWORDS) {
    if (row.keywords.test(text)) return row.variant
  }
  return hashPick(name, LIBRARY_COVER_PRESETS).variant
}

function inferDisclaimer(name: string, description: string): string {
  const text = `${name} ${description}`.toLowerCase()
  if (/health|medical|clinical/.test(text)) {
    return PUBLIC_KB_DISCLAIMER_PRESETS.find((p) => p.id === "health")?.text ?? ""
  }
  if (/legal|patent|compliance|law/.test(text)) {
    return PUBLIC_KB_DISCLAIMER_PRESETS.find((p) => p.id === "legal")?.text ?? ""
  }
  if (/exam|course|study|class/.test(text)) {
    return PUBLIC_KB_DISCLAIMER_PRESETS.find((p) => p.id === "education")?.text ?? ""
  }
  return PUBLIC_KB_DISCLAIMER_PRESETS[0]?.text ?? ""
}

function inferCapabilities(name: string, description: string): string[] {
  const text = `${name} ${description}`.toLowerCase()
  const caps: string[] = []
  const add = (c: (typeof PUBLIC_KB_CAPABILITY_PRESETS)[number]) => {
    if (!caps.includes(c) && caps.length < 4) caps.push(c)
  }
  if (/study|exam|course/.test(text)) add("Study mode")
  if (/team|onboard|playbook/.test(text)) add("Onboarding help")
  if (/compliance|legal|policy/.test(text)) add("Compliance lens")
  if (/compare|versus|vs/.test(text)) add("Compare sources")
  if (/brief|exec|summary/.test(text)) add("Executive briefs")
  add("Cited answers")
  if (caps.length < 2) add("Playbook Q&A")
  return caps.slice(0, 4)
}

function inferSkills(name: string, description: string) {
  const text = `${name} ${description}`.toLowerCase()
  const presets = [...PUBLIC_KB_SKILL_PRESETS]
  if (/study|exam/.test(text)) {
    return presets.filter((p) => /study|summarize/i.test(p.label)).slice(0, 2)
  }
  if (/draft|report|brief/.test(text)) {
    return presets.filter((p) => /draft|summarize/i.test(p.label)).slice(0, 2)
  }
  return presets.slice(0, 2)
}

export function generateLibraryDescription(ctx: LibraryCreateAiContext): string {
  const title = ctx.name.trim()
  if (!title) return ""
  if (ctx.category === "team") {
    return `Shared home for “${title}” — teammates upload sources, ask grounded questions, and reuse Studio outputs with citations.`
  }
  return `Personal collection for “${title}” — save uploads, links, and notes; chat with a library-scoped assistant that cites your sources.`
}

export function suggestCoverVariant(name: string, description: string): LibraryCoverVariant {
  return inferCoverVariant(name, description)
}

export function generateAgentProfileFromLibrary(
  ctx: LibraryCreateAiContext,
  current: PublicKbSettings
): PublicKbSettings {
  const title = ctx.name.trim()
  const about = ctx.description.trim() || generateLibraryDescription(ctx)
  const agent =
    ctx.bindableAgents.find((a) => a.id === current.boundAgentId) ?? ctx.bindableAgents[0]
  const displayName = current.displayName.trim() || `${title} assistant`
  const tagline =
    current.tagline.trim() ||
    (ctx.category === "team"
      ? `Grounded Q&A for ${title} — built for your team`
      : `Your AI guide to everything in ${title}`)
  const topicScope =
    current.topicScope.trim() ||
    `This library collects materials about ${title}. ${about} Answers should stay within uploaded sources; say when evidence is missing.`
  const skills =
    current.skills.length > 0
      ? current.skills
      : inferSkills(title, about).map((p) => ({
          id: newPublicKbSkillId(),
          label: p.label,
          instruction: p.instruction,
        }))
  const capabilities =
    current.capabilities.length > 0 ? current.capabilities : inferCapabilities(title, about)
  const starters = mergeStarters(title, current.exampleQuestions, skills)

  return {
    ...current,
    boundAgentId: agent?.id ?? current.boundAgentId,
    boundAgentName: agent?.name ?? current.boundAgentName,
    displayName,
    tagline,
    topicScope,
    skills,
    capabilities,
    exampleQuestions: starters,
    disclaimer: current.disclaimer.trim() || inferDisclaimer(title, about),
    groundingMode: current.groundingMode || "library-only",
    shareFactoryOutputsWithEveryone: current.shareFactoryOutputsWithEveryone,
    updateCadence: current.updateCadence ?? "weekly",
    lastSyncedAt: current.lastSyncedAt,
    isPublic: current.isPublic,
  }
}

function mergeStarters(
  title: string,
  existing: string[],
  skills: { label: string }[]
): string[] {
  const filled = existing.map((q) => q.trim()).filter(Boolean)
  if (filled.length >= 2) return filled.slice(0, 6)
  const skillLabel = skills[0]?.label ?? "sources"
  const suggestions = [
    `What are the key themes across “${title}”?`,
    `Summarize the latest ${skillLabel.toLowerCase()} with citations`,
    `What should I ask first as a newcomer?`,
    `Draft a one-page brief from the densest materials`,
  ]
  const seen = new Set<string>()
  const out: string[] = []
  for (const q of [...filled, ...suggestions]) {
    if (seen.has(q)) continue
    seen.add(q)
    out.push(q)
    if (out.length >= 4) break
  }
  while (out.length < 2) out.push("")
  return out
}

export function polishPlazaListing(
  ctx: LibraryCreateAiContext,
  settings: PublicKbSettings
): PublicKbSettings {
  const base = generateAgentProfileFromLibrary(ctx, settings)
  const caps = base.capabilities.length >= 2 ? base.capabilities : inferCapabilities(ctx.name, ctx.description)
  return {
    ...base,
    isPublic: true,
    capabilities: caps,
    tagline:
      base.tagline.length > 72 ? `${base.tagline.slice(0, 71)}…` : base.tagline,
    lastSyncedAt: new Date().toISOString(),
  }
}

/** Simulated network delay for AI affordances */
export function aiAssistDelay(ms = 520): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
