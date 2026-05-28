"use client"

import { Compass, Layers, Plus, Sparkles, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { MOCK_PLAZA_LIBRARIES } from "@/lib/mock-plaza-libraries"
import type { LibraryHubSectionId } from "@/components/mind-v2/web-knowledge-browser"
import { LIBRARY_HUB_SECTIONS } from "@/lib/library-hub-sections"

const FEATURED_PLAZA = MOCK_PLAZA_LIBRARIES.slice(0, 3)

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

  return (
    <div
      className={cn(
        "mx-auto w-full",
        isPanel ? "max-w-xl py-8 lg:max-w-2xl lg:py-12" : "max-w-2xl py-10 sm:py-14",
        className
      )}
    >
      <div
        className={cn(
          isPanel && "rounded-2xl border border-white/90 bg-white/75 px-6 py-8 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.1)] backdrop-blur-md sm:px-8 sm:py-10"
        )}
      >
      <div className={cn("text-center", isPanel && "sm:text-left")}>
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl bg-mind/10 text-mind ring-1 ring-mind/15",
            isPanel ? "sm:mx-0 mx-auto" : "mx-auto"
          )}
        >
          <Layers className="h-7 w-7" strokeWidth={1.75} aria-hidden />
        </div>
        <h2
          className={cn(
            "font-semibold tracking-tight text-zinc-900",
            isPanel ? "mt-5 text-[20px] sm:text-[22px]" : "mt-5 text-[22px]"
          )}
        >
          {isPanel ? "My Library" : "Build your knowledge home"}
        </h2>
        <p
          className={cn(
            "mt-2 text-[14px] leading-relaxed text-zinc-500",
            isPanel ? "max-w-lg sm:mx-0 mx-auto" : "mx-auto max-w-md"
          )}
        >
          {isPanel
            ? "Choose a library on the left, or create one below. Personal libraries open directly in chat, sources, and Studio."
            : "Start with a personal library, explore the public plaza, or create a shared space for your team. Everything you add stays organized in one place."}
        </p>
        {isPanel ? (
          <p className="mt-3 text-[12px] font-medium text-zinc-400">
            Personal · Shared · Subscribed
          </p>
        ) : null}
      </div>

      <div className={cn("mt-8 grid gap-3", isPanel ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-3")}>
        <button
          type="button"
          onClick={onBrowsePlaza}
          className={cn(web.surfaceCardFlat, web.surfaceCardHover, "flex flex-col items-start p-4 text-left")}
        >
          <Compass className="h-5 w-5 text-mind" strokeWidth={2} aria-hidden />
          <span className="mt-3 text-[14px] font-semibold text-zinc-900">Explore plaza</span>
          <span className="mt-1 text-[12px] leading-relaxed text-zinc-500">
            Subscribe to public libraries and chat with your sources
          </span>
        </button>
        <button
          type="button"
          onClick={onCreatePersonal}
          className={cn(web.surfaceCardFlat, web.surfaceCardHover, "flex flex-col items-start p-4 text-left")}
        >
          <Plus className="h-5 w-5 text-mind" strokeWidth={2.5} aria-hidden />
          <span className="mt-3 text-[14px] font-semibold text-zinc-900">New personal</span>
          <span className="mt-1 text-[12px] leading-relaxed text-zinc-500">
            Notes, files, and links — private to you
          </span>
        </button>
        <button
          type="button"
          onClick={onCreateShared}
          className={cn(web.surfaceCardFlat, web.surfaceCardHover, "flex flex-col items-start p-4 text-left")}
        >
          <Users className="h-5 w-5 text-mind" strokeWidth={2} aria-hidden />
          <span className="mt-3 text-[14px] font-semibold text-zinc-900">New shared</span>
          <span className="mt-1 text-[12px] leading-relaxed text-zinc-500">
            Collaborate as owner or member on team libraries
          </span>
        </button>
      </div>

      <div className={cn("mt-10", isPanel && "border-t border-black/[0.05] pt-8")}>
        <p className="text-[12px] font-semibold uppercase tracking-wide text-zinc-400">Recommended on plaza</p>
        <ul className="mt-3 space-y-2">
          {FEATURED_PLAZA.map((row) => (
            <li key={row.kbId}>
              <button
                type="button"
                onClick={onBrowsePlaza}
                className={cn(
                  web.surfaceCardFlat,
                  "flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-white"
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600/90 to-sky-600/90 text-[11px] font-bold text-white">
                  {row.title.slice(0, 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-zinc-800">{row.title}</span>
                  <span className="block truncate text-[11px] text-zinc-500">{row.description}</span>
                </span>
                <Sparkles className="h-4 w-4 shrink-0 text-zinc-300" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </div>
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
