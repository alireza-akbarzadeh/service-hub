"use client"

import * as React from "react"
import { KeyRound, RefreshCw, Copy, Check, Fingerprint, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function HashGenerator() {
  // UUID State
  const [uuidCount, setUuidCount] = React.useState<number>(5)
  const [isUppercase, setIsUppercase] = React.useState<boolean>(false)
  const [noHyphens, setNoHyphens] = React.useState<boolean>(false)
  const [uuids, setUuids] = React.useState<string[]>([])
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  // Secret token generator state
  const [tokenLength, setTokenLength] = React.useState<number>(32)
  const [tokenType, setTokenType] = React.useState<"hex" | "base64" | "alphanumeric">("hex")
  const [generatedSecret, setGeneratedSecret] = React.useState<string>("")

  // Hash state
  const [hashInput, setHashInput] = React.useState<string>("service-catalog-secret")
  const [sha256Hash, setSha256Hash] = React.useState<string>("")

  const generateUuids = React.useCallback(() => {
    const list: string[] = []
    for (let i = 0; i < uuidCount; i++) {
      let u = crypto.randomUUID()
      if (noHyphens) u = u.replace(/-/g, "")
      if (isUppercase) u = u.toUpperCase()
      list.push(u)
    }
    setUuids(list)
  }, [uuidCount, isUppercase, noHyphens])

  const generateSecret = React.useCallback(() => {
    const array = new Uint8Array(tokenLength)
    crypto.getRandomValues(array)

    if (tokenType === "hex") {
      setGeneratedSecret(
        Array.from(array)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
      )
    } else if (tokenType === "base64") {
      setGeneratedSecret(
        btoa(String.fromCharCode(...array))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "")
      )
    } else {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
      let str = ""
      for (let i = 0; i < tokenLength; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      setGeneratedSecret(str)
    }
  }, [tokenLength, tokenType])

  // Compute SHA-256 via Web Crypto
  React.useEffect(() => {
    if (!hashInput) {
      setSha256Hash("")
      return
    }
    const encoder = new TextEncoder()
    const data = encoder.encode(hashInput)
    crypto.subtle.digest("SHA-256", data).then((buffer) => {
      const hashArray = Array.from(new Uint8Array(buffer))
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
      setSha256Hash(hashHex)
    })
  }, [hashInput])

  React.useEffect(() => {
    generateUuids()
    generateSecret()
  }, [generateUuids, generateSecret])

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <div className="space-y-6">
      {/* SECTION 1: UUID v4 Generator */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Fingerprint className="size-5 text-primary" />
            <div>
              <h3 className="text-sm font-bold text-foreground">UUID v4 Generator</h3>
              <p className="text-xs text-muted-foreground">
                Cryptographically secure RFC 4122 random UUIDs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={isUppercase}
                onChange={(e) => setIsUppercase(e.target.checked)}
                className="rounded border-border cursor-pointer"
              />
              <span>UPPERCASE</span>
            </label>

            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={noHyphens}
                onChange={(e) => setNoHyphens(e.target.checked)}
                className="rounded border-border cursor-pointer"
              />
              <span>No Hyphens</span>
            </label>

            <select
              value={uuidCount}
              onChange={(e) => setUuidCount(Number(e.target.value))}
              className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-mono text-foreground cursor-pointer"
            >
              <option value={1}>1 UUID</option>
              <option value={5}>5 UUIDs</option>
              <option value={10}>10 UUIDs</option>
            </select>

            <Button
              size="sm"
              onClick={generateUuids}
              className="gap-1.5 text-xs cursor-pointer"
            >
              <RefreshCw className="size-3.5" />
              <span>Regenerate</span>
            </Button>
          </div>
        </div>

        {/* UUID List */}
        <div className="space-y-2">
          {uuids.map((u, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/20 px-3 py-2 text-xs font-mono text-foreground hover:bg-muted/40 transition-colors"
            >
              <span className="truncate select-all">{u}</span>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => copyText(u, `uuid-${i}`)}
                className="size-7 p-0 ml-2 shrink-0"
              >
                {copiedId === `uuid-${i}` ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Random Secret Token Generator for .env */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="size-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Environment Secret & Token Generator
              </h3>
              <p className="text-xs text-muted-foreground">
                Generate high-entropy secrets for JWT_SECRET, AUTH_SECRET, or API keys
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={tokenType}
              onChange={(e) => setTokenType(e.target.value as any)}
              className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-mono text-foreground cursor-pointer"
            >
              <option value="hex">Hex (0-9, a-f)</option>
              <option value="base64">Base64URL Safe</option>
              <option value="alphanumeric">Complex Alphanumeric</option>
            </select>

            <select
              value={tokenLength}
              onChange={(e) => setTokenLength(Number(e.target.value))}
              className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-mono text-foreground cursor-pointer"
            >
              <option value={16}>16 bytes (128-bit)</option>
              <option value={32}>32 bytes (256-bit)</option>
              <option value={64}>64 bytes (512-bit)</option>
            </select>

            <Button
              size="sm"
              onClick={generateSecret}
              className="gap-1.5 text-xs cursor-pointer"
            >
              <RefreshCw className="size-3.5" />
              <span>Generate</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/20 px-3.5 py-2.5 text-xs font-mono text-foreground">
          <span className="truncate select-all break-all">{generatedSecret}</span>
          <Button
            size="xs"
            variant="outline"
            onClick={() => copyText(generatedSecret, "secret")}
            className="gap-1 text-xs ml-3 shrink-0"
          >
            {copiedId === "secret" ? (
              <Check className="size-3 text-emerald-500" />
            ) : (
              <Copy className="size-3" />
            )}
            <span>{copiedId === "secret" ? "Copied" : "Copy"}</span>
          </Button>
        </div>
      </div>

      {/* SECTION 3: SHA-256 Instant Hash Calculator */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Shield className="size-5 text-sky-500" />
          <div>
            <h3 className="text-sm font-bold text-foreground">
              SHA-256 Hash Calculator
            </h3>
            <p className="text-xs text-muted-foreground">
              Client-side zero-latency cryptographic hashing via Web Crypto API
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Input String
            </label>
            <Input
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="Type string to compute SHA-256..."
              className="text-xs font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              SHA-256 Hex Digest
            </label>
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3.5 py-2 text-xs font-mono text-foreground">
              <span className="truncate select-all text-sky-600 dark:text-sky-400">
                {sha256Hash || "—"}
              </span>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => copyText(sha256Hash, "sha256")}
                disabled={!sha256Hash}
                className="size-7 p-0 ml-2 shrink-0"
              >
                {copiedId === "sha256" ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
