"use client"

import type { ReactNode } from "react"
import { ChevronRight, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { PlazaLibraryCover } from "@/components/mind-v2/plaza-library-cover"
import { getMindAgentCatalog } from "@/lib/mind-agent-catalog"
import {
  formatPlazaSourcesLine,
  plazaAgentCapabilityTiles,
  publicAgentDisplayName,
  publicAgentTagline,
  type PublicKbSettings,
} from "@/lib/public-kb-settings"

function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500",
        className
      )}
    >
      {children}
    </p>
  )
}

export type PlazaLibraryAgentIntroProps = {
  libraryName: string
  libraryDescription?: string
  contentCount: number
  kbId?: number
  publisherLabel?: string
  publicSettings: PublicKbSettings
  exampleQuestions: string[]
  onStartThread: (prompt?: string) => void
  onBrowseLibrary?: () => void
  onClose?: () => void
  chatDisabled?: boolean
  chatDisabledReason?: string
  /** sheet = mobile bottom sheet; dialog = PC modal (body only); dialogue / sidebar = notebook chrome */
  variant?: "sheet" | "dialog" | "embedded" | "dialogue" | "sidebar"
  className?: string
}

export function PlazaLibraryAgentIntro({
  libraryName,
  libraryDescription,
  contentCount,
  kbId,
  publisherLabel,
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
  const catalog = publicSettings.boundAgentId != null ? getMindAgentCatalog(publicSettings.boundAgentId) : undefined
  const introHook =
    catalog?.profile?.strengthDetail?.trim() ||
    (tagline && tagline.length < 72 ? tagline : "")
  const capabilityTiles = plazaAgentCapabilityTiles(publicSettings)
  const sourcesLine = formatPlazaSourcesLine(contentCount)
  const isEmbedded = variant === "embedded"
  const isDialogue = variant === "dialogue"
  const isSidebar = variant === "sidebar"
  const isSheet = variant === "sheet"
  const isDialog = variant === "dialog"
  const compactIntro = isEmbedded || isDialogue || isSidebar
  const description = libraryDescription?.trim() || tagline

  const identityBlock = (
    <div className="flex gap-4">
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center",
          isSidebar
            ? "h-11 w-11"
            : isSheet || isDialogue
              ? "h-12 w-12"
              : isEmbedded
                ? "h-14 w-14"
                : "h-[72px] w-[72px]"
        )}
      >
        <PlazaLibraryCover
          title={libraryName}
          kbId={kbId}
          size={isSidebar ? "sm" : isSheet || isDialogue ? "md" : "lg"}
        />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <h2
          className={cn(
            "font-semibold tracking-tight text-zinc-900 dark:text-zinc-50",
            isSidebar
              ? "text-[15px]"
              : isDialogue
                ? "text-[16px]"
                : isEmbedded
                  ? "text-[17px]"
                  : "text-[20px] leading-tight"
          )}
        >
          {displayName}
        </h2>
        <p
          className={cn(
            "leading-snug text-zinc-600 dark:text-zinc-400",
            isSidebar ? "mt-0.5 text-[12px]" : isDialogue ? "mt-0.5 text-[13px]" : "mt-1 text-[14px]"
          )}
        >
          {description}
        </p>
        <p
          className={cn(
            "text-zinc-400 dark:text-zinc-500",
            isSidebar ? "mt-1 text-[11px]" : isDialogue ? "mt-1 text-[11px]" : "mt-2 text-[12px]"
          )}
        >
          {sourcesLine}
        </p>
      </div>
      {onClose && !compactIntro && !isDialog ? (
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

  const dialogHero = (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-7">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center sm:h-[88px] sm:w-[88px]">
        <PlazaLibraryCover title={libraryName} kbId={kbId} size="lg" />
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <div className="space-y-1">
          <SectionLabel>Public library</SectionLabel>
          <h2
            id="plaza-agent-intro-title"
            className="text-[22px] font-semibold leading-[1.25] tracking-tight text-zinc-900 sm:text-[24px] dark:text-zinc-50"
          >
            {libraryName}
          </h2>
        </div>
        <p className="text-[15px] font-medium text-mind">With {displayName}</p>
        {description ? (
          <p className="max-w-[52ch] text-[14px] leading-[1.6] text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-zinc-500">
          <span>{sourcesLine}</span>
          {publisherLabel ? (
            <>
              <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>
                ·
              </span>
              <span>{publisherLabel}</span>
            </>
          ) : null}
        </div>
      </div>
    </header>
  )

  const whatBlock = (dialogLayout: boolean) =>
    capabilityTiles.length > 0 ? (
      <section className={dialogLayout ? "space-y-3" : cn(isSidebar ? "mt-3" : isDialogue ? "mt-4" : isEmbedded ? "mt-6" : "mt-7")}>
        <SectionLabel>What I can do</SectionLabel>
        {dialogLayout ? (
          <ul className="flex flex-wrap gap-2">
            {capabilityTiles.map((label) => (
              <li key={label}>
                <span className="inline-flex items-center rounded-full border border-stone-200/90 bg-stone-50/90 px-3.5 py-2 text-[13px] font-medium leading-snug text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            {capabilityTiles.map((label) => (
              <div
                key={label}
                className={cn(
                  "flex items-center justify-center rounded-xl bg-stone-50/90 px-2.5 text-center font-medium leading-snug text-zinc-700 ring-1 ring-stone-200/80 dark:bg-zinc-900/50 dark:text-zinc-300 dark:ring-zinc-700",
                  isSidebar
                    ? "min-h-[36px] text-[11px]"
                    : isDialogue
                      ? "min-h-[40px] text-[12px]"
                      : "min-h-[52px] py-2.5 text-[13px]"
                )}
              >
                {label}
              </div>
            ))}
          </div>
        )}
      </section>
    ) : null

  const trustBlock = (dialogLayout: boolean) => (
    <section
      className={cn(
        dialogLayout ? "space-y-2" : cn(isSidebar ? "mt-2.5" : isDialogue ? "mt-3" : isEmbedded ? "mt-5" : "mt-5")
      )}
    >
      {!dialogLayout ? null : <SectionLabel>Trust &amp; grounding</SectionLabel>}
      <div
        className={cn(
          "rounded-2xl border border-stone-200/80 bg-stone-50/60 px-4 py-3.5 dark:border-zinc-800 dark:bg-zinc-900/40",
          !dialogLayout && "rounded-xl bg-zinc-50 px-3.5 py-3 dark:bg-zinc-900/60"
        )}
      >
        <p className="flex items-start gap-2.5 text-[14px] leading-[1.55] text-zinc-600 dark:text-zinc-400">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-mind" strokeWidth={2} aria-hidden />
          <span>I only draw from this library&apos;s sources — citations show up in every reply.</span>
        </p>
      </div>
    </section>
  )

  const tryBlock = (dialogLayout: boolean) =>
    exampleQuestions.length > 0 ? (
      <section className={dialogLayout ? "space-y-3" : cn(isDialogue ? "mt-4" : isEmbedded ? "mt-6" : "mt-7")}>
        <SectionLabel className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-mind" strokeWidth={2} aria-hidden />
          Try asking
        </SectionLabel>
        <ul className={cn(dialogLayout ? "space-y-2.5" : "mt-3 space-y-2")}>
          {exampleQuestions.slice(0, 4).map((q) => (
            <li key={q}>
              <button
                type="button"
                disabled={chatDisabled}
                title={chatDisabled ? chatDisabledReason : undefined}
                onClick={() => onStartThread(q)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border border-stone-200/90 bg-white text-left transition-colors",
                  dialogLayout ? "px-4 py-3.5 text-[14px] leading-[1.45]" : "rounded-xl px-3.5 py-3 text-[13px] leading-snug",
                  "text-zinc-700 hover:border-mind/25 hover:bg-mind/[0.04] disabled:cursor-not-allowed disabled:opacity-50",
                  "dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-mind/30 dark:hover:bg-mind/[0.06]"
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
            : "mind-btn shadow-sm"
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

  if (isDialog) {
    return (
      <article className={cn("flex flex-col gap-8 sm:gap-9", className)}>
        {dialogHero}
        {introHook && introHook !== description ? (
          <p className="max-w-[58ch] text-[14px] leading-[1.6] text-zinc-500 dark:text-zinc-400">{introHook}</p>
        ) : null}
        {whatBlock(true)}
        {trustBlock(true)}
        {tryBlock(true)}
      </article>
    )
  }

  if (isDialogue || isSidebar) {
    return (
      <div className={cn("flex flex-col", className)}>
        {identityBlock}
        {introHook && introHook !== description ? (
          <p
            className={cn(
              "text-zinc-500 dark:text-zinc-400",
              isSidebar ? "mt-2 text-[12px] leading-snug" : "mt-2 text-[13px]"
            )}
          >
            {introHook}
          </p>
        ) : null}
        {whatBlock(false)}
        {trustBlock(false)}
        {!isSidebar ? tryBlock(false) : null}
        {chatDisabled && chatDisabledReason ? (
          <p className="mt-3 text-[12px] text-zinc-500">{chatDisabledReason}</p>
        ) : null}
      </div>
    )
  }

  return (
    <div className={cn(isSheet && "px-1", className)}>
      {identityBlock}
      {introHook && introHook !== description ? (
        <p className="mt-4 text-[14px] text-zinc-500 dark:text-zinc-400">{introHook}</p>
      ) : null}
      {whatBlock(false)}
      {trustBlock(false)}
      {tryBlock(false)}
      {!isEmbedded ? ctaBlock : null}
    </div>
  )
}
