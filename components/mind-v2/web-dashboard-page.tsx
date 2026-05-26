"use client"

import { toast } from "sonner"
import { FileText, FolderPlus, Plus, Sparkles, Upload } from "lucide-react"
import { DashboardContinueThumb } from "@/components/mind-v2/mind-media-art"
import { WebPageCanvas, WebPageHeader, WebPanel } from "@/components/mind-v2/web-app-chrome"
import type { DashboardContentKind } from "@/lib/product-media"
import { cn } from "@/lib/utils"

const quickActions = [
  { label: "New Note", icon: FileText, bg: "from-sky-500 to-purple-500" },
  { label: "Upload", icon: Upload, bg: "from-sky-500 to-blue-500" },
  { label: "Ask AI", icon: Sparkles, bg: "from-teal-500 to-emerald-500" },
  { label: "New Project", icon: FolderPlus, bg: "from-amber-500 to-orange-500" },
]

const continueItems: { title: string; tag: string; kind: DashboardContentKind }[] = [
  { title: "Product Strategy 2025", tag: "Strategy", kind: "strategy" },
  { title: "User Research Synthesis", tag: "Research", kind: "research" },
  { title: "Competitive Landscape", tag: "Market", kind: "market" },
]

const stats = [
  { label: "Notes", value: "1,284" },
  { label: "AI Conversations", value: "326" },
  { label: "Projects", value: "47" },
  { label: "Storage Used", value: "12.4 GB" },
]

const activity = [
  { action: "You created", target: "Product Strategy", time: "2 min ago" },
  { action: "AI summarized", target: "Meeting notes", time: "15 min ago" },
  { action: "You shared", target: "Q4 Roadmap", time: "1h ago" },
  { action: "Studio generated", target: "Strategy slides", time: "3h ago" },
]

export function WebDashboardPage({ userName = "John" }: { userName?: string }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  return (
    <WebPageCanvas>
      <div className="mx-auto flex h-full min-h-0 max-w-[1400px] gap-6 p-6 lg:p-8">
        <div className="min-w-0 flex-1">
          <WebPageHeader
            title={`${greeting}, ${userName}! 👋`}
            subtitle="Your second brain at a glance"
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quickActions.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => toast.message(a.label, { description: "Demo action." })}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-white/80 bg-white p-4 shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-md",
                    a.bg
                  )}
                >
                  <a.icon className="h-5 w-5" />
                </span>
                <span className="text-[13px] font-semibold text-zinc-600">{a.label}</span>
              </button>
            ))}
          </div>

          <section className="mt-8">
            <h2 className="text-[15px] font-semibold text-zinc-600">Continue where you left off</h2>
            <div className="mt-3 flex gap-4 overflow-x-auto pb-2">
              {continueItems.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => toast.message("Open", { description: item.title })}
                  className="w-[220px] shrink-0 overflow-hidden rounded-2xl border border-white/90 bg-white text-left shadow-sm transition-shadow hover:shadow-md"
                >
                  <DashboardContinueThumb kind={item.kind} className="h-28" />
                  <div className="p-3">
                    <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                      {item.tag}
                    </span>
                    <p className="mt-2 text-[14px] font-semibold text-zinc-700">{item.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-[15px] font-semibold text-zinc-600">Quick stats</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {stats.map((s) => (
                <WebPanel key={s.label} className="!p-4">
                  <p className="text-[22px] font-semibold tabular-nums text-zinc-700">{s.value}</p>
                  <p className="mt-1 text-[12px] font-medium text-zinc-500">{s.label}</p>
                </WebPanel>
              ))}
            </div>
          </section>
        </div>

        <aside className="hidden w-[min(300px,28%)] shrink-0 lg:block">
          <WebPanel className="sticky top-6 !p-0">
            <div className="border-b border-stone-100 px-4 py-3">
              <h2 className="text-[14px] font-semibold text-zinc-700">Recent activity</h2>
            </div>
            <ul className="divide-y divide-stone-50 px-2 py-2">
              {activity.map((a, i) => (
                <li key={i} className="px-2 py-3">
                  <p className="text-[13px] text-zinc-600">
                    <span className="text-zinc-500">{a.action}</span>{" "}
                    <span className="font-medium">{a.target}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-400">{a.time}</p>
                </li>
              ))}
            </ul>
          </WebPanel>
          <button
            type="button"
            className="mt-4 flex h-12 w-12 items-center justify-center self-end rounded-full bg-gradient-to-r from-sky-600 to-teal-500 text-white shadow-lg shadow-sky-500/30"
            aria-label="Create"
            onClick={() => toast.message("Quick create")}
          >
            <Plus className="h-6 w-6" />
          </button>
        </aside>
      </div>
    </WebPageCanvas>
  )
}
