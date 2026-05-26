"use client"

import { ChevronRight, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { PlazaLibraryCover } from "@/components/mind-v2/plaza-library-cover"
import { agentFromPublicKbSettings } from "@/lib/plaza-agent-runtime"
import { getMindAgentCatalog } from "@/lib/mind-agent-catalog"
import {
  formatPlazaSourcesLine,
  plazaAgentCapabilityTiles,
  publicAgentDisplayName,
  publicAgentTagline,
  type PublicKbSettings,
} from "@/lib/public-kb-settings"

export type PlazaLibraryAgentIntroProps = {
  libraryName: string
  libraryDescription?: string
  contentCount: number
  kbId?: number
  publicSettings: PublicKbSettings
  exampleQuestions: string[]
  onStartThread: (prompt?: string) => void
  onBrowseLibrary?: () => void
  onClose?: () => void
  chatDisabled?: boolean
  chatDisabledReason?: string
  /** sheet = mobile bottom sheet; dialog = PC modal; dialogue = web notebook center (intro + chat below) */
  variant?: "sheet" | "dialog" | "embedded" | "dialogue"
  className?: string
}

export function PlazaLibraryAgentIntro({
  libraryName,
  libraryDescription,
  contentCount,
  kbId,
  publicSettings,
  exampleQuestions,
  onStartThread,
  onBrowseLibrary,
  onClose,
  chatDisabled,
  chatDisabledReason,
  variant = "dialog",
  className,
}: PlazaLibraryAgentIntroProps) {
  const displayName = publicAgentDisplayName(publicSettings)
  const tagline = publicAgentTagline(publicSettings, libraryName)
  const agent = agentFromPublicKbSettings(publicSettings, libraryName)
  const catalog = publicSettings.boundAgentId != null ? getMindAgentCatalog(publicSettings.boundAgentId) : undefined
  const introHook =
    catalog?.profile?.strengthDetail?.trim() ||
    (tagline && tagline.length < 72 ? tagline : "")
  const capabilityTiles = plazaAgentCapabilityTiles(publicSettings)
  const sourcesLine = formatPlazaSourcesLine(contentCount)
  const isEmbedded = variant === "embedded"
  const isDialogue = variant === "dialogue"
  const isSheet = variant === "sheet"
  const compactIntro = isEmbedded || isDialogue

  const identityBlock = (
    <div className="flex gap-4">
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-2xl ring-1 ring-black/[0.06] dark:ring-white/10",
          isSheet || isDialogue ? "h-12 w-12" : isEmbedded ? "h-14 w-14" : "h-[72px] w-[72px]"
        )}
      >
        {kbId != null ? (
          <PlazaLibraryCover title={libraryName} kbId={kbId} size="lg" className="h-full w-full" />
        ) : (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center bg-gradient-to-br text-white",
              agent.color
            )}
            aria-hidden
          >
            <span className="text-2xl">{agent.avatar}</span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <h2
          className={cn(
            "font-semibold tracking-tight text-zinc-900 dark:text-zinc-50",
            isDialogue ? "text-[16px]" : isEmbedded ? "text-[17px]" : "text-[20px] leading-tight"
          )}
        >
          {displayName}
        </h2>
        <p
          className={cn(
            "leading-snug text-zinc-600 dark:text-zinc-400",
            isDialogue ? "mt-0.5 text-[13px]" : "mt-1 text-[14px]"
          )}
        >
          {libraryDescription || tagline}
        </p>
        <p className={cn("text-zinc-400 dark:text-zinc-500", isDialogue ? "mt-1 text-[11px]" : "mt-2 text-[12px]")}>
          {sourcesLine}
        </p>
      </div>
      {onClose && !compactIntro ? (
        <button
          type="button"
          onClick={onClose}
          className="-mr-1 shrink-0 rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          aria-label="Close"
        >
          <X className="h-5 w-5" strokeWidth={1.75} />
        </button>
      ) : null}
    </div>
  )

  const whatBlock =
    capabilityTiles.length > 0 ? (
      <section className={cn(isDialogue ? "mt-4" : isEmbedded ? "mt-6" : "mt-7")}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">What I can do</p>
        <div
          className={cn(
            "mt-2.5 grid gap-2",
            variant === "dialog" ? "grid-cols-2 sm:grid-cols-2" : "grid-cols-2"
          )}
        >
          {capabilityTiles.map((label) => (
            <div
              key={label}
              className={cn(
                "flex items-center justify-center rounded-xl bg-sky-50/80 px-2.5 text-center font-medium leading-snug text-sky-800 dark:bg-sky-950/30 dark:text-sky-200",
                isDialogue ? "min-h-[40px] text-[12px]" : "min-h-[52px] py-2.5 text-[13px]"
              )}
            >
              {label}
            </div>
          ))}
        </div>
      </section>
    ) : null

  const trustBlock = (
    <div
      className={cn(
        "rounded-xl bg-zinc-50 px-3.5 py-3 dark:bg-zinc-900/60",
        isDialogue ? "mt-3" : isEmbedded ? "mt-5" : "mt-5"
      )}
    >
      <p className="flex items-start gap-2 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" strokeWidth={2} aria-hidden />
        <span>I only draw from this library&apos;s sources — citations show up in my replies.</span>
      </p>
      <p className="mt-2 pl-6 text-[12px] text-zinc-400">{sourcesLine}</p>
    </div>
  )

  const tryBlock =
    exampleQuestions.length > 0 ? (
      <section className={cn(isDialogue ? "mt-4" : isEmbedded ? "mt-6" : "mt-7")}>
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
          <Sparkles className="h-3 w-3 text-sky-500" strokeWidth={2} aria-hidden />
          Try asking
        </p>
        <ul className="mt-3 space-y-2">
          {exampleQuestions.slice(0, 4).map((q) => (
            <li key={q}>
              <button
                type="button"
                disabled={chatDisabled}
                title={chatDisabled ? chatDisabledReason : undefined}
                onClick={() => onStartThread(q)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border border-zinc-200/90 bg-white px-3.5 py-3 text-left text-[13px] leading-snug text-zinc-700 transition-colors",
                  "hover:border-sky-200/80 hover:bg-sky-50/40 disabled:cursor-not-allowed disabled:opacity-50",
                  "dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-sky-800/50 dark:hover:bg-sky-950/20"
                )}
              >
                <span className="min-w-0 flex-1">{q}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" strokeWidth={2} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      </section>
    ) : null

  const ctaBlock = (
    <div className={cn(isSheet ? "mt-6 space-y-2" : isEmbedded ? "mt-6 flex flex-wrap gap-2" : "mt-8 space-y-2")}>
      <button
        type="button"
        disabled={chatDisabled}
        title={chatDisabled ? chatDisabledReason : undefined}
        onClick={() => onStartThread()}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-full font-semibold text-white transition-colors",
          isEmbedded ? "px-5 py-2.5 text-[13px]" : "px-5 py-3.5 text-[15px]",
          chatDisabled
            ? "cursor-not-allowed bg-zinc-200 text-zinc-500"
            : "bg-mind hover:bg-sky-600 shadow-sm shadow-sky-300/35"
        )}
      >
        Start a thread with {displayName}
      </button>
      {onBrowseLibrary ? (
        <button
          type="button"
          onClick={onBrowseLibrary}
          className={cn(
            "w-full rounded-full py-2.5 text-[13px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
            isEmbedded && "w-auto px-4"
          )}
        >
          Browse library
        </button>
      ) : null}
      {chatDisabled && chatDisabledReason ? (
        <p className="text-center text-[12px] text-zinc-500">{chatDisabledReason}</p>
      ) : null}
    </div>
  )

  if (isDialogue) {
    return (
      <div className={cn("flex flex-col", className)}>
        {identityBlock}
        {introHook && introHook !== (libraryDescription || tagline) ? (
          <p className="mt-2 text-[13px] text-zinc-500 dark:text-zinc-400">{introHook}</p>
        ) : null}
        {whatBlock}
        {trustBlock}
        {tryBlock}
        {chatDisabled && chatDisabledReason ? (
          <p className="mt-3 text-[12px] text-zinc-500">{chatDisabledReason}</p>
        ) : null}
      </div>
    )
  }

  if (variant === "dialog") {
    return (
      <div className={cn("flex flex-col", className)}>
        {identityBlock}
        {introHook && introHook !== tagline ? (
          <p className="mt-4 text-[14px] text-zinc-500 dark:text-zinc-400">{introHook}</p>
        ) : null}
        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div>
            {whatBlock}
            {trustBlock}
          </div>
          <div>
            {tryBlock}
            {ctaBlock}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(isSheet && "px-1", className)}>
      {identityBlock}
      {introHook && introHook !== (libraryDescription || tagline) ? (
        <p className="mt-4 text-[14px] text-zinc-500 dark:text-zinc-400">{introHook}</p>
      ) : null}
      {whatBlock}
      {trustBlock}
      {tryBlock}
      {!isEmbedded ? ctaBlock : null}
    </div>
  )
}
