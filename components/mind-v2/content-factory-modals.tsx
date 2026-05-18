"use client"

import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
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
}>

interface ContentFactoryModalsProps {
  open: FactoryModalKind | null
  onClose: () => void
  /** Shown in copy where library context matters */
  libraryName?: string
  /** Fired when the user taps Generate; the modal closes immediately after. */
  onGenerateSubmit?: (kind: FactoryModalKind, settings?: FactoryGenerationSettings) => void
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
  const t = mx.factoryTone[tone]
  return (
    <div
      className="absolute inset-0 z-[70] flex flex-col justify-end bg-black/45 sm:items-center sm:justify-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[88vh] w-full flex-col rounded-t-[1.25rem] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)] sm:mx-auto sm:max-h-[90vh] sm:max-w-[min(100%,28rem)] sm:rounded-2xl sm:shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-stone-200/90 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
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

/** 2-col option cards — same footprint as the Quiz settings sheet grid cells */
const FACTORY_OPTION_CARD_CLASS =
  "relative flex w-full min-h-[5.25rem] flex-col rounded-xl border p-3.5 text-left transition-colors"
const FACTORY_OPTION_GRID_CLASS = "grid grid-cols-2 gap-2.5"
const FACTORY_TOPIC_TEXTAREA_ROWS = 9
const FACTORY_TOPIC_TEXTAREA_CLASS =
  "w-full resize-none rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-[14px] leading-relaxed text-zinc-800 placeholder:text-zinc-400"

function FactoryOptionCard({
  tone,
  selected,
  onClick,
  title,
  description,
}: {
  tone: FactoryModalKind
  selected: boolean
  onClick: () => void
  title: string
  description: string
}) {
  const tc = mx.factoryTone[tone]
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        FACTORY_OPTION_CARD_CLASS,
        selected ? tc.cardOn : cn("border-stone-200/90 dark:border-zinc-700/90", mx.surfaceTint, tc.softHover)
      )}
    >
      {selected ? (
        <Check className={cn("absolute right-2 top-2 h-4 w-4", tc.check)} strokeWidth={3} />
      ) : null}
      <span className="pr-6 text-[14px] font-semibold leading-snug text-zinc-900">{title}</span>
      <span className="mt-1.5 text-[12px] leading-snug text-zinc-600">{description}</span>
    </button>
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
  const tc = mx.factoryTone[tone]
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(FACTORY_OPTION_CARD_CLASS, "border-stone-200/90 dark:border-zinc-700/90", mx.surfaceTint, tc.softHover)}
    >
      <span className={cn("absolute right-2 top-2 rounded-md p-1", tc.sparkle, "opacity-90")}>
        <Pencil className="h-3.5 w-3.5" />
      </span>
      <span className="pr-7 text-[14px] font-semibold leading-snug text-zinc-900">{title}</span>
      <span className="mt-1.5 text-[12px] leading-snug text-zinc-600">{desc}</span>
    </button>
  )
}

function FactoryStylePickCard({
  tone,
  selected,
  onClick,
  emoji,
  label,
}: {
  tone: FactoryModalKind
  selected: boolean
  onClick: () => void
  emoji: string
  label: string
}) {
  const tc = mx.factoryTone[tone]
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-[calc((100%-0.625rem)/2)] shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border p-3.5 text-center transition-colors min-h-[5.25rem]",
        selected ? tc.styleCardOn : cn("border-stone-200 hover:border-stone-300 dark:border-zinc-700", mx.surfaceTint)
      )}
    >
      <span className="text-xl leading-none">{emoji}</span>
      <span className="text-[12px] font-medium leading-tight text-zinc-800">{label}</span>
      {selected ? <Check className={cn("h-3.5 w-3.5", tc.check)} strokeWidth={3} /> : null}
    </button>
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
  const tc = mx.factoryTone[tone]
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
  const tc = mx.factoryTone[tone]
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
                selected ? tc.pillOn : "border-stone-200 bg-white text-zinc-700 hover:border-stone-300"
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

