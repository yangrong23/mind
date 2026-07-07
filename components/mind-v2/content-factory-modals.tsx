"use client"

import {
  createContext,
  useContext,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import {
  FACTORY_CARD_INNER_FILL,
  FACTORY_CARD_RADIUS,
  FACTORY_CARD_SHAPE,
  FACTORY_CARD_SHAPE_HOVER,
  FACTORY_CARD_FILLED_SELECTED,
  FACTORY_CARD_SHAPE_SELECTED,
  FACTORY_FIELD_RADIUS,
  FACTORY_ICON_RADIUS,
  FACTORY_MODAL_RADIUS,
  FACTORY_SEGMENT_RADIUS,
  FACTORY_TRACK_RADIUS,
} from "@/components/mind-v2/factory-card-shape"
import {
  DEFAULT_FACTORY_OUTPUT_LANGUAGE,
  FACTORY_OUTPUT_LANGUAGES,
  type FactoryOutputLanguage,
} from "@/lib/factory-languages"
import {
  X,
  Check,
  Pencil,
  FilePlus2,
  Sparkles,
  Wand2,
  Layers,
  HelpCircle,
  BarChart3,
  Presentation,
  Volume2,
  ChevronDown,
} from "lucide-react"

export type FactoryModalKind =
  | "report"
  | "audio"
  | "flashcards"
  | "quiz"
  | "infographic"
  | "slides"

/** Numeric knobs chosen in Studio modals; passed through to generation / job meta. */
export type FactoryGenerationSettings = Partial<{
  audioTargetMinutes: number
  slidesPageCount: number
  quizQuestionCount: number
  flashcardCount: number
  infographicPanelCount: number
  reportTargetPages: number
  outputLanguage: FactoryOutputLanguage
}>

export type FactoryOptionSurface = "flat" | "filled"

const FactoryOptionSurfaceContext = createContext<FactoryOptionSurface>("flat")

function useFactoryOptionSurface() {
  return useContext(FactoryOptionSurfaceContext)
}

function useFactoryTone(kind: FactoryModalKind) {
  const surface = useFactoryOptionSurface()
  return surface === "filled" ? mx.kbFactoryTone[kind] : mx.factoryTone[kind]
}

interface ContentFactoryModalsProps {
  open: FactoryModalKind | null
  onClose: () => void
  /** Shown in copy where library context matters */
  libraryName?: string
  /** Fired when the user taps Generate; the modal closes immediately after. */
  onGenerateSubmit?: (kind: FactoryModalKind, settings?: FactoryGenerationSettings) => void
  /** Knowledge Studio uses filled option cards; Agent / chat rails stay flat. */
  optionSurface?: FactoryOptionSurface
  /** Agent home / chat: tighter audio format cards and focus field. */
  modalDensity?: "default" | "compact"
}

function ModalFrame({
  tone,
  title,
  icon,
  children,
  onClose,
  footer,
}: {
  tone: FactoryModalKind
  title: string
  icon: ReactNode
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
}) {
  const t = useFactoryTone(tone)
  return (
    <div
      className="absolute inset-0 z-[70] flex flex-col justify-end bg-black/45 p-3 pb-4 sm:items-center sm:justify-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={cn(
          "flex max-h-[88vh] w-full flex-col overflow-hidden bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)] sm:mx-auto sm:max-h-[90vh] sm:max-w-[min(100%,34rem)] sm:shadow-xl",
          FACTORY_MODAL_RADIUS
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-stone-200/90 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center",
                FACTORY_ICON_RADIUS,
                t.well
              )}
            >
              <span className={cn("flex h-5 w-5 items-center justify-center [&>svg]:h-5 [&>svg]:w-5", t.icon)}>
                {icon}
              </span>
            </span>
            <h2 className="truncate text-[17px] font-semibold text-zinc-900">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-zinc-500 hover:bg-stone-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer}
      </div>
    </div>
  )
}

const FACTORY_OPTION_SELECTED = FACTORY_CARD_SHAPE_SELECTED
const FACTORY_OPTION_IDLE = cn(
  "bg-white/50 dark:bg-zinc-900/40",
  FACTORY_CARD_SHAPE_HOVER,
  "dark:hover:bg-zinc-800/35"
)
const FACTORY_OPTION_CARD_CLASS =
  "relative flex min-h-[4.75rem] w-full min-w-0 flex-col justify-between p-3.5 text-left"
const FACTORY_OPTION_CARD_COMPACT_CLASS =
  "relative flex min-h-[3.5rem] w-full min-w-0 flex-col justify-between p-2.5 text-left"
const FACTORY_OPTION_CARD_DENSE_CLASS =
  "relative flex min-h-[3rem] w-full min-w-0 flex-col justify-between p-2 text-left"
