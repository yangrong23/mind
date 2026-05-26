import { cn } from "@/lib/utils"

/** Uniform corner radius on all four corners (no rounded-top-only look) */
export const FACTORY_CARD_RADIUS = "rounded-[1.375rem]"

/** Inset controls inside modals (sliders, fields, segment tracks) */
export const FACTORY_FIELD_RADIUS = "rounded-[1.125rem]"

/** Segment buttons inside a track — same family as cards, not pill-top-only */
export const FACTORY_SEGMENT_RADIUS = "rounded-[1rem]"

export const FACTORY_ICON_RADIUS = "rounded-full"

export const FACTORY_TRACK_RADIUS = "rounded-full"

const factoryEase = "transition-[box-shadow,border-color,transform,background-color] duration-300 ease-out"

/** Modal / sheet shell — four matching corners (never rounded-top-only) */
export const FACTORY_MODAL_RADIUS = "rounded-[1.75rem] sm:rounded-3xl"

/** Outer shell — clip + border only; fills live on inner layers */
export const FACTORY_CARD_SHAPE = cn(
  FACTORY_CARD_RADIUS,
  "relative isolate overflow-hidden border border-stone-200/42",
  "shadow-[0_1px_2px_rgba(15,23,42,0.05)]",
  factoryEase,
  "dark:border-zinc-600/38"
)

export const FACTORY_CARD_SHAPE_HOVER =
  "hover:border-stone-200/55 hover:shadow-[0_4px_16px_-6px_rgba(15,23,42,0.08)]"

export const FACTORY_CARD_SHAPE_SELECTED = cn(
  "border-stone-200/60 bg-white",
  "shadow-[0_4px_14px_-6px_rgba(15,23,42,0.1)]",
  "dark:border-zinc-500/45 dark:bg-zinc-900/95 dark:shadow-[0_4px_14px_-6px_rgba(0,0,0,0.32)]"
)

/** Inner fill — inherits parent radius so all four corners match (no top-round / bottom-square) */
export const FACTORY_CARD_INNER_FILL = "pointer-events-none absolute inset-0 rounded-[inherit]"

/** Filled + selected: border/shadow only — background stays on inner fill layer */
export const FACTORY_CARD_FILLED_SELECTED = cn(
  "border-stone-200/65 shadow-[0_4px_14px_-6px_rgba(15,23,42,0.08)]",
  "dark:border-zinc-500/50 dark:shadow-[0_4px_14px_-6px_rgba(0,0,0,0.28)]"
)
