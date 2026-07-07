/** NotebookLM-style link sources for library material ingest (demo). */

export type LibraryLinkKind = "web" | "youtube" | "podcast"

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
])

const PODCAST_HINTS = ["podcasts.apple.com", "open.spotify.com/episode", "open.spotify.com/show", "overcast.fm", "pocketcasts.com"]

export function detectLibraryLinkKind(url: string): LibraryLinkKind {
  try {
    const host = new URL(url.trim()).hostname.replace(/^www\./, "")
    const fullHost = new URL(url.trim()).hostname.toLowerCase()
    if (YOUTUBE_HOSTS.has(fullHost) || host === "youtu.be") return "youtube"
    if (PODCAST_HINTS.some((h) => fullHost.includes(h.replace(/^www\./, "")))) return "podcast"
  } catch {
    /* fall through */
  }
  return "web"
}

export function sourceLabelForLinkKind(kind: LibraryLinkKind): string {
  switch (kind) {
    case "youtube":
      return "YouTube"
    case "podcast":
      return "Podcast"
    default:
      return "Link"
  }
}

export function titleFromLinkUrl(url: string, kind: LibraryLinkKind): string {
  try {
    const parsed = new URL(url.trim())
    if (kind === "youtube") {
      const id = parsed.searchParams.get("v") ?? parsed.pathname.replace(/^\//, "")
      return id ? `YouTube · ${id.slice(0, 11)}` : "YouTube video"
    }
    return parsed.hostname.replace(/^www\./, "")
  } catch {
    return url.trim().slice(0, 48)
  }
}

export function promptForLibraryLink(kind: LibraryLinkKind): string | null {
  const hints: Record<LibraryLinkKind, string> = {
    web: "Paste a website or article URL",
    youtube: "Paste a YouTube video URL (youtube.com or youtu.be)",
    podcast: "Paste a podcast episode URL (Apple Podcasts, Spotify, etc.)",
  }
  return window.prompt(hints[kind])?.trim() ?? null
}
