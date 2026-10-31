"use client"

import * as React from "react"
import {
  Link as LinkIcon,
  Copy,
  Check,
  Plus,
  Trash2,
  Sparkles,
  ArrowRightLeft,
  ExternalLink,
  Code2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface QueryParam {
  id: string
  key: string
  value: string
}

export function UrlInspector() {
  const [rawUrl, setRawUrl] = React.useState<string>(
    "https://api.services.internal/v1/checkout?cart_id=c_9823&currency=USD&ref=dashboard&utm_source=slack&utm_medium=internal"
  )
  const [encodeMode, setEncodeMode] = React.useState<"component" | "full">("component")
  const [rawTextToEncode, setRawTextToEncode] = React.useState<string>(
    "hello world & key=special/value?foo=bar"
  )
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null)

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Parse URL components and query parameters
  const parsed = React.useMemo(() => {
    try {
      const url = new URL(rawUrl)
      const params: QueryParam[] = []
      url.searchParams.forEach((value, key) => {
        params.push({
          id: Math.random().toString(36).substring(2, 9),
          key,
          value,
        })
      })
      return {
        isValid: true,
        protocol: url.protocol,
        host: url.host,
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? "443" : "80"),
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        params,
      }
    } catch {
      return {
        isValid: false,
        protocol: "",
        host: "",
        hostname: "",
        port: "",
        pathname: "",
        search: "",
        hash: "",
        params: [],
      }
    }
  }, [rawUrl])

  // Update URL when parameters are modified in table
  const handleParamChange = (index: number, newKey: string, newValue: string) => {
    try {
      const url = new URL(rawUrl)
      // Rebuild params
      const currentParams = [...parsed.params]
      currentParams[index] = { ...currentParams[index], key: newKey, value: newValue }

      const newSearch = new URLSearchParams()
      currentParams.forEach((p) => {
        if (p.key.trim()) {
          newSearch.append(p.key.trim(), p.value)
        }
      })
      url.search = newSearch.toString()
      setRawUrl(url.toString())
    } catch {
      // ignore
    }
  }

  const handleAddParam = () => {
    try {
      const url = new URL(rawUrl)
      url.searchParams.append("new_param", "value")
      setRawUrl(url.toString())
    } catch {
      // ignore
    }
  }

  const handleDeleteParam = (index: number) => {
    try {
      const url = new URL(rawUrl)
      const currentParams = parsed.params.filter((_, i) => i !== index)
      const newSearch = new URLSearchParams()
      currentParams.forEach((p) => {
        if (p.key.trim()) {
          newSearch.append(p.key.trim(), p.value)
        }
      })
      url.search = newSearch.toString()
      setRawUrl(url.toString())
    } catch {
      // ignore
    }
  }

  // Quick encoder / decoder results
  const encodedText = React.useMemo(() => {
    try {
      return encodeMode === "component"
        ? encodeURIComponent(rawTextToEncode)
        : encodeURI(rawTextToEncode)
    } catch {
      return "Encoding error"
    }
  }, [rawTextToEncode, encodeMode])

  const decodedText = React.useMemo(() => {
    try {
      return decodeURIComponent(rawTextToEncode)
    } catch {
      return "Decoding error: malformed URI sequence"
    }
  }, [rawTextToEncode])

  return (
    <div className="space-y-4">
      {/* Top Section: Full URL Inspector & Query Params */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <LinkIcon className="size-4 text-primary" />
            <h3 className="text-sm font-bold">Interactive URL & Query Parameter Parser</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                parsed.isValid
                  ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px]"
                  : "border-rose-500/30 text-rose-600 bg-rose-500/10 text-[10px]"
              }
            >
              {parsed.isValid ? "Valid URL" : "Malformed URL"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(rawUrl, "full-url")}
              className="h-7 text-xs gap-1"
            >
              {copiedKey === "full-url" ? (
                <Check className="size-3 text-emerald-500" />
              ) : (
                <Copy className="size-3" />
              )}
              <span>Copy URL</span>
            </Button>
          </div>
        </div>

        {/* Input URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            Target URL (Paste or type any endpoint)
          </label>
          <Input
            type="text"
            value={rawUrl}
            onChange={(e) => setRawUrl(e.target.value)}
            placeholder="https://example.com/api?foo=bar"
            className="font-mono text-xs h-9"
          />
        </div>

        {/* URL Breakdown Anatomy */}
        {parsed.isValid && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
            <div className="rounded-lg border border-border bg-muted/40 p-2">
              <span className="text-[10px] text-muted-foreground block font-mono">PROTOCOL</span>
              <span className="font-mono font-semibold text-foreground">{parsed.protocol}</span>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-2 sm:col-span-2">
              <span className="text-[10px] text-muted-foreground block font-mono">HOSTNAME</span>
              <span className="font-mono font-semibold text-primary truncate block">
                {parsed.hostname}
              </span>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-2">
              <span className="text-[10px] text-muted-foreground block font-mono">PORT</span>
              <span className="font-mono text-foreground">{parsed.port}</span>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-2 sm:col-span-2">
              <span className="text-[10px] text-muted-foreground block font-mono">PATHNAME</span>
              <span className="font-mono text-foreground truncate block">{parsed.pathname}</span>
            </div>
          </div>
        )}

        {/* Query Parameters Table */}
        {parsed.isValid && (
          <div className="space-y-2 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">Query Parameters</span>
                <Badge variant="secondary" className="font-mono text-[10px]">
                  {parsed.params.length} params
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddParam}
                className="h-7 text-xs gap-1 cursor-pointer"
              >
                <Plus className="size-3 text-emerald-500" />
                <span>Add Parameter</span>
              </Button>
            </div>

            {parsed.params.length > 0 ? (
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="grid grid-cols-12 bg-muted/60 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground border-b border-border">
                  <div className="col-span-4">KEY (NAME)</div>
                  <div className="col-span-7">VALUE</div>
                  <div className="col-span-1 text-right">ACTION</div>
                </div>

                <div className="divide-y divide-border/50 bg-card">
                  {parsed.params.map((p, idx) => (
                    <div key={p.id} className="grid grid-cols-12 gap-2 px-3 py-1.5 items-center">
                      <div className="col-span-4">
                        <Input
                          type="text"
                          value={p.key}
                          onChange={(e) => handleParamChange(idx, e.target.value, p.value)}
                          className="font-mono text-xs h-7 px-2"
                        />
                      </div>
                      <div className="col-span-7">
                        <Input
                          type="text"
                          value={p.value}
                          onChange={(e) => handleParamChange(idx, p.key, e.target.value)}
                          className="font-mono text-xs h-7 px-2 text-primary"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteParam(idx)}
                          className="size-7 text-muted-foreground hover:text-destructive cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground py-2 italic">
                No query parameters attached to this URL. Click &quot;Add Parameter&quot; above to append one.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Section: Quick Text Encode & Decode */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="size-4 text-emerald-500" />
            <h3 className="text-sm font-bold">Quick URL String Encoder & Decoder</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setEncodeMode("component")}
              className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer ${
                encodeMode === "component"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              encodeURIComponent
            </button>
            <button
              type="button"
              onClick={() => setEncodeMode("full")}
              className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer ${
                encodeMode === "full"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              encodeURI (Full)
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">Raw String</label>
          <Input
            type="text"
            value={rawTextToEncode}
            onChange={(e) => setRawTextToEncode(e.target.value)}
            className="font-mono text-xs h-9"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-muted-foreground uppercase text-[10px]">
                Encoded Result
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(encodedText, "encoded")}
                className="h-6 text-xs gap-1"
              >
                {copiedKey === "encoded" ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
                <span>Copy</span>
              </Button>
            </div>
            <p className="font-mono text-emerald-600 dark:text-emerald-400 break-all select-all font-medium">
              {encodedText}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-muted-foreground uppercase text-[10px]">
                Decoded Result
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(decodedText, "decoded")}
                className="h-6 text-xs gap-1"
              >
                {copiedKey === "decoded" ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
                <span>Copy</span>
              </Button>
            </div>
            <p className="font-mono text-primary break-all select-all font-medium">
              {decodedText}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
