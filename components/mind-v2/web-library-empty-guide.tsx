"use client"

import { ArrowUpRight, Compass, Layers, Plus, Sparkles, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { PlazaDiscoverThumbnail } from "@/components/mind-v2/plaza-discover-thumbnail"
import { MOCK_PLAZA_LIBRARIES } from "@/lib/mock-plaza-libraries"
import type { LibraryHubSectionId } from "@/components/mind-v2/web-knowledge-browser"
import { LIBRARY_HUB_SECTIONS } from "@/lib/library-hub-sections"

const FEATURED_PLAZA = MOCK_PLAZA_LIBRARIES.slice(0, 3)

const HUB_SCOPE_CHIPS = ["Personal", "Shared", "Subscribed"] as const

const HUB_ACTIONS = [
  {
    id: "plaza",
    title: "Explore plaza",
    description: "Subscribe to public libraries and chat with your sources",
    icon: Compass,
    tone: {
      well: "bg-indigo-50 ring-indigo-100/90",
      icon: "text-indigo-900",
      card: "hover:border-indigo-200/70 hover:shadow-[0_20px_48px_-22px_rgba(79,70,229,0.22)]",
      glow: "from-indigo-400/10",
    },
  },
  {
    id: "personal",
    title: "New personal",
    description: "Notes, files, and links — private to you",
    icon: Plus,
    tone: {
      well: "bg-emerald-50 ring-emerald-100/90",
      icon: "text-emerald-900",
      card: "hover:border-emerald-200/70 hover:shadow-[0_20px_48px_-22px_rgba(5,150,105,0.2)]",
      glow: "from-emerald-400/10",
    },
  },
  {
    id: "shared",
    title: "New shared",
    description: "Collaborate as owner or member on team libraries",
    icon: Users,
    tone: {
      well: "bg-violet-50 ring-violet-100/90",
      icon: "text-violet-900",
      card: "hover:border-violet-200/70 hover:shadow-[0_20px_48px_-22px_rgba(124,58,237,0.2)]",
      glow: "from-violet-400/10",
    },
  },
] as const

export function WebLibraryHubWelcome({
  onBrowsePlaza,
  onCreatePersonal,
  onCreateShared,
  variant = "page",
  className,
}: {
  onBrowsePlaza: () => void
  onCreatePersonal: () => void
  onCreateShared: () => void
  /** `panel` — right column beside library nav */
  variant?: "page" | "panel"
  className?: string
}) {
  const isPanel = variant === "panel"

  const actionHandlers = {
    plaza: onBrowsePlaza,
    personal: onCreatePersonal,
    shared: onCreateShared,
  } as const

  return (
    <div
      className={cn(
        "mx-auto w-full",
        isPanel ? "max-w-xl py-6 lg:max-w-2xl lg:py-10" : "max-w-2xl py-10 sm:py-14",
        className
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          isPanel
            ? "rounded-[1.35rem] border border-white/95 bg-white/80 px-6 py-8 shadow-[0_24px_64px_-28px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl sm:px-8 sm:py-10"
            : "text-center"
        )}
      >
        {isPanel ? (
          <>
            <div
              className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(196,181,253,0.35),transparent_68%)]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(125,211,252,0.28),transparent_70%)]"
              aria-hidden
            />
          </>
        ) : null}

        <header className={cn("relative", isPanel ? "sm:text-left" : "text-center")}>
          <div
            className={cn(
              "inline-flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-[1rem] bg-gradient-to-br from-zinc-900 to-zinc-700 text-white shadow-[0_12px_28px_-12px_rgba(24,24,27,0.45)] ring-1 ring-black/10",
              isPanel ? "sm:mx-0 mx-auto" : "mx-auto"
            )}
          >
            <Layers className="h-[1.35rem] w-[1.35rem]" strokeWidth={1.65} aria-hidden />
          </div>
          <p
            className={cn(
              "mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400",
              isPanel ? "sm:text-left text-center" : ""
            )}
          >
            Knowledge home
          </p>
          <h2
            className={cn(
              "font-semibold tracking-[-0.02em] text-zinc-900",
              isPanel
                ? "mt-1 text-[1.65rem] leading-tight sm:text-[1.75rem] sm:text-left text-center"
                : "mt-1 text-[1.75rem] leading-tight"
            )}
          >
            {isPanel ? "My Library" : "Build your knowledge home"}
          </h2>
          <p
            className={cn(
              "mt-2.5 text-[14px] leading-[1.55] text-zinc-500",
              isPanel ? "max-w-[34ch] sm:mx-0 mx-auto sm:text-left text-center" : "mx-auto max-w-md"
            )}
          >
            {isPanel
              ? "Choose a library on the left, or create one below. Personal libraries open directly in chat, sources, and Studio."
              : "Start with a personal library, explore the public plaza, or create a shared space for your team. Everything you add stays organized in one place."}
          </p>
          {isPanel ? (
            <div className="mt-4 flex flex-wrap justify-center gap-1.5 sm:justify-start">
              {HUB_SCOPE_CHIPS.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-zinc-200/90 bg-zinc-50/90 px-2.5 py-1 text-[11px] font-medium tracking-wide text-zinc-500"
                >
                  {label}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        <div
          className={cn(
            "relative mt-8 grid gap-3",
            isPanel ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-3"
          )}
        >
          {HUB_ACTIONS.map((action) => {
            const Icon = action.icon
            const onClick = actionHandlers[action.id]
            return (
              <button
                key={action.id}
                type="button"
                onClick={onClick}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-[1.1rem] border border-white/90 bg-white/88 p-4 text-left shadow-[0_10px_32px_-18px_rgba(15,23,42,0.1)] backdrop-blur-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5",
                  action.tone.card
                )}
              >
                <div
                  className={cn(
                    "pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                    action.tone.glow
                  )}
                  aria-hidden
                />
                <span
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-xl ring-1",
                    action.tone.well
                  )}
                >
                  <Icon className={cn("h-[1.15rem] w-[1.15rem]", action.tone.icon)} strokeWidth={2} aria-hidden />
                </span>
                <span className="relative mt-3.5 text-[14px] font-semibold tracking-tight text-zinc-900">
                  {action.title}
                </span>
                <span className="relative mt-1 pr-4 text-[12px] leading-relaxed text-zinc-500">
                  {action.description}
                </span>
                <ArrowUpRight
                  className="absolute right-3.5 top-3.5 h-4 w-4 text-zinc-300 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-zinc-500 group-hover:opacity-100"
                  strokeWidth={2}
                  aria-hidden
                />
              </button>
            )
          })}
        </div>

        <section className={cn("relative mt-10", isPanel && "border-t border-black/[0.05] pt-8")}>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                Recommended on plaza
              </p>
              <p className="mt-0.5 text-[12px] text-zinc-500">Curated libraries to subscribe and explore</p>
            </div>
            <button
              type="button"
              onClick={onBrowsePlaza}
              className="hidden shrink-0 text-[12px] font-semibold text-mind transition-colors hover:text-mind/85 sm:inline-flex sm:items-center sm:gap-0.5"
            >
              View all
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
            </button>
          </div>
          <ul className="mt-4 space-y-2.5">
            {FEATURED_PLAZA.map((row) => (
              <li key={row.kbId}>
                <button
                  type="button"
                  onClick={onBrowsePlaza}
                  className={cn(
                    "group flex w-full items-center gap-3.5 rounded-[1.1rem] border border-white/92 bg-white/75 p-3 text-left shadow-[0_8px_28px_-16px_rgba(15,23,42,0.1)] backdrop-blur-sm transition-[transform,box-shadow,background-color] duration-300 hover:-translate-y-px hover:border-white hover:bg-white hover:shadow-[0_16px_40px_-18px_rgba(15,23,42,0.14)]"
                  )}
                >
                  <PlazaDiscoverThumbnail row={row} size="featured" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[13px] font-semibold tracking-tight text-zinc-900">
                        {row.title}
                      </span>
                      <Sparkles
                        className="h-3.5 w-3.5 shrink-0 text-amber-500/80 opacity-70"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </span>
                    <span className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-zinc-500">
                      {row.description}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-zinc-300 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-zinc-500 group-hover:opacity-100"
                    strokeWidth={2}
                    aria-hidden
                  />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

export function WebLibrarySectionEmpty({
  sectionId,
  onBrowsePlaza,
  onCreate,
  className,
}: {
  sectionId: LibraryHubSectionId
  onBrowsePlaza?: () => void
  onCreate?: () => void
  className?: string
}) {
  const meta = LIBRARY_HUB_SECTIONS.find((s) => s.id === sectionId)
  const label = meta?.label ?? sectionId

  let body = `No ${label.toLowerCase()} libraries yet.`
  let primary: { label: string; onClick: () => void } | null = null

  if (sectionId === "followed" && onBrowsePlaza) {
    body = "You have not subscribed to any public libraries yet. Browse the plaza to follow curators you trust."
    primary = { label: "Browse plaza", onClick: onBrowsePlaza }
  } else if (sectionId === "published") {
    body =
      "Libraries you publish to the plaza appear here. Publish from a personal or shared library when you are ready."
  } else if (sectionId === "mine" && onCreate) {
    body = "Create a personal library to collect notes, uploads, and links."
    primary = { label: "New personal library", onClick: onCreate }
  } else if (sectionId === "team" && onCreate) {
    body = "Shared libraries let your team collaborate. You will see an Owner or Member badge on each."
    primary = { label: "New shared library", onClick: onCreate }
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-zinc-200/90 bg-white/50 px-5 py-8 text-center",
        className
      )}
    >
      <p className="text-[14px] font-medium text-zinc-700">{label}</p>
      <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-zinc-500">{body}</p>
      {primary ? (
        <button
          type="button"
          onClick={primary.onClick}
          className="mt-5 rounded-full bg-zinc-900 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-zinc-800"
        >
          {primary.label}
        </button>
      ) : null}
    </div>
  )
}

export function WebLibraryContentEmpty({
  libraryName,
  readOnly,
  onAddFirst,
  onOpenWorkspace,
  className,
}: {
  libraryName: string
  readOnly?: boolean
  onAddFirst?: () => void
  onOpenWorkspace?: () => void
  className?: string
}) {
  if (readOnly) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
        <p className="text-[15px] font-medium text-zinc-700">This library is read-only</p>
        <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-zinc-500">
          Subscribed libraries cannot accept uploads here. Open the workspace to browse sources and
          chat about &ldquo;{libraryName}&rdquo;.
        </p>
        {onOpenWorkspace ? (
          <button
            type="button"
            onClick={onOpenWorkspace}
            className="mt-6 rounded-full bg-zinc-900 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-zinc-800"
          >
            Open workspace
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4 py-8 sm:py-12", className)}>
      <div className="rounded-2xl border border-zinc-200/80 bg-white/80 px-5 py-6 text-center">
        <p className="text-[15px] font-semibold text-zinc-800">No sources in &ldquo;{libraryName}&rdquo; yet</p>
        <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-zinc-500">
          Add a file, link, or note to get started — then ask questions grounded on what you upload.
        </p>
        {onAddFirst ? (
          <button
            type="button"
            onClick={onAddFirst}
            className="mt-4 text-[13px] font-semibold text-mind hover:text-mind/90"
          >
            Add your first source →
          </button>
        ) : null}
      </div>
    </div>
  )
}
