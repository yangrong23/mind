"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { ArrowRight, Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { webNavMotion } from "@/components/mind-v2/web-nav-motion"
import { MindarLogo } from "@/components/mind-v2/mindar-logo"
import { PlazaLibraryCover } from "@/components/mind-v2/plaza-library-cover"
import {
  formatPlazaSubscriber,
  plazaRowAgentLabel,
  plazaRowCardSummary,
  type PlazaLibraryRow,
} from "@/lib/mock-plaza-libraries"
import {
  ONBOARDING_GOAL_OPTIONS,
  ONBOARDING_TOPIC_OPTIONS,
  recommendPlazaLibraries,
  type OnboardingGoalId,
  type OnboardingTopicId,
} from "@/lib/web-library-onboarding"

type Step = "welcome" | "goal" | "topics" | "results"

function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300 ease-out",
            i === step ? "w-6 bg-mind" : i < step ? "w-1.5 bg-mind/40" : "w-1.5 bg-zinc-200"
          )}
        />
      ))}
    </div>
  )
}

function OptionCard({
  selected,
  label,
  hint,
  onClick,
}: {
  selected: boolean
  label: string
  hint?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-200 ease-out",
        selected
          ? "border-mind/30 bg-mind/5 ring-2 ring-mind/15"
          : "border-black/[0.06] bg-white/70 hover:border-black/[0.08] hover:bg-white",
        webNavMotion.pressable
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          selected ? "border-mind bg-mind text-white" : "border-zinc-300 bg-white"
        )}
      >
        {selected ? <Check className="h-3 w-3" strokeWidth={3} aria-hidden /> : null}
      </span>
      <span className="min-w-0">
        <span className="block text-[14px] font-semibold text-zinc-800">{label}</span>
        {hint ? <span className="mt-0.5 block text-[12px] leading-snug text-zinc-500">{hint}</span> : null}
      </span>
    </button>
  )
}

function ResultLibraryRow({
  row,
  selected,
  onToggle,
}: {
  row: PlazaLibraryRow
  selected: boolean
  onToggle: () => void
}) {
  const summary = plazaRowCardSummary(row)
  const agentLabel = plazaRowAgentLabel(row)

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        web.surfaceCardFlat,
        web.surfaceCardHover,
        "flex w-full gap-3 p-3 text-left transition-all duration-200",
        selected && "ring-2 ring-mind/20"
      )}
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center">
        <PlazaLibraryCover title={row.title} kbId={row.kbId} size="md" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold leading-snug text-zinc-900">{row.title}</p>
        <p className="mt-0.5 text-[11px] font-medium text-mind">With {agentLabel}</p>
        <p className="mt-1 line-clamp-2 text-[12px] text-zinc-500">{summary}</p>
      </div>
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border self-center",
          selected ? "border-mind bg-mind text-white" : "border-zinc-300"
        )}
      >
        {selected ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : null}
      </span>
    </button>
  )
}

