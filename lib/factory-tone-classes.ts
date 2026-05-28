/**
 * Content factory card / modal tone class bundles (Tailwind).
 * KB Studio — soft pastel monochromatic tiles (light wash + deep same-hue ink).
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
  filledBorder: string
}

const FACTORY_FIELD_FOCUS =
  "focus:border-mind/30 focus:outline-none focus:ring-1 focus:ring-mind/20" as const

/** Pastel card — pale shell, deeper icon well, saturated label/icon ink. */
function studioPastelTone({
  shell,
  shellHover,
  well,
  icon,
  sparkle,
  border,
  ring,
  pillBorder,
  pillBg,
  pillText,
  softHover,
  shadowRgb,
}: {
  shell: string
  shellHover: string
  well: string
  icon: string
  sparkle: string
  border: string
  ring: string
  pillBorder: string
  pillBg: string
  pillText: string
  softHover: string
  shadowRgb: string
}): FactoryToneClasses {
  return {
    well,
    icon,
    sparkle,
    pillOn: `${pillBorder} ${pillBg} ${pillText}`,
    cardOn: pillBg,
    check: icon,
    styleCardOn: pillBg,
    fieldFocus: FACTORY_FIELD_FOCUS,
    softHover,
    filledShell: shell,
    filledShellHover: shellHover,
    filledOverlay: "",
    filledOverlayHover: "",
    filledCornerGlow: "",
    filledIconRing: ring,
    filledOptionBg: shell,
    filledShadow: `shadow-[0_1px_10px_-4px_rgba(${shadowRgb},0.1)]`,
    filledShadowHover: `hover:shadow-[0_4px_14px_-4px_rgba(${shadowRgb},0.16)]`,
    filledBorder: border,
  }
}

/** Periwinkle / sky */
const FACTORY_TONE_REPORT = studioPastelTone({
  shell: "bg-indigo-50 dark:bg-indigo-950/45",
  shellHover: "group-hover:bg-indigo-100/80 dark:group-hover:bg-indigo-900/55",
  well: "bg-indigo-100/90 dark:bg-indigo-900/55",
  icon: "text-indigo-900 dark:text-indigo-100",
  sparkle: "text-indigo-600 dark:text-indigo-300",
  border: "border-indigo-100/90 dark:border-indigo-800/40",
  ring: "ring-indigo-200/60 dark:ring-indigo-700/40",
  pillBorder: "border-indigo-100",
  pillBg: "bg-indigo-50",
  pillText: "text-indigo-900 dark:text-indigo-100",
  softHover: "hover:border-indigo-200/80 hover:bg-indigo-100/90 dark:hover:bg-indigo-900/55",
  shadowRgb: "99,102,241",
})

/** Mint */
const FACTORY_TONE_AUDIO = studioPastelTone({
  shell: "bg-emerald-50 dark:bg-emerald-950/45",
  shellHover: "group-hover:bg-emerald-100/80 dark:group-hover:bg-emerald-900/55",
  well: "bg-emerald-100/90 dark:bg-emerald-900/55",
  icon: "text-emerald-900 dark:text-emerald-100",
  sparkle: "text-emerald-700 dark:text-emerald-300",
  border: "border-emerald-100/90 dark:border-emerald-800/40",
  ring: "ring-emerald-200/60 dark:ring-emerald-700/40",
  pillBorder: "border-emerald-100",
  pillBg: "bg-emerald-50",
  pillText: "text-emerald-900 dark:text-emerald-100",
  softHover: "hover:border-emerald-200/80 hover:bg-emerald-100/90 dark:hover:bg-emerald-900/55",
  shadowRgb: "16,185,129",
})

/** Lilac */
const FACTORY_TONE_FLASHCARDS = studioPastelTone({
  shell: "bg-purple-50 dark:bg-purple-950/45",
  shellHover: "group-hover:bg-purple-100/80 dark:group-hover:bg-purple-900/55",
  well: "bg-purple-100/90 dark:bg-purple-900/55",
  icon: "text-purple-900 dark:text-purple-100",
  sparkle: "text-purple-600 dark:text-purple-300",
  border: "border-purple-100/90 dark:border-purple-800/40",
  ring: "ring-purple-200/60 dark:ring-purple-700/40",
  pillBorder: "border-purple-100",
  pillBg: "bg-purple-50",
  pillText: "text-purple-900 dark:text-purple-100",
  softHover: "hover:border-purple-200/80 hover:bg-purple-100/90 dark:hover:bg-purple-900/55",
  shadowRgb: "168,85,247",
})

