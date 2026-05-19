/**
 * Medrix Mind — one canonical blue (`mind` / --mind-blue). Only opacity & color-mix vary.
 */

import { cn } from "@/lib/utils"

/** Tailwind `mind` @ 100% — do not use sky-* or other blues in product UI */
export const MIND_BLUE_OKLCH = "oklch(0.588 0.158 241.966)"

const FACTORY_FIELD_FOCUS =
  "focus:border-mind/30 focus:outline-none focus:ring-1 focus:ring-mind/20" as const

/** Knowledge Studio — same cool-blue family, distinct hue per factory kind */
const FACTORY_TONE_REPORT = {
  well: "bg-sky-500/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] dark:bg-sky-500/18",
  icon: "text-sky-600 dark:text-sky-400",
  sparkle: "text-sky-500 dark:text-sky-400",
  pillOn:
    "border-sky-300/55 bg-sky-500/10 text-sky-800 dark:border-sky-600/50 dark:bg-sky-500/15 dark:text-sky-300",
  cardOn: "border-sky-300/60 bg-sky-500/12 dark:border-sky-600/45 dark:bg-sky-500/18",
  check: "text-sky-600 dark:text-sky-400",
  styleCardOn:
    "border-sky-300/65 bg-sky-500/12 ring-1 ring-sky-400/20 dark:border-sky-600/50 dark:bg-sky-500/18",
  fieldFocus: FACTORY_FIELD_FOCUS,
  softHover:
    "hover:border-sky-300/50 hover:bg-sky-500/8 dark:hover:border-sky-600/40 dark:hover:bg-sky-500/12",
  filledShell:
    "border-sky-200/60 bg-gradient-to-br from-sky-200/32 via-sky-100/24 to-cyan-200/28 dark:border-sky-800/50 dark:from-sky-950 dark:via-sky-900/95 dark:to-cyan-950",
  filledShellHover:
    "hover:border-sky-300/65 hover:from-sky-200/38 hover:via-sky-100/30 hover:to-cyan-200/34 dark:hover:border-sky-700/50 dark:hover:from-sky-900 dark:hover:via-sky-950 dark:hover:to-cyan-950",
  filledOverlay: "bg-sky-500/[0.04] dark:bg-sky-400/8",
  filledOverlayHover: "group-hover:bg-sky-500/[0.06] dark:group-hover:bg-sky-400/10",
  filledCornerGlow:
    "bg-[radial-gradient(circle,rgba(125,211,252,0.18)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(56,189,248,0.14)_0%,transparent_70%)]",
  filledIconRing: "ring-white/55 dark:ring-sky-900/45",
  filledOptionBg:
    "border-sky-200/65 bg-gradient-to-br from-sky-100/30 to-stone-50/95 dark:border-sky-800/45 dark:from-sky-950/95 dark:to-zinc-900",
  filledShadow: "shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_6px_20px_-12px_rgba(56,189,248,0.1)]",
  filledShadowHover:
    "hover:shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_12px_28px_-14px_rgba(56,189,248,0.14)]",
} as const

const FACTORY_TONE_AUDIO = {
  well: "bg-cyan-500/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] dark:bg-cyan-500/18",
  icon: "text-cyan-600 dark:text-cyan-400",
  sparkle: "text-cyan-500 dark:text-cyan-400",
  pillOn:
    "border-cyan-300/55 bg-cyan-500/10 text-cyan-800 dark:border-cyan-600/50 dark:bg-cyan-500/15 dark:text-cyan-300",
  cardOn: "border-cyan-300/60 bg-cyan-500/12 dark:border-cyan-600/45 dark:bg-cyan-500/18",
  check: "text-cyan-600 dark:text-cyan-400",
  styleCardOn:
    "border-cyan-300/65 bg-cyan-500/12 ring-1 ring-cyan-400/20 dark:border-cyan-600/50 dark:bg-cyan-500/18",
  fieldFocus: FACTORY_FIELD_FOCUS,
  softHover:
    "hover:border-cyan-300/50 hover:bg-cyan-500/8 dark:hover:border-cyan-600/40 dark:hover:bg-cyan-500/12",
  filledShell:
    "border-cyan-200/60 bg-gradient-to-br from-cyan-200/32 via-cyan-100/24 to-teal-200/28 dark:border-cyan-800/50 dark:from-cyan-950 dark:via-cyan-900/95 dark:to-teal-950",
  filledShellHover:
    "hover:border-cyan-300/65 hover:from-cyan-200/38 hover:via-cyan-100/30 hover:to-teal-200/34 dark:hover:border-cyan-700/50 dark:hover:from-cyan-900 dark:hover:via-cyan-950 dark:hover:to-teal-950",
  filledOverlay: "bg-cyan-500/[0.04] dark:bg-cyan-400/8",
  filledOverlayHover: "group-hover:bg-cyan-500/[0.06] dark:group-hover:bg-cyan-400/10",
  filledCornerGlow:
    "bg-[radial-gradient(circle,rgba(34,211,238,0.18)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(34,211,238,0.12)_0%,transparent_70%)]",
  filledIconRing: "ring-white/55 dark:ring-cyan-900/45",
  filledOptionBg:
    "border-cyan-200/65 bg-gradient-to-br from-cyan-100/30 to-stone-50/95 dark:border-cyan-800/45 dark:from-cyan-950/95 dark:to-zinc-900",
  filledShadow: "shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_6px_20px_-12px_rgba(34,211,238,0.1)]",
  filledShadowHover:
    "hover:shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_12px_28px_-14px_rgba(34,211,238,0.14)]",
} as const

