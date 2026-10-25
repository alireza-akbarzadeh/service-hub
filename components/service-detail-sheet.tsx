"use client"

import {
  checkEndpointHealth,
  type HealthCheckResult,
} from "@/app/actions/services"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Service } from "@/lib/db/schema"
import { cn } from "@/lib/utils"
import { Check, Copy, ExternalLink, RefreshCw, Terminal } from "lucide-react"
import * as React from "react"

interface ServiceDetailSheetProps {
  service: Service | null
  open: boolean
  onOpenChange: (open: boolean) => void
  mirrors: Service[]
}

export function ServiceDetailSheet({
  service,
  open,
  onOpenChange,
  mirrors,
}: ServiceDetailSheetProps) {
  const [copiedSnippet, setCopiedSnippet] = React.useState<string | null>(null)
  const [health, setHealth] = React.useState<HealthCheckResult | null>(null)
  const [isPinging, setIsPinging] = React.useState(false)

  // Reset health on service change
  React.useEffect(() => {
    setHealth(null)
    setIsPinging(false)
  }, [service?.id])

  if (!service) return null

  const handlePing = async () => {
    setIsPinging(true)
    try {
      const res = await checkEndpointHealth(service.url)
      setHealth(res)
    } catch {
      setHealth({
        url: service.url,
        status: "offline",
        latencyMs: 3500,
        message: "Ping failed",
      })
    } finally {
      setIsPinging(false)
    }
  }

  const copyText = (text: string, snippetId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSnippet(snippetId)
    setTimeout(() => setCopiedSnippet(null), 1500)
  }

  // Generate clean env variable name
  const envVarKey = `NEXT_PUBLIC_${service.name
    .replace(/\s*\([^\)]*\)\s*/gi, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .toUpperCase()}_URL`

  const curlSnippet = `curl -i -X GET "${service.url}" \\\n  -H "User-Agent: ServiceHub/1.0"`

  const fetchSnippet = `// Frontend Fetch Example\nconst response = await fetch("${service.url}", {\n  headers: {\n    "Content-Type": "application/json",\n  },\n});\nconst data = await response.json();`

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto border-l border-border bg-card p-0 sm:max-w-md"
      >
        {/* Header */}
        <SheetHeader className="border-b border-border bg-muted/20 p-5 pb-4">
          <div className="mb-1.5 flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-[11px]">
              {service.environment}
            </Badge>
            <Badge variant="secondary" className="text-[11px]">
              {service.category}
            </Badge>
          </div>
          <SheetTitle className="text-lg font-bold text-foreground">
            {service.name}
          </SheetTitle>
          <SheetDescription className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {service.description}
          </SheetDescription>
        </SheetHeader>

        {/* Content Body */}
        <div className="space-y-5 p-5">
          {/* Endpoint URL Card with Live Ping */}
          <div className="space-y-3 rounded-xl border border-border bg-background p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">
                Endpoint URL
              </span>
              <button
                type="button"
                onClick={handlePing}
                disabled={isPinging}
                className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-primary hover:underline disabled:opacity-50"
              >
                <RefreshCw
                  className={cn("size-3", isPinging && "animate-spin")}
                />
                <span>{isPinging ? "Pinging..." : "Check Live Health"}</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-2 font-mono text-xs">
              <span className="truncate font-medium text-foreground select-all">
                {service.url}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => copyText(service.url, "url")}
                  className="cursor-pointer rounded p-1 text-muted-foreground hover:text-foreground"
                  title="Copy URL"
                >
                  {copiedSnippet === "url" ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer rounded p-1 text-primary hover:text-primary/80"
                  title="Open in new tab"
                >
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>

            {/* Health result indicator */}
            {health && (
              <div
                className={cn(
                  "flex animate-in items-center justify-between rounded-lg border px-3 py-2 text-xs duration-150 fade-in-0",
                  health.status === "online"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : health.status === "warning"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "border-destructive/30 bg-destructive/10 text-destructive"
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      health.status === "online"
                        ? "animate-pulse bg-emerald-500"
                        : health.status === "warning"
                          ? "bg-amber-500"
                          : "bg-destructive"
                    )}
                  />
                  <span className="font-semibold">
                    {health.status === "online"
                      ? "Online & Reachable"
                      : health.status === "warning"
                        ? `Reachable (${health.message})`
                        : "Unreachable / Offline"}
                  </span>
                  {health.httpStatus && (
                    <Badge
                      variant="outline"
                      className="px-1 py-0 font-mono text-[10px]"
                    >
                      HTTP {health.httpStatus}
                    </Badge>
                  )}
                </div>
                <span className="font-mono text-[11px] font-semibold">
                  {health.latencyMs}ms
                </span>
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-border bg-background p-3">
              <span className="block text-[11px] text-muted-foreground">
                Owner Team
              </span>
              <span className="mt-0.5 block truncate font-semibold text-foreground">
                {service.owner || "Platform Team"}
              </span>
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <span className="block text-[11px] text-muted-foreground">
                Configured Status
              </span>
              <span className="mt-0.5 block font-semibold text-foreground capitalize">
                {service.status}
              </span>
            </div>
          </div>

          {/* Mirror Counterparts */}
          {mirrors.length > 0 && (
            <div className="space-y-2 rounded-xl border border-border bg-background p-3.5">
              <span className="block text-xs font-semibold text-foreground">
                Mirror Environments ({mirrors.length})
              </span>
              <p className="text-[11px] text-muted-foreground">
                Equivalent instances running in other environments:
              </p>
              <div className="space-y-1.5 pt-1">
                {mirrors.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 p-2 text-xs"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="px-1 py-0 font-mono text-[10px]"
                      >
                        {m.environment}
                      </Badge>
                      <span className="truncate font-medium text-foreground">
                        {m.name}
                      </span>
                    </div>
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex shrink-0 items-center gap-1 rounded p-1 text-[11px] font-medium text-primary hover:underline"
                    >
                      <span>Jump</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Developer Testing Snippets */}
          <div className="space-y-3 rounded-xl border border-border bg-background p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Terminal className="size-3.5 text-primary" />
                <span>Quick Snippets</span>
              </div>
            </div>

            {/* .env variable */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>.env.local variable</span>
                <button
                  type="button"
                  onClick={() =>
                    copyText(`${envVarKey}="${service.url}"`, "env")
                  }
                  className="flex cursor-pointer items-center gap-1 text-primary hover:underline"
                >
                  {copiedSnippet === "env" ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  <span>Copy</span>
                </button>
              </div>
              <pre className="overflow-x-auto rounded-lg bg-muted/40 p-2 font-mono text-[11px] text-foreground select-all">
                {envVarKey}=&quot;{service.url}&quot;
              </pre>
            </div>

            {/* cURL */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>cURL test</span>
                <button
                  type="button"
                  onClick={() => copyText(curlSnippet, "curl")}
                  className="flex cursor-pointer items-center gap-1 text-primary hover:underline"
                >
                  {copiedSnippet === "curl" ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  <span>Copy</span>
                </button>
              </div>
              <pre className="overflow-x-auto rounded-lg bg-muted/40 p-2 font-mono text-[11px] text-foreground select-all">
                {curlSnippet}
              </pre>
            </div>

            {/* fetch() */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>fetch() client code</span>
                <button
                  type="button"
                  onClick={() => copyText(fetchSnippet, "fetch")}
                  className="flex cursor-pointer items-center gap-1 text-primary hover:underline"
                >
                  {copiedSnippet === "fetch" ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  <span>Copy</span>
                </button>
              </div>
              <pre className="overflow-x-auto rounded-lg bg-muted/40 p-2 font-mono text-[10px] leading-relaxed text-foreground select-all">
                {fetchSnippet}
              </pre>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
