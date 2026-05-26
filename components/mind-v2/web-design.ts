/** Shared web workspace tokens — light, borderless, soft typography */
export const web = {
  canvas: "bg-gradient-to-br from-sky-50/25 via-[#f7f7f8] to-[#f7f7f8]",
  panel: "bg-white/80 backdrop-blur-sm",
  panelShadow: "shadow-sm shadow-sky-200/35",
  hairline: "border-black/[0.04]",
  hairlineSoft: "border-stone-100/80",
  railWidth: "w-[7rem]",
  secondaryWidth: "w-[15.5rem]",
  textPrimary: "text-zinc-700",
  textSecondary: "text-zinc-600",
  textMuted: "text-zinc-500",
  textSubtle: "text-zinc-400",
  accent: "text-mind",
  accentBg: "bg-mind/10",
  accentRing: "ring-mind/25",
  /** Primary + secondary nav — brand blue (mind / sky) */
  navSelectionGradient: "bg-gradient-to-br from-sky-50/95 to-blue-50/90",
  navSelectionText: "text-zinc-800",
  navSelectionTextSubtle: "text-zinc-700",
  navSelectionIcon: "text-mind",
  navSelectionCount: "text-sky-700/85",
  navItemBase:
    "rounded-xl transition-[background-color,color] duration-200 ease-out",
  navItemIdle: "text-zinc-600 hover:bg-sky-50/55 hover:text-zinc-800",
  navItemActive:
    "bg-gradient-to-br from-sky-50/95 to-blue-50/90 font-medium text-zinc-800 dark:from-sky-950/35 dark:to-blue-950/25 dark:text-zinc-100",
  navItemSubtleActive:
    "bg-gradient-to-br from-sky-50/85 to-blue-50/60 font-medium text-zinc-700 dark:from-sky-950/30 dark:to-blue-950/20 dark:text-zinc-200",
  navItemActiveIcon: "text-mind dark:text-sky-400",
  navItemActiveCount: "text-sky-700/85 dark:text-sky-400/90",
  railSurface:
    "bg-white/40 backdrop-blur-xl border-r border-stone-200/50",
  railTabBase:
    "flex w-full flex-col items-center gap-1 rounded-2xl py-2.5 transition-[background-color,color,transform] duration-200 ease-out",
  railTabIdle: "bg-transparent text-zinc-500 hover:bg-sky-50/45 hover:text-zinc-700",
  railTabActive: "text-zinc-800",
  /** Icon well behind active rail tab — landing sky/teal echo */
  railTabActiveWell:
    "bg-gradient-to-br from-sky-50/95 to-blue-50/90 shadow-sm shadow-sky-200/30 ring-1 ring-sky-100/55",
  navSelectionShadow: "shadow-sm shadow-sky-200/30",
  /** Shared chat composer — aligned with landing glass / sky accents */
  composerShell:
    "overflow-visible border bg-white/95 backdrop-blur-sm transition-[box-shadow,border-color,ring-color] duration-200 ease-out",
  composerShellHome:
    "rounded-xl border-sky-100/70 shadow-[0_20px_48px_-12px_rgba(59,130,246,0.1)] focus-within:border-sky-200/80 focus-within:shadow-[0_22px_52px_-10px_rgba(59,130,246,0.16)] focus-within:ring-2 focus-within:ring-sky-100/45 dark:border-zinc-700 dark:bg-zinc-900/95",
  composerShellThread:
    "rounded-[22px] border-stone-200/80 shadow-sm shadow-sky-200/25 focus-within:border-sky-200/75 focus-within:shadow-md focus-within:shadow-sky-200/30 focus-within:ring-2 focus-within:ring-sky-100/40 dark:border-zinc-700/90 dark:bg-zinc-900",
  composerToolBtn:
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-sky-50/90 hover:text-mind dark:text-zinc-400 dark:hover:bg-sky-950/40 dark:hover:text-sky-400",
  composerToolBtnActive: "bg-mind/10 text-mind dark:bg-mind/15 dark:text-mind",
  kbItemActive:
    "bg-gradient-to-br from-sky-50/95 to-blue-50/90 font-medium text-zinc-800",
  kbItemActiveCount: "text-sky-700/85",
  softType:
    "text-zinc-600 [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-zinc-700 [&_h2]:font-semibold [&_h2]:text-zinc-700 [&_h3]:font-medium [&_h3]:text-zinc-700 [&_h4]:font-medium [&_h4]:text-zinc-700 [&_strong]:font-medium [&_strong]:text-zinc-700",
} as const
