/**
 * Medrix Mind — mostly neutral with restrained sky / emerald / indigo accents.
 */

import { cn } from "@/lib/utils"

export const mx = {
  pageBg: "bg-stone-50",

  brandHero: "bg-gradient-to-b from-sky-50/80 via-white to-teal-50/40",
  brandHeroBorder: "border-b border-sky-100/85",

  brandOnHero: "text-zinc-900",
  brandOnHeroMuted: "text-zinc-500",
  brandAccentOnHero: "text-sky-700",

  brandAvatarBg: "bg-gradient-to-br from-stone-200 to-stone-300",
  brandHeroHover: "hover:bg-sky-50/90",

  /** Links & lightweight emphasis (keeps chroma low) */
  accentBlue: "text-sky-600",
  accentBlueHover: "hover:text-sky-700",
  accentBlueMuted: "text-sky-600/90",
  accentBlueBg: "bg-sky-600",
  accentBlueSoft: "bg-sky-50",

  accentPersonalAvatar: "bg-emerald-500 text-white",
  accentPersonalSoft: "bg-emerald-50",
  accentPersonalRing: "ring-2 ring-emerald-200/80",

  accentWorkSoft: "bg-indigo-50",
  accentWorkIcon: "text-indigo-600",

  brandAccent: "text-sky-700",
  brandAccentHover: "hover:text-sky-800",
  brandAccentMuted: "text-sky-700/90",
  brandMutedBg: "bg-stone-100",
  brandMutedBgHover: "hover:bg-stone-200/85",
  brandSubtleBorder: "border-stone-200",

  brandCta:
    "bg-sky-600 text-white hover:bg-sky-700 active:bg-sky-800 shadow-sm shadow-sky-600/20 border border-sky-700/40",
  brandCtaSoft:
    "bg-sky-50 text-sky-900 border border-sky-100 hover:bg-sky-100/90",

  brandFocusRing: "focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:ring-offset-2",

  settingsOnHero:
    "bg-white/70 hover:bg-white border border-sky-100/90 shadow-sm shadow-sky-900/5",

  citationLink: "text-sky-700 hover:text-sky-800",
  citationMuted: "text-zinc-500",
  citationSubtleBg: "bg-stone-50",
  citationBorder: "border border-stone-200/90",

  libraryCta:
    "bg-sky-600 text-white hover:bg-sky-700 border border-sky-700/50 shadow-sm shadow-sky-600/15",
  libraryCtaSoft: "bg-sky-50 text-sky-900 border border-sky-100 hover:bg-sky-100/85",

  warningDot: "bg-zinc-600",
  warningText: "text-zinc-900",

  commercePopularBadge: "text-zinc-600 bg-stone-100",
  commercePopularRing: "border-stone-200 ring-1 ring-stone-300/25",
  commercePrimaryCta: "bg-zinc-900 text-white hover:bg-zinc-800",
  commerceSecondaryCta: "bg-zinc-800 text-white hover:bg-zinc-900",

  creditsCard: "bg-white border border-stone-200/90 border-l-[3px] border-l-sky-600",
  creditsProgressTrack: "bg-stone-200",
  creditsProgressFill: "bg-sky-600",

  navIconNotes: "text-zinc-600",
  navIconLibrary: "text-zinc-700",
  navIconInsight: "text-zinc-600",

  /** Bottom tab: active pill */
  navActiveWell: "bg-sky-100/95",
  navActiveIcon: "text-sky-800",
  navActiveLabel: "text-sky-900",
} as const

/** Heatmap: slight cool tint at higher activity */
export function mxHeatmapCell(value: number) {
  return cn(
    "w-full aspect-square rounded-sm min-h-[10px] min-w-0 focus:outline-none focus:ring-2 focus:ring-sky-400/35 focus:ring-offset-1",
    value === 0 && "bg-stone-100 hover:bg-stone-200/80",
    value === 1 && "bg-sky-700/[0.10] hover:bg-sky-700/[0.16]",
    value === 2 && "bg-sky-700/[0.22] hover:bg-sky-700/[0.30]",
    value === 3 && "bg-sky-700/[0.34] hover:bg-sky-700/[0.42]",
    value >= 4 && "bg-sky-800/[0.48] hover:bg-sky-800/[0.56]"
  )
}

export function mxHeatmapCellTiny(value: number) {
  return cn(
    "rounded-[1px] min-w-[8px] p-0 border-0 focus:outline-none focus:ring-1 focus:ring-sky-400/40",
    value === 0 && "bg-stone-100 hover:bg-stone-200",
    value === 1 && "bg-sky-700/14 hover:bg-sky-700/22",
    value === 2 && "bg-sky-700/26 hover:bg-sky-700/36",
    value === 3 && "bg-sky-800/40 hover:bg-sky-800/48",
    value >= 4 && "bg-sky-800/54 hover:bg-sky-800/62"
  )
}
