"use client"

import * as React from "react"
import {
  Terminal,
  Globe,
  KeyRound,
  ShieldCheck,
  FileCode,
  Copy,
  Check,
  ExternalLink,
  Laptop,
  Smartphone,
  Tablet,
  Bot,
  Layers,
  ArrowRight,
  Code2,
  Trash2,
  Sparkles,
  Search,
  Cookie,
  Server,
  FileJson,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  parseCurl,
  generateCodeSnippet,
  SAMPLE_CURLS,
  type ParsedCurl,
} from "@/lib/curl-parser"

type InspectorTab = "overview" | "headers" | "params" | "body" | "code"
type CodeLang = "fetch" | "axios" | "python" | "curl_clean"

export function CurlInspector({
  onSendToJsonFormatter,
}: {
  onSendToJsonFormatter?: (jsonString: string) => void
}) {
  const [curlInput, setCurlInput] = React.useState<string>(SAMPLE_CURLS.authPost)
  const [activeTab, setActiveTab] = React.useState<InspectorTab>("overview")
  const [codeLang, setCodeLang] = React.useState<CodeLang>("fetch")
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [headerSearch, setHeaderSearch] = React.useState<string>("")

  // Parse cURL in real-time
  const parsed: ParsedCurl = React.useMemo(() => {
    return parseCurl(curlInput)
  }, [curlInput])

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  // Method badge color helper
  const getMethodColor = (m: string) => {
    switch (m.toUpperCase()) {
      case "GET":
        return "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400"
      case "POST":
        return "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      case "PUT":
        return "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
      case "DELETE":
        return "border-destructive/40 bg-destructive/10 text-destructive"
      case "PATCH":
        return "border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400"
      default:
        return "border-primary/40 bg-primary/10 text-primary"
    }
  }

  // Device icon helper
  const renderDeviceIcon = (type?: string) => {
    switch (type) {
      case "Mobile":
        return <Smartphone className="size-4 text-emerald-500" />
      case "Tablet":
        return <Tablet className="size-4 text-amber-500" />
      case "Bot / CLI":
        return <Bot className="size-4 text-rose-500" />
      default:
        return <Laptop className="size-4 text-sky-500" />
    }
  }

  // Filter headers
  const filteredHeaders = React.useMemo(() => {
    if (!headerSearch.trim()) return parsed.headers
    const q = headerSearch.toLowerCase()
    return parsed.headers.filter(
      (h) => h.key.toLowerCase().includes(q) || h.value.toLowerCase().includes(q)
    )
  }, [parsed.headers, headerSearch])

  // Generated code snippet
  const generatedCode = React.useMemo(() => {
    return generateCodeSnippet(parsed, codeLang)
  }, [parsed, codeLang])

  return (
    <div className="space-y-4">
      {/* 1. Input Box: cURL Command Paste & Presets */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="size-4 text-primary" />
            <h2 className="text-xs font-bold text-foreground">
              Paste cURL Command
            </h2>
            <Badge
              variant="outline"
              className="text-[10px] font-mono border-primary/20 text-muted-foreground"
            >
              Bash, Cmd, PowerShell or DevTools
            </Badge>
          </div>

          <div className="flex items-center gap-1.5">
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value && (SAMPLE_CURLS as any)[e.target.value]) {
                  setCurlInput((SAMPLE_CURLS as any)[e.target.value])
                }
                e.target.value = ""
              }}
              className="h-7 rounded-md border border-border bg-background px-2 text-xs text-muted-foreground outline-none cursor-pointer hover:text-foreground"
            >
              <option value="" disabled>
                Load Sample cURL...
              </option>
              <option value="authPost">Orders API (POST + JWT + JSON Body)</option>
              <option value="kibanaQuery">Kibana Proxy (Basic Auth + Query)</option>
              <option value="swaggerSearch">Stage Gateway (API Key + iPhone UA)</option>
            </select>

            <Button
              size="xs"
              variant="ghost"
              onClick={() => setCurlInput("")}
              disabled={!curlInput}
              className="size-7 p-0 text-muted-foreground hover:text-destructive"
              title="Clear input"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>

        <textarea
          value={curlInput}
          onChange={(e) => setCurlInput(e.target.value)}
          placeholder="Paste curl 'https://api.example.com/...' -H 'Authorization: ...' --data-raw '...'"
          spellCheck={false}
          className="w-full h-32 rounded-xl border border-border bg-[#0d1117] text-[#c9d1d9] p-3 font-mono text-xs leading-relaxed outline-none resize-none selection:bg-sky-900/60"
        />
      </div>

      {/* 2. Target URL & Method Card */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Badge
              variant="outline"
              className={cn("px-2.5 py-0.5 text-xs font-mono font-bold uppercase", getMethodColor(parsed.method))}
            >
              {parsed.method || "GET"}
            </Badge>

            <span className="font-mono text-xs font-semibold text-foreground truncate select-all">
              {parsed.url || "https://..."}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="xs"
              variant="outline"
              onClick={() => copyText(parsed.url, "url")}
              className="gap-1 text-xs"
              title="Copy URL"
            >
              {copiedId === "url" ? (
                <Check className="size-3 text-emerald-500" />
              ) : (
                <Copy className="size-3" />
              )}
              <span>Copy URL</span>
            </Button>

            {parsed.url.startsWith("http") && (
              <a
                href={parsed.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button size="xs" variant="ghost" className="size-7 p-0">
                  <ExternalLink className="size-3.5" />
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* URL Component Breakdown Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono">
          <div className="rounded-lg border border-border/80 bg-muted/20 p-2 space-y-0.5">
            <span className="text-muted-foreground block text-[10px] uppercase font-sans">
              Protocol & Host
            </span>
            <span className="text-foreground font-semibold truncate block">
              {parsed.protocol}// {parsed.host || "—"}
            </span>
          </div>

          <div className="rounded-lg border border-border/80 bg-muted/20 p-2 space-y-0.5">
            <span className="text-muted-foreground block text-[10px] uppercase font-sans">
              Pathname
            </span>
            <span className="text-foreground font-semibold truncate block">
              {parsed.pathname || "/"}
            </span>
          </div>

          <div className="rounded-lg border border-border/80 bg-muted/20 p-2 space-y-0.5">
            <span className="text-muted-foreground block text-[10px] uppercase font-sans">
              Query Parameters
            </span>
            <span className="text-foreground font-semibold block">
              {parsed.queryParams.length} params
            </span>
          </div>

          <div className="rounded-lg border border-border/80 bg-muted/20 p-2 space-y-0.5">
            <span className="text-muted-foreground block text-[10px] uppercase font-sans">
              Headers & Cookies
            </span>
            <span className="text-foreground font-semibold block">
              {parsed.headers.length} headers • {parsed.cookies.length} cookies
            </span>
          </div>
        </div>
      </div>

      {/* 3. Client Device & User-Agent Inspector Card */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <div className="flex items-center gap-2">
            {renderDeviceIcon(parsed.clientInfo.deviceType)}
            <h3 className="text-xs font-bold text-foreground">
              Client Device & User-Agent Inspector
            </h3>
          </div>

          <Badge variant="outline" className="text-[10px] font-mono">
            {parsed.clientInfo.deviceType || "Unknown"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border/70 bg-muted/20 p-2.5">
            <span className="text-[10px] uppercase text-muted-foreground block">
              Operating System
            </span>
            <span className="text-xs font-bold text-foreground mt-0.5 block">
              {parsed.clientInfo.os || "Not specified"}
            </span>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/20 p-2.5">
            <span className="text-[10px] uppercase text-muted-foreground block">
              Browser / Engine
            </span>
            <span className="text-xs font-bold text-foreground mt-0.5 block">
              {parsed.clientInfo.browser || "Not specified"}
            </span>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/20 p-2.5">
            <span className="text-[10px] uppercase text-muted-foreground block">
              Device Category
            </span>
            <span className="text-xs font-bold text-foreground mt-0.5 block">
              {parsed.clientInfo.deviceType || "Unknown"}
            </span>
          </div>
        </div>

        {parsed.clientInfo.userAgent && (
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs font-mono text-muted-foreground">
            <span className="truncate select-all mr-2">
              {parsed.clientInfo.userAgent}
            </span>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => copyText(parsed.clientInfo.userAgent || "", "ua")}
              className="size-6 p-0 shrink-0"
              title="Copy User-Agent string"
            >
              {copiedId === "ua" ? (
                <Check className="size-3 text-emerald-500" />
              ) : (
                <Copy className="size-3" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* 4. Authentication & Token Extractor Card */}
      {parsed.auth.type !== "none" && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <div className="flex items-center gap-2">
              <KeyRound className="size-4 text-amber-500" />
              <h3 className="text-xs font-bold text-foreground">
                Authentication & Token Extracted
              </h3>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] uppercase font-mono border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10"
            >
              {parsed.auth.type} Auth
            </Badge>
          </div>

          {parsed.auth.type === "bearer" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium">Bearer Token / JWT:</span>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => copyText(parsed.auth.token || "", "bearer_token")}
                  className="gap-1 text-xs"
                >
                  {copiedId === "bearer_token" ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  <span>Copy Token</span>
                </Button>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-3 font-mono text-xs text-foreground break-all select-all">
                {parsed.auth.token}
              </div>
            </div>
          )}

          {parsed.auth.type === "basic" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-border/80 bg-muted/20 p-2.5 space-y-1">
                <span className="text-[10px] uppercase text-muted-foreground">
                  Username
                </span>
                <span className="font-mono font-semibold text-foreground block">
                  {parsed.auth.username || "—"}
                </span>
              </div>
              <div className="rounded-xl border border-border/80 bg-muted/20 p-2.5 space-y-1">
                <span className="text-[10px] uppercase text-muted-foreground">
                  Password
                </span>
                <span className="font-mono font-semibold text-foreground block">
                  {parsed.auth.password ? "••••••••" : "—"}
                </span>
              </div>
            </div>
          )}

          {parsed.auth.type === "custom" && (
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="font-mono font-semibold text-foreground">
                  Header: {parsed.auth.headerName}
                </span>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => copyText(parsed.auth.token || "", "custom_token")}
                  className="size-6 p-0"
                >
                  {copiedId === "custom_token" ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </Button>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-2.5 font-mono text-xs text-foreground select-all break-all">
                {parsed.auth.token}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Tabbed Detailed Breakdown: Payload, Query Params, Headers, Code Generator */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {/* Tabs Bar */}
        <div className="flex items-center gap-1 border-b border-border bg-muted/30 px-3 py-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
              activeTab === "overview"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Layers className="size-3.5" />
            <span>Payload / Body</span>
            {parsed.body.raw && (
              <Badge
                variant="outline"
                className="ml-1 text-[9px] font-mono px-1 py-0"
              >
                {parsed.body.isJson ? "JSON" : "Raw"}
              </Badge>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("params")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
              activeTab === "params"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Globe className="size-3.5" />
            <span>Query Params ({parsed.queryParams.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("headers")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
              activeTab === "headers"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Server className="size-3.5" />
            <span>Headers ({parsed.headers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer",
              activeTab === "code"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Code2 className="size-3.5 text-amber-500" />
            <span>Code Generator</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4">
          {/* TAB 1: PAYLOAD / BODY */}
          {activeTab === "overview" && (
            <div>
              {parsed.body.raw ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {parsed.body.isJson ? "Formatted JSON Payload" : "Raw Body Payload"}
                      </span>
                      {parsed.body.isJson && (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-mono text-[10px]"
                        >
                          Valid JSON
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() =>
                          copyText(
                            parsed.body.formattedJson || parsed.body.raw,
                            "body_payload"
                          )
                        }
                        className="gap-1 text-xs"
                      >
                        {copiedId === "body_payload" ? (
                          <Check className="size-3 text-emerald-500" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                        <span>Copy Payload</span>
                      </Button>

                      {parsed.body.isJson && onSendToJsonFormatter && (
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() =>
                            onSendToJsonFormatter(
                              parsed.body.formattedJson || parsed.body.raw
                            )
                          }
                          className="gap-1 text-xs text-primary"
                        >
                          <FileJson className="size-3" />
                          <span>Open in JSON Viewer</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  <pre className="rounded-xl border border-border bg-[#0d1117] text-[#c9d1d9] p-4 font-mono text-xs overflow-x-auto max-h-[340px] leading-relaxed select-all">
                    {parsed.body.formattedJson || parsed.body.raw}
                  </pre>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <p>No request body payload provided in this cURL command.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: QUERY PARAMS */}
          {activeTab === "params" && (
            <div>
              {parsed.queryParams.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <p>No query parameters in the target URL.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-muted-foreground font-mono text-[11px]">
                        <th className="px-3 py-2 w-1/3">Parameter Key</th>
                        <th className="px-3 py-2">Value</th>
                        <th className="px-3 py-2 w-16 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-mono text-xs">
                      {parsed.queryParams.map((param, i) => (
                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                          <td className="px-3 py-2 font-semibold text-sky-600 dark:text-sky-400">
                            {param.key}
                          </td>
                          <td className="px-3 py-2 text-foreground break-all select-all">
                            {param.value}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => copyText(param.value, `param-${i}`)}
                              className="size-6 p-0"
                              title="Copy value"
                            >
                              {copiedId === `param-${i}` ? (
                                <Check className="size-3 text-emerald-500" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HEADERS */}
          {activeTab === "headers" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 size-3 text-muted-foreground" />
                  <Input
                    placeholder="Filter headers..."
                    value={headerSearch}
                    onChange={(e) => setHeaderSearch(e.target.value)}
                    className="h-8 pl-8 text-xs font-mono"
                  />
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {filteredHeaders.length} of {parsed.headers.length} headers
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-muted-foreground font-mono text-[11px]">
                      <th className="px-3 py-2 w-1/3">Header Name</th>
                      <th className="px-3 py-2">Header Value</th>
                      <th className="px-3 py-2 w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 font-mono text-xs">
                    {filteredHeaders.map((h, i) => {
                      const isAuth = /authorization|cookie|api-key/i.test(h.key)
                      return (
                        <tr
                          key={i}
                          className={cn(
                            "hover:bg-muted/30 transition-colors",
                            isAuth && "bg-amber-500/5 dark:bg-amber-500/10"
                          )}
                        >
                          <td className="px-3 py-2 font-semibold text-foreground">
                            {h.key}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground break-all select-all">
                            {h.value}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => copyText(h.value, `h-${i}`)}
                              className="size-6 p-0"
                              title="Copy header value"
                            >
                              {copiedId === `h-${i}` ? (
                                <Check className="size-3 text-emerald-500" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CODE GENERATOR */}
          {activeTab === "code" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
                <div className="flex items-center gap-1.5">
                  {(
                    [
                      { id: "fetch", label: "fetch (JS/TS)" },
                      { id: "axios", label: "axios (JS/TS)" },
                      { id: "python", label: "Python requests" },
                      { id: "curl_clean", label: "Clean cURL" },
                    ] as const
                  ).map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setCodeLang(lang.id)}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer transition-colors",
                        codeLang === lang.id
                          ? "bg-primary text-primary-foreground shadow-2xs"
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>

                <Button
                  size="xs"
                  onClick={() => copyText(generatedCode, "code_gen")}
                  className="gap-1 text-xs cursor-pointer"
                >
                  {copiedId === "code_gen" ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  <span>Copy Code</span>
                </Button>
              </div>

              <pre className="rounded-xl border border-border bg-[#0d1117] text-[#c9d1d9] p-4 font-mono text-xs overflow-x-auto leading-relaxed select-all">
                {generatedCode}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
