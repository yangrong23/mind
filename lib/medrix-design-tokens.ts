/**
 * Medrix Mind App V1.0 UI/UX — Tailwind tokens.
 *
 * **Color system (主题色衍生)**  
 * 一切有色相的 UI 色均从 **Medrix 标志青绿** 衍生：仅使用 **teal / cyan** 阶（邻近色，色相差距小），
 * 搭配 **无彩或极低彩** 的 stone / zinc / slate 中性色。  
 * 不使用粉、紫、橙、正红、正蓝等与主色相距远的纯色（特殊系统状态可用深 teal 表达「警示」）。
 */

import { cn } from "@/lib/utils"

export const mx = {
  pageBg: "bg-stone-50",

  /** Profile / hero: airy light wash — not a dark slab */
  brandHero:
    "bg-gradient-to-b from-white via-teal-50/70 to-cyan-50/50",
  brandHeroBorder: "border-b border-teal-100/90",

  brandOnHero: "text-zinc-800",
  brandOnHeroMuted: "text-zinc-500",
  /** Credits line: vivid brand hue on light ground */
  brandAccentOnHero: "text-teal-600",

  brandAvatarBg: "bg-gradient-to-br from-teal-100 to-cyan-100",
  brandHeroHover: "hover:bg-teal-50/80",

  /** Saturated accent for icons & inline emphasis */
  brandAccent: "text-teal-500",
  brandAccentHover: "hover:text-teal-600",
  brandAccentMuted: "text-teal-500/85",
  brandMutedBg: "bg-teal-50",
  brandMutedBgHover: "hover:bg-teal-100/90",
  brandSubtleBorder: "border-teal-200",

  /** Primary CTA — brighter teal (higher saturation than teal-600) */
  brandCta:
    "bg-teal-500 text-white hover:bg-teal-600 active:bg-teal-700 shadow-sm shadow-teal-500/25 border border-teal-400/50",
  brandCtaSoft:
    "bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100/95",

  brandFocusRing: "focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:ring-offset-2",

  settingsOnHero:
    "bg-teal-100/90 hover:bg-teal-200/80 border border-teal-200/60",

  citationLink: "text-slate-600 hover:text-slate-900",
  citationMuted: "text-slate-500",
  citationSubtleBg: "bg-slate-50",
  citationBorder: "border border-slate-200/90",

  libraryCta:
    "bg-teal-500 text-white hover:bg-teal-600 border border-teal-400/45 shadow-sm shadow-teal-500/20",
  libraryCtaSoft: "bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100/80",

  /** 警示仍在主色族内：深青强调，而非橙/红 */
  warningDot: "bg-teal-700",
  warningText: "text-teal-900",

  commercePopularBadge: "text-slate-600 bg-slate-100",
  commercePopularRing: "border-teal-200 ring-1 ring-teal-300/25",
  commercePrimaryCta: "bg-teal-500 text-white hover:bg-teal-600",
  commerceSecondaryCta: "bg-cyan-500 text-white hover:bg-cyan-600",

  creditsCard: "bg-white border border-stone-200/90 border-l-[3px] border-l-teal-500",
  creditsProgressTrack: "bg-stone-200",
  creditsProgressFill: "bg-teal-500",

  navIconNotes: "text-zinc-600",
  navIconLibrary: "text-teal-500",
  navIconInsight: "text-cyan-600",
} as const

/** Heatmap: teal-500 at opacity — reads greener/clearer than grayed teal-800 */
export function mxHeatmapCell(value: number) {
  return cn(
    "w-full aspect-square rounded-sm min-h-[10px] min-w-0 focus:outline-none focus:ring-2 focus:ring-teal-400/45 focus:ring-offset-1",
    value === 0 && "bg-stone-100 hover:bg-stone-200/80",
    value === 1 && "bg-teal-500/[0.14] hover:bg-teal-500/[0.22]",
    value === 2 && "bg-teal-500/[0.28] hover:bg-teal-500/[0.36]",
    value === 3 && "bg-teal-500/[0.42] hover:bg-teal-500/[0.52]",
    value >= 4 && "bg-teal-500/[0.58] hover:bg-teal-500/[0.68]"
  )
}

export function mxHeatmapCellTiny(value: number) {
  return cn(
    "rounded-[1px] min-w-[8px] p-0 border-0 focus:outline-none focus:ring-1 focus:ring-teal-400/50",
    value === 0 && "bg-stone-100 hover:bg-stone-200",
    value === 1 && "bg-teal-500/18 hover:bg-teal-500/28",
    value === 2 && "bg-teal-500/32 hover:bg-teal-500/42",
    value === 3 && "bg-teal-500/46 hover:bg-teal-500/56",
    value >= 4 && "bg-teal-500/60 hover:bg-teal-500/70"
  )
}
