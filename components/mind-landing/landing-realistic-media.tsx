"use client"

import { cn } from "@/lib/utils"
import type { LibraryCoverVariant } from "@/lib/product-media"
import { MindarLogoImg } from "@/components/mind-v2/mindar-logo"

const COVER_GRADIENT: Record<string, string> = {
  product: "from-zinc-600 via-zinc-500 to-stone-400",
  study: "from-sky-600 via-sky-500 to-cyan-400",
  reading: "from-violet-600 via-purple-500 to-fuchsia-400",
  engineering: "from-slate-700 via-slate-600 to-zinc-500",
  design: "from-rose-500 via-pink-500 to-orange-400",
  default: "from-zinc-500 via-stone-500 to-zinc-400",
}

/** Library card cover for marketing — workspace snippet, no large icon */
export function MarketingLibraryCover({
  variant = "default",
  className,
}: {
  variant?: LibraryCoverVariant
  className?: string
}) {
  const gradient = COVER_GRADIENT[variant] ?? COVER_GRADIENT.default
  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-br p-2",
        gradient,
        className
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_30%_0%,rgba(255,255,255,0.2),transparent)]" />
      <div className="relative flex flex-1 items-end justify-center gap-0.5">
        <MiniDocThumb className="h-8 w-6 -rotate-6 opacity-90" lines={3} />
        <MiniWebClipThumb className="relative z-10 h-9 w-7" />
        <MiniNoteThumb className="h-7 w-6 rotate-3 opacity-95" />
      </div>
    </div>
  )
}

/** Tiny PDF / document page — text lines, no icon */
export function MiniDocThumb({
  className,
  accent = "red",
  lines = 4,
}: {
  className?: string
  accent?: "red" | "sky" | "amber" | "violet"
  lines?: number
}) {
  const accentBg = {
    red: "bg-red-500",
    sky: "bg-sky-500",
    amber: "bg-amber-500",
    violet: "bg-violet-500",
  }[accent]
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[4px] border border-stone-200/90 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]",
        className
      )}
      aria-hidden
    >
      <span className={cn("absolute left-0 top-0 h-full w-[3px]", accentBg)} />
      <div className="pl-2 pr-1.5 py-1.5">
        <div className="mb-1 h-1 w-[70%] rounded-sm bg-stone-300/90" />
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "mb-0.5 h-[2px] rounded-full bg-stone-200",
              i === lines - 1 ? "w-[45%]" : i % 2 === 0 ? "w-full" : "w-[88%]"
            )}
          />
        ))}
      </div>
    </div>
  )
}

/** Clipped webpage — browser chrome + article */
export function MiniWebClipThumb({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[4px] border border-stone-200/90 bg-white shadow-sm",
        className
      )}
      aria-hidden
    >
      <div className="flex items-center gap-0.5 border-b border-stone-100 bg-stone-50 px-1 py-0.5">
        <span className="size-[3px] rounded-full bg-stone-300" />
        <span className="size-[3px] rounded-full bg-stone-300" />
        <span className="h-1 flex-1 rounded-full bg-stone-200" />
      </div>
      <div className="p-1">
        <div className="h-1.5 w-full rounded-sm bg-violet-100" />
        <div className="mt-0.5 h-2 w-full rounded-sm bg-gradient-to-r from-sky-100 to-teal-50" />
        <div className="mt-0.5 space-y-px">
          <div className="h-[2px] w-full rounded-full bg-stone-100" />
          <div className="h-[2px] w-[80%] rounded-full bg-stone-100" />
        </div>
      </div>
    </div>
  )
}

/** Sticky note with handwriting-like lines */
export function MiniNoteThumb({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[3px] border border-amber-200/80 bg-gradient-to-br from-amber-50 to-amber-100/90 p-1.5 shadow-sm",
        className
      )}
      aria-hidden
    >
      <div className="h-[2px] w-[75%] rounded-full bg-amber-700/25" />
      <div className="mt-0.5 h-[2px] w-full rounded-full bg-amber-700/15" />
      <div className="mt-0.5 h-[2px] w-[60%] rounded-full bg-amber-700/15" />
      <div className="mt-1 h-3 w-full rounded-sm bg-amber-200/40" />
    </div>
  )
}

/** Slide deck preview — colored blocks */
export function MiniSlidesThumb({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[4px] border border-indigo-200/70 bg-white shadow-sm",
        className
      )}
      aria-hidden
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-indigo-500 via-violet-500 to-sky-400 p-1">
        <div className="flex h-full flex-col justify-end rounded-sm bg-white/95 p-1">
          <div className="h-1 w-2/3 rounded-sm bg-stone-300" />
          <div className="mt-0.5 h-[2px] w-full rounded-full bg-stone-200" />
        </div>
      </div>
    </div>
  )
}

