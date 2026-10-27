"use client"

export type ViewShape = "table" | "row-card" | "square-card"
export type ViewMode = ViewShape | "card" // Backwards compatibility for older stored configs

export interface GridConfig {
  viewMode: ViewMode
  viewShape: ViewShape
  cardColumns: "auto" | "2" | "3" | "4"
  cardDensity: "comfortable" | "compact"
  showTags: boolean
  showTelemetry: boolean
  showHops: boolean
  showOwner: boolean
  showDescription: boolean
  defaultPageSize: number
}

export const DEFAULT_GRID_CONFIG: GridConfig = {
  viewMode: "table",
  viewShape: "table",
  cardColumns: "auto",
  cardDensity: "comfortable",
  showTags: true,
  showTelemetry: true,
  showHops: true,
  showOwner: true,
  showDescription: true,
  defaultPageSize: 10,
}

export const STORAGE_KEY = "service_hub_grid_config"
export const CONFIG_CHANGED_EVENT = "service_hub_config_changed"

/**
 * Normalizes any stored config to ensure viewShape and all fields are valid.
 */
export function normalizeConfig(parsed: Partial<GridConfig> | null | undefined): GridConfig {
  if (!parsed || typeof parsed !== "object") {
    return { ...DEFAULT_GRID_CONFIG }
  }

  // Determine viewShape
  let shape: ViewShape = DEFAULT_GRID_CONFIG.viewShape
  if (parsed.viewShape === "table" || parsed.viewShape === "row-card" || parsed.viewShape === "square-card") {
    shape = parsed.viewShape
  } else if ((parsed as any).viewMode === "table") {
    shape = "table"
  } else if ((parsed as any).viewMode === "card") {
    shape = "square-card"
  }

  const columns =
    parsed.cardColumns === "2" || parsed.cardColumns === "3" || parsed.cardColumns === "4" || parsed.cardColumns === "auto"
      ? parsed.cardColumns
      : DEFAULT_GRID_CONFIG.cardColumns

  const density =
    parsed.cardDensity === "compact" || parsed.cardDensity === "comfortable"
      ? parsed.cardDensity
      : DEFAULT_GRID_CONFIG.cardDensity

  const pageSize =
    typeof parsed.defaultPageSize === "number" && parsed.defaultPageSize > 0
      ? parsed.defaultPageSize
      : DEFAULT_GRID_CONFIG.defaultPageSize

  return {
    viewMode: shape,
    viewShape: shape,
    cardColumns: columns,
    cardDensity: density,
    showTags: parsed.showTags ?? DEFAULT_GRID_CONFIG.showTags,
    showTelemetry: parsed.showTelemetry ?? DEFAULT_GRID_CONFIG.showTelemetry,
    showHops: parsed.showHops ?? DEFAULT_GRID_CONFIG.showHops,
    showOwner: parsed.showOwner ?? DEFAULT_GRID_CONFIG.showOwner,
    showDescription: parsed.showDescription ?? DEFAULT_GRID_CONFIG.showDescription,
    defaultPageSize: pageSize,
  }
}

/**
 * Load dashboard configuration from localStorage safely (SSR-compatible).
 */
export function loadGridConfig(): GridConfig {
  if (typeof window === "undefined") return { ...DEFAULT_GRID_CONFIG }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_GRID_CONFIG }
    const parsed = JSON.parse(raw)
    return normalizeConfig(parsed)
  } catch (err) {
    console.warn("Failed to load dashboard config from localStorage:", err)
    return { ...DEFAULT_GRID_CONFIG }
  }
}

/**
 * Save dashboard configuration to localStorage and notify all listeners.
 */
export function saveGridConfig(config: GridConfig): void {
  if (typeof window === "undefined") return
  try {
    const normalized = normalizeConfig(config)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized, null, 2))
    // Dispatch custom event for cross-component reactive sync
    window.dispatchEvent(
      new CustomEvent(CONFIG_CHANGED_EVENT, { detail: normalized })
    )
  } catch (err) {
    console.error("Failed to save dashboard config to localStorage:", err)
  }
}

/**
 * Validate and parse a raw JSON string into a GridConfig.
 */
