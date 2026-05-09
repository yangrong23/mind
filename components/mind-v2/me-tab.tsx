"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { mx, mxHeatmapCell, mxHeatmapCellTiny } from "@/lib/medrix-design-tokens"
import { SocialShareRow } from "@/components/mind-v2/social-share-row"
import { 
  Settings, ChevronRight, Share2, User, Bell,
  HelpCircle, Shield, Palette, Globe, Smartphone,
  Award, TrendingUp, Clock, Mic, Brain, Bot,
  Cloud, Sparkles, Target, Map, Calendar,
  Zap, Hash, MoreHorizontal, Trash2, Coins
} from "lucide-react"

// 生成热力图数据
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

/** Mock AI-generated personalized copy for full-screen daily review */
const PERSONALIZED_DAILY_REVIEW_LATEST =
  "Today’s recap is tuned to your recent captures: you spent more time on product narrative and customer proof than last week. One pattern stands out—you often end strong on context but leave the decision implicit. Try appending a single “so we will…” line at the end of the next two recordings. Your energy is consistent; keep linking standout quotes to your library so summaries stay grounded."

/** Mock AI-generated personalized insights */
const PERSONALIZED_AI_INSIGHTS_LATEST =
  "Your note velocity is slightly up versus your 4-week average. Tags #product and #customer appear together often—good signal for a dedicated knowledge base. A gap: fewer explicit follow-ups after meetings; 30% of sessions lack a captured next step. Recommendation: enable speaker labels for one week and add a “close the loop” prompt in daily review. This insight is generated from your usage and content—share it if you want feedback from your team."

interface MeTabProps {
  onSettingsClick?: () => void
}

