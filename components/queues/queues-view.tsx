"use client"

import * as React from "react"
import Link from "next/link"
import type { Service } from "@/lib/db/schema"
import {
  calculateBrokerSummary,
  exportQueuesToCsv,
  initialDeadLetterMessages,
  initialQueues,
  type BrokerQueue,
  type BrokerType,
  type DeadLetterMessage,
} from "@/lib/broker-queues-data"
import { DlqMessageSheet } from "./dlq-message-sheet"
import { PublishMessageDialog } from "./publish-message-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { DashboardBottomBar } from "@/components/dashboard/dashboard-bottom-bar"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  Flame,
  Layers,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface QueuesViewProps {
  initialServices?: Service[]
  teamName?: string
}

const BROKER_BADGES: Record<BrokerType, { bg: string; text: string; border: string }> = {
  Kafka: {
    bg: "bg-sky-500/10",
    text: "text-sky-600 dark:text-sky-400",
    border: "border-sky-500/30",
  },
  RabbitMQ: {
    bg: "bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/30",
  },
  "CAP Event Bus": {
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/30",
  },
  "Redis Streams": {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/30",
  },
}

export function QueuesView({
  initialServices = [],
  teamName = "Frontend Squad",
}: QueuesViewProps) {
  const [queues, setQueues] = React.useState<BrokerQueue[]>(initialQueues)
  const [dlqMessages, setDlqMessages] = React.useState<DeadLetterMessage[]>(initialDeadLetterMessages)
  const [selectedDlq, setSelectedDlq] = React.useState<DeadLetterMessage | null>(null)
  const [isDlqSheetOpen, setIsDlqSheetOpen] = React.useState(false)
  const [isPublishOpen, setIsPublishOpen] = React.useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedBroker, setSelectedBroker] = React.useState<string>("all")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")
  const [activeTab, setActiveTab] = React.useState<"queues" | "dlq">("queues")

  // Calculate summary metrics
  const summary = React.useMemo(() => {
    return calculateBrokerSummary(queues, dlqMessages)
  }, [queues, dlqMessages])

  // Filtered queues
  const filteredQueues = React.useMemo(() => {
    return queues.filter((q) => {
      if (selectedBroker !== "all" && q.brokerType !== selectedBroker) return false
      if (selectedStatus !== "all" && q.status !== selectedStatus) return false

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchName = q.name.toLowerCase().includes(query)
        const matchService = q.serviceName.toLowerCase().includes(query)
        const matchBroker = q.brokerType.toLowerCase().includes(query)
        if (!matchName && !matchService && !matchBroker) return false
      }
      return true
    })
  }, [queues, selectedBroker, selectedStatus, searchQuery])

  // Redrive a single DLQ message
  const handleRedriveMessage = (messageId: string) => {
    setDlqMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isReplayed: true } : m))
    )

    // Decrement DLQ count on corresponding queue
    const msg = dlqMessages.find((m) => m.id === messageId)
    if (msg) {
      setQueues((prev) =>
        prev.map((q) =>
          q.id === msg.queueId ? { ...q, dlqCount: Math.max(0, q.dlqCount - 1) } : q
        )
      )
    }
  }

  // Redrive all DLQ messages
  const handleRedriveAll = () => {
    setDlqMessages((prev) => prev.map((m) => ({ ...m, isReplayed: true })))
    setQueues((prev) => prev.map((q) => ({ ...q, dlqCount: 0 })))
  }

  // Publish event callback
  const handlePublishSuccess = (queueId: string, payload: any) => {
    setQueues((prev) =>
      prev.map((q) =>
        q.id === queueId
          ? {
              ...q,
              totalProcessedCount: q.totalProcessedCount + 1,
              consumerLag: q.consumerLag + 1,
            }
          : q
      )
    )
  }

  // Export CSV
  const handleExportCsv = () => {
    const csv = exportQueuesToCsv(queues)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `broker-queues-lag-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleOpenDlqDetail = (msg: DeadLetterMessage) => {
    setSelectedDlq(msg)
    setIsDlqSheetOpen(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground pb-20">
      {/* 1. Header */}
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-md select-none sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>Catalog</span>
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Radio className="size-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-foreground leading-none">
                Message Broker & Queues
              </h1>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                Kafka, RabbitMQ & Dead Letter Queue (DLQ) Inspector
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Publish Message Button */}
          <Button
            size="sm"
            onClick={() => setIsPublishOpen(true)}
            className="h-8 text-xs gap-1.5 cursor-pointer shadow-2xs bg-amber-500 hover:bg-amber-600 text-white dark:text-black font-semibold"
          >
            <Send className="size-3.5" />
            <span>Publish Event</span>
          </Button>

          {/* Export CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="h-8 text-xs gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="size-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>

          <Separator orientation="vertical" className="h-4" />
          <NotificationCenter />
          <ThemeToggle />
        </div>
      </header>

      {/* 2. Main Canvas */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 space-y-6">
        {/* KPI Metrics Row */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card/60 p-4 shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Topics & Queues
            </span>
            <div className="mt-2 text-2xl font-black font-mono text-foreground">
              {summary.totalQueues}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Kafka, RabbitMQ, CAP & Redis</p>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-4 shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Throughput Rate
            </span>
            <div className="mt-2 text-2xl font-black font-mono text-primary">
              {summary.totalThroughputMsgPerSec} msg/s
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Aggregated cluster ingestion</p>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-4 shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Consumer Lag
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={cn("text-2xl font-black font-mono", summary.totalConsumerLag > 500 ? "text-amber-500" : "text-foreground")}>
                {summary.totalConsumerLag.toLocaleString()}
              </span>
              <span className="text-xs font-mono text-muted-foreground">unprocessed</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Across all consumer worker groups</p>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-4 shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Dead Letter (DLQ) Backlog
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={cn("text-2xl font-black font-mono", summary.totalDlqMessages > 0 ? "text-rose-500" : "text-emerald-500")}>
                {summary.totalDlqMessages} Poison Pills
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Uncaught exception rejects</p>
          </div>
        </section>

        {/* 3. Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("queues")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                activeTab === "queues"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Active Queues & Consumer Lag ({queues.length})
            </button>
            <button
              onClick={() => setActiveTab("dlq")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "dlq"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>Dead Letter Queue (DLQ) Inspector</span>
              {summary.totalDlqMessages > 0 && (
                <Badge variant="destructive" className="text-[9px] px-1 py-0 font-mono">
                  {summary.totalDlqMessages}
                </Badge>
              )}
            </button>
          </div>
        </div>

        {/* Tab 1: Active Queues Table */}
        {activeTab === "queues" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-lg border border-border bg-card/40 p-3 shadow-2xs">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search topics, services, broker type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pl-9 text-xs font-mono"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Broker Selector */}
                <select
                  value={selectedBroker}
                  onChange={(e) => setSelectedBroker(e.target.value)}
                  className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">All Brokers</option>
                  <option value="Kafka">Apache Kafka</option>
                  <option value="RabbitMQ">RabbitMQ</option>
                  <option value="CAP Event Bus">CAP Event Bus</option>
                  <option value="Redis Streams">Redis Streams</option>
                </select>

                {/* Status Pills */}
                <div className="flex items-center rounded-md border border-border bg-muted/40 p-0.5 text-xs">
                  {["all", "healthy", "lagging", "critical_dlq"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedStatus(st)}
                      className={cn(
                        "rounded px-2.5 py-1 text-xs font-medium transition-all cursor-pointer capitalize",
                        selectedStatus === st
                          ? "bg-background text-foreground shadow-2xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {st === "critical_dlq" ? "DLQ Alerts" : st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Queues Table */}
            <div className="overflow-x-auto rounded-xl border border-border bg-card/60">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Topic / Queue Name</th>
                    <th className="p-3">Originating Service</th>
                    <th className="p-3">Broker Engine</th>
                    <th className="p-3">Rate</th>
                    <th className="p-3">Consumer Lag</th>
                    <th className="p-3">DLQ Rejects</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredQueues.map((q) => {
                    const bBadge = BROKER_BADGES[q.brokerType]
                    const isLagging = q.status === "lagging"
                    const isCriticalDlq = q.status === "critical_dlq"

                    return (
                      <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <div className="space-y-0.5">
                            <p className="font-mono font-bold text-foreground">
                              {q.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground line-clamp-1 max-w-[260px]">
                              {q.description}
                            </p>
                          </div>
                        </td>

                        <td className="p-3 font-semibold text-foreground">
                          {q.serviceName}
                        </td>

                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={cn("font-mono text-[9px] uppercase font-bold", bBadge.bg, bBadge.text, bBadge.border)}
                          >
                            {q.brokerType}
                          </Badge>
                        </td>

                        <td className="p-3 font-mono">
                          {q.throughputMsgPerSec} msg/s
                        </td>

                        <td className="p-3 font-mono">
                          <div className="space-y-1 w-28">
                            <span
                              className={cn(
                                "font-bold",
                                q.consumerLag > 500
                                  ? "text-amber-500"
                                  : q.consumerLag > 50
                                  ? "text-foreground"
                                  : "text-emerald-500"
                              )}
                            >
                              {q.consumerLag.toLocaleString()} msg
                            </span>
                            <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  q.consumerLag > 500 ? "bg-amber-500" : "bg-emerald-500"
                                )}
                                style={{
                                  width: `${Math.min(100, Math.max(5, (q.consumerLag / 2000) * 100))}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="p-3 font-mono">
                          {q.dlqCount > 0 ? (
                            <Badge variant="destructive" className="font-mono text-[9px] px-1.5 py-0">
                              {q.dlqCount} failed
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </td>

                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-mono text-[9px] uppercase font-bold",
                              q.status === "healthy" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                              q.status === "lagging" && "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                              q.status === "critical_dlq" && "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            )}
                          >
                            {q.status.replace("_", " ")}
                          </Badge>
                        </td>

                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setActiveTab("dlq")
                            }}
                            className="h-7 text-xs text-primary cursor-pointer"
                          >
                            Inspect
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

        {/* Tab 2: Dead Letter Queue (DLQ) Inspector */}
        {activeTab === "dlq" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-card/60 border border-border p-3 rounded-lg text-xs">
              <div>
                <h4 className="font-bold text-foreground">
                  Dead-Letter Queue (Poison-Pill Messages)
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Messages that failed all consumer retries due to deserialization, timeouts, or API rate limits.
                </p>
              </div>

              {summary.totalDlqMessages > 0 && (
                <Button
                  size="sm"
                  onClick={handleRedriveAll}
                  className="h-8 text-xs gap-1.5 cursor-pointer border-amber-500/30 bg-amber-500 hover:bg-amber-600 text-white dark:text-black font-semibold"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Redrive All ({summary.totalDlqMessages})</span>
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {dlqMessages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleOpenDlqDetail(msg)}
                  className={cn(
                    "rounded-xl border p-4 transition-all cursor-pointer flex flex-col justify-between space-y-3",
                    msg.isReplayed
                      ? "border-emerald-500/30 bg-emerald-500/5 opacity-75"
                      : "border-border bg-card/60 hover:border-primary/40 hover:shadow-xs"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-mono text-[9px] uppercase font-bold",
                          msg.isReplayed
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        )}
                      >
                        {msg.isReplayed ? "Replayed / Retried" : "Poison Pill"}
                      </Badge>
                      <span className="font-mono text-xs font-bold text-foreground">
                        {msg.topicName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                      <span>{msg.id}</span>
                      <span>•</span>
                      <span>{new Date(msg.failedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Exception Message */}
                  <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-2.5 font-mono text-[11px] text-rose-600 dark:text-rose-300 break-all leading-relaxed">
                    <strong>{msg.exceptionType}</strong>: {msg.errorMessage}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                    <span>Origin: <strong className="text-foreground">{msg.serviceName}</strong></span>
                    <span className="text-primary font-semibold hover:underline">
                      Inspect Payload & Redrive →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 4. DLQ Detail Sheet */}
      <DlqMessageSheet
        message={selectedDlq}
        open={isDlqSheetOpen}
        onOpenChange={setIsDlqSheetOpen}
        onRedriveMessage={handleRedriveMessage}
      />

      {/* 5. Publish Message Dialog */}
      <PublishMessageDialog
        open={isPublishOpen}
        onOpenChange={setIsPublishOpen}
        queues={queues}
        onPublishSuccess={handlePublishSuccess}
      />

      {/* 6. Fixed Bottom Dock */}
      <DashboardBottomBar
        totalServices={queues.length}
        activeFilter="All"
        totalIncidents={summary.totalDlqMessages}
      />
    </div>
  )
}
