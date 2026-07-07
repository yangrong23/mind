/**
 * Mindar — one canonical blue (`mind` / --mind-blue). Only opacity & color-mix vary.
 */

import { cn } from "@/lib/utils"

/** Tailwind `mind` @ 100% — do not use sky-* or other blues in product UI */
export const MIND_BLUE_OKLCH = "oklch(0.588 0.158 241.966)"

const FACTORY_FIELD_FOCUS =
  "focus:border-mind/30 focus:outline-none focus:ring-1 focus:ring-mind/20" as const

/** Knowledge Studio — same cool-blue family, distinct hue per factory kind */
const FACTORY_TONE_REPORT = {
  well: "bg-sky-500/12 dark:bg-sky-500/18",
  icon: "text-sky-600 dark:text-sky-400",
  sparkle: "text-sky-500 dark:text-sky-400",
  pillOn:
    "border-stone-200/40 bg-sky-500/10 text-sky-800 dark:border-zinc-700/35 dark:bg-sky-500/15 dark:text-sky-300",
  cardOn: "bg-sky-500/12 dark:bg-sky-500/18",
  check: "text-sky-600 dark:text-sky-400",
  styleCardOn: "bg-sky-500/12 dark:bg-sky-500/18",
  fieldFocus: FACTORY_FIELD_FOCUS,
  softHover:
    "hover:border-stone-200/40 hover:bg-sky-500/8 dark:hover:border-stone-200/55 dark:hover:bg-sky-500/12",
  filledShell: "bg-sky-100/40 dark:bg-sky-950/88",
  filledShellHover: "group-hover:bg-sky-100/48 dark:group-hover:bg-sky-950/92",
  filledOverlay: "",
  filledOverlayHover: "",
  filledCornerGlow: "",
  filledIconRing: "ring-sky-200/50 dark:ring-sky-800/45",
  filledOptionBg: "bg-sky-100/40 dark:bg-sky-950/88",
  filledShadow: "shadow-[0_2px_10px_-6px_rgba(56,189,248,0.08)]",
  filledShadowHover: "hover:shadow-[0_4px_16px_-6px_rgba(56,189,248,0.11)]",
} as const

const FACTORY_TONE_AUDIO = {
  well: "bg-cyan-500/12 dark:bg-cyan-500/18",
  icon: "text-cyan-600 dark:text-cyan-400",
  sparkle: "text-cyan-500 dark:text-cyan-400",
  pillOn:
    "border-stone-200/40 bg-cyan-500/10 text-cyan-800 dark:border-zinc-700/35 dark:bg-cyan-500/15 dark:text-cyan-300",
  cardOn: "bg-cyan-500/12 dark:bg-cyan-500/18",
  check: "text-cyan-600 dark:text-cyan-400",
  styleCardOn: "bg-cyan-500/12 dark:bg-cyan-500/18",
  fieldFocus: FACTORY_FIELD_FOCUS,
  softHover:
    "hover:border-stone-200/40 hover:bg-cyan-500/8 dark:hover:border-stone-200/55 dark:hover:bg-cyan-500/12",
  filledShell: "bg-cyan-100/40 dark:bg-cyan-950/88",
  filledShellHover: "group-hover:bg-cyan-100/48 dark:group-hover:bg-cyan-950/92",
  filledOverlay: "",
  filledOverlayHover: "",
  filledCornerGlow: "",
  filledIconRing: "ring-cyan-200/50 dark:ring-cyan-800/45",
  filledOptionBg: "bg-cyan-100/40 dark:bg-cyan-950/88",
  filledShadow: "shadow-[0_2px_10px_-6px_rgba(34,211,238,0.08)]",
  filledShadowHover: "hover:shadow-[0_4px_16px_-6px_rgba(34,211,238,0.11)]",
} as const

const FACTORY_TONE_FLASHCARDS = {
  well: "bg-blue-500/12 dark:bg-blue-500/18",
  icon: "text-blue-600 dark:text-blue-400",
  sparkle: "text-blue-500 dark:text-blue-400",
  pillOn:
    "border-stone-200/40 bg-blue-500/10 text-blue-800 dark:border-zinc-700/35 dark:bg-blue-500/15 dark:text-blue-300",
  cardOn: "bg-blue-500/12 dark:bg-blue-500/18",
  check: "text-blue-600 dark:text-blue-400",
  styleCardOn: "bg-blue-500/12 dark:bg-blue-500/18",
  fieldFocus: FACTORY_FIELD_FOCUS,
  softHover:
    "hover:border-stone-200/40 hover:bg-blue-500/8 dark:hover:border-stone-200/55 dark:hover:bg-blue-500/12",
  filledShell: "bg-blue-100/40 dark:bg-blue-950/88",
  filledShellHover: "group-hover:bg-blue-100/48 dark:group-hover:bg-blue-950/92",
  filledOverlay: "",
  filledOverlayHover: "",
  filledCornerGlow: "",
  filledIconRing: "ring-blue-200/50 dark:ring-blue-800/45",
  filledOptionBg: "bg-blue-100/40 dark:bg-blue-950/88",
  filledShadow: "shadow-[0_2px_10px_-6px_rgba(59,130,246,0.08)]",
  filledShadowHover: "hover:shadow-[0_4px_16px_-6px_rgba(59,130,246,0.11)]",
} as const

