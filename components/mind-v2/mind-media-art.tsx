"use client"

import {
  BarChart3,
  BookOpen,
  FileText,
  FlaskConical,
  Globe,
  Layers,
  Link2,
  Mic,
  Presentation,
  Sparkles,
  StickyNote,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type {
  DashboardContentKind,
  HubItemKind,
  LibraryCoverVariant,
} from "@/lib/product-media"

const COVER_STYLES: Record<
  LibraryCoverVariant,
  { gradient: string; icon: LucideIcon; label: string }
> = {
  product: {
    gradient: "from-zinc-600 via-zinc-500 to-stone-400",
    icon: Layers,
    label: "Library",
  },
  study: {
    gradient: "from-sky-600 via-sky-500 to-cyan-400",
    icon: BookOpen,
    label: "Study",
  },
  reading: {
    gradient: "from-violet-600 via-purple-500 to-fuchsia-400",
    icon: BookOpen,
    label: "Reading",
  },
  engineering: {
    gradient: "from-slate-700 via-slate-600 to-zinc-500",
    icon: FileText,
    label: "Docs",
  },
  design: {
    gradient: "from-rose-500 via-pink-500 to-orange-400",
    icon: Sparkles,
    label: "Design",
  },
  research: {
    gradient: "from-indigo-600 via-blue-600 to-sky-500",
    icon: FlaskConical,
    label: "Research",
  },
  education: {
    gradient: "from-teal-600 via-emerald-500 to-lime-400",
    icon: BookOpen,
    label: "Education",
  },
  health: {
    gradient: "from-emerald-600 via-teal-500 to-cyan-400",
    icon: FlaskConical,
    label: "Health",
  },
  tech: {
    gradient: "from-cyan-600 via-sky-500 to-blue-500",
    icon: Sparkles,
    label: "Tech",
  },
  work: {
    gradient: "from-amber-600 via-orange-500 to-yellow-400",
    icon: Layers,
    label: "Work",
  },
  finance: {
    gradient: "from-stone-600 via-zinc-600 to-slate-500",
    icon: BarChart3,
    label: "Finance",
  },
  legal: {
    gradient: "from-neutral-700 via-stone-600 to-zinc-500",
    icon: FileText,
    label: "Legal",
  },
  humanities: {
    gradient: "from-amber-700 via-rose-600 to-violet-500",
    icon: BookOpen,
    label: "Humanities",
  },
  lifestyle: {
    gradient: "from-pink-500 via-rose-400 to-orange-300",
    icon: StickyNote,
    label: "Life",
  },
  default: {
    gradient: "from-zinc-500 via-stone-500 to-zinc-400",
    icon: Layers,
    label: "Library",
  },
}

const HUB_KIND: Record<HubItemKind, { bg: string; icon: LucideIcon; label: string }> = {
  pdf: { bg: "from-red-500/15 to-red-50", icon: FileText, label: "PDF" },
  document: { bg: "from-sky-500/15 to-sky-50", icon: FileText, label: "Doc" },
  note: { bg: "from-amber-500/15 to-amber-50", icon: StickyNote, label: "Note" },
  link: { bg: "from-violet-500/15 to-violet-50", icon: Link2, label: "Link" },
  audio: { bg: "from-cyan-500/15 to-cyan-50", icon: Mic, label: "Audio" },
  slides: { bg: "from-indigo-500/15 to-indigo-50", icon: Presentation, label: "Slides" },
  text: { bg: "from-stone-400/15 to-stone-50", icon: StickyNote, label: "Text" },
}

const DASHBOARD_KIND: Record<DashboardContentKind, { gradient: string; tag: string }> = {
  strategy: { gradient: "from-violet-500/20 via-white to-sky-50", tag: "Strategy" },
  research: { gradient: "from-sky-500/20 via-white to-emerald-50", tag: "Research" },
  market: { gradient: "from-amber-500/20 via-white to-orange-50", tag: "Market" },
}

/** Library card / plaza cover — mini workspace preview, not stock photo */
export function LibraryCoverArt({
  variant = "default",
  name,
  className,
  showMiniUi = true,
}: {
  variant?: LibraryCoverVariant
  name?: string
  className?: string
  showMiniUi?: boolean
}) {
  const style = COVER_STYLES[variant] ?? COVER_STYLES.default
  const Icon = style.icon
  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-br text-white",
        style.gradient,
        className
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(255,255,255,0.22),transparent_55%)]" />
      {showMiniUi ? (
        <div className="relative m-3 flex flex-1 flex-col overflow-hidden rounded-lg border border-white/25 bg-white/95 shadow-lg">
          <div className="flex h-5 items-center gap-1 border-b border-stone-100 bg-stone-50 px-2">
            <span className="size-1 rounded-full bg-red-400" />
            <span className="size-1 rounded-full bg-amber-400" />
            <span className="size-1 rounded-full bg-emerald-400" />
            <span className="ml-1 h-1 flex-1 max-w-[40%] rounded bg-stone-200" />
          </div>
          <div className="flex min-h-0 flex-1">
            <div className="w-[28%] border-r border-stone-100 bg-stone-50/80 p-1">
              <div className="mb-1 h-1.5 w-full rounded bg-mind/30" />
              <div className="space-y-0.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={cn("h-1 rounded", i === 1 ? "bg-stone-200" : "bg-stone-100")} />
                ))}
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-1 p-1.5">
              <div className="h-2 w-2/3 rounded bg-stone-200" />
              <div className="flex-1 rounded bg-gradient-to-b from-sky-50 to-white" />
            </div>
            <div className="w-[24%] border-l border-stone-100 bg-stone-50/50 p-1">
              <div className="grid grid-cols-1 gap-0.5">
                {[1, 2].map((i) => (
                  <div key={i} className="h-3 rounded bg-white shadow-sm ring-1 ring-stone-100" />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-1 items-center justify-center">
          <Icon className="h-10 w-10 opacity-90" strokeWidth={1.5} />
        </div>
      )}
      <div className="relative flex items-center gap-2 px-3 pb-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        <span className="truncate text-[11px] font-semibold drop-shadow-sm">
          {name ?? style.label}
        </span>
      </div>
    </div>
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
      <Icon className={cn(icon, "text-zinc-600")} strokeWidth={1.85} />
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
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-teal-400 font-bold text-white shadow-sm",
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
