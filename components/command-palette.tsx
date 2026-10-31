"use client"

import { getServiceTags } from "@/components/services-dashboard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMeetings } from "@/hooks/use-meetings"
import type { Service } from "@/lib/db/schema"
import type { FrontendMeeting } from "@/lib/meetings-data"
import { cn } from "@/lib/utils"
import {
  Activity,
  AlignJustify,
  ArrowRight,
  BookOpen,
  Bot,
  Bug,
  Building2,
  CalendarDays,
  Check,
  Clock,
  Code2,
  Copy,
  CornerDownLeft,
  Cpu,
  Download,
  ExternalLink,
  FileJson,
  Fingerprint,
  Gamepad2,
  GitPullRequest,
  Globe,
  History,
  KeyRound,
  Layers,
  LayoutGrid,
  Lightbulb,
  MonitorCheck,
  Network,
  Plus,
  Rows3,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Zap,
  Terminal,
  Users,
  Video,
  X,
} from "lucide-react"
import * as React from "react"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  services: Service[]
  favorites: number[]
  onToggleFavorite: (id: number) => void
  onToggleRightPanel?: () => void
  onOpenSettings?: () => void
  onSelectViewShape?: (shape: "table" | "row-card" | "square-card") => void
  onOpenSubmitRequest?: (type?: "feature" | "bug" | "pull_request") => void
  onInspectService?: (service: Service, tab?: "overview" | "tester" | "docs") => void
  onOpenExport?: () => void
}

const ENV_ICONS: Record<string, React.ElementType> = {
  Develop: Code2,
  Test: MonitorCheck,
  Stage: Cpu,
  "DevOps & Tools": Network,
  "Portals & HR": Building2,
}

type PaletteAction = {
  type: "action"
  id: string
  title: string
  subtitle: string
  badge?: string
  icon: React.ElementType
  iconColor: string
  onSelect: () => void
}

type PaletteMeeting = {
  type: "meeting"
  id: string
  meeting: FrontendMeeting
}

type PaletteService = {
  type: "service"
  id: number
  service: Service
}

type PaletteItem = PaletteAction | PaletteMeeting | PaletteService