const FACTORY_TONE_QUIZ = {
  well: "bg-teal-500/12 dark:bg-teal-500/18",
  icon: "text-teal-600 dark:text-teal-400",
  sparkle: "text-teal-500 dark:text-teal-400",
  pillOn:
    "border-stone-200/40 bg-teal-500/10 text-teal-800 dark:border-zinc-700/35 dark:bg-teal-500/15 dark:text-teal-300",
  cardOn: "bg-teal-500/12 dark:bg-teal-500/18",
  check: "text-teal-600 dark:text-teal-400",
  styleCardOn: "bg-teal-500/12 dark:bg-teal-500/18",
  fieldFocus: FACTORY_FIELD_FOCUS,
  softHover:
    "hover:border-stone-200/40 hover:bg-teal-500/8 dark:hover:border-stone-200/55 dark:hover:bg-teal-500/12",
  filledShell: "bg-teal-100/40 dark:bg-teal-950/88",
  filledShellHover: "group-hover:bg-teal-100/48 dark:group-hover:bg-teal-950/92",
  filledOverlay: "",
  filledOverlayHover: "",
  filledCornerGlow: "",
  filledIconRing: "ring-teal-200/50 dark:ring-teal-800/45",
  filledOptionBg: "bg-teal-100/40 dark:bg-teal-950/88",
  filledShadow: "shadow-[0_2px_10px_-6px_rgba(20,184,166,0.08)]",
  filledShadowHover: "hover:shadow-[0_4px_16px_-6px_rgba(20,184,166,0.11)]",
} as const

const FACTORY_TONE_SLIDES = {
  well: "bg-sky-600/12 dark:bg-sky-600/18",
  icon: "text-sky-700 dark:text-sky-300",
  sparkle: "text-sky-600 dark:text-sky-400",
  pillOn:
    "border-stone-200/40 bg-sky-600/10 text-sky-900 dark:border-sky-500/50 dark:bg-sky-600/15 dark:text-sky-200",
  cardOn: "bg-sky-600/12 dark:bg-sky-600/18",
  check: "text-sky-700 dark:text-sky-300",
  styleCardOn: "bg-sky-600/12 dark:bg-sky-600/18",
  fieldFocus: FACTORY_FIELD_FOCUS,
  softHover:
    "hover:border-stone-200/40 hover:bg-sky-600/8 dark:hover:border-sky-500/40 dark:hover:bg-sky-600/12",
  filledShell: "bg-sky-100/40 dark:bg-sky-950/88",
  filledShellHover: "group-hover:bg-sky-100/48 dark:group-hover:bg-sky-950/92",
  filledOverlay: "",
  filledOverlayHover: "",
  filledCornerGlow: "",
  filledIconRing: "ring-sky-200/50 dark:ring-sky-800/45",
  filledOptionBg: "bg-sky-100/40 dark:bg-sky-950/88",
  filledShadow: "shadow-[0_2px_10px_-6px_rgba(2,132,199,0.08)]",
  filledShadowHover: "hover:shadow-[0_4px_16px_-6px_rgba(2,132,199,0.11)]",
} as const

const FACTORY_TONE_INFOGRAPHIC = {
  well: "bg-cyan-600/12 dark:bg-cyan-600/18",
  icon: "text-cyan-700 dark:text-cyan-300",
  sparkle: "text-cyan-600 dark:text-cyan-400",
  pillOn:
    "border-stone-200/40 bg-cyan-600/10 text-cyan-900 dark:border-cyan-500/50 dark:bg-cyan-600/15 dark:text-cyan-200",
  cardOn: "bg-cyan-600/12 dark:bg-cyan-600/18",
  check: "text-cyan-700 dark:text-cyan-300",
  styleCardOn: "bg-cyan-600/12 dark:bg-cyan-600/18",
  fieldFocus: FACTORY_FIELD_FOCUS,
  softHover:
    "hover:border-stone-200/40 hover:bg-cyan-600/8 dark:hover:border-cyan-500/40 dark:hover:bg-cyan-600/12",
  filledShell: "bg-cyan-100/40 dark:bg-cyan-950/88",
  filledShellHover: "group-hover:bg-cyan-100/48 dark:group-hover:bg-cyan-950/92",
  filledOverlay: "",
  filledOverlayHover: "",
  filledCornerGlow: "",
  filledIconRing: "ring-cyan-200/50 dark:ring-cyan-800/45",
  filledOptionBg: "bg-cyan-100/40 dark:bg-cyan-950/88",
  filledShadow: "shadow-[0_2px_10px_-6px_rgba(8,145,178,0.08)]",
  filledShadowHover: "hover:shadow-[0_4px_16px_-6px_rgba(8,145,178,0.11)]",
} as const

