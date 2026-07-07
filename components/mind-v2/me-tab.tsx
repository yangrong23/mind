"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { buildDemoActivityTimeline, getTodayTimelineDay } from "@/lib/mock-activity-timeline"
import {
  getMindAccount,
  MIND_ACCOUNTS,
  accountSpaceLabel,
  type MindAccountId,
} from "@/lib/mind-accounts"
import { MeDevicesSettingsPanel } from "@/components/mind-v2/me-devices-settings"
import { MindShareSheet } from "@/components/mind-v2/mind-share-sheet"
import {
  SettingsGroup,
  SettingsLinkRow,
  SettingsScreenShell,
  SettingsToggleRow,
} from "@/components/mind-v2/me-settings-ui"
import {
  MeActivityDiaryPreview,
  MeActivityTimeline,
} from "@/components/mind-v2/me-activity-timeline"
import {
  buildMeStatsSharePayload,
  buildTimelineSharePayload,
  type MeStatsShareFocus,
  type MindSharePayload,
} from "@/lib/mind-share-payload"
import { MeStatsShareInsightPanel } from "@/components/mind-v2/me-stats-leaderboard"
import {
  MeCollectedPersonalInfoPanel,
  MePrivacySettingsPanel,
  MeStorageSpacePanel,
  MeThirdPartySharingPanel,
} from "@/components/mind-v2/me-settings-panels"
import { MeLegalDocumentPanel } from "@/components/mind-v2/me-legal-document-panel"
import type { MainlandLegalDocId } from "@/lib/mainland-legal-docs"
import { MeCreditsPlansScreen } from "@/components/mind-v2/me-credits-billing"
import { membershipPlanById } from "@/lib/mind-membership-plans"
import {
  MIND_FONT_ZOOM_MAX,
  MIND_FONT_ZOOM_MIN,
  clampFontZoomPercent,
} from "@/lib/mind-display-prefs"
import {
  ChevronRight,
  User,
  Bell,
  HelpCircle,
  Globe,
  Smartphone,
  Award,
  Clock,
  Mic,
  Brain,
  Bot,
  Cloud,
  Hash,
  MoreHorizontal,
  Trash2,
  Building2,
  Settings,
  LogOut,
  Sun,
  Moon,
  Cpu,
  HardDrive,
  Sparkles,
} from "lucide-react"

const DEMO_CAPTURE_DIARY = buildDemoActivityTimeline()

function hashDateString(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i)
  return Math.abs(h)
}

function formatHeatmapDayLabel(isoDate: string) {
  const d = new Date(isoDate + "T12:00:00")
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
}

function getDayUploads(isoDate: string, activity: number) {
  if (activity <= 0) return []
  const h = hashDateString(isoDate)
  const titles = [
    "Product requirements sync",
    "Quick voice memo — ideas",
    "1:1 with design",
    "Customer call notes",
    "Sprint planning snippet",
  ]
  const times = ["8:02 AM", "10:18 AM", "12:40 PM", "3:05 PM", "6:22 PM"]
  const count = Math.min(activity + 1, 5)
  return Array.from({ length: count }, (_, i) => ({
    id: `${isoDate}-${i}`,
    title: titles[(h + i) % titles.length],
    time: times[(h + i * 2) % times.length],
    source: (h + i) % 2 === 0 ? "Phone" : "Mindar Recorder",
  }))
}

function getDailyReviewForDay(isoDate: string, activity: number) {
  if (activity <= 0) {
    return "A light day in your capture log—no new uploads. Use the space to reflect or queue one small topic for tomorrow's first recording."
  }
  const h = hashDateString(isoDate)
  const flavors = [
    "You leaned into product and customer context—several threads point to the same roadmap bet. Carry one concrete decision into your next session.",
    "Captures skew toward meetings and async notes. The through-line is clarity on next steps; consider tagging follow-ups so they surface in weekly review.",
    "Mix of device and phone recordings. Energy looks steady; try linking one highlight to your knowledge library so it compounds.",
  ]
  return flavors[h % flavors.length]
}

function DisplayThemeSegment() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) {
    return <div className="mt-3 h-11 rounded-xl bg-stone-100/90" aria-hidden />
  }
  const isDark = resolvedTheme === "dark"
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={cn(
          "flex items-center justify-center gap-2 rounded-xl border py-2.5 text-[14px] font-medium transition-colors",
          !isDark
            ? "border-zinc-400 bg-stone-50 text-mind shadow-sm"
            : "border-stone-200 bg-white dark:bg-zinc-950 text-zinc-600 hover:bg-stone-100"
        )}
      >
        <Sun className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={cn(
          "flex items-center justify-center gap-2 rounded-xl border py-2.5 text-[14px] font-medium transition-colors",
          isDark
            ? "border-zinc-500 bg-stone-100 text-mind/10 shadow-sm"
            : "border-stone-200 bg-white dark:bg-zinc-950 text-zinc-600 hover:bg-stone-100"
        )}
      >
        <Moon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        Dark
      </button>
    </div>
  )
}

function getDayLeadLine(isoDate: string, activity: number) {
  const n = getDayUploads(isoDate, activity).length
  if (n === 0) {
    return "No captures logged for this date."
  }
  return `This day: ${n} capture${n === 1 ? "" : "s"} · activity level ${activity}.`
}

