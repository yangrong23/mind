"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { mx, mxHeatmapCell, mxHeatmapCellTiny } from "@/lib/medrix-design-tokens"
import {
  getMindAccount,
  MIND_ACCOUNTS,
  accountSpaceLabel,
  type MindAccountId,
} from "@/lib/mind-accounts"
import { MindDevicesSheet } from "@/components/mind-v2/mind-devices-sheet"
import { MeAiInsights } from "@/components/mind-v2/me-ai-insights"
import {
  DAILY_REVIEW_HEADLINE,
  DAILY_REVIEW_HIGHLIGHTS,
  MeDailyReview,
} from "@/components/mind-v2/me-daily-review"
import { MindShareSheet } from "@/components/mind-v2/mind-share-sheet"
import {
  SettingsGroup,
  SettingsLinkRow,
  SettingsScreenShell,
  SettingsToggleRow,
} from "@/components/mind-v2/me-settings-ui"
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
  Settings,
  ChevronRight,
  Share2,
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
  Sparkles,
  Target,
  Map,
  Calendar,
  Zap,
  Hash,
  MoreHorizontal,
  Trash2,
  Building2,
  ChevronsUpDown,
  LogOut,
  Bluetooth,
  Sun,
  Moon,
  Cpu,
  HardDrive,
} from "lucide-react"

// Heatmap sample data
const generateHeatmapData = () => {
  const data: { date: string; value: number }[] = []
  const today = new Date()
  for (let i = 90; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : 0
    })
  }
  return data
}

const heatmapData = generateHeatmapData()

