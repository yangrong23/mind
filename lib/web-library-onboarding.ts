import {
  MOCK_PLAZA_LIBRARIES,
  type PlazaCategoryId,
  type PlazaLibraryRow,
} from "@/lib/mock-plaza-libraries"

export const ONBOARDING_STORAGE_KEY = "mind-v2-onboarding-complete"
export const PENDING_ONBOARDING_SESSION_KEY = "mind-v2-pending-onboarding"

export type OnboardingGoalId = "study" | "work" | "research" | "personal"

export type OnboardingTopicId =
  | "tech"
  | "education"
  | "workplace"
  | "finance"
  | "health"
  | "law"
  | "life"

export type OnboardingGoalOption = {
  id: OnboardingGoalId
  label: string
  hint: string
  categories: PlazaCategoryId[]
}

export type OnboardingTopicOption = {
  id: OnboardingTopicId
  label: string
  category: PlazaCategoryId
}

export const ONBOARDING_GOAL_OPTIONS: OnboardingGoalOption[] = [
  {
    id: "study",
    label: "Study & exams",
    hint: "Courses, revision, and structured notes",
    categories: ["education", "humanities"],
  },
  {
    id: "work",
    label: "Work & strategy",
    hint: "Product, ops, and team knowledge",
    categories: ["workplace", "tech", "finance"],
  },
  {
    id: "research",
    label: "Research & analysis",
    hint: "Papers, market intel, and synthesis",
    categories: ["industry", "tech", "law"],
  },
  {
    id: "personal",
    label: "Personal learning",
    hint: "Reading lists and lifelong topics",
    categories: ["life", "humanities", "health"],
  },
]

export const ONBOARDING_TOPIC_OPTIONS: OnboardingTopicOption[] = [
  { id: "tech", label: "Technology", category: "tech" },
  { id: "education", label: "Education", category: "education" },
  { id: "workplace", label: "Business & work", category: "workplace" },
  { id: "finance", label: "Finance", category: "finance" },
  { id: "health", label: "Health", category: "health" },
  { id: "law", label: "Law & policy", category: "law" },
  { id: "life", label: "Life & creativity", category: "life" },
]

export function readOnboardingComplete(): boolean {
  if (typeof window === "undefined") return false
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

export function writeOnboardingComplete() {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "1")
  } catch {
    /* ignore */
  }
}

export function recommendPlazaLibraries(
  goal: OnboardingGoalId,
  topics: OnboardingTopicId[],
  limit = 3
): PlazaLibraryRow[] {
  const goalCats =
    ONBOARDING_GOAL_OPTIONS.find((g) => g.id === goal)?.categories ?? (["recommended"] as PlazaCategoryId[])
  const topicCats = topics
    .map((t) => ONBOARDING_TOPIC_OPTIONS.find((o) => o.id === t)?.category)
    .filter((c): c is PlazaCategoryId => Boolean(c))

  const weights = new Map<PlazaCategoryId, number>()
  for (const c of goalCats) weights.set(c, (weights.get(c) ?? 0) + 2)
  for (const c of topicCats) weights.set(c, (weights.get(c) ?? 0) + 3)

  const scored = MOCK_PLAZA_LIBRARIES.map((row) => {
    let score = 0
    for (const cat of row.plazaCategories) {
      score += weights.get(cat) ?? 0
    }
    if (row.featured) score += 1
    if (row.plazaCategories.includes("recommended")) score += 0.5
    return { row, score }
  })

  const picked: PlazaLibraryRow[] = []
  const seen = new Set<number>()
  for (const { row } of [...scored].sort((a, b) => b.score - a.score)) {
    if (picked.length >= limit) break
    if (seen.has(row.kbId)) continue
    seen.add(row.kbId)
    picked.push(row)
  }

  if (picked.length < limit) {
    for (const row of MOCK_PLAZA_LIBRARIES) {
      if (picked.length >= limit) break
      if (seen.has(row.kbId)) continue
      seen.add(row.kbId)
      picked.push(row)
    }
  }

  return picked
}