function buildDayExpandedShareText(isoDate: string, activity: number) {
  const label = formatHeatmapDayLabel(isoDate)
  const lead = getDayLeadLine(isoDate, activity)
  const narrative = getDailyReviewForDay(isoDate, activity)
  const uploads = getDayUploads(isoDate, activity)
  const titles = uploads.map((u) => `• ${u.title}`).join("\n")
  return [label, lead, narrative, uploads.length ? `Recorded:\n${titles}` : ""].filter(Boolean).join("\n\n")
}

function heatmapDaySharePreview(isoDate: string, activity: number) {
  const full = buildDayExpandedShareText(isoDate, activity)
  return full.length > 320 ? full.slice(0, 320) + "…" : full
}

const HEATMAP_VIRAL_SLOGANS_ACTIVE = [
  "Your future self is built\none square at a time.",
  "Ideas decay in memory.\nThey compound on your timeline.",
  "I didn't wait for inspiration—\nI captured it.",
  "Consistency is the quiet flex\nnobody sees until they do.",
  "Every recorded thought is a vote\nfor who you're becoming.",
  "Show up empty, leave with clarity—\nthat's the whole game.",
  "The best thinkers don't have better ideas.\nThey have better logs.",
] as const

const HEATMAP_VIRAL_SLOGANS_QUIET = [
  "Even quiet days count.\nRest is part of the streak.",
  "Blank squares aren't failure—\nthey're space for tomorrow.",
  "Not every day roars.\nSome days whisper—and that's enough.",
] as const

function getDayViralSlogan(isoDate: string, activity: number) {
  const h = hashDateString(isoDate)
  const pool = activity > 0 ? HEATMAP_VIRAL_SLOGANS_ACTIVE : HEATMAP_VIRAL_SLOGANS_QUIET
  return pool[h % pool.length]
}

function buildDayShareCardText(
  isoDate: string,
  activity: number,
  displayName: string,
  streakDays: number
) {
  const slogan = getDayViralSlogan(isoDate, activity).replace(/\n/g, " ")
  const label = formatHeatmapDayLabel(isoDate)
  const captures = getDayUploads(isoDate, activity).length
  const activityLine =
    activity > 0
      ? `${captures} capture${captures === 1 ? "" : "s"} · level ${activity}`
      : "A quiet day on my timeline"
  return `${slogan}\n\n${label} · ${activityLine}\n${streakDays}-day streak on Mindar · ${displayName}`
}

interface MeTabProps {
  activeAccountId: MindAccountId
  onActiveAccountChange: (id: MindAccountId) => void
  /** When provided, Sign out in the account sheet ends the demo session (guest gate). */
  onSessionSignOut?: () => void
  /** Shell text scale (85–130%). Controlled by parent so the device chrome updates live. */
  fontZoomPercent?: number
  onFontZoomPercentChange?: (pct: number) => void
  /** Desktop: profile + activity timeline */
  /** Increment from web rail to open credits / plans */
  creditsOpenSignal?: number
  isDeviceConnected: boolean
  onSetDeviceConnected: (connected: boolean) => void
}

