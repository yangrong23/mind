import type { WebTabType } from "@/components/mind-v2/web-sidebar-nav"

export const WEB_APP_ROOT = "/web"

export type WebShellTab = WebTabType

/** Parsed location for MindAppWeb — pathname is source of truth. */
export type ParsedWebLocation =
  | { mode: "tab"; tab: WebShellTab; kbId?: number; noteId?: number }
  | { mode: "settings" }
  | {
      mode: "kb"
      kbId: number
      screen: "detail"
      initialOpenTeamInfo?: boolean
      initialFocusStudio?: boolean
      initialOpenContentId?: number
    }
  | { mode: "kb"; kbId: number; screen: "chat"; initialPrompt?: string }
  | { mode: "kb"; kbId: number; screen: "rich-editor" }
  | { mode: "kb"; kbId: number; screen: "doc"; docId: number }
  | { mode: "kb"; kbId: number; screen: "content-editor"; docTitle?: string }
  | {
      mode: "agent-chat"
      agentId: number
      initialPrompt?: string
      kbId?: number
      noteId?: number
    }
  | { mode: "me-timeline" }
  | { mode: "me-timeline-day"; isoDate: string; activity: number; returnTo: "me" | "me-timeline" }
  | { mode: "legacy-editor"; docTitle?: string }

export function webTabHref(tab: WebShellTab, query?: { kb?: number; note?: number }): string {
  const base =
    tab === "agent"
      ? `${WEB_APP_ROOT}/agent`
      : tab === "memos"
        ? `${WEB_APP_ROOT}/notes`
        : `${WEB_APP_ROOT}/${tab}`
  const params = new URLSearchParams()
  if (query?.kb != null) params.set("kb", String(query.kb))
  if (query?.note != null) params.set("note", String(query.note))
  const q = params.toString()
  return q ? `${base}?${q}` : base
}

export function webKbHref(
  kbId: number,
  screen: "detail" | "chat" | "rich-editor" | "doc" | "content-editor" = "detail",
  extra?: {
    docId?: number
    docTitle?: string
    initialPrompt?: string
    initialOpenTeamInfo?: boolean
    initialFocusStudio?: boolean
    initialOpenContentId?: number
  }
): string {
  switch (screen) {
    case "detail": {
      const params = new URLSearchParams()
      if (extra?.initialOpenTeamInfo) params.set("team", "1")
      if (extra?.initialFocusStudio) params.set("studio", "1")
      if (extra?.initialOpenContentId != null)
        params.set("content", String(extra.initialOpenContentId))
      const q = params.toString()
      return q ? `${WEB_APP_ROOT}/kb/${kbId}?${q}` : `${WEB_APP_ROOT}/kb/${kbId}`
    }
    case "chat":
      return webMindarChatHref({ kb: kbId, q: extra?.initialPrompt })
    case "rich-editor":
      return `${WEB_APP_ROOT}/kb/${kbId}/edit`
    case "doc":
      return `${WEB_APP_ROOT}/kb/${kbId}/doc/${extra?.docId ?? 0}`
    case "content-editor": {
      const params = new URLSearchParams()
      if (extra?.docTitle) params.set("title", extra.docTitle)
      const q = params.toString()
      return q
        ? `${WEB_APP_ROOT}/kb/${kbId}/content-editor?${q}`
        : `${WEB_APP_ROOT}/kb/${kbId}/content-editor`
    }
  }
}

/** @deprecated Legacy per-agent URLs — use webMindarChatHref */
export function webAgentChatHref(agentId: number): string {
  return `${WEB_APP_ROOT}/agent/${agentId}`
}

/** Single Mindar agent chat — optional KB / note scope via query. */
export function webMindarChatHref(query?: {
  kb?: number
  note?: number
  q?: string
}): string {
  const params = new URLSearchParams()
  if (query?.kb != null) params.set("kb", String(query.kb))
  if (query?.note != null) params.set("note", String(query.note))
  if (query?.q) params.set("q", query.q)
  const qs = params.toString()
  return qs ? `${WEB_APP_ROOT}/agent?${qs}` : `${WEB_APP_ROOT}/agent`
}

export function webMeTimelineHref(): string {
  return `${WEB_APP_ROOT}/me/timeline`
}

export function webMeTimelineDayHref(
  isoDate: string,
  activity: number,
  returnTo: "me" | "me-timeline"
): string {
  const params = new URLSearchParams({
    activity: String(activity),
    from: returnTo,
  })
  return `${WEB_APP_ROOT}/me/timeline/${encodeURIComponent(isoDate)}?${params}`
}

export function webSettingsHref(): string {
  return `${WEB_APP_ROOT}/settings`
}