function getTodayHeatmapEntry() {
  const today = new Date().toISOString().slice(0, 10)
  return heatmapData.find((d) => d.date === today) ?? heatmapData[heatmapData.length - 1]!
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

function ActivityDayShareCard({
  isoDate,
  activity,
  displayName,
  streakDays,
  onShare,
}: {
  isoDate: string
  activity: number
  displayName: string
  streakDays: number
  onShare: () => void
}) {
  const slogan = getDayViralSlogan(isoDate, activity)
  const uploads = getDayUploads(isoDate, activity)
  const weekSlice = heatmapData.slice(-91)
  const dayIndex = weekSlice.findIndex((d) => d.date === isoDate)
  const windowDays =
    dayIndex >= 0 ? weekSlice.slice(Math.max(0, dayIndex - 6), dayIndex + 1) : weekSlice.slice(-7)

  return (
    <button
      type="button"
      onClick={onShare}
      className={cn(
        "group relative w-full overflow-hidden rounded-3xl border border-stone-200 text-left shadow-lg shadow-stone-900/[0.08] transition-transform active:scale-[0.99]",
        mx.brandHero
      )}
    >
      
        <div
          className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-stone-100 blur-2xl"
          aria-hidden
        />
        
          <div
            className="pointer-events-none absolute -bottom-12 -left-6 h-32 w-32 rounded-full bg-stone-50 blur-2xl"
            aria-hidden
          />
        
      

      <div className="relative px-5 pb-5 pt-5">
        
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 ring-1 ring-zinc-200/60">
                <Sparkles className="h-4 w-4 text-mind" strokeWidth={2} aria-hidden />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mind/80">
                Mind timeline
              </span>
            </div>
            <span className="rounded-full bg-white/75 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-mind ring-1 ring-zinc-200/60">
              {streakDays}d streak
            </span>
          </div>
        

        <p className="mt-5 whitespace-pre-line text-[26px] font-bold leading-[1.15] tracking-tight text-zinc-900">
          {slogan}
        </p>

        <p className="mt-3 text-[13px] font-medium text-zinc-600">
          {formatHeatmapDayLabel(isoDate)}
          <span className="text-zinc-400"> · </span>
          {activity > 0
            ? `${uploads.length} capture${uploads.length === 1 ? "" : "s"} · level ${activity}`
            : "Quiet day — still on the board"}
        </p>

        <div className="mt-4 rounded-2xl border border-white/70 bg-white/55 p-3 backdrop-blur-sm">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-zinc-400">This week</p>
          <div className="flex items-end gap-1">
            {windowDays.map((day) => {
              const isSelected = day.date === isoDate
              const h = Math.max(4, (day.value + 1) * 5)
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={cn(
                      "w-full rounded-sm transition-colors",
                      isSelected
                        ? "bg-mind ring-2 ring-zinc-300/50 ring-offset-1"
                        : day.value > 0
                          ? "bg-stone-100"
                          : "bg-stone-200/90"
                    )}
                    style={{ height: h }}
                    aria-hidden
                  />
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-200 pt-4">
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-zinc-900">{displayName}</p>
            <p className="text-[11px] text-zinc-500">Tap to share this card</p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-[10px] font-bold leading-tight text-white">
            Mind
          </div>
        </div>
      </div>
    </button>
  )
}

/** Mock AI-generated personalized copy for full-screen daily review */
const PERSONALIZED_DAILY_REVIEW_LATEST =
  "Today’s recap is tuned to your recent captures: you spent more time on product narrative and customer proof than last week. One pattern stands out—you often end strong on context but leave the decision implicit. Try appending a single “so we will…” line at the end of the next two recordings. Your energy is consistent; keep linking standout quotes to your library so summaries stay grounded."

interface MeTabProps {
  onSettingsClick?: () => void
  activeAccountId: MindAccountId
  onActiveAccountChange: (id: MindAccountId) => void
  /** When provided, Sign out in the account sheet ends the demo session (guest gate). */
  onSessionSignOut?: () => void
  /** Shell text scale (85–130%). Controlled by parent so the device chrome updates live. */
  fontZoomPercent?: number
  onFontZoomPercentChange?: (pct: number) => void
}

export function MeTab({
  onSettingsClick,
  activeAccountId,
  onActiveAccountChange,
  onSessionSignOut,
  fontZoomPercent = 100,
  onFontZoomPercentChange,
}: MeTabProps) {
  const activeAccount = getMindAccount(activeAccountId)
  const [heatmapDayDetail, setHeatmapDayDetail] = useState<{ date: string; value: number } | null>(null)
  const [shareSheet, setShareSheet] = useState<MindSharePayload | null>(null)
  const [personalizedFeed, setPersonalizedFeed] = useState<null | { type: "daily" }>(null)
  const [showAiInsights, setShowAiInsights] = useState(false)
  const [showShareCard, setShowShareCard] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [showSettingsHub, setShowSettingsHub] = useState(false)
  const [showCloudSync, setShowCloudSync] = useState(false)
  const [showPersonalization, setShowPersonalization] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false)
  const [showCreditsPlans, setShowCreditsPlans] = useState(false)
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
  const [showDeviceSheet, setShowDeviceSheet] = useState(false)
  const [isDeviceConnected, setIsDeviceConnected] = useState(true)
  const [settingsExtra, setSettingsExtra] = useState<
    null | "display" | "notifications" | "storage" | "features" | "privacy" | "account" | "help"
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
    creditsRemaining: 1240,
    creditsMonthlyAllowance: 2000,
  }

  const creditPlans = [
    {
      id: "lite",
      name: "Lite refill",
      credits: 500,
      price: "$4.99",
      blurb: "Top up for light AI use",
      highlight: false,
    },
    {
      id: "standard",
      name: "Standard",
      credits: 2500,
      price: "$19.99",
      blurb: "Best for daily capture & summaries",
      highlight: true,
    },
    {
      id: "pro",
      name: "Pro pack",
      credits: 12000,
      price: "$79.99",
      blurb: "Teams and heavy workflows",
      highlight: false,
    },
  ] as const

  const appearanceLabel =
    !themeHubMounted || !themeForHub.resolvedTheme
      ? "…"
      : themeForHub.resolvedTheme === "dark"
        ? "Dark"
        : "Light"
  const notifStatusLabel = notifCaptureReady || notifDigest ? "On" : "Off"

  return (
    <div className={cn("relative flex h-full min-h-0 flex-col", mx.pageBg)}>
      {/* Single scroll: profile hero (flex min-h-0 fixes clipped bottom scroll) */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-8">
      {/* Profile — one calm header, no duplicate metrics below */}
      <div className={cn("px-5 pt-4 pb-4", mx.brandHero)}>
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowAccountSwitcher(true)}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-3 rounded-xl py-0.5 pl-0.5 pr-2 text-left transition-colors focus:outline-none",
              mx.brandHeroHover,
              mx.brandFocusRing
            )}
            aria-label="Switch account"
          >
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold",
                activeAccount.kind === "work"
                  ? "bg-gradient-to-br from-stone-100 to-stone-50 ring-1 ring-stone-200/70"
                  : cn(mx.accentPersonalAvatar, mx.accentPersonalRing)
              )}
            >
              {activeAccount.kind === "work" ? (
                <User className={cn("h-6 w-6", mx.accentWorkIcon)} />
              ) : (
                <span className="text-white">{activeAccount.initial}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h2 className={cn("text-[17px] font-semibold leading-tight tracking-tight", mx.brandOnHero)}>
                  {activeAccount.displayName}
                </h2>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    activeAccount.kind === "work"
                      ? cn(mx.accentWorkSoft, "text-mind")
                      : cn(mx.accentPersonalSoft, "text-mind")
                  )}
                >
                  {accountSpaceLabel(activeAccount.kind)}
                </span>
              </div>
              <p className={cn("mt-0.5 truncate text-[13px]", mx.brandOnHeroMuted)}>{activeAccount.email}</p>
              <p className={cn("mt-0.5 text-[12px]", mx.brandOnHeroMuted)}>
                {stats.totalDays} days ·{" "}
                <span className={cn("font-medium", mx.brandAccentOnHero)}>
                  {stats.creditsRemaining.toLocaleString("en-US")} credits
                </span>
              </p>
            </div>
            <ChevronsUpDown className={cn("h-4 w-4 shrink-0 opacity-50", mx.brandOnHeroMuted)} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => {
              setShowSettingsHub(true)
              onSettingsClick?.()
            }}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
              mx.settingsOnHero
            )}
            aria-label="Settings"
          >
            <Settings className={cn("h-5 w-5", mx.brandOnHero)} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-stone-200 pt-3">
          {[
            { value: stats.totalNotes, label: "Notes" },
            { value: stats.consecutiveDays, label: "Streak" },
            { value: `${stats.totalHours}h`, label: "Captured" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className={cn("text-lg font-semibold tabular-nums leading-none", mx.brandOnHero)}>{s.value}</div>
              <div className={cn("mt-1 text-[11px]", mx.brandOnHeroMuted)}>{s.label}</div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowCreditsPlans(true)}
          className={cn(
            "mt-3 w-full rounded-xl border border-stone-200 bg-white/60 py-2 text-[13px] font-medium text-mind shadow-sm shadow-stone-900/5 backdrop-blur-sm transition-colors hover:bg-white/90",
            mx.brandFocusRing
          )}
        >
          {stats.creditsRemaining.toLocaleString("en-US")} credits · Plans & refill
        </button>

        <div className="mt-3 space-y-3 rounded-xl border border-stone-200 bg-white/55 p-3 shadow-sm shadow-stone-900/5 backdrop-blur-sm">
          <div>
            <div className="flex items-start justify-between gap-2">
              <p className={cn("text-[12px] font-semibold", mx.brandOnHero)}>Activity</p>
              <p className={cn("max-w-[10rem] text-right text-[10px] leading-snug", mx.brandOnHeroMuted)}>
                Last ~13 weeks · tap a square
              </p>
            </div>
            <div className="mt-2">
              <div className="grid grid-cols-13 gap-px sm:gap-0.5">
                {heatmapData.slice(-91).map((day, i) => (
                  <button
                    key={`hero-${day.date}-${i}`}
                    type="button"
                    onClick={() => setHeatmapDayDetail({ date: day.date, value: day.value })}
                    title={formatHeatmapDayLabel(day.date)}
                    className={mxHeatmapCell(day.value)}
                  />
                ))}
              </div>
              <div className={cn("mt-1 flex justify-between text-[10px]", mx.brandOnHeroMuted)}>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
              </div>
            </div>
          </div>

          <div className="space-y-0 border-t border-stone-200 pt-2">
            <button
              type="button"
              onClick={() => setPersonalizedFeed({ type: "daily" })}
              className="flex w-full items-center gap-2 rounded-lg py-2.5 pl-0.5 pr-1 text-left transition-colors hover:bg-white/70 active:bg-white/90"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-mind opacity-90" />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-zinc-800">Daily review</span>
                <span className="mt-0.5 block line-clamp-1 text-[11px] font-normal text-zinc-400">
                  Today&apos;s recap · tap to read
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" />
            </button>
            <button
              type="button"
              onClick={() => setShowAiInsights(true)}
              className="flex w-full items-center gap-2 rounded-lg py-2.5 pl-0.5 pr-1 text-left transition-colors hover:bg-white/70 active:bg-white/90"
            >
              <Target className="h-4 w-4 shrink-0 text-mind opacity-90" />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-zinc-800">AI insights</span>
                <span className="mt-0.5 block line-clamp-1 text-[11px] font-normal text-zinc-400">
                  Perspectives on notes & libraries
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" />
            </button>
            <button
              type="button"
              onClick={() =>
                toast.message("Knowledge map", { description: "This feature is coming soon." })
              }
              className="flex w-full items-center gap-2 rounded-lg py-2 text-left text-[13px] font-medium text-zinc-800 hover:bg-white/70"
            >
              <Map className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
              <span>Knowledge map</span>
              <span className="ml-auto text-[10px] font-medium text-zinc-400">Soon</span>
            </button>
            <button
              type="button"
              onClick={() => setShowDeviceSheet(true)}
              className="flex w-full items-center gap-2 rounded-lg py-2 text-left text-[13px] font-medium text-zinc-800 hover:bg-white/70"
            >
              <Bluetooth className="h-4 w-4 shrink-0 text-mind opacity-90" aria-hidden />
              <span>Devices</span>
              <span className="min-w-0 flex-1 truncate text-right text-[11px] font-normal text-zinc-500">
                Recorder, pairing, lexicon, offline
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
            </button>
          </div>
        </div>
      </div>
      </div>

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
                      : cn(mx.accentPersonalAvatar, "ring-2 ring-stone-200/90")
                  )}
                >
                  {activeAccount.kind === "work" ? (
                    <User className={cn("h-8 w-8", mx.accentWorkIcon)} />
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
                      <span className="text-[15px] font-medium text-zinc-900">{acc.displayName}</span>
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                          acc.kind === "work" ? cn(mx.accentWorkSoft, "text-mind") : "bg-stone-50 text-mind"
                        )}
                      >
                        {accountSpaceLabel(acc.kind)}
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
                  <div className={cn("text-sm mb-1", mx.citationMuted)}>All notes</div>
                  <div className="text-4xl font-bold text-zinc-900">{stats.totalNotes}</div>
                </div>
                <div className="text-center">
                  <div className={cn("text-sm mb-1", mx.citationMuted)}>Total days</div>
                  <div className="text-4xl font-bold text-zinc-900">{stats.totalDays}</div>
                </div>
                <div className="text-center">
                  <div className={cn("text-sm mb-1", mx.citationMuted)}>Day streak</div>
                  <div className="text-4xl font-bold text-zinc-900">{stats.consecutiveDays}</div>
                </div>
              </div>

              {/* Heatmap */}
              <div className="mb-6">
                <div className="text-sm text-zinc-400 mb-1">Last 12 months activity</div>
                <p className="text-[10px] text-zinc-400 mb-2">Tap a square for that day</p>
                <div className="grid grid-cols-26 gap-[2px]">
                  {heatmapData.slice(-52).map((day, i) => (
                    <button
                      key={`sh-${day.date}-${i}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setHeatmapDayDetail({ date: day.date, value: day.value })
                      }}
                      title={formatHeatmapDayLabel(day.date)}
                      className={cn("w-2 h-2", mxHeatmapCellTiny(day.value))}
                    />
                  ))}
                </div>
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
                className={cn("flex-1 rounded-xl py-3 text-[15px] font-semibold text-white", mx.brandCta)}
              >
                Enable offline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings hub — level 1 */}
      {showSettingsHub && (
        <SettingsScreenShell
          zClass="z-50"
          title="Settings"
          onBack={() => {
            setShowSettingsHub(false)
            setPrivacyDetail(null)
            setShowStorageSpace(false)
          }}
        >
          <SettingsGroup>
            <SettingsLinkRow
              label="Display"
              value={`${appearanceLabel} · ${fontZoomPercent}%`}
              onClick={() => {
                setShowSettingsHub(false)
                setSettingsExtra("display")
              }}
            />
            <SettingsLinkRow
              label="Notifications"
              value={notifStatusLabel}
              onClick={() => {
                setShowSettingsHub(false)
                setSettingsExtra("notifications")
              }}
            />
            <SettingsLinkRow
              label="Storage"
              value="11.2 MB"
              onClick={() => {
                setShowSettingsHub(false)
                setSettingsExtra("storage")
              }}
            />
            <SettingsLinkRow
              label="AI"
              value={frontierInsights ? "Frontier on" : "Standard"}
              onClick={() => {
                setShowSettingsHub(false)
                setSettingsExtra("features")
              }}
            />
            <SettingsLinkRow
              label="Privacy"
              onClick={() => {
                setShowSettingsHub(false)
                setSettingsExtra("privacy")
              }}
            />
            <SettingsLinkRow
              label="Account"
              onClick={() => {
                setShowSettingsHub(false)
                setSettingsExtra("account")
              }}
            />
            <SettingsLinkRow
              label="Help"
              onClick={() => {
                setShowSettingsHub(false)
                setSettingsExtra("help")
              }}
              last
            />
          </SettingsGroup>
        </SettingsScreenShell>
      )}

      {/* Settings — level 2 */}
      {settingsExtra && (
        <SettingsScreenShell
          title={
            settingsExtra === "display"
              ? "Display"
              : settingsExtra === "notifications"
                ? "Notifications"
                : settingsExtra === "storage"
                  ? "Storage"
                  : settingsExtra === "features"
                    ? "AI"
                    : settingsExtra === "privacy"
                      ? "Privacy"
                      : settingsExtra === "account"
                        ? "Account"
                        : "Help"
          }
          onBack={() => {
            setSettingsExtra(null)
            setShowSettingsHub(true)
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
                label="Devices"
                onClick={() => {
                  setSettingsExtra(null)
                  setShowDeviceSheet(true)
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
        </SettingsScreenShell>
      )}

      {/* Recording & security (from Account) */}
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
                  When on, Mind may use saved context for more relevant replies.
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
          creditPlans={creditPlans}
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

      {personalizedFeed?.type === "daily" && (
        <MeDailyReview
          displayName={activeAccount.displayName}
          body={PERSONALIZED_DAILY_REVIEW_LATEST}
          headline={DAILY_REVIEW_HEADLINE}
          highlights={DAILY_REVIEW_HIGHLIGHTS}
          streakDays={stats.consecutiveDays}
          captureCountToday={Math.min(getTodayHeatmapEntry().value + 1, 5)}
          onClose={() => setPersonalizedFeed(null)}
          onShare={setShareSheet}
          onOpenTodayActivity={() => {
            const day = getTodayHeatmapEntry()
            setPersonalizedFeed(null)
            setHeatmapDayDetail({ date: day.date, value: day.value })
          }}
        />
      )}

      {showAiInsights && (
        <MeAiInsights
          displayName={activeAccount.displayName}
          onClose={() => setShowAiInsights(false)}
          noteCount={stats.totalNotes}
          libraryItemCount={stats.knowledgeItems}
          tagCount={12}
          dayCount={stats.totalDays}
          onShare={setShareSheet}
        />
      )}

      {heatmapDayDetail &&
        (() => {
          const d = heatmapDayDetail
          const uploads = getDayUploads(d.date, d.value)
          const title = formatHeatmapDayLabel(d.date)
          const sharePreview = buildDayShareCardText(
            d.date,
            d.value,
            activeAccount.displayName,
            stats.consecutiveDays
          )
          const captures = getDayUploads(d.date, d.value).length
          const activityLine =
            d.value > 0
              ? `${captures} capture${captures === 1 ? "" : "s"} · level ${d.value}`
              : "A quiet day on my timeline"
          const openDayShare = () =>
            setShareSheet(
              buildTimelineSharePayload({
                displayName: activeAccount.displayName,
                dateLabel: title,
                slogan: getDayViralSlogan(d.date, d.value),
                activityLine,
                streakDays: stats.consecutiveDays,
                body: sharePreview,
              })
            )
          return (
            <div className="absolute inset-0 z-[60] flex flex-col bg-white dark:bg-zinc-950 dark:bg-zinc-950 animate-in fade-in duration-150">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-100/85 bg-white dark:border-zinc-800 dark:bg-zinc-900 shrink-0">
                <button type="button" onClick={() => setHeatmapDayDetail(null)} className="p-1 rounded-full hover:bg-stone-100">
                  <ChevronRight className="w-6 h-6 text-zinc-600 rotate-180" />
                </button>
                
                  <div className="flex-1 min-w-0 text-center">
                    <h1 className="text-lg font-semibold text-zinc-900 truncate">{title}</h1>
                    <p className="text-xs text-zinc-500">
                      Activity {d.value === 0 ? "none" : `level ${d.value}`}
                    </p>
                  </div>
                  <div className="w-8 shrink-0" aria-hidden />
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 pb-8 space-y-4">
                <ActivityDayShareCard
                  isoDate={d.date}
                  activity={d.value}
                  displayName={activeAccount.displayName}
                  streakDays={stats.consecutiveDays}
                  onShare={openDayShare}
                />

                <div className="bg-white rounded-2xl border border-stone-100/85 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-stone-100/85 bg-white dark:bg-zinc-950/80">
                    <span className="text-xs font-medium text-zinc-600">This day · AI summary</span>
                  </div>
                  <div className="p-4 space-y-4">
                    <p className="text-[15px] text-zinc-900 leading-relaxed font-medium">
                      {getDayLeadLine(d.date, d.value)}
                    </p>
                    <p className="text-[15px] text-zinc-700 leading-relaxed">
                      {getDailyReviewForDay(d.date, d.value)}
                    </p>
                    {uploads.length > 0 && (
                      <div className="pt-2 border-t border-stone-100/85">
                        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-3">
                          Recorded
                        </p>
                        <ul className="space-y-2">
                          {uploads.map((item) => (
                            <li key={item.id}>
                              <button
                                type="button"
                                onClick={() =>
                                  toast.message("Open recording", {
                                    description: `${item.title} · ${item.time}`,
                                  })
                                }
                                className="flex w-full gap-3 rounded-xl bg-white dark:bg-zinc-950 p-3 text-left transition-colors hover:bg-stone-100/80"
                              >
                                <div
                                  className={cn(
                                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                                    mx.citationSubtleBg
                                  )}
                                >
                                  <Mic className="w-4 h-4 text-zinc-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-zinc-900 text-sm">{item.title}</div>
                                  <div className="text-xs text-zinc-500 mt-0.5">
                                    {item.time} · {item.source}
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-zinc-300 shrink-0 self-center" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

      <MindDevicesSheet
        open={showDeviceSheet}
        onClose={() => setShowDeviceSheet(false)}
        isDeviceConnected={isDeviceConnected}
        onSetDeviceConnected={setIsDeviceConnected}
        zOverlayClass="z-[60]"
      >
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">On this device</p>
          <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm shadow-stone-900/[0.03] divide-y divide-stone-100">
            <div className="flex items-center gap-3 px-4 py-3">
              <div
                className="relative h-[52px] w-11 shrink-0 rounded-xl bg-gradient-to-b from-stone-100 to-stone-300/90 ring-1 ring-stone-200/80"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-zinc-900">Medrix Mind</p>
                <p className="mt-0.5 text-[13px] text-zinc-500">
                  <span className="font-medium text-zinc-600">78%</span>
                  <span className="text-zinc-400"> · </span>
                  ~42h storage
                </p>
              </div>
            </div>

            <div className="px-4 py-3">
              <p className="text-[14px] font-medium text-zinc-900">Lexicon</p>
              <textarea
                value={lexiconDraft}
                onChange={(e) => setLexiconDraft(e.target.value)}
                onBlur={() => {
                  const raw = lexiconDraft.trim()
                  if (!raw) return
                  const parts = raw.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)
                  if (parts.length) {
                    setLexiconTags((prev) => Array.from(new Set([...prev, ...parts])).slice(0, 24))
                    setLexiconDraft("")
                  }
                }}
                placeholder="Add terms (comma or new line) to bias transcription and search"
                rows={2}
                className="mt-2 w-full resize-none rounded-lg border border-stone-200/90 bg-stone-50/50 px-3 py-2 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400/80 focus:outline-none focus:ring-1 focus:ring-zinc-400/20"
              />
              {lexiconTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {lexiconTags.map((tag) => (
                    <span key={tag} className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] text-zinc-600">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-zinc-900">Offline-only processing</p>
                <p className="mt-0.5 text-[12px] leading-snug text-zinc-500">
                  Fully offline: cloud Claw and advanced skills are unavailable
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={offlineOnly}
                onClick={() => {
                  if (!offlineOnly) setOfflineConfirmOpen(true)
                  else setOfflineOnly(false)
                }}
                className={cn(
                  "relative h-7 w-[44px] shrink-0 rounded-full p-0.5 transition-colors",
                  offlineOnly ? "bg-mind" : "bg-stone-200"
                )}
              >
                <span
                  className={cn(
                    "block h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
                    offlineOnly ? "translate-x-[18px]" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      </MindDevicesSheet>

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
    </div>
  )
}