const FACTORY_OPTION_GRID_CLASS = "grid grid-cols-2 gap-2.5"
const FACTORY_OPTION_GRID_COMPACT_CLASS = "grid grid-cols-2 gap-2"
const FACTORY_OPTION_GRID_DENSE_CLASS = "grid grid-cols-2 gap-1.5"
const FACTORY_AUDIO_FOCUS_ROWS = 4

function FactoryDescriptionPeekCard({
  title,
  description,
  onClose,
}: {
  title: string
  description: string
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/20 p-5"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="factory-desc-peek-title"
        className={cn("w-full max-w-[15.5rem] border border-stone-200/95 bg-white p-3 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18)]", FACTORY_CARD_RADIUS)}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="factory-desc-peek-title" className="text-[13px] font-semibold leading-snug text-zinc-900">
          {title}
        </h3>
        <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-600">{description}</p>
      </div>
    </div>
  )
}

function FactoryCardDetailsButton({ title, description }: { title: string; description: string }) {
  const [peekOpen, setPeekOpen] = useState(false)
  if (!description.trim()) return null

  const openPeek = (e: MouseEvent | KeyboardEvent) => {
    e.stopPropagation()
    setPeekOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={openPeek}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            openPeek(e)
          }
        }}
        className="mt-1.5 w-fit shrink-0 text-left text-[11px] font-medium text-mind hover:underline"
      >
        Details
      </button>
      {peekOpen ? (
        <FactoryDescriptionPeekCard
          title={title}
          description={description}
          onClose={() => setPeekOpen(false)}
        />
      ) : null}
    </>
  )
}
const FACTORY_TOPIC_TEXTAREA_ROWS = 9
const FACTORY_TOPIC_TEXTAREA_CLASS = cn(
  "w-full resize-none border border-stone-200/50 bg-white px-3 py-2.5 text-[14px] leading-relaxed text-zinc-800 placeholder:text-zinc-400",
  FACTORY_FIELD_RADIUS
)

function factoryOptionCardKeyHandlers(onClick?: () => void) {
  if (!onClick) return {}
  return {
    role: "button" as const,
    tabIndex: 0,
    onClick,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        onClick()
      }
    },
  }
}

function FactoryOptionCard({
  tone,
  selected,
  onClick,
  title,
  description,
  size = "default",
}: {
  tone: FactoryModalKind
  selected: boolean
  onClick: () => void
  title: string
  description: string
  size?: "default" | "compact" | "dense"
}) {
  const tc = useFactoryTone(tone)
  const filled = useFactoryOptionSurface() === "filled"
  const dense = size === "dense"
  const compact = size === "compact" || dense
  return (
    <div
      {...factoryOptionCardKeyHandlers(onClick)}
      className={cn(
        FACTORY_CARD_SHAPE,
        FACTORY_CARD_RADIUS,
        FACTORY_CARD_SHAPE_HOVER,
        "overflow-hidden",
        dense
          ? FACTORY_OPTION_CARD_DENSE_CLASS
          : compact
            ? FACTORY_OPTION_CARD_COMPACT_CLASS
            : FACTORY_OPTION_CARD_CLASS,
        "group cursor-pointer",
        filled && "bg-transparent dark:bg-transparent",
        filled
          ? selected
            ? FACTORY_CARD_FILLED_SELECTED
            : FACTORY_CARD_SHAPE_HOVER
          : selected
            ? FACTORY_OPTION_SELECTED
            : FACTORY_OPTION_IDLE
      )}
    >
      {filled ? (
        <span
          className={cn(
            FACTORY_CARD_INNER_FILL,
            "transition-colors duration-300",
            selected ? cn(tc.filledOptionBg, tc.cardOn) : cn(tc.filledOptionBg, tc.filledShellHover, tc.softHover)
          )}
          aria-hidden
        />
      ) : null}
      {selected ? (
        <Check
          className={cn(
            dense
            ? "absolute right-1 top-1 h-3 w-3"
            : compact
              ? "absolute right-1.5 top-1.5 h-3.5 w-3.5"
              : "absolute right-2 top-2 h-4 w-4",
            tc.check
          )}
          strokeWidth={3}
        />
      ) : null}
      <span
        className={cn(
          "relative z-[1] min-h-0 break-words font-semibold leading-snug text-zinc-700",
          dense ? "line-clamp-1 pr-4 text-[12px]" : "whitespace-normal break-words",
          !dense && (compact ? "pr-5 text-[13px] leading-snug" : "pr-6 text-[14px] leading-snug")
        )}
      >
        {title}
      </span>
      {!dense && description.trim() ? (
        <p
          className={cn(
            "relative z-[1] line-clamp-2 min-h-0 break-words leading-snug text-zinc-500",
            compact ? "pr-4 text-[10px]" : "pr-5 text-[11px]"
          )}
        >
          {description}
        </p>
      ) : null}
      {!dense && !description.trim() ? (
        <div className="relative z-[1]">
          <FactoryCardDetailsButton title={title} description={description} />
        </div>
      ) : null}
    </div>
  )
}

