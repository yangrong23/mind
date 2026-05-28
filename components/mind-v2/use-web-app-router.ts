"use client"

import { useCallback, useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { Agent } from "@/components/mind-v2/agent-tab"
import { MINDAR_COPILOT_AGENT } from "@/components/mind-v2/agent-tab"
import type { KbLibraryDocument } from "@/components/mind-v2/knowledge-detail"
import type { WebTabType } from "@/components/mind-v2/web-sidebar-nav"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import { mockNotes } from "@/lib/mock-notes"
import type { AgentChatScope } from "@/lib/web-agent-scope"
import { readCachedKbDocument } from "@/lib/web-kb-document-cache"
import {
  parseWebPath,
  webKbHref,
  webMeTimelineDayHref,
  webMeTimelineHref,
  webMindarChatHref,
  webParentHref,
  webSettingsHref,
  webTabHref,
  type ParsedWebLocation,
} from "@/lib/web-app-routes"

export type WebView =
  | { type: "shell" }
  | {
      type: "notebook"
      kb: KbDetailPayload
      initialFactoryModal?: import("@/components/mind-v2/content-factory-modals").FactoryModalKind
      initialOpenTeamInfo?: boolean
      initialOpenContentId?: number
      initialFocusStudio?: boolean
    }
  | {
      type: "agent-chat"
      agent: Agent
      initialPrompt?: string
      chatScope: AgentChatScope
      kbContext?: KbDetailPayload
    }
  | { type: "editor"; docTitle?: string }
  | { type: "kb-document"; kb: KbDetailPayload; document: KbLibraryDocument }
  | { type: "kb-rich-editor"; kb: KbDetailPayload }
  | { type: "me-timeline" }
  | {
      type: "me-timeline-day"
      isoDate: string
      activity: number
      returnTo: "me" | "me-timeline"
    }

// Re-export payload type for route builder — avoid circular import by duplicating minimal shape
export type KbDetailPayload = {
  id?: number
  name: string
  color: string
  description?: string
  coverVariant?: import("@/lib/product-media").LibraryCoverVariant
  isPublicKb?: boolean
  contentCount?: number
  subscriberCount?: number
  viewCount?: number
  publicTagline?: string
  publisherName?: string
  initialLikeCount?: number
  initialCommentCount?: number
  category?: import("@/lib/mock-knowledge-bases").KBCategory
  teamSettings?: import("@/lib/mock-knowledge-bases").TeamLibrarySettings
  isPublicPublished?: boolean
  publicSettings?: import("@/lib/public-kb-settings").PublicKbSettings
}

export function kbToDetailPayload(kb: KnowledgeBase): KbDetailPayload {
  return {
    id: kb.id,
    name: kb.name,
    color: kb.color,
    description: kb.description,
    coverVariant: kb.coverVariant,
    isPublicKb: kb.category === "subscribed" || Boolean(kb.isPublicPublished),
    contentCount: kb.count,
    subscriberCount: kb.subscribers,
    viewCount: kb.viewCount,
    publicTagline: kb.publicTagline,
    publisherName: kb.publisherName,
    initialLikeCount: kb.likeCount,
    initialCommentCount: kb.commentCount,
    category: kb.category,
    teamSettings: kb.teamSettings,
    isPublicPublished: kb.isPublicPublished,
    publicSettings: kb.publicSettings,
  }
}

function stubDocument(docId: number): KbLibraryDocument {
  return {
    id: docId,
    title: "Document",
    excerpt: "",
    source: "File",
    author: "Library",
    date: "—",
  }
}

function resolveChatScope(
  location: Extract<ParsedWebLocation, { mode: "agent-chat" }>,
  allKbsById: Map<number, KnowledgeBase>
): AgentChatScope {
  if (location.noteId != null) {
    const note = mockNotes.find((n) => n.id === location.noteId)
    return {
      type: "note",
      noteId: location.noteId,
      noteTitle: note?.title ?? "Note",
    }
  }
  if (location.kbId != null) {
    const kb = allKbsById.get(location.kbId)
    return {
      type: "kb",
      kbId: location.kbId,
      kbName: kb?.name ?? "Library",
      isPublicKb: kb?.category === "subscribed" || Boolean(kb?.isPublicPublished),
    }
  }
  return { type: "global" }
}

function locationToView(
  location: ParsedWebLocation,
  allKbsById: Map<number, KnowledgeBase>
): WebView {
  switch (location.mode) {
    case "tab":
      return { type: "shell" }
    case "settings":
      return { type: "shell" }
    case "me-timeline":
      return { type: "me-timeline" }
    case "me-timeline-day":
      return {
        type: "me-timeline-day",
        isoDate: location.isoDate,
        activity: location.activity,
        returnTo: location.returnTo,
      }
    case "agent-chat": {
      const chatScope = resolveChatScope(location, allKbsById)
      const kb =
        chatScope.type === "kb" ? allKbsById.get(chatScope.kbId) : undefined
      return {
        type: "agent-chat",
        agent: MINDAR_COPILOT_AGENT,
        initialPrompt: location.initialPrompt,
        chatScope,
        ...(kb ? { kbContext: kbToDetailPayload(kb) } : {}),
      }
    }
    case "kb": {
      const kb = allKbsById.get(location.kbId)
      if (!kb) return { type: "shell" }
      const payload = kbToDetailPayload(kb)
      switch (location.screen) {
        case "detail":
          return {
            type: "notebook",
            kb: payload,
            initialOpenTeamInfo: location.initialOpenTeamInfo,
            initialFocusStudio: location.initialFocusStudio,
            initialOpenContentId: location.initialOpenContentId,
          }
        case "chat":
          return {
            type: "agent-chat",
            agent: MINDAR_COPILOT_AGENT,
            initialPrompt: location.initialPrompt,
            chatScope: {
              type: "kb",
              kbId: kb.id,
              kbName: kb.name,
              isPublicKb: kb.category === "subscribed" || Boolean(kb.isPublicPublished),
            },
            kbContext: payload,
          }
        case "rich-editor":
          return { type: "kb-rich-editor", kb: payload }
        case "doc": {
          const cached = readCachedKbDocument(location.kbId, location.docId)
          return {
            type: "kb-document",
            kb: payload,
            document: cached ?? stubDocument(location.docId),
          }
        }
        case "content-editor":
          return { type: "editor", docTitle: location.docTitle }
      }
    }
    case "legacy-editor":
      return { type: "editor", docTitle: location.docTitle }
    default:
      return { type: "shell" }
  }
}

function activeTabFromLocation(location: ParsedWebLocation): WebTabType {
  switch (location.mode) {
    case "tab":
      return location.tab
    case "agent-chat":
      return "agent"
    case "kb":
      return "library"
    case "me-timeline":
    case "me-timeline-day":
      return "me"
    case "settings":
      return "agent"
    default:
      return "agent"
  }
}

export function useWebAppRouter(allKbsById: Map<number, KnowledgeBase>) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const location = useMemo(
    () => parseWebPath(pathname, searchParams.toString() ? `?${searchParams.toString()}` : ""),
    [pathname, searchParams]
  )

  const currentView = useMemo(() => locationToView(location, allKbsById), [location, allKbsById])
  const activeTab = useMemo(() => activeTabFromLocation(location), [location])
  const settingsOpen = location.mode === "settings"
  const shellMain = currentView.type === "shell"

  const navigate = useCallback(
    (href: string, replace = false) => {
      if (replace) router.replace(href)
      else router.push(href)
    },
    [router]
  )

  const goToParent = useCallback(() => {
    router.push(webParentHref(location))
  }, [location, router])

  return {
    location,
    currentView,
    activeTab,
    settingsOpen,
    shellMain,
    navigate,
    goToParent,
    switchTab: (tab: WebTabType, query?: { kb?: number; note?: number }) =>
      navigate(webTabHref(tab, query)),
    openNotebook: (
      kb: KnowledgeBase,
      options?: { openTeamInfo?: boolean; initialFocusStudio?: boolean }
    ) =>
      navigate(
        webKbHref(kb.id, "detail", {
          initialOpenTeamInfo: options?.openTeamInfo,
          initialFocusStudio: options?.initialFocusStudio,
        })
      ),
    closeNotebook: () => goToParent(),
    openAgentChat: (_agent: Agent, initialPrompt?: string, scope?: AgentChatScope) => {
      const href =
        scope?.type === "kb"
          ? webMindarChatHref({ kb: scope.kbId, q: initialPrompt })
          : scope?.type === "note"
            ? webMindarChatHref({ note: scope.noteId, q: initialPrompt })
            : initialPrompt
              ? webMindarChatHref({ q: initialPrompt })
              : webTabHref("agent")
      navigate(href)
    },
    openKbChat: (kbId: number, initialPrompt?: string) =>
      navigate(webMindarChatHref({ kb: kbId, q: initialPrompt })),
    openMeTimeline: () => navigate(webMeTimelineHref()),
    openMeTimelineDay: (
      day: { isoDate: string; activity: number },
      returnTo: "me" | "me-timeline"
    ) => navigate(webMeTimelineDayHref(day.isoDate, day.activity, returnTo)),
    openSettings: () => navigate(webSettingsHref()),
    closeSettings: () => goToParent(),
    selectLibraryKb: (kbId: number | null) =>
      navigate(webTabHref("library", kbId != null ? { kb: kbId } : undefined), true),
    selectNote: (noteId: number) => navigate(webTabHref("memos", { note: noteId })),
  }
}
