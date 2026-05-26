"use client"

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react"
import { cn } from "@/lib/utils"
import { AtSign, AudioLines, CirclePlus, Crop } from "lucide-react"

const roundToolBtn =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"

export type MindChatComposerProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  /** `home` = Mindar landing card; `thread` = in-chat footer */
  variant?: "home" | "thread"
  className?: string
  shellRef?: RefObject<HTMLDivElement | null>
  voiceOn?: boolean
  onVoiceToggle?: () => void
  onAtClick?: () => void
  atLabel?: string
  atTitle?: string
  /** Custom popover anchored to @ (e.g. KB list). When set, overrides onAtClick on @ press. */
  atMenu?: ReactNode
  atMenuOpen?: boolean
  onAtMenuOpenChange?: (open: boolean) => void
  onUploadClick?: () => void
  onScreenshotClick?: () => void
  showAtButton?: boolean
  showVoiceButton?: boolean
  showUploadButton?: boolean
  showScreenshotButton?: boolean
  /** Optional leading toolbar slot (e.g. library-grounded Ask). */
  toolbarLead?: ReactNode
  /** Content factory row embedded in the composer shell (web agent home). */
  factoryToolbar?: ReactNode
  /**
   * `default` — textarea then toolbar (agent / library footers).
   * `split` — toolbar then textarea so the input sits on the bottom edge (note docks).
   */
  dockLayout?: "default" | "split"
  /** Hide @ / upload / voice row (parent renders it in an edit band). */
  showToolbar?: boolean
  ariaLabel?: string
}

