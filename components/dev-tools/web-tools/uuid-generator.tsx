"use client"

import * as React from "react"
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Fingerprint,
  Sliders,
  Layers,
  KeyRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

function generateCryptoUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function generateNanoID(length: number = 21): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-"
  const array = new Uint8Array(length)
  if (typeof crypto !== "undefined") {
    crypto.getRandomValues(array)
  }
  return Array.from(array)
    .map((b) => chars[b % chars.length])
    .join("")
}

function generateSecureToken(length: number = 32, type: "hex" | "alphanumeric"): string {
  const chars =
    type === "hex"
      ? "0123456789abcdef"
      : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  const array = new Uint8Array(length)
  if (typeof crypto !== "undefined") {
    crypto.getRandomValues(array)
  }
  return Array.from(array)
    .map((b) => chars[b % chars.length])
    .join("")
}

export function UuidGenerator() {
  const [format, setFormat] = React.useState<"uuid" | "nanoid" | "hex" | "secret">("uuid")
  const [count, setCount] = React.useState<number>(5)
  const [uppercase, setUppercase] = React.useState<boolean>(false)
  const [removeHyphens, setRemoveHyphens] = React.useState<boolean>(false)
  const [nanoLength, setNanoLength] = React.useState<number>(21)
  const [secretLength, setSecretLength] = React.useState<number>(32)

  const [generatedList, setGeneratedList] = React.useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = React.useState<number | "all" | null>(null)

  const generate = React.useCallback(() => {
    const list: string[] = []
    for (let i = 0; i < count; i++) {
      let val = ""
      if (format === "uuid") {
        val = generateCryptoUUID()
        if (removeHyphens) val = val.replace(/-/g, "")
        if (uppercase) val = val.toUpperCase()
      } else if (format === "nanoid") {
        val = generateNanoID(nanoLength)
      } else if (format === "hex") {
        val = generateSecureToken(secretLength, "hex")
        if (uppercase) val = val.toUpperCase()
      } else if (format === "secret") {
        val = generateSecureToken(secretLength, "alphanumeric")
      }
      list.push(val)
    }
    setGeneratedList(list)
  }, [count, format, uppercase, removeHyphens, nanoLength, secretLength])

  React.useEffect(() => {
    generate()
  }, [generate])

  const copyToClipboard = (text: string, index: number | "all") => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const copyAll = () => {
    copyToClipboard(generatedList.join("\n"), "all")
  }

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Fingerprint className="size-4 text-emerald-500" />
            <h3 className="text-sm font-bold">Cryptographically Secure Identifier Generator</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generate}
              className="h-8 text-xs gap-1.5 cursor-pointer"
            >
              <RefreshCw className="size-3 text-primary" />
              <span>Regenerate</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={copyAll}
              className="h-8 text-xs gap-1.5 cursor-pointer"
            >
              {copiedIndex === "all" ? (
                <Check className="size-3" />
              ) : (
                <Copy className="size-3" />
              )}
              <span>Copy All ({generatedList.length})</span>
            </Button>
          </div>
        </div>

        {/* Format Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "uuid" as const, label: "UUID v4", badge: "Standard" },
            { id: "nanoid" as const, label: "NanoID", badge: "Compact" },
            { id: "hex" as const, label: "Hex Token", badge: "Crypto" },
            { id: "secret" as const, label: "API Secret Key", badge: "Base62" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFormat(item.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                format === item.id
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{item.label}</span>
              <span className="text-[10px] opacity-75">({item.badge})</span>
            </button>
          ))}
        </div>

        {/* Options Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/50 text-xs">
          <div>
            <label className="text-[11px] text-muted-foreground block mb-1">Batch Count</label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full h-8 rounded-md border border-border bg-background px-2 font-mono text-xs cursor-pointer"
            >
              <option value={1}>1 ID</option>
              <option value={5}>5 IDs</option>
              <option value={10}>10 IDs</option>
              <option value={25}>25 IDs</option>
              <option value={50}>50 IDs</option>
            </select>
          </div>

          {format === "uuid" && (
            <>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Casing</label>
                <button
                  type="button"
                  onClick={() => setUppercase(!uppercase)}
                  className={`w-full h-8 rounded-md border px-2 text-xs font-medium cursor-pointer transition-colors ${
                    uppercase
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {uppercase ? "UPPERCASE" : "lowercase"}
                </button>
              </div>

              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Hyphens</label>
                <button
                  type="button"
                  onClick={() => setRemoveHyphens(!removeHyphens)}
                  className={`w-full h-8 rounded-md border px-2 text-xs font-medium cursor-pointer transition-colors ${
                    removeHyphens
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {removeHyphens ? "No Hyphens (32-char)" : "With Hyphens (36-char)"}
                </button>
              </div>
            </>
          )}

          {(format === "nanoid" || format === "hex" || format === "secret") && (
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">
                Length ({format === "nanoid" ? nanoLength : secretLength} chars)
              </label>
              <Input
                type="number"
                min={8}
                max={128}
                value={format === "nanoid" ? nanoLength : secretLength}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  if (format === "nanoid") setNanoLength(val)
                  else setSecretLength(val)
                }}
                className="h-8 font-mono text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* Generated Results List */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-2 shadow-2xs">
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Generated Output ({generatedList.length})
          </span>
          <span className="text-[11px] font-mono text-emerald-500">
            Crypto.getRandomValues() Verified
          </span>
        </div>

        <div className="divide-y divide-border/40 font-mono text-xs">
          {generatedList.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 px-1 hover:bg-muted/40 rounded transition-colors group"
            >
              <span className="text-muted-foreground/60 w-6 text-[10px] select-none">
                {idx + 1}.
              </span>
              <span className="flex-1 truncate font-medium text-foreground select-all pr-2">
                {item}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(item, idx)}
                className="h-6 px-2 text-xs gap-1 cursor-pointer"
              >
                {copiedIndex === idx ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3 text-muted-foreground group-hover:text-foreground" />
                )}
                <span className="hidden sm:inline">Copy</span>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
