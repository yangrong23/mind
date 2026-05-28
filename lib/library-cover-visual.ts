import type { LucideIcon } from "lucide-react"
import {
  Archive,
  BookMarked,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  Calculator,
  Car,
  Code2,
  Cpu,
  Feather,
  Gavel,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  Library,
  LineChart,
  Microscope,
  Palette,
  PenLine,
  Scale,
  ScrollText,
  Stamp,
  Stethoscope,
  TrendingUp,
} from "lucide-react"
import type { LibraryCoverVariant } from "@/lib/product-media"

/** Shared premium cover tokens — deep gradients, domain-specific icons */
export type CoverVisualSpec = {
  gradient: string
  glow: string
  icon: LucideIcon
  label: string
  motif: string
}

export const LIBRARY_COVER_VISUALS: Record<LibraryCoverVariant, CoverVisualSpec> = {
  product: {
    gradient: "from-[oklch(0.34_0.04_262)] via-[oklch(0.38_0.07_258)] to-[oklch(0.42_0.09_252)]",
    glow: "from-sky-300/25 via-transparent to-indigo-400/10",
    icon: Building2,
    label: "Product",
    motif: "Roadmaps · Specs",
  },
  study: {
    gradient: "from-[oklch(0.34_0.06_200)] via-[oklch(0.38_0.08_197)] to-[oklch(0.42_0.09_210)]",
    glow: "from-sky-200/28 via-transparent to-teal-200/14",
    icon: GraduationCap,
    label: "Study",
    motif: "Courses · Notes",
  },
  reading: {
    gradient: "from-[oklch(0.30_0.05_290)] via-[oklch(0.34_0.08_285)] to-[oklch(0.38_0.10_280)]",
    glow: "from-violet-200/28 via-transparent to-fuchsia-300/12",
    icon: BookMarked,
    label: "Reading",
    motif: "Sources · Margins",
  },
  engineering: {
    gradient: "from-[oklch(0.28_0.02_260)] via-[oklch(0.32_0.04_258)] to-[oklch(0.36_0.06_255)]",
    glow: "from-slate-300/22 via-transparent to-sky-300/12",
    icon: Code2,
    label: "Engineering",
    motif: "ADRs · Systems",
  },
  design: {
    gradient: "from-[oklch(0.32_0.06_350)] via-[oklch(0.36_0.09_345)] to-[oklch(0.40_0.08_330)]",
    glow: "from-rose-200/25 via-transparent to-amber-200/15",
    icon: Palette,
    label: "Design",
    motif: "Patterns · UX",
  },
  research: {
    gradient: "from-[oklch(0.30_0.05_275)] via-[oklch(0.34_0.08_268)] to-[oklch(0.38_0.09_262)]",
    glow: "from-indigo-200/28 via-transparent to-cyan-200/12",
    icon: Microscope,
    label: "Research",
    motif: "Papers · Methods",
  },
  education: {
    gradient: "from-[oklch(0.32_0.05_250)] via-[oklch(0.36_0.08_245)] to-[oklch(0.40_0.10_240)]",
    glow: "from-sky-200/30 via-transparent to-teal-200/14",
    icon: Library,
    label: "Education",
    motif: "Curriculum · Drills",
  },
  health: {
    gradient: "from-[oklch(0.32_0.06_290)] via-[oklch(0.36_0.08_285)] to-[oklch(0.40_0.09_280)]",
    glow: "from-violet-200/28 via-transparent to-fuchsia-200/12",
    icon: Stethoscope,
    label: "Health",
    motif: "Guidelines · Cases",
  },
  tech: {
    gradient: "from-[oklch(0.32_0.07_200)] via-[oklch(0.38_0.09_197)] to-[oklch(0.44_0.10_210)]",
    glow: "from-cyan-200/30 via-transparent to-sky-200/14",
    icon: BrainCircuit,
    label: "Tech",
    motif: "AI · Infrastructure",
  },
  work: {
    gradient: "from-[oklch(0.30_0.04_265)] via-[oklch(0.34_0.06_260)] to-[oklch(0.38_0.07_255)]",
    glow: "from-slate-200/25 via-transparent to-indigo-200/14",
    icon: BriefcaseBusiness,
    label: "Work",
    motif: "Teams · Delivery",
  },
  finance: {
    gradient: "from-[oklch(0.28_0.04_155)] via-[oklch(0.32_0.06_150)] to-[oklch(0.36_0.07_145)]",
    glow: "from-emerald-200/26 via-transparent to-teal-200/12",
    icon: TrendingUp,
    label: "Finance",
    motif: "Models · Filings",
  },
  legal: {
    gradient: "from-[oklch(0.26_0.02_265)] via-[oklch(0.30_0.03_260)] to-[oklch(0.34_0.04_255)]",
    glow: "from-stone-300/22 via-transparent to-zinc-400/12",
    icon: Gavel,
    label: "Legal",
    motif: "Contracts · Policy",
  },
  humanities: {
    gradient: "from-[oklch(0.30_0.05_45)] via-[oklch(0.34_0.07_40)] to-[oklch(0.38_0.08_35)]",
    glow: "from-amber-200/28 via-transparent to-rose-200/14",
    icon: ScrollText,
    label: "Humanities",
    motif: "Texts · Context",
  },
  lifestyle: {
    gradient: "from-[oklch(0.32_0.05_330)] via-[oklch(0.36_0.07_325)] to-[oklch(0.40_0.08_320)]",
    glow: "from-rose-200/24 via-transparent to-orange-200/14",
    icon: Home,
    label: "Life",
    motif: "Home · Habits",
  },
  default: {
    gradient: "from-[oklch(0.30_0.04_262)] via-[oklch(0.34_0.07_258)] to-[oklch(0.38_0.09_254)]",
    glow: "from-sky-200/28 via-transparent to-indigo-200/12",
    icon: Archive,
    label: "Library",
    motif: "Knowledge base",
  },
}