const FACTORY_TONE_FLASHCARDS = {
  well: "bg-blue-500/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] dark:bg-blue-500/18",
  icon: "text-blue-600 dark:text-blue-400",
  sparkle: "text-blue-500 dark:text-blue-400",
  pillOn:
    "border-blue-300/55 bg-blue-500/10 text-blue-800 dark:border-blue-600/50 dark:bg-blue-500/15 dark:text-blue-300",
  cardOn: "border-blue-300/60 bg-blue-500/12 dark:border-blue-600/45 dark:bg-blue-500/18",
  check: "text-blue-600 dark:text-blue-400",
  styleCardOn:
    "border-blue-300/65 bg-blue-500/12 ring-1 ring-blue-400/20 dark:border-blue-600/50 dark:bg-blue-500/18",
  fieldFocus: FACTORY_FIELD_FOCUS,
  softHover:
    "hover:border-blue-300/50 hover:bg-blue-500/8 dark:hover:border-blue-600/40 dark:hover:bg-blue-500/12",
  filledShell:
    "border-blue-200/60 bg-gradient-to-br from-blue-200/32 via-sky-100/24 to-cyan-200/26 dark:border-blue-800/50 dark:from-blue-950 dark:via-sky-950/95 dark:to-cyan-950",
  filledShellHover:
    "hover:border-blue-300/65 hover:from-blue-200/38 hover:via-sky-100/30 hover:to-cyan-200/32 dark:hover:border-blue-700/50 dark:hover:from-blue-900 dark:hover:via-sky-950 dark:hover:to-cyan-950",
  filledOverlay: "bg-blue-500/[0.04] dark:bg-blue-400/8",
  filledOverlayHover: "group-hover:bg-blue-500/[0.06] dark:group-hover:bg-blue-400/10",
  filledCornerGlow:
    "bg-[radial-gradient(circle,rgba(96,165,250,0.18)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(96,165,250,0.12)_0%,transparent_70%)]",
  filledIconRing: "ring-white/55 dark:ring-blue-900/45",
  filledOptionBg:
    "border-blue-200/65 bg-gradient-to-br from-blue-100/30 to-stone-50/95 dark:border-blue-800/45 dark:from-blue-950/95 dark:to-zinc-900",
  filledShadow: "shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_6px_20px_-12px_rgba(59,130,246,0.1)]",
  filledShadowHover:
    "hover:shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_12px_28px_-14px_rgba(59,130,246,0.14)]",
} as const

const FACTORY_TONE_QUIZ = {
  well: "bg-teal-500/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] dark:bg-teal-500/18",
  icon: "text-teal-600 dark:text-teal-400",
  sparkle: "text-teal-500 dark:text-teal-400",
  pillOn:
    "border-teal-300/55 bg-teal-500/10 text-teal-800 dark:border-teal-600/50 dark:bg-teal-500/15 dark:text-teal-300",
  cardOn: "border-teal-300/60 bg-teal-500/12 dark:border-teal-600/45 dark:bg-teal-500/18",
  check: "text-teal-600 dark:text-teal-400",
  styleCardOn:
    "border-teal-300/65 bg-teal-500/12 ring-1 ring-teal-400/20 dark:border-teal-600/50 dark:bg-teal-500/18",
  fieldFocus: FACTORY_FIELD_FOCUS,
  softHover:
    "hover:border-teal-300/50 hover:bg-teal-500/8 dark:hover:border-teal-600/40 dark:hover:bg-teal-500/12",
  filledShell:
    "border-teal-200/60 bg-gradient-to-br from-teal-200/32 via-cyan-100/24 to-sky-200/28 dark:border-teal-800/50 dark:from-teal-950 dark:via-cyan-950/95 dark:to-sky-950",
  filledShellHover:
    "hover:border-teal-300/65 hover:from-teal-200/38 hover:via-cyan-100/30 hover:to-sky-200/34 dark:hover:border-teal-700/50 dark:hover:from-teal-900 dark:hover:via-cyan-950 dark:hover:to-sky-950",
  filledOverlay: "bg-teal-500/[0.04] dark:bg-teal-400/8",
  filledOverlayHover: "group-hover:bg-teal-500/[0.06] dark:group-hover:bg-teal-400/10",
  filledCornerGlow:
    "bg-[radial-gradient(circle,rgba(45,212,191,0.18)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(45,212,191,0.12)_0%,transparent_70%)]",
  filledIconRing: "ring-white/55 dark:ring-teal-900/45",
  filledOptionBg:
    "border-teal-200/65 bg-gradient-to-br from-teal-100/30 to-stone-50/95 dark:border-teal-800/45 dark:from-teal-950/95 dark:to-zinc-900",
  filledShadow: "shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_6px_20px_-12px_rgba(20,184,166,0.1)]",
  filledShadowHover:
    "hover:shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_12px_28px_-14px_rgba(20,184,166,0.14)]",
} as const

