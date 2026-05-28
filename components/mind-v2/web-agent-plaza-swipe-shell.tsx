"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type Panel = "agent" | "plaza"

type WebAgentPlazaSwipeShellProps = {
  agentPanel: ReactNode
  plazaPanel: ReactNode
  /** Called when the visible panel changes (e.g. after swipe). */
  onPanelChange?: (panel: Panel) => void
}

/** Agent home ↔ library plaza — swipe right on agent to reveal plaza (ima-style). */
export function WebAgentPlazaSwipeShell({
  agentPanel,
  plazaPanel,
  onPanelChange,
}: WebAgentPlazaSwipeShellProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [panel, setPanel] = useState<Panel>("agent")
  const panelRef = useRef<Panel>("agent")

  const syncPanelFromScroll = useCallback(() => {
    const el = scrollerRef.current
    if (!el || el.clientWidth <= 0) return
    const next: Panel = el.scrollLeft < el.clientWidth * 0.45 ? "plaza" : "agent"
    if (panelRef.current === next) return
    panelRef.current = next
    setPanel(next)
    onPanelChange?.(next)
  }, [onPanelChange])

  const scrollToPanel = useCallback((target: Panel, smooth = true) => {
    const el = scrollerRef.current
    if (!el) return
    const left = target === "plaza" ? 0 : el.clientWidth
    el.scrollTo({ left, behavior: smooth ? "smooth" : "auto" })
    panelRef.current = target
    setPanel(target)
    onPanelChange?.(target)
  }, [onPanelChange])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const setInitial = () => {
      el.scrollLeft = el.clientWidth
      panelRef.current = "agent"
      setPanel("agent")
    }
    setInitial()
    const ro = new ResizeObserver(setInitial)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="relative h-full min-h-0 overflow-hidden">
      <div
        ref={scrollerRef}
        className={cn(
          "flex h-full min-h-0 snap-x snap-mandatory overflow-x-auto overflow-y-hidden",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        )}
        onScroll={syncPanelFromScroll}
        aria-label="Agent and library plaza"
      >
        <section
          className="h-full min-h-0 w-full shrink-0 snap-start overflow-hidden"
          aria-hidden={panel === "agent"}
        >
          {plazaPanel}
        </section>
        <section
          className="h-full min-h-0 w-full shrink-0 snap-start overflow-hidden"
          aria-hidden={panel === "plaza"}
        >
          {agentPanel}
        </section>
      </div>

      {panel === "agent" ? (
        <button
          type="button"
          onClick={() => scrollToPanel("plaza")}
          className={cn(
            "absolute left-0 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-0.5 rounded-r-xl border border-l-0 border-stone-200/90 bg-white/90 py-3 pl-1 pr-2 shadow-[4px_0_20px_-8px_rgba(15,23,42,0.12)] backdrop-blur-sm",
            "transition-[opacity,transform] hover:pr-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mind/25"
          )}
          aria-label="Swipe to Library Plaza"
          title="Library Plaza"
        >
          <ChevronRight className="h-4 w-4 text-zinc-400" strokeWidth={2} aria-hidden />
          <span className="text-[10px] font-semibold tracking-wide text-zinc-500 [writing-mode:vertical-rl]">
            Plaza
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => scrollToPanel("agent")}
          className={cn(
            "absolute left-4 top-4 z-20 inline-flex items-center gap-1 rounded-full border border-stone-200/90 bg-white/95 px-3 py-1.5 text-[13px] font-medium text-zinc-600 shadow-sm backdrop-blur-sm",
            "transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mind/25"
          )}
          aria-label="Back to Agent home"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          Mindar
        </button>
      )}
    </div>
  )
}
