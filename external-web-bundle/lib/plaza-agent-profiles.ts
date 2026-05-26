import {
  DEFAULT_PUBLIC_KB_SETTINGS,
  normalizePublicKbSettings,
  newPublicKbSkillId,
  type PublicKbSettings,
} from "@/lib/public-kb-settings"
import type { PlazaLibraryRow } from "@/lib/mock-plaza-libraries"

const PUBLIC_KB_SKILL_PRESETS_FALLBACK = [
  {
    label: "Summarize sources",
    instruction: "Answer from uploaded sources only; lead with a tight summary and cite filenames.",
  },
]

/** Demo agent profiles keyed by plaza kbId */
const PLAZA_AGENT_BY_KB: Record<number, Partial<PublicKbSettings>> = {
  101: {
    boundAgentId: 201,
    boundAgentName: "Research Partner",
    displayName: "History Exam Coach",
    tagline: "Timelines, essays, and common mistakes for exam prep",
    capabilities: ["Exam prep", "Cited answers", "Study mode"],
    exampleQuestions: [
      "Build a timeline of causes leading to World War I from this library",
      "What essay structures work best for document-based questions?",
      "List the top five mistakes students make on short-answer history items",
    ],
    skills: [
      {
        id: "s1",
        label: "Study mode",
        instruction: "Explain concepts for learners; offer flashcard-friendly bullets when asked.",
      },
      {
        id: "s2",
        label: "Summarize sources",
        instruction: "Answer from uploaded sources only; lead with a tight summary and cite filenames.",
      },
    ],
    disclaimer: "Study aid only — not an official exam or institution endorsement.",
    shareFactoryOutputsWithEveryone: true,
    updateCadence: "daily",
    lastSyncedAt: new Date().toISOString(),
  },
  102: {
    boundAgentId: 201,
    displayName: "Math Quick Ref",
    tagline: "Functions, calculus, and geometry with drills",
    capabilities: ["Exam prep", "Compare sources", "Study mode"],
    exampleQuestions: [
      "Summarize key limit rules with one example each",
      "Which geometry proofs appear most often in this library?",
      "Generate five practice questions on derivatives",
    ],
    skills: [
      {
        id: "s1",
        label: "Study mode",
        instruction: "Explain step-by-step with practice drills grounded in library sheets.",
      },
    ],
    disclaimer: "Study aid only — not an official exam or institution endorsement.",
    lastSyncedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  112: {
    boundAgentId: 201,
    displayName: "Patent Desk",
    tagline: "Drafting tips, office actions, and claim mapping",
    capabilities: ["Compliance lens", "Cited answers", "Compare sources"],
    exampleQuestions: [
      "Map independent claims to specification paragraphs with a feature table",
      "Draft response angles for the latest office action using only sources here",
      "Build a prior-art comparison table for the closest references cited",
    ],
    skills: [
      {
        id: "s1",
        label: "Draft deliverables",
        instruction: "Turn library evidence into prosecution-ready briefs with explicit headings.",
      },
      {
        id: "s2",
        label: "Compare & contrast",
        instruction: "When sources disagree, surface both sides with citations.",
      },
    ],
    disclaimer: "Not legal advice. Information is drawn from uploaded materials only.",
    groundingMode: "library-only",
    shareFactoryOutputsWithEveryone: true,
    updateCadence: "weekly",
    lastSyncedAt: new Date().toISOString(),
  },
}

export function publicSettingsForPlazaRow(row: PlazaLibraryRow): PublicKbSettings {
  const seed = PLAZA_AGENT_BY_KB[row.kbId]
  const tagline = seed?.tagline || row.publicTagline || row.description.slice(0, 80)
  return normalizePublicKbSettings({
    ...DEFAULT_PUBLIC_KB_SETTINGS,
    isPublic: true,
    boundAgentId: seed?.boundAgentId ?? 201,
    boundAgentName: seed?.boundAgentName ?? "Research Partner",
    displayName: seed?.displayName ?? `${row.title} Assistant`,
    tagline,
    capabilities: seed?.capabilities ?? ["Cited answers", "Library Q&A"],
    skills:
      seed?.skills ??
      PUBLIC_KB_SKILL_PRESETS_FALLBACK.map((p) => ({
        id: newPublicKbSkillId(),
        ...p,
      })),
    exampleQuestions:
      seed?.exampleQuestions ??
      [
        `Summarize "${row.title}" in five bullets with citations`,
        "What should a newcomer read first in this library?",
      ],
    disclaimer:
      seed?.disclaimer ??
      "Answers use this library's sources only and may be incomplete. Verify before acting.",
    groundingMode: seed?.groundingMode ?? "library-only",
    shareFactoryOutputsWithEveryone: seed?.shareFactoryOutputsWithEveryone ?? true,
    updateCadence: seed?.updateCadence ?? "weekly",
    lastSyncedAt:
      seed?.lastSyncedAt ??
      (row.lastUpdate === "Today" ? new Date().toISOString() : undefined),
  })
}
