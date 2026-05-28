"use client"

import { ChevronRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { AgentExamplePromptRail } from "@/components/mind-v2/agent-example-prompt-rail"
import { PlazaLibraryCover } from "@/components/mind-v2/plaza-library-cover"
import type { KbAgentSuggestion } from "@/lib/kb-agent-suggestions"
import type { LibraryCoverVariant } from "@/lib/product-media"
import { WebKbAiViewPanel } from "@/components/mind-v2/web-kb-ai-view"
import { WebPublicFactoryGallery } from "@/components/mind-v2/web-public-factory-gallery"
import { StudioFactoryJobsInline } from "@/components/mind-v2/content-factory-progress-panel"
import type { FactoryJob } from "@/components/mind-v2/content-factory-progress-panel"
import type { PublicFactoryOutput } from "@/lib/public-factory-outputs"
import {
  formatPlazaSourcesLine,
  plazaAgentCapabilityTiles,
  publicAgentDisplayName,
  publicAgentTagline,
  type PublicKbSettings,
} from "@/lib/public-kb-settings"
import { getMindAgentCatalog } from "@/lib/mind-agent-catalog"

/** AI view block — summary + graph; entry row stays pinned above chat scroll. */
export function WebPlazaKbGraphSection({
  className,
  compact,
  embeddedInChat,
  centered,
  variant = "default",
  libraryName = "This library",
  sourceCount = 0,
  description,
  onOpen,
}: {
  className?: string
  compact?: boolean
  embeddedInChat?: boolean
  centered?: boolean
  variant?: "default" | "entry"
  libraryName?: string
  sourceCount?: number
  description?: string
  onOpen?: () => void
}) {
  if (variant === "entry") {
    return (
      <section className={cn("shrink-0 px-3 py-2.5", className)} aria-label="AI view entry">
        <button
          type="button"
          onClick={onOpen}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
            web.kbPlazaWell,
            "hover:bg-white/90"
          )}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/15 to-sky-500/20 ring-1 ring-violet-100/80">
            <Sparkles className="h-5 w-5 text-violet-600" strokeWidth={2} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold text-zinc-800">AI view</span>
            <span className="mt-0.5 block text-[11px] leading-snug text-zinc-500">
              AI summary and knowledge graph for this library
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-0.5 text-[12px] font-semibold text-mind">
            Open
            <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </span>
        </button>
      </section>
    )
  }

  return (
    <section
      className={cn(
        centered ? "flex w-full flex-col items-center justify-center px-4 py-2" : "px-4 py-3",
        className
      )}
      aria-label="AI view"
    >
      <div className={cn("w-full", centered && "max-w-md")}>
        {!centered ? (
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-zinc-500">AI view</h3>
        ) : null}
        <WebKbAiViewPanel
          libraryName={libraryName}
          sourceCount={sourceCount}
          description={description}
          compact={compact ?? centered}
          expanded={centered}
          className={cn("mt-2.5", embeddedInChat && "mx-0", centered && "!px-0")}
          onExpand={onOpen}
        />
      </div>
    </section>
  )
}

