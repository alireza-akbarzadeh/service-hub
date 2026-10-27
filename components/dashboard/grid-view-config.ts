"use client"

export type ViewMode = "table" | "card"

export interface GridConfig {
  viewMode: ViewMode
  cardColumns: "auto" | "2" | "3" | "4"
  cardDensity: "comfortable" | "compact"
  showTags: boolean
  showTelemetry: boolean
  showHops: boolean
  showOwner: boolean
}

export const DEFAULT_GRID_CONFIG: GridConfig = {
  viewMode: "table",
  cardColumns: "auto",
  cardDensity: "comfortable",
  showTags: true,
  showTelemetry: true,
  showHops: true,
  showOwner: true,
}

const STORAGE_KEY = "service_hub_grid_config"

export function loadGridConfig(): GridConfig {
  if (typeof window === "undefined") return DEFAULT_GRID_CONFIG
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_GRID_CONFIG
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_GRID_CONFIG,
      ...parsed,
    }
  } catch {
    return DEFAULT_GRID_CONFIG
  }
}

export function saveGridConfig(config: GridConfig): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {}
}
