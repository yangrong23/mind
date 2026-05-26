/**
 * Content factory card / modal tone class bundles (Tailwind).
 */

export type FactoryToneKind =
  | "report"
  | "audio"
  | "flashcards"
  | "quiz"
  | "slides"
  | "infographic"

export type FactoryToneClasses = {
  well: string
  icon: string
  sparkle: string
  pillOn: string
  cardOn: string
  check: string
  styleCardOn: string
  fieldFocus: string
  softHover: string
  filledShell: string
  filledShellHover: string
  filledOverlay: string
  filledOverlayHover: string
  filledCornerGlow: string
  filledIconRing: string
  filledOptionBg: string
  filledShadow: string
  filledShadowHover: string
}

const FACTORY_FIELD_FOCUS =
  "focus:border-mind/30 focus:outline-none focus:ring-1 focus:ring-mind/20" as const

const FACTORY_TONE_REPORT: FactoryToneClasses = {
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
}

const FACTORY_TONE_AUDIO: FactoryToneClasses = {
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
}

const FACTORY_TONE_FLASHCARDS: FactoryToneClasses = {
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
}

const FACTORY_TONE_QUIZ: FactoryToneClasses = {
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
}

const FACTORY_TONE_SLIDES: FactoryToneClasses = {
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
}

const FACTORY_TONE_INFOGRAPHIC: FactoryToneClasses = {
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
}

const AGENT_FACTORY_TONE: FactoryToneClasses = {
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
}

const KB_FACTORY_TONES: Record<FactoryToneKind, FactoryToneClasses> = {
  report: FACTORY_TONE_REPORT,
  audio: FACTORY_TONE_AUDIO,
  flashcards: FACTORY_TONE_FLASHCARDS,
  quiz: FACTORY_TONE_QUIZ,
  slides: FACTORY_TONE_SLIDES,
  infographic: FACTORY_TONE_INFOGRAPHIC,
}

/** Agent home — single mind accent for all factory kinds. */
export function agentFactoryTone(_kind: FactoryToneKind): FactoryToneClasses {
  return AGENT_FACTORY_TONE
}

/** Knowledge Studio — per-kind hues. */
export function kbFactoryTone(kind: FactoryToneKind): FactoryToneClasses {
  return KB_FACTORY_TONES[kind]
}

export const STUDIO_JOB_SHELL_CLASSES = [
  "bg-mind/8 shadow-sm shadow-mind/5 dark:bg-mind/15 dark:shadow-black/20",
  "bg-mind/8 shadow-sm shadow-mind/5 dark:bg-mind/15 dark:shadow-black/20",
  "bg-mind/8 shadow-sm shadow-mind/5 dark:bg-mind/15 dark:shadow-black/20",
] as const
