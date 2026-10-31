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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationCenter } from "@/components/notifications/notification-center"
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
  Network,
  Radio,
  RefreshCw,
  Search,
  Sparkles,
  Terminal,
  X,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function TopologyGraphView() {
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(
    "admin-gateway"
  )
  const [hoveredNodeId, setHoveredNodeId] = React.useState<string | null>(null)
  const [selectedEnv, setSelectedEnv] = React.useState<string>("All")
  const [selectedTier, setSelectedTier] = React.useState<string>("All")
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [copiedMermaid, setCopiedMermaid] = React.useState(false)
  const svgRef = React.useRef<SVGSVGElement>(null)

  // Filter nodes based on env and tier
  const filteredNodes = React.useMemo(() => {
    return baseTopologyNodes.filter((node) => {
      const matchesEnv =
        selectedEnv === "All" ||
        node.environment === selectedEnv ||
        node.environment === "DevOps & Tools"
      const matchesTier =
        selectedTier === "All" || node.tier === selectedTier
      const matchesSearch =
        !searchQuery.trim() ||
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.id.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesEnv && matchesTier && matchesSearch
    })
  }, [selectedEnv, selectedTier, searchQuery])

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
    return baseTopologyNodes.find((n) => n.id === selectedNodeId) || null
  }, [selectedNodeId])

  const upstreamNodes = React.useMemo(() => {
    if (!selectedNodeId) return []
    const sources = baseTopologyEdges
      .filter((e) => e.target === selectedNodeId)
      .map((e) => e.source)
    return baseTopologyNodes.filter((n) => sources.includes(n.id))
  }, [selectedNodeId])

  const downstreamNodes = React.useMemo(() => {
    if (!selectedNodeId) return []
    const targets = baseTopologyEdges
      .filter((e) => e.source === selectedNodeId)
      .map((e) => e.target)
    return baseTopologyNodes.filter((n) => targets.includes(n.id))
  }, [selectedNodeId])

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

  const getNodeTierIcon = (tier: TopologyTier) => {
    switch (tier) {
      case "client":
        return <Globe className="size-3.5 text-sky-500" />
      case "gateway":
        return <Network className="size-3.5 text-violet-500" />
      case "core-api":
        return <Cpu className="size-3.5 text-emerald-500" />
      case "worker":
        return <Flame className="size-3.5 text-amber-500" />
      case "database":
        return <Database className="size-3.5 text-indigo-500" />
      case "telemetry":
        return <Activity className="size-3.5 text-rose-500" />
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Top Application Header */}
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back to Catalog</span>
          </Link>

          <div className="h-5 w-px bg-border" />

          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-violet-600 text-white shadow-xs">
              <Network className="size-3.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold tracking-tight">
                Microservice Architecture & Dependency Graph
              </span>
              <Badge
                variant="outline"
                className="hidden sm:inline-flex border-violet-500/30 text-violet-600 dark:text-violet-400 text-[10px] font-mono px-1.5 py-0"
              >
                Topology
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyMermaid}
            className="h-8 cursor-pointer gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground shadow-2xs"
            title="Copy Mermaid.js diagram code to clipboard"
          >
            {copiedMermaid ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
            <span className="hidden sm:inline">
              {copiedMermaid ? "Copied" : "Mermaid.js"}
            </span>
          </Button>

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

          <NotificationCenter />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-[1920px] mx-auto flex-1 p-3 sm:p-6 lg:p-8 space-y-4">
        {/* Filter and Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-xl border border-border bg-card/60 p-3 shadow-2xs backdrop-blur-xs">
          {/* Left: Environment & Tier Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border/70 bg-muted/30 p-1 text-xs">
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
                    "cursor-pointer rounded-md px-2 py-1 text-xs font-medium transition-colors",
                    selectedTier === tier.id
                      ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {tier.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 rounded-lg border border-border/70 bg-muted/30 p-1 text-xs">
              <span className="px-2 text-[10px] font-semibold text-muted-foreground uppercase">
                Env:
              </span>
              {["All", "Develop", "Test", "Stage"].map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => setSelectedEnv(env)}
                  className={cn(
                    "cursor-pointer rounded-md px-2 py-1 text-xs font-medium transition-colors",
                    selectedEnv === env
                      ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
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
                className="h-8 pl-8 text-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
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
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear Focus
              </Button>
            )}
          </div>
        </div>

        {/* Graph Workspace Layout: Left Interactive Canvas, Right Inspector Sheet */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Main SVG Graph Canvas */}
          <div className="xl:col-span-3 rounded-2xl border border-border bg-card/40 p-4 shadow-sm backdrop-blur-xs overflow-x-auto relative min-h-[640px] flex items-center justify-center">
            {/* Background Dot Grid */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, currentColor 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

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
                  const sourceNode = baseTopologyNodes.find((n) => n.id === edge.source)
                  const targetNode = baseTopologyNodes.find((n) => n.id === edge.target)
                  if (!sourceNode || !targetNode) return null

                  const x1 = sourceNode.x + 140
                  const y1 = sourceNode.y + 35
                  const x2 = targetNode.x - 10
                  const y2 = targetNode.y + 35
                  const dx = (x2 - x1) * 0.5
                  const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`

                  const isEdgeActive =
                    activeFocusId === edge.source || activeFocusId === edge.target
                  const isDimmed =
                    activeFocusId && !isEdgeActive

                  return (
                    <g key={edge.id} className="transition-opacity duration-200">
                      <path
                        d={d}
                        fill="none"
                        stroke={isEdgeActive ? "#8b5cf6" : "currentColor"}
                        strokeWidth={isEdgeActive ? 2.5 : 1.2}
                        strokeDasharray={edge.protocol.includes("Kafka") ? "4 4" : undefined}
                        opacity={isDimmed ? 0.15 : isEdgeActive ? 0.95 : 0.35}
                        markerEnd={isEdgeActive ? "url(#arrow-active)" : "url(#arrow-default)"}
                        className={isEdgeActive ? "animate-pulse" : undefined}
                      />
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
                    activeFocusId &&
                    activeFocusId !== node.id &&
                    !isConnected

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
                      onClick={() =>
                        setSelectedNodeId(selectedNodeId === node.id ? null : node.id)
                      }
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
                      <circle
                        cx="18"
                        cy="22"
                        r="4"
                        fill={statusColor}
                      />
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
                        {node.tier} • {node.latencyMs}ms
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
                      <span className="font-semibold">{selectedNode.latencyMs}ms</span>
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

                {/* Action Links */}
                <div className="pt-2 flex flex-col gap-2">
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
                      variant="outline"
                      size="sm"
                      className="w-full h-8 gap-1.5 text-xs cursor-pointer"
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
    </div>
  )
}
