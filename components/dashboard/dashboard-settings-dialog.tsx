"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  GridConfig,
  ViewShape,
  DEFAULT_GRID_CONFIG,
  PRESET_CONFIGS,
  validateAndParseJsonConfig,
  formatJsonConfig,
  encodeConfigToUrlHash,
  STORAGE_KEY,
} from "./grid-view-config"
import {
  Check,
  Columns2,
  Columns3,
  Columns4,
  Copy,
  Database,
  FileCode2,
  FileJson,
  HardDrive,
  LayoutGrid,
  Link as LinkIcon,
  RotateCcw,
  Rows3,
  SlidersHorizontal,
  Sparkles,
  Table as TableIcon,
  AlignJustify,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Share2,
} from "lucide-react"

interface DashboardSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: GridConfig
  onSaveConfig: (newConfig: GridConfig) => void
}

type SettingsTab = "form" | "json" | "presets"

export function DashboardSettingsDialog({
  open,
  onOpenChange,
  config,
  onSaveConfig,
}: DashboardSettingsDialogProps) {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("form")

  // Local draft states
  const [draftConfig, setDraftConfig] = React.useState<GridConfig>(config)
  const [jsonText, setJsonText] = React.useState<string>("")
  const [jsonError, setJsonError] = React.useState<string | null>(null)
  const [jsonSuccessMsg, setJsonSuccessMsg] = React.useState<string | null>(null)
  const [copiedType, setCopiedType] = React.useState<string | null>(null)

  // Sync draft whenever config or dialog open changes
  React.useEffect(() => {
    if (open) {
      setDraftConfig(config)
      setJsonText(formatJsonConfig(config))
      setJsonError(null)
      setJsonSuccessMsg(null)
    }
  }, [open, config])

  // Handle visual form modifications
  const updateDraft = (updates: Partial<GridConfig>) => {
    const updated: GridConfig = {
      ...draftConfig,
      ...updates,
      viewMode: updates.viewShape || draftConfig.viewShape,
    }
    setDraftConfig(updated)
    setJsonText(formatJsonConfig(updated))
    setJsonError(null)
    // Save live
    onSaveConfig(updated)
  }

  // Handle JSON Textarea change
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setJsonText(val)
    setJsonSuccessMsg(null)
    const result = validateAndParseJsonConfig(val)
    if (!result.valid) {
      setJsonError(result.error || "Invalid JSON")
    } else {
      setJsonError(null)
    }
  }

  // Apply JSON Changes
  const handleApplyJson = () => {
    const result = validateAndParseJsonConfig(jsonText)
    if (!result.valid || !result.config) {
      setJsonError(result.error || "Invalid JSON syntax or configuration format")
      return
    }
    setDraftConfig(result.config)
    setJsonText(formatJsonConfig(result.config))
    setJsonError(null)
    setJsonSuccessMsg("Configuration successfully validated and saved to LocalStorage!")
    onSaveConfig(result.config)
    setTimeout(() => setJsonSuccessMsg(null), 3000)
  }

  // Format / Prettify JSON
  const handleFormatJson = () => {
    const result = validateAndParseJsonConfig(jsonText)
    if (result.valid && result.config) {
      setJsonText(formatJsonConfig(result.config))
      setJsonError(null)
    } else {
      setJsonError(result.error || "Cannot format invalid JSON")
    }
  }

  // Copy JSON to clipboard
  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonText)
      setCopiedType("json")
      setTimeout(() => setCopiedType(null), 2000)
    } catch {}
  }

  // Copy Shareable URL Hash
  const handleCopyShareLink = async () => {
    try {
      const hash = encodeConfigToUrlHash(draftConfig)
      const url = `${window.location.origin}${window.location.pathname}#${hash}`
      await navigator.clipboard.writeText(url)
      setCopiedType("link")
      setTimeout(() => setCopiedType(null), 2000)
    } catch {}
  }

  // Reset to default configuration
  const handleResetDefaults = () => {
    setDraftConfig(DEFAULT_GRID_CONFIG)
    setJsonText(formatJsonConfig(DEFAULT_GRID_CONFIG))
    setJsonError(null)
    setJsonSuccessMsg("Reset to factory default settings!")
    onSaveConfig(DEFAULT_GRID_CONFIG)
    setTimeout(() => setJsonSuccessMsg(null), 3000)
  }

  // Apply a preset
  const handleApplyPreset = (presetConfig: Partial<GridConfig>) => {
    const merged: GridConfig = {
      ...DEFAULT_GRID_CONFIG,
      ...presetConfig,
      viewMode: (presetConfig.viewShape || DEFAULT_GRID_CONFIG.viewShape),
      viewShape: (presetConfig.viewShape || DEFAULT_GRID_CONFIG.viewShape),
    }
    setDraftConfig(merged)
    setJsonText(formatJsonConfig(merged))
    setJsonError(null)
    setJsonSuccessMsg(`Applied preset successfully!`)
    onSaveConfig(merged)
    setTimeout(() => setJsonSuccessMsg(null), 3000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-5 pb-3 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <SlidersHorizontal className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  Dashboard View & Layout Configuration
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Personalize 3 display shapes, telemetry visibility & raw JSON preferences stored in your browser.
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground border-border/80 bg-background"
            >
              <HardDrive className="size-3 text-emerald-500" />
              <span>localStorage: {STORAGE_KEY}</span>
            </Badge>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 pt-3">
            <button
              type="button"
              onClick={() => setActiveTab("form")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                activeTab === "form"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <SlidersHorizontal className="size-3.5" />
              <span>Visual Form</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("json")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                activeTab === "json"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <FileJson className="size-3.5" />
              <span>Raw JSON Config</span>
              {jsonError ? (
                <span className="size-1.5 rounded-full bg-destructive" />
              ) : (
                <span className="size-1.5 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("presets")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                activeTab === "presets"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Sparkles className="size-3.5" />
              <span>Presets & Team Share</span>
            </button>
          </div>
        </DialogHeader>

        {/* Tab 1: Visual Form Settings */}
        {activeTab === "form" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {/* 1. Primary Shape Selector (3 Shapes) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>1. View Shape (Select from 3 styles)</span>
                <span className="text-[11px] font-normal normal-case text-primary font-mono">
                  Current: {draftConfig.viewShape}
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Shape 1: Table */}
                <div
                  onClick={() => updateDraft({ viewShape: "table" })}
                  className={cn(
                    "cursor-pointer rounded-xl border p-3.5 transition-all flex flex-col justify-between gap-3 text-left hover:border-primary/60",
                    draftConfig.viewShape === "table"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                      : "border-border bg-card"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-foreground">
                      <Rows3 className="size-4" />
                    </div>
                    {draftConfig.viewShape === "table" && (
                      <Badge className="bg-primary text-[10px] py-0 px-1.5">Active</Badge>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">Table View</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                      Data-dense tabular rows with headers, sorting, and inline telemetry status.
                    </div>
                  </div>
                </div>

                {/* Shape 2: Row Card */}
                <div
                  onClick={() => updateDraft({ viewShape: "row-card" })}
                  className={cn(
                    "cursor-pointer rounded-xl border p-3.5 transition-all flex flex-col justify-between gap-3 text-left hover:border-primary/60",
                    draftConfig.viewShape === "row-card"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                      : "border-border bg-card"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-foreground">
                      <AlignJustify className="size-4" />
                    </div>
                    {draftConfig.viewShape === "row-card" && (
                      <Badge className="bg-primary text-[10px] py-0 px-1.5">Active</Badge>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">Row Cards</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                      Horizontal expansive cards spanning the full width for modern catalog scanning.
                    </div>
                  </div>
                </div>

                {/* Shape 3: Squared Card */}
                <div
                  onClick={() => updateDraft({ viewShape: "square-card" })}
                  className={cn(
                    "cursor-pointer rounded-xl border p-3.5 transition-all flex flex-col justify-between gap-3 text-left hover:border-primary/60",
                    draftConfig.viewShape === "square-card"
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                      : "border-border bg-card"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-foreground">
                      <LayoutGrid className="size-4" />
                    </div>
                    {draftConfig.viewShape === "square-card" && (
                      <Badge className="bg-primary text-[10px] py-0 px-1.5">Active</Badge>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">Squared Cards</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                      Modular square box cards in a multi-column grid layout for visual monitoring.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Grid Columns & Density */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/70 pt-4">
              {/* Card Grid Columns (relevant especially for squared cards) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Columns3 className="size-3.5" />
                  <span>Card Grid Columns</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["auto", "2", "3", "4"] as const).map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => updateDraft({ cardColumns: col })}
                      className={cn(
                        "rounded-lg border px-2 py-1.5 text-center font-mono text-xs font-medium transition-all cursor-pointer",
                        draftConfig.cardColumns === col
                          ? "border-primary bg-primary text-primary-foreground font-semibold shadow-2xs"
                          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {col === "auto" ? "Auto" : `${col} Cols`}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Controls column layout in Squared Cards mode (Auto adapts 1 to 4 cols).
                </p>
              </div>

              {/* Display Density */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <SlidersHorizontal className="size-3.5" />
                  <span>Display Density</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["comfortable", "compact"] as const).map((density) => (
                    <button
                      key={density}
                      type="button"
                      onClick={() => updateDraft({ cardDensity: density })}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-center capitalize text-xs font-medium transition-all cursor-pointer",
                        draftConfig.cardDensity === density
                          ? "border-primary bg-primary text-primary-foreground font-semibold shadow-2xs"
                          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {density}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Comfortable provides relaxed spacing; Compact maximizes screen real estate.
                </p>
              </div>
            </div>

            {/* 3. Service Element Visibility Toggles */}
            <div className="space-y-2.5 border-t border-border/70 pt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Service Details & Telemetry Visibility
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    key: "showTelemetry",
                    label: "Telemetry & Latency Sparkline",
                    desc: "Live ping result, SLA uptime % & mini history chart",
                  },
                  {
                    key: "showTags",
                    label: "Service Tags",
                    desc: "Domain categorization chips (#api, #frontend, etc.)",
                  },
                  {
                    key: "showHops",
                    label: "Environment Hops (Mirrors)",
                    desc: "Quick jump buttons between Dev, Test, and Stage",
                  },
                  {
                    key: "showOwner",
                    label: "Service Owner",
                    desc: "Display responsible team or engineer pill",
                  },
                  {
                    key: "showDescription",
                    label: "Service Description",
                    desc: "Summary text explaining service purpose",
                  },
                ].map((item) => {
                  const isChecked = Boolean(draftConfig[item.key as keyof GridConfig])
                  return (
                    <div
                      key={item.key}
                      onClick={() =>
                        updateDraft({
                          [item.key]: !isChecked,
                        } as any)
                      }
                      className={cn(
                        "flex items-center justify-between rounded-xl border p-2.5 cursor-pointer transition-all hover:border-primary/50",
                        isChecked
                          ? "border-primary/40 bg-primary/5"
                          : "border-border bg-card/60 opacity-80"
                      )}
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-foreground text-xs">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {item.desc}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "size-5 shrink-0 rounded flex items-center justify-center transition-colors",
                          isChecked
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-muted/50"
                        )}
                      >
                        {isChecked && <Check className="size-3 stroke-[3]" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 4. Default Page Size */}
            <div className="space-y-2 border-t border-border/70 pt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Default Items Per Page
                </label>
                <span className="font-mono text-xs text-primary font-bold">
                  {draftConfig.defaultPageSize} items
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[5, 10, 15, 20, 25, 50].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => updateDraft({ defaultPageSize: size })}
                    className={cn(
                      "flex-1 rounded-md border py-1 font-mono text-xs transition-all cursor-pointer",
                      draftConfig.defaultPageSize === size
                        ? "border-primary bg-primary text-primary-foreground font-semibold"
                        : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Raw JSON Configuration Editor */}
        {activeTab === "json" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">
                  Direct LocalStorage JSON Editor
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Manipulate your dashboard config directly as JSON. Changes are saved to localStorage without requiring authentication.
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFormatJson}
                  className="h-7 text-[11px] cursor-pointer"
                  title="Format JSON with standard indentation"
                >
                  <FileCode2 className="size-3 mr-1" />
                  Format
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyJson}
                  className="h-7 text-[11px] cursor-pointer"
                  title="Copy JSON configuration to clipboard"
                >
                  {copiedType === "json" ? (
                    <Check className="size-3 mr-1 text-emerald-500" />
                  ) : (
                    <Copy className="size-3 mr-1" />
                  )}
                  {copiedType === "json" ? "Copied" : "Copy JSON"}
                </Button>
              </div>
            </div>

            {/* Validation Banner */}
            {jsonError ? (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span className="font-mono text-[11px]">{jsonError}</span>
              </div>
            ) : jsonSuccessMsg ? (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{jsonSuccessMsg}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5 shrink-0" />
                <span className="text-[11px]">Valid JSON configuration format</span>
              </div>
            )}

            {/* JSON Code Textarea */}
            <div className="relative rounded-xl border border-border bg-muted/30 font-mono text-xs overflow-hidden">
              <textarea
                value={jsonText}
                onChange={handleJsonChange}
                rows={13}
                spellCheck={false}
                className="w-full resize-none bg-transparent p-3.5 font-mono text-xs leading-relaxed text-foreground outline-none focus:ring-1 focus:ring-primary selection:bg-primary/20"
                placeholder="Paste or write valid JSON configuration here..."
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetDefaults}
                className="h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <RotateCcw className="size-3.5 mr-1.5 opacity-70" />
                Reset Defaults
              </Button>

              <Button
                size="sm"
                onClick={handleApplyJson}
                disabled={Boolean(jsonError)}
                className="h-8 text-xs cursor-pointer shadow-xs gap-1.5"
              >
                <Upload className="size-3.5" />
                <span>Apply & Save to LocalStorage</span>
              </Button>
            </div>
          </div>
        )}

        {/* Tab 3: Presets & Team Share */}
        {activeTab === "presets" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {/* Team Sharing Section */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <Share2 className="size-4 text-primary" />
                    <span>Global & Team Shared Configuration</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Since preference authentication isn't tied to individual user logins, share this setup with your team via one-click links or portable JSON.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyShareLink}
                  className="h-8 text-xs cursor-pointer gap-1.5"
                >
                  {copiedType === "link" ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <LinkIcon className="size-3.5 text-primary" />
                  )}
                  <span>
                    {copiedType === "link"
                      ? "Share Link Copied!"
                      : "Copy Shareable URL Hash"}
                  </span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyJson}
                  className="h-8 text-xs cursor-pointer gap-1.5"
                >
                  {copiedType === "json" ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  <span>
                    {copiedType === "json" ? "JSON Copied!" : "Copy Raw JSON"}
                  </span>
                </Button>
              </div>
            </div>

            {/* Presets List */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                One-Click Team Presets
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESET_CONFIGS.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex flex-col justify-between rounded-xl border border-border bg-card p-3.5 space-y-2 hover:border-primary/50 transition-all"
                  >
                    <div>
                      <div className="font-bold text-foreground text-xs">
                        {preset.name}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                        {preset.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-mono text-[10px] text-primary">
                        {preset.config.viewShape} • {preset.config.cardDensity}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleApplyPreset(preset.config)}
                        className="h-7 text-[11px] cursor-pointer"
                      >
                        Apply Preset
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="p-3 px-5 border-t border-border bg-muted/10 flex items-center justify-between sm:justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>Config Auto-Saved to LocalStorage</span>
          </div>

          <Button
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs cursor-pointer"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
