"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { ChevronRight, Download, Gift, UserPlus } from "lucide-react"
import { toast } from "sonner"

const KB_BYTES = 1 * 1024 * 1024
const NOTES_BYTES = 11.2 * 1024 * 1024
const TOTAL_BYTES = 30 * 1024 * 1024 * 1024
const USED_BYTES = KB_BYTES + NOTES_BYTES

function formatGb(bytes: number, digits = 2) {
  return (bytes / (1024 * 1024 * 1024)).toFixed(digits)
}

function formatMb(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function PanelChrome({
  title,
  onBack,
  children,
  darkHeader,
}: {
  title: string
  onBack: () => void
  children: React.ReactNode
  darkHeader?: boolean
}) {
  return (
    <div className="absolute inset-0 z-[56] flex flex-col bg-white dark:bg-zinc-950 animate-in slide-in-from-right duration-200 dark:bg-zinc-950">
      <div
        className={cn(
          "flex shrink-0 items-center gap-2 px-4 py-3",
          darkHeader
            ? "border-b border-zinc-700 bg-zinc-800 text-white dark:bg-zinc-900"
            : "border-b border-stone-100/85 bg-white dark:border-zinc-800 dark:bg-zinc-900"
        )}
      >
        <button
          type="button"
          onClick={onBack}
          className={cn("rounded-full p-1 hover:opacity-80", darkHeader && "text-white")}
          aria-label="Back"
        >
          <ChevronRight
            className={cn("h-6 w-6 rotate-180", darkHeader ? "text-white" : "text-zinc-600")}
          />
        </button>
        <h1
          className={cn(
            "min-w-0 flex-1 truncate text-center text-[15px] font-semibold leading-snug",
            darkHeader ? "text-white" : "text-zinc-900 dark:text-zinc-100"
          )}
        >
          {title}
        </h1>
        <div className="w-8 shrink-0" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}

export function MeStorageSpacePanel({ onBack }: { onBack: () => void }) {
  const kbPct = (KB_BYTES / USED_BYTES) * 100
  const notesPct = (NOTES_BYTES / USED_BYTES) * 100
  const usedOfTotalPct = Math.min(100, (USED_BYTES / TOTAL_BYTES) * 100)

  return (
    <PanelChrome title="Storage space" onBack={onBack}>
      <div className="space-y-5 p-5">
        <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium text-zinc-500">Used</p>
          <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
            {formatGb(USED_BYTES, 2)} GB
            <span className="text-base font-semibold text-zinc-400"> / {formatGb(TOTAL_BYTES, 0)} GB</span>
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-zinc-500 dark:bg-zinc-400"
              style={{ width: `${usedOfTotalPct}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-mind" aria-hidden />
              Knowledge base
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-mind/38" aria-hidden />
              Notes
            </span>
          </div>
          <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div className="h-full bg-mind" style={{ width: `${kbPct}%` }} />
            <div className="h-full bg-mind/38" style={{ width: `${notesPct}%` }} />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3.5 dark:border-zinc-800">
            <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Knowledge base</span>
            <span className="text-[15px] tabular-nums text-zinc-500">{formatMb(KB_BYTES)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Notes</span>
            <span className="text-[15px] tabular-nums text-zinc-500">{formatMb(NOTES_BYTES)}</span>
          </div>
        </div>

        <div>
          <p className="mb-2 px-0.5 text-xs font-medium text-zinc-500">How to get more storage?</p>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() =>
                toast.message("Limited-time offer", {
                  description: "Download Mind on phone and desktop to claim bonus cloud storage (demo).",
                })
              }
              className="flex w-full items-start gap-3 rounded-2xl border border-stone-200/90 bg-white p-4 text-left shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/80"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-50 text-mind dark:bg-stone-50 dark:text-mind/28">
                <Gift className="h-5 w-5" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
                    Get 20 GB free on both platforms
                  </span>
                  <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                    Limited
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                  Install Mind on mobile and desktop to unlock extra space for work and study files.
                </p>
              </div>
              <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-zinc-300" />
            </button>
            <button
              type="button"
              onClick={() =>
                toast.message("Referrals", {
                  description: "Each new friend adds 10 GB, up to 50 GB total (demo).",
                })
              }
              className="flex w-full items-start gap-3 rounded-2xl border border-stone-200/90 bg-white p-4 text-left shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/80"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-50 text-mind dark:bg-stone-50 dark:text-mind/28">
                <UserPlus className="h-5 w-5" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
                  Invite friends, expand free space
                </span>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                  For every new Mind user you invite, receive 10 GB free storage — up to 50 GB.
                </p>
              </div>
              <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-zinc-300" />
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-zinc-400">
          Storage covers notes and knowledge bases only. Other caches are listed under Settings → General.
        </p>
      </div>
    </PanelChrome>
  )
}

const COLLECTED_INFO_ROWS = [
  {
    title: "User identity & authentication",
    subtitle: "Avatar, display name, nickname, and similar profile fields.",
  },
  {
    title: "Account information",
    subtitle: "Registered account identifiers and linked sign-in methods.",
  },
  {
    title: "User content signals",
    subtitle: "Notification payloads and clipboard snippets you allow the app to read.",
  },
  {
    title: "Service logs (search)",
    subtitle: "In-app search history used to improve recall and ranking.",
  },
  {
    title: "Service logs (browsing)",
    subtitle: "Screens and articles you open inside Mind for continuity.",
  },
  {
    title: "Device information",
    subtitle: "Hardware model, OS version, and a stable device identifier for security.",
  },
] as const

export function MeCollectedPersonalInfoPanel({ onBack }: { onBack: () => void }) {
  return (
    <PanelChrome title="Personal information collected" onBack={onBack}>
      <div className="divide-y divide-stone-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
        {COLLECTED_INFO_ROWS.map((row) => (
          <button
            key={row.title}
            type="button"
            onClick={() =>
              toast.message(row.title, {
                description: "Full detail sheet would open here (demo).",
              })
            }
            className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">{row.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">{row.subtitle}</p>
            </div>
            <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-zinc-300" />
          </button>
        ))}
      </div>
    </PanelChrome>
  )
}

function DocMetaBar({
  onDownload,
  dark,
}: {
  onDownload: () => void
  dark?: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 text-[11px]",
        dark
          ? "border-zinc-700 bg-zinc-800/80 text-zinc-300"
          : "border-stone-100 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/80"
      )}
    >
      <span>Updated · 2026-01-12</span>
      <span>Effective · 2026-01-19</span>
      <button
        type="button"
        onClick={onDownload}
        className={cn(
          "inline-flex items-center gap-1 font-medium",
          dark ? "text-mind/28" : cn("text-mind", mx.citationLink)
        )}
      >
        <Download className="h-3.5 w-3.5" />
        Download
      </button>
    </div>
  )
}

export function MePrivacyGuideSummaryPanel({ onBack }: { onBack: () => void }) {
  return (
    <div className="absolute inset-0 z-[56] flex flex-col bg-white animate-in slide-in-from-right duration-200 dark:bg-zinc-950">
      <div className="flex shrink-0 items-center gap-2 border-b border-zinc-800 bg-zinc-800 px-3 py-3 text-white dark:bg-zinc-900">
        <button type="button" onClick={onBack} className="rounded-full p-1 hover:bg-white/10" aria-label="Back">
          <ChevronRight className="h-6 w-6 rotate-180 text-white" />
        </button>
        <p className="min-w-0 flex-1 text-center text-[13px] font-semibold leading-snug">
          Mind — privacy protection guide (summary)
        </p>
        <div className="w-8 shrink-0" />
      </div>
      <DocMetaBar
        dark
        onDownload={() => toast.success("Download started", { description: "PDF export is a demo." })}
      />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Privacy protection guide summary</h2>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          We take your personal information seriously. This summary explains how we collect, use, and protect it in
          line with applicable laws and common industry practice. For the full guide, open{" "}
          <span className="font-medium text-zinc-800 dark:text-zinc-200">Me → Settings → About Mind</span> (demo).
        </p>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">I. Information we collect</h3>
        <div className="overflow-x-auto rounded-lg border border-zinc-200 text-left text-[11px] dark:border-zinc-700">
          <table className="w-full min-w-[280px] border-collapse">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-900">
                <th className="border border-zinc-200 px-2 py-2 font-semibold dark:border-zinc-700">Scenario</th>
                <th className="border border-zinc-200 px-2 py-2 font-semibold dark:border-zinc-700">Method</th>
                <th className="border border-zinc-200 px-2 py-2 font-semibold dark:border-zinc-700">Type</th>
              </tr>
            </thead>
            <tbody className="text-zinc-700 dark:text-zinc-300">
              <tr>
                <td className="border border-zinc-200 px-2 py-2 dark:border-zinc-700">Account sign-in</td>
                <td className="border border-zinc-200 px-2 py-2 dark:border-zinc-700">In-app, after consent</td>
                <td className="border border-zinc-200 px-2 py-2 dark:border-zinc-700">Avatar, nickname, email</td>
              </tr>
              <tr>
                <td className="border border-zinc-200 px-2 py-2 dark:border-zinc-700">Knowledge profile</td>
                <td className="border border-zinc-200 px-2 py-2 dark:border-zinc-700">In-app, after consent</td>
                <td className="border border-zinc-200 px-2 py-2 dark:border-zinc-700">Library name, cover art</td>
              </tr>
              <tr>
                <td className="border border-zinc-200 px-2 py-2 dark:border-zinc-700">Stability &amp; security</td>
                <td className="border border-zinc-200 px-2 py-2 dark:border-zinc-700">In-app, after consent</td>
                <td className="border border-zinc-200 px-2 py-2 dark:border-zinc-700">Device model, OS, app version</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function MeThirdPartySharingPanel({ onBack }: { onBack: () => void }) {
  return (
    <div className="absolute inset-0 z-[56] flex flex-col bg-white animate-in slide-in-from-right duration-200 dark:bg-zinc-950">
      <div className="flex shrink-0 items-center gap-2 border-b border-zinc-800 bg-zinc-800 px-3 py-3 text-white dark:bg-zinc-900">
        <button type="button" onClick={onBack} className="rounded-full p-1 hover:bg-white/10" aria-label="Back">
          <ChevronRight className="h-6 w-6 rotate-180 text-white" />
        </button>
        <p className="min-w-0 flex-1 text-center text-[13px] font-semibold leading-snug">
          Mind — personal information shared with third parties
        </p>
        <div className="w-8 shrink-0" />
      </div>
      <DocMetaBar
        dark
        onDownload={() => toast.success("Download started", { description: "PDF export is a demo." })}
      />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Introduction</h2>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Some features rely on third-party SDKs or services (for example push delivery, crash analytics, or cloud
          storage). We only share the minimum information required for those features to function, under strict
          contracts. Each provider processes data under their own privacy policy; we review them before integration.
          This document is a high-level overview — download the full notice for legal detail (demo).
        </p>
      </div>
    </div>
  )
}

export function MePrivacySettingsPanel({
  onBack,
  crashReportsEnabled,
  onCrashReportsChange,
}: {
  onBack: () => void
  crashReportsEnabled: boolean
  onCrashReportsChange: (v: boolean) => void
}) {
  const [personalized, setPersonalized] = useState(true)

  return (
    <PanelChrome title="Privacy settings" onBack={onBack}>
      <div className="space-y-4 p-5">
        <button
          type="button"
          onClick={() => toast.message("Personal information", { description: "Would open management tools (demo)." })}
          className="flex w-full items-center justify-between rounded-xl border border-stone-200/90 bg-white px-4 py-4 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <span className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">
            Personal information management
          </span>
          <ChevronRight className="h-5 w-5 text-zinc-300" />
        </button>

        <div className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">Personalized recommendations</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                When off, we won&apos;t use your history to tune shared knowledge-base suggestions; relevance may
                decrease.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={personalized}
              onClick={() => {
                setPersonalized((v) => !v)
                toast.success("Saved")
              }}
              className={cn(
                "relative mt-0.5 h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors",
                personalized ? "bg-mind" : cn(mx.toggleTrackOff)
              )}
            >
              <span
                className={cn(
                  "block h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
                  personalized ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>

        {(
          [
            {
              label: "Allow camera access",
              hint: "Camera permission usage rules",
            },
            {
              label: "Allow file storage and access",
              hint: "File storage and access permission usage rules",
            },
            {
              label: "Allow microphone access",
              hint: "Microphone permission usage rules",
            },
          ] as const
        ).map((perm) => (
          <div key={perm.label}>
            <div className="flex items-center justify-between rounded-xl border border-stone-200/90 bg-white px-4 py-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-[15px] text-zinc-900 dark:text-zinc-100">{perm.label}</span>
              <button
                type="button"
                onClick={() =>
                  toast.message("System settings", { description: "Would deep-link to OS permissions (demo)." })
                }
                className="shrink-0 text-xs font-medium text-zinc-500"
              >
                Go to Settings &gt;
              </button>
            </div>
            <p className="mt-1.5 px-1 text-xs text-zinc-500">
              View detailed{" "}
              <button
                type="button"
                className="font-medium text-mind underline decoration-mind/30 underline-offset-2 dark:text-mind/38"
                onClick={() => toast.message(perm.hint, { description: "Policy excerpt would open here (demo)." })}
              >
                {perm.hint}
              </button>
            </p>
          </div>
        ))}

        <div className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">Share crash reports</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                Helps fix bugs faster. No raw audio is included.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={crashReportsEnabled}
              onClick={() => {
                onCrashReportsChange(!crashReportsEnabled)
                toast.success("Saved")
              }}
              className={cn(
                "relative mt-0.5 h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors",
                crashReportsEnabled ? "bg-mind" : cn(mx.toggleTrackOff)
              )}
            >
              <span
                className={cn(
                  "block h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
                  crashReportsEnabled ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            toast.success("Added to export queue", {
              description: "You will get a download link when ready (demo).",
            })
          }
          className="flex w-full items-center justify-between rounded-xl border border-stone-200/90 bg-white px-4 py-4 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <span className="text-[15px] text-zinc-900 dark:text-zinc-100">Export my data</span>
          <ChevronRight className="h-5 w-5 text-zinc-300" />
        </button>
      </div>
    </PanelChrome>
  )
}
