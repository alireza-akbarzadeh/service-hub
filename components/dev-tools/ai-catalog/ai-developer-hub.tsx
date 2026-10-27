"use client"

import * as React from "react"
import {
  AI_DEVELOPER_TOOLS,
  DEVELOPER_PROMPTS,
  type AiToolItem,
  type PromptTemplate,
} from "./ai-tools-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AiGuideModal } from "./ai-guide-modal"
import { AiToolDialog } from "./ai-tool-dialog"
import { AiPromptDialog } from "./ai-prompt-dialog"
import {
  ArrowUpRight,
  BookOpen,
  Bot,
  BrainCircuit,
  Check,
  Code2,
  Copy,
  Cpu,
  Database,
  Edit2,
  ExternalLink,
  FileCode2,
  FileEdit,
  Filter,
  Flame,
  Globe2,
  Layers,
  Lightbulb,
  MessageSquareCode,
  Plus,
  Rocket,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trash2,
  Wand2,
  Wrench,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function AiDeveloperHub() {
  const [tools, setTools] = React.useState<AiToolItem[]>(AI_DEVELOPER_TOOLS)
  const [prompts, setPrompts] = React.useState<PromptTemplate[]>(DEVELOPER_PROMPTS)
  const [isLoading, setIsLoading] = React.useState(false)

  // Filters & State
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")
  const [selectedPricing, setSelectedPricing] = React.useState<string>("all")
  const [activeViewMode, setActiveViewMode] = React.useState<"tools" | "prompts">("tools")

  // Copy feedback
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [copiedCommandId, setCopiedCommandId] = React.useState<string | null>(null)
  const [copiedPromptId, setCopiedPromptId] = React.useState<string | null>(null)

  // Modals state
  const [guideTool, setGuideTool] = React.useState<AiToolItem | null>(null)
  const [isGuideOpen, setIsGuideOpen] = React.useState(false)

  const [toolModalOpen, setToolModalOpen] = React.useState(false)
  const [editingTool, setEditingTool] = React.useState<AiToolItem | null>(null)

  const [promptModalOpen, setPromptModalOpen] = React.useState(false)
  const [editingPrompt, setEditingPrompt] = React.useState<PromptTemplate | null>(null)

  // Fetch from API on mount
  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [toolsRes, promptsRes] = await Promise.all([
          fetch("/api/ai/tools"),
          fetch("/api/ai/prompts"),
        ])
        if (toolsRes.ok) {
          const toolsData = await toolsRes.json()
          if (toolsData.success && Array.isArray(toolsData.tools) && toolsData.tools.length > 0) {
            setTools(toolsData.tools)
          }
        }
        if (promptsRes.ok) {
          const promptsData = await promptsRes.json()
          if (promptsData.success && Array.isArray(promptsData.prompts) && promptsData.prompts.length > 0) {
            setPrompts(promptsData.prompts)
          }
        }
      } catch (err) {
        console.warn("Could not load AI data from API, using fallback defaults:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Tool CRUD Handlers
  const handleSaveTool = async (payload: Partial<AiToolItem>): Promise<boolean> => {
    try {
      const res = await fetch("/api/ai/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.tool) {
          setTools((prev) => {
            const index = prev.findIndex((t) => t.id === data.tool.id)
            if (index >= 0) {
              const updated = [...prev]
              updated[index] = data.tool
              return updated
            }
            return [data.tool, ...prev]
          })
          return true
        }
      }
    } catch (err) {
      console.error("Save tool error:", err)
    }
    return false
  }

  const handleDeleteTool = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!confirm("Are you sure you want to remove this AI tool?")) return

    try {
      const res = await fetch(`/api/ai/tools?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setTools((prev) => prev.filter((t) => t.id !== id))
      }
    } catch (err) {
      console.error("Delete tool error:", err)
    }
  }

  // Prompt CRUD Handlers
  const handleSavePrompt = async (payload: Partial<PromptTemplate>): Promise<boolean> => {
    try {
      const res = await fetch("/api/ai/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.prompt) {
          setPrompts((prev) => {
            const index = prev.findIndex((p) => p.id === data.prompt.id)
            if (index >= 0) {
              const updated = [...prev]
              updated[index] = data.prompt
              return updated
            }
            return [data.prompt, ...prev]
          })
          return true
        }
      }
    } catch (err) {
      console.error("Save prompt error:", err)
    }
    return false
  }

  const handleDeletePrompt = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prompt template?")) return

    try {
      const res = await fetch(`/api/ai/prompts?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setPrompts((prev) => prev.filter((p) => p.id !== id))
      }
    } catch (err) {
      console.error("Delete prompt error:", err)
    }
  }

  // Filter tools
  const filteredTools = React.useMemo(() => {
    return tools.filter((tool) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.tagline.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.workflowTips.toLowerCase().includes(q) ||
        tool.bestFor.some((tag) => tag.toLowerCase().includes(q))

      const matchesCategory =
        selectedCategory === "all" || tool.category === selectedCategory

      const matchesPricing =
        selectedPricing === "all" ||
        (selectedPricing === "free" &&
          (tool.pricing.includes("Free") || tool.pricing.includes("Open Source"))) ||
        (selectedPricing === "freemium" && tool.pricing === "Freemium") ||
        (selectedPricing === "api" && tool.pricing === "Usage API")

      return matchesSearch && matchesCategory && matchesPricing
    })
  }, [tools, searchQuery, selectedCategory, selectedPricing])

  // Filter prompts
  const filteredPrompts = React.useMemo(() => {
    return prompts.filter((p) => {
      const q = searchQuery.toLowerCase().trim()
      return (
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.prompt.toLowerCase().includes(q) ||
        p.bestModel.toLowerCase().includes(q)
      )
    })
  }, [prompts, searchQuery])

  const handleCopyLink = (id: string, url: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    }
  }

  const handleCopyCommand = (id: string, cmd: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(cmd)
      setCopiedCommandId(id)
      setTimeout(() => setCopiedCommandId(null), 1500)
    }
  }

  const handleCopyPrompt = (id: string, text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedPromptId(id)
      setTimeout(() => setCopiedPromptId(null), 1500)
    }
  }

  const openGuide = (tool: AiToolItem, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setGuideTool(tool)
    setIsGuideOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-background p-5 sm:p-6 shadow-sm">
        <div className="absolute -right-8 -top-8 size-40 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 size-36 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-primary/40 bg-primary/15 text-primary text-[10px] font-mono px-2 py-0.5 gap-1.5 shadow-2xs"
              >
                <Sparkles className="size-3 animate-pulse" />
                AI for Developers & Full-Stacks (2026 Edition)
              </Badge>
              <Badge
                variant="outline"
                className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono px-2 py-0.5"
              >
                Full CRUD & Setup Guides (.md)
              </Badge>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Supercharge Your Full-Stack Engineering with AI
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Curated agentic IDEs, UI generators, serverless databases, fast inference engines,
              and code review agents. Complete with Markdown setup instructions and custom prompt library.
            </p>
          </div>

          {/* Quick Actions & View Switcher */}
          <div className="flex sm:flex-col items-center sm:items-end gap-2.5 shrink-0">
            {activeViewMode === "tools" ? (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setEditingTool(null)
                  setToolModalOpen(true)
                }}
                className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs text-xs cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Add AI Tool</span>
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setEditingPrompt(null)
                  setPromptModalOpen(true)
                }}
                className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs text-xs cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Add Prompt</span>
              </Button>
            )}

            <div className="flex items-center rounded-xl border border-border bg-muted/50 p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveViewMode("tools")}
                className={cn(
                  "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  activeViewMode === "tools"
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                AI Tools ({tools.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveViewMode("prompts")}
                className={cn(
                  "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-all gap-1.5 flex items-center",
                  activeViewMode === "prompts"
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <MessageSquareCode className="size-3.5 text-primary" />
                Prompts ({prompts.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeViewMode === "tools" ? (
        <>
          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search AI tools (e.g. Cursor, Postgres, v0, React, Ollama)..."
                className="h-9 text-xs bg-muted/40 pl-8 focus-visible:ring-primary"
              />
              <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Pricing Filter */}
            <div className="flex items-center gap-1.5 text-xs flex-wrap">
              <span className="text-muted-foreground text-[11px] font-medium hidden sm:inline">
                Pricing:
              </span>
              {[
                { id: "all", label: "All Pricing" },
                { id: "free", label: "Free / Open Source" },
                { id: "freemium", label: "Freemium" },
                { id: "api", label: "Usage API" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPricing(p.id)}
                  className={cn(
                    "cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors border",
                    selectedPricing === p.id
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-border/60 bg-card text-muted-foreground hover:bg-muted"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto border-b border-border pb-2">
            {[
              { id: "all", label: "All Tools", icon: Layers, count: tools.length },
              { id: "ide-agents", label: "Agentic IDEs & Editors", icon: Code2, count: tools.filter(t => t.category === "ide-agents").length },
              { id: "frontend-ui", label: "Frontend & Generative UI", icon: Wand2, count: tools.filter(t => t.category === "frontend-ui").length },
              { id: "backend-devops", label: "Backend, DB & DevOps", icon: Database, count: tools.filter(t => t.category === "backend-devops").length },
              { id: "models-apis", label: "Models & Reasoning", icon: BrainCircuit, count: tools.filter(t => t.category === "models-apis").length },
              { id: "review-testing", label: "Code Review & Testing", icon: ShieldCheck, count: tools.filter(t => t.category === "review-testing").length },
            ].map((tab) => {
              const isActive = selectedCategory === tab.id
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={cn(
                    "flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-bold ring-2 ring-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-3.5" />
                  <span>{tab.label}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-1.5 py-0 text-[10px] font-mono",
                      isActive
                        ? "border-white/40 bg-white/20 text-white"
                        : "border-border bg-muted/60 text-muted-foreground"
                    )}
                  >
                    {tab.count}
                  </Badge>
                </button>
              )
            })}
          </div>

          {/* Results Counter & Add Tool Shortcut */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing <strong>{filteredTools.length}</strong> AI developer tools
            </span>
            {(searchQuery || selectedCategory !== "all" || selectedPricing !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                  setSelectedPricing("all")
                }}
                className="text-primary hover:underline text-[11px] font-medium"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Tools Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => openGuide(tool)}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md cursor-pointer"
              >
                {/* Top: Icon, Title, Pricing Badge & Manage Actions */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm ring-1 ring-white/20",
                          tool.iconBg
                        )}
                      >
                        <Bot className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {tool.name}
                          </h3>
                        </div>
                        <span className="text-[11px] font-medium text-muted-foreground line-clamp-1">
                          {tool.tagline}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-mono px-2 py-0.5 shadow-2xs",
                          tool.pricing.includes("Free") || tool.pricing.includes("Open Source")
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : tool.pricing === "Freemium"
                              ? "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                              : "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        )}
                      >
                        {tool.pricing}
                      </Badge>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingTool(tool)
                          setToolModalOpen(true)
                        }}
                        className="size-6 text-muted-foreground hover:text-foreground rounded-md cursor-pointer"
                        title="Edit tool & markdown setup instructions"
                      >
                        <Edit2 className="size-3" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteTool(tool.id, e)}
                        className="size-6 text-muted-foreground hover:text-destructive rounded-md cursor-pointer"
                        title="Delete AI tool"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {tool.description}
                  </p>

                  {/* Pro Tip Box */}
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5 text-xs space-y-1">
                    <div className="flex items-center gap-1 font-semibold text-[11px] text-foreground">
                      <Lightbulb className="size-3 text-amber-500 shrink-0" />
                      <span>Full-Stack Pro Tip</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-normal">
                      {tool.workflowTips}
                    </p>
                  </div>

                  {/* Quick CLI Command if available */}
                  {tool.quickCommand && (
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-background/80 px-2.5 py-1.5 text-[11px] font-mono">
                      <div className="flex items-center gap-1.5 min-w-0 text-muted-foreground">
                        <Terminal className="size-3 text-emerald-500 shrink-0" />
                        <code className="truncate select-all text-foreground/90">
                          {tool.quickCommand}
                        </code>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleCopyCommand(tool.id, tool.quickCommand!, e)}
                        className="size-5 shrink-0 rounded-md cursor-pointer text-muted-foreground hover:text-foreground"
                        title="Copy command"
                      >
                        {copiedCommandId === tool.id ? (
                          <Check className="size-3 text-emerald-500" />
                        ) : (
                          <Copy className="size-3" />
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    {tool.bestFor.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground border border-border/40"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action Links */}
                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => openGuide(tool, e)}
                    className="h-7 px-2.5 text-[11px] font-medium gap-1 text-foreground border-border/80 hover:bg-muted cursor-pointer"
                  >
                    <BookOpen className="size-3 text-primary" />
                    <span>Setup Guide (.md)</span>
                  </Button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleCopyLink(tool.id, tool.url, e)}
                      className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
                      title="Share official link"
                    >
                      {copiedId === tool.id ? (
                        <>
                          <Check className="size-3 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="size-3" />
                        </>
                      )}
                    </Button>

                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex h-7 items-center gap-1 rounded-lg bg-primary px-3 text-[11px] font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                    >
                      <span>Visit</span>
                      <ArrowUpRight className="size-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Prompt Library View */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-4">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <MessageSquareCode className="size-4 text-primary" />
                Developer Prompt Library ({filteredPrompts.length})
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Save, copy, and edit battle-tested prompts for Claude 3.7 Sonnet, DeepSeek R1, Cursor, and ChatGPT.
              </p>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={() => {
                setEditingPrompt(null)
                setPromptModalOpen(true)
              }}
              className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs text-xs cursor-pointer shrink-0"
            >
              <Plus className="size-3.5" />
              <span>Create Prompt</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPrompts.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-foreground">
                      {item.title}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {item.category}
                      </Badge>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingPrompt(item)
                          setPromptModalOpen(true)
                        }}
                        className="size-6 text-muted-foreground hover:text-foreground rounded-md cursor-pointer"
                        title="Edit prompt"
                      >
                        <Edit2 className="size-3" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePrompt(item.id)}
                        className="size-6 text-muted-foreground hover:text-destructive rounded-md cursor-pointer"
                        title="Delete prompt"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Sparkles className="size-3 text-primary" />
                    <span>Recommended Model: <strong>{item.bestModel}</strong></span>
                  </div>

                  <pre className="rounded-xl border border-border/60 bg-muted/40 p-3 text-xs font-mono text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {item.prompt}
                  </pre>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyPrompt(item.id, item.prompt)}
                  className="w-full gap-2 text-xs font-semibold cursor-pointer border-primary/30 text-primary hover:bg-primary/10"
                >
                  {copiedPromptId === item.id ? (
                    <>
                      <Check className="size-3.5 text-emerald-500" />
                      <span>Copied Prompt to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>Copy Full-Stack Prompt</span>
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Setup Guide (.md) Modal */}
      <AiGuideModal
        tool={guideTool}
        open={isGuideOpen}
        onOpenChange={setIsGuideOpen}
        onEdit={(tool) => {
          setEditingTool(tool)
          setToolModalOpen(true)
        }}
      />

      {/* Add / Edit Tool Modal */}
      <AiToolDialog
        open={toolModalOpen}
        onOpenChange={setToolModalOpen}
        tool={editingTool}
        onSave={handleSaveTool}
      />

      {/* Add / Edit Prompt Modal */}
      <AiPromptDialog
        open={promptModalOpen}
        onOpenChange={setPromptModalOpen}
        prompt={editingPrompt}
        onSave={handleSavePrompt}
      />
    </div>
  )
}