export function CommandPalette({
  open,
  onOpenChange,
  services,
  favorites,
  onToggleFavorite,
  onToggleRightPanel,
  onOpenSettings,
  onSelectViewShape,
  onOpenSubmitRequest,
  onInspectService,
  onOpenExport,
}: CommandPaletteProps) {
  const { meetings, addMeeting } = useMeetings()

  const [query, setQuery] = React.useState("")
  const [activeFilter, setActiveFilter] = React.useState<string>("All")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [copiedId, setCopiedId] = React.useState<number | string | null>(null)

  // Fast meeting creation state inside command palette
  const [isQuickCreateOpen, setIsQuickCreateOpen] = React.useState(false)
  const [quickTitle, setQuickTitle] = React.useState("")
  const [quickTime, setQuickTime] = React.useState("10:30")
  const [quickDuration, setQuickDuration] = React.useState(30)
  const [quickUrl, setQuickUrl] = React.useState("https://meet.google.com/new")

  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const lastMousePosRef = React.useRef({ x: 0, y: 0 })

  // Focus input when opened
  React.useEffect(() => {
    if (open) {
      setQuery("")
      setSelectedIndex(0)
      setIsQuickCreateOpen(false)
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Helper to open link safely
  const openUrl = React.useCallback(
    (url: string) => {
      if (!url) return
      const a = document.createElement("a")
      a.href = url
      a.target = "_blank"
      a.rel = "noopener noreferrer"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      onOpenChange(false)
    },
    [onOpenChange]
  )

  // Actions list for fast meeting creation & navigation
  const quickActions: PaletteAction[] = React.useMemo(() => {
    const actions: PaletteAction[] = [
      {
        type: "action",
        id: "act-dashboard-settings",
        title: "Dashboard View & Layout Settings",
        subtitle:
          "Customize 3 shapes (Table, Row Cards, Squared Cards), density, and edit raw JSON config",
        badge: "Layout Config",
        icon: SlidersHorizontal,
        iconColor: "text-primary bg-primary/15 border-primary/30",
        onSelect: () => {
          onOpenSettings?.()
          onOpenChange(false)
        },
      },
      {
        type: "action",
        id: "act-shape-table",
        title: "Switch View to Table Mode",
        subtitle:
          "Dense tabular list with sorting, columns, and inline telemetry status",
        badge: "Shape 1",
        icon: Rows3,
        iconColor: "text-sky-500 bg-sky-500/15 border-sky-500/30",
        onSelect: () => {
          onSelectViewShape?.("table")
          onOpenChange(false)
        },
      },
      {
        type: "action",
        id: "act-shape-row-card",
        title: "Switch View to Row Cards Mode",
        subtitle:
          "Horizontal expansive cards spanning the full width for modern catalog scanning",
        badge: "Shape 2",
        icon: AlignJustify,
        iconColor: "text-emerald-500 bg-emerald-500/15 border-emerald-500/30",
        onSelect: () => {
          onSelectViewShape?.("row-card")
          onOpenChange(false)
        },
      },
      {
        type: "action",
        id: "act-shape-square-card",
        title: "Switch View to Squared Cards Mode",
        subtitle:
          "Modular square box cards in a multi-column responsive grid layout",
        badge: "Shape 3",
        icon: LayoutGrid,
        iconColor: "text-amber-500 bg-amber-500/15 border-amber-500/30",
        onSelect: () => {
          onSelectViewShape?.("square-card")
          onOpenChange(false)
        },
      },
      {
        type: "action",
        id: "act-curl-inspector",
        title: "cURL Command Inspector",
        subtitle:
          "Parse cURL to extract URL, headers, Bearer tokens, JSON payload, and client device",
        badge: "New Tool",
        icon: Terminal,
        iconColor: "text-emerald-500 bg-emerald-500/15 border-emerald-500/30",
        onSelect: () => {
          window.location.href = "/tools"
          onOpenChange(false)
        },
      },
      {
        type: "action",
        id: "act-dev-tools",
        title: "Developer Tools & JSON Formatter",
        subtitle:
          "Launch interactive JSON formatter, tree inspector, JWT debugger, and encoders",
        badge: "Dev Suite",
        icon: FileJson,
        iconColor: "text-violet-500 bg-violet-500/15 border-violet-500/30",
        onSelect: () => {
          window.location.href = "/tools"
          onOpenChange(false)
        },
      },
      
      {
        type: "action",
        id: "act-service-docs",
        title: "Microservice Runbooks & Architecture Documentation",
        subtitle:
          "Browse technical runbooks, Docker setups, standard headers, and incident troubleshooting guides",
        badge: "Runbooks",
        icon: BookOpen,
        iconColor: "text-violet-500 bg-violet-500/15 border-violet-500/30",
        onSelect: () => {
          if (services.length > 0 && onInspectService) {
            onInspectService(services[0], "docs")
          }
          onOpenChange(false)
        },
      },
      {
        type: "action",
        id: "act-activity-feed",
        title: "Activity Feed & Enterprise Audit Trail",
        subtitle:
          "Live team activity stream, microservice deployments, PR review merges, and security audit logs",
        badge: "Audit Trail",
        icon: History,
        iconColor: "text-sky-500 bg-sky-500/15 border-sky-500/30",
        onSelect: () => {
          window.location.href = "/activity"
          onOpenChange(false)
        },
      },
      {
        type: "action",
        id: "act-env-studio",
        title: "Environment Variables & Secrets Studio",
        subtitle:
          "Interactive .env editor, multi-environment diff comparator, and Kubernetes ConfigMap generator",
        badge: "Config Studio",
        icon: KeyRound,
        iconColor: "text-emerald-500 bg-emerald-500/15 border-emerald-500/30",
        onSelect: () => {
          window.location.href = "/env"
          onOpenChange(false)
        },
      },
      {
        type: "action",
        id: "act-api-playground",
        title: "API Playground & HTTP Sandbox",
        subtitle:
          "In-browser REST tester, header & auth builder, code exporter (cURL, Fetch, Axios, Python, Go)",
        badge: "Sandbox",
        icon: Zap,
        iconColor: "text-amber-500 bg-amber-500/15 border-amber-500/30",
        onSelect: () => {
          window.location.href = "/playground"
          onOpenChange(false)
        },
      },
      {
        type: "action",
        id: "act-system-status",
        title: "Live System Status & SLA Observability",
        subtitle:
          "Check 30-day uptime SLA, batch health ping, active incidents, and scheduled maintenance",
        badge: "Status & SLA",
        icon: Activity,
        iconColor: "text-emerald-500 bg-emerald-500/15 border-emerald-500/30",
        onSelect: () => {
          window.location.href = "/status"
          onOpenChange(false)
        },
      },
      {
        type: "action",
        id: "act-topology-graph",
        title: "Microservice Topology & Dependency Graph",
        subtitle:
          "Interactive call graph, upstream/downstream callers, edge latency, and Mermaid exporter",
        badge: "Topology",
        icon: Network,
        iconColor: "text-cyan-500 bg-cyan-500/15 border-cyan-500/30",
        onSelect: () => {
          window.location.href = "/topology"
          onOpenChange(false)
        },
      },
      {
        type: "action",
        id: "act-export-sync",
        title: "Export API Catalog (Postman & OpenAPI 3.0)",
        subtitle:
          "Export all services as Postman Collection v2.1, OpenAPI 3.0 spec, or CSV spreadsheet",
        badge: "Postman / OpenAPI",
        icon: Download,
        iconColor: "text-orange-500 bg-orange-500/15 border-orange-500/30",
        onSelect: () => {
          if (onOpenExport) onOpenExport()
          onOpenChange(false)
        },
      },
      {
        type: "action",
        id: "act-web-tools",
        title: "Internet Dev Tools Launchpad & Web Utilities",
        subtitle:
          "Launch curated external dev tools (Transform.tools, Ray.so, CyberChef) + Epoch, URL & UUID tools",
        badge: "Launchpad",
        icon: Globe,
        iconColor: "text-sky-500 bg-sky-500/15 border-sky-500/30",
        onSelect: () => {
          window.location.href = "/tools/web"
          onOpenChange(false)
        },
      },
      {
        type: "action",
        id: "act-epoch-converter",
        title: "Unix Timestamp & Epoch Converter",
        subtitle:
          "Live epoch time, seconds/ms converter, UTC & Asia/Tehran local time calculator",
        badge: "Epoch Clock",
        icon: Clock,
        iconColor: "text-amber-500 bg-amber-500/15 border-amber-500/30",
        onSelect: () => {
          window.location.href = "/tools/web"
          onOpenChange(false)
        },
      },
      {
        type: "action",
        id: "act-uuid-generator",
        title: "UUID & Cryptographic Token Generator",
        subtitle:
          "Generate cryptographically secure UUID v4, NanoID, hex tokens, and API secret keys",
        badge: "UUID / Token",
        icon: Fingerprint,
        iconColor: "text-emerald-500 bg-emerald-500/15 border-emerald-500/30",
        onSelect: () => {
          window.location.href = "/tools/web"
          onOpenChange(false)
        },
      },
      {
        type: "action",
        id: "act-anon-chat",
        title: "Anonymous Chat Lounge & Channels",
        subtitle:
          "Chat anonymously with randomized avatar, dice rolls, sound notifications & channels (#game, #general)",
        badge: "Fun Lounge",
        icon: Gamepad2,
        iconColor: "text-pink-500 bg-pink-500/15 border-pink-500/30",
        onSelect: () => {
          window.location.href = "/chat"
          onOpenChange(false)
        },
      },
      {
        type: "action",
        id: "act-devops-explorer",
        title: "Workspace Query / Azure DevOps Explorer",
        subtitle:
          "Launch /workspace-query tool: WIQL queries, work items, and sprint delivery reports for Hastim",
        badge: "/workspace-query",
        icon: Terminal,
        iconColor: "text-blue-500 bg-blue-500/15 border-blue-500/30",
        onSelect: () => {
          window.location.href = "/workspace-query"
          onOpenChange(false)
        },
      },
      {
        type: "action",
        id: "act-access-management",
        title: "Access Management & Users Directory",
        subtitle:
          "Manage team members, roles (Admin/Developer/Viewer), Gmail accounts, and RBAC permissions",
        badge: "Auth & Users",
        icon: Users,
        iconColor: "text-indigo-500 bg-indigo-500/15 border-indigo-500/30",
        onSelect: () => {
          window.location.href = "/users"
          onOpenChange(false)
        },
      },
      {
        type: "action",
        id: "act-ai-hub",
        title: "AI Tools for Developers & Full-Stacks",
        subtitle:
          "Explore curated AI coding assistants (Cursor, Claude Code), UI generators (v0, 21st.dev), serverless databases & prompts",
        badge: "/ai",
        icon: Bot,
        iconColor: "text-primary bg-primary/15 border-primary/30",
        onSelect: () => {
          window.location.href = "/ai"
          onOpenChange(false)
        },
      },
      {
        type: "action",
        id: "act-calendar-hub",
        title: "Calendar, Meetings & Iran Sync Hub",
        subtitle:
          "Dedicated scheduling command center: Google Meet launcher, Iranian Jalali calendar & CS2 squad match",
        badge: "/calendar",
        icon: CalendarDays,
        iconColor: "text-emerald-500 bg-emerald-500/15 border-emerald-500/30",
        onSelect: () => {
          window.location.href = "/calendar"
          onOpenChange(false)
        },
      },
      {
        type: "action",
        id: "act-advanced-dev-tools",
        title: "Advanced Developer Tools (Image Compressor, RegEx, Diff, Cron)",
        subtitle:
          "Client-side image compressor & WebP converter, RegEx evaluator, Git code diff checker, Cron schedule builder, and Tailwind palettes",
        badge: "/tools/advanced",
        icon: Sparkles,
        iconColor: "text-emerald-500 bg-emerald-500/15 border-emerald-500/30",
        onSelect: () => {
          window.location.href = "/tools/advanced"
          onOpenChange(false)
        },
      },
      {
        type: "action",
        id: "act-instant-meet",
        title: "Start Instant Google Meet",
        subtitle:
          "Launch a new Google Meet call in a new tab (meet.google.com/new)",
        badge: "Fast Launch",
        icon: Video,
        iconColor: "text-emerald-500 bg-emerald-500/15 border-emerald-500/30",
        onSelect: () => {
          openUrl("https://meet.google.com/new")
        },
      },
      {
        type: "action",
        id: "act-schedule-meet",
        title: "Schedule New Frontend Meeting",
        subtitle:
          "Add a new sync to the schedule with push reminders and Tehran time",
        badge: "+ New Sync",
        icon: Plus,
        iconColor: "text-sky-500 bg-sky-500/15 border-sky-500/30",
        onSelect: () => {
          setIsQuickCreateOpen(true)
        },
      },
      {
        type: "action",
        id: "act-submit-feature",
        title: "Submit Feature Request",
        subtitle:
          "Propose a new feature, endpoint, or developer workflow enhancement",
        badge: "💡 Feature",
        icon: Lightbulb,
        iconColor: "text-emerald-500 bg-emerald-500/15 border-emerald-500/30",
        onSelect: () => {
          onOpenChange(false)
          if (onOpenSubmitRequest) {
            onOpenSubmitRequest("feature")
          } else {
            window.location.href = "/requests"
          }
        },
      },
      {
        type: "action",
        id: "act-report-bug",
        title: "Report Bug or Outage",
        subtitle:
          "Report broken endpoint, 504 gateway timeout, CORS error, or Swagger issue",
        badge: "🐞 Bug",
        icon: Bug,
        iconColor: "text-rose-500 bg-rose-500/15 border-rose-500/30",
        onSelect: () => {
          onOpenChange(false)
          if (onOpenSubmitRequest) {
            onOpenSubmitRequest("bug")
          } else {
            window.location.href = "/requests"
          }
        },
      },
      {
        type: "action",
        id: "act-submit-pr",
        title: "Propose Bug Fix / Pull Request (PR)",
        subtitle:
          "Submit unified code diff patch, git branch, and test notes for maintainer review",
        badge: "🔀 Code PR",
        icon: GitPullRequest,
        iconColor: "text-purple-500 bg-purple-500/15 border-purple-500/30",
        onSelect: () => {
          onOpenChange(false)
          if (onOpenSubmitRequest) {
            onOpenSubmitRequest("pull_request")
          } else {
            window.location.href = "/requests"
          }
        },
      },
      {
        type: "action",
        id: "act-requests-hub",
        title: "Requests & Coworker PRs Hub",
        subtitle:
          "Open Kanban triage board with all community feature requests, bug reports, and PRs",
        badge: "Triage Hub",
        icon: GitPullRequest,
        iconColor: "text-purple-500 bg-purple-500/15 border-purple-500/30",
        onSelect: () => {
          window.location.href = "/requests"
          onOpenChange(false)
        },
      },
    ]

    if (onToggleRightPanel) {
      actions.push({
        type: "action",
        id: "act-toggle-calendar",
        title: "Toggle Iran Timezone & Calendar Panel",
        subtitle:
          "Open/close the exact Tehran digital clock and Jalali calendar dock",
        badge: "IRST Dock",
        icon: Clock,
        iconColor: "text-amber-500 bg-amber-500/15 border-amber-500/30",
        onSelect: () => {
          onToggleRightPanel()
          onOpenChange(false)
        },
      })
    }

    return actions
  }, [openUrl, onToggleRightPanel, onOpenChange, onOpenSubmitRequest])

  // Compute unified list of matching items
  const unifiedItems: PaletteItem[] = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const items: PaletteItem[] = []

    // 1. Actions filter
    if (activeFilter === "All" || activeFilter === "Meetings") {
      const matchingActions = quickActions.filter((act) => {
        if (!q) return true
        return (
          act.title.toLowerCase().includes(q) ||
          act.subtitle.toLowerCase().includes(q) ||
          "meeting meet call video schedule google feature request bug fix pr pull issue code triage".includes(
            q
          )
        )
      })
      items.push(...matchingActions)
    }

    // 2. Meetings filter
    if (activeFilter === "All" || activeFilter === "Meetings") {
      const matchingMeetings = meetings.filter((m) => {
        if (!q) return true
        return (
          m.title.toLowerCase().includes(q) ||
          m.agenda.toLowerCase().includes(q) ||
          m.attendees.toLowerCase().includes(q) ||
          m.tehranTime.includes(q) ||
          m.platform.toLowerCase().includes(q) ||
          "meeting standup sync meet".includes(q)
        )
      })
      items.push(
        ...matchingMeetings.map((m) => ({
          type: "meeting" as const,
          id: m.id,
          meeting: m,
        }))
      )
    }

    // 3. Services filter
    if (activeFilter !== "Meetings") {
      const matchingServices = services.filter((svc) => {
        const matchesEnv =
          activeFilter === "All"
            ? true
            : activeFilter === "Favorites"
              ? favorites.includes(svc.id)
              : svc.environment === activeFilter

        if (!matchesEnv) return false
        if (!q) return true

        const isDocQuery =
          q.includes("doc") ||
          q.includes("runbook") ||
          q.includes("architecture") ||
          q.includes("readme") ||
          q.includes("docker") ||
          q.includes("header") ||
          q.includes("auth")

        const tags = getServiceTags(svc)
        const matchesTag = tags.some((t: string) => t.toLowerCase().includes(q))

        return (
          svc.name.toLowerCase().includes(q) ||
          svc.description.toLowerCase().includes(q) ||
          svc.category.toLowerCase().includes(q) ||
          svc.environment.toLowerCase().includes(q) ||
          (svc.owner && svc.owner.toLowerCase().includes(q)) ||
          svc.url.toLowerCase().includes(q) ||
          matchesTag ||
          (isDocQuery &&
            (svc.category.toLowerCase().includes("api") ||
              svc.name.toLowerCase().includes("gateway") ||
              svc.description.toLowerCase().includes("api")))
        )
      })
      items.push(
        ...matchingServices.map((svc) => ({
          type: "service" as const,
          id: svc.id,
          service: svc,
        }))
      )
    }

    return items
  }, [query, activeFilter, quickActions, meetings, services, favorites])

  // Reset selection index safely
  React.useEffect(() => {
    setSelectedIndex(0)
  }, [unifiedItems.length, query, activeFilter])

  // Scroll selected item into view
  React.useEffect(() => {
    if (!listRef.current) return
    const selectedElement = listRef.current.querySelector(
      `[data-index="${selectedIndex}"]`
    ) as HTMLElement | null
    if (selectedElement) {
      selectedElement.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      })
    }
  }, [selectedIndex])

  const copyText = (
    text: string,
    id: number | string,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  // Execute selected item
  const executeItem = React.useCallback(
    (item: PaletteItem) => {
      if (!item) return
      if (item.type === "action") {
        item.onSelect()
      } else if (item.type === "meeting") {
        openUrl(item.meeting.meetUrl)
      } else if (item.type === "service") {
        openUrl(item.service.url)
      }
    },
    [openUrl]
  )

  // Keyboard Navigation: Up, Down, Enter, Escape, Ctrl+K / Cmd+K / Slash
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isKeyK = e.key?.toLowerCase() === "k" || e.code === "KeyK"
      if ((e.metaKey || e.ctrlKey) && isKeyK) {
        e.preventDefault()
        e.stopPropagation()
        onOpenChange(!open)
        return
      }

      // Allow pressing '/' when not in an input/textarea to open search
      const target = e.target as HTMLElement | null
      const isInputActive =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)

      if (!open && e.key === "/" && !isInputActive) {
        e.preventDefault()
        onOpenChange(true)
        return
      }

      if (!open) return

      if (e.key === "Escape") {
        e.preventDefault()
        if (isQuickCreateOpen) {
          setIsQuickCreateOpen(false)
        } else {
          onOpenChange(false)
        }
        return
      }

      // If in fast meeting create form, let user submit via form
      if (isQuickCreateOpen) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) =>
          unifiedItems.length > 0 ? (prev + 1) % unifiedItems.length : 0
        )
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) =>
          unifiedItems.length > 0
            ? (prev - 1 + unifiedItems.length) % unifiedItems.length
            : 0
        )
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (unifiedItems[selectedIndex]) {
          executeItem(unifiedItems[selectedIndex])
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    open,
    onOpenChange,
    unifiedItems,
    selectedIndex,
    executeItem,
    isQuickCreateOpen,
  ])

  // Quick Create Meeting Submit Handler
  function handleQuickCreateSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!quickTitle.trim()) return

    addMeeting({
      title: quickTitle.trim(),
      tehranTime: quickTime,
      durationMins: Number(quickDuration) || 30,
      platform: "Google Meet",
      meetUrl: quickUrl.trim() || "https://meet.google.com/new",
      agenda: "Scheduled via Command Palette launcher",
      attendees: "Frontend Squad",
      notifyBeforeMins: 5,
      isActive: true,
    })

    setIsQuickCreateOpen(false)
    setQuery("meet")
    setActiveFilter("Meetings")
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24">
      {/* Backdrop */}
      <div
        className="fixed inset-0 animate-in bg-background/80 backdrop-blur-sm transition-opacity duration-150 fade-in-0"
        onClick={() => onOpenChange(false)}
      />

      {/* Palette Modal Box */}
      <div className="relative z-50 flex w-full max-w-4xl animate-in flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl duration-150 fade-in-0 zoom-in-95">
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-border px-4 py-3">
          <Search className="mr-3 size-5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsQuickCreateOpen(false)
            }}
            placeholder="Search services, meetings, actions... (e.g. 'meet', 'standup', 'swagger')"
            className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="mr-2 cursor-pointer text-muted-foreground hover:text-foreground"
              title="Clear search"
            >
              <X className="size-4" />
            </button>
          ) : null}
          <kbd className="pointer-events-none hidden h-5 items-center gap-1 rounded border border-border bg-muted/60 px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-2xs select-none sm:inline-flex">
            ESC
          </kbd>
        </div>

        {/* Quick Filter Tabs */}
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto border-b border-border/60 bg-muted/20 px-4 py-2 text-xs">
          {[
            { id: "All", label: "All", icon: Layers },
            {
              id: "Meetings",
              label: "Meetings",
              icon: Video,
              count: meetings.length,
            },
            {
              id: "Favorites",
              label: "Favorites",
              icon: Star,
              count: favorites.length,
            },
            { id: "Develop", label: "Develop", icon: Code2 },
            { id: "Test", label: "Test", icon: MonitorCheck },
            { id: "Stage", label: "Stage", icon: Cpu },
            { id: "DevOps & Tools", label: "DevOps", icon: Network },
            { id: "Portals & HR", label: "Portals", icon: Building2 },
          ].map((tab) => {
            const isActive = activeFilter === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveFilter(tab.id)
                  setIsQuickCreateOpen(false)
                  inputRef.current?.focus()
                }}
                className={cn(
                  "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "size-3",
                    tab.id === "Favorites" &&
                      !isActive &&
                      "fill-amber-500 text-amber-500",
                    tab.id === "Meetings" && !isActive && "text-sky-500"
                  )}
                />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={cn(
                      "py-0.2 ml-0.5 rounded-full px-1 font-mono text-[10px]",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Fast Meeting Creation Drawer inside Palette */}
        {isQuickCreateOpen ? (
          <form
            onSubmit={handleQuickCreateSubmit}
            className="space-y-3 bg-muted/20 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-sky-500/20 text-sky-500">
                  <Video className="size-3.5" />
                </div>
                <h4 className="text-xs font-bold text-foreground">
                  Fast Schedule Frontend Meeting
                </h4>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsQuickCreateOpen(false)}
                className="size-6 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </Button>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-medium text-muted-foreground">
                Meeting Title *
              </label>
              <Input
                autoFocus
                required
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="e.g. Daily Standup or PR Review"
                className="h-8 bg-background text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[10px] font-medium text-muted-foreground">
                  Tehran Time (IRST) *
                </label>
                <Input
                  type="time"
                  required
                  value={quickTime}
                  onChange={(e) => setQuickTime(e.target.value)}
                  className="h-8 bg-background text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-muted-foreground">
                  Duration (mins)
                </label>
                <Input
                  type="number"
                  min={5}
                  max={240}
                  value={quickDuration}
                  onChange={(e) => setQuickDuration(Number(e.target.value))}
                  className="h-8 bg-background text-xs"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-medium text-muted-foreground">
                Meet URL
              </label>
              <Input
                type="url"
                required
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
                placeholder="https://meet.google.com/new"
                className="h-8 bg-background font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsQuickCreateOpen(false)}
                className="h-7 text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-7 gap-1 text-xs">
                <Check className="size-3.5" />
                <span>Save & Schedule</span>
              </Button>
            </div>
          </form>
        ) : (
          /* Results List */
          <div
            ref={listRef}
            className="max-h-[380px] min-h-[180px] overflow-y-auto p-2"
          >
            {unifiedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Search className="mb-2 size-8 stroke-1 opacity-40" />
                <p className="text-sm font-medium">
                  No results matching &ldquo;{query}&rdquo;
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try searching for &ldquo;meet&rdquo;, &ldquo;standup&rdquo;,
                  or &ldquo;swagger&rdquo;
                </p>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setIsQuickCreateOpen(true)}
                  className="mt-3 gap-1 text-xs"
                >
                  <Plus className="size-3" />
                  <span>Create Meeting Now</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {unifiedItems.map((item, index) => {
                  const isSelected = index === selectedIndex

                  // RENDER ACTION
                  if (item.type === "action") {
                    const ActionIcon = item.icon
                    return (
                      <div
                        key={item.id}
                        data-index={index}
                        onClick={() => executeItem(item)}
                        onMouseMove={(e) => {
                          if (
                            Math.abs(e.clientX - lastMousePosRef.current.x) >
                              3 ||
                            Math.abs(e.clientY - lastMousePosRef.current.y) > 3
                          ) {
                            lastMousePosRef.current = {
                              x: e.clientX,
                              y: e.clientY,
                            }
                            if (selectedIndex !== index) setSelectedIndex(index)
                          }
                        }}
                        className={cn(
                          "group flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs transition-all",
                          isSelected
                            ? "border-primary/40 bg-primary/15 text-foreground shadow-xs ring-2 ring-primary/80"
                            : "text-foreground hover:bg-muted/40"
                        )}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2.5">
                          <div className="flex size-4 shrink-0 items-center justify-center">
                            {isSelected ? (
                              <ArrowRight className="size-3.5 animate-pulse text-primary" />
                            ) : null}
                          </div>

                          <div
                            className={cn(
                              "flex size-7 shrink-0 items-center justify-center rounded-lg border",
                              item.iconColor
                            )}
                          >
                            <ActionIcon className="size-3.5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "truncate font-semibold",
                                  isSelected
                                    ? "text-primary"
                                    : "text-foreground"
                                )}
                              >
                                {item.title}
                              </span>
                              {item.badge && (
                                <Badge
                                  variant="outline"
                                  className="border-primary/30 px-1.5 py-0 text-[10px] font-semibold text-primary"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        <div
                          className={cn(
                            "flex items-center gap-1 rounded-md px-2.5 py-1 font-mono text-[11px] transition-all",
                            isSelected
                              ? "bg-primary font-semibold text-primary-foreground shadow-xs"
                              : "hidden bg-muted text-muted-foreground opacity-0 group-hover:opacity-60 sm:inline-flex"
                          )}
                        >
                          <span>Execute</span>
                          <CornerDownLeft className="size-3" />
                        </div>
                      </div>
                    )
                  }

                  // RENDER MEETING
                  if (item.type === "meeting") {
                    const m = item.meeting
                    return (
                      <div
                        key={m.id}
                        data-index={index}
                        onClick={() => executeItem(item)}
                        onMouseMove={(e) => {
                          if (
                            Math.abs(e.clientX - lastMousePosRef.current.x) >
                              3 ||
                            Math.abs(e.clientY - lastMousePosRef.current.y) > 3
                          ) {
                            lastMousePosRef.current = {
                              x: e.clientX,
                              y: e.clientY,
                            }
                            if (selectedIndex !== index) setSelectedIndex(index)
                          }
                        }}
                        className={cn(
                          "group flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs transition-all",
                          isSelected
                            ? "border-sky-500/50 bg-sky-500/15 text-foreground shadow-xs ring-2 ring-sky-500/80"
                            : "text-foreground hover:bg-muted/40"
                        )}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2.5">
                          <div className="flex size-4 shrink-0 items-center justify-center">
                            {isSelected ? (
                              <ArrowRight className="size-3.5 animate-pulse text-sky-500" />
                            ) : null}
                          </div>

                          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-sky-500/40 bg-sky-500/15 font-semibold text-sky-500">
                            <Video className="size-3.5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "truncate font-semibold",
                                  isSelected
                                    ? "text-sky-600 dark:text-sky-400"
                                    : "text-foreground"
                                )}
                              >
                                {m.title}
                              </span>
                              <Badge
                                variant="outline"
                                className="border-sky-500/30 bg-sky-500/10 font-mono text-[10px] text-sky-600 dark:text-sky-400"
                              >
                                {m.tehranTime} IRST
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="px-1 py-0 text-[10px]"
                              >
                                {m.platform}
                              </Badge>
                            </div>
                            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                              {m.agenda ||
                                `${m.durationMins} minutes • ${m.attendees}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => copyText(m.meetUrl, m.id, e)}
                            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="Copy Meet URL"
                          >
                            {copiedId === m.id ? (
                              <Check className="size-3 text-emerald-500" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>

                          <div
                            className={cn(
                              "flex items-center gap-1 rounded-md px-2.5 py-1 font-mono text-[11px] transition-all",
                              isSelected
                                ? "bg-sky-600 font-semibold text-white shadow-xs"
                                : "hidden bg-muted text-muted-foreground opacity-0 group-hover:opacity-60 sm:inline-flex"
                            )}
                          >
                            <span>Join</span>
                            <ExternalLink className="size-3" />
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // RENDER SERVICE
                  const svc = item.service
                  const isFavorite = favorites.includes(svc.id)
                  const EnvIcon = ENV_ICONS[svc.environment] || Globe

                  return (
                    <div
                      key={svc.id}
                      data-index={index}
                      onClick={() => executeItem(item)}
                      onMouseMove={(e) => {
                        if (
                          Math.abs(e.clientX - lastMousePosRef.current.x) > 3 ||
                          Math.abs(e.clientY - lastMousePosRef.current.y) > 3
                        ) {
                          lastMousePosRef.current = {
                            x: e.clientX,
                            y: e.clientY,
                          }
                          if (selectedIndex !== index) setSelectedIndex(index)
                        }
                      }}
                      className={cn(
                        "group flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-xs transition-all",
                        isSelected
                          ? "border-primary/40 bg-primary/15 text-foreground shadow-xs ring-2 ring-primary/80"
                          : "text-foreground hover:bg-muted/40"
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2.5">
                        <div className="flex size-4 shrink-0 items-center justify-center">
                          {isSelected ? (
                            <ArrowRight className="size-3.5 animate-pulse text-primary" />
                          ) : null}
                        </div>

                        <div
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-lg border",
                            isSelected
                              ? "border-primary/50 bg-primary/20 font-semibold text-primary"
                              : "border-border bg-muted/40 text-muted-foreground"
                          )}
                        >
                          <EnvIcon className="size-3.5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "truncate font-semibold",
                                isSelected ? "text-primary" : "text-foreground"
                              )}
                            >
                              {svc.name}
                            </span>
                            <Badge
                              variant="outline"
                              className="shrink-0 px-1.5 py-0 text-[10px] font-normal"
                            >
                              {svc.environment}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="hidden shrink-0 px-1.5 py-0 text-[10px] font-normal sm:inline-flex"
                            >
                              {svc.category}
                            </Badge>
                            {getServiceTags(svc)
                              .slice(0, 2)
                              .map((tag: string) => (
                                <span
                                  key={tag}
                                  className="hidden rounded bg-muted/60 px-1 py-0 font-mono text-[9px] text-muted-foreground md:inline-flex"
                                >
                                  {tag}
                                </span>
                              ))}
                          </div>
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                            {svc.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        {onInspectService && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              onInspectService(svc, "docs")
                              onOpenChange(false)
                            }}
                            className="flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 text-[10px] text-muted-foreground hover:bg-muted hover:text-violet-500 transition-colors"
                            title="Inspect Runbook & Architecture Documentation"
                          >
                            <BookOpen className="size-3" />
                            <span className="hidden sm:inline">Docs</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onToggleFavorite(svc.id)
                          }}
                          className={cn(
                            "cursor-pointer rounded-md p-1.5 transition-colors hover:bg-muted",
                            isFavorite
                              ? "text-amber-500"
                              : "text-muted-foreground hover:text-amber-500"
                          )}
                          title={
                            isFavorite ? "Unpin service" : "Pin to favorites"
                          }
                        >
                          <Star
                            className={cn(
                              "size-3.5",
                              isFavorite && "fill-amber-400"
                            )}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => copyText(svc.url, svc.id, e)}
                          className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="Copy URL"
                        >
                          {copiedId === svc.id ? (
                            <Check className="size-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </button>

                        <div
                          className={cn(
                            "flex items-center gap-1 rounded-md px-2.5 py-1 font-mono text-[11px] transition-all",
                            isSelected
                              ? "bg-primary font-semibold text-primary-foreground shadow-xs"
                              : "hidden bg-muted text-muted-foreground opacity-0 group-hover:opacity-60 sm:inline-flex"
                          )}
                        >
                          <span>Visit</span>
                          <CornerDownLeft className="size-3" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer Shortcut Hints */}
        <div className="flex items-center justify-between border-t border-border bg-muted/40 px-4 py-2.5 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
                ↓
              </kbd>
              <span>navigate</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-background px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
                ↵
              </kbd>
              <span>launch / join</span>
            </span>
            <span className="hidden items-center gap-1 sm:inline-flex">
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
                ESC
              </kbd>
              <span>close</span>
            </span>
          </div>

          <div className="text-[11px] font-medium text-muted-foreground">
            {unifiedItems.length}{" "}
            {unifiedItems.length === 1 ? "result" : "results"}
          </div>
        </div>
      </div>
    </div>
  )
}
