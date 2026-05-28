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
  filledBorder: string
}

const FACTORY_FIELD_FOCUS =
  "focus:border-mind/30 focus:outline-none focus:ring-1 focus:ring-mind/20" as const

const STUDIO_NEUTRAL_SHADOW =
  "shadow-[0_2px_10px_-6px_rgba(15,23,42,0.06)]" as const
const STUDIO_NEUTRAL_SHADOW_HOVER =
  "hover:shadow-[0_4px_14px_-6px_rgba(15,23,42,0.09)]" as const

/** KB Studio — near canvas bg, same cool-gray family, slightly deeper per tile. */
function studioKbTone({
  shell,
  shellHover,
  well,
  border = "border-stone-200/60 dark:border-zinc-600/38",
  ring = "ring-stone-200/55 dark:ring-zinc-600/35",
}: {
  shell: string
  shellHover: string
  well: string
  border?: string
  ring?: string
}): FactoryToneClasses {
  return {
    well,
    icon: "text-zinc-600 dark:text-zinc-300",
    sparkle: "text-zinc-500 dark:text-zinc-400",
    pillOn:
      "border-stone-200/55 bg-stone-100/85 text-zinc-700 dark:border-zinc-600/45 dark:bg-zinc-800/55 dark:text-zinc-200",
    cardOn: "bg-stone-100/80 dark:bg-zinc-800/50",
    check: "text-zinc-600 dark:text-zinc-300",
    styleCardOn: "bg-stone-100/80 dark:bg-zinc-800/50",
    fieldFocus: FACTORY_FIELD_FOCUS,
    softHover:
      "hover:border-stone-200/55 hover:bg-stone-100/90 dark:hover:border-zinc-600/40 dark:hover:bg-zinc-800/58",
    filledShell: shell,
    filledShellHover: shellHover,
    filledOverlay: "",
    filledOverlayHover: "",
    filledCornerGlow: "",
    filledIconRing: ring,
    filledOptionBg: shell,
    filledShadow: STUDIO_NEUTRAL_SHADOW,
    filledShadowHover: STUDIO_NEUTRAL_SHADOW_HOVER,
    filledBorder: border,
  }
}

const FACTORY_TONE_REPORT = studioKbTone({
  shell: "bg-stone-100/95 dark:bg-zinc-800/52",
  shellHover: "group-hover:bg-stone-200/50 dark:group-hover:bg-zinc-800/60",
  well: "bg-stone-200/40 dark:bg-zinc-700/42",
})

const FACTORY_TONE_AUDIO = studioKbTone({
  shell: "bg-slate-100/95 dark:bg-zinc-800/52",
  shellHover: "group-hover:bg-slate-200/48 dark:group-hover:bg-zinc-800/60",
  well: "bg-slate-200/38 dark:bg-zinc-700/42",
  border: "border-slate-200/55 dark:border-zinc-600/38",
  ring: "ring-slate-200/50 dark:ring-zinc-600/35",
})

const FACTORY_TONE_FLASHCARDS = studioKbTone({
  shell: "bg-zinc-100/95 dark:bg-zinc-800/52",
  shellHover: "group-hover:bg-zinc-200/45 dark:group-hover:bg-zinc-800/60",
  well: "bg-zinc-200/36 dark:bg-zinc-700/42",
  border: "border-zinc-200/55 dark:border-zinc-600/38",
  ring: "ring-zinc-200/50 dark:ring-zinc-600/35",
})

const FACTORY_TONE_QUIZ = studioKbTone({
  shell: "bg-neutral-100/95 dark:bg-zinc-800/52",
  shellHover: "group-hover:bg-neutral-200/45 dark:group-hover:bg-zinc-800/60",
  well: "bg-neutral-200/36 dark:bg-zinc-700/42",
  border: "border-neutral-200/55 dark:border-zinc-600/38",
  ring: "ring-neutral-200/50 dark:ring-zinc-600/35",
})

const FACTORY_TONE_SLIDES = studioKbTone({
  shell: "bg-stone-200/32 dark:bg-zinc-800/52",
  shellHover: "group-hover:bg-stone-200/48 dark:group-hover:bg-zinc-800/60",
  well: "bg-stone-200/42 dark:bg-zinc-700/42",
})

const FACTORY_TONE_INFOGRAPHIC = studioKbTone({
  shell: "bg-slate-100/95 dark:bg-zinc-800/52",
  shellHover: "group-hover:bg-slate-200/52 dark:group-hover:bg-zinc-800/60",
  well: "bg-slate-200/40 dark:bg-zinc-700/42",
  border: "border-slate-200/58 dark:border-zinc-600/38",
  ring: "ring-slate-200/52 dark:ring-zinc-600/35",
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

/** Knowledge Studio — per-kind hues. */
export function kbFactoryTone(kind: FactoryToneKind): FactoryToneClasses {
  return KB_FACTORY_TONES[kind]
}

export const STUDIO_JOB_SHELL_CLASSES = [
  "bg-stone-100/90 shadow-sm shadow-stone-900/5 dark:bg-zinc-800/55 dark:shadow-black/20",
  "bg-stone-100/90 shadow-sm shadow-stone-900/5 dark:bg-zinc-800/55 dark:shadow-black/20",
  "bg-stone-100/90 shadow-sm shadow-stone-900/5 dark:bg-zinc-800/55 dark:shadow-black/20",
] as const
