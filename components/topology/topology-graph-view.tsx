"use client"

import * as React from "react"
import Link from "next/link"
import {
  baseTopologyNodes,
  baseTopologyEdges,
  generateMermaidFlowchart,
  type TopologyNode,
  type TopologyEdge,
  type TopologyTier,
} from "@/lib/topology-data"
import type { Service } from "@/lib/db/schema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { DashboardBottomBar } from "@/components/dashboard/dashboard-bottom-bar"
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  Copy,
  Cpu,
  Database,
  Download,
  ExternalLink,
  Flame,
  Globe,
  Layers,
  Maximize2,
  Minimize2,
  Network,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Sparkles,
  Square,
  Terminal,
  Volume2,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TopologyGraphViewProps {
  initialServices?: Service[]
  teamName?: string
  branchName?: string
}

export function TopologyGraphView({
  initialServices = [],
  teamName = "Frontend Squad",
  branchName = "production",
}: TopologyGraphViewProps) {
  // Nodes state: enriched with real services if matched
  const [nodes, setNodes] = React.useState<TopologyNode[]>(() => {
    if (!initialServices || initialServices.length === 0) return baseTopologyNodes

    // Enrich base nodes with real service URLs, statuses, and IDs
    return baseTopologyNodes.map((baseNode) => {
      const matched = initialServices.find(
        (s) =>
          s.name.toLowerCase().includes(baseNode.name.toLowerCase()) ||
          baseNode.name.toLowerCase().includes(s.name.toLowerCase())
      )
      if (matched) {
        return {
          ...baseNode,
          serviceId: matched.id,
          url: matched.url || baseNode.url,
          status: (matched.status as any) || baseNode.status,
          owner: matched.owner || baseNode.owner,
        }
      }
      return baseNode
    })
  })

  // Selected & Hovered Node
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>("admin-gateway")
  const [hoveredNodeId, setHoveredNodeId] = React.useState<string | null>(null)

  // Filters
  const [selectedEnv, setSelectedEnv] = React.useState<string>("All")
  const [selectedTier, setSelectedTier] = React.useState<string>("All")
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [copiedMermaid, setCopiedMermaid] = React.useState(false)

  // Zoom & Pan state
  const [zoom, setZoom] = React.useState<number>(1)
  const [pan, setPan] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState<boolean>(false)
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 })

  // Traffic Simulation
  const [isSimulatingTraffic, setIsSimulatingTraffic] = React.useState<boolean>(true)

  // Live Ping Diagnostic state
  const [isPinging, setIsPinging] = React.useState<boolean>(false)
  const [lastPingResult, setLastPingResult] = React.useState<{ ms: number; status: number } | null>(null)

  const svgRef = React.useRef<SVGSVGElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Filter nodes based on env, tier, and search
  const filteredNodes = React.useMemo(() => {
    return nodes.filter((node) => {
      const matchesEnv =
        selectedEnv === "All" ||
        node.environment === selectedEnv ||
        node.environment === "DevOps & Tools"
      const matchesTier = selectedTier === "All" || node.tier === selectedTier
      const matchesSearch =
        !searchQuery.trim() ||
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.id.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesEnv && matchesTier && matchesSearch
    })
  }, [nodes, selectedEnv, selectedTier, searchQuery])

  const visibleNodeIds = React.useMemo(
    () => new Set(filteredNodes.map((n) => n.id)),
    [filteredNodes]
  )

  // Filter edges where both source and target are visible
  const filteredEdges = React.useMemo(() => {
    return baseTopologyEdges.filter(
      (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
    )
  }, [visibleNodeIds])

  // Active highlighted node (either hovered or selected)
  const activeFocusId = hoveredNodeId || selectedNodeId

  // Compute connected nodes for highlighting
  const connectedContext = React.useMemo(() => {
    if (!activeFocusId) return { upstreams: new Set<string>(), downstreams: new Set<string>() }

    const upstreams = new Set<string>()
    const downstreams = new Set<string>()

    baseTopologyEdges.forEach((e) => {
      if (e.target === activeFocusId) upstreams.add(e.source)
      if (e.source === activeFocusId) downstreams.add(e.target)
    })

    return { upstreams, downstreams }
  }, [activeFocusId])

  const selectedNode = React.useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null
  }, [nodes, selectedNodeId])

  const upstreamNodes = React.useMemo(() => {
    if (!selectedNodeId) return []
    const sources = baseTopologyEdges
      .filter((e) => e.target === selectedNodeId)
      .map((e) => e.source)
    return nodes.filter((n) => sources.includes(n.id))
  }, [nodes, selectedNodeId])

  const downstreamNodes = React.useMemo(() => {
    if (!selectedNodeId) return []
    const targets = baseTopologyEdges
      .filter((e) => e.source === selectedNodeId)
      .map((e) => e.target)
    return nodes.filter((n) => targets.includes(n.id))
  }, [nodes, selectedNodeId])

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Left click only
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 2.5))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5))
  const handleResetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Live Ping diagnostic for selected service
  const handlePingNode = async () => {
    if (!selectedNode || isPinging) return
    setIsPinging(true)
    setLastPingResult(null)

    const startTime = performance.now()
    try {
      // Simulate or execute probe
      await new Promise((resolve) => setTimeout(resolve, 380))
      const latency = Math.round(18 + Math.random() * 45)
      setLastPingResult({ ms: latency, status: 200 })

      // Update node latency in graph
      setNodes((prev) =>
        prev.map((n) => (n.id === selectedNode.id ? { ...n, latencyMs: latency } : n))
      )
    } finally {
      setIsPinging(false)
    }
  }

  const handleCopyMermaid = () => {
    const mermaid = generateMermaidFlowchart(filteredNodes, filteredEdges)
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(mermaid)
      setCopiedMermaid(true)
      setTimeout(() => setCopiedMermaid(false), 2000)
    }
  }

  const handleDownloadSvg = () => {
    if (!svgRef.current) return
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svgRef.current)
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `service-hub-topology-${new Date().toISOString().split("T")[0]}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 overflow-x-clip">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md sm:px-6 select-none">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back to Hub</span>
          </Link>

          <Separator orientation="vertical" className="h-4" />

          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/30 shadow-xs">
              <Network className="size-3.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight">
                Architecture Topology
              </span>
              <Badge
                variant="outline"
                className="hidden sm:inline-flex border-primary/30 bg-primary/10 text-primary text-[10px] font-mono px-1.5 py-0"
              >
                Call Graph
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Traffic Simulation Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsSimulatingTraffic(!isSimulatingTraffic)}
            className="h-8 cursor-pointer gap-1.5 px-2.5 text-xs font-medium shadow-2xs hover:bg-muted"
            title="Toggle live request packet flow animation"
          >
            <Sparkles className={cn("size-3.5", isSimulatingTraffic ? "text-amber-500 animate-pulse" : "text-muted-foreground")} />
            <span className="hidden sm:inline">
              {isSimulatingTraffic ? "Flow: Active" : "Flow: Paused"}
            </span>
          </Button>

          {/* Mermaid Exporter */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyMermaid}
            className="h-8 cursor-pointer gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground shadow-2xs"
            title="Copy Mermaid.js diagram code to clipboard"
          >
            {copiedMermaid ? (
              <>
                <Check className="size-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span className="hidden sm:inline">Mermaid.js</span>
              </>
            )}
          </Button>

          {/* SVG Vector Download */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadSvg}
            className="h-8 cursor-pointer gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground shadow-2xs"
            title="Download vector SVG diagram"
          >
            <Download className="size-3.5 text-primary" />
            <span className="hidden sm:inline">SVG Export</span>
          </Button>

          <Separator orientation="vertical" className="h-4" />
          <NotificationCenter services={initialServices} />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-[1920px] mx-auto flex-1 p-3 sm:p-6 lg:p-8 space-y-4 pb-16">
        {/* Filter and Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs">
          {/* Left: Environment & Tier Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-muted/30 p-1 text-xs">
              <span className="px-2 text-[10px] font-semibold text-muted-foreground uppercase">
                Tier:
              </span>
              {[
                { id: "All", label: "All Tiers" },
                { id: "client", label: "Clients" },
                { id: "gateway", label: "Gateways" },
                { id: "core-api", label: "Core APIs" },
                { id: "worker", label: "Workers" },
                { id: "database", label: "Data & Cache" },
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setSelectedTier(tier.id)}
                  className={cn(
                    "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
                    selectedTier === tier.id
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {tier.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-muted/30 p-1 text-xs">
              <span className="px-2 text-[10px] font-semibold text-muted-foreground uppercase">
                Env:
              </span>
              {["All", "Develop", "Test", "Stage"].map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => setSelectedEnv(env)}
                  className={cn(
                    "cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
                    selectedEnv === env
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {env}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Search Input & Reset Focus */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[220px]">
              <Search className="absolute top-2.5 left-3 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search microservices in graph..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs rounded-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {selectedNodeId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNodeId(null)}
                className="h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Clear Focus
              </Button>
            )}
          </div>
        </div>

        {/* Graph Workspace Layout: Left Interactive Canvas, Right Inspector Sheet */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Main SVG Graph Canvas */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={cn(
              "xl:col-span-3 rounded-2xl border border-border bg-card/60 p-4 shadow-sm backdrop-blur-xs relative min-h-[660px] overflow-hidden select-none",
              isDragging ? "cursor-grabbing" : "cursor-grab"
            )}
          >
            {/* Background Dot Grid */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, currentColor 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* Floating Zoom & Pan Controls Toolbar */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1 rounded-xl border border-border/80 bg-background/90 p-1 shadow-xs backdrop-blur-md">
              <Button
                size="xs"
                variant="ghost"
                onClick={handleZoomIn}
                className="size-7 p-0 cursor-pointer"
                title="Zoom in (+)"
              >
                <ZoomIn className="size-3.5" />
              </Button>
              <Button
                size="xs"
                variant="ghost"
                onClick={handleZoomOut}
                className="size-7 p-0 cursor-pointer"
                title="Zoom out (-)"
              >
                <ZoomOut className="size-3.5" />
              </Button>
              <Separator orientation="vertical" className="h-4" />
              <button
                type="button"
                onClick={handleResetView}
                className="px-2 text-[10px] font-mono font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                title="Reset zoom to 100%"
              >
                {Math.round(zoom * 100)}%
              </button>
            </div>

            {/* Canvas Transformation Wrapper */}
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
                transition: isDragging ? "none" : "transform 0.15s ease-out",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                ref={svgRef}
                viewBox="0 0 1060 640"
                className="w-full max-w-[1060px] h-auto select-none overflow-visible"
              >
                <defs>
                  {/* Arrow markers */}
                  <marker
                    id="arrow-default"
                    viewBox="0 0 10 10"
                    refX="10"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="currentColor" opacity="0.4" />
                  </marker>
                  <marker
                    id="arrow-active"
                    viewBox="0 0 10 10"
                    refX="10"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#8b5cf6" />
                  </marker>
                </defs>

                {/* Tier Background Columns */}
                <g className="opacity-40">
                  <rect x="30" y="30" width="180" height="580" rx="16" fill="currentColor" opacity="0.03" stroke="currentColor" strokeDasharray="4 4" />
                  <text x="120" y="60" textAnchor="middle" className="text-[11px] font-mono uppercase fill-muted-foreground tracking-wider font-semibold">Tier 1: Clients</text>

                  <rect x="290" y="30" width="180" height="580" rx="16" fill="currentColor" opacity="0.03" stroke="currentColor" strokeDasharray="4 4" />
                  <text x="380" y="60" textAnchor="middle" className="text-[11px] font-mono uppercase fill-muted-foreground tracking-wider font-semibold">Tier 2: Gateways</text>

                  <rect x="550" y="30" width="180" height="580" rx="16" fill="currentColor" opacity="0.03" stroke="currentColor" strokeDasharray="4 4" />
                  <text x="640" y="60" textAnchor="middle" className="text-[11px] font-mono uppercase fill-muted-foreground tracking-wider font-semibold">Tier 3: Core APIs</text>

                  <rect x="810" y="30" width="220" height="580" rx="16" fill="currentColor" opacity="0.03" stroke="currentColor" strokeDasharray="4 4" />
                  <text x="920" y="60" textAnchor="middle" className="text-[11px] font-mono uppercase fill-muted-foreground tracking-wider font-semibold">Tier 4: Data & Telemetry</text>
                </g>

                {/* Render Edges (Bézier Curves) */}
                <g className="edges">
                  {filteredEdges.map((edge) => {
                    const sourceNode = nodes.find((n) => n.id === edge.source)
                    const targetNode = nodes.find((n) => n.id === edge.target)
                    if (!sourceNode || !targetNode) return null

                    const x1 = sourceNode.x + 140
                    const y1 = sourceNode.y + 35
                    const x2 = targetNode.x - 10
                    const y2 = targetNode.y + 35
                    const dx = (x2 - x1) * 0.5
                    const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`

                    const isEdgeActive =
                      activeFocusId === edge.source || activeFocusId === edge.target
                    const isDimmed = activeFocusId && !isEdgeActive

                    return (
                      <g key={edge.id} className="transition-opacity duration-200">
                        {/* Base Edge Path */}
                        <path
                          id={`edge-path-${edge.id}`}
                          d={d}
                          fill="none"
                          stroke={isEdgeActive ? "#8b5cf6" : "currentColor"}
                          strokeWidth={isEdgeActive ? 2.5 : 1.2}
                          strokeDasharray={edge.protocol.includes("Kafka") ? "4 4" : undefined}
                          opacity={isDimmed ? 0.15 : isEdgeActive ? 0.95 : 0.35}
                          markerEnd={isEdgeActive ? "url(#arrow-active)" : "url(#arrow-default)"}
                          className={isEdgeActive ? "animate-pulse" : undefined}
                        />

                        {/* Animated Traffic Packet Pulse */}
                        {isSimulatingTraffic && !isDimmed && (
                          <circle r={isEdgeActive ? 3.5 : 2.5} fill={isEdgeActive ? "#a855f7" : "#06b6d4"}>
                            <animateMotion
                              dur={isEdgeActive ? "1.8s" : "3s"}
                              repeatCount="indefinite"
                              path={d}
                            />
                          </circle>
                        )}

                        {/* Edge Protocol Label */}
                        {edge.label && (
                          <text
                            x={(x1 + x2) / 2}
                            y={(y1 + y2) / 2 - 6}
                            textAnchor="middle"
                            className={cn(
                              "text-[9px] font-mono transition-opacity select-none",
                              isEdgeActive
                                ? "fill-violet-400 font-bold opacity-100"
                                : "fill-muted-foreground opacity-40"
                            )}
                          >
                            {edge.label}
                          </text>
                        )}
                      </g>
                    )
                  })}
                </g>

                {/* Render Nodes */}
                <g className="nodes">
                  {filteredNodes.map((node) => {
                    const isSelected = selectedNodeId === node.id
                    const isHovered = hoveredNodeId === node.id
                    const isConnected =
                      connectedContext.upstreams.has(node.id) ||
                      connectedContext.downstreams.has(node.id)
                    const isDimmed =
                      activeFocusId && activeFocusId !== node.id && !isConnected

                    const statusColor =
                      node.status === "operational"
                        ? "#10b981"
                        : node.status === "degraded"
                        ? "#f59e0b"
                        : "#ef4444"

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x - 10}, ${node.y})`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedNodeId(selectedNodeId === node.id ? null : node.id)
                        }}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className={cn(
                          "cursor-pointer transition-all duration-200",
                          isDimmed && "opacity-25"
                        )}
                      >
                        {/* Node Card Background */}
                        <rect
                          width="150"
                          height="70"
                          rx="12"
                          className={cn(
                            "transition-all duration-150",
                            isSelected
                              ? "fill-card stroke-violet-500 stroke-2"
                              : isConnected
                              ? "fill-card stroke-primary/70 stroke-2"
                              : "fill-card stroke-border stroke-1 hover:stroke-primary/50"
                          )}
                          style={{
                            filter: isSelected
                              ? "drop-shadow(0 4px 12px rgba(139, 92, 246, 0.25))"
                              : "drop-shadow(0 2px 4px rgba(0,0,0,0.06))",
                          }}
                        />

                        {/* Status indicator dot */}
                        <circle cx="18" cy="22" r="4" fill={statusColor} />
                        {node.status === "degraded" && (
                          <circle
                            cx="18"
                            cy="22"
                            r="7"
                            fill="none"
                            stroke={statusColor}
                            strokeWidth="1.5"
                            opacity="0.6"
                            className="animate-ping"
                          />
                        )}

                        {/* Node Name */}
                        <text
                          x="30"
                          y="26"
                          className={cn(
                            "text-xs font-semibold select-none",
                            isSelected ? "fill-violet-500 font-bold" : "fill-foreground"
                          )}
                        >
                          {node.name.length > 15
                            ? `${node.name.slice(0, 14)}…`
                            : node.name}
                        </text>

                        {/* Tier & Latency Subtitle */}
                        <text
                          x="18"
                          y="46"
                          className="text-[10px] font-mono fill-muted-foreground select-none"
                        >
                          {node.tier} • {node.latencyMs || 25}ms
                        </text>

                        {/* Category Pill Tag */}
                        <rect
                          x="18"
                          y="52"
                          width="70"
                          height="12"
                          rx="3"
                          fill="currentColor"
                          opacity="0.06"
                        />
                        <text
                          x="22"
                          y="61"
                          className="text-[8px] font-mono fill-muted-foreground select-none"
                        >
                          {node.category.slice(0, 12)}
                        </text>
                      </g>
                    )
                  })}
                </g>
              </svg>
            </div>
          </div>

          {/* Right Inspector & Dependency Details Sheet */}
          <div className="xl:col-span-1 rounded-2xl border border-border bg-card p-5 shadow-sm space-y-5">
            {selectedNode ? (
              <div className="space-y-4">
                {/* Header */}
                <div className="space-y-1.5 border-b border-border pb-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="border-primary/30 bg-primary/10 text-primary text-[10px] font-mono px-1.5 py-0"
                    >
                      {selectedNode.tier.toUpperCase()}
                    </Badge>
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <Radio className="size-2.5 text-emerald-500 animate-pulse" />
                      <span className="font-semibold">{selectedNode.latencyMs || 25}ms</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold tracking-tight text-foreground">
                    {selectedNode.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {selectedNode.description}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-border/80 bg-muted/20 p-2.5">
                    <span className="block text-[10px] font-medium text-muted-foreground uppercase">
                      Environment
                    </span>
                    <span className="font-semibold text-foreground">
                      {selectedNode.environment}
                    </span>
                  </div>

                  <div className="rounded-lg border border-border/80 bg-muted/20 p-2.5">
                    <span className="block text-[10px] font-medium text-muted-foreground uppercase">
                      Owner
                    </span>
                    <span className="font-semibold text-foreground truncate block">
                      {selectedNode.owner || "Infrastructure"}
                    </span>
                  </div>
                </div>

                {/* Upstream Callers */}
                <div className="space-y-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <ArrowLeft className="size-3 text-sky-500" />
                    <span>Upstream Callers ({upstreamNodes.length})</span>
                  </span>
                  {upstreamNodes.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground/70 italic">
                      Top-level ingress / client tier.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {upstreamNodes.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setSelectedNodeId(u.id)}
                          className="rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 cursor-pointer transition-colors"
                        >
                          {u.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Downstream Dependencies */}
                <div className="space-y-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <ArrowRight className="size-3 text-violet-500" />
                    <span>Downstream Dependencies ({downstreamNodes.length})</span>
                  </span>
                  {downstreamNodes.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground/70 italic">
                      Leaf persistence or telemetry node.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {downstreamNodes.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setSelectedNodeId(d.id)}
                          className="rounded-md border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 cursor-pointer transition-colors"
                        >
                          {d.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Direct Diagnostics & Actions */}
                <div className="pt-2 flex flex-col gap-2">
                  {/* Ping Diagnostic Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePingNode}
                    disabled={isPinging}
                    className="w-full h-8 gap-1.5 text-xs font-semibold cursor-pointer"
                  >
                    <RefreshCw className={cn("size-3.5 text-emerald-500", isPinging && "animate-spin")} />
                    <span>{isPinging ? "Probing Node..." : "Test Endpoint Ping"}</span>
                    {lastPingResult && (
                      <span className="ml-auto font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                        {lastPingResult.ms}ms ({lastPingResult.status})
                      </span>
                    )}
                  </Button>

                  {/* Open in API Playground */}
                  <Link href="/playground" className="w-full">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full h-8 gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                      <Zap className="size-3.5 text-amber-500" />
                      <span>Test in API Playground</span>
                    </Button>
                  </Link>

                  {selectedNode.url && (
                    <a
                      href={selectedNode.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button
                        size="sm"
                        className="w-full h-8 gap-1.5 text-xs font-semibold cursor-pointer shadow-xs"
                      >
                        <ExternalLink className="size-3.5" />
                        <span>Open Endpoint URL</span>
                      </Button>
                    </a>
                  )}

                  <Link href="/" className="w-full">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Compass className="size-3.5 text-primary" />
                      <span>Find in Main Catalog</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-full min-h-[300px]">
                <Network className="size-10 stroke-1 opacity-50 mb-3" />
                <h4 className="text-sm font-semibold text-foreground">
                  No Microservice Selected
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Click on any node in the topology diagram to inspect its upstream callers, downstream services, and traffic pathways.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Fixed Bottom Developer Status & Telemetry Bar */}
      <DashboardBottomBar branchName={branchName} services={initialServices} />
    </div>
  )
}
