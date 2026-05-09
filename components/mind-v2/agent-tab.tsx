"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { 
  Plus, ChevronRight, Sparkles,
  Send, Mic, Volume2, Eye, Compass, Factory, Settings
} from "lucide-react"

interface Agent {
  id: number
  name: string
  description: string
  avatar: string
  color: string
  chatCount?: string
  author?: string
  isOfficial?: boolean
}

const exploreAgents: Agent[] = [
  { id: 1, name: "Study buddy", description: "Answers questions across subjects from school to college—math, language arts, and more.", avatar: "https://picsum.photos/seed/a1/100/100", color: "from-teal-400 to-teal-600", chatCount: "23.2M chats", author: "EduTeam", isOfficial: true },
  { id: 2, name: "Chatty Ning", description: "A friendly AI companion to share life’s ups and downs with.", avatar: "https://picsum.photos/seed/a2/100/100", color: "from-cyan-400 to-teal-500", chatCount: "20.0M chats", author: "Official", isOfficial: true },
  { id: 3, name: "Owen · English tutor", description: "Passionate and open-minded English foreign teacher", avatar: "https://picsum.photos/seed/a3/100/100", color: "from-teal-500 to-cyan-500", chatCount: "19.7M chats", author: "Official", isOfficial: true },
  { id: 4, name: "All-purpose writer", description: "Drafts and polishes copy for many kinds of writing tasks.", avatar: "https://picsum.photos/seed/a4/100/100", color: "from-teal-300 to-cyan-500", chatCount: "13.5M chats", author: "Official", isOfficial: true },
  { id: 5, name: "Book of answers", description: "When you’re stuck on small decisions, open a page for a nudge.", avatar: "https://picsum.photos/seed/a5/100/100", color: "from-cyan-500 to-teal-600", chatCount: "15.6M chats", author: "MossOak" },
  { id: 6, name: "Writing pro", description: "Your go-to helper for drafting and refining any text.", avatar: "https://picsum.photos/seed/a6/100/100", color: "from-teal-500 to-teal-700", chatCount: "8.9M chats", author: "EduTeam", isOfficial: true },
]

const myAgents: Agent[] = [
  { id: 101, name: "English coach", description: "Practice conversation and pronunciation", avatar: "🎓", color: "from-cyan-400 to-teal-500" },
  { id: 102, name: "Writing assistant", description: "Polish drafts and marketing copy", avatar: "✍️", color: "from-teal-400 to-cyan-600" },
  { id: 103, name: "Code helper", description: "Answers programming questions", avatar: "💻", color: "from-teal-600 to-cyan-500" },
]

const chatHistory = [
  { date: "May 8, 2026", items: [
    { id: 1, title: "Mind map draft", icon: "💭", subItems: [{ text: "Notes and reflections…", type: "note" }] },
    { id: 2, title: "Build an agent", icon: "💭", subItems: [{ text: "ima claw setup", type: "config" }] },
    { id: 3, title: "TCL Zhonghuan news…", icon: "💭" },
  ]},
  { date: "May 6, 2026", items: [
    { id: 4, title: "What’s inside?", icon: "💭" },
  ]},
]

interface AgentTabProps {
  onAgentChat: (agent: Agent) => void
  onOpenContentFactory?: () => void
}

