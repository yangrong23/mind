"use client"

import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import {
  BookOpen,
  Compass,
  Gift,
  History,
  MessageCirclePlus,
  Moon,
  Sun,
  X,
} from "lucide-react"
import type { WebTabType } from "@/components/mind-v2/web-sidebar-nav"

export function WebSettingsPanel({
  open,
  onClose,
  onNavigate,
  onNewChat,
}: {
  open: boolean
  onClose: () => void
  onNavigate: (tab: WebTabType) => void
  onNewChat?: () => void
}) {
  const { resolvedTheme, setTheme } = useTheme()

  if (!open) return null

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
        aria-label="关闭"
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed bottom-14 left-[3.25rem] z-50 flex max-h-[min(520px,80vh)] w-[min(280px,85vw)] flex-col overflow-hidden rounded-2xl",
          web.panel,
          web.panelShadow,
          "ring-1 ring-black/[0.06]"
        )}
        role="dialog"
        aria-label="设置"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-[15px] font-semibold text-zinc-700">Mindar</span>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-stone-100">
            <X className="h-4 w-4 text-zinc-500" />
          </button>
        </div>

        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={() => {
              onNewChat?.()
              onClose()
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-stone-200/90 py-2.5 text-[14px] font-medium text-zinc-700 hover:bg-stone-50"
          >
            <MessageCirclePlus className="h-4 w-4" />
            新对话
          </button>
        </div>

        <nav className="space-y-0.5 px-2">
          {[
            { tab: "plaza" as const, label: "知识库广场", icon: Compass },
            { tab: "library" as const, label: "个人知识库", icon: BookOpen },
            { tab: "agent" as const, label: "问答历史", icon: History },
          ].map((row) => (
            <button
              key={row.label}
              type="button"
              onClick={() => {
                onNavigate(row.tab)
                onClose()
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium text-zinc-700 hover:bg-stone-50"
            >
              <row.icon className="h-[18px] w-[18px] text-zinc-400" strokeWidth={1.75} />
              {row.label}
            </button>
          ))}
        </nav>

        <div className="mx-3 mt-3 rounded-xl bg-teal-50/80 px-3 py-2.5">
          <div className="flex items-center gap-2 text-[12px] font-medium text-teal-800">
            <Gift className="h-4 w-4" />
            限时领取 20G 空间
          </div>
        </div>

        <div className="mt-auto space-y-1 border-t border-stone-100/80 px-2 py-3">
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-zinc-600 hover:bg-stone-50"
          >
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {resolvedTheme === "dark" ? "浅色模式" : "深色模式"}
          </button>
          <p className="px-3 py-1 text-[12px] text-zinc-400">关于 Mindar · v2 demo</p>
        </div>
      </aside>
    </>
  )
}