export function MeTab({
  activeAccountId,
  onActiveAccountChange,
  onSessionSignOut,
  fontZoomPercent = 100,
  onFontZoomPercentChange,
  creditsOpenSignal = 0,
  isDeviceConnected,
  onSetDeviceConnected,
}: MeTabProps) {
  const activeAccount = getMindAccount(activeAccountId)
  const [activityDiary, setActivityDiary] = useState<{
    date: string
    value: number
    listFirst?: boolean
  } | null>(null)

  const openActivityDiaryList = () => {
    const today = getTodayTimelineDay(DEMO_CAPTURE_DIARY)
    setActivityDiary({ date: today.isoDate, value: today.activity, listFirst: false })
  }

  const openActivityDiaryDay = (day: { isoDate: string; activity: number }) => {
    setActivityDiary({ date: day.isoDate, value: day.activity, listFirst: false })
  }
  const [shareSheet, setShareSheet] = useState<MindSharePayload | null>(null)
  const [statsInsight, setStatsInsight] = useState<Exclude<MeStatsShareFocus, "overview"> | null>(null)
  const [showPreferences, setShowPreferences] = useState(false)
  const [showCloudSync, setShowCloudSync] = useState(false)
  const [showPersonalization, setShowPersonalization] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false)
  const [showCreditsPlans, setShowCreditsPlans] = useState(false)
  useEffect(() => {
    if (creditsOpenSignal > 0) setShowCreditsPlans(true)
  }, [creditsOpenSignal])
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false)
  const [wifiOnlySync, setWifiOnlySync] = useState(false)
  const [useMemory, setUseMemory] = useState(false)
  const [transcribeLang, setTranscribeLang] = useState("Not set")
  const [autoSpeaker, setAutoSpeaker] = useState(false)
  const [customTerms, setCustomTerms] = useState(false)
  const [appLock, setAppLock] = useState(false)
  const [helpImprove, setHelpImprove] = useState(true)
  const [lexiconDraft, setLexiconDraft] = useState("")
  const [lexiconTags, setLexiconTags] = useState<string[]>([
    "CRISPR",
    "single-cell",
    "ATAC-seq",
    "spatial transcriptomics",
  ])
  const [offlineOnly, setOfflineOnly] = useState(false)
  const [offlineConfirmOpen, setOfflineConfirmOpen] = useState(false)
  const [settingsExtra, setSettingsExtra] = useState<
    | null
    | "menu"
    | "display"
    | "notifications"
    | "storage"
    | "devices"
    | "features"
    | "privacy"
    | "about"
    | "help"
  >(null)
  const [legalDoc, setLegalDoc] = useState<MainlandLegalDocId | null>(null)
  const [showStorageSpace, setShowStorageSpace] = useState(false)
  const [privacyDetail, setPrivacyDetail] = useState<
    null | "thirdParty" | "collected" | "privacySettings"
  >(null)
  const [frontierInsights, setFrontierInsights] = useState(true)
  const [notifCaptureReady, setNotifCaptureReady] = useState(true)
  const [notifDigest, setNotifDigest] = useState(false)
  const [privacyCrashReports, setPrivacyCrashReports] = useState(true)

  const stats = {
    totalNotes: 156,
    totalDays: 23,
    consecutiveDays: 7,
    totalRecordings: 89,
    knowledgeItems: 234,
    creditsRemaining: 32_400,
    creditsMonthlyAllowance: 50_000,
  }

  function openStatsInsight(metric: Exclude<MeStatsShareFocus, "overview">) {
    setStatsInsight(metric)
  }

  function buildStatsSharePayload(focus: MeStatsShareFocus) {
    return buildMeStatsSharePayload({
      focus,
      displayName: activeAccount.displayName,
      memos: stats.totalNotes,
      streak: stats.consecutiveDays,
      usedDays: stats.totalDays,
    })
  }

  const statsInsightSharePayload =
    statsInsight != null
      ? buildStatsSharePayload(
          statsInsight === "memos"
            ? "memos"
            : statsInsight === "days"
              ? "days"
              : "streak"
        )
      : null

  const currentMembershipPlanId = "standard" as const
  const currentPlan = membershipPlanById(currentMembershipPlanId)
  const upgradePlan = membershipPlanById("pro")

  const profileHeroBlock = (
    <div className="px-5 pt-4 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowAccountSwitcher(true)}
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold transition-opacity hover:opacity-90",
              activeAccount.kind === "work"
                ? "bg-gradient-to-br from-stone-100 to-stone-50 ring-1 ring-stone-200/70"
                : cn(mx.accentPersonalAvatar, mx.accentPersonalRing)
            )}
            aria-label="Switch account"
          >
            {activeAccount.kind === "work" ? (
              <User className={cn("h-6 w-6", mx.accentWorkIcon)} />
            ) : (
              <span className="text-white">{activeAccount.initial}</span>
            )}
          </button>
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => setShowAccountSwitcher(true)}
              className="block min-w-0 max-w-full text-left"
              aria-label="Switch account"
            >
              <h2 className={cn("truncate text-[17px] font-semibold leading-tight tracking-tight", mx.brandOnHero)}>
                {accountSpaceLabel(activeAccount.kind)}
              </h2>
            </button>
            <div className="mt-0.5 flex min-w-0 items-center gap-2">
              {currentPlan ? (
                <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {currentPlan.name}
                </span>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSettingsExtra("menu")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-stone-100/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
            aria-label="Settings"
          >
            <Settings className="h-[19px] w-[19px]" strokeWidth={1.85} />
          </button>
        </div>

        {upgradePlan ? (
          <button
            type="button"
            onClick={() => setShowCreditsPlans(true)}
            className={cn(
              "group relative mt-3 w-full overflow-hidden rounded-2xl text-left",
              "border border-mind/20 bg-gradient-to-br from-mind/[0.09] via-white to-sky-50/70",
              "shadow-[0_8px_28px_-12px_rgba(56,189,248,0.35),0_2px_8px_-4px_rgba(15,23,42,0.06)]",
              "transition-[transform,box-shadow,border-color] duration-300",
              "hover:border-mind/30 hover:shadow-[0_12px_36px_-12px_rgba(56,189,248,0.42),0_4px_12px_-6px_rgba(15,23,42,0.08)]",
              "active:scale-[0.99] dark:border-mind/25 dark:from-mind/15 dark:via-zinc-900 dark:to-zinc-900",
              mx.brandFocusRing
            )}
            aria-label={`Upgrade to ${upgradePlan.name}`}
          >
            <span
              className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-mind/20 blur-2xl dark:bg-mind/25"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute -bottom-6 left-1/3 h-20 w-20 rounded-full bg-sky-300/15 blur-2xl dark:bg-sky-500/10"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/10"
              aria-hidden
            />

            <div className="relative flex items-center gap-3 px-4 py-3.5">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  "bg-gradient-to-br from-mind to-sky-500 text-white",
                  "shadow-[0_6px_16px_-4px_rgba(56,189,248,0.55)] ring-1 ring-white/30",
                  "transition-transform duration-300 group-hover:scale-[1.03]"
                )}
                aria-hidden
              >
                <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.1} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Upgrade to {upgradePlan.name}
                  </span>
                  <span className="rounded-full bg-mind/12 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-mind dark:bg-mind/20 dark:text-sky-300">
                    Best value
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
                  {upgradePlan.monthlyCreditsLabel} credits · {upgradePlan.features[1]?.toLowerCase() ?? upgradePlan.blurb}
                </span>
              </span>

              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  "bg-white/80 text-mind ring-1 ring-mind/15",
                  "transition-transform duration-300 group-hover:translate-x-0.5",
                  "dark:bg-zinc-900/80 dark:text-sky-300 dark:ring-mind/25"
                )}
                aria-hidden
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
              </span>
            </div>
          </button>
        ) : null}

        <div className="mt-4 grid grid-cols-3 gap-2">
          {(
            [
              { value: stats.totalNotes, label: "Memos", metric: "memos" as const },
              { value: stats.consecutiveDays, label: "Streak", metric: "streak" as const },
              { value: stats.totalDays, label: "Days", metric: "days" as const },
            ] as const
          ).map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => openStatsInsight(s.metric)}
              className={cn(
                mx.elevatedCard,
                "px-2 py-3 text-center transition-all active:scale-[0.98]",
                "hover:border-[#E9ECEF] dark:hover:border-zinc-600",
                mx.brandFocusRing
              )}
              aria-label={`View ${s.label} stats`}
            >
              <div className={cn("text-lg font-semibold tabular-nums leading-none", mx.brandOnHero)}>{s.value}</div>
              <div className={cn("mt-1 text-[11px] font-medium uppercase tracking-wide", mx.brandOnHeroMuted)}>
                {s.label}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-3">
          <MeActivityDiaryPreview
            days={DEMO_CAPTURE_DIARY}
            onOpenDiary={openActivityDiaryList}
            onOpenDay={openActivityDiaryDay}
          />
        </div>
    </div>
  )

  const accountAndOverlays = (
    <>
      {/* Multi-account: work vs personal (outside main scroll) */}
      {showAccountSwitcher && (
        <div className="absolute inset-0 z-[58] flex flex-col justify-center px-5 py-10">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="Close"
            onClick={() => setShowAccountSwitcher(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-switch-title"
            className="relative z-[59] mx-auto w-full max-w-[320px] overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xl shadow-stone-900/10 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <div className="px-4 pt-5 pb-3 text-center">
              <p id="account-switch-title" className="text-[16px] font-semibold text-zinc-900">
                Switch account
              </p>
            </div>

            <div className="px-5 pb-1 pt-2">
              <div className="flex flex-col items-center border-b border-stone-100 pb-5 text-center">
                <div
                  className={cn(
                    "flex h-[68px] w-[68px] items-center justify-center rounded-full text-2xl font-semibold shadow-inner",
                    activeAccount.kind === "work"
                      ? "bg-gradient-to-br from-stone-100 to-stone-50 ring-2 ring-stone-200/80"
                      : cn(mx.accentPersonalAvatar, "ring-2 ring-stone-200/90")
                  )}
                >
                  {activeAccount.kind === "work" ? (
                    <User className={cn("h-8 w-8", mx.accentWorkIcon)} />
                  ) : (
                    <span className="text-white">{activeAccount.initial}</span>
                  )}
                </div>
                <p className="mt-3 text-[15px] font-semibold text-zinc-900">{accountSpaceLabel(activeAccount.kind)}</p>
                <p className="mt-0.5 max-w-full truncate px-1 text-[13px] text-zinc-500">{activeAccount.email}</p>
                <p className="mt-2 rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600">
                  Current · {accountSpaceLabel(activeAccount.kind)}
                </p>
              </div>
            </div>

            <div className="max-h-[220px] overflow-y-auto px-2 pb-2">
              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Switch to
              </p>
              {MIND_ACCOUNTS.filter((a) => a.id !== activeAccountId).map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => {
                    onActiveAccountChange(acc.id)
                    setShowAccountSwitcher(false)
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-stone-50 active:bg-stone-100/80"
                >
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                      acc.kind === "work"
                        ? "bg-stone-50 ring-1 ring-zinc-200/60"
                        : cn(mx.accentPersonalAvatar)
                    )}
                  >
                    {acc.kind === "work" ? (
                      <User className={cn("h-5 w-5", mx.accentWorkIcon)} />
                    ) : (
                      <span className="text-white">{acc.initial}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-medium text-zinc-900">{accountSpaceLabel(acc.kind)}</span>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                          acc.kind === "work" ? cn(mx.accentWorkSoft, "text-mind") : "bg-stone-50 text-mind"
                        )}
                      >
                        {acc.kind === "work" ? "Work" : "Personal"}
                      </span>
                    </div>
                    <div className="truncate text-[13px] text-zinc-500">{acc.email}</div>
                  </div>
                  {acc.kind === "work" ? (
                    <Building2 className={cn("h-5 w-5 shrink-0", mx.accentWorkIcon)} aria-hidden />
                  ) : (
                    <ChevronRight className="h-5 w-5 shrink-0 text-zinc-300" aria-hidden />
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-stone-100 px-2 py-2">
              <button
                type="button"
                className={cn(
                  "w-full rounded-lg py-2.5 text-[15px] font-medium transition-colors",
                  mx.accentBlue,
                  mx.accentBlueHover
                )}
                onClick={() => {
                  toast.message("Add account", { description: "Would open the system account flow (demo)." })
                  setShowAccountSwitcher(false)
                }}
              >
                Add account…
              </button>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[15px] font-medium transition-colors",
                  mx.accentBlue,
                  mx.accentBlueHover
                )}
                onClick={() => {
                  setShowAccountSwitcher(false)
                  if (onSessionSignOut) {
                    onSessionSignOut()
                    return
                  }
                  toast.success("Signed out", { description: "Demo: local data is not cleared." })
                }}
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {statsInsight != null && statsInsightSharePayload ? (
        <MeStatsShareInsightPanel
          displayName={activeAccount.displayName}
          sharePayload={statsInsightSharePayload}
          timelineDays={DEMO_CAPTURE_DIARY}
          onShare={() => setShareSheet(statsInsightSharePayload)}
          onBack={() => setStatsInsight(null)}
        />
      ) : null}

      {offlineConfirmOpen && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center px-5">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="Dismiss"
            onClick={() => setOfflineConfirmOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="offline-title"
            className="relative z-[61] w-full max-w-[320px] rounded-2xl border border-stone-200 bg-white p-5 shadow-xl dark:border-stone-50 dark:bg-zinc-900"
          >
            <h2 id="offline-title" className="text-[17px] font-semibold text-zinc-900">
              Enable full offline mode?
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-zinc-600">
              When enabled, processing stays on-device. Cloud Claw skills (web search, Notion sync, long tool chains, and similar) will be unavailable and the experience will be reduced. Continue?
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setOfflineConfirmOpen(false)}
                className="flex-1 rounded-xl border border-stone-200 py-3 text-[15px] font-medium text-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setOfflineOnly(true)
                  setOfflineConfirmOpen(false)
                }}
                className={cn("flex-1 rounded-xl py-3 text-[15px] font-semibold text-white", mx.brandCta)}
              >
                Enable offline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings — drill-down */}
      {settingsExtra && (
        <SettingsScreenShell
          title={
            settingsExtra === "menu"
              ? "Settings"
              : settingsExtra === "display"
              ? "Display"
              : settingsExtra === "notifications"
                ? "Notifications"
                : settingsExtra === "storage"
                  ? "Cloud storage"
                  : settingsExtra === "devices"
                    ? "Devices"
                    : settingsExtra === "features"
                    ? "AI"
                    : settingsExtra === "privacy"
                      ? "Privacy"
                      : settingsExtra === "about"
                        ? "About"
                        : "Help"
          }
          subtitle={settingsExtra === "storage" ? "Notes & knowledge bases" : undefined}
          onBack={() => {
            if (settingsExtra === "menu") {
              setSettingsExtra(null)
            } else {
              setSettingsExtra("menu")
            }
            setPrivacyDetail(null)
            setLegalDoc(null)
            setShowStorageSpace(false)
          }}
        >
          {settingsExtra === "menu" && (
            <SettingsGroup>
              <SettingsLinkRow label="Display" onClick={() => setSettingsExtra("display")} />
              <SettingsLinkRow label="Notifications" onClick={() => setSettingsExtra("notifications")} />
              <SettingsLinkRow label="Cloud storage" onClick={() => setSettingsExtra("storage")} />
              <SettingsLinkRow label="Devices" onClick={() => setSettingsExtra("devices")} />
              <SettingsLinkRow label="AI" onClick={() => setSettingsExtra("features")} />
              <SettingsLinkRow label="Privacy" onClick={() => setSettingsExtra("privacy")} />
              <SettingsLinkRow label="About" onClick={() => setSettingsExtra("about")} />
              <SettingsLinkRow label="Help" onClick={() => setSettingsExtra("help")} last />
            </SettingsGroup>
          )}

          {settingsExtra === "display" && (
            <SettingsGroup>
              <div className="border-b border-stone-100/90 px-4 py-3.5 dark:border-zinc-800">
                <p className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">Appearance</p>
                <DisplayThemeSegment />
              </div>
              <div className="px-4 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">Text size</p>
                  <span className="shrink-0 tabular-nums text-[15px] font-semibold text-mind">{fontZoomPercent}%</span>
                </div>
                <input
                  type="range"
                  className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-mind dark:bg-zinc-700"
                  min={MIND_FONT_ZOOM_MIN}
                  max={MIND_FONT_ZOOM_MAX}
                  step={1}
                  value={fontZoomPercent}
                  onChange={(e) => onFontZoomPercentChange?.(clampFontZoomPercent(Number(e.target.value)))}
                  aria-label="Text size"
                />
              </div>
            </SettingsGroup>
          )}

          {settingsExtra === "notifications" && (
            <SettingsGroup>
              <SettingsToggleRow
                label="Recording ready"
                checked={notifCaptureReady}
                onChange={() => {
                  setNotifCaptureReady((v) => !v)
                  toast.success("Saved")
                }}
              />
              <SettingsToggleRow
                label="Weekly digest"
                checked={notifDigest}
                onChange={() => {
                  setNotifDigest((v) => !v)
                  toast.success("Saved")
                }}
                last
              />
            </SettingsGroup>
          )}

          {settingsExtra === "storage" && (
            <SettingsGroup>
              <SettingsLinkRow
                label="Usage breakdown"
                onClick={() => setShowStorageSpace(true)}
              />
              <SettingsLinkRow
                label="Clear cache"
                value="7.7 MB"
                onClick={() => toast.success("Cache cleared", { description: "Freed 7.7 MB (demo)." })}
                last
              />
            </SettingsGroup>
          )}

          {settingsExtra === "devices" && (
            <MeDevicesSettingsPanel
              isDeviceConnected={isDeviceConnected}
              onSetDeviceConnected={onSetDeviceConnected}
              lexiconDraft={lexiconDraft}
              onLexiconDraftChange={setLexiconDraft}
              lexiconTags={lexiconTags}
              onLexiconTagsChange={setLexiconTags}
              offlineOnly={offlineOnly}
              onRequestOfflineEnable={() => setOfflineConfirmOpen(true)}
              onOfflineDisable={() => setOfflineOnly(false)}
              onOpenPersonalization={() => {
                setSettingsExtra(null)
                setShowPersonalization(true)
              }}
              onOpenCloudSync={() => {
                setSettingsExtra(null)
                setShowCloudSync(true)
              }}
              onOpenRecordingSecurity={() => {
                setSettingsExtra(null)
                setShowPreferences(true)
              }}
            />
          )}

          {settingsExtra === "features" && (
            <SettingsGroup>
              <SettingsLinkRow
                label="Model"
                value="Light"
                onClick={() =>
                  toast.message("Model settings", {
                    description: "Custom models and routing (demo).",
                  })
                }
              />
              <SettingsToggleRow
                label="Frontier insights"
                checked={frontierInsights}
                onChange={() => {
                  setFrontierInsights((v) => !v)
                  toast.success("Saved")
                }}
                last
              />
            </SettingsGroup>
          )}

          {settingsExtra === "privacy" && (
            <SettingsGroup>
              <SettingsLinkRow
                label="Privacy Policy"
                onClick={() => setLegalDoc("privacyPolicy")}
              />
              <SettingsLinkRow label="Privacy settings" onClick={() => setPrivacyDetail("privacySettings")} />
              <SettingsLinkRow label="Data collected" onClick={() => setPrivacyDetail("collected")} />
              <SettingsLinkRow label="Third-party sharing" onClick={() => setPrivacyDetail("thirdParty")} />
              <SettingsLinkRow
                label="Delete account"
                onClick={() => setLegalDoc("deleteAccount")}
                last
              />
            </SettingsGroup>
          )}

          {settingsExtra === "about" && (
            <SettingsGroup>
              <SettingsLinkRow
                label="Terms of Service"
                onClick={() => setLegalDoc("termsOfService")}
              />
              <SettingsLinkRow
                label="Privacy Policy"
                onClick={() => setLegalDoc("privacyPolicy")}
              />
              <SettingsLinkRow
                label="Company information"
                onClick={() => setLegalDoc("companyInfo")}
              />
              <SettingsLinkRow label="Contact" onClick={() => setLegalDoc("contact")} last />
            </SettingsGroup>
          )}

          {settingsExtra === "help" && (
            <SettingsGroup>
              <SettingsLinkRow label="Support" onClick={() => setLegalDoc("support")} />
              <SettingsLinkRow label="Contact support" onClick={() => setLegalDoc("contact")} />
              <SettingsLinkRow
                label="Rate Mindar"
                onClick={() => toast.message("Rate Mindar", { description: "Would open the app store rating flow." })}
                last
              />
            </SettingsGroup>
          )}
        </SettingsScreenShell>
      )}

      {/* Recording & security (from Devices) */}
      {showPreferences && (
        <SettingsScreenShell
          zClass="z-50"
          title="Recording & security"
          onBack={() => setShowPreferences(false)}
        >
          <SettingsGroup className="mb-3">
            <SettingsLinkRow
              label="Transcription language"
              value={transcribeLang}
              onClick={() => {
                setTranscribeLang((v) =>
                  v === "Not set" ? "English" : v === "English" ? "Chinese (Simplified)" : "Not set"
                )
                toast.success("Language updated")
              }}
            />
            <SettingsLinkRow
              label="Speaker labels"
              value={autoSpeaker ? "On" : "Off"}
              onClick={() => {
                setAutoSpeaker((v) => !v)
                toast.success("Saved")
              }}
            />
            <SettingsLinkRow
              label="Custom vocabulary"
              value={customTerms ? "On" : "Off"}
              onClick={() => {
                setCustomTerms((v) => !v)
                toast.success("Saved")
              }}
              last
            />
          </SettingsGroup>
          <SettingsGroup>
            <SettingsLinkRow
              label="App lock"
              value={appLock ? "On" : "Off"}
              onClick={() => {
                setAppLock((v) => !v)
                toast.success("Saved")
              }}
            />
            <SettingsToggleRow
              label="Help improve AI"
              checked={helpImprove}
              onChange={() => {
                setHelpImprove((v) => !v)
                toast.success("Saved")
              }}
              last
            />
          </SettingsGroup>
        </SettingsScreenShell>
      )}

      {/* Private cloud sync */}
      {showCloudSync && (
        <div className="absolute inset-0 z-50 flex flex-col bg-white dark:bg-zinc-950 dark:bg-zinc-950 animate-in slide-in-from-right duration-200">
          <div className="flex items-center px-4 py-3 bg-white border-b border-stone-100/85">
            <button onClick={() => setShowCloudSync(false)} className="p-1">
              <ChevronRight className="w-6 h-6 text-zinc-600 rotate-180" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col items-center pt-12 pb-8 px-5">
              <div className="w-20 h-20 rounded-2xl bg-stone-100 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 mb-4">Private cloud sync</h1>
              <p className="text-zinc-500 text-center leading-relaxed">
                A secure space for your data. When enabled:<br/>
                1. Automatic backups help prevent data loss<br/>
                2. Edits sync across app and web for easy access
              </p>
            </div>

            <div className="px-5 space-y-4">
              <div className="bg-white rounded-xl border border-stone-100/85 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-4 border-b border-stone-100/85">
                  <span className="text-[15px] text-zinc-900">Enable private cloud sync</span>
                  <button
                    onClick={() => setCloudSyncEnabled(!cloudSyncEnabled)}
                    className={cn(
                      "w-12 h-7 rounded-full transition-colors relative",
                      cloudSyncEnabled ? "bg-mind" : cn(mx.toggleTrackOff)
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow",
                      cloudSyncEnabled ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[15px] text-zinc-900">Sync on Wi‑Fi only</span>
                    <button
                      onClick={() => setWifiOnlySync(!wifiOnlySync)}
                      className={cn(
                        "w-12 h-7 rounded-full transition-colors relative",
                        wifiOnlySync ? "bg-mind" : cn(mx.toggleTrackOff)
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow",
                        wifiOnlySync ? "right-1" : "left-1"
                      )} />
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400">When on, background sync runs only on Wi‑Fi.</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-stone-100/85 overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    toast.message("Storage", {
                      description: "Cloud usage is 16.62 MB (demo).",
                    })
                  }
                  className="flex w-full items-center justify-between px-4 py-4 border-b border-stone-100/85"
                >
                  <span className="text-[15px] text-zinc-900">Manage storage</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[15px] text-zinc-400">16.62 MB</span>
                    <ChevronRight className="w-5 h-5 text-zinc-300" />
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    toast.warning("Delete cloud recordings?", {
                      description: "Demo: nothing was deleted. Production will ask again.",
                    })
                  }
                  className="flex w-full items-center justify-between px-4 py-4"
                >
                  <span className="text-[15px] text-zinc-900">Delete cloud recordings</span>
                  <ChevronRight className="w-5 h-5 text-zinc-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personalization */}
      {showPersonalization && (
        <div className="absolute inset-0 z-50 flex flex-col bg-white dark:bg-zinc-950 dark:bg-zinc-950 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100/85 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <button onClick={() => setShowPersonalization(false)} className="p-1">
              <ChevronRight className="w-6 h-6 text-zinc-600 rotate-180" />
            </button>
            <h1 className="text-lg font-semibold text-zinc-900">Personalization</h1>
            <div className="w-8" />
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Profile */}
            <button 
              onClick={() => {
                setShowPersonalization(false)
                setShowProfile(true)
              }}
              className="w-full flex items-center justify-between px-5 py-4 bg-white border-b border-stone-100/85"
            >
              <span className="text-[15px] text-zinc-900">Profile</span>
              <ChevronRight className="w-5 h-5 text-zinc-300" />
            </button>

            {/* Content focus */}
            <div className="px-5 pt-6 pb-4 bg-white border-b border-stone-100/85">
              <h3 className="text-[15px] font-medium text-zinc-900 mb-4">Focus areas</h3>
              <input
                type="text"
                placeholder="What should outputs emphasize?"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-[15px] placeholder:text-zinc-400 focus:outline-none focus:border-stone-300 mb-4"
              />
              <div className="flex flex-wrap gap-2">
                {["Key takeaways", "Risks & open questions", "Actions & next steps"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toast.success("Focus area saved", { description: tag })}
                    className="rounded-full bg-stone-100 px-3 py-1.5 text-sm text-zinc-700 hover:bg-stone-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom instructions */}
            <div className="px-5 pt-6 pb-4 bg-white border-b border-stone-100/85">
              <h3 className="text-[15px] font-medium text-zinc-900 mb-4">Custom instructions</h3>
              <input
                type="text"
                placeholder="Tone and style for explanations?"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-[15px] placeholder:text-zinc-400 focus:outline-none focus:border-stone-300 mb-4"
              />
              <div className="flex flex-wrap gap-2">
                {["Concise", "Formal & professional", "Structured"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toast.success("Style hint applied", { description: tag })}
                    className="rounded-full bg-stone-100 px-3 py-1.5 text-sm text-zinc-700 hover:bg-stone-200"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Memory */}
            <div className="px-5 pt-6 pb-2">
              <div className="text-sm text-zinc-400 mb-2">Memory</div>
            </div>
            <div className="mx-5 bg-white rounded-xl border border-stone-100/85 overflow-hidden mb-6">
              <div className="px-4 py-4 border-b border-stone-100/85">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[15px] text-zinc-900">Use memory</span>
                  <button
                    onClick={() => setUseMemory(!useMemory)}
                    className={cn(
                      "w-12 h-7 rounded-full transition-colors relative",
                      useMemory ? "bg-mind" : cn(mx.toggleTrackOff)
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow",
                      useMemory ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>
                <p className="text-xs text-zinc-400">
                  When on, Mindar may use saved context for more relevant replies.
                  <span className={cn("underline underline-offset-2 decoration-stone-300", mx.citationLink)}>
                    Learn more
                  </span>
                </p>
              </div>
              <button className="w-full flex items-center justify-between px-4 py-4">
                <div>
                  <div className="text-[15px] text-zinc-900 text-left">Manage memory</div>
                  <div className="text-xs text-zinc-400 mt-1 text-left">View and edit saved context</div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-300" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credits & plan purchase */}
      {showCreditsPlans && (
        <MeCreditsPlansScreen
          onClose={() => setShowCreditsPlans(false)}
          stats={{
            creditsRemaining: stats.creditsRemaining,
            creditsMonthlyAllowance: stats.creditsMonthlyAllowance,
          }}
          currentPlanId={currentMembershipPlanId}
        />
      )}

      {/* Profile screen */}
      {showProfile && (
        <div className="absolute inset-0 z-50 flex flex-col bg-white dark:bg-zinc-950 dark:bg-zinc-950 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100/85 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <button onClick={() => setShowProfile(false)} className="p-1">
              <ChevronRight className="w-6 h-6 text-zinc-600 rotate-180" />
            </button>
            <h1 className="text-lg font-semibold text-zinc-900">Profile</h1>
            <div className="w-8" />
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-5 py-4 bg-white border-b border-stone-100/85">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[15px] text-zinc-900">Profile</span>
                <button
                  type="button"
                  onClick={() =>
                    toast.message("Edit profile", { description: "Would open the profile form (demo)." })
                  }
                  className="flex items-center gap-1 text-zinc-500"
                >
                  <span className="text-sm">Edit</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-zinc-400">Tap Edit to update your work context</p>
            </div>

            <div className="mx-5 mt-4 bg-white rounded-xl border border-stone-100/85 overflow-hidden">
              <div className="px-4 py-4 border-b border-stone-100/85">
                <div className="text-sm text-zinc-400 mb-1">Role</div>
                <div className="text-[15px] font-medium text-zinc-900">Strategy / Ops / Data</div>
              </div>
              <div className="px-4 py-4 border-b border-stone-100/85">
                <div className="text-sm text-zinc-400 mb-1">Industry</div>
                <div className="text-[15px] font-medium text-zinc-900">AI / Technology</div>
              </div>
              <div className="px-4 py-4 border-b border-stone-100/85">
                <div className="text-sm text-zinc-400 mb-1">Level</div>
                <div className="text-[15px] font-medium text-zinc-900">Manager / Lead</div>
              </div>
              <div className="px-4 py-4">
                <div className="text-sm text-zinc-400 mb-1">Primary use</div>
                <div className="text-[15px] font-medium text-zinc-900">Personal</div>
              </div>
            </div>

            <div className="px-5 pt-6 pb-2">
              <div className="text-sm text-zinc-400 mb-2">Additional notes</div>
            </div>
            <div className="mx-5 bg-white rounded-xl border border-stone-100/85 overflow-hidden mb-6">
              <textarea
                placeholder="Anything else we should know?"
                rows={4}
                className="w-full px-4 py-3 text-[15px] placeholder:text-zinc-400 focus:outline-none resize-none"
              />
              <div className="px-4 pb-3 text-right text-xs text-zinc-400">0/500</div>
            </div>
          </div>
        </div>
      )}

      {activityDiary ? (
        <MeActivityTimeline
          days={DEMO_CAPTURE_DIARY}
          initialDate={activityDiary.date}
          initialActivity={activityDiary.value}
          displayName={activeAccount.displayName}
          onClose={() => setActivityDiary(null)}
          getUploads={getDayUploads}
          onShare={(day) => {
            const title = formatHeatmapDayLabel(day.isoDate)
            const sharePreview = buildDayShareCardText(
              day.isoDate,
              day.activity,
              activeAccount.displayName,
              stats.consecutiveDays
            )
            const captures = getDayUploads(day.isoDate, day.activity).length
            const activityLine =
              day.activity > 0
                ? `${captures} capture${captures === 1 ? "" : "s"} · level ${day.activity}`
                : "A quiet day on my timeline"
            setShareSheet(
              buildTimelineSharePayload({
                displayName: activeAccount.displayName,
                dateLabel: title,
                slogan: getDayViralSlogan(day.isoDate, day.activity),
                activityLine,
                streakDays: stats.consecutiveDays,
                body: sharePreview,
              })
            )
          }}
          onOutputFileClick={(file) =>
            toast.message("Open file", { description: `${file.kindLabel}: ${file.title} (demo)` })
          }
        />
      ) : null}

      <MindShareSheet open={shareSheet != null} payload={shareSheet} onClose={() => setShareSheet(null)} />

      {showStorageSpace && <MeStorageSpacePanel onBack={() => setShowStorageSpace(false)} />}
      {privacyDetail === "thirdParty" && <MeThirdPartySharingPanel onBack={() => setPrivacyDetail(null)} />}
      {privacyDetail === "collected" && <MeCollectedPersonalInfoPanel onBack={() => setPrivacyDetail(null)} />}
      {privacyDetail === "privacySettings" && (
        <MePrivacySettingsPanel
          onBack={() => setPrivacyDetail(null)}
          onOpenDeleteAccount={() => {
            setPrivacyDetail(null)
            setLegalDoc("deleteAccount")
          }}
          crashReportsEnabled={privacyCrashReports}
          onCrashReportsChange={setPrivacyCrashReports}
        />
      )}
      {legalDoc ? <MeLegalDocumentPanel docId={legalDoc} onBack={() => setLegalDoc(null)} /> : null}
    </>
  )

  return (
    <div className={cn("relative flex h-full min-h-0 flex-col", mx.pageBg)}>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-4">{profileHeroBlock}</div>
      {accountAndOverlays}
    </div>
  )
}
