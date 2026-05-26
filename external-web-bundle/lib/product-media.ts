/** Branded library cover art — replaces random stock photos in demo data. */
export type LibraryCoverVariant =
  | "product"
  | "study"
  | "reading"
  | "engineering"
  | "design"
  | "research"
  | "education"
  | "health"
  | "tech"
  | "work"
  | "finance"
  | "legal"
  | "humanities"
  | "lifestyle"
  | "default"

export type HubItemKind = "pdf" | "document" | "note" | "link" | "audio" | "slides" | "text"

export type DashboardContentKind = "strategy" | "research" | "market"

/** Landing / marketing screenshot scenes — map to live UI previews */
export type ProductScreenshotScene =
  | "dashboard"
  | "library-grid"
  | "library-workspace"
  | "agent-copilot"
  | "notebook-sources"
  | "notebook-studio"
  | "upload-guide"
  | "plaza"
  | "capture-mobile"
  | "study"
  | "work"
  | "project"
  | "inspire"
  | "team"
  | "personal"

export function libraryCoverVariantForId(id: number, name: string): LibraryCoverVariant {
  const n = name.toLowerCase()
  if (n.includes("product")) return "product"
  if (n.includes("study") || n.includes("course")) return "study"
  if (n.includes("read")) return "reading"
  if (n.includes("engineer") || n.includes("adr")) return "engineering"
  if (n.includes("design")) return "design"
  if (n.includes("research") || n.includes("paper")) return "research"
  if (n.includes("edu") || n.includes("class")) return "education"
  if (n.includes("health") || n.includes("clinical")) return "health"
  if (n.includes("tech") || n.includes("ai")) return "tech"
  if (n.includes("work") || n.includes("team")) return "work"
  if (n.includes("financ")) return "finance"
  if (n.includes("law") || n.includes("legal")) return "legal"
  if (n.includes("human")) return "humanities"
  if (n.includes("life")) return "lifestyle"
  const variants: LibraryCoverVariant[] = [
    "product",
    "study",
    "reading",
    "engineering",
    "design",
    "research",
  ]
  return variants[id % variants.length] ?? "default"
}

export function hubItemKindFromLabel(
  sourceOrType: string,
  title?: string
): HubItemKind {
  const s = `${sourceOrType} ${title ?? ""}`.toLowerCase()
  if (s.includes("pdf")) return "pdf"
  if (s.includes("audio") || s.includes("podcast")) return "audio"
  if (s.includes("slide") || s.includes("deck")) return "slides"
  if (s.includes("link") || s.includes("url") || s.includes("web")) return "link"
  if (s.includes("note") || s.includes("text") || s.includes("paste")) return "note"
  if (s.includes("doc") || s.includes("word")) return "document"
  return "document"
}

export function initialsFromName(name: string, max = 2): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, max).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
