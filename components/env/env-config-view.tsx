"use client"

import * as React from "react"
import Link from "next/link"
import type { Service } from "@/lib/db/schema"
import {
  parseEnvString,
  serializeToEnvString,
  serializeToJson,
  serializeToDockerCompose,
  serializeToKubernetesConfigMap,
  serializeToKubernetesSecret,
  compareEnvironments,
  validateEnvSyntax,
  SAMPLE_ENV_PRESETS,
  type EnvVariable,
  type EnvValidationIssue,
} from "@/lib/env-utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationCenter } from "@/components/notifications/notification-center"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileCode,
  FileSpreadsheet,
  Globe,
  KeyRound,
  Layers,
  Lock,
  Network,
  Plus,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Terminal,
  Trash2,
  Unlock,
  Wrench,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface EnvConfigViewProps {
  initialServices: Service[]
  teamName?: string
}

export function EnvConfigView({
  initialServices,
  teamName = "Frontend Squad",
}: EnvConfigViewProps) {
  // Main Tab State
  const [activeTab, setActiveTab] = React.useState<"editor" | "diff" | "converter">("editor")

  // Raw & Parsed Env State
  const [rawEnv, setRawEnv] = React.useState<string>(SAMPLE_ENV_PRESETS["Next.js FullStack"])
  const [parsedVars, setParsedVars] = React.useState<EnvVariable[]>(() =>
    parseEnvString(SAMPLE_ENV_PRESETS["Next.js FullStack"])
  )

  // Secondary Env State for Diffing
  const [diffEnvRaw, setDiffEnvRaw] = React.useState<string>(SAMPLE_ENV_PRESETS["Staging Companion"])
  const [diffEnvName1, setDiffEnvName1] = React.useState<string>("Production (.env.production)")
  const [diffEnvName2, setDiffEnvName2] = React.useState<string>("Staging (.env.staging)")

  // UI helpers
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [allMasked, setAllMasked] = React.useState<boolean>(true)
  const [copiedCode, setCopiedCode] = React.useState<boolean>(false)
  const [selectedFormat, setSelectedFormat] = React.useState<
    "env" | "json" | "docker" | "k8s-configmap" | "k8s-secret"
  >("docker")

  // Sync raw string when parsed vars change or vice versa
  const handleRawChange = (val: string) => {
    setRawEnv(val)
    setParsedVars(parseEnvString(val))
  }

  // Update specific variable field
  const handleUpdateVar = (id: string, field: "key" | "value" | "comment", val: string) => {
    setParsedVars((prev) => {
      const updated = prev.map((v) => (v.id === id ? { ...v, [field]: val } : v))
      setRawEnv(serializeToEnvString(updated))
      return updated
    })
  }

  // Toggle mask on single variable
  const toggleMask = (id: string) => {
    setParsedVars((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isMasked: !v.isMasked } : v))
    )
  }

  // Toggle all masks
  const handleToggleAllMasks = () => {
    const nextState = !allMasked
    setAllMasked(nextState)
    setParsedVars((prev) =>
      prev.map((v) => ({ ...v, isMasked: v.isSecret ? nextState : false }))
    )
  }

  // Add new variable
  const handleAddVariable = () => {
    const newVar: EnvVariable = {
      id: `var-${Date.now()}`,
      key: "NEW_CONFIG_KEY",
      value: "value",
      isSecret: false,
      isMasked: false,
    }
    setParsedVars((prev) => {
      const updated = [...prev, newVar]
      setRawEnv(serializeToEnvString(updated))
      return updated
    })
  }

  // Delete variable
  const handleDeleteVariable = (id: string) => {
    setParsedVars((prev) => {
      const updated = prev.filter((v) => v.id !== id)
      setRawEnv(serializeToEnvString(updated))
      return updated
    })
  }

  // Validation issues
  const validationIssues = React.useMemo(() => {
    return validateEnvSyntax(rawEnv)
  }, [rawEnv])

  // Comparison Result
  const comparison = React.useMemo(() => {
    const vars2 = parseEnvString(diffEnvRaw)
    return compareEnvironments(parsedVars, vars2, diffEnvName1, diffEnvName2)
  }, [parsedVars, diffEnvRaw, diffEnvName1, diffEnvName2])

  // Filtered variables for search
  const filteredVars = React.useMemo(() => {
    if (!searchQuery.trim()) return parsedVars
    const q = searchQuery.toLowerCase()
    return parsedVars.filter(
      (v) =>
        v.key.toLowerCase().includes(q) ||
        v.value.toLowerCase().includes(q) ||
        (v.comment && v.comment.toLowerCase().includes(q))
    )
  }, [parsedVars, searchQuery])

  // Converted format output
  const convertedOutput = React.useMemo(() => {
    switch (selectedFormat) {
      case "env":
        return serializeToEnvString(parsedVars)
      case "json":
        return serializeToJson(parsedVars)
      case "docker":
        return serializeToDockerCompose(parsedVars)
      case "k8s-configmap":
        return serializeToKubernetesConfigMap(parsedVars, "service-hub-config")
      case "k8s-secret":
        return serializeToKubernetesSecret(parsedVars, "service-hub-secrets")
    }
  }, [parsedVars, selectedFormat])

  const copyConverted = () => {
    navigator.clipboard.writeText(convertedOutput)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const downloadEnvFile = () => {
    const blob = new Blob([convertedOutput], { type: "text/plain;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download =
      selectedFormat === "json"
        ? "environment.json"
        : selectedFormat.startsWith("k8s") || selectedFormat === "docker"
        ? "manifest.yaml"
        : ".env"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 sm:px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Hub</span>
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/30">
              <KeyRound className="size-4" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight">Env & Secrets Studio</span>
              <span className="hidden sm:inline text-xs text-muted-foreground ml-2">
                100% In-Memory Secure Config Manager
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Preset Selector */}
          <select
            onChange={(e) => {
              const preset = SAMPLE_ENV_PRESETS[e.target.value]
              if (preset) handleRawChange(preset)
            }}
            className="h-8 rounded-lg border border-border bg-muted/40 px-2.5 text-xs font-semibold text-foreground cursor-pointer focus:outline-none"
            defaultValue="Next.js FullStack"
          >
            {Object.keys(SAMPLE_ENV_PRESETS).map((p) => (
              <option key={p} value={p}>
                Preset: {p}
              </option>
            ))}
          </select>

          {/* Download File */}
          <Button
            size="sm"
            variant="outline"
            onClick={downloadEnvFile}
            className="h-8 cursor-pointer gap-1.5 text-xs font-semibold shadow-2xs hover:bg-muted"
            title="Download formatted file"
          >
            <Download className="size-3.5 text-primary" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          {/* Quick links to Status & Playground */}
          <Link href="/playground">
            <Button
              size="sm"
              variant="outline"
              className="h-8 cursor-pointer gap-1.5 text-xs text-muted-foreground hover:text-foreground hidden md:inline-flex"
            >
              <Zap className="size-3.5 text-amber-500" />
              <span>Playground</span>
            </Button>
          </Link>

          <Separator orientation="vertical" className="h-4" />
          <NotificationCenter services={initialServices} />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 max-w-7xl mx-auto w-full space-y-5">
        {/* Validation Issues Alert Banner (if any) */}
        {validationIssues.length > 0 && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-center justify-between text-xs text-amber-950 dark:text-amber-100">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="size-4 text-amber-500 shrink-0" />
              <span>
                <strong>{validationIssues.length} syntax alert(s)</strong> detected in configuration:{" "}
                {validationIssues[0].message} (Line {validationIssues[0].line})
              </span>
            </div>
            <Badge variant="outline" className="border-amber-500/40 text-[10px] font-mono">
              Syntax Warning
            </Badge>
          </div>
        )}

        {/* Tab Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/80 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("editor")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5",
                activeTab === "editor"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileCode className="size-3.5 text-primary" />
              <span>Editor & Variables</span>
              <Badge variant="secondary" className="text-[10px] font-mono px-1 py-0">
                {parsedVars.length}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("diff")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5",
                activeTab === "diff"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <SlidersHorizontal className="size-3.5 text-sky-500" />
              <span>Environment Diff</span>
              {(comparison.missingInEnv1.length > 0 || comparison.missingInEnv2.length > 0) && (
                <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("converter")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5",
                activeTab === "converter"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Terminal className="size-3.5 text-purple-500" />
              <span>Format & K8s Generator</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-[11px] font-mono px-2 py-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1.5"
            >
              <Lock className="size-3" />
              <span>Zero-Leakage Local Memory</span>
            </Badge>
          </div>
        </div>

        {/* TAB 1: SPLIT EDITOR & STRUCTURED TABLE */}
        {activeTab === "editor" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Raw Text Area */}
            <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-4 shadow-xs flex flex-col space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span className="font-bold uppercase tracking-wider text-foreground">
                  Raw .env File
                </span>
                <span>{rawEnv.split("\n").length} lines</span>
              </div>

              <textarea
                value={rawEnv}
                onChange={(e) => handleRawChange(e.target.value)}
                rows={22}
                placeholder="FOO=bar&#10;DATABASE_URL=postgres://..."
                className="w-full flex-1 rounded-xl border border-border bg-muted/20 p-3 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none select-all"
              />
            </div>

            {/* Right: Interactive Key-Value Variables Table */}
            <div className="lg:col-span-7 rounded-2xl border border-border bg-card shadow-xs overflow-hidden flex flex-col">
              {/* Controls Header */}
              <div className="p-3 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search variables..."
                    className="h-8 pl-8 text-xs rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleToggleAllMasks}
                    className="h-8 text-xs gap-1.5 cursor-pointer"
                  >
                    {allMasked ? (
                      <>
                        <Eye className="size-3.5" />
                        <span>Reveal Secrets</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="size-3.5" />
                        <span>Mask Secrets</span>
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleAddVariable}
                    className="h-8 text-xs gap-1.5 cursor-pointer shadow-2xs font-semibold"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Variable</span>
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto max-h-[520px]">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-border/80 text-left text-muted-foreground uppercase text-[10px] bg-muted/30">
                      <th className="py-2 px-3">Key</th>
                      <th className="py-2 px-3">Value</th>
                      <th className="py-2 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredVars.map((v) => (
                      <tr key={v.id} className="hover:bg-muted/15 transition-colors">
                        <td className="py-2 px-3 align-top">
                          <input
                            value={v.key}
                            onChange={(e) => handleUpdateVar(v.id, "key", e.target.value)}
                            className="w-full bg-transparent font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
                          />
                          {v.comment && (
                            <span className="block text-[10px] text-muted-foreground/70 italic px-1">
                              # {v.comment}
                            </span>
                          )}
                        </td>

                        <td className="py-2 px-3 align-top">
                          <div className="flex items-center gap-1.5">
                            {v.isSecret && v.isMasked ? (
                              <span className="font-mono text-muted-foreground tracking-widest px-1">
                                ••••••••••••••••
                              </span>
                            ) : (
                              <input
                                value={v.value}
                                onChange={(e) => handleUpdateVar(v.id, "value", e.target.value)}
                                className="w-full bg-transparent text-foreground focus:outline-none focus:ring-1 focus:ring-primary rounded px-1"
                              />
                            )}
                          </div>
                        </td>

                        <td className="py-2 px-2 align-top text-right">
                          <div className="flex items-center justify-end gap-1">
                            {v.isSecret && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleMask(v.id)}
                                className="size-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                title={v.isMasked ? "Reveal secret" : "Mask secret"}
                              >
                                {v.isMasked ? (
                                  <Eye className="size-3.5" />
                                ) : (
                                  <EyeOff className="size-3.5" />
                                )}
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteVariable(v.id)}
                              className="size-7 p-0 text-muted-foreground hover:text-rose-500 cursor-pointer"
                              title="Delete variable"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ENVIRONMENT DIFF & COMPARISON MATRIX */}
        {activeTab === "diff" && (
          <div className="space-y-5">
            {/* Diff Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs space-y-1">
                <span className="text-xs text-muted-foreground">Total Unique Keys</span>
                <span className="text-2xl font-bold tracking-tight block">
                  {comparison.allKeys.length}
                </span>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 shadow-2xs space-y-1">
                <span className="text-xs text-emerald-700 dark:text-emerald-300">
                  Identical Values
                </span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 block">
                  {comparison.identicalValues.length}
                </span>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 shadow-2xs space-y-1">
                <span className="text-xs text-amber-700 dark:text-amber-300">
                  Different Values
                </span>
                <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 block">
                  {comparison.differentValues.length}
                </span>
              </div>

              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 shadow-2xs space-y-1">
                <span className="text-xs text-rose-700 dark:text-rose-300">
                  Missing in Either
                </span>
                <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 block">
                  {comparison.missingInEnv1.length + comparison.missingInEnv2.length}
                </span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
              <div className="p-3 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {comparison.env1Name}
                  </Badge>
                  <ArrowRight className="size-3 text-muted-foreground" />
                  <Badge variant="outline" className="font-mono text-xs">
                    {comparison.env2Name}
                  </Badge>
                </div>

                <span className="text-xs text-muted-foreground font-mono">
                  Side-by-Side Configuration Matrix
                </span>
              </div>

              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-border text-left uppercase text-[10px] bg-muted/40 text-muted-foreground">
                      <th className="py-2.5 px-3">Variable Key</th>
                      <th className="py-2.5 px-3">{comparison.env1Name}</th>
                      <th className="py-2.5 px-3">{comparison.env2Name}</th>
                      <th className="py-2.5 px-3">Diff Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {comparison.allKeys.map((key) => {
                      const isMissing1 = comparison.missingInEnv1.includes(key)
                      const isMissing2 = comparison.missingInEnv2.includes(key)
                      const isIdentical = comparison.identicalValues.includes(key)

                      return (
                        <tr key={key} className="hover:bg-muted/15">
                          <td className="py-2.5 px-3 font-bold text-foreground">{key}</td>
                          <td className="py-2.5 px-3 text-muted-foreground truncate max-w-xs">
                            {isMissing1 ? (
                              <Badge
                                variant="outline"
                                className="border-rose-500/30 text-rose-600 dark:text-rose-400 text-[10px]"
                              >
                                Missing
                              </Badge>
                            ) : (
                              parsedVars.find((v) => v.key === key)?.value || "—"
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground truncate max-w-xs">
                            {isMissing2 ? (
                              <Badge
                                variant="outline"
                                className="border-rose-500/30 text-rose-600 dark:text-rose-400 text-[10px]"
                              >
                                Missing
                              </Badge>
                            ) : (
                              parseEnvString(diffEnvRaw).find((v) => v.key === key)?.value || "—"
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {isIdentical ? (
                              <Badge
                                variant="outline"
                                className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] gap-1"
                              >
                                <Check className="size-2.5" />
                                <span>Identical</span>
                              </Badge>
                            ) : isMissing1 || isMissing2 ? (
                              <Badge
                                variant="outline"
                                className="border-rose-500/30 text-rose-600 dark:text-rose-400 text-[10px] gap-1"
                              >
                                <AlertTriangle className="size-2.5" />
                                <span>Missing Key</span>
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px]"
                              >
                                Different Value
                              </Badge>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FORMAT CONVERTER & KUBERNETES GENERATOR */}
        {activeTab === "converter" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Format Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/80">
                {(
                  [
                    { id: "docker", label: "Docker Compose" },
                    { id: "k8s-configmap", label: "K8s ConfigMap" },
                    { id: "k8s-secret", label: "K8s Secret (Base64)" },
                    { id: "json", label: "JSON Object" },
                    { id: "env", label: ".env Standard" },
                  ] as const
                ).map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setSelectedFormat(fmt.id)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-semibold font-mono cursor-pointer transition-all",
                      selectedFormat === fmt.id
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>

              {/* Copy & Download */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyConverted}
                  className="h-8 gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  {copiedCode ? (
                    <>
                      <Check className="size-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>Copy Spec</span>
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  onClick={downloadEnvFile}
                  className="h-8 gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs"
                >
                  <Download className="size-3.5" />
                  <span>Download Spec</span>
                </Button>
              </div>
            </div>

            {/* Output Preview */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
              <pre className="overflow-auto rounded-xl border border-border/80 bg-muted/30 p-4 font-mono text-xs leading-relaxed text-foreground select-all max-h-[500px]">
                {convertedOutput}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