/** Audio waveform — no microphone icon */
export function MiniAudioWaveThumb({ className }: { className?: string }) {
  const bars = [3, 6, 4, 8, 5, 7, 4, 6, 3]
  return (
    <div
      className={cn(
        "flex items-end justify-center gap-[2px] rounded-[4px] border border-cyan-200/70 bg-gradient-to-b from-cyan-50 to-white px-1.5 py-1.5",
        className
      )}
      aria-hidden
    >
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-[2px] rounded-full bg-gradient-to-t from-cyan-500 to-teal-400"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  )
}

/** Overlapping files for upload / import */
export function FileStackIllustration({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto h-12 w-14", className)} aria-hidden>
      <MiniDocThumb className="absolute left-0 top-1 h-9 w-7 -rotate-6 opacity-90" accent="sky" lines={3} />
      <MiniDocThumb className="absolute left-3 top-0 h-10 w-8 z-10" accent="red" lines={4} />
      <MiniWebClipThumb className="absolute right-0 top-2 h-8 w-7 rotate-3 opacity-95" />
    </div>
  )
}

export function SourceListRow({
  title,
  kind = "pdf",
  active,
}: {
  title: string
  kind?: "pdf" | "doc" | "link"
  active?: boolean
}) {
  const thumb =
    kind === "link" ? (
      <MiniWebClipThumb className="h-4 w-4 shrink-0" />
    ) : (
      <MiniDocThumb
        className="h-4 w-4 shrink-0"
        accent={kind === "pdf" ? "red" : "sky"}
        lines={3}
      />
    )
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-lg px-1 py-0.5",
        active && "bg-sky-50 ring-1 ring-sky-100"
      )}
    >
      {thumb}
      <span className="truncate text-[8px] text-zinc-700">{title}</span>
    </div>
  )
}

/** Slim sidebar — text labels + accent bar (no icon badges) */
export function PreviewSideRail({
  className,
  compact,
}: {
  className?: string
  compact?: boolean
}) {
  const items = [
    { short: compact ? "Lib" : "Library", active: true },
    { short: compact ? "Sq" : "Square" },
    { short: compact ? "Agent" : "Agent" },
  ]
  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-stone-200/60 bg-white/80 py-2 pl-1 pr-0.5",
        compact ? "w-[34px]" : "w-[52px]",
        className
      )}
      aria-hidden
    >
      <div
        className={cn(
          "mb-2 overflow-hidden rounded-md border border-stone-200/80 bg-gradient-to-b from-stone-100 to-stone-200/80",
          compact && "mb-1"
        )}
      >
        <div className={cn("bg-gradient-to-r from-teal-400/40 to-violet-400/30", compact ? "h-2" : "h-3")} />
        <p className="truncate px-1 py-0.5 text-[6px] font-semibold text-zinc-600">John</p>
      </div>
      {items.map((item) => (
        <div
          key={item.short}
          className={cn(
            "mb-0.5 flex items-center gap-0.5 rounded-md py-0.5 pl-0.5 pr-0.5",
            item.active && "bg-teal-50 ring-1 ring-teal-100/80"
          )}
        >
          <span
            className={cn(
              "w-0.5 shrink-0 rounded-full",
              compact ? "h-3" : "h-4",
              item.active ? "bg-teal-500" : "bg-stone-200"
            )}
          />
          <span
            className={cn(
              "truncate font-medium leading-tight",
              compact ? "text-[6px]" : "text-[7px]",
              item.active ? "text-teal-800" : "text-zinc-400"
            )}
          >
            {item.short}
          </span>
        </div>
      ))}
    </aside>
  )
}