/** Center column empty state — AI view + starter prompts. */
export function WebPlazaKbChatEmptyCenter({
  exampleQuestions,
  onTryQuestion,
  chatDisabled,
  chatDisabledReason,
  className,
  libraryName = "This library",
  sourceCount = 0,
  description,
  onOpenAiView,
}: {
  exampleQuestions: string[]
  onTryQuestion: (prompt: string) => void
  chatDisabled?: boolean
  chatDisabledReason?: string
  className?: string
  libraryName?: string
  sourceCount?: number
  description?: string
  onOpenAiView?: () => void
}) {
  const prompts = exampleQuestions.filter(Boolean).slice(0, 4)

  return (
    <div
      className={cn(
        "flex min-h-[min(52vh,520px)] flex-col items-center justify-center px-2 py-8",
        className
      )}
    >
      <WebPlazaKbGraphSection
        variant="default"
        embeddedInChat
        centered
        libraryName={libraryName}
        sourceCount={sourceCount}
        description={description}
        onOpen={onOpenAiView}
        className="!px-0 !py-0"
      />
      {prompts.length > 0 ? (
        <section className="mt-8 w-full max-w-md">
          <p className="mb-2 flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
            <Sparkles className="h-3 w-3 text-sky-500" strokeWidth={2} aria-hidden />
            Try asking
          </p>
          <AgentExamplePromptRail
            layout="wrap"
            prompts={prompts.map((q, i) => ({ id: `kb-prompt-${i}`, label: q, prompt: q }))}
            onSelect={(prompt) => {
              if (!chatDisabled) onTryQuestion(prompt)
            }}
            className="w-full"
          />
          {chatDisabled && chatDisabledReason ? (
            <p className="mt-3 text-center text-[12px] text-zinc-500">{chatDisabledReason}</p>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}

/** Published / community Studio outputs for plaza libraries. */
export function WebPlazaKbFactorySection({
  outputs,
  userJobs,
  libraryName,
  className,
}: {
  outputs: PublicFactoryOutput[]
  userJobs?: FactoryJob[]
  libraryName: string
  className?: string
}) {
  if (outputs.length === 0 && (!userJobs || userJobs.length === 0)) return null

  return (
    <section className={cn("border-t px-4 py-3", web.kbDivider, className)} aria-label="Studio outputs">
      <h3 className="text-[12px] font-semibold uppercase tracking-wider text-zinc-500">Studio outputs</h3>
      <p className="mt-0.5 text-[11px] text-zinc-400">Generated from this library&apos;s sources</p>
      {userJobs && userJobs.length > 0 ? (
        <div className="mt-2">
          <StudioFactoryJobsInline
            userJobs={userJobs}
            showQuotaBanner={false}
            onDismissQuotaBanner={() => {}}
            toastFailedJobId={null}
            onRetryJob={() => {}}
            archiveTargetLabel={libraryName}
            archivedJobIds={[]}
          />
        </div>
      ) : null}
      <WebPublicFactoryGallery outputs={outputs} className="mt-2 border-t-0 pt-0" />
    </section>
  )
}

/** Personal / team library empty chat — cover, blurb, and try-asking prompts. */
export function WebKbChatEmptyState({
  libraryName,
  description,
  kbId,
  coverVariant,
  suggestions,
  onTryQuestion,
  className,
}: {
  libraryName: string
  description?: string
  kbId?: number
  coverVariant?: LibraryCoverVariant
  suggestions: KbAgentSuggestion[]
  onTryQuestion: (prompt: string) => void
  className?: string
}) {
  const prompts = suggestions.slice(0, 4)

  return (
    <div className={cn("px-1 pb-2", className)} aria-label={libraryName}>
      <div className="flex flex-col items-center text-center">
        <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center">
          <PlazaLibraryCover title={libraryName} kbId={kbId} size="lg" />
        </div>
        <h2 className="mt-3 text-[18px] font-semibold tracking-tight text-zinc-800">{libraryName}</h2>
        {description ? (
          <p className="mt-2 max-w-md text-[13px] leading-relaxed text-zinc-600">{description}</p>
        ) : null}
      </div>

      {prompts.length > 0 ? (
        <section className="mt-5">
          <p className="mb-2 flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
            <Sparkles className="h-3 w-3 text-sky-500" strokeWidth={2} aria-hidden />
            Try asking
          </p>
          <AgentExamplePromptRail
            layout="wrap"
            prompts={prompts.map((s) => ({ id: s.id, label: s.label, prompt: s.prompt }))}
            onSelect={onTryQuestion}
            className="w-full"
          />
        </section>
      ) : null}
    </div>
  )
}

/** App-style agent home — persona, capability pills, and starter prompts (center chat column). */
export function WebPlazaKbAgentHome({
  libraryName,
  libraryDescription,
  kbId,
  publicSettings,
  contentCount,
  exampleQuestions,
  onTryQuestion,
  chatDisabled,
  chatDisabledReason,
  className,
}: {
  libraryName: string
  libraryDescription?: string
  kbId?: number
  contentCount: number
  publicSettings: PublicKbSettings
  exampleQuestions: string[]
  onTryQuestion: (prompt: string) => void
  chatDisabled?: boolean
  chatDisabledReason?: string
  className?: string
}) {
  const displayName = publicAgentDisplayName(publicSettings)
  const tagline = publicAgentTagline(publicSettings, libraryName)
  const catalog =
    publicSettings.boundAgentId != null ? getMindAgentCatalog(publicSettings.boundAgentId) : undefined
  const personaLine =
    libraryDescription?.trim() ||
    catalog?.profile?.strengthDetail?.trim() ||
    tagline
  const capabilityPills = plazaAgentCapabilityTiles(publicSettings)
  const capabilityTiles =
    capabilityPills.length > 0 ? capabilityPills : (publicSettings.capabilities ?? []).slice(0, 4)
  const prompts = exampleQuestions.filter(Boolean).slice(0, 4)
  const sourcesLine = formatPlazaSourcesLine(contentCount)

  return (
    <div className={cn("px-1 pb-2", className)} aria-label={displayName}>
      <div className="flex flex-col items-center text-center">
        <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center">
          <PlazaLibraryCover title={libraryName} kbId={kbId} size="lg" />
        </div>
        <h2 className="mt-3 text-[18px] font-semibold tracking-tight text-zinc-800">{displayName}</h2>
        {capabilityTiles.length > 0 ? (
          <div className="mt-2.5 flex max-w-full flex-wrap justify-center gap-1.5">
            {capabilityTiles.map((label) => (
              <span
                key={label}
                className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-800 ring-1 ring-sky-100/90"
              >
                {label}
              </span>
            ))}
          </div>
        ) : null}
        {personaLine ? (
          <p className="mt-3 max-w-md text-[13px] leading-relaxed text-zinc-600">{personaLine}</p>
        ) : null}
      </div>

      <div className="mx-auto mt-4 max-w-md rounded-xl bg-zinc-50 px-3.5 py-3">
        <p className="flex items-start gap-2 text-[12px] leading-relaxed text-zinc-600">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" strokeWidth={2} aria-hidden />
          <span>I only draw from this library&apos;s sources — citations show up in my replies.</span>
        </p>
        <p className="mt-1.5 pl-6 text-[11px] text-zinc-400">{sourcesLine}</p>
      </div>

      {publicSettings.disclaimer ? (
        <p className="mx-auto mt-3 max-w-md rounded-xl border border-amber-100/90 bg-amber-50/50 px-3 py-2 text-center text-[11px] leading-relaxed text-amber-900/80">
          {publicSettings.disclaimer}
        </p>
      ) : null}

      {prompts.length > 0 ? (
        <section className="mt-5">
          <p className="mb-2 flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-400">
            <Sparkles className="h-3 w-3 text-sky-500" strokeWidth={2} aria-hidden />
            Try asking
          </p>
          <ul className="space-y-2">
            {prompts.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  disabled={chatDisabled}
                  title={chatDisabled ? chatDisabledReason : undefined}
                  onClick={() => onTryQuestion(q)}
                  className={cn(
                    web.kbPromptBtn,
                    "flex w-full items-center gap-3 disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                >
                  <span className="min-w-0 flex-1">{q}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" strokeWidth={2} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {chatDisabled && chatDisabledReason ? (
        <p className="mt-3 text-center text-[12px] text-zinc-500">{chatDisabledReason}</p>
      ) : null}
    </div>
  )
}
