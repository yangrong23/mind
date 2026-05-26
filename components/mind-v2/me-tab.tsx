"use client"

import { useState, useEffect, type ReactNode } from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
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
import { MeTabWebLayout } from "@/components/mind-v2/me-tab-web-layout"
import {
  MeActivityDiaryPreview,
  MeActivityTimeline,
  MeDiaryTimelineEmbed,
  MeDiaryTimelinePanel,
} from "@/components/mind-v2/me-activity-timeline"
import { WebMeProfileHeader, WebMeSettingCard, type WebMeStat } from "@/components/mind-v2/web-me-shell"
import { WebMeSettingsDetail } from "@/components/mind-v2/web-me-settings-detail"
import { buildTimelineSharePayload, type MindSharePayload } from "@/lib/mind-share-payload"
import {
  MeCollectedPersonalInfoPanel,
  MePrivacyGuideSummaryPanel,
  MePrivacySettingsPanel,
  MeStorageSpacePanel,
  MeThirdPartySharingPanel,
} from "@/components/mind-v2/me-settings-panels"
import { MeCreditsPlansScreen } from "@/components/mind-v2/me-credits-billing"
import {
  MIND_FONT_ZOOM_MAX,
  MIND_FONT_ZOOM_MIN,
  clampFontZoomPercent,
} from "@/lib/mind-display-prefs"
import {
  FileText,
  ChevronRight,
  Share2,
  User,
  Bell,
  HelpCircle,
  Globe,
  Shield,
  Smartphone,
  Award,
  Clock,
  Mic,
  Brain,
  Bot,
  Cloud,
  Calendar,
  Zap,
  Hash,
  MoreHorizontal,
  Trash2,
  Building2,
  ChevronsUpDown,
  LogOut,
  Sun,
  Moon,
  Cpu,
  HardDrive,
} from "lucide-react"

const DEMO_CAPTURE_DIARY = buildDemoActivityTimeline()

function settingsExtraTitle(
  settingsExtra:
    | "display"
    | "notifications"
    | "storage"
    | "devices"
    | "features"
    | "privacy"
    | "account"
    | "help"
): string {
  const map: Record<string, string> = {
    display: "Display",
    notifications: "Notifications",
    storage: "Storage",
    devices: "Devices",
    features: "AI",
    privacy: "Privacy",
    account: "Account",
    help: "Help",
  }
  return map[settingsExtra] ?? "Settings"
}

function MeSettingsShell({
  webLayout,
  title,
  onBack,
  children,
  zClass,
}: {
  webLayout?: boolean
  title: string
  onBack: () => void
  children: ReactNode
  zClass?: string
}) {
  if (webLayout) {
    return (
      <WebMeSettingsDetail title={title} onBack={onBack}>
        {children}
      </WebMeSettingsDetail>
    )
  }
  return (
    <SettingsScreenShell title={title} onBack={onBack} zClass={zClass}>
      {children}
    </SettingsScreenShell>
  )
}

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
    source: (h + i) % 2 === 0 ? "Phone" : "Mind Recorder",
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
  return `${slogan}\n\n${label} · ${activityLine}\n${streakDays}-day streak on Mind · ${displayName}`
}

export interface MeTabProps {
  activeAccountId: MindAccountId
  onActiveAccountChange: (id: MindAccountId) => void
  /** When provided, Sign out in the account sheet ends the demo session (guest gate). */
  onSessionSignOut?: () => void
  /** Shell text scale (85–130%). Controlled by parent so the device chrome updates live. */
  fontZoomPercent?: number
  onFontZoomPercentChange?: (pct: number) => void
  /** Desktop: profile + activity timeline */
  webLayout?: boolean
  /** Increment from web rail to open credits / plans */
  creditsOpenSignal?: number
}

