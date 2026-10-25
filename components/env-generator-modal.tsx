"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Service } from "@/lib/db/schema"
import {
  FileCode,
  Copy,
  Check,
  Download,
  Sparkles,
  WrapText,
  Filter,
  Code2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface EnvGeneratorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  services: Service[]
}

interface EnvLine {
  id: string
  type: "comment" | "empty" | "var"
  text: string
  varKey?: string
  varValue?: string
}

export function EnvGeneratorModal({
  open,
  onOpenChange,
  services,
}: EnvGeneratorModalProps) {
  const [targetEnv, setTargetEnv] = React.useState<string>("Develop")
  const [format, setFormat] = React.useState<"nextjs" | "vite" | "generic">(
    "nextjs"
  )
  const [scope, setScope] = React.useState<"essential" | "all">("essential")
  const [wordWrap, setWordWrap] = React.useState(true)
  const [copiedAll, setCopiedAll] = React.useState(false)
  const [copiedLineId, setCopiedLineId] = React.useState<string | null>(null)

  // Generate parsed structured lines for syntax-highlighted rendering
  const parsedLines = React.useMemo<EnvLine[]>(() => {
    let filtered = services.filter((s) => s.environment === targetEnv)

    // If essential scope, keep Web Apps, API & Swagger, and Observability
    if (scope === "essential") {
      filtered = filtered.filter(
        (s) =>
          s.category === "Web Apps" ||
          s.category === "API & Swagger" ||
          s.category === "Observability"
      )
    }

    if (filtered.length === 0) {
      return [
        {
          id: "empty",
          type: "comment",
          text: `# No services found for ${targetEnv} with current scope`,
        },
      ]
    }

    const prefix =
      format === "nextjs" ? "NEXT_PUBLIC_" : format === "vite" ? "VITE_" : ""

    const lines: EnvLine[] = [
      {
        id: "h1",
        type: "comment",
        text: `# ==============================================================`,
      },
      {
        id: "h2",
        type: "comment",
        text: `# Service Hub Environment Config • ${targetEnv.toUpperCase()} (${
          scope === "essential" ? "Core Gateways & Apps" : "All Services"
        })`,
      },
      {
        id: "h3",
        type: "comment",
        text: `# ==============================================================`,
      },
      { id: "e1", type: "empty", text: "" },
    ]

    const categories = Array.from(new Set(filtered.map((s) => s.category)))

    categories.forEach((cat, catIdx) => {
      lines.push({
        id: `cat-${catIdx}`,
        type: "comment",
        text: `# --- ${cat.toUpperCase()} ---`,
      })

      const catServices = filtered.filter((s) => s.category === cat)

      catServices.forEach((svc) => {
        let varKey = svc.name
          .replace(/\s*\((Dev|Test|Stage|QA|Production|Prod)[^\)]*\)\s*/gi, "")
          .replace(/[^a-zA-Z0-9]/g, "_")
          .replace(/_+/g, "_")
          .toUpperCase()
          .trim()

        if (varKey.endsWith("_")) varKey = varKey.slice(0, -1)
        if (varKey.startsWith("_")) varKey = varKey.slice(1)

        const fullKey = `${prefix}${varKey}_URL`
        const val = svc.url

        lines.push({
          id: `var-${svc.id}`,
          type: "var",
          text: `${fullKey}="${val}"`,
          varKey: fullKey,
          varValue: val,
        })
      })

      lines.push({ id: `e-cat-${catIdx}`, type: "empty", text: "" })
    })

    return lines
  }, [services, targetEnv, format, scope])

  // Full raw text for copy/download
  const fullText = React.useMemo(() => {
    return parsedLines.map((l) => l.text).join("\n")
  }, [parsedLines])

  const handleCopyAll = () => {
    navigator.clipboard.writeText(fullText)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  const handleCopySingle = (line: EnvLine) => {
    navigator.clipboard.writeText(line.text)
    setCopiedLineId(line.id)
    setTimeout(() => setCopiedLineId(null), 1500)
  }

  const handleDownload = () => {
    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `.env.${targetEnv.toLowerCase()}.local`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden rounded-2xl border border-border p-0 shadow-2xl sm:max-w-3xl">
        {/* Top Header */}
        <DialogHeader className="border-b border-border bg-card p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
              <FileCode className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold tracking-tight text-foreground">
                Frontend .env Configuration Generator
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                Instant environment variable snippets for your Next.js, Vite, or
                React local repositories.
              </DialogDescription>
            </div>
          </div>

          {/* Configuration Toolbar */}
          <div className="mt-4 grid grid-cols-1 gap-2.5 border-t border-border/70 pt-3.5 sm:grid-cols-3">
            {/* Target Environment */}
            <div>
              <span className="mb-1.5 block text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Target Environment
              </span>
              <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1 text-xs">
                {["Develop", "Test", "Stage"].map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setTargetEnv(env)}
                    className={cn(
                      "flex-1 cursor-pointer rounded-md py-1 text-center text-xs font-medium transition-all",
                      targetEnv === env
                        ? "bg-background font-semibold text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>

            {/* Scope / Filter */}
            <div>
              <span className="mb-1.5 block text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Included Endpoints
              </span>
              <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1 text-xs">
                {[
                  { id: "essential", label: "Core Gateways & Apps" },
                  { id: "all", label: "All Services" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setScope(item.id as any)}
                    className={cn(
                      "flex-1 cursor-pointer truncate rounded-md px-1 py-1 text-center text-xs font-medium transition-all",
                      scope === item.id
                        ? "bg-background font-semibold text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Framework Format */}
            <div>
              <span className="mb-1.5 block text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Prefix Format
              </span>
              <div className="flex items-center rounded-lg border border-border bg-muted/40 p-1 text-xs">
                {[
                  { id: "nextjs", label: "Next.js" },
                  { id: "vite", label: "Vite" },
                  { id: "generic", label: "Plain" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormat(item.id as any)}
                    className={cn(
                      "flex-1 cursor-pointer rounded-md py-1 text-center text-xs font-medium transition-all",
                      format === item.id
                        ? "bg-primary font-semibold text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Code Editor Preview Window */}
        <div className="flex flex-col bg-[#0b0f19] text-zinc-100">
          {/* Editor Window Bar */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 bg-[#080b12] px-4 py-2 text-xs">
            {/* Window Dots & Tab Name */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-rose-500/80" />
                <span className="size-2.5 rounded-full bg-amber-500/80" />
                <span className="size-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex items-center gap-1.5 rounded-md bg-zinc-800/60 px-2 py-0.5 font-mono text-[11px] text-zinc-300">
                <Code2 className="size-3 text-sky-400" />
                <span>.env.{targetEnv.toLowerCase()}.local</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWordWrap(!wordWrap)}
                className={cn(
                  "flex cursor-pointer items-center gap-1 rounded px-2 py-0.5 font-mono text-[11px] transition-colors",
                  wordWrap
                    ? "bg-zinc-800 text-sky-300"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
                title="Toggle text wrap"
              >
                <WrapText className="size-3" />
                <span className="hidden sm:inline">Wrap</span>
              </button>

              <button
                type="button"
                onClick={handleCopyAll}
                className="flex cursor-pointer items-center gap-1 rounded bg-zinc-800/80 px-2.5 py-0.5 text-[11px] font-medium text-zinc-200 transition-colors hover:bg-zinc-700"
                title="Copy full file"
              >
                {copiedAll ? (
                  <>
                    <Check className="size-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3" />
                    <span>Copy All</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Syntax-Highlighted Code Lines Container */}
          <div className="no-scrollbar max-h-[380px] min-h-[240px] overflow-x-auto overflow-y-auto p-3 font-mono text-[12px] leading-relaxed select-text">
            <div className="min-w-full">
              {parsedLines.map((line, idx) => {
                const lineNum = idx + 1

                if (line.type === "empty") {
                  return (
                    <div key={line.id} className="flex h-5 items-center">
                      <span className="mr-4 w-9 shrink-0 text-right text-[11px] text-zinc-600 select-none">
                        {lineNum}
                      </span>
                    </div>
                  )
                }

                if (line.type === "comment") {
                  return (
                    <div
                      key={line.id}
                      className={cn(
                        "group flex items-center py-0.5",
                        wordWrap ? "break-all" : "whitespace-pre"
                      )}
                    >
                      <span className="mr-4 w-9 shrink-0 text-right text-[11px] text-zinc-600 select-none">
                        {lineNum}
                      </span>
                      <span className="font-medium text-emerald-400/90 italic">
                        {line.text}
                      </span>
                    </div>
                  )
                }

                // Variable Line
                const isSingleCopied = copiedLineId === line.id

                return (
                  <div
                    key={line.id}
                    className={cn(
                      "group relative -mx-1 flex items-start rounded px-1 py-0.5 transition-colors hover:bg-zinc-800/40",
                      wordWrap ? "break-all" : "whitespace-pre"
                    )}
                  >
                    <span className="mr-4 w-9 shrink-0 pt-0.5 text-right text-[11px] text-zinc-600 select-none">
                      {lineNum}
                    </span>

                    <div className="flex-1">
                      <span className="font-semibold text-sky-300">
                        {line.varKey}
                      </span>
                      <span className="mx-0.5 text-zinc-400">=</span>
                      <span className="font-medium text-amber-300">
                        &quot;{line.varValue}&quot;
                      </span>
                    </div>

                    {/* Quick single-line copy on hover */}
                    <button
                      type="button"
                      onClick={() => handleCopySingle(line)}
                      className="ml-2 shrink-0 cursor-pointer rounded p-0.5 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-white"
                      title="Copy this line"
                    >
                      {isSingleCopied ? (
                        <Check className="size-3 text-emerald-400" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border bg-card p-4 sm:flex-row">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="size-4 shrink-0 text-primary" />
            <span>
              Save as{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono font-semibold text-foreground">
                .env.local
              </code>{" "}
              in your frontend root directory.
            </span>
          </div>

          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="cursor-pointer gap-1.5 text-xs shadow-xs"
            >
              <Download className="size-3.5" />
              <span>Download File</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCopyAll}
              className="cursor-pointer gap-1.5 text-xs font-semibold shadow-xs"
            >
              {copiedAll ? (
                <>
                  <Check className="size-3.5 text-emerald-300" />
                  <span>Copied All!</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Copy Configuration</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
