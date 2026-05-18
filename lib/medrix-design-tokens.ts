/**
 * Medrix Mind — one canonical blue (`mind` / --mind-blue). Only opacity & color-mix vary.
 */

import { cn } from "@/lib/utils"

/** Tailwind `mind` @ 100% — do not use sky-* or other blues in product UI */
export const MIND_BLUE_OKLCH = "oklch(0.588 0.158 241.966)"

const FACTORY_MIND_TONE = {
  well: "bg-mind/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
  icon: "text-mind",
  sparkle: "text-mind",
  pillOn: "border-mind/25 bg-mind/8 text-mind",
  cardOn: "border-mind/25 bg-mind/8",
  check: "text-mind",
  styleCardOn: "border-mind/30 bg-mind/10 ring-1 ring-mind/15",
  fieldFocus: "focus:border-mind/30 focus:outline-none focus:ring-1 focus:ring-mind/20",
  softHover: "hover:border-mind/20 hover:bg-mind/6",
} as const

/** Neutral page surfaces — no blue wash on tab backgrounds */
const PAGE_BG = "bg-white dark:bg-zinc-950"

export const mx = {
  pageBg: PAGE_BG,

  shellCanvas: PAGE_BG,
  shellSurface: "bg-white/90 dark:bg-zinc-900/95",
  shellHairline: "border-stone-200/85 dark:border-zinc-700/90",
  shellInk: "text-zinc-900 dark:text-zinc-100",
  shellInkSecondary: "text-zinc-600 dark:text-zinc-300",
  shellMuted: "text-zinc-500 dark:text-zinc-400",
  shellIcon: "text-zinc-400 dark:text-zinc-500",
  shellCard:
    "rounded-2xl border border-stone-200/70 bg-white shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_8px_28px_-16px_rgba(15,23,42,0.08)] dark:border-zinc-700 dark:bg-zinc-900/80",
  shellPillInactive: "bg-stone-100/90 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",

  brandHero: "bg-gradient-to-b from-stone-50/90 via-white to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950",
  brandHeroBorder: "border-b border-stone-200/85 dark:border-zinc-800",

  brandOnHero: "text-zinc-900",
  brandOnHeroMuted: "text-zinc-500",
  brandAccentOnHero: "text-mind",

  brandAvatarBg: "bg-gradient-to-br from-stone-200 to-stone-300",
  brandHeroHover: "hover:bg-stone-100/90 dark:hover:bg-zinc-800/60",

  accentBlue: "text-mind",
  accentBlueHover: "hover:text-mind/90",
  accentBlueMuted: "text-mind/90",
  accentBlueBg: "bg-mind",
  accentBlueSoft: "bg-mind/8",

  accentPersonalAvatar: "bg-mind text-white",
  accentPersonalSoft: "bg-mind/8",
  accentPersonalRing: "ring-2 ring-mind/20",

  accentWorkSoft: "bg-mind/8",
  accentWorkIcon: "text-mind",

  brandAccent: "text-mind",
  brandAccentHover: "hover:text-mind/90",
  brandAccentMuted: "text-mind/90",
  brandMutedBg: "bg-stone-100",
  brandMutedBgHover: "hover:bg-stone-200/85",
  brandSubtleBorder: "border-stone-200",

  surfaceTint: "bg-stone-50 dark:bg-zinc-900/92",
  surfaceTintHover: "hover:bg-stone-100/90 dark:hover:bg-zinc-800/70",
  settingsIconWell: "bg-stone-100 dark:bg-zinc-800",
  settingsIconInk: "text-zinc-600 dark:text-zinc-300",
  toggleTrackOff: "bg-stone-200 dark:bg-zinc-600",
  studioQuotaBanner:
    "rounded-2xl border border-stone-200/90 bg-stone-50/95 p-4 shadow-sm shadow-stone-900/[0.04] dark:border-zinc-700 dark:bg-zinc-900/90",

  brandCta:
    "bg-mind text-white hover:bg-mind/90 active:bg-mind/85 shadow-sm shadow-mind/20 border border-mind/30",
  brandCtaSoft: "bg-mind/8 text-mind border border-mind/15 hover:bg-mind/12",

  brandFocusRing: "focus-visible:ring-2 focus-visible:ring-mind/35 focus-visible:ring-offset-2",

  settingsOnHero: "bg-white/70 hover:bg-white border border-mind/15 shadow-sm shadow-mind/5",

  citationLink: "text-mind hover:text-mind/90",
  citationMuted: "text-zinc-500",
  citationSubtleBg: "bg-stone-50",
  citationBorder: "border border-stone-200/90",

  libraryCta: "bg-mind text-white hover:bg-mind/90 border border-mind/30 shadow-sm shadow-mind/15",
  libraryCtaSoft: "bg-mind/8 text-mind border border-mind/15 hover:bg-mind/12",

  warningDot: "bg-zinc-600",
  warningText: "text-zinc-900",

  commercePopularBadge: "text-zinc-600 bg-stone-100",
  commercePopularRing: "border-stone-200 ring-1 ring-stone-300/25",
  commercePrimaryCta: "bg-zinc-900 text-white hover:bg-zinc-800",
  commerceSecondaryCta: "bg-zinc-800 text-white hover:bg-zinc-900",

  creditsCard: "bg-white border border-stone-200/90 border-l-[3px] border-l-mind",
  creditsProgressTrack: "bg-stone-200",
  creditsProgressFill: "bg-mind",

  navIconNotes: "text-zinc-600",
  navIconLibrary: "text-zinc-700",
  navIconInsight: "text-zinc-600",

  navActiveWell: "bg-mind/10",
  navActiveIcon: "text-mind",
  navActiveLabel: "text-mind",

  /** Soft sky bloom — bottom nav active tab & Notes record control */
  navBloomOuter:
    "pointer-events-none absolute -inset-[10px] rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(56,189,248,0.26)_0%,rgba(125,211,252,0.1)_38%,transparent_68%)] dark:bg-[radial-gradient(circle_at_50%_45%,rgba(56,189,248,0.2)_0%,rgba(2,132,199,0.08)_40%,transparent_70%)]",
  navBloomInner:
    "pointer-events-none absolute -inset-px rounded-2xl bg-[radial-gradient(ellipse_100%_95%_at_50%_8%,rgba(255,255,255,0.92)_0%,rgba(186,230,253,0.42)_32%,rgba(125,211,252,0.14)_58%,transparent_78%)] dark:bg-[radial-gradient(ellipse_100%_95%_at_50%_12%,rgba(56,189,248,0.32)_0%,rgba(2,132,199,0.12)_45%,transparent_74%)]",
  navIconGlow:
    "text-mind drop-shadow-[0_0_10px_rgba(56,189,248,0.55),0_0_22px_rgba(125,211,252,0.35)] dark:text-mind/90 dark:drop-shadow-[0_0_12px_rgba(56,189,248,0.45),0_0_28px_rgba(2,132,199,0.2)]",
  navGlassShell:
    "bg-white/65 shadow-[0_-6px_28px_-10px_rgba(15,23,42,0.1),0_8px_28px_-14px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:bg-zinc-900/55 dark:shadow-[0_-8px_32px_-12px_rgba(0,0,0,0.35)]",
  navEase: "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",

  factoryTone: {
    report: FACTORY_MIND_TONE,
    audio: FACTORY_MIND_TONE,
    flashcards: FACTORY_MIND_TONE,
    quiz: FACTORY_MIND_TONE,
    infographic: FACTORY_MIND_TONE,
    slides: FACTORY_MIND_TONE,
  } as const,

  knowledgeAskPill:
    "border border-mind/20 bg-mind/8 text-mind shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] hover:border-mind/25 hover:bg-mind/12",
  knowledgeAskSparkle: "text-mind",

  studioJobShell: [
    "bg-mind/8 shadow-sm shadow-mind/5 dark:bg-mind/15 dark:shadow-black/20",
    "bg-mind/8 shadow-sm shadow-mind/5 dark:bg-mind/15 dark:shadow-black/20",
    "bg-mind/8 shadow-sm shadow-mind/5 dark:bg-mind/15 dark:shadow-black/20",
  ] as const,
} as const

/** Heatmap — same `mind` blue, opacity only */
export function mxHeatmapCell(value: number) {
  return cn(
    "w-full aspect-square rounded-sm min-h-[10px] min-w-0 focus:outline-none focus:ring-2 focus:ring-mind/30 focus:ring-offset-1",
    value === 0 && "bg-stone-100 hover:bg-stone-200/80",
    value === 1 && "bg-mind/10 hover:bg-mind/16",
    value === 2 && "bg-mind/22 hover:bg-mind/30",
    value === 3 && "bg-mind/34 hover:bg-mind/42",
    value >= 4 && "bg-mind/48 hover:bg-mind/56"
  )
}

export function mxHeatmapCellTiny(value: number) {
  return cn(
    "rounded-[1px] min-w-[8px] p-0 border-0 focus:outline-none focus:ring-1 focus:ring-mind/30",
    value === 0 && "bg-stone-100 hover:bg-stone-200",
    value === 1 && "bg-mind/14 hover:bg-mind/22",
    value === 2 && "bg-mind/26 hover:bg-mind/36",
    value === 3 && "bg-mind/40 hover:bg-mind/48",
    value >= 4 && "bg-mind/54 hover:bg-mind/62"
  )
}