export function MindChatComposer({
  value,
  onChange,
  onSubmit,
  placeholder = "",
  variant = "thread",
  className,
  shellRef: shellRefProp,
  voiceOn = false,
  onVoiceToggle,
  onAtClick,
  atLabel,
  atTitle,
  atMenu,
  atMenuOpen: atMenuOpenProp,
  onAtMenuOpenChange,
  onUploadClick,
  onScreenshotClick,
  showAtButton = true,
  showVoiceButton = true,
  showUploadButton = true,
  showScreenshotButton = false,
  toolbarLead,
  factoryToolbar,
  dockLayout = "default",
  showToolbar = true,
  ariaLabel = "Message",
}: MindChatComposerProps) {
  const embeddedFactory = Boolean(factoryToolbar)
  const internalRef = useRef<HTMLDivElement>(null)
  const shellRef = shellRefProp ?? internalRef
  const [atMenuOpenInternal, setAtMenuOpenInternal] = useState(false)
  const atMenuOpen = atMenuOpenProp ?? atMenuOpenInternal
  const setAtMenuOpen = onAtMenuOpenChange ?? setAtMenuOpenInternal

  useEffect(() => {
    if (!atMenuOpen) return
    function onDocMouseDown(e: MouseEvent) {
      const el = shellRef.current
      if (el && !el.contains(e.target as Node)) {
        setAtMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocMouseDown)
    return () => document.removeEventListener("mousedown", onDocMouseDown)
  }, [atMenuOpen, shellRef, setAtMenuOpen])

  const closeMenus = () => {
    setAtMenuOpen(false)
  }

  const toolbarRow =
    showToolbar &&
    (embeddedFactory ||
      showAtButton ||
      showUploadButton ||
      showScreenshotButton ||
      showVoiceButton ||
      toolbarLead) ? (
      <div
        className={cn(
          "flex items-center gap-1",
          variant === "home" ? "px-3 pb-2.5 pt-1" : "gap-1.5 px-2 py-1.5",
          dockLayout === "split" && "border-b border-stone-100/90 dark:border-zinc-800/90"
        )}
      >
        <div className="flex shrink-0 items-center gap-0.5">
          {toolbarLead}
          {showUploadButton ? (
            <button
              type="button"
              className={roundToolBtn}
              aria-label="Upload file"
              onClick={() => {
                closeMenus()
                onUploadClick?.()
              }}
            >
              <CirclePlus className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
          ) : null}

          {showScreenshotButton ? (
            <button
              type="button"
              className={roundToolBtn}
              aria-label="Screenshot"
              title="Screenshot"
              onClick={() => {
                closeMenus()
                onScreenshotClick?.()
              }}
            >
              <Crop className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
          ) : null}

          {showAtButton && (!embeddedFactory || atMenu) ? (
            <span className="relative inline-flex">
              {atMenuOpen && atMenu ? (
                <div className="absolute bottom-full left-0 z-[100] mb-1.5">{atMenu}</div>
              ) : null}
              <button
                type="button"
                className={roundToolBtn}
                aria-label={atLabel ?? (atTitle ? `Knowledge base: ${atTitle}` : "Pick knowledge base")}
                title={atTitle}
                onClick={() => {
                  closeMenus()
                  if (atMenu) {
                    setAtMenuOpen(!atMenuOpen)
                  } else {
                    onAtClick?.()
                  }
                }}
              >
                <AtSign className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>
            </span>
          ) : null}
        </div>

        {factoryToolbar ? (
          <>
            <span
              className="mx-0.5 h-4 w-px shrink-0 bg-stone-200 dark:bg-zinc-700"
              aria-hidden
            />
            <div className="min-w-0 flex-1 overflow-hidden">{factoryToolbar}</div>
          </>
        ) : null}

        {showVoiceButton ? (
          <div className="ml-auto flex shrink-0 items-center">
            <button
              type="button"
              aria-pressed={voiceOn}
              aria-label={voiceOn ? "Stop voice input" : "Voice input"}
              onClick={() => {
                closeMenus()
                onVoiceToggle?.()
              }}
              className={cn(
                roundToolBtn,
                voiceOn && "bg-mind/10 text-mind dark:bg-mind/15 dark:text-mind"
              )}
            >
              <AudioLines
                className={cn(
                  "h-4 w-4 transition-[fill,color] duration-200",
                  voiceOn ? "text-mind" : "text-zinc-500 dark:text-zinc-400"
                )}
                fill={voiceOn ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={voiceOn ? 0 : 2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              />
            </button>
          </div>
        ) : null}
      </div>
    ) : null

  const textareaEl = (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key !== "Enter" || e.shiftKey) return
        e.preventDefault()
        onSubmit()
      }}
      rows={1}
      placeholder={placeholder}
      className={cn(
        "max-h-28 w-full resize-none border-0 bg-transparent text-zinc-700 placeholder:text-zinc-400/90 focus:outline-none focus:ring-0 dark:text-zinc-200 dark:placeholder:text-zinc-500",
        variant === "thread"
          ? cn(
              "min-h-[2.75rem] px-3.5 text-[14px] leading-[1.45]",
              dockLayout === "split" ? "pb-2.5 pt-2.5" : "pb-2 pt-3"
            )
          : "min-h-[3rem] px-5 pb-2.5 pt-4 text-[15px] leading-[1.55]"
      )}
      aria-label={ariaLabel}
    />
  )

  return (
    <div ref={shellRef} className={cn("relative mx-auto w-full max-w-2xl", className)}>
      <div
        className={cn(
          "overflow-visible",
          variant === "home" ? "rounded-xl border border-[#e5e3df] bg-white shadow-[0_24px_48px_-8px_rgba(15,15,15,0.12)] transition-[box-shadow,border-color] duration-200 ease-out focus-within:border-[#c8c4be] focus-within:shadow-[0_24px_48px_-8px_rgba(15,15,15,0.16)] dark:border-zinc-700 dark:bg-zinc-900/95" : "rounded-[22px] border border-zinc-200/80 bg-white dark:border-zinc-700/90 dark:bg-zinc-900"
        )}
      >
        {dockLayout === "split" ? (
          <>
            {toolbarRow}
            {textareaEl}
          </>
        ) : (
          <>
            {textareaEl}
            {toolbarRow}
          </>
        )}
      </div>
    </div>
  )
}