export function coverVisualForVariant(variant: LibraryCoverVariant): CoverVisualSpec {
  return LIBRARY_COVER_VISUALS[variant] ?? LIBRARY_COVER_VISUALS.default
}

/** Plaza title-mapped themes — same visual language as personal libraries */
export const PLAZA_THEME_VISUAL_PATCH = {
  "history-middle-school": {
    gradient: "from-[oklch(0.32_0.06_55)] via-[oklch(0.36_0.08_50)] to-[oklch(0.40_0.09_45)]",
    glow: "from-amber-200/30 via-transparent to-orange-200/12",
    icon: Landmark,
    motif: "Timeline · Essays",
    shortLabel: "History",
  },
  "math-hs": {
    gradient: "from-[oklch(0.28_0.06_264)] via-[oklch(0.34_0.10_260)] to-[oklch(0.40_0.11_256)]",
    glow: "from-sky-200/32 via-transparent to-indigo-300/14",
    icon: Calculator,
    motif: "Proofs · Drills",
    shortLabel: "Math",
  },
  "elementary-pack": {
    gradient: "from-[oklch(0.34_0.07_70)] via-[oklch(0.38_0.09_65)] to-[oklch(0.42_0.10_60)]",
    glow: "from-amber-100/35 via-transparent to-yellow-200/15",
    icon: PenLine,
    motif: "Print-ready sheets",
    shortLabel: "Primary",
  },
  cardiology: {
    gradient: "from-[oklch(0.30_0.08_25)] via-[oklch(0.34_0.10_20)] to-[oklch(0.38_0.09_15)]",
    glow: "from-rose-200/30 via-transparent to-red-200/14",
    icon: HeartPulse,
    motif: "Guidelines · Cases",
    shortLabel: "Cardiology",
  },
  "llm-production": {
    gradient: "from-[oklch(0.28_0.07_230)] via-[oklch(0.34_0.10_225)] to-[oklch(0.40_0.11_220)]",
    glow: "from-cyan-200/32 via-transparent to-teal-300/14",
    icon: Cpu,
    motif: "RAG · Evals",
    shortLabel: "LLM",
  },
  "pm-casebook": {
    gradient: "from-[oklch(0.30_0.06_290)] via-[oklch(0.34_0.09_285)] to-[oklch(0.38_0.10_280)]",
    glow: "from-violet-200/30 via-transparent to-purple-300/14",
    icon: BriefcaseBusiness,
    motif: "PRD · Retros",
    shortLabel: "Product",
  },
  "finance-a-share": {
    gradient: "from-[oklch(0.28_0.05_155)] via-[oklch(0.32_0.07_150)] to-[oklch(0.36_0.08_145)]",
    glow: "from-emerald-200/28 via-transparent to-teal-200/12",
    icon: LineChart,
    motif: "Statements · Flags",
    shortLabel: "Finance",
  },
  "ev-supply-chain": {
    gradient: "from-[oklch(0.28_0.03_260)] via-[oklch(0.32_0.05_255)] to-[oklch(0.36_0.06_250)]",
    glow: "from-slate-200/26 via-transparent to-zinc-300/12",
    icon: Car,
    motif: "Supply map",
    shortLabel: "EV",
  },
  "civil-code": {
    gradient: "from-[oklch(0.26_0.02_265)] via-[oklch(0.30_0.04_260)] to-[oklch(0.34_0.05_255)]",
    glow: "from-stone-200/24 via-transparent to-zinc-300/12",
    icon: Scale,
    motif: "Contracts · Tort",
    shortLabel: "Law",
  },
  "classical-literature": {
    gradient: "from-[oklch(0.30_0.06_40)] via-[oklch(0.34_0.08_35)] to-[oklch(0.38_0.09_30)]",
    glow: "from-amber-100/30 via-transparent to-rose-200/14",
    icon: Feather,
    motif: "Annotated texts",
    shortLabel: "Literature",
  },
  "home-storage": {
    gradient: "from-[oklch(0.30_0.04_75)] via-[oklch(0.34_0.06_70)] to-[oklch(0.38_0.07_65)]",
    glow: "from-stone-200/26 via-transparent to-amber-200/14",
    icon: Home,
    motif: "Layout · Flow",
    shortLabel: "Home",
  },
  "patent-desk": {
    gradient: "from-[oklch(0.28_0.06_264)] via-[oklch(0.32_0.08_260)] to-[oklch(0.38_0.10_256)]",
    glow: "from-blue-200/30 via-transparent to-indigo-300/14",
    icon: Stamp,
    motif: "Claims · OA",
    shortLabel: "Patents",
  },
} as const
