import type { LucideIcon } from "lucide-react"
import { PLAZA_THEME_VISUAL_PATCH } from "@/lib/library-cover-visual"

/** Title-specific plaza cover — strong correlation with library subject */
export type PlazaCoverThemeId =
  | "history-middle-school"
  | "math-hs"
  | "elementary-pack"
  | "cardiology"
  | "llm-production"
  | "pm-casebook"
  | "finance-a-share"
  | "ev-supply-chain"
  | "civil-code"
  | "classical-literature"
  | "home-storage"
  | "patent-desk"

export type PlazaCoverTheme = {
  id: PlazaCoverThemeId
  gradient: string
  glow: string
  icon: LucideIcon
  motif: string
  shortLabel: string
}

function theme(id: PlazaCoverThemeId): PlazaCoverTheme {
  const patch = PLAZA_THEME_VISUAL_PATCH[id]
  return { id, ...patch }
}

export const PLAZA_COVER_THEMES: Record<PlazaCoverThemeId, PlazaCoverTheme> = {
  "history-middle-school": theme("history-middle-school"),
  "math-hs": theme("math-hs"),
  "elementary-pack": theme("elementary-pack"),
  cardiology: theme("cardiology"),
  "llm-production": theme("llm-production"),
  "pm-casebook": theme("pm-casebook"),
  "finance-a-share": theme("finance-a-share"),
  "ev-supply-chain": theme("ev-supply-chain"),
  "civil-code": theme("civil-code"),
  "classical-literature": theme("classical-literature"),
  "home-storage": theme("home-storage"),
  "patent-desk": theme("patent-desk"),
}

export const PLAZA_COVER_THEME_BY_KB: Record<number, PlazaCoverThemeId> = {
  101: "history-middle-school",
  102: "math-hs",
  103: "elementary-pack",
  104: "cardiology",
  105: "llm-production",
  106: "pm-casebook",
  107: "finance-a-share",
  108: "ev-supply-chain",
  109: "civil-code",
  110: "classical-literature",
  111: "home-storage",
  112: "patent-desk",
}

export function plazaCoverThemeForKb(kbId: number): PlazaCoverThemeId | undefined {
  return PLAZA_COVER_THEME_BY_KB[kbId]
}