const FACTORY_TONE_SLIDES = {
  well: "bg-sky-600/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] dark:bg-sky-600/18",
  icon: "text-sky-700 dark:text-sky-300",
  sparkle: "text-sky-600 dark:text-sky-400",
  pillOn:
    "border-sky-400/55 bg-sky-600/10 text-sky-900 dark:border-sky-500/50 dark:bg-sky-600/15 dark:text-sky-200",
  cardOn: "border-sky-400/60 bg-sky-600/12 dark:border-sky-500/45 dark:bg-sky-600/18",
  check: "text-sky-700 dark:text-sky-300",
  styleCardOn:
    "border-sky-400/65 bg-sky-600/12 ring-1 ring-sky-500/20 dark:border-sky-500/50 dark:bg-sky-600/18",
  fieldFocus: FACTORY_FIELD_FOCUS,
  softHover:
    "hover:border-sky-400/50 hover:bg-sky-600/8 dark:hover:border-sky-500/40 dark:hover:bg-sky-600/12",
  filledShell:
    "border-sky-300/60 bg-gradient-to-br from-sky-200/30 via-blue-100/22 to-indigo-200/28 dark:border-sky-700/50 dark:from-sky-950 dark:via-blue-950/95 dark:to-indigo-950",
  filledShellHover:
    "hover:border-sky-400/65 hover:from-sky-200/36 hover:via-blue-100/28 hover:to-indigo-200/34 dark:hover:border-sky-600/50 dark:hover:from-sky-900 dark:hover:via-blue-950 dark:hover:to-indigo-950",
  filledOverlay: "bg-sky-600/[0.04] dark:bg-sky-500/8",
  filledOverlayHover: "group-hover:bg-sky-600/[0.06] dark:group-hover:bg-sky-500/10",
  filledCornerGlow:
    "bg-[radial-gradient(circle,rgba(14,165,233,0.18)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(14,165,233,0.12)_0%,transparent_70%)]",
  filledIconRing: "ring-white/55 dark:ring-sky-800/45",
  filledOptionBg:
    "border-sky-300/65 bg-gradient-to-br from-sky-100/28 to-stone-50/95 dark:border-sky-700/45 dark:from-sky-950/95 dark:to-zinc-900",
  filledShadow: "shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_6px_20px_-12px_rgba(2,132,199,0.1)]",
  filledShadowHover:
    "hover:shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_12px_28px_-14px_rgba(2,132,199,0.14)]",
} as const

const FACTORY_TONE_INFOGRAPHIC = {
  well: "bg-cyan-600/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] dark:bg-cyan-600/18",
  icon: "text-cyan-700 dark:text-cyan-300",
  sparkle: "text-cyan-600 dark:text-cyan-400",
  pillOn:
    "border-cyan-400/55 bg-cyan-600/10 text-cyan-900 dark:border-cyan-500/50 dark:bg-cyan-600/15 dark:text-cyan-200",
  cardOn: "border-cyan-400/60 bg-cyan-600/12 dark:border-cyan-500/45 dark:bg-cyan-600/18",
  check: "text-cyan-700 dark:text-cyan-300",
  styleCardOn:
    "border-cyan-400/65 bg-cyan-600/12 ring-1 ring-cyan-500/20 dark:border-cyan-500/50 dark:bg-cyan-600/18",
  fieldFocus: FACTORY_FIELD_FOCUS,
  softHover:
    "hover:border-cyan-400/50 hover:bg-cyan-600/8 dark:hover:border-cyan-500/40 dark:hover:bg-cyan-600/12",
  filledShell:
    "border-cyan-300/60 bg-gradient-to-br from-cyan-200/30 via-teal-100/22 to-sky-200/28 dark:border-cyan-700/50 dark:from-cyan-950 dark:via-teal-950/95 dark:to-sky-950",
  filledShellHover:
    "hover:border-cyan-400/65 hover:from-cyan-200/36 hover:via-teal-100/28 hover:to-sky-200/34 dark:hover:border-cyan-600/50 dark:hover:from-cyan-900 dark:hover:via-teal-950 dark:hover:to-sky-950",
  filledOverlay: "bg-cyan-600/[0.04] dark:bg-cyan-500/8",
  filledOverlayHover: "group-hover:bg-cyan-600/[0.06] dark:group-hover:bg-cyan-500/10",
  filledCornerGlow:
    "bg-[radial-gradient(circle,rgba(6,182,212,0.18)_0%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(6,182,212,0.12)_0%,transparent_70%)]",
  filledIconRing: "ring-white/55 dark:ring-cyan-800/45",
  filledOptionBg:
    "border-cyan-300/65 bg-gradient-to-br from-cyan-100/28 to-stone-50/95 dark:border-cyan-700/45 dark:from-cyan-950/95 dark:to-zinc-900",
  filledShadow: "shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_6px_20px_-12px_rgba(8,145,178,0.1)]",
  filledShadowHover:
    "hover:shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_12px_28px_-14px_rgba(8,145,178,0.14)]",
} as const