function FactoryTemplateCard({
  tone,
  title,
  desc,
  onClick,
}: {
  tone: FactoryModalKind
  title: string
  desc: string
  onClick?: () => void
}) {
  const tc = useFactoryTone(tone)
  const filled = useFactoryOptionSurface() === "filled"
  return (
    <div
      {...factoryOptionCardKeyHandlers(onClick)}
      className={cn(
        FACTORY_CARD_SHAPE,
        FACTORY_CARD_RADIUS,
        FACTORY_CARD_SHAPE_HOVER,
        FACTORY_OPTION_CARD_CLASS,
        "group relative overflow-hidden",
        onClick && "cursor-pointer",
        filled ? undefined : FACTORY_OPTION_IDLE
      )}
    >
      {filled ? (
        <span className={cn(FACTORY_CARD_INNER_FILL, tc.filledOptionBg, tc.softHover)} aria-hidden />
      ) : null}
      <span className={cn("absolute right-2 top-2 z-[1] rounded-full p-1", tc.sparkle, "opacity-90")}>
        <Pencil className="h-3.5 w-3.5" />
      </span>
      <span className="relative z-[1] line-clamp-2 min-h-0 break-words pr-7 text-[14px] font-semibold leading-snug text-zinc-900">
        {title}
      </span>
      <div className="relative z-[1]">
        <FactoryCardDetailsButton title={title} description={desc} />
      </div>
    </div>
  )
}

function FactoryStylePickCard({
  tone,
  selected,
  onClick,
  emoji,
  label,
  compact = false,
}: {
  tone: FactoryModalKind
  selected: boolean
  onClick: () => void
  emoji: string
  label: string
  compact?: boolean
}) {
  const tc = useFactoryTone(tone)
  const filled = useFactoryOptionSurface() === "filled"
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        FACTORY_CARD_SHAPE,
        FACTORY_CARD_RADIUS,
        FACTORY_CARD_SHAPE_HOVER,
        "relative flex shrink-0 flex-col items-center justify-center overflow-hidden text-center active:scale-[0.99]",
        compact
          ? "h-[3.5rem] min-w-[4.75rem] gap-1 px-2 py-2"
          : "h-[5.25rem] w-[calc((100%-0.625rem)/2)] gap-1.5 px-3 py-3.5",
        filled && "bg-transparent dark:bg-transparent",
        filled
          ? selected
            ? FACTORY_CARD_FILLED_SELECTED
            : FACTORY_CARD_SHAPE_HOVER
          : selected
            ? FACTORY_OPTION_SELECTED
            : FACTORY_OPTION_IDLE
      )}
    >
      {filled ? (
        <span
          className={cn(
            FACTORY_CARD_INNER_FILL,
            "transition-colors duration-300",
            selected
              ? cn(tc.styleCardOn, tc.filledOptionBg)
              : cn(tc.filledOptionBg, tc.filledShellHover, tc.softHover)
          )}
          aria-hidden
        />
      ) : null}
      {selected ? (
        <Check
          className={cn(
            "absolute",
            compact ? "right-1 top-1 h-2.5 w-2.5" : "right-2 top-2 h-3.5 w-3.5",
            tc.check
          )}
          strokeWidth={3}
        />
      ) : null}
      <span className={cn("relative z-[1] leading-none", compact ? "text-base" : "text-xl")}>{emoji}</span>
      <span
        className={cn(
          "relative z-[1] font-medium leading-tight text-zinc-800",
          compact ? "max-w-full truncate text-[10px]" : "text-[12px]"
        )}
      >
        {label}
      </span>
    </button>
  )
}

function FactoryLanguageSelect({
  value,
  onChange,
  tone,
  compact = false,
  className,
}: {
  value: FactoryOutputLanguage
  onChange: (value: FactoryOutputLanguage) => void
  tone: FactoryModalKind
  compact?: boolean
  className?: string
}) {
  const tc = useFactoryTone(tone)
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as FactoryOutputLanguage)}
        className={cn(
          "w-full appearance-none border border-stone-200/50 bg-white text-zinc-900",
          compact
            ? cn(FACTORY_FIELD_RADIUS, "py-1.5 pl-2.5 pr-8 text-[12px]")
            : cn(FACTORY_FIELD_RADIUS, "py-2.5 pl-3 pr-9 text-[14px]"),
          tc.fieldFocus
        )}
      >
        {FACTORY_OUTPUT_LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-zinc-500",
          compact ? "right-2.5 h-3.5 w-3.5" : "right-3 h-4 w-4"
        )}
        aria-hidden
      />
    </div>
  )
}

