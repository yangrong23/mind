/** Persisted UI scale for the Mind v2 phone shell (affects layout zoom). */
export const MIND_FONT_ZOOM_STORAGE_KEY = "mind-v2-font-zoom-percent"

export const MIND_FONT_ZOOM_MIN = 85
export const MIND_FONT_ZOOM_MAX = 130
export const MIND_FONT_ZOOM_DEFAULT = 100

export function clampFontZoomPercent(n: number): number {
  if (!Number.isFinite(n)) return MIND_FONT_ZOOM_DEFAULT
  return Math.min(MIND_FONT_ZOOM_MAX, Math.max(MIND_FONT_ZOOM_MIN, Math.round(n)))
}

export function readStoredFontZoomPercent(): number {
  if (typeof window === "undefined") return MIND_FONT_ZOOM_DEFAULT
  try {
    const raw = localStorage.getItem(MIND_FONT_ZOOM_STORAGE_KEY)
    if (raw == null || raw === "") return MIND_FONT_ZOOM_DEFAULT
    return clampFontZoomPercent(Number.parseInt(raw, 10))
  } catch {
    return MIND_FONT_ZOOM_DEFAULT
  }
}

export function writeStoredFontZoomPercent(n: number) {
  try {
    localStorage.setItem(MIND_FONT_ZOOM_STORAGE_KEY, String(clampFontZoomPercent(n)))
  } catch {
    /* ignore */
  }
}
