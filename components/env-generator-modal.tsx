"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Service } from "@/lib/db/schema"
import { Check, Copy, Download, FileCode, Sparkles } from "lucide-react"
import * as React from "react"

interface EnvGeneratorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  services: Service[]
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
  const [copied, setCopied] = React.useState(false)

  // Generate env string
  const generatedEnv = React.useMemo(() => {
    const filtered = services.filter((s) => s.environment === targetEnv)
    if (filtered.length === 0) {
      return `# No services registered for ${targetEnv}`
    }

    const prefix =
      format === "nextjs" ? "NEXT_PUBLIC_" : format === "vite" ? "VITE_" : ""

    const lines: string[] = [
      `# =================================================================`,
      `# Service Hub Auto-Generated Environment Configuration`,
      `# Environment: ${targetEnv.toUpperCase()}`,
      `# Generated: ${new Date().toISOString().split("T")[0]}`,
      `# =================================================================`,
      "",
    ]

    // Group by category
    const categories = Array.from(new Set(filtered.map((s) => s.category)))

    categories.forEach((cat) => {
      lines.push(`# --- ${cat.toUpperCase()} ---`)
      const catServices = filtered.filter((s) => s.category === cat)

      catServices.forEach((svc) => {
        // Generate clean variable name from service name
        let varKey = svc.name
          .replace(/\s*\((Dev|Test|Stage|QA|Production|Prod)[^\)]*\)\s*/gi, "")
          .replace(/[^a-zA-Z0-9]/g, "_")
          .replace(/_+/g, "_")
          .toUpperCase()
          .trim()

        if (varKey.endsWith("_")) varKey = varKey.slice(0, -1)
        if (varKey.startsWith("_")) varKey = varKey.slice(1)

        lines.push(`${prefix}${varKey}_URL="${svc.url}"`)
      })

      lines.push("")
    })

    return lines.join("\n")
  }, [services, targetEnv, format])

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedEnv)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([generatedEnv], { type: "text/plain;charset=utf-8" })
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
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border p-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileCode className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Frontend .env Configuration Generator
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
                Export ready-to-use API & Gateway environment variables for your
                local frontend projects.
              </DialogDescription>
            </div>
          </div>

          {/* Controls: Environment & Framework Format */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
            {/* Target Environment */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Env:
              </span>
              <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
                {["Develop", "Test", "Stage"].map((env) => (
                  <button
                    key={env}
                    type="button"
                    onClick={() => setTargetEnv(env)}
                    className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      targetEnv === env
                        ? "bg-background font-semibold text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>

            {/* Framework Format */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Format:
              </span>
              <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
                {[
                  { id: "nextjs", label: "Next.js" },
                  { id: "vite", label: "Vite" },
                  { id: "generic", label: "Generic" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormat(item.id as any)}
                    className={`cursor-pointer rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                      format === item.id
                        ? "bg-primary font-semibold text-primary-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Code Preview Block */}
        <div className="relative max-h-[360px] overflow-y-auto bg-muted/30 p-4 font-mono text-xs">
          <pre className="leading-relaxed whitespace-pre text-foreground/90 select-all">
            {generatedEnv}
          </pre>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="border-t border-border bg-background p-3 sm:justify-between">
          <div className="hidden items-center gap-1.5 text-[11px] text-muted-foreground sm:flex">
            <Sparkles className="size-3.5 text-primary" />
            <span>
              Paste directly into your repository&apos;s{" "}
              <code className="font-mono font-semibold text-foreground">
                .env.local
              </code>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="cursor-pointer gap-1.5 text-xs"
            >
              <Download className="size-3.5" />
              <span>Download File</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCopy}
              className="cursor-pointer gap-1.5 text-xs"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Copy Configuration</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
