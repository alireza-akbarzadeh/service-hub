"use client"

import * as React from "react"
import type { DeadLetterMessage } from "@/lib/broker-queues-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Layers,
  Radio,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldAlert,
  Terminal,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DlqMessageSheetProps {
  message: DeadLetterMessage | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRedriveMessage?: (messageId: string) => void
}

export function DlqMessageSheet({
  message,
  open,
  onOpenChange,
  onRedriveMessage,
}: DlqMessageSheetProps) {
  const [copiedPayload, setCopiedPayload] = React.useState(false)
  const [isRedriving, setIsRedriving] = React.useState(false)

  if (!message) return null

  const handleCopyPayload = () => {
    const raw = JSON.stringify(message.payload, null, 2)
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(raw).catch(() => {})
    }
    setCopiedPayload(true)
    setTimeout(() => setCopiedPayload(false), 2000)
  }

  const handleTriggerRedrive = () => {
    if (isRedriving || message.isReplayed) return
    setIsRedriving(true)
    setTimeout(() => {
      setIsRedriving(false)
      onRedriveMessage?.(message.id)
    }, 1200)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl overflow-y-auto p-0 border-l border-border bg-background"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 border-b border-border bg-background/95 p-6 backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "font-mono text-[10px] font-bold uppercase tracking-wider",
                    message.isReplayed
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  )}
                >
                  {message.isReplayed ? (
                    <>
                      <CheckCircle2 className="mr-1 size-3 inline" />
                      Replayed
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="mr-1 size-3 inline" />
                      Poison Pill
                    </>
                  )}
                </Badge>
                <span className="font-mono text-xs text-muted-foreground">{message.id}</span>
              </div>
              <SheetTitle className="text-base font-bold text-foreground font-mono">
                {message.topicName}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Originating Service: <strong className="text-foreground">{message.serviceName}</strong>
              </SheetDescription>
            </div>

            {/* Retries count pill */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/40 p-2.5 text-center shrink-0">
              <span className="text-lg font-black font-mono tracking-tight text-foreground">
                {message.retryCount}/{message.maxRetries}
              </span>
              <span className="text-[9px] uppercase font-semibold text-muted-foreground">
                Retries
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTriggerRedrive}
              disabled={isRedriving || message.isReplayed}
              className="h-7 text-xs gap-1.5 cursor-pointer border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            >
              <RotateCcw className={cn("size-3", isRedriving && "animate-spin")} />
              <span>
                {message.isReplayed
                  ? "Already Redriven"
                  : isRedriving
                  ? "Redriving to Topic..."
                  : "Redrive to Primary Topic"}
              </span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyPayload}
              className="h-7 text-xs gap-1.5 cursor-pointer"
            >
              {copiedPayload ? (
                <>
                  <Check className="size-3 text-emerald-500" />
                  <span>Copied JSON</span>
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  <span>Copy Payload</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-sm">
          {/* Exception Diagnostics Banner */}
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-rose-600 dark:text-rose-400">
              <ShieldAlert className="size-4 shrink-0" />
              <span className="font-mono">{message.exceptionType}</span>
            </div>
            <p className="text-foreground/90 font-mono text-[11px] leading-relaxed break-all bg-background/50 p-2 rounded border border-rose-500/20">
              {message.errorMessage}
            </p>
            <p className="text-[10px] text-muted-foreground font-mono">
              Dead-lettered at {new Date(message.failedAt).toLocaleString()}
            </p>
          </div>

          {/* Message Headers */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Broker Message Headers
            </h4>
            <div className="rounded-lg border border-border bg-card/60 divide-y divide-border text-xs">
              {Object.entries(message.headers).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between p-2.5 font-mono text-[11px]">
                  <span className="text-muted-foreground">{key}</span>
                  <span className="text-foreground font-medium truncate max-w-[280px]">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Formatted JSON Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Poison-Pill Payload (JSON)
              </h4>
              <span className="text-[10px] font-mono text-muted-foreground">UTF-8 Encoded</span>
            </div>
            <div className="rounded-lg border border-border bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[300px] leading-relaxed shadow-inner">
              <pre>{JSON.stringify(message.payload, null, 2)}</pre>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
