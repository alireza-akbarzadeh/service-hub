"use client"

import * as React from "react"
import { ShieldCheck, ShieldAlert, Clock, Copy, Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOThhNzJiIiwibmFtZSI6IkFsaXJlemEgTW9oYW1tYWRpIiwidGVhbSI6ImZyb250ZW5kLXNxdWFkIiwicm9sZXMiOlsibGVhZC1mcm9udGVuZCIsImFkbWluIl0sImlhdCI6MTczMDAwMDAwMCwiZXhwIjoxNzYxNjAwMDAwfQ.g8Xp3M90u9K1pQwO8x8e4kL1fA2bC3dE4fG5hI6jK7l"

export function JwtInspector() {
  const [token, setToken] = React.useState<string>(SAMPLE_JWT)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  // Parse JWT parts client-side
  const { header, payload, signature, error, isExpired, expDate, expRelative } =
    React.useMemo(() => {
      if (!token.trim()) {
        return {
          header: null,
          payload: null,
          signature: null,
          error: null,
          isExpired: false,
          expDate: null,
          expRelative: "",
        }
      }

      const parts = token.trim().split(".")
      if (parts.length !== 3) {
        return {
          header: null,
          payload: null,
          signature: null,
          error: "Invalid JWT format. A standard JWT must contain 3 dot-separated parts (Header.Payload.Signature).",
          isExpired: false,
          expDate: null,
          expRelative: "",
        }
      }

      try {
        const decodeBase64Url = (str: string) => {
          let base64 = str.replace(/-/g, "+").replace(/_/g, "/")
          while (base64.length % 4) {
            base64 += "="
          }
          return decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          )
        }

        const headerObj = JSON.parse(decodeBase64Url(parts[0]))
        const payloadObj = JSON.parse(decodeBase64Url(parts[1]))
        const sigStr = parts[2]

        let expTime: Date | null = null
        let expired = false
        let relative = ""

        if (payloadObj.exp) {
          expTime = new Date(payloadObj.exp * 1000)
          const now = new Date()
          expired = now > expTime
          const diffMs = expTime.getTime() - now.getTime()
          const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
          if (expired) {
            relative = `Expired ${Math.abs(diffDays)} days ago`
          } else {
            relative = `Valid for next ${diffDays} days`
          }
        }

        return {
          header: headerObj,
          payload: payloadObj,
          signature: sigStr,
          error: null,
          isExpired: expired,
          expDate: expTime,
          expRelative: relative,
        }
      } catch (err: any) {
        return {
          header: null,
          payload: null,
          signature: null,
          error: "Failed to decode JWT base64url payload: " + (err.message || String(err)),
          isExpired: false,
          expDate: null,
          expRelative: "",
        }
      }
    }, [token])

  return (
    <div className="space-y-4">
      {/* Input Area */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span>Encoded JWT Token</span>
          </label>
          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              onClick={() => setToken(SAMPLE_JWT)}
              className="text-xs"
            >
              Load Sample Token
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setToken("")}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Clear
            </Button>
          </div>
        </div>

        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste JWT here (ey...)"
          className="w-full h-24 rounded-xl border border-border bg-muted/20 p-3 font-mono text-xs leading-relaxed text-foreground outline-none resize-none break-all"
        />

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive flex items-center gap-2">
            <ShieldAlert className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Output Grid: Header, Payload, Signature */}
      {header && payload && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Header Card */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="flex items-center justify-between border-b border-border bg-rose-500/10 dark:bg-rose-500/20 px-4 py-2.5">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                HEADER: Algorithm & Token Type
              </span>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => copyText(JSON.stringify(header, null, 2), "header")}
                className="size-7 p-0"
              >
                {copiedId === "header" ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </Button>
            </div>
            <pre className="p-4 font-mono text-xs text-foreground bg-background overflow-x-auto">
              {JSON.stringify(header, null, 2)}
            </pre>
          </div>

          {/* Expiration & Timing Status */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="flex items-center justify-between border-b border-border bg-sky-500/10 dark:bg-sky-500/20 px-4 py-2.5">
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                <Clock className="size-3.5" />
                <span>Expiration Status</span>
              </span>
              {expDate && (
                <Badge
                  variant={isExpired ? "destructive" : "outline"}
                  className={cn(
                    "font-mono text-[10px]",
                    !isExpired && "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                  )}
                >
                  {isExpired ? "EXPIRED" : "ACTIVE"}
                </Badge>
              )}
            </div>
            <div className="p-4 space-y-2 text-xs">
              {expDate ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Expires at:</span>
                    <span className="font-mono font-medium text-foreground">
                      {expDate.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tehran Time:</span>
                    <span className="font-mono font-medium text-foreground">
                      {expDate.toLocaleTimeString("en-US", {
                        timeZone: "Asia/Tehran",
                        hour12: false,
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}{" "}
                      IRST
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Validity:</span>
                    <span
                      className={cn(
                        "font-semibold",
                        isExpired ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      {expRelative}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No &ldquo;exp&rdquo; claim found in this token payload.
                </p>
              )}
            </div>
          </div>

          {/* Payload Card */}
          <div className="md:col-span-2 rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="flex items-center justify-between border-b border-border bg-purple-500/10 dark:bg-purple-500/20 px-4 py-2.5">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                PAYLOAD: Claims & Data
              </span>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => copyText(JSON.stringify(payload, null, 2), "payload")}
                className="size-7 p-0"
              >
                {copiedId === "payload" ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </Button>
            </div>
            <pre className="p-4 font-mono text-xs text-foreground bg-background overflow-x-auto max-h-[300px]">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