function GenerateFooter({ onGenerate, onClose }: { onGenerate?: () => void; onClose: () => void }) {
  return (
    <div className="shrink-0 border-t border-stone-200/90 bg-white px-4 py-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            onGenerate?.()
            onClose()
          }}
          className={cn(
            "rounded-full px-6 py-2.5 text-[15px] font-semibold text-white shadow-sm",
            mx.brandCta
          )}
        >
          Generate
        </button>
      </div>
    </div>
  )
}

function SliderRow({
  tone,
  label,
  hint,
  min,
  max,
  step = 1,
  value,
  onChange,
  valueSuffix,
}: {
  tone: FactoryModalKind
  label: string
  hint?: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (n: number) => void
  valueSuffix: string
}) {
  const tc = useFactoryTone(tone)
  return (
    <div className="mb-4">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <p className="text-[13px] text-zinc-500">{label}</p>
        <span className={cn("tabular-nums text-[13px] font-semibold", tc.check)}>
          {value}
          {valueSuffix ? ` ${valueSuffix}` : ""}
        </span>
      </div>
      {hint ? <p className="mb-2 text-[11px] leading-snug text-zinc-400">{hint}</p> : null}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-zinc-700"
      />
      <div className="mt-1 flex justify-between text-[10px] text-zinc-400">
        <span>
          {min} {valueSuffix}
        </span>
        <span>
          {max} {valueSuffix}
        </span>
      </div>
    </div>
  )
}

