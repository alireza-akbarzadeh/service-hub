"use client"

import * as React from "react"
import {
  Code2,
  Copy,
  Check,
  Sparkles,
  Info,
  Layers,
  Play,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface MatchGroup {
  index: number
  match: string
  groups: string[]
  start: number
  end: number
}

const REGEX_PRESETS = [
  {
    name: "Email Address",
    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    flags: "i",
    sample: "developer@servicehub.corp\ninvalid-email@\ntest.user+tag@domain.co.uk",
    category: "Validation",
  },
  {
    name: "Iranian Mobile (09...)",
    pattern: "^09\\d{9}$",
    flags: "m",
    sample: "09121234567\n09359876543\n09191112233\n02188776655",
    category: "Local",
  },
  {
    name: "URL with HTTPS/HTTP",
    pattern: "https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)",
    flags: "g",
    sample: "Visit https://nextjs.org or check http://localhost:3000/ai for docs.",
    category: "Web",
  },
  {
    name: "UUID v4",
    pattern: "[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}",
    flags: "gi",
    sample: "Generated ids:\n550e8400-e29b-41d4-a716-446655440000\n6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    category: "Identifiers",
  },
  {
    name: "IPv4 Address",
    pattern: "(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)",
    flags: "g",
    sample: "DNS Servers: 1.1.1.1 and 8.8.8.8, router gateway at 192.168.1.1",
    category: "Network",
  },
  {
    name: "SemVer Versioning",
    pattern: "v?(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?",
    flags: "g",
    sample: "Current versions: v1.0.0, 16.4.2-beta.1, 2.0.0+build.184",
    category: "Development",
  },
  {
    name: "Strong Password (8+ chars)",
    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
    flags: "",
    sample: "P@ssword123\nweakpass\nSuperSecret!2026",
    category: "Security",
  },
  {
    name: "Hex Color (#RGB / #RRGGBB)",
    pattern: "#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b",
    flags: "g",
    sample: "Primary color: #3b82f6, dark background: #0f172a, short accent: #f43",
    category: "CSS",
  },
]

export function RegexTester() {
  const [pattern, setPattern] = React.useState<string>(
    "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
  )
  const [flagGlobal, setFlagGlobal] = React.useState<boolean>(true)
  const [flagCaseInsensitive, setFlagCaseInsensitive] = React.useState<boolean>(true)
  const [flagMultiline, setFlagMultiline] = React.useState<boolean>(true)
  const [flagDotAll, setFlagDotAll] = React.useState<boolean>(false)

  const [testText, setTestText] = React.useState<string>(
    "developer@servicehub.corp\ninvalid-email@\ntest.user+tag@domain.co.uk\nadmin@internal.local"
  )

  const [replacePattern, setReplacePattern] = React.useState<string>("[MATCH: $&]")
  const [showReplace, setShowReplace] = React.useState<boolean>(false)
  const [copiedRegex, setCopiedRegex] = React.useState<boolean>(false)

  // Assemble flags
  const flags = React.useMemo(() => {
    let f = ""
    if (flagGlobal) f += "g"
    if (flagCaseInsensitive) f += "i"
    if (flagMultiline) f += "m"
    if (flagDotAll) f += "s"
    return f
  }, [flagGlobal, flagCaseInsensitive, flagMultiline, flagDotAll])

  // Execute regex
  const { matches, error, replacedText } = React.useMemo(() => {
    if (!pattern) return { matches: [], error: null, replacedText: testText }

    try {
      const reg = new RegExp(pattern, flags)
      const foundMatches: MatchGroup[] = []

      if (flags.includes("g")) {
        let m: RegExpExecArray | null
        let iterations = 0
        while ((m = reg.exec(testText)) !== null && iterations < 500) {
          iterations++
          foundMatches.push({
            index: m.index,
            match: m[0],
            groups: m.slice(1),
            start: m.index,
            end: m.index + m[0].length,
          })
          if (m[0].length === 0) {
            reg.lastIndex++
          }
        }
      } else {
        const m = reg.exec(testText)
        if (m) {
          foundMatches.push({
            index: m.index,
            match: m[0],
            groups: m.slice(1),
            start: m.index,
            end: m.index + m[0].length,
          })
        }
      }

      let replaced = ""
      try {
        replaced = testText.replace(reg, replacePattern)
      } catch {
        replaced = testText
      }

      return { matches: foundMatches, error: null, replacedText: replaced }
    } catch (err: any) {
      return { matches: [], error: err?.message || "Invalid Regular Expression", replacedText: testText }
    }
  }, [pattern, flags, testText, replacePattern])

  const handleCopyPattern = () => {
    navigator.clipboard.writeText(`/${pattern}/${flags}`)
    setCopiedRegex(true)
    setTimeout(() => setCopiedRegex(false), 2000)
  }

  const handleApplyPreset = (preset: (typeof REGEX_PRESETS)[0]) => {
    setPattern(preset.pattern)
    setFlagGlobal(preset.flags.includes("g"))
    setFlagCaseInsensitive(preset.flags.includes("i"))
    setFlagMultiline(preset.flags.includes("m"))
    setFlagDotAll(preset.flags.includes("s"))
    setTestText(preset.sample)
  }

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
            <Code2 className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                Interactive RegEx Tester & Debugger
              </h2>
              <Badge
                variant="outline"
                className="border-indigo-500/40 bg-indigo-500/10 text-[10px] font-mono text-indigo-600 dark:text-indigo-400"
              >
                Live AST Matcher
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time regex evaluation with capture groups, live replacement simulator, and battle-tested presets.
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleCopyPattern}
          className="text-xs font-mono gap-1.5 cursor-pointer h-8 border-border/80"
        >
          {copiedRegex ? (
            <>
              <Check className="size-3 text-emerald-500" />
              <span>Copied /{flags}</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copy Expression</span>
            </>
          )}
        </Button>
      </div>

      {/* RegEx Input Bar with Flags */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Main Regex Expression Input */}
          <div className="relative flex-1">
            <div className="flex items-center rounded-xl border border-border/80 bg-muted/30 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 px-3 py-1 font-mono text-sm">
              <span className="text-primary font-bold text-base mr-1 select-none">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regular expression..."
                className="w-full bg-transparent text-xs text-foreground outline-none font-mono py-1"
              />
              <span className="text-primary font-bold text-base ml-1 select-none">/{flags}</span>
            </div>
          </div>

          {/* Flags Toggles */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              {
                flag: "g",
                name: "Global",
                active: flagGlobal,
                toggle: () => setFlagGlobal(!flagGlobal),
              },
              {
                flag: "i",
                name: "Case Insensitive",
                active: flagCaseInsensitive,
                toggle: () => setFlagCaseInsensitive(!flagCaseInsensitive),
              },
              {
                flag: "m",
                name: "Multiline",
                active: flagMultiline,
                toggle: () => setFlagMultiline(!flagMultiline),
              },
              {
                flag: "s",
                name: "DotAll",
                active: flagDotAll,
                toggle: () => setFlagDotAll(!flagDotAll),
              },
            ].map((f) => (
              <button
                key={f.flag}
                type="button"
                onClick={f.toggle}
                className={cn(
                  "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-mono font-semibold transition-all border",
                  f.active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted"
                )}
                title={f.name}
              >
                <span>{f.flag}</span>
                <span className="text-[10px] ml-1 opacity-70 hidden sm:inline">({f.name})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error message if syntax is invalid */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span className="font-mono">{error}</span>
          </div>
        )}

        {/* Presets Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-border/60">
          <span className="text-[11px] font-semibold text-muted-foreground shrink-0 mr-1">
            Presets:
          </span>
          {REGEX_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md border border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer shrink-0 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Test String Input vs Matches Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (6 cols): Test Input Area */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <FileText className="size-3.5 text-primary" />
                Test Subject String
              </span>
              <button
                type="button"
                onClick={() => setTestText("")}
                className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Clear
              </button>
            </div>

            <textarea
              rows={9}
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Paste or type text to test regex matches..."
              className="w-full rounded-xl border border-border/80 bg-background/80 p-3 font-mono text-xs leading-relaxed outline-none focus:border-primary"
            />

            {/* Replacement Simulator Toggle */}
            <div className="border-t border-border/60 pt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-1.5 font-semibold text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showReplace}
                    onChange={(e) => setShowReplace(e.target.checked)}
                    className="rounded accent-primary"
                  />
                  <span>Enable RegEx Replacement Simulator</span>
                </label>
              </div>

              {showReplace && (
                <div className="space-y-2 pt-1 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground font-mono">Substitute:</span>
                    <Input
                      value={replacePattern}
                      onChange={(e) => setReplacePattern(e.target.value)}
                      placeholder="e.g. [$1] or ***"
                      className="h-8 text-xs font-mono bg-muted/40"
                    />
                  </div>

                  <div className="rounded-xl border border-border/60 bg-muted/20 p-2.5">
                    <span className="block text-[10px] font-semibold text-muted-foreground mb-1">
                      Resulting String:
                    </span>
                    <pre className="font-mono text-xs text-foreground whitespace-pre-wrap break-all max-h-36 overflow-y-auto">
                      {replacedText}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): Match Details & Capture Groups */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">Matches Found</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "font-mono text-[10px] px-1.5 py-0",
                    matches.length > 0
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {matches.length} {matches.length === 1 ? "match" : "matches"}
                </Badge>
              </div>
            </div>

            {matches.length > 0 ? (
              <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
                {matches.map((m, idx) => (
                  <div
                    key={`${m.index}-${idx}`}
                    className="rounded-xl border border-border/70 bg-muted/20 p-2.5 space-y-1.5 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-mono px-1 py-0">
                          #{idx + 1}
                        </Badge>
                        <span className="text-muted-foreground text-[11px]">
                          pos [{m.start} - {m.end}]
                        </span>
                      </div>
                      <span className="text-muted-foreground text-[10px]">
                        length: {m.match.length}
                      </span>
                    </div>

                    <div className="rounded-lg bg-background/90 p-2 border border-border/50 font-bold text-foreground break-all text-xs">
                      {m.match}
                    </div>

                    {m.groups.length > 0 && (
                      <div className="pl-2 pt-1 border-l-2 border-primary/40 space-y-1">
                        <span className="text-[10px] text-muted-foreground block font-sans font-semibold">
                          Capture Groups:
                        </span>
                        {m.groups.map((grp, gIdx) => (
                          <div
                            key={gIdx}
                            className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
                          >
                            <span className="text-primary font-bold">${gIdx + 1}:</span>
                            <span className="text-foreground bg-muted/40 px-1.5 py-0.2 rounded border border-border/40">
                              {grp !== undefined ? grp : "(empty)"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2">
                <AlertCircle className="size-8 opacity-40" />
                <p className="text-xs">
                  {pattern ? "No matches found in the test string." : "Enter a pattern to evaluate."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