/** Parent href for explicit back when history is empty. */
export function webParentHref(loc: ParsedWebLocation): string {
  switch (loc.mode) {
    case "tab":
      return webTabHref(loc.tab)
    case "settings":
      return webTabHref("agent")
    case "kb":
      if (loc.screen === "detail") return webTabHref("library", { kb: loc.kbId })
      if (loc.screen === "chat") return webKbHref(loc.kbId, "detail")
      if (loc.screen === "rich-editor" || loc.screen === "content-editor" || loc.screen === "doc")
        return webKbHref(loc.kbId, "detail")
      return webTabHref("library")
    case "agent-chat":
      if (loc.kbId != null) return webKbHref(loc.kbId, "detail")
      if (loc.noteId != null) return webTabHref("memos", { note: loc.noteId })
      return webTabHref("agent")
    case "me-timeline":
      return webTabHref("me")
    case "me-timeline-day":
      return loc.returnTo === "me-timeline" ? webMeTimelineHref() : webTabHref("me")
    case "legacy-editor":
      return webTabHref("library")
  }
}

export function parseWebPath(pathname: string, search = ""): ParsedWebLocation {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
  const rest = pathname.replace(/\/$/, "").slice(WEB_APP_ROOT.length) || ""
  const segments = rest.split("/").filter(Boolean)

  if (segments.length === 0) {
    return { mode: "tab", tab: "agent" }
  }

  if (segments[0] === "settings") {
    return { mode: "settings" }
  }

  if (segments[0] === "plaza") {
    return { mode: "tab", tab: "plaza" }
  }

  if (segments[0] === "library") {
    const kb = parseIntParam(params.get("kb"))
    return { mode: "tab", tab: "library", ...(kb != null ? { kbId: kb } : {}) }
  }

  if (segments[0] === "notes") {
    const note = parseIntParam(params.get("note"))
    return { mode: "tab", tab: "memos", ...(note != null ? { noteId: note } : {}) }
  }

  if (segments[0] === "agent") {
    const kbId = parseIntParam(params.get("kb"))
    const noteId = parseIntParam(params.get("note"))
    const q = params.get("q")
    const prompt = q ? { initialPrompt: q } : {}
    if (segments.length >= 2) {
      const legacyAgentId = parseInt(segments[1], 10)
      if (!Number.isNaN(legacyAgentId)) {
        return {
          mode: "agent-chat",
          agentId: 0,
          ...prompt,
          ...(kbId != null ? { kbId } : {}),
          ...(noteId != null ? { noteId } : {}),
        }
      }
    }
    if (kbId != null || noteId != null || q) {
      return {
        mode: "agent-chat",
        agentId: 0,
        ...prompt,
        ...(kbId != null ? { kbId } : {}),
        ...(noteId != null ? { noteId } : {}),
      }
    }
    return { mode: "tab", tab: "agent" }
  }

  if (segments[0] === "me") {
    if (segments[1] === "timeline") {
      if (segments.length >= 3) {
        const isoDate = decodeURIComponent(segments[2])
        const activity = parseIntParam(params.get("activity")) ?? 0
        const from = params.get("from") === "me-timeline" ? "me-timeline" : "me"
        return { mode: "me-timeline-day", isoDate, activity, returnTo: from }
      }
      return { mode: "me-timeline" }
    }
    return { mode: "tab", tab: "me" }
  }

  if (segments[0] === "kb" && segments.length >= 2) {
    const kbId = parseInt(segments[1], 10)
    if (Number.isNaN(kbId)) return { mode: "tab", tab: "library" }

    if (segments[2] === "chat") {
      const q = params.get("q")
      return {
        mode: "agent-chat",
        agentId: 0,
        kbId,
        ...(q ? { initialPrompt: q } : {}),
      }
    }
    if (segments[2] === "edit") return { mode: "kb", kbId, screen: "rich-editor" }
    if (segments[2] === "doc" && segments.length >= 4) {
      const docId = parseInt(segments[3], 10)
      if (!Number.isNaN(docId)) return { mode: "kb", kbId, screen: "doc", docId }
    }
    if (segments[2] === "content-editor") {
      return { mode: "kb", kbId, screen: "content-editor", docTitle: params.get("title") ?? undefined }
    }
    return {
      mode: "kb",
      kbId,
      screen: "detail",
      ...(params.get("team") === "1" ? { initialOpenTeamInfo: true } : {}),
      ...(params.get("studio") === "1" ? { initialFocusStudio: true } : {}),
      ...(parseIntParam(params.get("content")) != null
        ? { initialOpenContentId: parseIntParam(params.get("content"))! }
        : {}),
    }
  }

  if (segments[0] === "editor") {
    return { mode: "legacy-editor", docTitle: params.get("title") ?? undefined }
  }

  return { mode: "tab", tab: "agent" }
}

function parseIntParam(value: string | null): number | undefined {
  if (value == null || value === "") return undefined
  const n = parseInt(value, 10)
  return Number.isNaN(n) ? undefined : n
}
