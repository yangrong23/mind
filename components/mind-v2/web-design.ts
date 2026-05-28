/** Shared web workspace tokens — landing-aligned mesh, one shell, elevated white surfaces */
export const web = {
  /**
   * Workspace shell — same clear mesh as landing (slate · lavender · sky · violet).
   */
  shell:
    "bg-gradient-to-br from-[#fafbfc] via-[#f8f7fc] to-[#f7fafc] bg-[radial-gradient(ellipse_115%_78%_at_0%_-12%,rgba(125,211,252,0.26),transparent_54%),radial-gradient(ellipse_80%_55%_at_100%_-5%,rgba(253,230,138,0.07),transparent_46%),radial-gradient(ellipse_70%_50%_at_48%_6%,rgba(196,181,253,0.16),transparent_52%),radial-gradient(ellipse_85%_65%_at_88%_35%,rgba(147,197,253,0.12),transparent_50%),linear-gradient(180deg,rgba(252,253,255,0.97)_0%,rgba(248,250,252,0.98)_100%)]",

  canvas: "bg-transparent",

  chromeColumn: "bg-transparent",
  chromeSecondary: "bg-transparent",
  chromeAgentSidebar: "bg-transparent",

  /** @deprecated Credits live on each page — no global header band */
  shellHeader: "bg-transparent",

  /** Standard page padding (commercial rhythm) */
  pagePad: "px-6 py-5 lg:px-8",
  pagePadWide: "px-6 py-6 pb-14 lg:px-10 lg:py-8",

  pageTitle: "text-[28px] font-semibold tracking-tight text-zinc-900 sm:text-[30px]",
  pageSubtitle: "mt-1 text-[14px] leading-relaxed text-zinc-500",

  surfaceCard:
    "rounded-2xl border border-white/90 bg-white/92 shadow-[0_12px_40px_-16px_rgba(15,23,42,0.1)] backdrop-blur-md",
  surfaceCardFlat:
    "rounded-2xl border border-white/85 bg-white/88 shadow-[0_8px_28px_-14px_rgba(15,23,42,0.08)] backdrop-blur-sm",
  surfaceCardHover: "transition-[box-shadow,background-color,border-color] duration-200 hover:border-white hover:bg-white hover:shadow-[0_14px_44px_-16px_rgba(15,23,42,0.12)]",

  sectionIconWell:
    "flex items-center justify-center rounded-xl bg-white/80 text-zinc-600 ring-1 ring-black/[0.05] shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)]",

  panel: "rounded-2xl border border-white/90 bg-white/90 backdrop-blur-md",
  panelShadow: "shadow-[0_12px_40px_-16px_rgba(15,23,42,0.1)]",
  hairline: "border-black/[0.06]",
  hairlineSoft: "border-black/[0.04]",
  railWidth: "w-[7rem]",
  secondaryWidth: "w-[16rem]",
  /** Unified primary nav (destinations + recents) — replaces icon rail + secondary column */
  primaryNavWidth: "w-[14rem] sm:w-[14.5rem]",
  /** Library hub middle column — KB tree */
  libraryNavWidth: "w-[min(260px,28vw)] min-w-[220px] max-w-[300px]",
  /** Primary left nav typography */
  primaryNavCategoryTitle:
    "text-[14px] font-bold leading-snug tracking-[0.01em] text-zinc-800 antialiased break-words",
  primaryNavCategoryIcon: "h-4 w-4 shrink-0 text-zinc-500",
  primaryNavMoreLink:
    "text-[13px] font-semibold text-zinc-500 transition-colors hover:text-mind",
  primaryNavItem: "text-[13px] font-medium leading-snug text-zinc-800 antialiased",
  primaryNavItemMeta: "text-[12px] leading-relaxed text-zinc-500 antialiased",
  primaryNavFooterItem: "text-[14px] font-semibold text-zinc-800 antialiased",
  primaryNavLogoHeight: 38,
  primaryNavSurface:
    "border-r border-white/45 bg-gradient-to-b from-white/42 via-white/34 to-white/28 backdrop-blur-xl",
  /** Inset wells inside primary nav — one visual system, not stacked cards */
  primaryNavWell:
    "rounded-2xl border border-white/55 bg-white/36 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-sm",

  textPrimary: "text-zinc-900",
  textSecondary: "text-zinc-600",
  textMuted: "text-zinc-500",
  textSubtle: "text-zinc-400",
  accent: "text-mind",
  accentBg: "bg-mind/10",
  accentRing: "ring-mind/25",

  navSelectionGradient: "bg-white/70 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.08)]",
  navSelectionText: "text-zinc-900",
  navSelectionTextSubtle: "text-zinc-700",
  navSelectionIcon: "text-mind",
  navSelectionCount: "text-zinc-500",
  navItemBase:
    "rounded-xl transition-[background-color,color,box-shadow] duration-200 ease-out",
  navItemIdle: "text-zinc-600 hover:bg-white/50 hover:text-zinc-900",
  navItemActive: "bg-white/75 font-semibold text-zinc-900 shadow-[0_2px_10px_-6px_rgba(15,23,42,0.1)]",
  navItemSubtleActive: "bg-white/60 font-medium text-zinc-800",
  navItemActiveIcon: "text-mind",
  navItemActiveCount: "text-zinc-500",

  railSurface: "bg-transparent",
  railTabBase:
    "flex w-full flex-col items-center gap-1 rounded-2xl py-2.5 transition-[background-color,color] duration-200 ease-out",
  railTabIdle: "text-zinc-500 hover:bg-white/45 hover:text-zinc-800",
  railTabActive: "text-zinc-900",
  railTabActiveWell: "bg-white/65 shadow-[0_4px_14px_-8px_rgba(15,23,42,0.12)]",
  navSelectionShadow: "",

  composerShell:
    "overflow-visible border border-white/80 bg-white/90 backdrop-blur-xl shadow-[0_12px_40px_-18px_rgba(15,23,42,0.12)] transition-[box-shadow,border-color] duration-200 ease-out",
  composerShellHome:
    "rounded-2xl focus-within:border-white focus-within:bg-white focus-within:ring-2 focus-within:ring-mind/20",
  composerShellThread:
    "rounded-[22px] border-zinc-200/90 bg-white shadow-[0_10px_32px_-10px_rgba(15,23,42,0.18),0_2px_8px_-4px_rgba(15,23,42,0.08)] focus-within:border-zinc-300 focus-within:bg-white focus-within:shadow-[0_14px_40px_-10px_rgba(15,23,42,0.22),0_4px_12px_-4px_rgba(15,23,42,0.1)] focus-within:ring-2 focus-within:ring-mind/15",
  composerToolBtn:
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-mind/8 hover:text-mind",
  composerToolBtnActive: "bg-mind/12 text-mind",

  kbItemActive: "bg-white/80 font-semibold text-zinc-900 shadow-[0_2px_10px_-6px_rgba(15,23,42,0.08)]",
  kbItemActiveCount: "text-zinc-500",

  kbPanel:
    "rounded-2xl border border-white/90 bg-white/90 shadow-[0_12px_40px_-16px_rgba(15,23,42,0.1)] backdrop-blur-md",
  kbDivider: "border-black/[0.06]",
  kbInput:
    "w-full rounded-xl border border-white/80 bg-white/90 py-2.5 text-[13px] text-zinc-800 shadow-[0_2px_8px_-6px_rgba(15,23,42,0.06)] outline-none placeholder:text-zinc-400 focus:border-white focus:ring-2 focus:ring-mind/20",
  kbPrimaryBtn: "mind-btn rounded-xl",
  kbPrimaryBtnOutline:
    "border border-mind/22 bg-white/92 text-mind shadow-[0_4px_16px_-8px_rgba(15,23,42,0.07)] ring-1 ring-black/[0.04] hover:border-mind/32 hover:bg-mind-soft/80",
  /** Library sidebar — create actions (single-line labels) */
  kbCreateRow: "flex gap-2",
  kbCreateBtn:
    "flex min-h-[42px] min-w-0 flex-1 flex-nowrap items-center justify-center gap-1.5 rounded-xl px-2 text-[11px] font-semibold leading-none tracking-[0.02em] whitespace-nowrap sm:px-2.5 sm:text-[12px]",
  kbPlazaBrowseLink:
    "w-full rounded-xl border border-black/[0.06] bg-white/70 py-2.5 text-center text-[12px] font-medium text-zinc-600 transition-colors hover:border-mind/20 hover:bg-mind/[0.04] hover:text-mind",
  kbSubscribeOn: "border border-mind/30 bg-mind/10 text-mind",
  kbRowHover: "hover:bg-white/55",
  kbPill:
    "inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white/80 px-3 py-1.5 text-[12px] font-medium text-zinc-600 shadow-[0_2px_8px_-6px_rgba(15,23,42,0.06)] transition-colors",
  kbPillActive: "border-mind/30 bg-mind/10 text-mind",
  kbPlazaWell:
    "rounded-xl border border-black/[0.06] bg-white/90 shadow-[0_4px_16px_-10px_rgba(15,23,42,0.08)]",
  kbPromptBtn:
    "rounded-xl border border-white/80 bg-white/85 px-3.5 py-3 text-left text-[13px] leading-snug text-zinc-700 shadow-[0_2px_10px_-6px_rgba(15,23,42,0.06)] transition-colors hover:border-mind/25 hover:bg-mind/5",

  creditsPill:
    "inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/85 px-3 py-1.5 text-[12px] font-semibold text-zinc-800 shadow-[0_6px_20px_-10px_rgba(15,23,42,0.12)] backdrop-blur-md transition-[box-shadow,background-color] hover:bg-white hover:shadow-[0_8px_24px_-10px_rgba(15,23,42,0.14)]",

  softType:
    "text-zinc-600 [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-zinc-900 [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h3]:font-medium [&_h3]:text-zinc-900 [&_h4]:font-medium [&_h4]:text-zinc-900 [&_strong]:font-medium [&_strong]:text-zinc-900",

  /** Unified app typography — match layout Inter + premium rhythm */
  typeNavPanelTitle: "text-[15px] font-semibold tracking-tight text-zinc-900 antialiased",
  typeNavSectionTitle: "text-[13px] font-semibold leading-snug text-zinc-800 antialiased",
  typeNavSectionHint: "text-[11px] leading-snug text-zinc-500 antialiased",
  typeNavSection: "text-[13px] antialiased",
  typeNavItem: "text-[13px] antialiased",
  typeNavItemTitle: "text-[13px] font-medium leading-snug text-zinc-800",
  typeNavEmpty: "text-[12px] leading-relaxed text-zinc-500 antialiased",
  typeInput:
    "rounded-xl border border-black/[0.06] bg-white/90 text-[13px] text-zinc-800 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] outline-none placeholder:text-zinc-400 focus:border-mind/30 focus:ring-2 focus:ring-mind/15 antialiased",
  typePageTitle: "text-[22px] font-semibold tracking-tight text-zinc-900 antialiased sm:text-[24px]",
  typeBody: "text-[14px] leading-relaxed text-zinc-600 antialiased",
} as const