function ClawTerminalPanel() {
  const [lines, setLines] = useState<string[]>([])

  useEffect(() => {
    const steps = [
      "> boot · Clawbot runtime…",
      "> resolving linked notebooks…",
      "> calling PubMed API…",
      "> ok · 3 abstracts · 420 ms",
    ]
    let i = 0
    const id = window.setInterval(() => {
      setLines((prev) => [...prev, steps[i]!])
      i += 1
      if (i >= steps.length) window.clearInterval(id)
    }, 520)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-zinc-800 bg-zinc-950/80">
      <div className="border-b border-zinc-800 px-3 py-2">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">
          Active terminal
        </span>
      </div>
      <div className="min-h-[140px] flex-1 overflow-y-auto p-3 font-mono text-[12px] leading-relaxed">
        <div className="space-y-1.5 text-teal-100/85">
          {lines.map((line, idx) => {
            const isSuccess = idx === lines.length - 1 && line.includes("> ok")
            return (
              <div
                key={`${idx}-${line}`}
                className={cn(
                  "whitespace-pre-wrap break-words rounded-md px-2 py-1.5 transition-[box-shadow,border] duration-500",
                  isSuccess &&
                    "border border-emerald-500/45 bg-emerald-500/[0.07] shadow-[0_0_0_1px_rgba(16,185,129,0.12)]"
                )}
              >
                {line}
              </div>
            )
          })}
          {lines.length === 0 && (
            <div className="animate-pulse text-zinc-600">_ awaiting task…</div>
          )}
        </div>
      </div>
    </div>
  )
}

function IosToggle({
  checked,
  onChange,
  danger,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors",
        checked ? (danger ? "bg-orange-600" : "bg-emerald-500") : "bg-zinc-700"
      )}
    >
      <span
        className={cn(
          "block h-6 w-6 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  )
}

export function AgentTab({ onAgentChat, onOpenContentFactory }: AgentTabProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showCreateSheet, setShowCreateSheet] = useState(false)
  const [showExplore, setShowExplore] = useState(false)
  const [showKBSelect, setShowKBSelect] = useState(false)
  const [selectedKBs, setSelectedKBs] = useState<string[]>([])
  const [showToolsMenu, setShowToolsMenu] = useState(false)
  const [skillPubmed, setSkillPubmed] = useState(true)
  const [skillNotion, setSkillNotion] = useState(false)
  const [skillWeb, setSkillWeb] = useState(true)

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-zinc-950 text-zinc-200">
      {/* 左侧抽屉 */}
      <div 
        className={cn(
          "absolute inset-y-0 left-0 w-[75%] bg-white z-40 transition-transform duration-300 flex flex-col",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* 顶部操作 */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setDrawerOpen(false)
                setShowCreateSheet(true)
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-500 text-white rounded-xl text-sm font-medium hover:bg-teal-600"
            >
              <Plus className="w-4 h-4" />
              New agent
            </button>
            <button 
              onClick={() => {
                setDrawerOpen(false)
                setShowExplore(true)
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium"
            >
              <Compass className="w-4 h-4" />
              Explore
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setDrawerOpen(false)
              onOpenContentFactory?.()
            }}
            className="mt-3 w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-teal-50 border border-teal-100 text-left hover:bg-teal-100/80 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-500/15 flex items-center justify-center shrink-0">
              <Factory className="w-5 h-5 text-teal-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900">Content factory</div>
              <div className="text-xs text-teal-700/85 mt-0.5">Turn library sources into publishable assets</div>
            </div>
            <ChevronRight className="w-5 h-5 text-teal-400 shrink-0" />
          </button>
        </div>

        {/* 我的智能体 */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-3 text-sm text-gray-400">My agents</div>
          {myAgents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => {
                onAgentChat(agent)
                setDrawerOpen(false)
              }}
              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50"
            >
              <span className="text-2xl">{agent.avatar}</span>
              <div className="flex-1 text-left">
                <div className="text-[15px] text-gray-900">{agent.name}</div>
                <div className="text-xs text-gray-400">{agent.description}</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          ))}

          <div className="border-t border-gray-100 mt-4 pt-4 px-5">
            <div className="text-sm text-gray-400 mb-3">Chat history</div>
            {chatHistory.map((group) => (
              <div key={group.date} className="mb-4">
                <div className="text-sm text-gray-400 mb-2">{group.date}</div>
                {group.items.map((item) => (
                  <div key={item.id} className="mb-3">
                    <div className="flex items-center gap-2 text-[15px] text-gray-900">
                      <span>{item.icon}</span>
                      <span className="truncate">{item.title}</span>
                    </div>
                    {item.subItems?.map((sub, i) => (
                      <div key={i} className="flex items-center gap-2 ml-6 mt-1 text-sm text-gray-500">
                        <span className={cn(
                          "w-4 h-4 rounded flex items-center justify-center text-[10px]",
                          sub.type === "note" ? "bg-teal-100 text-teal-700" : "bg-cyan-100 text-cyan-800"
                        )}>
                          {sub.type === "note" ? "📝" : "⚙️"}
                        </span>
                        <span className="truncate">{sub.text}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="px-5 py-4 text-center text-sm text-gray-400">
            We keep the last 90 days of history
          </div>
        </div>
      </div>

      {/* 抽屉遮罩 */}
      {drawerOpen && (
        <div 
          className="absolute inset-0 z-30 bg-black/50"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Clawbot: dark shell · terminal + skills */}
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60"
            aria-label="Open menu"
          >
            <div className="h-0.5 w-5 rounded-full bg-zinc-400" />
            <div className="h-0.5 w-5 rounded-full bg-zinc-400" />
          </button>
          <div className="text-right">
            <div className="text-[15px] font-semibold tracking-tight text-zinc-100">Clawbot</div>
            <div className="text-[11px] text-zinc-500">Terminal · skills</div>
          </div>
        </div>

        <ClawTerminalPanel />

        <div className="mt-4 shrink-0 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Skill library
          </p>
          {[
            {
              name: "PubMed search",
              desc: "Query biomedical literature",
              on: skillPubmed,
              set: setSkillPubmed,
              settings: false,
            },
            {
              name: "Notion export",
              desc: "Push summaries to a database",
              on: skillNotion,
              set: setSkillNotion,
              settings: true,
            },
            {
              name: "Web browse",
              desc: "Fetch pages with citations",
              on: skillWeb,
              set: setSkillWeb,
              settings: false,
            },
          ].map((s) => (
            <div
              key={s.name}
              className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-medium text-zinc-100">{s.name}</div>
                <div className="text-[12px] text-zinc-500">{s.desc}</div>
              </div>
              {s.settings && (
                <button
                  type="button"
                  className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  aria-label={`${s.name} settings`}
                  title="API keys & routing"
                >
                  <Settings className="h-4 w-4" strokeWidth={1.75} />
                </button>
              )}
              <IosToggle checked={s.on} onChange={s.set} />
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3">
          <input
            type="text"
            placeholder="Command or natural language…"
            className="mb-3 w-full bg-transparent text-[15px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowKBSelect(true)}
              className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-[12px] text-zinc-300"
            >
              <Plus className="h-3.5 w-3.5" />
              Libraries
            </button>
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => setShowToolsMenu(!showToolsMenu)}
                className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-[12px] text-zinc-300"
              >
                Tools
              </button>
              {showToolsMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowToolsMenu(false)} />
                  <div className="absolute bottom-full left-0 z-50 mb-2 w-52 rounded-xl border border-zinc-700 bg-zinc-900 py-2 shadow-xl">
                    <div className="px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                      Tools
                    </div>
                    {["Deep research", "Canvas", "Image"].map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setShowToolsMenu(false)}
                        className="w-full px-3 py-2.5 text-left text-[14px] text-zinc-200 hover:bg-zinc-800"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-zinc-300"
              aria-label="Voice"
            >
              <Mic className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500 text-white shadow-lg shadow-teal-500/25"
              aria-label="Send"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 创建智能体 Sheet */}
      {showCreateSheet && (
        <CreateAgentSheet 
          onClose={() => setShowCreateSheet(false)} 
          onExplore={() => {
            setShowCreateSheet(false)
            setShowExplore(true)
          }}
        />
      )}

      {/* 探索智能体广场 */}
      {showExplore && (
        <ExploreAgentsPage 
          onClose={() => setShowExplore(false)}
          onSelect={(agent) => {
            setShowExplore(false)
            onAgentChat(agent)
          }}
          onCreate={() => {
            setShowExplore(false)
            setShowCreateSheet(true)
          }}
        />
      )}

      {/* 知识库选择弹窗 */}
      {showKBSelect && (
        <div className="absolute inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowKBSelect(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="px-5 pb-3">
              <h3 className="text-lg font-semibold text-gray-900">Link libraries</h3>
              <p className="text-sm text-gray-500 mt-1">Choose which libraries this chat can use</p>
            </div>
            <div className="px-5 pb-6 max-h-64 overflow-y-auto">
              {[
                { id: "kb1", name: "Product docs", icon: "📚", count: 45 },
                { id: "kb2", name: "Tech notes", icon: "💻", count: 128 },
                { id: "kb3", name: "Meetings", icon: "📝", count: 32 },
                { id: "kb4", name: "Study", icon: "🎓", count: 67 },
              ].map((kb) => (
                <button
                  key={kb.id}
                  onClick={() => {
                    setSelectedKBs(prev => 
                      prev.includes(kb.id) ? prev.filter(id => id !== kb.id) : [...prev, kb.id]
                    )
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl mb-2 transition-colors",
                    selectedKBs.includes(kb.id) ? "bg-teal-50 border-2 border-teal-500" : "bg-gray-50 border-2 border-transparent"
                  )}
                >
                  <span className="text-2xl">{kb.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">{kb.name}</div>
                    <div className="text-xs text-gray-500">{kb.count} items</div>
                  </div>
                  {selectedKBs.includes(kb.id) && (
                    <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="px-5 pb-6">
              <button
                onClick={() => setShowKBSelect(false)}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium"
              >
                Done {selectedKBs.length > 0 && `(${selectedKBs.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 创建智能体组件
function CreateAgentSheet({ onClose, onExplore }: { onClose: () => void; onExplore: () => void }) {
  const [name, setName] = useState("")
  const [persona, setPersona] = useState("")

  return (
    <div className="absolute inset-0 z-50 bg-gray-50 flex flex-col animate-in slide-in-from-bottom duration-200">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <button onClick={onClose} className="text-[15px] text-gray-600">Cancel</button>
        <h1 className="text-lg font-semibold text-gray-900">Create AI agent</h1>
        <button className="text-[15px] text-teal-600 font-medium">Save</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 头像 */}
        <div className="flex justify-center py-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-teal-100 flex items-center justify-center">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <div className="w-2 h-2 rounded-full bg-gray-400" />
              </div>
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* 一键完善 */}
        <div className="px-5 mb-4">
          <button className="flex items-center gap-1 text-teal-500 text-sm">
            <Sparkles className="w-4 h-4" />
            Autofill
          </button>
        </div>

        {/* 名称 */}
        <div className="mx-5 mb-4 bg-white rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-medium text-gray-900">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Agent name"
              className="flex-1 text-[15px] text-gray-400 placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* 设定描述 */}
        <div className="mx-5 mb-4 bg-white rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[15px] font-medium text-gray-900">Instructions</span>
            <button className="flex items-center gap-1 text-teal-600 text-sm">
              <Sparkles className="w-4 h-4" />
              Polish with AI
            </button>
          </div>
          <textarea
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            placeholder="Example: You are an experienced English teacher who keeps students engaged with humor and real-world examples."
            rows={4}
            className="w-full text-[15px] text-gray-500 placeholder-gray-400 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* 声音 */}
        <div className="mx-5 mb-4 bg-white rounded-xl">
          <button className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-teal-700" />
              </div>
              <span className="text-[15px] text-gray-900">Voice</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-sm">Edit</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
          <div className="border-t border-gray-100" />
          <button className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                <Eye className="w-5 h-5 text-teal-600" />
              </div>
              <span className="text-[15px] text-gray-900">Public · anyone can chat</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* 更多高级设定 */}
        <div className="px-5 mb-4">
          <button className="flex items-center justify-center gap-1 w-full py-3 text-teal-600 text-[15px]">
            <Plus className="w-4 h-4" />
            More options
          </button>
        </div>

        {/* 探索智能体广场入口 */}
        <div className="mx-5 mb-8">
          <button 
            onClick={onExplore}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Compass className="w-5 h-5" />
            <span className="text-[15px] font-medium">Browse agent gallery</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// 探索智能体广场页面
interface ExploreAgentsPageProps {
  onClose: () => void
  onSelect: (agent: Agent) => void
  onCreate: () => void
}

function ExploreAgentsPage({ onClose, onSelect, onCreate }: ExploreAgentsPageProps) {
  const [activeTab, setActiveTab] = useState("Featured")
  const [selectedAgents, setSelectedAgents] = useState<number[]>([])
  const tabs = ["Featured", "Photo Q&A", "Study", "Work", "Create", "Life", "General"]

  const toggleAgent = (id: number) => {
    setSelectedAgents(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-right duration-200">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
          <ChevronRight className="w-6 h-6 text-gray-600 rotate-180" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Agent gallery</h1>
      </div>

      {/* Tab切换 */}
      <div className="border-b border-gray-100">
        <div className="flex overflow-x-auto px-4 py-3 gap-6 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "text-[15px] font-medium whitespace-nowrap pb-1 border-b-2 transition-colors",
                activeTab === tab
                  ? "text-gray-900 border-gray-900"
                  : "text-gray-400 border-transparent"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 智能体列表 */}
      <div className="flex-1 overflow-y-auto">
        {exploreAgents.map((agent) => (
          <div 
            key={agent.id}
            className="flex items-start gap-3 px-5 py-4 border-b border-gray-50"
          >
            <img 
              src={agent.avatar} 
              alt={agent.name}
              className="w-14 h-14 rounded-xl object-cover"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                {agent.isOfficial && (
                  <span className="px-1.5 py-0.5 bg-teal-100 text-teal-700 text-[10px] rounded font-medium">
                    Official
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-1.5 line-clamp-2">{agent.description}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>💬</span>
                <span>{agent.chatCount}</span>
                <span>·</span>
                <span>@{agent.author}</span>
              </div>
            </div>
            <button
              onClick={() => toggleAgent(agent.id)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0",
                selectedAgents.includes(agent.id)
                  ? "bg-teal-100 text-teal-700"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {selectedAgents.includes(agent.id) ? (
                <span className="text-lg">✓</span>
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* 底部按钮 */}
      <div className="p-5 border-t border-gray-100">
        <button
          onClick={onCreate}
          className="w-full py-4 bg-teal-500 text-white rounded-xl font-medium text-[15px] flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create AI agent
        </button>
      </div>
    </div>
  )
}

// 智能体对话页面
interface AgentChatProps {
  agent: Agent
  onBack: () => void
}

export function AgentChat({ agent, onBack }: AgentChatProps) {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; content: string }>>([])

  const handleSend = () => {
    if (!input.trim()) return
    setMessages([...messages, { role: "user", content: input }])
    setInput("")
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: `As ${agent.name}, I can help with that. Based on my instructions and your linked libraries…`
      }])
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* 顶部 */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
          <ChevronRight className="w-6 h-6 text-gray-700 rotate-180" />
        </button>
        <div className={cn(
          "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-xl",
          agent.color
        )}>
          {agent.avatar.startsWith("http") ? (
            <img src={agent.avatar} alt="" className="w-full h-full rounded-xl object-cover" />
          ) : (
            agent.avatar
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{agent.name}</h3>
          <p className="text-xs text-gray-500">{agent.description}</p>
        </div>
      </div>

      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className={cn(
              "w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-4xl mb-4 overflow-hidden",
              agent.color
            )}>
              {agent.avatar.startsWith("http") ? (
                <img src={agent.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                agent.avatar
              )}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Hi, I’m {agent.name}!</h3>
            <p className="text-sm text-gray-500">Send a message to start</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[80%] px-4 py-3 rounded-2xl",
                msg.role === "user" 
                  ? "bg-teal-600 text-white rounded-br-md" 
                  : "bg-white text-gray-800 rounded-bl-md shadow-sm"
              )}>
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 输入区域 */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message…"
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none"
          />
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Mic className="w-5 h-5 text-gray-500" />
          </button>
          <button 
            onClick={handleSend}
            className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