export function WebLibraryOnboarding({
  onComplete,
  onSkip,
}: {
  onComplete: (rows: PlazaLibraryRow[]) => void
  onSkip: () => void
}) {
  const [step, setStep] = useState<Step>("welcome")
  const [goal, setGoal] = useState<OnboardingGoalId | null>(null)
  const [topics, setTopics] = useState<OnboardingTopicId[]>([])

  const recommendations = useMemo(() => {
    if (!goal) return []
    return recommendPlazaLibraries(goal, topics, 4)
  }, [goal, topics])

  const [selectedKbIds, setSelectedKbIds] = useState<Set<number>>(() => new Set())

  const stepIndex =
    step === "welcome" ? 0 : step === "goal" ? 1 : step === "topics" ? 2 : 3
  const totalSteps = 4

  function toggleTopic(id: OnboardingTopicId) {
    setTopics((prev) => {
      if (prev.includes(id)) return prev.filter((t) => t !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  function goResults() {
    if (!goal) return
    const recs = recommendPlazaLibraries(goal, topics, 4)
    setSelectedKbIds(new Set(recs.map((r) => r.kbId)))
    setStep("results")
  }

  function finish() {
    const rows = recommendations.filter((r) => selectedKbIds.has(r.kbId))
    if (rows.length === 0) {
      toast.error("Pick at least one library")
      return
    }
    onComplete(rows)
  }

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", web.shell)}>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-5 py-8 sm:px-8">
        <div
          className={cn(
            "w-full max-w-[480px]",
            web.surfaceCard,
            "px-6 py-8 sm:px-8 sm:py-10",
            webNavMotion.contentEnter
          )}
        >
          <div className="mb-6 flex flex-col items-center text-center">
            <MindarLogo height={32} className="max-w-[6.5rem]" />
            <div className="mt-5">
              <ProgressDots step={stepIndex} total={totalSteps} />
            </div>
          </div>

          {step === "welcome" && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out">
              <h1 className="text-center text-[24px] font-semibold tracking-tight text-zinc-900">
                Welcome to Mindar
              </h1>
              <p className="mx-auto mt-2 max-w-[340px] text-center text-[14px] leading-relaxed text-zinc-500">
                Answer two quick questions and we&apos;ll recommend public libraries to follow — you can
                change these anytime.
              </p>
              <button
                type="button"
                onClick={() => setStep("goal")}
                className={cn(
                  "mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-zinc-800",
                  webNavMotion.pressable
                )}
              >
                Get started
                <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>
            </div>
          )}

          {step === "goal" && (
            <div className="animate-in fade-in-0 slide-in-from-right-2 duration-300 ease-out">
              <h2 className="text-center text-[18px] font-semibold text-zinc-900">What brings you here?</h2>
              <p className="mt-1 text-center text-[13px] text-zinc-500">Pick the closest match</p>
              <ul className="mt-5 space-y-2">
                {ONBOARDING_GOAL_OPTIONS.map((opt) => (
                  <li key={opt.id}>
                    <OptionCard
                      selected={goal === opt.id}
                      label={opt.label}
                      hint={opt.hint}
                      onClick={() => setGoal(opt.id)}
                    />
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("welcome")}
                  className="flex-1 rounded-xl border border-black/[0.06] py-3 text-[14px] font-medium text-zinc-600 hover:bg-zinc-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!goal}
                  onClick={() => setStep("topics")}
                  className="flex-1 rounded-xl bg-zinc-900 py-3 text-[14px] font-semibold text-white hover:bg-zinc-800 disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === "topics" && (
            <div className="animate-in fade-in-0 slide-in-from-right-2 duration-300 ease-out">
              <h2 className="text-center text-[18px] font-semibold text-zinc-900">Topics you care about</h2>
              <p className="mt-1 text-center text-[13px] text-zinc-500">Choose up to 3</p>
              <ul className="mt-5 flex flex-wrap justify-center gap-2">
                {ONBOARDING_TOPIC_OPTIONS.map((opt) => {
                  const active = topics.includes(opt.id)
                  return (
                    <li key={opt.id}>
                      <button
                        type="button"
                        onClick={() => toggleTopic(opt.id)}
                        className={cn(
                          "rounded-full px-3.5 py-2 text-[13px] font-medium transition-all duration-200",
                          active
                            ? "bg-mind/10 text-mind ring-1 ring-mind/25"
                            : "bg-white/80 text-zinc-600 ring-1 ring-black/[0.06] hover:bg-white"
                        )}
                      >
                        {opt.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("goal")}
                  className="flex-1 rounded-xl border border-black/[0.06] py-3 text-[14px] font-medium text-zinc-600 hover:bg-zinc-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goResults}
                  className="flex-1 rounded-xl bg-zinc-900 py-3 text-[14px] font-semibold text-white hover:bg-zinc-800"
                >
                  See libraries
                </button>
              </div>
            </div>
          )}

          {step === "results" && (
            <div className="animate-in fade-in-0 slide-in-from-right-2 duration-300 ease-out">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <Sparkles className="h-3.5 w-3.5 text-mind" strokeWidth={2} aria-hidden />
                For you
              </div>
              <h2 className="mt-2 text-center text-[18px] font-semibold text-zinc-900">
                Libraries we recommend
              </h2>
              <p className="mt-1 text-center text-[13px] text-zinc-500">
                Follow to start chatting with library agents
              </p>
              <ul className="mt-5 max-h-[min(42vh,360px)] space-y-2 overflow-y-auto pr-0.5">
                {recommendations.map((row) => (
                  <li key={row.kbId}>
                    <ResultLibraryRow
                      row={row}
                      selected={selectedKbIds.has(row.kbId)}
                      onToggle={() =>
                        setSelectedKbIds((prev) => {
                          const next = new Set(prev)
                          if (next.has(row.kbId)) next.delete(row.kbId)
                          else next.add(row.kbId)
                          return next
                        })
                      }
                    />
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-center text-[11px] text-zinc-400">
                {formatPlazaSubscriber(recommendations[0]?.subscriberCount ?? 0)}+ learners on Mindar
              </p>
              <button
                type="button"
                onClick={finish}
                className={cn(
                  "mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3.5 text-[15px] font-semibold text-white hover:bg-zinc-800",
                  webNavMotion.pressable
                )}
              >
                Follow {selectedKbIds.size} librar{selectedKbIds.size === 1 ? "y" : "ies"}
                <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setStep("topics")}
                className="mt-2 w-full py-2 text-[13px] font-medium text-zinc-500 hover:text-zinc-700"
              >
                Refine topics
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onSkip}
            className="mt-6 w-full text-center text-[13px] font-medium text-zinc-400 transition-colors hover:text-zinc-600"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