export function MeTab({ onSettingsClick }: MeTabProps) {
  const [heatmapDayDetail, setHeatmapDayDetail] = useState<{ date: string; value: number } | null>(null)
  const [insightShareSheet, setInsightShareSheet] = useState<{ title: string; preview: string } | null>(null)
  const [personalizedFeed, setPersonalizedFeed] = useState<null | { type: "daily" | "insights" }>(null)
  const [showShareCard, setShowShareCard] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [showSettingsHub, setShowSettingsHub] = useState(false)
  const [showCloudSync, setShowCloudSync] = useState(false)
  const [showPersonalization, setShowPersonalization] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showCreditsPlans, setShowCreditsPlans] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false)
  const [wifiOnlySync, setWifiOnlySync] = useState(false)
  const [useMemory, setUseMemory] = useState(false)
  const [transcribeLang, setTranscribeLang] = useState("Not set")
  const [autoSpeaker, setAutoSpeaker] = useState(false)
  const [customTerms, setCustomTerms] = useState(false)
  const [appLock, setAppLock] = useState(false)
  const [helpImprove, setHelpImprove] = useState(true)
  const [lexiconDraft, setLexiconDraft] = useState("")
  const [lexiconTags, setLexiconTags] = useState<string[]>(["CRISPR", "single-cell", "ATAC-seq", "spatial transcriptomics"])
  const [offlineOnly, setOfflineOnly] = useState(false)
  const [offlineConfirmOpen, setOfflineConfirmOpen] = useState(false)

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

  const settingsMenuItems = [
    { icon: User, label: "Personalization", desc: "Preferences and custom instructions", action: () => { setShowSettingsHub(false); setShowPersonalization(true) } },
    { icon: Cloud, label: "Cloud sync", desc: "Private cloud backup and storage", action: () => { setShowSettingsHub(false); setShowCloudSync(true) } },
    { icon: Bell, label: "Notifications", desc: "Push and reminders", action: () => setShowSettingsHub(false) },
    { icon: Smartphone, label: "Devices", desc: "Mind Recorder", action: () => setShowSettingsHub(false) },
    { icon: Shield, label: "Privacy & security", desc: "Data protection", action: () => setShowSettingsHub(false) },
    { icon: HelpCircle, label: "Help & feedback", desc: "Guides and support", action: () => setShowSettingsHub(false) },
  ]

  return (
    <div className={cn("flex flex-col h-full", mx.pageBg)}>
      {/* Profile hero — light wash + saturated teal accents */}
      <div className={cn("px-5 pt-6 pb-8", mx.brandHero, mx.brandHeroBorder)}>
        <div className="flex items-center justify-between mb-6 gap-2">
          <button
            type="button"
            onClick={() => setShowCreditsPlans(true)}
            className={cn(
              "flex items-center gap-3 min-w-0 flex-1 text-left rounded-2xl py-1 pr-2 -ml-1 pl-1 transition-colors focus:outline-none",
              mx.brandHeroHover,
              mx.brandFocusRing
            )}
            aria-label="Credits and plans"
          >
            <div className={cn("w-14 h-14 rounded-full flex items-center justify-center shrink-0", mx.brandAvatarBg)}>
              <User className={cn("w-7 h-7", mx.brandOnHero)} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className={cn("text-lg font-semibold", mx.brandOnHero)}>Mind user</h2>
              <p className={cn("text-sm", mx.brandOnHeroMuted)}>{stats.totalDays} days on Mind</p>
              <div className={cn("mt-2 flex items-center gap-1.5 text-sm font-medium", mx.brandAccentOnHero)}>
                <Coins className="w-4 h-4 shrink-0 opacity-90" aria-hidden />
                <span className="truncate">
                  {stats.creditsRemaining.toLocaleString("en-US")} credits left
                </span>
                <ChevronRight className="w-4 h-4 shrink-0 opacity-80" aria-hidden />
              </div>
            </div>
          </button>
          <button 
            type="button"
            onClick={() => {
              setShowSettingsHub(true)
              onSettingsClick?.()
            }}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0",
              mx.settingsOnHero
            )}
            aria-label="Settings"
          >
            <Settings className={cn("w-5 h-5", mx.brandOnHero)} />
          </button>
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className={cn("text-2xl font-bold tabular-nums", mx.brandOnHero)}>{stats.totalNotes}</div>
            <div className={cn("text-xs", mx.brandOnHeroMuted)}>All notes</div>
          </div>
          <div className="text-center">
            <div className={cn("text-2xl font-bold tabular-nums", mx.brandOnHero)}>{stats.consecutiveDays}</div>
            <div className={cn("text-xs", mx.brandOnHeroMuted)}>Day streak</div>
          </div>
          <div className="text-center">
            <div className={cn("text-2xl font-bold tabular-nums", mx.brandOnHero)}>{stats.totalHours}h</div>
            <div className={cn("text-xs", mx.brandOnHeroMuted)}>Total time</div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="flex-1 overflow-y-auto -mt-3">
        {/* Device twin · lexicon · offline */}
        <div className="mx-5 mb-4 mt-1 space-y-3">
          <section className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Device twin
            </p>
            <div className="flex gap-4">
              <div
                className="relative h-28 w-24 shrink-0 rounded-2xl bg-gradient-to-br from-zinc-100 via-zinc-200 to-zinc-400 shadow-inner ring-1 ring-zinc-300/60"
                aria-hidden
              >
                <div className="absolute inset-2 rounded-lg bg-zinc-900/5" />
                <div className="absolute bottom-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-zinc-500/25" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="text-[15px] font-semibold tracking-tight text-zinc-900">Medrix Mind</h3>
                <p className="text-[24px] font-semibold tabular-nums leading-none text-teal-600">78%</p>
                <p className="text-[12px] text-zinc-500">Battery · about 42h of storage at current quality</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Lexicon
            </p>
            <p className="mb-2 text-[12px] leading-relaxed text-zinc-500">
              Paste CSV or free text—terms bias transcription, search, and summaries.
            </p>
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
              placeholder="e.g. optogenetics, Ca²⁺ imaging (comma or newline separated)"
              rows={3}
              className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50/40 px-3 py-2.5 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400/25"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {lexiconTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-zinc-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-orange-200/90 bg-gradient-to-b from-orange-50/90 to-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-zinc-900">全离线处理模式</p>
                <p className="mt-1 text-[12px] leading-relaxed text-zinc-600">
                  Process captures only on device. Cloud Claw skills and advanced routing are disabled.
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
                  "relative h-8 w-[46px] shrink-0 rounded-full p-0.5 transition-colors",
                  offlineOnly ? "bg-orange-600" : "bg-stone-300"
                )}
              >
                <span
                  className={cn(
                    "block h-7 w-7 rounded-full bg-white shadow transition-transform",
                    offlineOnly ? "translate-x-[18px]" : "translate-x-0"
                  )}
                />
              </button>
            </div>
          </section>
        </div>

        {/* 个人洞察卡片 */}
        <div className="mx-5 bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 w-[calc(100%-40px)] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowInsights(true)}
            className="w-full text-left p-4 pb-2 hover:bg-gray-50/80 transition-colors"
          >
            <div className="grid grid-cols-3 gap-4 mb-1">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{stats.totalNotes}</div>
                <div className="text-xs text-gray-500">Notes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">12</div>
                <div className="text-xs text-gray-500">Tags</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{stats.totalDays}</div>
                <div className="text-xs text-gray-500">Days</div>
              </div>
            </div>
          </button>

          <div className="px-4 pb-3">
            <p className="text-[10px] text-gray-400 mb-2">Tap a day to see that day&apos;s details</p>
            <div className="grid grid-cols-13 gap-[3px]">
              {heatmapData.slice(-91).map((day, i) => (
                <button
                  key={`${day.date}-${i}`}
                  type="button"
                  onClick={() => setHeatmapDayDetail({ date: day.date, value: day.value })}
                  title={formatHeatmapDayLabel(day.date)}
                  className={mxHeatmapCell(day.value)}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px] text-gray-400">
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowInsights(true)}
            className="w-full text-left p-4 pt-0 hover:bg-gray-50/80 transition-colors"
          >
            <div className={cn("flex items-center gap-3 py-2 px-3 rounded-xl", mx.libraryCta)}>
              <div className="w-6 h-6 flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <span className="font-medium">All notes</span>
              <ChevronRight className="w-4 h-4 ml-auto opacity-80" />
            </div>
          </button>
        </div>

        {/* 功能入口列表 */}
        <div className="mx-5 space-y-2 mb-4">
          <button
            type="button"
            onClick={() => setPersonalizedFeed({ type: "daily" })}
            className="w-full flex items-center gap-3 py-3 text-left"
          >
            <Sparkles className={cn("w-5 h-5", mx.navIconLibrary)} />
            <span className="text-[15px] text-gray-700">Daily review</span>
            <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
          </button>
          <button
            type="button"
            onClick={() => setPersonalizedFeed({ type: "insights" })}
            className="w-full flex items-center gap-3 py-3 text-left"
          >
            <Target className={cn("w-5 h-5", mx.navIconInsight)} />
            <span className="text-[15px] text-gray-700">AI insights</span>
            <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
          </button>
          <button className="w-full flex items-center gap-3 py-3 text-left">
            <Map className={cn("w-5 h-5", mx.navIconNotes)} />
            <span className="text-[15px] text-gray-700">Knowledge map</span>
          </button>
        </div>
      </div>

      {/* 分享卡片弹窗 */}
      {showShareCard && (
        <div className="absolute inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowShareCard(false)} />
          
          <div className="absolute inset-x-4 top-20 flex flex-col items-center">
            {/* 卡片内容 */}
            <div className="w-full max-w-[340px] bg-white rounded-3xl p-6 shadow-xl mb-6">
              {/* 用户信息 */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
                <span className="text-lg font-semibold text-gray-900">Mind user</span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-6">Notes in the last year</h3>

              {/* 统计数据 */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className={cn("text-sm mb-1", mx.citationMuted)}>All notes</div>
                  <div className="text-4xl font-bold text-gray-900">{stats.totalNotes}</div>
                </div>
                <div className="text-center">
                  <div className={cn("text-sm mb-1", mx.citationMuted)}>Total days</div>
                  <div className="text-4xl font-bold text-gray-900">{stats.totalDays}</div>
                </div>
                <div className="text-center">
                  <div className={cn("text-sm mb-1", mx.citationMuted)}>Day streak</div>
                  <div className="text-4xl font-bold text-gray-900">{stats.consecutiveDays}</div>
                </div>
              </div>

              {/* 热力图 */}
              <div className="mb-6">
                <div className="text-sm text-gray-400 mb-1">Last 12 months activity</div>
                <p className="text-[10px] text-gray-400 mb-2">Tap a square for that day</p>
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

              {/* 品牌和二维码 */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <div className="text-lg font-bold text-gray-900">Mind Notes</div>
                  <div className="text-xs text-gray-400">Scan to try Mind Notes</div>
                </div>
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-5 gap-[2px]">
                    {Array(25).fill(0).map((_, i) => (
                      <div key={i} className={cn(
                        "w-3 h-3",
                        Math.random() > 0.5 ? "bg-gray-800" : "bg-white"
                      )} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 分享选项 */}
            <div className="w-full max-w-[340px] bg-white rounded-2xl p-4">
              <div className="grid grid-cols-4 gap-4 mb-4">
                <button className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.5 14.5c0 1.93 1.57 3.5 3.5 3.5 1.93 0 3.5-1.57 3.5-3.5M12 9c-1.93 0-3.5 1.57-3.5 3.5h7c0-1.93-1.57-3.5-3.5-3.5zM3 12a9 9 0 1118 0 9 9 0 01-18 0z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">WeChat</span>
                </button>
                <button className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16z"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">Moments</span>
                </button>
                <button className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">Save image</span>
                </button>
                <button className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="5" cy="12" r="2"/>
                      <circle cx="12" cy="12" r="2"/>
                      <circle cx="19" cy="12" r="2"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">More</span>
                </button>
              </div>
              <button
                onClick={() => setShowShareCard(false)}
                className="w-full py-3 bg-gray-100 rounded-xl text-gray-600 font-medium"
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
            className="relative z-[61] w-full max-w-[320px] rounded-2xl border border-orange-200/90 bg-white p-5 shadow-xl"
          >
            <h2 id="offline-title" className="text-[17px] font-semibold text-zinc-900">
              Enable full offline mode?
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-zinc-600">
              开启后处理完全在本地完成。云端高级 Claw 技能（联网检索、Notion 同步、长链路工具调用等）将不可用，体验会明显降级。确定继续吗？
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
                className="flex-1 rounded-xl bg-orange-600 py-3 text-[15px] font-semibold text-white"
              >
                Enable offline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 设置聚合页（原「会员套餐」以下各项） */}
      {showSettingsHub && (
        <div className="absolute inset-0 z-50 bg-gray-50 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
            <button type="button" onClick={() => setShowSettingsHub(false)} className="p-1">
              <ChevronRight className="w-6 h-6 text-gray-600 rotate-180" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
            <div className="w-8" />
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {settingsMenuItems.map((item, i) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors",
                    i !== settingsMenuItems.length - 1 && "border-b border-gray-100"
                  )}
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 偏好设置页面 */}
      {showPreferences && (
        <div className="absolute inset-0 z-50 bg-gray-50 flex flex-col animate-in slide-in-from-right duration-200">
          {/* 顶部导航 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
            <button onClick={() => setShowPreferences(false)} className="p-1">
              <ChevronRight className="w-6 h-6 text-gray-600 rotate-180" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Preferences</h1>
            <div className="w-8" />
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* 转写 & 总结 */}
            <div className="px-5 pt-6 pb-2">
              <div className="text-sm text-gray-400 mb-2">Transcription & summary</div>
            </div>
            <div className="mx-5 bg-white rounded-xl border border-gray-100 overflow-hidden">
              <button className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-100">
                <div>
                  <div className="text-[15px] text-gray-900 text-left">Transcription language</div>
                  <div className="text-xs text-gray-400 mt-1 text-left">Default language for overview, transcription, and summaries. You can override per recording.</div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-4">
                  <span className="text-[15px] text-gray-400">{transcribeLang}</span>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              </button>
              <button className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-100">
                <span className="text-[15px] text-gray-900">Auto speaker labels</span>
                <div className="flex items-center gap-1">
                  <span className="text-[15px] text-gray-400">{autoSpeaker ? "On" : "Off"}</span>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              </button>
              <button className="w-full flex items-center justify-between px-4 py-4">
                <span className="text-[15px] text-gray-900">Custom vocabulary</span>
                <div className="flex items-center gap-1">
                  <span className="text-[15px] text-gray-400">{customTerms ? "On" : "Off"}</span>
                  {!customTerms && <div className={cn("w-2 h-2 rounded-full shrink-0", mx.warningDot)} />}
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              </button>
            </div>

            {/* 通知 */}
            <div className="px-5 pt-6 pb-2">
              <div className="text-sm text-gray-400 mb-2">Notifications</div>
            </div>
            <div className="mx-5 bg-white rounded-xl border border-gray-100 overflow-hidden">
              <button className="w-full flex items-center justify-between px-4 py-4">
                <span className="text-[15px] text-gray-900">Messages & alerts</span>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            </div>

            {/* 安全 */}
            <div className="px-5 pt-6 pb-2">
              <div className="text-sm text-gray-400 mb-2">Security</div>
            </div>
            <div className="mx-5 bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
              <button className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-100">
                <div>
                  <div className="text-[15px] text-gray-900 text-left">App lock</div>
                  <div className="text-xs text-gray-400 mt-1 text-left">Unlock with Face ID, Touch ID, or device passcode</div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-4">
                  <span className="text-[15px] text-gray-400">{appLock ? "On" : "Off"}</span>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </div>
              </button>
              <div className="w-full flex items-center justify-between px-4 py-4">
                <div className="flex-1">
                  <div className="text-[15px] text-gray-900 text-left">Help improve AI</div>
                  <div className="text-xs text-gray-400 mt-1 text-left">
                    Share limited diagnostics to improve transcription and summaries while protecting privacy.
                    <span className={cn("underline underline-offset-2 decoration-slate-300", mx.citationLink)}>
                      Learn more
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setHelpImprove(!helpImprove)}
                  className={cn(
                    "w-12 h-7 rounded-full transition-colors shrink-0 ml-4 relative",
                    helpImprove ? "bg-teal-500" : "bg-gray-200"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow",
                    helpImprove ? "right-1" : "left-1"
                  )} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 私有云同步页面 */}
      {showCloudSync && (
        <div className="absolute inset-0 z-50 bg-gray-50 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="flex items-center px-4 py-3 bg-white border-b border-gray-100">
            <button onClick={() => setShowCloudSync(false)} className="p-1">
              <ChevronRight className="w-6 h-6 text-gray-600 rotate-180" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col items-center pt-12 pb-8 px-5">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Private cloud sync</h1>
              <p className="text-gray-500 text-center leading-relaxed">
                A secure space for your data. When enabled:<br/>
                1. Automatic backups help prevent data loss<br/>
                2. Edits sync across app and web for easy access
              </p>
            </div>

            <div className="px-5 space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                  <span className="text-[15px] text-gray-900">Enable private cloud sync</span>
                  <button
                    onClick={() => setCloudSyncEnabled(!cloudSyncEnabled)}
                    className={cn(
                      "w-12 h-7 rounded-full transition-colors relative",
                      cloudSyncEnabled ? "bg-teal-500" : "bg-gray-200"
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
                    <span className="text-[15px] text-gray-900">Sync on Wi‑Fi only</span>
                    <button
                      onClick={() => setWifiOnlySync(!wifiOnlySync)}
                      className={cn(
                        "w-12 h-7 rounded-full transition-colors relative",
                        wifiOnlySync ? "bg-teal-500" : "bg-gray-200"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow",
                        wifiOnlySync ? "right-1" : "left-1"
                      )} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">When on, background sync runs only on Wi‑Fi.</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button className="w-full flex items-center justify-between px-4 py-4 border-b border-gray-100">
                  <span className="text-[15px] text-gray-900">Manage storage</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[15px] text-gray-400">16.62 MB</span>
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </div>
                </button>
                <button className="w-full flex items-center justify-between px-4 py-4">
                  <span className="text-[15px] text-gray-900">Delete cloud recordings</span>
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 个性化设置页面 */}
      {showPersonalization && (
        <div className="absolute inset-0 z-50 bg-gray-50 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
            <button onClick={() => setShowPersonalization(false)} className="p-1">
              <ChevronRight className="w-6 h-6 text-gray-600 rotate-180" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Personalization</h1>
            <div className="w-8" />
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* 个人资料 */}
            <button 
              onClick={() => {
                setShowPersonalization(false)
                setShowProfile(true)
              }}
              className="w-full flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100"
            >
              <span className="text-[15px] text-gray-900">Profile</span>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>

            {/* 内容侧重 */}
            <div className="px-5 pt-6 pb-4 bg-white border-b border-gray-100">
              <h3 className="text-[15px] font-medium text-gray-900 mb-4">Focus areas</h3>
              <input
                type="text"
                placeholder="What should outputs emphasize?"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] placeholder-gray-400 focus:outline-none focus:border-gray-300 mb-4"
              />
              <div className="flex flex-wrap gap-2">
                {["Key takeaways", "Risks & open questions", "Actions & next steps"].map((tag) => (
                  <button key={tag} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 自定义指令 */}
            <div className="px-5 pt-6 pb-4 bg-white border-b border-gray-100">
              <h3 className="text-[15px] font-medium text-gray-900 mb-4">Custom instructions</h3>
              <input
                type="text"
                placeholder="Tone and style for explanations?"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] placeholder-gray-400 focus:outline-none focus:border-gray-300 mb-4"
              />
              <div className="flex flex-wrap gap-2">
                {["Concise", "Formal & professional", "Structured"].map((tag) => (
                  <button key={tag} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 记忆 */}
            <div className="px-5 pt-6 pb-2">
              <div className="text-sm text-gray-400 mb-2">Memory</div>
            </div>
            <div className="mx-5 bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
              <div className="px-4 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[15px] text-gray-900">Use memory</span>
                  <button
                    onClick={() => setUseMemory(!useMemory)}
                    className={cn(
                      "w-12 h-7 rounded-full transition-colors relative",
                      useMemory ? "bg-teal-500" : "bg-gray-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow",
                      useMemory ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  When on, Mind may use saved context for more relevant replies.
                  <span className={cn("underline underline-offset-2 decoration-slate-300", mx.citationLink)}>
                    Learn more
                  </span>
                </p>
              </div>
              <button className="w-full flex items-center justify-between px-4 py-4">
                <div>
                  <div className="text-[15px] text-gray-900 text-left">Manage memory</div>
                  <div className="text-xs text-gray-400 mt-1 text-left">View and edit saved context</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credits & plan purchase */}
      {showCreditsPlans && (
        <div className="absolute inset-0 z-50 bg-gray-50 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white shrink-0">
            <button
              type="button"
              onClick={() => setShowCreditsPlans(false)}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Back"
            >
              <ChevronRight className="w-6 h-6 text-gray-600 rotate-180" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Credits & plans</h1>
            <div className="w-8" />
          </div>

          <div className="flex-1 overflow-y-auto pb-8">
            <div className={cn("mx-5 mt-4 p-4 rounded-2xl shadow-sm", mx.creditsCard)}>
              <div className="text-sm text-gray-500 mb-1">Available balance</div>
              <div className="text-3xl font-bold tracking-tight text-slate-900">
                {stats.creditsRemaining.toLocaleString("en-US")}
                <span className="text-lg font-semibold text-gray-500 ml-1.5">credits</span>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Included this cycle: {stats.creditsMonthlyAllowance.toLocaleString("en-US")} credits ·
                resets monthly
              </div>
              <div className={cn("mt-3 h-2 rounded-full overflow-hidden", mx.creditsProgressTrack)}>
                <div
                  className={cn("h-full rounded-full", mx.creditsProgressFill)}
                  style={{
                    width: `${Math.min(100, Math.round((stats.creditsRemaining / stats.creditsMonthlyAllowance) * 100))}%`,
                  }}
                />
              </div>
            </div>

            <div className="px-5 mt-6 mb-2">
              <h2 className="text-sm font-semibold text-gray-900">Buy more credits</h2>
              <p className="text-xs text-gray-500 mt-1">
                One-time packs. Credits apply to transcription, AI summaries, and agents.
              </p>
            </div>

            <div className="px-5 space-y-3">
              {creditPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "rounded-2xl border bg-white p-4 shadow-sm",
                    plan.highlight ? mx.commercePopularRing : "border-gray-100"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{plan.name}</span>
                        {plan.highlight && (
                          <span
                            className={cn(
                              "text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full",
                              mx.commercePopularBadge
                            )}
                          >
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{plan.blurb}</p>
                      <p className="text-sm font-medium text-gray-800 mt-2">
                        +{plan.credits.toLocaleString("en-US")} credits
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold text-gray-900">{plan.price}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={cn(
                      "mt-4 w-full py-3 rounded-xl text-sm font-semibold transition-colors",
                      plan.highlight ? mx.commercePrimaryCta : mx.commerceSecondaryCta
                    )}
                    onClick={() => setShowCreditsPlans(false)}
                  >
                    Purchase
                  </button>
                </div>
              ))}
            </div>

            <p className="px-5 mt-6 text-xs text-gray-400 text-center leading-relaxed">
              Payments are processed securely. Mock checkout — connect your billing provider here.
            </p>
          </div>
        </div>
      )}

      {/* 个人资料页面 */}
      {showProfile && (
        <div className="absolute inset-0 z-50 bg-gray-50 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
            <button onClick={() => setShowProfile(false)} className="p-1">
              <ChevronRight className="w-6 h-6 text-gray-600 rotate-180" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
            <div className="w-8" />
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-5 py-4 bg-white border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[15px] text-gray-900">Profile</span>
                <button className="flex items-center gap-1 text-gray-500">
                  <span className="text-sm">Edit</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400">Tap Edit to update your work context</p>
            </div>

            <div className="mx-5 mt-4 bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-4 border-b border-gray-100">
                <div className="text-sm text-gray-400 mb-1">Role</div>
                <div className="text-[15px] font-medium text-gray-900">Strategy / Ops / Data</div>
              </div>
              <div className="px-4 py-4 border-b border-gray-100">
                <div className="text-sm text-gray-400 mb-1">Industry</div>
                <div className="text-[15px] font-medium text-gray-900">AI / Technology</div>
              </div>
              <div className="px-4 py-4 border-b border-gray-100">
                <div className="text-sm text-gray-400 mb-1">Level</div>
                <div className="text-[15px] font-medium text-gray-900">Manager / Lead</div>
              </div>
              <div className="px-4 py-4">
                <div className="text-sm text-gray-400 mb-1">Primary use</div>
                <div className="text-[15px] font-medium text-gray-900">Personal</div>
              </div>
            </div>

            <div className="px-5 pt-6 pb-2">
              <div className="text-sm text-gray-400 mb-2">Additional notes</div>
            </div>
            <div className="mx-5 bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
              <textarea
                placeholder="Anything else we should know?"
                rows={4}
                className="w-full px-4 py-3 text-[15px] placeholder-gray-400 focus:outline-none resize-none"
              />
              <div className="px-4 pb-3 text-right text-xs text-gray-400">0/500</div>
            </div>
          </div>
        </div>
      )}

      {/* 个人洞察详情页面 */}
      {showInsights && (
        <div className="absolute inset-0 z-50 bg-gray-50 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
            <button onClick={() => setShowInsights(false)} className="p-1">
              <ChevronRight className="w-6 h-6 text-gray-600 rotate-180" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Insights</h1>
            <button
              type="button"
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Share insights"
              onClick={() =>
                setInsightShareSheet({
                  title: "Insights snapshot",
                  preview:
                    PERSONALIZED_AI_INSIGHTS_LATEST.slice(0, 180) +
                    (PERSONALIZED_AI_INSIGHTS_LATEST.length > 180 ? "…" : ""),
                })
              }
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* 顶部统计 */}
            <div className="px-5 py-6 bg-white border-b border-gray-100">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">{stats.totalNotes}</div>
                  <div className="text-sm text-gray-500">Notes</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">12</div>
                  <div className="text-sm text-gray-500">Tags</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">{stats.totalDays}</div>
                  <div className="text-sm text-gray-500">Days</div>
                </div>
              </div>

              {/* 热力图 */}
              <p className="text-xs text-gray-400 mb-2">Tap a day to expand that date</p>
              <div className="grid grid-cols-13 gap-[3px]">
                {heatmapData.slice(-91).map((day, i) => (
                  <button
                    key={`in-${day.date}-${i}`}
                    type="button"
                    onClick={() => setHeatmapDayDetail({ date: day.date, value: day.value })}
                    title={formatHeatmapDayLabel(day.date)}
                    className={mxHeatmapCell(day.value)}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
              </div>
            </div>

            {/* 快捷入口 */}
            <div className="px-5 py-4">
              <button className={cn("w-full flex items-center gap-3 py-3 px-4 rounded-xl mb-4", mx.libraryCta)}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                <span className="font-medium">All notes</span>
                <ChevronRight className="w-5 h-5 ml-auto opacity-80" />
              </button>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setPersonalizedFeed({ type: "daily" })}
                  className="w-full flex items-center gap-3 py-3 px-2"
                >
                  <Sparkles className="w-5 h-5 text-gray-500" />
                  <span className="text-[15px] text-gray-700">Daily review</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                </button>
                <button
                  type="button"
                  onClick={() => setPersonalizedFeed({ type: "insights" })}
                  className="w-full flex items-center gap-3 py-3 px-2"
                >
                  <Target className="w-5 h-5 text-gray-500" />
                  <span className="text-[15px] text-gray-700">AI insights</span>
                  <MoreHorizontal className="w-5 h-5 text-gray-400 ml-auto" />
                </button>
                <button className="w-full flex items-center gap-3 py-3 px-2">
                  <Map className="w-5 h-5 text-gray-500" />
                  <span className="text-[15px] text-gray-700">Knowledge map</span>
                </button>
              </div>

              {/* 添加小部件 */}
              <button className="w-full flex items-center gap-3 py-3 px-4 bg-gray-100 rounded-xl mt-4">
                <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                <span className="text-[15px] text-gray-600">Add widget</span>
                <svg className="w-4 h-4 text-gray-400 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* 标签 */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={cn("text-sm font-medium", mx.citationMuted)}>All tags</span>
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
                  </svg>
                </div>
                <button className="w-full flex items-center gap-3 py-3 px-2">
                  <Hash className="w-5 h-5 text-gray-500" />
                  <span className="text-[15px] text-gray-700">Getting started</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                  <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* 底部功能 */}
              <div className="mt-6 space-y-1">
                <button className="w-full flex items-center gap-3 py-3 px-2">
                  <Trash2 className="w-5 h-5 text-gray-500" />
                  <span className="text-[15px] text-gray-700">Trash</span>
                </button>
                <button className="w-full flex items-center gap-3 py-3 px-2">
                  <HelpCircle className="w-5 h-5 text-gray-500" />
                  <span className="text-[15px] text-gray-700">Help center</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {personalizedFeed && (
        <div className="absolute inset-0 z-[65] bg-gray-50 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="flex items-center px-4 py-3 border-b border-gray-100 bg-white shrink-0">
            <div className="w-10 flex justify-start">
              <button
                type="button"
                onClick={() => setPersonalizedFeed(null)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <ChevronRight className="w-6 h-6 text-gray-600 rotate-180" />
              </button>
            </div>
            <h1 className="flex-1 text-center text-lg font-semibold text-gray-900 truncate px-2">
              {personalizedFeed.type === "daily" ? "Daily review" : "AI insights"}
            </h1>
            <div className="w-10 flex justify-end">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Share"
                onClick={() => {
                  const body =
                    personalizedFeed.type === "daily"
                      ? PERSONALIZED_DAILY_REVIEW_LATEST
                      : PERSONALIZED_AI_INSIGHTS_LATEST
                  setInsightShareSheet({
                    title: personalizedFeed.type === "daily" ? "Daily review" : "AI insights",
                    preview: body.slice(0, 200) + (body.length > 200 ? "…" : ""),
                  })
                }}
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <p className="text-xs font-medium text-gray-500 mb-3 pl-2 border-l-2 border-slate-400/80">
              AI-generated · <span className={mx.citationMuted}>Personalized</span>
            </p>
            <div className={cn("rounded-2xl p-4 shadow-sm bg-white", mx.citationBorder)}>
              <p className="text-[15px] text-gray-700 leading-relaxed">
                {personalizedFeed.type === "daily"
                  ? PERSONALIZED_DAILY_REVIEW_LATEST
                  : PERSONALIZED_AI_INSIGHTS_LATEST}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const body =
                  personalizedFeed.type === "daily"
                    ? PERSONALIZED_DAILY_REVIEW_LATEST
                    : PERSONALIZED_AI_INSIGHTS_LATEST
                setInsightShareSheet({
                  title: personalizedFeed.type === "daily" ? "Daily review" : "AI insights",
                  preview: body.slice(0, 200) + (body.length > 200 ? "…" : ""),
                })
              }}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 font-medium text-sm hover:bg-gray-50"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      )}

      {heatmapDayDetail &&
        (() => {
          const d = heatmapDayDetail
          const uploads = getDayUploads(d.date, d.value)
          const title = formatHeatmapDayLabel(d.date)
          const sharePreview = heatmapDaySharePreview(d.date, d.value)
          const openDayShare = () => setInsightShareSheet({ title, preview: sharePreview })
          return (
            <div className="absolute inset-0 z-[60] bg-gray-50 flex flex-col animate-in fade-in duration-150">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white shrink-0">
                <button type="button" onClick={() => setHeatmapDayDetail(null)} className="p-1 rounded-full hover:bg-gray-100">
                  <ChevronRight className="w-6 h-6 text-gray-600 rotate-180" />
                </button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
                  <p className="text-xs text-gray-500">
                    Activity {d.value === 0 ? "none" : `level ${d.value}`}
                  </p>
                </div>
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-100 shrink-0"
                  aria-label="Share this day"
                  onClick={openDayShare}
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 pb-8">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-600">This day · AI summary</span>
                    <button
                      type="button"
                      onClick={openDayShare}
                      className={cn("text-xs font-medium flex items-center gap-1", mx.citationLink)}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Share
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    <p className="text-[15px] text-gray-900 leading-relaxed font-medium">
                      {getDayLeadLine(d.date, d.value)}
                    </p>
                    <p className="text-[15px] text-gray-700 leading-relaxed">
                      {getDailyReviewForDay(d.date, d.value)}
                    </p>
                    {uploads.length > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
                          Recorded
                        </p>
                        <ul className="space-y-2">
                          {uploads.map((item) => (
                            <li key={item.id}>
                              <button
                                type="button"
                                className="w-full rounded-xl bg-gray-50 hover:bg-gray-100/80 p-3 flex gap-3 text-left transition-colors"
                              >
                                <div
                                  className={cn(
                                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                                    mx.citationSubtleBg
                                  )}
                                >
                                  <Mic className="w-4 h-4 text-slate-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {item.time} · {item.source}
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 self-center" />
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

      {insightShareSheet && (
        <div className="absolute inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setInsightShareSheet(null)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="px-5 pb-2">
              <h3 className="text-lg font-semibold text-gray-900">Share</h3>
              <p className="text-sm font-medium text-gray-800 mt-1">{insightShareSheet.title}</p>
              <p className="text-sm text-gray-500 mt-2 line-clamp-4">{insightShareSheet.preview}</p>
            </div>
            <div className="px-5 pb-4">
              <SocialShareRow
                title={insightShareSheet.title}
                body={insightShareSheet.preview}
                onAfterAction={() => setInsightShareSheet(null)}
              />
            </div>
            <div className="px-5 pb-6">
              <button
                type="button"
                onClick={() => setInsightShareSheet(null)}
                className="w-full py-3 bg-gray-100 rounded-xl text-gray-700 font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
