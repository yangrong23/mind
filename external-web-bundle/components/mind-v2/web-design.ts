/** Shared web workspace tokens — light, borderless, soft typography */
export const web = {
  canvas: "bg-[#f7f7f8]",
  panel: "bg-white/80 backdrop-blur-sm",
  panelShadow: "shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
  hairline: "border-black/[0.04]",
  hairlineSoft: "border-stone-100/80",
  railWidth: "w-[7rem]",
  secondaryWidth: "w-[15.5rem]",
  /** Primary copy — softer than zinc-900 */
  textPrimary: "text-zinc-700",
  textSecondary: "text-zinc-600",
  textMuted: "text-zinc-500",
  textSubtle: "text-zinc-400",
  accent: "text-teal-600/90",
  accentBg: "bg-teal-50/90",
  accentRing: "ring-teal-200/50",
  /** Primary + secondary nav — shared teal/violet selection (matches icon rail) */
  navSelectionGradient: "bg-gradient-to-br from-teal-50/95 to-violet-50/75",
  navSelectionText: "text-zinc-800",
  navSelectionTextSubtle: "text-zinc-700",
  navSelectionIcon: "text-teal-600",
  navSelectionCount: "text-teal-700/75",
  /** Sidebar list row — agent nav, KB list, recent chats */
  navItemBase:
    "rounded-xl transition-[background-color,box-shadow,color] duration-200 ease-out",
  navItemIdle: "text-zinc-600 hover:bg-white/55 hover:text-zinc-800",
  navItemActive:
    "bg-gradient-to-br from-teal-50/95 to-violet-50/75 font-medium text-zinc-800 dark:from-teal-950/40 dark:to-violet-950/30 dark:text-zinc-100",
  navItemSubtleActive:
    "bg-gradient-to-br from-teal-50/85 to-violet-50/55 font-medium text-zinc-700 dark:from-teal-950/35 dark:to-violet-950/25 dark:text-zinc-200",
  navItemActiveIcon: "text-teal-600 dark:text-teal-400",
  navItemActiveCount: "text-teal-700/75 dark:text-teal-400/90",
  /** Icon rail — vertical main tabs */
  railTabBase:
    "flex w-full flex-col items-center gap-1 rounded-xl py-2.5 transition-[background-color,box-shadow,color] duration-200 ease-out",
  railTabIdle: "text-zinc-500 hover:bg-white/50 hover:text-zinc-700",
  railTabActive:
    "bg-gradient-to-br from-teal-50/95 to-violet-50/75 text-zinc-800 dark:from-teal-950/40 dark:to-violet-950/30 dark:text-zinc-200",
  /** Optional soft lift for compact nav chips (no ring) */
  navSelectionShadow: "shadow-sm",
  /** @deprecated Use navItemActive */
  kbItemActive:
    "bg-gradient-to-br from-teal-50/95 to-violet-50/75 font-medium text-zinc-800",
  kbItemActiveCount: "text-teal-700/75",
  /** Root shell: default body + heading weight */
  softType:
    "text-zinc-600 [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-zinc-700 [&_h2]:font-semibold [&_h2]:text-zinc-700 [&_h3]:font-medium [&_h3]:text-zinc-700 [&_h4]:font-medium [&_h4]:text-zinc-700 [&_strong]:font-medium [&_strong]:text-zinc-700",
} as const