/** Lavender */
const FACTORY_TONE_QUIZ = studioPastelTone({
  shell: "bg-violet-50 dark:bg-violet-950/45",
  shellHover: "group-hover:bg-violet-100/80 dark:group-hover:bg-violet-900/55",
  well: "bg-violet-100/90 dark:bg-violet-900/55",
  icon: "text-violet-900 dark:text-violet-100",
  sparkle: "text-violet-600 dark:text-violet-300",
  border: "border-violet-100/90 dark:border-violet-800/40",
  ring: "ring-violet-200/60 dark:ring-violet-700/40",
  pillBorder: "border-violet-100",
  pillBg: "bg-violet-50",
  pillText: "text-violet-900 dark:text-violet-100",
  softHover: "hover:border-violet-200/80 hover:bg-violet-100/90 dark:hover:bg-violet-900/55",
  shadowRgb: "139,92,246",
})

/** Cream / ochre */
const FACTORY_TONE_SLIDES = studioPastelTone({
  shell: "bg-amber-50 dark:bg-amber-950/40",
  shellHover: "group-hover:bg-amber-100/85 dark:group-hover:bg-amber-900/50",
  well: "bg-amber-100/90 dark:bg-amber-900/50",
  icon: "text-amber-950 dark:text-amber-50",
  sparkle: "text-amber-800 dark:text-amber-200",
  border: "border-amber-100/90 dark:border-amber-800/40",
  ring: "ring-amber-200/60 dark:ring-amber-700/40",
  pillBorder: "border-amber-100",
  pillBg: "bg-amber-50",
  pillText: "text-amber-950 dark:text-amber-50",
  softHover: "hover:border-amber-200/80 hover:bg-amber-100/90 dark:hover:bg-amber-900/50",
  shadowRgb: "217,119,6",
})

/** Dusty rose */
const FACTORY_TONE_INFOGRAPHIC = studioPastelTone({
  shell: "bg-rose-50 dark:bg-rose-950/45",
  shellHover: "group-hover:bg-rose-100/80 dark:group-hover:bg-rose-900/55",
  well: "bg-rose-100/90 dark:bg-rose-900/55",
  icon: "text-rose-900 dark:text-rose-100",
  sparkle: "text-rose-700 dark:text-rose-300",
  border: "border-rose-100/90 dark:border-rose-800/40",
  ring: "ring-rose-200/60 dark:ring-rose-700/40",
  pillBorder: "border-rose-100",
  pillBg: "bg-rose-50",
  pillText: "text-rose-900 dark:text-rose-100",
  softHover: "hover:border-rose-200/80 hover:bg-rose-100/90 dark:hover:bg-rose-900/55",
  shadowRgb: "244,63,94",
})

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
  filledBorder: FACTORY_TONE_REPORT.filledBorder,
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

/** Knowledge Studio — pastel monochromatic per format. */
export function kbFactoryTone(kind: FactoryToneKind): FactoryToneClasses {
  return KB_FACTORY_TONES[kind]
}

export const STUDIO_JOB_SHELL_CLASSES = [
  "bg-violet-50/95 shadow-sm shadow-indigo-500/8 ring-1 ring-indigo-100/80 dark:bg-violet-950/40 dark:ring-violet-800/35 dark:shadow-black/20",
  "bg-violet-50/95 shadow-sm shadow-indigo-500/8 ring-1 ring-indigo-100/80 dark:bg-violet-950/40 dark:ring-violet-800/35 dark:shadow-black/20",
  "bg-violet-50/95 shadow-sm shadow-indigo-500/8 ring-1 ring-indigo-100/80 dark:bg-violet-950/40 dark:ring-violet-800/35 dark:shadow-black/20",
] as const