export function validateAndParseJsonConfig(jsonStr: string): {
  valid: boolean
  config?: GridConfig
  error?: string
} {
  try {
    const trimmed = jsonStr.trim()
    if (!trimmed) {
      return { valid: false, error: "Configuration string is empty" }
    }
    const parsed = JSON.parse(trimmed)
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { valid: false, error: "Configuration JSON must be an object" }
    }

    const normalized = normalizeConfig(parsed)
    return { valid: true, config: normalized }
  } catch (err: any) {
    return { valid: false, error: err?.message || "Invalid JSON syntax" }
  }
}

/**
 * Formats a GridConfig into a pretty JSON string.
 */
export function formatJsonConfig(config: GridConfig): string {
  return JSON.stringify(normalizeConfig(config), null, 2)
}

/**
 * Encode config for team URL sharing (base64).
 */
export function encodeConfigToUrlHash(config: GridConfig): string {
  try {
    const json = JSON.stringify(normalizeConfig(config))
    if (typeof window !== "undefined" && window.btoa) {
      return "cfg=" + window.btoa(unescape(encodeURIComponent(json)))
    }
    return ""
  } catch {
    return ""
  }
}

/**
 * Decode config from URL hash.
 */
export function decodeConfigFromUrlHash(hash: string): GridConfig | null {
  try {
    const cleanHash = hash.replace(/^#/, "")
    const match = cleanHash.match(/cfg=([^&]+)/)
    if (!match || !match[1]) return null
    const b64 = match[1]
    const json = decodeURIComponent(escape(window.atob(b64)))
    const { valid, config } = validateAndParseJsonConfig(json)
    return valid && config ? config : null
  } catch {
    return null
  }
}

export interface ConfigPreset {
  id: string
  name: string
  description: string
  config: Partial<GridConfig>
}

export const PRESET_CONFIGS: ConfigPreset[] = [
  {
    id: "table-standard",
    name: "Table View (Standard)",
    description: "Classic high-density tabular view with sorting, health pings and mirrors.",
    config: {
      viewShape: "table",
      cardDensity: "comfortable",
      showTags: true,
      showTelemetry: true,
      showHops: true,
      showOwner: true,
      showDescription: true,
      defaultPageSize: 10,
    },
  },
  {
    id: "row-cards-modern",
    name: "Row Cards (Streamlined)",
    description: "Full-width horizontal cards spanning the screen. Balanced detail and clarity.",
    config: {
      viewShape: "row-card",
      cardDensity: "comfortable",
      showTags: true,
      showTelemetry: true,
      showHops: true,
      showOwner: true,
      showDescription: true,
      defaultPageSize: 10,
    },
  },
  {
    id: "square-cards-auto",
    name: "Squared Cards (Responsive Grid)",
    description: "Modular square cards arranged in a responsive grid for visual monitoring.",
    config: {
      viewShape: "square-card",
      cardColumns: "auto",
      cardDensity: "comfortable",
      showTags: true,
      showTelemetry: true,
      showHops: true,
      showOwner: true,
      showDescription: true,
      defaultPageSize: 12,
    },
  },
  {
    id: "square-cards-3col",
    name: "Squared Cards (3 Columns Compact)",
    description: "Compact 3-column square cards with condensed spacing.",
    config: {
      viewShape: "square-card",
      cardColumns: "3",
      cardDensity: "compact",
      showTags: true,
      showTelemetry: true,
      showHops: true,
      showOwner: true,
      showDescription: false,
      defaultPageSize: 15,
    },
  },
  {
    id: "developer-dense",
    name: "Developer Dense (Max Telemetry)",
    description: "Tight compact table view focused on SLA latency sparklines, owner, and hops.",
    config: {
      viewShape: "table",
      cardDensity: "compact",
      showTags: true,
      showTelemetry: true,
      showHops: true,
      showOwner: true,
      showDescription: false,
      defaultPageSize: 25,
    },
  },
  {
    id: "minimal-clean",
    name: "Clean Minimalist (Row Cards)",
    description: "Distraction-free row cards hiding telemetry and hops for a clean directory.",
    config: {
      viewShape: "row-card",
      cardDensity: "compact",
      showTags: false,
      showTelemetry: false,
      showHops: false,
      showOwner: false,
      showDescription: true,
      defaultPageSize: 15,
    },
  },
]