export function MeTab({
  activeAccountId,
  onActiveAccountChange,
  onSessionSignOut,
  fontZoomPercent = 100,
  onFontZoomPercentChange,
  webLayout = false,
  creditsOpenSignal = 0,
}: MeTabProps) {
  const activeAccount = getMindAccount(activeAccountId)
  const [activityDiary, setActivityDiary] = useState<{
    date: string
    value: number
    listFirst?: boolean
  } | null>(null)

  const openActivityDiaryList = () => {
    const today = getTodayTimelineDay(DEMO_CAPTURE_DIARY)
    setActivityDiary({ date: today.isoDate, value: today.activity, listFirst: true })
  }

  const openActivityDiaryDay = (day: { isoDate: string; activity: number }) => {
    setActivityDiary({ date: day.isoDate, value: day.activity, listFirst: true })
  }
  const [shareSheet, setShareSheet] = useState<MindSharePayload | null>(null)
  const [showShareCard, setShowShareCard] = useState(false)
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
  const [isDeviceConnected, setIsDeviceConnected] = useState(true)
  const [settingsExtra, setSettingsExtra] = useState<
    | null
    | "display"
    | "notifications"
    | "storage"
    | "devices"
    | "features"
    | "privacy"
    | "account"
    | "help"
  >(null)
  const [showStorageSpace, setShowStorageSpace] = useState(false)
  const [privacyDetail, setPrivacyDetail] = useState<
    null | "guide" | "thirdParty" | "collected" | "privacySettings"
  >(null)
  const [frontierInsights, setFrontierInsights] = useState(true)
  const themeForHub = useTheme()
  const [themeHubMounted, setThemeHubMounted] = useState(false)
  useEffect(() => setThemeHubMounted(true), [])
  const [notifCaptureReady, setNotifCaptureReady] = useState(true)
  const [notifDigest, setNotifDigest] = useState(false)
  const [privacyCrashReports, setPrivacyCrashReports] = useState(true)

  const stats = {
    totalNotes: 156,
    totalDays: 23,
    consecutiveDays: 7,
    totalHours: 12.5,
    totalRecordings: 89,
    knowledgeItems: 234,
    creditsRemaining: 32_400,
    creditsMonthlyAllowance: 50_000,
  }

  const currentMembershipPlanId = "standard" as const

  const appearanceLabel =
    !themeHubMounted || !themeForHub.resolvedTheme
      ? "…"
      : themeForHub.resolvedTheme === "dark"
        ? "Dark"
        : "Light"
  const notifStatusLabel = notifCaptureReady || notifDigest ? "On" : "Off"

  const profileHeroBlock = (
    <div className={cn(webLayout ? "p-0" : cn("px-5 pt-4 pb-4", "bg-[#0a1530] text-white"))}>
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowAccountSwitcher(true)}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-3 rounded-xl py-0.5 pl-0.5 pr-2 text-left transition-colors focus:outline-none",
              "hover:bg-white/10",
              "focus-visible:ring-2 focus-visible:ring-mind/35 focus-visible:ring-offset-2"
            )}
            aria-label="Switch account"
          >
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold",
                activeAccount.kind === "work"
                  ? "bg-gradient-to-br from-stone-100 to-stone-50 ring-1 ring-stone-200/70"
                  : cn("bg-mind text-white", "ring-2 ring-mind/20")
              )}
            >
              {activeAccount.kind === "work" ? (
                <User className={cn("h-6 w-6", "text-mind")} />
              ) : (
                <span className="text-white">{activeAccount.initial}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className={cn("text-[17px] font-semibold leading-tight tracking-tight", "text-white")}>
                  {activeAccount.displayName}
                </h2>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    activeAccount.kind === "work"
                      ? cn("bg-mind/8", "text-mind")
                      : cn("bg-mind/8", "text-mind")
                  )}
                >
                  {accountSpaceLabel(activeAccount.kind)}
                </span>
              </div>
              <p className={cn("mt-0.5 truncate text-[13px]", "text-[#a4a097]")}>{activeAccount.email}</p>
              <p className={cn("mt-0.5 text-[12px]", "text-[#a4a097]")}>
                {stats.totalDays} days ·{" "}
                <span className={cn("font-medium", "text-white")}>
                  {stats.creditsRemaining.toLocaleString("en-US")} credits
                </span>
              </p>
            </div>
            <ChevronsUpDown className={cn("h-4 w-4 shrink-0 opacity-50", "text-[#a4a097]")} aria-hidden />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-stone-200 pt-3">
          {[
            { value: stats.totalNotes, label: "Memos" },
            { value: stats.consecutiveDays, label: "Streak" },
            { value: `${stats.totalHours}h`, label: "Captured" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className={cn("text-lg font-semibold tabular-nums leading-none", "text-white")}>{s.value}</div>
              <div className={cn("mt-1 text-[11px]", "text-[#a4a097]")}>{s.label}</div>
            </div>
          ))}
        </div>

        {!webLayout ? (
          <button
            type="button"
            onClick={() => setShowCreditsPlans(true)}
            className={cn(
              "mt-3 w-full rounded-xl border border-stone-200 bg-white/60 py-2 text-[13px] font-medium text-mind shadow-sm shadow-stone-900/5 backdrop-blur-sm transition-colors hover:bg-white/90",
              "focus-visible:ring-2 focus-visible:ring-mind/35 focus-visible:ring-offset-2"
            )}
          >
            {stats.creditsRemaining.toLocaleString("en-US")} credits · Plans & refill
          </button>
        ) : null}

        {!webLayout ? (
        <div className="mt-3 space-y-3 rounded-xl border border-stone-200 bg-white/55 p-3 shadow-sm shadow-stone-900/5 backdrop-blur-sm">
          <MeActivityDiaryPreview
            days={DEMO_CAPTURE_DIARY}
            gridCells={35}
            onOpenDiary={openActivityDiaryList}
            onOpenDay={openActivityDiaryDay}
          />

          <div>
            <p className="mb-2 px-0.5 text-[12px] font-semibold text-zinc-800">Settings</p>
            <SettingsGroup>
              <SettingsLinkRow
                label="Display"
                value={`${appearanceLabel} · ${fontZoomPercent}%`}
                onClick={() => setSettingsExtra("display")}
              />
              <SettingsLinkRow
                label="Notifications"
                value={notifStatusLabel}
                onClick={() => setSettingsExtra("notifications")}
              />
              <SettingsLinkRow
                label="Storage"
                value="11.2 MB"
                onClick={() => setSettingsExtra("storage")}
              />
              <SettingsLinkRow
                label="Devices"
                value={isDeviceConnected ? "Recorder connected" : "Not connected"}
                onClick={() => setSettingsExtra("devices")}
              />
              <SettingsLinkRow
                label="AI"
                value={frontierInsights ? "Frontier on" : "Standard"}
                onClick={() => setSettingsExtra("features")}
              />
              <SettingsLinkRow label="Privacy" onClick={() => setSettingsExtra("privacy")} />
              <SettingsLinkRow label="Account" onClick={() => setSettingsExtra("account")} />
              <SettingsLinkRow label="Help" onClick={() => setSettingsExtra("help")} last />
            </SettingsGroup>
          </div>
        </div>
        ) : null}
    </div>
  )

  const webMeStats: WebMeStat[] = [
    { label: "Memos", value: stats.totalNotes, icon: FileText, tone: "blue" },
    { label: "Streak", value: stats.consecutiveDays, icon: Award, tone: "orange" },
    { label: "Captured", value: `${stats.totalHours}h`, icon: Clock, tone: "violet" },
    {
      label: "Credits",
      value: stats.creditsRemaining.toLocaleString("en-US"),
      icon: Zap,
      tone: "teal",
    },
  ]

  const webTimelinePanel = (
    <MeDiaryTimelinePanel
      days={DEMO_CAPTURE_DIARY}
      gridCells={35}
      onOpenDiary={openActivityDiaryList}
      onOpenDay={openActivityDiaryDay}
    />
  )

  const webSettingsPanel = (
    <div className="flex flex-col gap-3">
      <p className="px-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-zinc-400">Settings</p>
      {[
        {
          key: "display",
          node: (
            <WebMeSettingCard
              icon={Sun}
              title="Display"
              subtitle={`${appearanceLabel} · ${fontZoomPercent}%`}
              onClick={() => setSettingsExtra("display")}
            />
          ),
        },
        {
          key: "notifications",
          node: (
            <WebMeSettingCard
              icon={Bell}
              title="Notifications"
              subtitle={notifStatusLabel === "On" ? "Capture ready · digest optional" : "All off"}
              toggle
              checked={notifCaptureReady || notifDigest}
              onToggle={() => {
                setNotifCaptureReady((v) => !v)
                toast.success("Saved")
              }}
            />
          ),
        },
        {
          key: "storage",
          node: (
            <WebMeSettingCard
              icon={HardDrive}
              title="Storage"
              subtitle="11.2 MB · manage breakdown"
              onClick={() => setSettingsExtra("storage")}
            />
          ),
        },
        {
          key: "devices",
          node: (
            <WebMeSettingCard
              icon={Smartphone}
              title="Devices"
              subtitle={isDeviceConnected ? "Recorder connected" : "Not connected"}
              onClick={() => setSettingsExtra("devices")}
            />
          ),
        },
        {
          key: "ai",
          node: (
            <WebMeSettingCard
              icon={Brain}
              title="AI"
              subtitle={frontierInsights ? "Frontier on" : "Standard"}
              onClick={() => setSettingsExtra("features")}
            />
          ),
        },
        {
          key: "privacy",
          node: (
            <WebMeSettingCard
              icon={Shield}
              title="Privacy"
              subtitle="Guide · data · sharing"
              onClick={() => setSettingsExtra("privacy")}
            />
          ),
        },
        {
          key: "account",
          node: (
            <WebMeSettingCard
              icon={User}
              title="Account"
              subtitle="Personalization · sync · security"
              onClick={() => setSettingsExtra("account")}
            />
          ),
        },
        {
          key: "help",
          node: (
            <WebMeSettingCard
              icon={HelpCircle}
              title="Help"
              subtitle="Guide · support · feedback"
              onClick={() => setSettingsExtra("help")}
            />
          ),
        },
      ].map((row, i) => (
        <div
          key={row.key}
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500"
          style={{ animationDelay: `${60 + i * 40}ms` }}
        >
          {row.node}
        </div>
      ))}
    </div>
  )

  const webProfileHero = (
    <WebMeProfileHeader
      account={activeAccount}
      stats={webMeStats}
      onOpenAccountSwitcher={() => setShowAccountSwitcher(true)}
      onOpenCredits={() => setShowCreditsPlans(true)}
    />
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
              <p className="mt-1.5 text-[13px] leading-snug text-zinc-500">
                Work and personal spaces stay separate; switching does not mix their UI or content.
              </p>
            </div>

            <div className="px-5 pb-1 pt-2">
              <div className="flex flex-col items-center border-b border-stone-100 pb-5 text-center">
                <div
                  className={cn(
                    "flex h-[68px] w-[68px] items-center justify-center rounded-full text-2xl font-semibold shadow-inner",
                    activeAccount.kind === "work"
                      ? "bg-gradient-to-br from-stone-100 to-stone-50 ring-2 ring-stone-200/80"
                      : cn("bg-mind text-white", "ring-2 ring-stone-200/90")
                  )}
                >
                  {activeAccount.kind === "work" ? (
                    <User className={cn("h-8 w-8", "text-mind")} />
                  ) : (
                    <span className="text-white">{activeAccount.initial}</span>
                  )}
                </div>
                <p className="mt-3 text-[17px] font-semibold text-zinc-900">{activeAccount.displayName}</p>
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
                        : cn("bg-mind text-white")
                    )}
                  >
                    {acc.kind === "work" ? (
                      <User className={cn("h-5 w-5", "text-mind")} />
                    ) : (
                      <span className="text-white">{acc.initial}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-medium text-zinc-900">{acc.displayName}</span>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                          acc.kind === "work" ? cn("bg-mind/8", "text-mind") : "bg-stone-50 text-mind"
                        )}
                      >
                        {accountSpaceLabel(acc.kind)}
                      </span>
                    </div>
                    <div className="truncate text-[13px] text-zinc-500">{acc.email}</div>
                  </div>
                  {acc.kind === "work" ? (
                    <Building2 className={cn("h-5 w-5 shrink-0", "text-mind")} aria-hidden />
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
                  "text-mind",
                  "hover:text-mind/90"
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
                  "text-mind",
                  "hover:text-mind/90"
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

      {/* Share card modal */}
      {showShareCard && (
        <div className="absolute inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowShareCard(false)} />
          
          <div className="absolute inset-x-4 top-20 flex flex-col items-center">
            {/* Card body */}
            <div className="mb-6 w-full max-w-[340px] rounded-3xl bg-white p-6 shadow-xl dark:bg-zinc-900">
              {/* User row */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center">
                  <User className="w-6 h-6 text-zinc-500" />
                </div>
                <span className="text-lg font-semibold text-zinc-900">{activeAccount.displayName}</span>
              </div>

              <h3 className="text-xl font-bold text-zinc-900 mb-6">Notes in the last year</h3>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className={cn("text-sm mb-1", "text-zinc-500")}>All notes</div>
                  <div className="text-4xl font-bold text-zinc-900">{stats.totalNotes}</div>
                </div>
                <div className="text-center">
                  <div className={cn("text-sm mb-1", "text-zinc-500")}>Total days</div>
                  <div className="text-4xl font-bold text-zinc-900">{stats.totalDays}</div>
                </div>
                <div className="text-center">
                  <div className={cn("text-sm mb-1", "text-zinc-500")}>Day streak</div>
                  <div className="text-4xl font-bold text-zinc-900">{stats.consecutiveDays}</div>
                </div>
              </div>

              <div className="mb-6 rounded-xl border border-stone-100/90 bg-stone-50/50 p-3">
                <p className="text-[12px] font-medium text-zinc-600">Capture diary</p>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                  {DEMO_CAPTURE_DIARY.length} days summarized · {stats.consecutiveDays}-day streak
                </p>
                {DEMO_CAPTURE_DIARY[0] ? (
                  <p className="mt-2 truncate text-[11px] font-medium text-zinc-600">
                    Latest: {DEMO_CAPTURE_DIARY[0].title}
                  </p>
                ) : null}
              </div>

              {/* Brand + QR */}
              <div className="flex items-center justify-between pt-4 border-t border-stone-100/85">
                <div>
                  <div className="text-lg font-bold text-zinc-900">Mind Notes</div>
                  <div className="text-xs text-zinc-400">Scan to try Mind Notes</div>
                </div>
                <div className="w-20 h-20 bg-stone-100 rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-5 gap-[2px]">
                    {Array(25).fill(0).map((_, i) => (
                      <div key={i} className={cn(
                        "w-3 h-3",
                        Math.random() > 0.5 ? "bg-zinc-800" : "bg-white"
                      )} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Share actions */}
            <div className="w-full max-w-[340px] rounded-2xl bg-white p-4 dark:bg-zinc-900">
              <div className="grid grid-cols-4 gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => toast.success("Share opened", { description: "WeChat (demo)" })}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-500">
                    <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.5 14.5c0 1.93 1.57 3.5 3.5 3.5 1.93 0 3.5-1.57 3.5-3.5M12 9c-1.93 0-3.5 1.57-3.5 3.5h7c0-1.93-1.57-3.5-3.5-3.5zM3 12a9 9 0 1118 0 9 9 0 01-18 0z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-zinc-600">WeChat</span>
                </button>
                <button
                  type="button"
                  onClick={() => toast.success("Share opened", { description: "Moments (demo)" })}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-600">
                    <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-zinc-600">Moments</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    toast.success("Saved to photos", { description: "Share card saved (demo)." })
                  }
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
                    <svg className="h-6 w-6 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                    </svg>
                  </div>
                  <span className="text-xs text-zinc-600">Save image</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    toast.message("More ways to share", { description: "System share sheet (demo)." })
                  }
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100">
                    <svg className="h-6 w-6 text-zinc-600" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="5" cy="12" r="2"/>
                      <circle cx="12" cy="12" r="2"/>
                      <circle cx="19" cy="12" r="2"/>
                    </svg>
                  </div>
                  <span className="text-xs text-zinc-600">More</span>
                </button>
              </div>
              <button
                onClick={() => setShowShareCard(false)}
                className="w-full py-3 bg-stone-100 rounded-xl text-zinc-600 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
                className={cn("flex-1 rounded-xl py-3 text-[15px] font-semibold text-white", "rounded-lg bg-mind text-white hover:bg-[#4534b3] active:bg-[#3a2a99] shadow-sm shadow-[rgba(86,69,212,0.25)]")}
              >
                Enable offline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings — drill-down */}
      {settingsExtra && (
        <MeSettingsShell
          webLayout={webLayout}
          title={settingsExtraTitle(settingsExtra)}
          onBack={() => {
            setSettingsExtra(null)
            setPrivacyDetail(null)
            setShowStorageSpace(false)
          }}
        >
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
                label="Storage breakdown"
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
              onSetDeviceConnected={setIsDeviceConnected}
              lexiconDraft={lexiconDraft}
              onLexiconDraftChange={setLexiconDraft}
              lexiconTags={lexiconTags}
              onLexiconTagsChange={setLexiconTags}
              offlineOnly={offlineOnly}
              onRequestOfflineEnable={() => setOfflineConfirmOpen(true)}
              onOfflineDisable={() => setOfflineOnly(false)}
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
              <SettingsLinkRow label="Protection guide" onClick={() => setPrivacyDetail("guide")} />
              <SettingsLinkRow label="Privacy settings" onClick={() => setPrivacyDetail("privacySettings")} />
              <SettingsLinkRow label="Data collected" onClick={() => setPrivacyDetail("collected")} />
              <SettingsLinkRow label="Third-party sharing" onClick={() => setPrivacyDetail("thirdParty")} last />
            </SettingsGroup>
          )}

          {settingsExtra === "account" && (
            <SettingsGroup>
              <SettingsLinkRow
                label="Personalization"
                onClick={() => {
                  setSettingsExtra(null)
                  setShowPersonalization(true)
                }}
              />
              <SettingsLinkRow
                label="Cloud sync"
                onClick={() => {
                  setSettingsExtra(null)
                  setShowCloudSync(true)
                }}
              />
              <SettingsLinkRow
                label="Recording & security"
                onClick={() => {
                  setSettingsExtra(null)
                  setShowPreferences(true)
                }}
                last
              />
            </SettingsGroup>
          )}

          {settingsExtra === "help" && (
            <SettingsGroup>
              {[
                "User guide",
                "Contact support",
                "Rate Mind",
              ].map((label, i, arr) => (
                <SettingsLinkRow
                  key={label}
                  label={label}
                  onClick={() => toast.message(label, { description: "Demo." })}
                  last={i === arr.length - 1}
                />
              ))}
            </SettingsGroup>
          )}
        </MeSettingsShell>
      )}

      {/* Recording & security (from Account) */}
      {showPreferences && (
        <MeSettingsShell
          webLayout={webLayout}
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
        </MeSettingsShell>
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
                      cloudSyncEnabled ? "bg-mind" : cn("bg-stone-200 dark:bg-zinc-600")
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
                        wifiOnlySync ? "bg-mind" : cn("bg-stone-200 dark:bg-zinc-600")
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
                      useMemory ? "bg-mind" : cn("bg-stone-200 dark:bg-zinc-600")
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow",
                      useMemory ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>
                <p className="text-xs text-zinc-400">
                  When on, Mind may use saved context for more relevant replies.
                  <span className={cn("underline underline-offset-2 decoration-stone-300", "text-mind hover:text-mind/90")}>
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
          webLayout={webLayout}
          listFirst={activityDiary.listFirst ?? true}
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
        />
      ) : null}

      <MindShareSheet open={shareSheet != null} payload={shareSheet} onClose={() => setShareSheet(null)} />

      {showStorageSpace && <MeStorageSpacePanel onBack={() => setShowStorageSpace(false)} />}
      {privacyDetail === "guide" && <MePrivacyGuideSummaryPanel onBack={() => setPrivacyDetail(null)} />}
      {privacyDetail === "thirdParty" && <MeThirdPartySharingPanel onBack={() => setPrivacyDetail(null)} />}
      {privacyDetail === "collected" && <MeCollectedPersonalInfoPanel onBack={() => setPrivacyDetail(null)} />}
      {privacyDetail === "privacySettings" && (
        <MePrivacySettingsPanel
          onBack={() => setPrivacyDetail(null)}
          crashReportsEnabled={privacyCrashReports}
          onCrashReportsChange={setPrivacyCrashReports}
        />
      )}
    </>
  )

  if (webLayout) {
    return (
      <div className="relative h-full min-h-0">
        <MeTabWebLayout
          profileHero={webProfileHero}
          timelinePanel={webTimelinePanel}
          settingsPanel={webSettingsPanel}
          overlays={accountAndOverlays}
        />
      </div>
    )
  }

  return (
    <div className={cn("relative flex h-full min-h-0 flex-col", "bg-[#fafaf9] dark:bg-zinc-950")}>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-8">{profileHeroBlock}</div>
      {accountAndOverlays}
    </div>
  )
}