/** AI reply attribution */
export function AiSpeakerChip({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-4 px-1" : "h-5 px-1.5"
  return (
    <span className={cn("inline-flex shrink-0 items-center overflow-hidden", box)} aria-hidden>
      <MindarLogoImg variant="inline" className={cn("h-full w-auto object-contain", size === "sm" ? "!max-w-[40px]" : "!max-w-[52px]")} />
    </span>
  )
}

/** Collaborator name pills — not letter avatars */
export function CollaboratorPills({
  names,
  className,
}: {
  names: string[]
  className?: string
}) {
  const colors = ["bg-teal-100 text-teal-800", "bg-violet-100 text-violet-800", "bg-amber-100 text-amber-800", "bg-rose-100 text-rose-800"]
  return (
    <div className={cn("flex flex-wrap gap-0.5", className)}>
      {names.map((name, i) => (
        <span
          key={name}
          className={cn(
            "rounded-full px-1.5 py-px text-[6px] font-semibold ring-1 ring-white/80",
            colors[i % colors.length]
          )}
        >
          {name}
        </span>
      ))}
    </div>
  )
}

export function QuickActionTile({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-white bg-white p-1.5 text-center shadow-sm">
      <div className="mx-auto flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-stone-50">
        {children}
      </div>
      <p className="mt-1 text-[8px] font-medium text-zinc-600">{label}</p>
    </div>
  )
}

export function StudioOutputCard({
  label,
  variant,
}: {
  label: string
  variant: "report" | "slides" | "quiz" | "audio"
}) {
  const preview = {
    report: <MiniDocThumb className="h-full w-full" accent="sky" lines={5} />,
    slides: <MiniSlidesThumb className="h-full w-full" />,
    quiz: (
      <div className="flex h-full flex-col justify-center gap-0.5 p-1">
        <div className="h-1 w-full rounded-full bg-violet-200" />
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-0.5">
            <span className="size-1 shrink-0 rounded-full border border-violet-300 bg-white" />
            <span className="h-[2px] flex-1 rounded-full bg-violet-100" />
          </div>
        ))}
      </div>
    ),
    audio: <MiniAudioWaveThumb className="h-full w-full" />,
  }[variant]

  return (
    <div className="overflow-hidden rounded-lg border border-stone-100 bg-gradient-to-b from-white to-stone-50/80">
      <div className="aspect-[5/4] border-b border-stone-100/80 bg-white">{preview}</div>
      <p className="py-1 text-center text-[7px] font-semibold text-zinc-600">{label}</p>
    </div>
  )
}

export function AgentOutputCard({
  label,
  variant,
}: {
  label: string
  variant: "report" | "slides" | "audio"
}) {
  const inner = {
    report: <MiniDocThumb className="h-7 w-6" lines={4} />,
    slides: <MiniSlidesThumb className="h-7 w-6" />,
    audio: <MiniAudioWaveThumb className="h-7 w-8" />,
  }[variant]
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-stone-200/80 bg-white py-2 shadow-sm">
      <div className="flex h-8 items-center justify-center">{inner}</div>
      <span className="text-[8px] font-semibold text-zinc-600">{label}</span>
    </div>
  )
}

/** Chat answer bubble with doc citation chips */
export function MiniCitationChips() {
  return (
    <div className="mt-1 flex flex-wrap gap-0.5">
      {["PRD v2", "Research"].map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-0.5 rounded bg-sky-50 px-1 py-px text-[6px] font-medium text-sky-800 ring-1 ring-sky-100"
        >
          <MiniDocThumb className="h-2 w-1.5" lines={2} accent="red" />
          {t}
        </span>
      ))}
    </div>
  )
}

/** Permission row thumbnails */
export function PermissionThumbPrivate() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg bg-gradient-to-b from-stone-100 to-stone-50 p-1.5">
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-[72px] overflow-hidden rounded-md border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-100 px-1 py-0.5">
            <div className="h-1 w-1/2 rounded bg-stone-200" />
          </div>
          <div className="p-1">
            <MiniDocThumb className="h-6 w-full" lines={3} />
          </div>
        </div>
      </div>
      <span className="text-center text-[7px] font-semibold text-stone-500">Only you</span>
    </div>
  )
}

export function PermissionThumbTeam() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-lg bg-emerald-50/90 p-1.5">
      <CollaboratorPills names={["Sam", "Mo", "Jo"]} />
      <div className="mt-1.5 h-5 w-full overflow-hidden rounded border border-emerald-100 bg-white">
        <div className="flex h-full">
          <div className="w-1/3 border-r border-stone-100 bg-stone-50 p-0.5">
            <MiniDocThumb className="h-full w-full" lines={2} />
          </div>
          <div className="flex-1 p-0.5">
            <div className="h-1 w-full rounded bg-stone-200" />
            <div className="mt-0.5 h-1 w-2/3 rounded bg-stone-100" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function PermissionThumbPublic() {
  return (
    <div className="h-full rounded-lg bg-sky-50/90 p-1.5">
      <p className="text-[7px] font-bold text-sky-800">Plaza</p>
      <div className="mt-1 grid grid-cols-2 gap-0.5">
        {(["product", "study"] as const).map((v) => (
          <div key={v} className="overflow-hidden rounded border border-white bg-white shadow-sm">
            <div
              className={cn(
                "h-4 bg-gradient-to-br",
                v === "product" ? "from-zinc-500 to-stone-400" : "from-sky-500 to-cyan-400"
              )}
            >
              <div className="m-0.5 rounded-sm bg-white/90 p-0.5">
                <div className="h-0.5 w-full rounded bg-stone-200" />
                <div className="mt-px h-0.5 w-2/3 rounded bg-stone-100" />
              </div>
            </div>
            <div className="h-1 bg-white" />
          </div>
        ))}
      </div>
    </div>
  )
}
