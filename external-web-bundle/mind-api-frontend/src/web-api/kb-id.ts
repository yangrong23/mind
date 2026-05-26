/** Map backend string KB ids ↔ numeric ids used by web UI components */
const apiIdByNumeric = new Map<number, string>()
const numericByApiId = new Map<string, number>()

export function numericKbIdFromApiId(apiId: string): number {
  const existing = numericByApiId.get(apiId)
  if (existing != null) return existing

  let h = 0
  for (let i = 0; i < apiId.length; i++) {
    h = (Math.imul(31, h) + apiId.charCodeAt(i)) | 0
  }
  const numeric = (Math.abs(h) % 900_000_000) + 1
  numericByApiId.set(apiId, numeric)
  apiIdByNumeric.set(numeric, apiId)
  return numeric
}

export function apiKbIdFromNumeric(numericId: number): string | undefined {
  return apiIdByNumeric.get(numericId)
}

export function registerKbIdPair(apiId: string, numericId: number) {
  numericByApiId.set(apiId, numericId)
  apiIdByNumeric.set(numericId, apiId)
}
