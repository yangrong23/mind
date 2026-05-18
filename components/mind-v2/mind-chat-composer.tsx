"use client"

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react"
import { cn } from "@/lib/utils"
import {
  AtSign,
  AudioLines,
  Bot,
  Check,
  ChevronDown,
  Globe,
  MessageCircle,
  Plus,
} from "lucide-react"

export type MindChatMode = "dialog" | "agent"

const DEFAULT_MODELS = ["DS Fast", "Mind Pro", "Balanced"] as const

const pillBtn =
  "inline-flex h-7 shrink-0 items-center gap-1 rounded-full border border-zinc-200/85 bg-white px-2 text-[11px] font-medium text-zinc-800 shadow-none transition-colors hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"

const homePillBtn =
  "inline-flex h-7 shrink-0 items-center gap-1 rounded-full border border-zinc-200/85 bg-white/95 px-2 text-[11px] font-medium text-zinc-800 shadow-none transition-colors hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800/90 dark:text-zinc-100 dark:hover:bg-zinc-700"

const roundToolBtn =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"

export type MindChatComposerProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  /** `home` = Minder landing card; `thread` = in-chat footer */
  variant?: "home" | "thread"
  className?: string
  shellRef?: RefObject<HTMLDivElement | null>
  chatMode?: MindChatMode
  onChatModeChange?: (mode: MindChatMode) => void
  modelLabel?: string
  onModelLabelChange?: (label: string) => void
  modelOptions?: readonly string[]
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
  showModeSelector?: boolean
  showModelSelector?: boolean
  showAtButton?: boolean
  showVoiceButton?: boolean
  showUploadButton?: boolean
  /** Replaces dialog/agent mode pill (e.g. library-grounded Ask). */
  toolbarLead?: ReactNode
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
  chatMode = "dialog",
  onChatModeChange,
  modelLabel = "DS Fast",
  onModelLabelChange,
  modelOptions = DEFAULT_MODELS,
  voiceOn = false,
  onVoiceToggle,
  onAtClick,
  atLabel,
  atTitle,
  atMenu,
  atMenuOpen: atMenuOpenProp,
  onAtMenuOpenChange,
  onUploadClick,
  showModeSelector = true,
  showModelSelector = true,
  showAtButton = true,
  showVoiceButton = true,
  showUploadButton = true,
  toolbarLead,
  ariaLabel = "Message",
}: MindChatComposerProps) {
  const internalRef = useRef<HTMLDivElement>(null)
  const shellRef = shellRefProp ?? internalRef
  const [modeMenuOpen, setModeMenuOpen] = useState(false)
  const [modelMenuOpen, setModelMenuOpen] = useState(false)
  const [atMenuOpenInternal, setAtMenuOpenInternal] = useState(false)
  const atMenuOpen = atMenuOpenProp ?? atMenuOpenInternal
  const setAtMenuOpen = onAtMenuOpenChange ?? setAtMenuOpenInternal

  const pill = variant === "home" ? homePillBtn : pillBtn

  useEffect(() => {
    if (!modeMenuOpen && !modelMenuOpen && !atMenuOpen) return
    function onDocMouseDown(e: MouseEvent) {
      const el = shellRef.current
      if (el && !el.contains(e.target as Node)) {
        setModeMenuOpen(false)
        setModelMenuOpen(false)
        setAtMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocMouseDown)
    return () => document.removeEventListener("mousedown", onDocMouseDown)
  }, [modeMenuOpen, modelMenuOpen, atMenuOpen, shellRef, setAtMenuOpen])

  const closeMenus = () => {
    setModeMenuOpen(false)
    setModelMenuOpen(false)
    setAtMenuOpen(false)
  }

  return (
    <div ref={shellRef} className={cn("relative w-full max-w-md", className)}>
        <div
          className={cn(
            "overflow-visible",
            variant === "home"
              ? "rounded-[1.5rem] border border-zinc-200/55 bg-white/92 shadow-[0_16px_48px_-20px_rgba(15,23,42,0.14),0_2px_12px_-4px_rgba(15,23,42,0.06)] backdrop-blur-md dark:border-zinc-700/65 dark:bg-zinc-900/72 dark:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.55)]"
              : "rounded-[22px] border border-zinc-200/80 bg-white dark:border-zinc-700/90 dark:bg-zinc-900"
          )}
        >
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
              "max-h-24 w-full resize-none border-0 bg-transparent px-3.5 text-[14px] leading-[1.45] text-zinc-900 placeholder:text-zinc-400/90 focus:outline-none focus:ring-0 dark:text-zinc-100 dark:placeholder:text-zinc-500",
              variant === "thread" ? "min-h-[2.75rem] pb-2 pt-3" : "min-h-[2.25rem] pb-1 pt-2"
            )}
            aria-label={ariaLabel}
          />

          
            <div className="flex flex-wrap items-center gap-1.5 px-2 py-1.5">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                {toolbarLead}
                {showModeSelector ? (
                  <span className="relative inline-flex">
                    {modeMenuOpen ? (
                      <div
                        className="absolute bottom-full left-0 z-[100] mb-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
                        role="listbox"
                      >
                        <button
                          type="button"
                          role="option"
                          aria-selected={chatMode === "dialog"}
                          onClick={() => {
                            onChatModeChange?.("dialog")
                            setModeMenuOpen(false)
                          }}
                          className={cn(
                            "flex w-full items-start gap-3 border-b border-zinc-100 px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/80",
                            chatMode === "dialog" && "bg-mind/70 dark:bg-mind/35"
                          )}
                        >
                          <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-mind" strokeWidth={2} aria-hidden />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2 text-[14px] font-semibold text-zinc-900 dark:text-zinc-50">
                              Dialog mode
                              {chatMode === "dialog" ? (
                                <Check className="h-4 w-4 text-mind" strokeWidth={2.5} />
                              ) : null}
                            </span>
                            <span className="mt-0.5 block text-[12px] leading-snug text-zinc-500 dark:text-zinc-400">
                              Multi-turn conversation
                            </span>
                          </span>
                        </button>
                        <button
                          type="button"
                          role="option"
                          aria-selected={chatMode === "agent"}
                          onClick={() => {
                            onChatModeChange?.("agent")
                            setModeMenuOpen(false)
                          }}
                          className={cn(
                            "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/80",
                            chatMode === "agent" && "bg-mind/70 dark:bg-mind/35"
                          )}
                        >
                          <Bot className="mt-0.5 h-5 w-5 shrink-0 text-mind" strokeWidth={2} aria-hidden />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2 text-[14px] font-semibold text-zinc-900 dark:text-zinc-50">
                              Task mode
                              {chatMode === "agent" ? (
                                <Check className="h-4 w-4 text-mind" strokeWidth={2.5} />
                              ) : null}
                            </span>
                            <span className="mt-0.5 block text-[12px] leading-snug text-zinc-500 dark:text-zinc-400">
                              Step-by-step delivery (demo)
                            </span>
                          </span>
                        </button>
                      </div>
                    ) : null}
                    <button
                      type="button"
                      className={pill}
                      aria-expanded={modeMenuOpen}
                      aria-haspopup="listbox"
                      onClick={() => {
                        setModeMenuOpen((v) => !v)
                        setModelMenuOpen(false)
                        setAtMenuOpen(false)
                      }}
                    >
                      {chatMode === "dialog" ? "Dialog" : "Task"}
                      <ChevronDown className="h-3.5 w-3.5 text-zinc-400" strokeWidth={2} aria-hidden />
                    </button>
                  </span>
                ) : null}

                {showModelSelector ? (
                  <span className="relative inline-flex">
                    {modelMenuOpen ? (
                      
                        <div className="absolute bottom-full left-0 z-[100] mb-2 min-w-[10.5rem] overflow-hidden rounded-xl border border-zinc-200/90 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                          {modelOptions.map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => {
                                onModelLabelChange?.(m)
                                setModelMenuOpen(false)
                              }}
                              className="flex w-full items-center justify-between px-3 py-2 text-left text-[13px] text-zinc-800 hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-800"
                            >
                              {m}
                              {modelLabel === m ? (
                                <Check className="h-4 w-4 text-mind" strokeWidth={2.5} />
                              ) : (
                                <span className="w-4" />
                              )}
                            </button>
                          ))}
                        </div>
                      
                    ) : null}
                    <button
                      type="button"
                      className={pill}
                      aria-expanded={modelMenuOpen}
                      onClick={() => {
                        setModelMenuOpen((v) => !v)
                        setModeMenuOpen(false)
                        setAtMenuOpen(false)
                      }}
                    >
                      <Globe className="h-3.5 w-3.5 shrink-0 text-zinc-500" strokeWidth={2} aria-hidden />
                      <span className="max-w-[6.5rem] truncate">{modelLabel}</span>
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-400" strokeWidth={2} aria-hidden />
                    </button>
                  </span>
                ) : null}
              </div>

              <div className="ml-auto flex shrink-0 items-center gap-0.5">
                {showAtButton ? (
                  <span className="relative inline-flex">
                    {atMenuOpen && atMenu ? (
                      <div className="absolute bottom-full right-0 z-[100] mb-2">{atMenu}</div>
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
                    <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
                  </button>
                ) : null}

                {showVoiceButton ? (
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
                      voiceOn && "bg-mind/5 text-mind dark:bg-zinc-800 dark:text-mind/18"
                    )}
                  >
                    <AudioLines className="h-4 w-4" strokeWidth={2} aria-hidden />
                  </button>
                ) : null}
              </div>
            </div>
          
        </div>
      </div>
    
  )
}
