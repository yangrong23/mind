"use client"

import { ChevronRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { PlazaLibraryCover } from "@/components/mind-v2/plaza-library-cover"
import { KnowledgeGraphPreview } from "@/components/mind-v2/knowledge-detail-web-shell"
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
import { toast } from "sonner"

/** Knowledge graph block — same preview as personal notebook workspace. */
export function WebPlazaKbGraphSection({
  className,
  compact,
  embeddedInChat,
}: {
  className?: string
  compact?: boolean
  /** Inside agent chat column — tighter horizontal padding */
  embeddedInChat?: boolean
}) {
  return (
    <section className={cn("px-4 py-3", className)} aria-label="Knowledge graph in chat">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-zinc-500">
          Knowledge graph
        </h3>
        <button
          type="button"
          className="text-[11px] font-semibold text-mind hover:underline"
          onClick={() =>
            toast.message("Knowledge graph", {
              description: "Opens full graph view from this library (demo).",
            })
          }
        >
          Expand
        </button>
      </div>
      <div
        className={cn(
          "mt-2.5 flex flex-col items-center rounded-xl bg-gradient-to-b from-sky-50/40 via-stone-50/95 to-white px-3 py-4 ring-1 ring-sky-100/55",
          compact && "py-3",
          embeddedInChat && "mx-0"
        )}
      >
        <KnowledgeGraphPreview compact />
        <p className="mt-2 max-w-[240px] text-center text-[11px] leading-relaxed text-zinc-500">
          Concepts and sources from this library — grows as materials are added.
        </p>
      </div>
    </section>
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
    <section className={cn("border-t border-stone-100 px-4 py-3", className)} aria-label="Studio outputs">
      <h3 className="text-[12px] font-semibold uppercase tracking-wider text-zinc-500">Studio outputs</h3>
      <p className="mt-0.5 text-[11px] text-zinc-400">Generated from this library&apos;s sources</p>
      {userJobs && userJobs.length > 0 ? (
        <div className="mt-2">
          <StudioFactoryJobsInline
            userJobs={userJobs}
            showQuotaBanner={false}
            onDismissQuotaBanner={() => {}}
            archiveTargetLabel={libraryName}
            archivedJobIds={[]}
          />
        </div>
      ) : null}
      <WebPublicFactoryGallery outputs={outputs} className="mt-2 border-t-0 pt-0" />
    </section>
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
        <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl ring-1 ring-black/[0.06]">
          {kbId != null ? (
            <PlazaLibraryCover title={libraryName} kbId={kbId} size="lg" className="h-full w-full" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-500/90 to-teal-600/90 text-2xl text-white">
              ✦
            </div>
          )}
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
                    "flex w-full items-center gap-3 rounded-xl border border-stone-200/90 bg-white px-3.5 py-3 text-left text-[13px] leading-snug text-zinc-700 transition-colors",
                    "hover:border-sky-200/80 hover:bg-sky-50/40 disabled:cursor-not-allowed disabled:opacity-50"
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