/** Agent / chat rails — single mind accent (filled* keys unused; shared shape with kb tones) */
const FACTORY_MIND_TONE = {
  well: "bg-mind/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
  icon: "text-mind",
  sparkle: "text-mind",
  pillOn: "border-mind/25 bg-mind/8 text-mind",
  cardOn: "border-mind/25 bg-mind/8",
  check: "text-mind",
  styleCardOn: "border-mind/30 bg-mind/10 ring-1 ring-mind/15",
  fieldFocus: FACTORY_FIELD_FOCUS,
  softHover: "hover:border-mind/20 hover:bg-mind/6",
  filledShell: FACTORY_TONE_REPORT.filledShell,
  filledShellHover: FACTORY_TONE_REPORT.filledShellHover,
  filledOverlay: FACTORY_TONE_REPORT.filledOverlay,
  filledOverlayHover: FACTORY_TONE_REPORT.filledOverlayHover,
  filledCornerGlow: FACTORY_TONE_REPORT.filledCornerGlow,
  filledIconRing: FACTORY_TONE_REPORT.filledIconRing,
  filledOptionBg: FACTORY_TONE_REPORT.filledOptionBg,
  filledShadow: FACTORY_TONE_REPORT.filledShadow,
  filledShadowHover: FACTORY_TONE_REPORT.filledShadowHover,
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
  /** Floating glass pill — sheets / inline actions (not main tab bar) */
  navGlassShell:
    "bg-white/65 shadow-[0_-6px_28px_-10px_rgba(15,23,42,0.1),0_8px_28px_-14px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:bg-zinc-900/55 dark:shadow-[0_-8px_32px_-12px_rgba(0,0,0,0.35)]",
  /** Main tab bar — flush to screen bottom, no floating margin or edge line */
  navDockShell:
    "bg-white/95 backdrop-blur-md dark:bg-zinc-950/95",
  navEase: "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",

  factoryTone: {
    report: FACTORY_MIND_TONE,
    audio: FACTORY_MIND_TONE,
    flashcards: FACTORY_MIND_TONE,
    quiz: FACTORY_MIND_TONE,
    infographic: FACTORY_MIND_TONE,
    slides: FACTORY_MIND_TONE,
  } as const,

  /** Knowledge Studio — per-kind hues within sky / cyan / teal / blue family */
  kbFactoryTone: {
    report: FACTORY_TONE_REPORT,
    audio: FACTORY_TONE_AUDIO,
    flashcards: FACTORY_TONE_FLASHCARDS,
    quiz: FACTORY_TONE_QUIZ,
    slides: FACTORY_TONE_SLIDES,
    infographic: FACTORY_TONE_INFOGRAPHIC,
  } as const,

  /** Agent home — Minder landing chat composer (mind-tinted glow, not neutral gray) */
  composerHomeShell:
    "rounded-[1.5rem] border border-mind/15 bg-white/92 backdrop-blur-md shadow-[0_12px_40px_-14px_rgba(56,189,248,0.28),0_4px_18px_-6px_rgba(125,211,252,0.2)] dark:border-mind/22 dark:bg-zinc-900/72 dark:shadow-[0_16px_44px_-16px_rgba(56,189,248,0.32),0_6px_24px_-10px_rgba(2,132,199,0.18)]",

  knowledgeAskPill:
    "border border-mind/20 bg-mind/8 text-mind shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] hover:border-mind/25 hover:bg-mind/12",
  knowledgeAskSparkle: "text-mind",
  /** Tab row accent — same depth as Ask border */
  knowledgeTabRule: "bg-mind/20 dark:bg-mind/25",

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