/** Create report — formats + suggested formats */
function ReportModal({
  onClose,
  onSubmitFactory,
}: {
  onClose: () => void
  onSubmitFactory?: (settings: FactoryGenerationSettings) => void
}) {
  const [reportPages, setReportPages] = useState(12)
  const tc = mx.factoryTone.report
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
  const tc = mx.factoryTone.flashcards
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
  const tc = mx.factoryTone.quiz
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
}: {
  onClose: () => void
  onSubmitFactory?: (settings: FactoryGenerationSettings) => void
}) {
  const [lang, setLang] = useState("English")
  const [orient, setOrient] = useState("landscape")
  const [style, setStyle] = useState("auto")
  const [detail, setDetail] = useState("standard")
  const [panelCount, setPanelCount] = useState(8)
  const [desc, setDesc] = useState("")
  const tc = mx.factoryTone.infographic
  return (
    <ModalFrame
      tone="infographic"
      title="Custom infographic"
      icon={<BarChart3 className="h-5 w-5" />}
      onClose={onClose}
      footer={
        <GenerateFooter
          onGenerate={() => onSubmitFactory?.({ infographicPanelCount: panelCount })}
          onClose={onClose}
        />
      }
    >
      <div className="mb-4">
        <p className="mb-1.5 text-[13px] text-zinc-500">Language</p>
        <div className="relative">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className={cn(
              "w-full appearance-none rounded-xl border border-stone-200 bg-white py-2.5 pl-3 pr-9 text-[14px] text-zinc-900",
              tc.fieldFocus
            )}
          >
            <option>English</option>
            <option>Chinese</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        </div>
      </div>
      <div className="mb-4">
        <p className="mb-2 text-[13px] text-zinc-500">Orientation</p>
        <div className="flex flex-wrap gap-2">
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
                "flex items-center gap-1.5 rounded-full border px-3 py-2 text-[13px] font-medium",
                orient === o.id ? tc.pillOn : "border-stone-200 bg-white text-zinc-700"
              )}
            >
              {orient === o.id && <Check className={cn("h-3.5 w-3.5", tc.check)} strokeWidth={3} />}
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <p className="mb-2 text-[13px] text-zinc-500">Visual style</p>
        <div className="flex gap-2.5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {infographicStyles.map((s) => (
            <FactoryStylePickCard
              key={s.id}
              tone="infographic"
              selected={style === s.id}
              onClick={() => setStyle(s.id)}
              emoji={s.emoji}
              label={s.label}
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
        <p className="mb-2 text-[13px] text-zinc-500">Describe the infographic</p>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={4}
          placeholder='Style, palette, or emphasis: "Use a blue theme and highlight three key stats."'
          className={cn(
            "w-full resize-none rounded-xl border border-stone-200 px-3 py-2.5 text-[14px] text-zinc-800 placeholder:text-zinc-400",
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
}: {
  onClose: () => void
  libraryName?: string
  onSubmitFactory?: (settings: FactoryGenerationSettings) => void
}) {
  const [format, setFormat] = useState("deep")
  const [lang, setLang] = useState("English")
  const [audioMinutes, setAudioMinutes] = useState(8)
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
  const tc = mx.factoryTone.audio
  return (
    <ModalFrame
      tone="audio"
      title="Custom audio overview"
      icon={<Volume2 className="h-5 w-5" />}
      onClose={onClose}
      footer={
        <GenerateFooter
          onGenerate={() => onSubmitFactory?.({ audioTargetMinutes: audioMinutes })}
          onClose={onClose}
        />
      }
    >
      <p className="mb-2 text-[13px] font-semibold text-zinc-900">Format</p>
      <div className={cn("mb-4", FACTORY_OPTION_GRID_CLASS)}>
        {formats.map((f) => (
          <FactoryOptionCard
            key={f.id}
            tone="audio"
            selected={format === f.id}
            onClick={() => setFormat(f.id)}
            title={f.title}
            description={f.desc}
          />
        ))}
      </div>
      <div className="mb-4">
        <p className="mb-1 text-[13px] text-zinc-500">Language</p>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className={cn(
            "w-full rounded-xl border border-stone-200 py-2 pl-2 pr-2 text-[13px]",
            tc.fieldFocus
          )}
        >
          <option>English</option>
          <option>Chinese</option>
        </select>
      </div>
      <SliderRow
        tone="audio"
        label="Target episode length"
        hint="Approximate finished audio duration."
        min={3}
        max={30}
        value={audioMinutes}
        onChange={setAudioMinutes}
        valueSuffix="min"
      />
      <div>
        <p className="mb-2 text-[13px] text-zinc-500">What should the hosts emphasize this episode?</p>
        <textarea
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          rows={FACTORY_TOPIC_TEXTAREA_ROWS}
          className={cn(
            "mb-3 w-full resize-none rounded-xl border border-stone-200 px-3 py-2 text-[14px] text-zinc-800",
            tc.fieldFocus
          )}
        />
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFocus((prev) => (prev ? `${prev}\n` : "") + t)}
              className="rounded-full border border-dashed border-stone-300 bg-stone-50 px-3 py-1.5 text-[12px] text-zinc-700 hover:bg-stone-100"
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
  const [lang, setLang] = useState("English")
  const [slidePages, setSlidePages] = useState(14)
  const [desc, setDesc] = useState("")
  const tc = mx.factoryTone.slides
  return (
    <ModalFrame
      tone="slides"
      title="Custom presentation"
      icon={<Presentation className="h-5 w-5" />}
      onClose={onClose}
      footer={
        <GenerateFooter
          onGenerate={() => onSubmitFactory?.({ slidesPageCount: slidePages })}
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
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className={cn("w-full rounded-xl border border-stone-200 py-2 text-[13px]", tc.fieldFocus)}
        >
          <option>English</option>
          <option>Chinese</option>
        </select>
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
            "w-full resize-none rounded-xl border border-stone-200 px-3 py-2 text-[14px] placeholder:text-zinc-400",
            tc.fieldFocus
          )}
        />
      </div>
    </ModalFrame>
  )
}

export function ContentFactoryModals({ open, onClose, libraryName, onGenerateSubmit }: ContentFactoryModalsProps) {
  if (!open) return null
  const submit =
    (kind: FactoryModalKind) => (settings: FactoryGenerationSettings) =>
      onGenerateSubmit?.(kind, settings)
  switch (open) {
    case "report":
      return <ReportModal onClose={onClose} onSubmitFactory={submit("report")} />
    case "audio":
      return <AudioModal onClose={onClose} libraryName={libraryName} onSubmitFactory={submit("audio")} />
    case "flashcards":
      return <FlashcardsModal onClose={onClose} onSubmitFactory={submit("flashcards")} />
    case "quiz":
      return <QuizModal onClose={onClose} onSubmitFactory={submit("quiz")} />
    case "infographic":
      return <InfographicModal onClose={onClose} onSubmitFactory={submit("infographic")} />
    case "slides":
      return <SlidesModal onClose={onClose} onSubmitFactory={submit("slides")} />
    default:
      return null
  }
}
