"use client"

import * as React from "react"
import {
  Search,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Flame,
  Globe,
  Tag,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { EXTERNAL_DEV_TOOLS, ExternalDevTool } from "./web-tools-data"

const CATEGORIES = [
  "All",
  "Converters",
  "API & Network",
  "Performance & Specs",
  "RegEx & Parsers",
  "Diagrams & Design",
  "Security & Utilities",
] as const

export function InternetLaunchpad() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All")
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const handleCopy = (tool: ExternalDevTool) => {
    navigator.clipboard.writeText(tool.url)
    setCopiedId(tool.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredTools = React.useMemo(() => {
    return EXTERNAL_DEV_TOOLS.filter((tool) => {
      const matchesCategory =
        selectedCategory === "All" || tool.category === selectedCategory
      const query = searchQuery.trim().toLowerCase()
      if (!query) return matchesCategory

      const matchesSearch =
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.tags.some((t) => t.toLowerCase().includes(query)) ||
        tool.url.toLowerCase().includes(query)

      return matchesCategory && matchesSearch
    })
  }, [searchQuery, selectedCategory])

  const popularCount = EXTERNAL_DEV_TOOLS.filter((t) => t.isPopular).length

  return (
    <div className="space-y-4">
      {/* Search & Category Filter Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-4 shadow-2xs backdrop-blur-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tools by name, tag (e.g. typescript, diagram, webhook)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono text-emerald-500 font-semibold">
              {filteredTools.length}
            </span>{" "}
            <span>tools available</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-amber-500">
              <Flame className="size-3.5 fill-amber-500/20" />
              <span>{popularCount} curated picks</span>
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid of External Dev Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {filteredTools.map((tool) => {
          const isCopied = copiedId === tool.id

          return (
            <div
              key={tool.id}
              className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm"
            >
              <div className="space-y-2">
                {/* Header: Title, Category & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                      {tool.badge && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-mono px-1.5 py-0",
                            tool.badge === "Must-Have" &&
                              "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                            tool.badge === "Popular" &&
                              "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400",
                            tool.badge === "Indispensable" &&
                              "border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400",
                            tool.badge === "Postman Alt" &&
                              "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                            tool.badge === "Live Debug" &&
                              "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          )}
                        >
                          {tool.badge}
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {tool.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(tool)}
                      className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Copy URL"
                    >
                      {isCopied ? (
                        <Check className="size-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {tool.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  {tool.tags.map((tag) => (
                    <span
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="cursor-pointer inline-flex items-center rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Launch Button */}
              <div className="pt-4 border-t border-border/50 mt-3 flex items-center justify-between">
                <span className="font-mono text-[11px] text-muted-foreground/80 truncate max-w-[180px]">
                  {tool.url.replace(/^https?:\/\//, "")}
                </span>

                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-2xs"
                >
                  <span>Launch Tool</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
          <Globe className="size-8 text-muted-foreground/50 mb-2" />
          <p className="text-sm font-semibold">No developer tools found</p>
          <p className="text-xs">Try searching with a different query or resetting category filters.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("")
              setSelectedCategory("All")
            }}
            className="mt-3 text-xs"
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  )
}