/** Agent / chat rails — single mind accent (filled* keys unused; shared shape with kb tones) */
const FACTORY_MIND_TONE = {
  well: "bg-mind/10",
  icon: "text-mind",
  sparkle: "text-mind",
  pillOn: "border-stone-200/45 bg-mind/8 text-mind",
  cardOn: "bg-mind/8",
  check: "text-mind",
  styleCardOn: "bg-mind/10",
  fieldFocus: FACTORY_FIELD_FOCUS,
  softHover: "hover:border-stone-200/55 hover:shadow-sm",
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

/** Tab page surfaces — one flat canvas (white light / zinc dark); elevation via card shadows only */
const PAGE_BG = "bg-[var(--mind-page-bg)]"

export const mx = {
  pageBg: PAGE_BG,

  pressable:
    "transition-[transform,opacity,background-color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] active:scale-[0.986] active:opacity-[0.96]",
  pressableChip:
    "transition-[background-color,border-color,transform,box-shadow] duration-150 ease-out active:scale-[0.99]",

  shellCanvas: PAGE_BG,
  /** Unified top bar — same surface as page & bottom nav (no frosted tint) */
  tabHeaderBar:
    "shrink-0 border-b border-stone-200/85 bg-[var(--mind-page-bg)] dark:border-zinc-800 dark:bg-[var(--mind-page-bg)]",
  /** Secondary tab row (Library categories) — same canvas as page */
  tabCategoryBar:
    "shrink-0 border-b border-stone-200/85 bg-[var(--mind-page-bg)] dark:border-zinc-800 dark:bg-[var(--mind-page-bg)]",
  shellSurface: "bg-white/90 dark:bg-zinc-900/95",
  shellHairline: "border-stone-200/85 dark:border-zinc-700/90",
  /** iOS-style 0.5px separators */
  shellHairlineSubtle: "border-black/[0.05] dark:border-white/[0.06]",
  shellInk: "text-zinc-900 dark:text-zinc-100",
  shellInkSecondary: "text-zinc-600 dark:text-zinc-300",
  shellMuted: "text-zinc-500 dark:text-zinc-400",
  shellIcon: "text-zinc-400 dark:text-zinc-500",

  /** Typography — keep hierarchy consistent across tabs (avoid zinc-400 on readable copy) */
  typeHeroSubtitle:
    "text-[14px] font-medium tracking-tight text-zinc-700 dark:text-zinc-300",
  typeBody: "text-[14px] leading-relaxed text-zinc-700 dark:text-zinc-300",
  typeBodySecondary: "text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400",
  typePromptChip: "text-[13px] font-medium leading-snug text-zinc-700 dark:text-zinc-300",
  typePromptChipCompact: "text-[12px] font-medium leading-snug text-zinc-700 dark:text-zinc-300",
  typeCaption: "text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400",
  typePlaceholder: "placeholder:text-zinc-500 dark:placeholder:text-zinc-400",
  promptChipSurface: cn(
    "border border-zinc-200/50 bg-white/95",
    "shadow-[0_1px_4px_-2px_rgba(15,23,42,0.06)]",
    "transition-[background-color,border-color,box-shadow,color,transform] duration-200",
    "hover:border-mind/22 hover:bg-mind/[0.05] hover:text-zinc-800 hover:shadow-[0_2px_10px_-3px_rgba(15,23,42,0.08)]",
    "active:scale-[0.98]",
    "dark:border-zinc-700/45 dark:bg-zinc-900/75 dark:hover:border-mind/28 dark:hover:bg-mind/10 dark:hover:text-zinc-100"
  ),
  shellCard:
    "rounded-2xl border border-stone-200/70 bg-white shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_8px_28px_-16px_rgba(15,23,42,0.08)] dark:border-zinc-700 dark:bg-zinc-900/80",

  /** Fashion elevated — memo cards, Me stat tiles (matches product mockup) */
  elevatedShadow:
    "shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05),0_4px_10px_-5px_rgba(0,0,0,0.02)]",
  elevatedSurface:
    "rounded-2xl border border-[#E9ECEF] bg-white dark:border-zinc-700/90 dark:bg-zinc-900",
  elevatedCard:
    "rounded-2xl border border-stone-200/50 bg-white shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05),0_4px_10px_-5px_rgba(0,0,0,0.02)] dark:border-zinc-700/90 dark:bg-zinc-900",

  /** Memos list — stronger lift for thumbnail + swipe rows */
  memoCard:
    "rounded-2xl border border-stone-200/45 bg-white shadow-[0_14px_40px_-12px_rgba(15,23,42,0.11),0_4px_14px_-6px_rgba(15,23,42,0.05),0_0_0_1px_rgba(15,23,42,0.02)] dark:border-zinc-700/55 dark:bg-zinc-900 dark:shadow-[0_16px_44px_-14px_rgba(0,0,0,0.45)]",

  /** Premium + / add-source controls */
  addFabDark:
    "bg-zinc-900 text-white shadow-[0_12px_32px_-10px_rgba(15,23,42,0.38)] ring-1 ring-black/10 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-white/15 dark:hover:bg-white",
  addFabLight:
    "border border-stone-200/55 bg-white text-zinc-800 shadow-[0_12px_32px_-10px_rgba(15,23,42,0.12)] ring-1 ring-black/[0.03] hover:border-stone-300/60 dark:border-zinc-700/50 dark:bg-zinc-900 dark:text-zinc-100",
  addToolbarBtn:
    "border border-stone-200/50 bg-stone-50/95 text-zinc-700 shadow-[0_1px_4px_-1px_rgba(15,23,42,0.07)] hover:bg-white hover:border-stone-300/55 dark:border-zinc-700/45 dark:bg-zinc-800/80 dark:text-zinc-200",
  addHeaderBtn:
    "border border-stone-200/45 bg-white/95 text-zinc-700 shadow-[0_2px_8px_-3px_rgba(15,23,42,0.08)] hover:bg-stone-50 dark:border-zinc-700/45 dark:bg-zinc-900/90 dark:text-zinc-200",

  memoPageBg: PAGE_BG,
  shellPillInactive: "bg-stone-100/90 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",

  brandHero: "bg-[var(--mind-page-bg)]",
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
  /** Main tab bar — flush to screen bottom, same surface as page */
  navDockShell:
    "bg-[var(--mind-page-bg)]",
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

  /** Agent home — soft shell, gentle shadow (no heavy border) */
  composerHomeShell:
    "rounded-[1.75rem] border border-zinc-200/45 bg-white/96 shadow-[0_10px_36px_-14px_rgba(0,0,0,0.07),0_2px_10px_-4px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-[box-shadow,border-color] duration-300 ease-out focus-within:border-zinc-200/65 focus-within:shadow-[0_14px_44px_-16px_rgba(0,0,0,0.09),0_4px_14px_-6px_rgba(0,0,0,0.05)] dark:border-zinc-700/40 dark:bg-zinc-900/80 dark:shadow-[0_14px_40px_-16px_rgba(0,0,0,0.35)] dark:focus-within:border-zinc-600/50",

  /** In-thread composer — flat inner shell (shadow lives on dock wrapper) */
  composerThreadShell:
    "rounded-[20px] border border-black/[0.06] bg-white dark:border-white/[0.08] dark:bg-zinc-900/98",

  /** Elevated input dock — factory chips stay flat above this */
  composerThreadDock:
    "rounded-[20px] border border-black/[0.06] bg-white shadow-[0_10px_40px_-14px_rgba(15,23,42,0.14),0_4px_14px_-8px_rgba(15,23,42,0.08),0_0_0_0.5px_rgba(0,0,0,0.03)] transition-[box-shadow] duration-300 focus-within:shadow-[0_14px_48px_-12px_rgba(15,23,42,0.16),0_6px_18px_-8px_rgba(15,23,42,0.1)] dark:border-white/[0.08] dark:bg-zinc-900 dark:shadow-[0_18px_52px_-14px_rgba(0,0,0,0.55),0_0_0_0.5px_rgba(255,255,255,0.05)] dark:focus-within:shadow-[0_22px_56px_-14px_rgba(0,0,0,0.6)]",

  chatFooterBar:
    "border-t border-black/[0.05] bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 dark:border-white/[0.06] dark:bg-zinc-950/85",

  chatFactoryRailZone: "opacity-100",

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
    "min-w-0 rounded-[1px] p-0 border-0 focus:outline-none focus:ring-1 focus:ring-mind/30",
    value === 0 && "bg-stone-100 hover:bg-stone-200",
    value === 1 && "bg-mind/14 hover:bg-mind/22",
    value === 2 && "bg-mind/26 hover:bg-mind/36",
    value === 3 && "bg-mind/40 hover:bg-mind/48",
    value >= 4 && "bg-mind/54 hover:bg-mind/62"
  )
}
