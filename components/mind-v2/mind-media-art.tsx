"use client"

import {
  FileText,
  Link2,
  Mic,
  Presentation,
  Sparkles,
  StickyNote,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { coverVisualForVariant } from "@/lib/library-cover-visual"
import type {
  DashboardContentKind,
  HubItemKind,
  LibraryCoverVariant,
} from "@/lib/product-media"

export type KnowledgeCoverFrameProps = {
  gradient: string
  glow: string
  icon: LucideIcon
  title?: string
  motif?: string
  badge?: string
  className?: string
  /** sm = list thumbnails; md = cards; lg = plaza / hero */
  density?: "sm" | "md" | "lg"
}

/** Premium library / plaza cover shell — shared visual language */
export function KnowledgeCoverFrame({
  gradient,
  glow,
  icon: Icon,
  title,
  motif,
  badge,
  className,
  density = "md",
}: KnowledgeCoverFrameProps) {
  const iconBox =
    density === "lg" ? "h-12 w-12" : density === "sm" ? "h-9 w-9" : "h-10 w-10"
  const iconSize =
    density === "lg" ? "h-6 w-6" : density === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]"
  const showFooter = Boolean(title) && density !== "sm"
  const showMotif = Boolean(motif) && density !== "sm"

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-br text-white",
        gradient,
        className
      )}
      aria-hidden
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", glow)} />
      <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/[0.08] blur-2xl" />
      <div className="pointer-events-none absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-black/10 blur-xl" />
      <div
        className="absolute inset-0 opacity-[0.09]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 0.75px, transparent 0)",
          backgroundSize: density === "sm" ? "8px 8px" : "11px 11px",
        }}
      />

      <div
        className={cn(
          "relative flex flex-1 flex-col",
          density === "sm" ? "items-center justify-center p-2" : "justify-between p-2.5 sm:p-3"
        )}
      >
        {density !== "sm" ? (
          <div className="flex items-start justify-between gap-2">
            <span
              className={cn(
                "flex items-center justify-center rounded-xl bg-white/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] ring-1 ring-white/25 backdrop-blur-md",
                iconBox
              )}
            >
              <Icon className={cn(iconSize, "text-white drop-shadow-sm")} strokeWidth={1.75} />
            </span>
            {badge ? (
              <span className="rounded-md bg-black/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-white/90 backdrop-blur-sm">
                {badge}
              </span>
            ) : null}
          </div>
        ) : (
          <span
            className={cn(
              "flex items-center justify-center rounded-lg bg-white/[0.14] ring-1 ring-white/25 backdrop-blur-sm",
              iconBox
            )}
          >
            <Icon className={cn(iconSize, "text-white")} strokeWidth={1.75} />
          </span>
        )}

        {showMotif || (showFooter && title) ? (
          <div className="space-y-0.5">
            {showMotif ? (
              <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-white/55">{motif}</p>
            ) : null}
            {showFooter && title ? (
              <p
                className={cn(
                  "font-semibold leading-tight text-white/95 drop-shadow-sm",
                  density === "lg" ? "line-clamp-2 text-[11px]" : "line-clamp-1 text-[10px]"
                )}
              >
                {title}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

const HUB_KIND: Record<HubItemKind, { bg: string; icon: LucideIcon; label: string }> = {
  pdf: { bg: "from-red-500/15 to-red-50", icon: FileText, label: "PDF" },
  document: { bg: "from-mind/16 to-mind/[0.06]", icon: FileText, label: "Doc" },
  note: { bg: "from-amber-500/15 to-amber-50", icon: StickyNote, label: "Note" },
  link: { bg: "from-mind/14 to-mind/[0.05]", icon: Link2, label: "Link" },
  audio: { bg: "from-mind/12 to-mind/[0.05]", icon: Mic, label: "Audio" },
  slides: { bg: "from-mind/18 to-mind/[0.07]", icon: Presentation, label: "Slides" },
  text: { bg: "from-stone-400/15 to-stone-50", icon: StickyNote, label: "Text" },
}

const DASHBOARD_KIND: Record<DashboardContentKind, { gradient: string; tag: string }> = {
  strategy: { gradient: "from-violet-500/20 via-white to-sky-50", tag: "Strategy" },
  research: { gradient: "from-mind/18 via-white to-mind/[0.04]", tag: "Research" },
  market: { gradient: "from-amber-500/20 via-white to-orange-50", tag: "Market" },
}

/** Library card / plaza cover — domain icon + formal gradient */
export function LibraryCoverArt({
  variant = "default",
  name,
  className,
  showMiniUi = false,
}: {
  variant?: LibraryCoverVariant
  name?: string
  className?: string
  /** @deprecated Premium icon covers always used; true = card density */
  showMiniUi?: boolean
}) {
  const visual = coverVisualForVariant(variant)
  return (
    <KnowledgeCoverFrame
      gradient={visual.gradient}
      glow={visual.glow}
      icon={visual.icon}
      title={name ?? visual.label}
      motif={visual.motif}
      badge={visual.label}
      density={showMiniUi ? "lg" : "sm"}
      className={className}
    />
  )
}

export function HubItemThumb({
  kind = "document",
  className,
  size = "md",
}: {
  kind?: HubItemKind
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const style = HUB_KIND[kind] ?? HUB_KIND.document
  const Icon = style.icon
  const box =
    size === "sm" ? "h-10 w-10 rounded-lg" : size === "lg" ? "h-14 w-14 rounded-xl" : "h-12 w-12 rounded-lg"
  const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5"
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-gradient-to-br ring-1 ring-black/[0.04]",
        style.bg,
        box,
        className
      )}
      aria-hidden
    >
      <Icon className={cn(icon, "text-mind")} strokeWidth={1.85} />
    </div>
  )
}

export function DashboardContinueThumb({
  kind,
  className,
}: {
  kind: DashboardContentKind
  className?: string
}) {
  const style = DASHBOARD_KIND[kind]
  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-br p-3",
        style.gradient,
        className
      )}
      aria-hidden
    >
      <div className="flex items-center gap-1.5">
        <span className="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
          {style.tag}
        </span>
      </div>
      <div className="mt-2 flex flex-1 flex-col overflow-hidden rounded-lg border border-white/80 bg-white/90 shadow-sm">
        <div className="border-b border-stone-100 px-2 py-1.5">
          <div className="h-1.5 w-3/4 rounded bg-stone-300" />
        </div>
        <div className="space-y-1 p-2">
          <div className="h-1 w-full rounded bg-stone-100" />
          <div className="h-1 w-5/6 rounded bg-stone-100" />
          <div className="h-6 rounded bg-sky-50" />
        </div>
      </div>
      <div className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-sm">
        <Sparkles className="h-3 w-3 text-mind" strokeWidth={2} />
      </div>
    </div>
  )
}