function PillRow({
  tone,
  label,
  value,
  onChange,
  options,
}: {
  tone: FactoryModalKind
  label: string
  value: string
  onChange: (v: string) => void
  options: { id: string; label: string }[]
}) {
  const tc = useFactoryTone(tone)
  return (
    <div className="mb-4">
      <p className="mb-2 text-[13px] text-zinc-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const selected = value === o.id
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-2 text-[13px] font-medium transition-colors",
                selected ? tc.pillOn : "border-stone-200/45 bg-white text-zinc-700 hover:border-stone-200/60"
              )}
            >
              {selected && <Check className={cn("h-3.5 w-3.5 shrink-0", tc.check)} strokeWidth={3} />}
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Segmented control — reference: Short / Default / Long duration row */
function FactorySegmentedRow({
  tone,
  label,
  value,
  onChange,
  options,
}: {
  tone: FactoryModalKind
  label: string
  value: string
  onChange: (v: string) => void
  options: { id: string; label: string }[]
}) {
  const tc = useFactoryTone(tone)
  const filled = useFactoryOptionSurface() === "filled"
  return (
    <div className="mb-4">
      <p className="mb-2 text-[13px] font-semibold text-zinc-900">{label}</p>
      <div
        className={cn(
          "flex gap-1 p-1",
          FACTORY_FIELD_RADIUS,
          "border border-stone-200/40 bg-stone-100/85 dark:border-zinc-600/35 dark:bg-zinc-800/50"
        )}
        role="group"
        aria-label={label}
      >
        {options.map((o) => {
          const selected = value === o.id
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={cn(
                "relative isolate flex min-w-0 flex-1 items-center justify-center gap-1 overflow-hidden py-2.5 text-[13px] font-medium transition-all duration-300 ease-out",
                FACTORY_SEGMENT_RADIUS,
                selected
                  ? cn(
                      filled ? FACTORY_CARD_FILLED_SELECTED : FACTORY_CARD_SHAPE_SELECTED,
                      "text-zinc-700"
                    )
                  : "text-zinc-500 hover:bg-white/55 hover:text-zinc-600 dark:hover:bg-zinc-800/55"
              )}
            >
              {selected ? (
                <span
                  className={cn(
                    FACTORY_CARD_INNER_FILL,
                    filled ? cn(tc.filledOptionBg, tc.cardOn) : "bg-white dark:bg-zinc-900"
                  )}
                  aria-hidden
                />
              ) : null}
              {selected ? (
                <Check className={cn("relative z-[1] h-3.5 w-3.5 shrink-0", tc.check)} strokeWidth={3} aria-hidden />
              ) : null}
              <span className={cn("relative z-[1]", selected && "pl-0")}>{o.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Create report — formats + suggested formats */
function ReportModal({
  onClose,
  onSubmitFactory,
}: {
  onClose: () => void
  onSubmitFactory?: (settings: FactoryGenerationSettings) => void
}) {
  const [reportPages, setReportPages] = useState(12)
  const tc = useFactoryTone("report")
  const formatCards = [
    { title: "Custom format", desc: "Structure, tone, and style your report the way you want." },
    { title: "Briefing doc", desc: "Key insights and citations from your sources." },
    { title: "Study guide", desc: "Short-answer prompts, paper questions, and a glossary." },
    { title: "Blog post", desc: "Turn highlights into a clear, readable article." },
  ]
  const suggestedCards = [
    { title: "Industry whitepaper", desc: "Market landscape and vendor selection for AI knowledge bases in 2025." },
    { title: "Technical rollout", desc: "From unstructured data to a production RAG architecture." },
    { title: "Knowledge primer", desc: "Core concepts for personal and org knowledge management." },
    { title: "Topic roundup", desc: "Pick the right tooling for different learning workflows." },
  ]
  return (
    <ModalFrame
      tone="report"
      title="Create report"
      icon={<FilePlus2 className="h-5 w-5" />}
      onClose={onClose}
      footer={
        <GenerateFooter
          onGenerate={() => onSubmitFactory?.({ reportTargetPages: reportPages })}
          onClose={onClose}
        />
      }
    >
      <SliderRow
        tone="report"
        label="Target length"
        hint="Approximate page count for the written report."
        min={5}
        max={40}
        value={reportPages}
        onChange={setReportPages}
        valueSuffix="pages"
      />
      <section className="mb-6">
        <h3 className="mb-3 text-[15px] font-semibold text-zinc-900">Formats</h3>
        <div className={FACTORY_OPTION_GRID_CLASS}>
          {formatCards.map((c) => (
            <FactoryTemplateCard key={c.title} tone="report" title={c.title} desc={c.desc} />
          ))}
        </div>
      </section>
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-zinc-900">
          <Wand2 className={cn("h-4 w-4", tc.sparkle)} />
          Suggested formats
        </h3>
        <div className={FACTORY_OPTION_GRID_CLASS}>
          {suggestedCards.map((c) => (
            <FactoryTemplateCard key={c.title} tone="report" title={c.title} desc={c.desc} />
          ))}
        </div>
      </section>
    </ModalFrame>
  )
}

/** Flashcards — count, difficulty, topic */
function FlashcardsModal({
  onClose,
  onSubmitFactory,
}: {
  onClose: () => void
  onSubmitFactory?: (settings: FactoryGenerationSettings) => void
}) {
  const [cardCount, setCardCount] = useState(24)
  const [diff, setDiff] = useState("medium")
  const [topic, setTopic] = useState("")
  const tc = useFactoryTone("flashcards")
  return (
    <ModalFrame
      tone="flashcards"
      title="Custom flashcards"
      icon={<Layers className="h-5 w-5" />}
      onClose={onClose}
      footer={
        <GenerateFooter
          onGenerate={() => onSubmitFactory?.({ flashcardCount: cardCount })}
          onClose={onClose}
        />
      }
    >
      <SliderRow
        tone="flashcards"
        label="Number of cards"
        hint="How many flashcards to generate from your sources."
        min={8}
        max={100}
        value={cardCount}
        onChange={setCardCount}
        valueSuffix="cards"
      />
      <PillRow
        tone="flashcards"
        label="Difficulty"
        value={diff}
        onChange={setDiff}
        options={[
          { id: "easy", label: "Easy" },
          { id: "medium", label: "Medium (default)" },
          { id: "hard", label: "Hard" },
        ]}
      />
      <div>
        <p className="mb-2 text-[13px] text-zinc-500">What should the topic be?</p>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={FACTORY_TOPIC_TEXTAREA_ROWS}
          placeholder={`Examples\n• Limit cards to one source (e.g. “an article about Italy”)\n• Focus on one topic (e.g. “Newton’s second law”)\n• Keep fronts short (1–5 words)`}
          className={cn(FACTORY_TOPIC_TEXTAREA_CLASS, tc.fieldFocus)}
        />
      </div>
    </ModalFrame>
  )
}

function QuizModal({
  onClose,
  onSubmitFactory,
}: {
  onClose: () => void
  onSubmitFactory?: (settings: FactoryGenerationSettings) => void
}) {
  const [questionCount, setQuestionCount] = useState(15)
  const [diff, setDiff] = useState("medium")
  const [topic, setTopic] = useState("")
  const tc = useFactoryTone("quiz")
  return (
    <ModalFrame
      tone="quiz"
      title="Custom quiz"
      icon={<HelpCircle className="h-5 w-5" />}
      onClose={onClose}
      footer={
        <GenerateFooter
          onGenerate={() => onSubmitFactory?.({ quizQuestionCount: questionCount })}
          onClose={onClose}
        />
      }
    >
      <SliderRow
        tone="quiz"
        label="Number of questions"
        hint="Multiple-choice and short-answer style questions."
        min={5}
        max={50}
        value={questionCount}
        onChange={setQuestionCount}
        valueSuffix="questions"
      />
      <PillRow
        tone="quiz"
        label="Difficulty"
        value={diff}
        onChange={setDiff}
        options={[
          { id: "easy", label: "Easy" },
          { id: "medium", label: "Medium (default)" },
          { id: "hard", label: "Hard" },
        ]}
      />
      <div>
        <p className="mb-2 text-[13px] text-zinc-500">What should the topic be?</p>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={FACTORY_TOPIC_TEXTAREA_ROWS}
          placeholder={`Examples\n• Help me study for an ancient Egypt exam\n• Exactly 30 questions (max 50)\n• Only use one source (e.g. “an article about Italy”)\n• Focus on key physics concepts`}
          className={cn(FACTORY_TOPIC_TEXTAREA_CLASS, tc.fieldFocus)}
        />
      </div>
    </ModalFrame>
  )
}

const infographicStyles = [
  { id: "auto", label: "Auto", emoji: "✨" },
  { id: "cute", label: "Cute", emoji: "🚀" },
  { id: "clay", label: "Clay", emoji: "🧱" },
  { id: "sketch", label: "Sketch", emoji: "✏️" },
  { id: "anime", label: "Anime", emoji: "🎨" },
  { id: "editorial", label: "Editorial", emoji: "📰" },
]

function InfographicModal({
  onClose,
  onSubmitFactory,
  compact = false,
}: {
  onClose: () => void
  onSubmitFactory?: (settings: FactoryGenerationSettings) => void
  compact?: boolean
}) {
  const [lang, setLang] = useState<FactoryOutputLanguage>(DEFAULT_FACTORY_OUTPUT_LANGUAGE)
  const [orient, setOrient] = useState("landscape")
  const [style, setStyle] = useState("auto")
  const [detail, setDetail] = useState("standard")
  const [panelCount, setPanelCount] = useState(8)
  const [desc, setDesc] = useState("")
  const tc = useFactoryTone("infographic")
  return (
    <ModalFrame
      tone="infographic"
      title="Custom infographic"
      icon={<BarChart3 className="h-5 w-5" />}
      onClose={onClose}
      footer={
        <GenerateFooter
          onGenerate={() =>
            onSubmitFactory?.({ infographicPanelCount: panelCount, outputLanguage: lang })
          }
          onClose={onClose}
        />
      }
    >
      <div className={compact ? "mb-3" : "mb-4"}>
        <p className={cn("text-zinc-500", compact ? "mb-1 text-[12px]" : "mb-1.5 text-[13px]")}>Language</p>
        <FactoryLanguageSelect value={lang} onChange={setLang} tone="infographic" compact={compact} />
      </div>
      <div className={compact ? "mb-3" : "mb-4"}>
        <p className={cn("text-zinc-500", compact ? "mb-1.5 text-[12px]" : "mb-2 text-[13px]")}>Orientation</p>
        <div className={cn("flex flex-wrap", compact ? "gap-1.5" : "gap-2")}>
          {[
            { id: "landscape", label: "Landscape" },
            { id: "portrait", label: "Portrait" },
            { id: "square", label: "Square" },
          ].map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setOrient(o.id)}
              className={cn(
                "flex items-center rounded-full border font-medium",
                compact ? "gap-1 px-2.5 py-1 text-[12px]" : "gap-1.5 px-3 py-2 text-[13px]",
                orient === o.id ? tc.pillOn : "border-stone-200 bg-white text-zinc-700"
              )}
            >
              {orient === o.id && (
                <Check className={cn(compact ? "h-3 w-3" : "h-3.5 w-3.5", tc.check)} strokeWidth={3} />
              )}
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div className={compact ? "mb-3" : "mb-4"}>
        <p className={cn("text-zinc-500", compact ? "mb-1.5 text-[12px]" : "mb-2 text-[13px]")}>Visual style</p>
        <div
          className={cn(
            "flex overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            compact ? "gap-1.5 pb-1" : "gap-2.5 pb-2"
          )}
        >
          {infographicStyles.map((s) => (
            <FactoryStylePickCard
              key={s.id}
              tone="infographic"
              selected={style === s.id}
              onClick={() => setStyle(s.id)}
              emoji={s.emoji}
              label={s.label}
              compact={compact}
            />
          ))}
        </div>
      </div>
      <SliderRow
        tone="infographic"
        label="Panels / key points"
        hint="How many visual sections or headline stats to cover."
        min={4}
        max={16}
        value={panelCount}
        onChange={setPanelCount}
        valueSuffix="panels"
      />
      <PillRow
        tone="infographic"
        label="Level of detail"
        value={detail}
        onChange={setDetail}
        options={[
          { id: "short", label: "Short" },
          { id: "standard", label: "Standard" },
          { id: "detailed", label: "Detailed BETA" },
        ]}
      />
      <div>
        <p className={cn("text-zinc-500", compact ? "mb-1.5 text-[12px]" : "mb-2 text-[13px]")}>
          Describe the infographic
        </p>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={compact ? 3 : 4}
          placeholder='Style, palette, or emphasis: "Use a blue theme and highlight three key stats."'
          className={cn(
            "w-full resize-none border border-stone-200/50 text-zinc-800 placeholder:text-zinc-400",
            compact
              ? cn(FACTORY_FIELD_RADIUS, "px-2.5 py-1.5 text-[13px] leading-snug")
              : cn(FACTORY_FIELD_RADIUS, "px-3 py-2.5 text-[14px]"),
            tc.fieldFocus
          )}
        />
      </div>
    </ModalFrame>
  )
}

function AudioModal({
  onClose,
  libraryName,
  onSubmitFactory,
  compact = false,
}: {
  onClose: () => void
  libraryName?: string
  onSubmitFactory?: (settings: FactoryGenerationSettings) => void
  compact?: boolean
}) {
  const [format, setFormat] = useState("deep")
  const [lang, setLang] = useState<FactoryOutputLanguage>(DEFAULT_FACTORY_OUTPUT_LANGUAGE)
  const [durationPreset, setDurationPreset] = useState("default")
  const audioMinutes =
    durationPreset === "short" ? 5 : durationPreset === "long" ? 18 : 8
  const [focus, setFocus] = useState(
    "From an enterprise knowledge platform angle, explain how RAG improves on classic search.\n- Summarize ingestion vs retrieval in the architecture."
  )
  const formats = [
    { id: "deep", title: "Deep dive", desc: "Two hosts unpack and connect themes from your sources." },
    { id: "summary", title: "Summary", desc: "A short brief on the core ideas." },
    { id: "review", title: "Review", desc: "Expert-style feedback to sharpen the material." },
    { id: "debate", title: "Debate", desc: "Two perspectives on what the sources imply." },
  ]
  const tags = ["Vendor comparison", "Enterprise patterns", "Beginner’s guide"]
  const tc = useFactoryTone("audio")
  return (
    <ModalFrame
      tone="audio"
      title="Custom audio overview"
      icon={<Volume2 className="h-5 w-5" />}
      onClose={onClose}
      footer={
        <GenerateFooter
          onGenerate={() =>
            onSubmitFactory?.({ audioTargetMinutes: audioMinutes, outputLanguage: lang })
          }
          onClose={onClose}
        />
      }
    >
      <p className={cn("font-semibold text-zinc-900", compact ? "mb-1.5 text-[12px]" : "mb-2 text-[13px]")}>
        Format
      </p>
      <div
        className={cn(
          compact ? "mb-3" : "mb-4",
          compact ? FACTORY_OPTION_GRID_DENSE_CLASS : FACTORY_OPTION_GRID_COMPACT_CLASS
        )}
      >
        {formats.map((f) => (
          <FactoryOptionCard
            key={f.id}
            tone="audio"
            size={compact ? "dense" : "compact"}
            selected={format === f.id}
            onClick={() => setFormat(f.id)}
            title={f.title}
            description={f.desc}
          />
        ))}
      </div>
      <div className={compact ? "mb-2" : "mb-3"}>
        <p className={cn("text-zinc-500", compact ? "mb-1 text-[11px]" : "mb-1 text-[12px]")}>Language</p>
        <FactoryLanguageSelect value={lang} onChange={setLang} tone="audio" compact={compact} />
      </div>
      <FactorySegmentedRow
        tone="audio"
        label="Duration"
        value={durationPreset}
        onChange={setDurationPreset}
        options={[
          { id: "short", label: "Short" },
          { id: "default", label: "Default" },
          { id: "long", label: "Long" },
        ]}
      />
      <div>
        <p className={cn("text-zinc-500", compact ? "mb-1.5 text-[12px]" : "mb-2 text-[13px]")}>
          What should the hosts emphasize this episode?
        </p>
        <textarea
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          rows={compact ? FACTORY_AUDIO_FOCUS_ROWS : FACTORY_TOPIC_TEXTAREA_ROWS}
          className={cn(
            "mb-3 w-full resize-none border border-stone-200/50 text-zinc-800",
            compact
              ? cn(FACTORY_FIELD_RADIUS, "px-2.5 py-1.5 text-[13px] leading-snug")
              : cn(FACTORY_FIELD_RADIUS, "px-3 py-2 text-[14px]"),
            tc.fieldFocus
          )}
        />
        <div className={cn("flex flex-wrap", compact ? "gap-1.5" : "gap-2")}>
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFocus((prev) => (prev ? `${prev}\n` : "") + t)}
              className={cn(
                "rounded-full border border-dashed border-stone-300 bg-stone-50 text-zinc-700 hover:bg-stone-100",
                compact ? "px-2 py-0.5 text-[11px]" : "px-3 py-1.5 text-[12px]"
              )}
            >
              + {t}
            </button>
          ))}
        </div>
      </div>
      {libraryName ? <p className="mt-3 text-[11px] text-zinc-400">Source library: {libraryName}</p> : null}
    </ModalFrame>
  )
}

function SlidesModal({
  onClose,
  onSubmitFactory,
}: {
  onClose: () => void
  onSubmitFactory?: (settings: FactoryGenerationSettings) => void
}) {
  const [mode, setMode] = useState("detailed")
  const [lang, setLang] = useState<FactoryOutputLanguage>(DEFAULT_FACTORY_OUTPUT_LANGUAGE)
  const [slidePages, setSlidePages] = useState(14)
  const [desc, setDesc] = useState("")
  const tc = useFactoryTone("slides")
  return (
    <ModalFrame
      tone="slides"
      title="Custom presentation"
      icon={<Presentation className="h-5 w-5" />}
      onClose={onClose}
      footer={
        <GenerateFooter
          onGenerate={() =>
            onSubmitFactory?.({ slidesPageCount: slidePages, outputLanguage: lang })
          }
          onClose={onClose}
        />
      }
    >
      <p className="mb-2 text-[13px] font-semibold text-zinc-900">Format</p>
      <div className={cn("mb-4", FACTORY_OPTION_GRID_CLASS)}>
        <FactoryOptionCard
          tone="slides"
          selected={mode === "detailed"}
          onClick={() => setMode("detailed")}
          title="Detailed deck"
          description="Full narrative with detail—great to email or read on its own."
        />
        <FactoryOptionCard
          tone="slides"
          selected={mode === "slides"}
          onClick={() => setMode("slides")}
          title="Speaker slides"
          description="Clean slides with talking points to support a live talk."
        />
      </div>
      <div className="mb-4">
        <p className="mb-1 text-[13px] text-zinc-500">Language</p>
        <FactoryLanguageSelect value={lang} onChange={setLang} tone="slides" />
      </div>
      <SliderRow
        tone="slides"
        label="Slide count"
        hint="Approximate number of slides in the deck."
        min={5}
        max={40}
        value={slidePages}
        onChange={setSlidePages}
        valueSuffix="slides"
      />
      <div>
        <p className="mb-2 text-[13px] text-zinc-500">Describe the presentation</p>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={5}
          placeholder='Outline, audience, tone, or emphasis: "Beginner-friendly, bold visuals, step-by-step."'
          className={cn(
            "w-full resize-none border border-stone-200/50 px-3 py-2 text-[14px] placeholder:text-zinc-400",
            FACTORY_FIELD_RADIUS,
            tc.fieldFocus
          )}
        />
      </div>
    </ModalFrame>
  )
}

export function ContentFactoryModals({
  open,
  onClose,
  libraryName,
  onGenerateSubmit,
  optionSurface = "flat",
  modalDensity = "default",
}: ContentFactoryModalsProps) {
  if (!open) return null
  const submit =
    (kind: FactoryModalKind) => (settings: FactoryGenerationSettings) =>
      onGenerateSubmit?.(kind, settings)
  const modal = (() => {
    switch (open) {
      case "report":
        return <ReportModal onClose={onClose} onSubmitFactory={submit("report")} />
      case "audio":
        return (
          <AudioModal
            onClose={onClose}
            libraryName={libraryName}
            onSubmitFactory={submit("audio")}
            compact={modalDensity === "compact"}
          />
        )
      case "flashcards":
        return <FlashcardsModal onClose={onClose} onSubmitFactory={submit("flashcards")} />
      case "quiz":
        return <QuizModal onClose={onClose} onSubmitFactory={submit("quiz")} />
      case "infographic":
        return (
          <InfographicModal
            onClose={onClose}
            onSubmitFactory={submit("infographic")}
            compact={modalDensity === "compact"}
          />
        )
      case "slides":
        return <SlidesModal onClose={onClose} onSubmitFactory={submit("slides")} />
      default:
        return null
    }
  })()
  return (
    <FactoryOptionSurfaceContext.Provider value={optionSurface}>{modal}</FactoryOptionSurfaceContext.Provider>
  )
}
