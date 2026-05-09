"use client"

import type { LucideIcon } from "lucide-react"
import {
  BookOpen,
  GraduationCap,
  BookMarked,
  Code2,
  Palette,
  Bot,
  TrendingUp,
  LineChart,
  Package,
  Newspaper,
  Mic,
  UserSearch,
} from "lucide-react"

/**
 * Picks a Lucide icon from the knowledge base title (and optional description)
 * so lists stay scannable without per-row manual config.
 */
export function knowledgeBaseIconForTitle(name: string, description?: string): LucideIcon {
  const t = `${name} ${description ?? ""}`.toLowerCase()

  if (/\b(equit|equities|stock|market|invest|investing|fund|finance|trading|forex|bond)\b/.test(t)) {
    return LineChart
  }
  if (/\b(ai|ml|llm|gpt|neural|chatgpt|openai|llama|tooling|agents?|curated ai)\b/.test(t)) {
    return Bot
  }
  if (/\b(design|ui\b|ux\b|figma|visual|brand|typography|component)\b/.test(t)) {
    return Palette
  }
  if (
    /\b(engineer|engineering|code|coding|adr|playbook|devops|api\b|backend|frontend|technical|docs?\b)\b/.test(t)
  ) {
    return Code2
  }
  if (/\b(study|studies|learn|learning|course|exam|tutorial|classroom|education|academic)\b/.test(t)) {
    return GraduationCap
  }
  if (/\b(read|reading|book|books|quote|essay|novel|literature)\b/.test(t)) {
    return BookMarked
  }
  if (/\b(digest|newsletter|curated|weekly wrap|roundup)\b/.test(t)) {
    return Newspaper
  }
  if (/\b(meeting|meetings|standup|retro|call notes)\b/.test(t)) {
    return Mic
  }
  if (/(user research|ux research|\bresearch\b|interviews?|surveys?)/.test(t)) {
    return UserSearch
  }
  if (/(\bpm\b|product manager|product craft|\bgrowth\b|strategy|\broadmap\b)/.test(t)) {
    return TrendingUp
  }
  if (/\b(product|prd|spec|requirements?|feature)\b/.test(t)) {
    return Package
  }
  return BookOpen
}