export function PersonAvatar({
  name,
  className,
  size = "md",
}: {
  name: string
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const initial = name.trim().slice(0, 1).toUpperCase() || "?"
  const box =
    size === "sm" ? "h-8 w-8 text-[11px]" : size === "lg" ? "h-14 w-14 text-[18px]" : "h-10 w-10 text-[13px]"
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-400 font-bold text-white shadow-sm",
        box,
        className
      )}
      aria-hidden
    >
      {initial}
    </span>
  )
}

/** Agent tile avatar — emoji or initials, never stock photo */
export function AgentAvatarArt({
  avatar,
  name,
  colorClass = "from-zinc-500 to-stone-600",
  className,
  size = "md",
}: {
  avatar?: string
  name: string
  colorClass?: string
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const isEmoji = avatar && avatar.length <= 4 && !avatar.startsWith("http")
  const box =
    size === "sm" ? "h-12 w-12 text-xl" : size === "lg" ? "h-16 w-16 text-2xl" : "h-14 w-14 text-xl"
  if (isEmoji) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br shadow-sm",
          colorClass,
          box,
          className
        )}
        aria-hidden
      >
        {avatar}
      </span>
    )
  }
  return (
    <PersonAvatar
      name={name}
      className={cn(box, `bg-gradient-to-br ${colorClass}`, className)}
      size={size === "lg" ? "lg" : size === "sm" ? "sm" : "md"}
    />
  )
}
