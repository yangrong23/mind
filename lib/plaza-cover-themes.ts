import type { LucideIcon } from "lucide-react"
import {
  Backpack,
  Briefcase,
  Calculator,
  CarFront,
  Cpu,
  Feather,
  HeartPulse,
  Landmark,
  LayoutGrid,
  LineChart,
  Scale,
  Stamp,
} from "lucide-react"

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

export const PLAZA_COVER_THEMES: Record<PlazaCoverThemeId, PlazaCoverTheme> = {
  "history-middle-school": {
    id: "history-middle-school",
    gradient: "from-amber-800 via-amber-700 to-orange-600",
    glow: "from-amber-200/40 to-transparent",
    icon: Landmark,
    motif: "Timeline · Essays",
    shortLabel: "History",
  },
  "math-hs": {
    id: "math-hs",
    gradient: "from-indigo-700 via-blue-600 to-violet-600",
    glow: "from-sky-200/35 to-transparent",
    icon: Calculator,
    motif: "Proofs · Drills",
    shortLabel: "Math",
  },
  "elementary-pack": {
    id: "elementary-pack",
    gradient: "from-orange-500 via-amber-500 to-yellow-400",
    glow: "from-yellow-100/40 to-transparent",
    icon: Backpack,
    motif: "Print-ready sheets",
    shortLabel: "Primary",
  },
  cardiology: {
    id: "cardiology",
    gradient: "from-rose-700 via-red-600 to-rose-500",
    glow: "from-rose-200/35 to-transparent",
    icon: HeartPulse,
    motif: "Guidelines · Cases",
    shortLabel: "Cardiology",
  },
  "llm-production": {
    id: "llm-production",
    gradient: "from-cyan-700 via-teal-600 to-emerald-600",
    glow: "from-cyan-200/35 to-transparent",
    icon: Cpu,
    motif: "RAG · Evals",
    shortLabel: "LLM",
  },
  "pm-casebook": {
    id: "pm-casebook",
    gradient: "from-violet-700 via-purple-600 to-fuchsia-600",
    glow: "from-violet-200/35 to-transparent",
    icon: Briefcase,
    motif: "PRD · Retros",
    shortLabel: "Product",
  },
  "finance-a-share": {
    id: "finance-a-share",
    gradient: "from-emerald-800 via-teal-700 to-cyan-700",
    glow: "from-emerald-200/30 to-transparent",
    icon: LineChart,
    motif: "Statements · Flags",
    shortLabel: "Finance",
  },
  "ev-supply-chain": {
    id: "ev-supply-chain",
    gradient: "from-slate-700 via-zinc-600 to-stone-500",
    glow: "from-slate-200/25 to-transparent",
    icon: CarFront,
    motif: "Supply map",
    shortLabel: "EV",
  },
  "civil-code": {
    id: "civil-code",
    gradient: "from-neutral-800 via-stone-700 to-zinc-600",
    glow: "from-stone-200/25 to-transparent",
    icon: Scale,
    motif: "Contracts · Tort",
    shortLabel: "Law",
  },
  "classical-literature": {
    id: "classical-literature",
    gradient: "from-amber-900 via-red-800 to-rose-700",
    glow: "from-amber-100/30 to-transparent",
    icon: Feather,
    motif: "Annotated texts",
    shortLabel: "Literature",
  },
  "home-storage": {
    id: "home-storage",
    gradient: "from-stone-600 via-stone-500 to-amber-400",
    glow: "from-orange-100/30 to-transparent",
    icon: LayoutGrid,
    motif: "Layout · Flow",
    shortLabel: "Home",
  },
  "patent-desk": {
    id: "patent-desk",
    gradient: "from-blue-900 via-indigo-800 to-violet-800",
    glow: "from-blue-200/30 to-transparent",
    icon: Stamp,
    motif: "Claims · OA",
    shortLabel: "Patents",
  },
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
