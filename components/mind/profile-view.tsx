"use client"

import { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Bell,
  Cloud,
  Cpu,
  Zap,
  Brain,
  BookOpen,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Battery,
  Wifi,
  HardDrive,
  TrendingUp,
  GitBranch,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfileViewProps {
  onBack: () => void
}

// Animated energy ring
function EnergyRing({ capture, cognition, execution }: { capture: number; cognition: number; execution: number }) {
  const radius = 80
  const strokeWidth = 12
  const circumference = 2 * Math.PI * radius

  const captureArc = (capture / 100) * circumference * 0.33
  const cognitionArc = (cognition / 100) * circumference * 0.33
  const executionArc = (execution / 100) * circumference * 0.33

  return (
    <div className="relative w-[200px] h-[200px] mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="#f5f5f4" strokeWidth={strokeWidth} />

        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="url(#greenGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${captureArc} ${circumference}`}
          strokeDashoffset="0"
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />

        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="url(#blueGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${cognitionArc} ${circumference}`}
          strokeDashoffset={-captureArc - 10}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />

        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="url(#purpleGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${executionArc} ${circumference}`}
          strokeDashoffset={-captureArc - cognitionArc - 20}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />

        <defs>
          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 bg-gradient-to-br from-stone-50 to-white rounded-full flex items-center justify-center shadow-inner">
          <Brain className="w-10 h-10 text-stone-600" />
        </div>
      </div>

      <div className="absolute inset-0 animate-pulse opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] bg-gradient-to-r from-mind/20 via-mind/20 to-mind/20 rounded-full blur-xl" />
      </div>
    </div>
  )
}

function StatusCard({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-zinc-100 shadow-sm", className)}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
          <Icon className="w-4 h-4 text-stone-600" />
        </div>
        <h3 className="font-semibold text-zinc-900 text-[15px]">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function KnowledgeToggle({
  name,
  status,
  enabled,
  onToggle,
}: {
  name: string
  status: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full", enabled ? "bg-mind/48" : "bg-zinc-300")} />
        <span className="text-sm text-zinc-700">{name}</span>
        <span
          className={cn(
            "text-[10px] px-1.5 py-0.5 rounded",
            status === "Active"
              ? "bg-mind/5 text-mind"
              : status === "Offline"
                ? "bg-zinc-100 text-zinc-500"
                : "bg-mind/5 text-mind"
          )}
        >
          {status}
        </span>
      </div>
      <button onClick={onToggle} className="transition-transform active:scale-95">
        {enabled ? <ToggleRight className="w-6 h-6 text-mind/48" /> : <ToggleLeft className="w-6 h-6 text-zinc-300" />}
      </button>
    </div>
  )
}

function AutomationRule({ condition, action }: { condition: string; action: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl">
      <div className="flex-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 bg-mind/10 text-mind rounded font-medium">IF</span>
          <span className="text-zinc-600">{condition}</span>
        </div>
        <div className="flex items-center gap-2 text-xs mt-1.5">
          <span className="px-2 py-0.5 bg-mind/10 text-mind rounded font-medium">THEN</span>
          <span className="text-zinc-600">{action}</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-zinc-400" />
    </div>
  )
}

function MiniChart() {
  const data = [40, 65, 45, 80, 55, 90, 75]
  const max = Math.max(...data)
  const labels = ["M", "T", "W", "T", "F", "S", "S"]

  return (
    <div className="h-16 flex items-end gap-1">
      {data.map((value, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-gradient-to-t from-mind/48 to-mind/38 rounded-t transition-all duration-500"
            style={{ height: `${(value / max) * 100}%` }}
          />
          <span className="text-[8px] text-zinc-400">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

export function ProfileView({ onBack }: ProfileViewProps) {
  const [knowledgeBases, setKnowledgeBases] = useState([
    { id: 1, name: "Medical library", status: "Active", enabled: true },
    { id: 2, name: "Code library", status: "Offline", enabled: false },
    { id: 3, name: "Legal glossary", status: "Updating", enabled: true },
  ])

  const toggleKnowledge = (id: number) => {
    setKnowledgeBases((prev) => prev.map((kb) => (kb.id === id ? { ...kb, enabled: !kb.enabled } : kb)))
  }

  return (
    <div className="h-full flex flex-col bg-[#f8f9fb]">
      <div className="pt-14 px-5 pb-4 bg-white/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-zinc-600" />
          </button>
          <h1 className="text-lg font-semibold text-zinc-900">Intelligence status</h1>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-colors">
              <Bell className="w-5 h-5 text-zinc-600" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-colors">
              <Settings className="w-5 h-5 text-zinc-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-zinc-100 shadow-sm">
          <EnergyRing capture={85} cognition={72} execution={45} />

          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-mind/48 to-mind/38" />
              <span className="text-xs text-zinc-600">Capture</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-mind/48 to-mind/38" />
              <span className="text-xs text-zinc-600">Cognition</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-mind/48 to-mind/38" />
              <span className="text-xs text-zinc-600">Execution</span>
            </div>
          </div>

          <div className="mt-5 p-4 bg-gradient-to-r from-stone-50 to-mind/5 rounded-2xl">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-mind/48 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-zinc-700 leading-relaxed">
                Hey — you captured <span className="font-semibold text-mind">12</span> medical cases today. The
                library auto-added <span className="font-semibold text-mind">3</span> new nodes related to{" "}
                <span className="font-semibold text-mind">CASK</span>.
              </p>
            </div>
          </div>
        </div>

        <StatusCard icon={Cloud} title="Cloud brain">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-zinc-500">Storage</span>
                <span className="font-medium text-zinc-700">1.2 GB / 100 GB</span>
              </div>
              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full w-[12%] bg-gradient-to-r from-mind/48 to-mind/38 rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <div className="w-1.5 h-1.5 bg-mind/48 rounded-full animate-pulse" />3 high-value clips encrypting to
              the cloud
            </div>
          </div>
        </StatusCard>

        <StatusCard icon={BookOpen} title="Professional libraries">
          <div className="divide-y divide-zinc-50">
            {knowledgeBases.map((kb) => (
              <KnowledgeToggle
                key={kb.id}
                name={kb.name}
                status={kb.status}
                enabled={kb.enabled}
                onToggle={() => toggleKnowledge(kb.id)}
              />
            ))}
          </div>
          <button className="w-full mt-3 py-2 text-sm text-mind font-medium hover:bg-mind/5 rounded-xl transition-colors">
            + Add glossary
          </button>
        </StatusCard>

        <StatusCard icon={Cpu} title="Mind Link device">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-stone-100 to-stone-200 rounded-2xl flex items-center justify-center">
              <HardDrive className="w-8 h-8 text-stone-500" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Battery className="w-4 h-4 text-mind/48" />
                  <span className="text-sm font-medium text-zinc-700">78%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-4 h-4 text-mind/48" />
                  <span className="text-xs text-zinc-500">Connected</span>
                </div>
              </div>
              <div className="text-xs text-zinc-400">Firmware v2.1.3 · up to date</div>
            </div>
          </div>
        </StatusCard>

        <StatusCard icon={TrendingUp} title="Idea conversion">
          <div className="mb-3">
            <MiniChart />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">This week</span>
            <span className="font-semibold text-mind">+23% vs last week</span>
          </div>
        </StatusCard>

        <StatusCard icon={GitBranch} title="Automation rules">
          <div className="space-y-2">
            <AutomationRule condition='Recording contains "#case"' action='Sync to "Clinical notes"' />
            <AutomationRule condition="Code snippet detected" action="Create GitHub Gist" />
          </div>
          <button className="w-full mt-3 py-2 text-sm text-mind font-medium hover:bg-mind/5 rounded-xl transition-colors flex items-center justify-center gap-1">
            <Zap className="w-4 h-4" />
            New rule
          </button>
        </StatusCard>

        <div className="h-8" />
      </div>
    </div>
  )
}
