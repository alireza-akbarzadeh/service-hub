"use client";

import {
  addService,
  deleteService,
  updateService,
  logoutAction,
} from "@/app/actions/services"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { OnboardingModal } from "@/components/onboarding-modal"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Service } from "@/lib/db/schema"
import {
  Activity,
  AlertTriangle,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Code2,
  Copy,
  Cpu,
  Database,
  Edit2,
  ExternalLink,
  Filter,
  FolderGit2,
  Layers,
  LogOut,
  MonitorCheck,
  Network,
  Plus,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  Compass,
  BookOpen,
} from "lucide-react"
import * as React from "react"

interface ServicesDashboardProps {
  initialServices: Service[]
  isLiveNeon: boolean
  branchName: string
  teamName?: string
}

const ENVIRONMENTS = [
  { id: "All", name: "All Environments", icon: Layers },
  { id: "Develop", name: "Development", icon: Code2 },
  { id: "Test", name: "QA & Testing", icon: MonitorCheck },
  { id: "Stage", name: "Staging Replica", icon: Cpu },
  { id: "DevOps & Tools", name: "DevOps & CI/CD", icon: Network },
  { id: "Portals & HR", name: "Portals & Enterprise", icon: Building2 },
]

const CATEGORIES = [
  "All",
  "Web Apps",
  "API & Swagger",
  "Observability",
  "Messaging",
  "Background Jobs",
  "Config & Data",
  "DevOps & CI/CD",
  "Enterprise & Portals",
]

function getPageNumbers(current: number, total: number) {
  if (total <= 6) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  if (current <= 3) {
    return [1, 2, 3, 4, "...", total]
  }
  if (current >= total - 2) {
    return [1, "...", total - 3, total - 2, total - 1, total]
  }
  return [1, "...", current - 1, current, current + 1, "...", total]
}

export function ServicesDashboard({
  initialServices,
  isLiveNeon,
  branchName,
  teamName,
}: ServicesDashboardProps) {
  const [services, setServices] = React.useState<Service[]>(initialServices)
  const [selectedEnv, setSelectedEnv] = React.useState("All")
  const [selectedCategory, setSelectedCategory] = React.useState("All")
  const [searchQuery, setSearchQuery] = React.useState("")

  // Pagination states
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  // Dialog states
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isOnboardingOpen, setIsOnboardingOpen] = React.useState(false)
  const [editingService, setEditingService] = React.useState<Service | null>(
    null
  )
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [copiedId, setCopiedId] = React.useState<number | null>(null)

  // Form states
  const [formName, setFormName] = React.useState("")
  const [formDescription, setFormDescription] = React.useState("")
  const [formCategory, setFormCategory] = React.useState("Web Apps")
  const [formEnvironment, setFormEnvironment] = React.useState("Develop")
  const [formStatus, setFormStatus] = React.useState("operational")
  const [formUrl, setFormUrl] = React.useState("")
  const [formOwner, setFormOwner] = React.useState("Platform Team")

  // Filtered services
  const filteredServices = React.useMemo(() => {
    return services.filter((svc) => {
      const matchesEnv =
        selectedEnv === "All" || svc.environment === selectedEnv
      const matchesCategory =
        selectedCategory === "All" || svc.category === selectedCategory
      const matchesSearch =
        svc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        svc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (svc.owner &&
          svc.owner.toLowerCase().includes(searchQuery.toLowerCase())) ||
        svc.url.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesEnv && matchesCategory && matchesSearch
    })
  }, [services, selectedEnv, selectedCategory, searchQuery])

  // Total pages and paginated slice
  const totalItems = filteredServices.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  // Reset page when out of bounds
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1)
    }
  }, [totalPages, currentPage])

  const paginatedServices = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredServices.slice(start, start + pageSize)
  }, [filteredServices, currentPage, pageSize])

  // Statistics
  const stats = React.useMemo(() => {
    const total = services.length
    const operational = services.filter(
      (s) => s.status === "operational"
    ).length
    const degraded = services.filter((s) => s.status === "degraded").length
    const maintenance = services.filter(
      (s) => s.status === "maintenance"
    ).length
    return { total, operational, degraded, maintenance }
  }, [services])

  const envCounts = React.useMemo(() => {
    const map: Record<string, number> = { All: services.length }
    services.forEach((s) => {
      map[s.environment] = (map[s.environment] || 0) + 1
    })
    return map
  }, [services])

  function handleEnvSelect(envId: string) {
    setSelectedEnv(envId)
    setCurrentPage(1)
  }

  function openAddModal() {
    setFormName("")
    setFormDescription("")
    setFormCategory(selectedCategory === "All" ? "Web Apps" : selectedCategory)
    setFormEnvironment(selectedEnv === "All" ? "Develop" : selectedEnv)
    setFormStatus("operational")
    setFormUrl("https://")
    setFormOwner("Platform Team")
    setIsAddOpen(true)
  }

  function openEditModal(svc: Service) {
    setEditingService(svc)
    setFormName(svc.name)
    setFormDescription(svc.description)
    setFormCategory(svc.category)
    setFormEnvironment(svc.environment)
    setFormStatus(svc.status)
    setFormUrl(svc.url)
    setFormOwner(svc.owner || "Platform Team")
  }

  async function handleCreateService(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    const res = await addService({
      name: formName,
      description: formDescription,
      category: formCategory,
      environment: formEnvironment,
      status: formStatus,
      url: formUrl,
      owner: formOwner,
    })

    if (res.success && res.service) {
      setServices((prev) => [res.service!, ...prev])
      setIsAddOpen(false)
    }
    setIsSubmitting(false)
  }

  async function handleUpdateService(e: React.FormEvent) {
    e.preventDefault()
    if (!editingService) return
    setIsSubmitting(true)

    const res = await updateService(editingService.id, {
      name: formName,
      description: formDescription,
      category: formCategory,
      environment: formEnvironment,
      status: formStatus,
      url: formUrl,
      owner: formOwner,
    })

    if (res.success) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingService.id
            ? {
                ...s,
                name: formName,
                description: formDescription,
                category: formCategory,
                environment: formEnvironment,
                status: formStatus,
                url: formUrl,
                owner: formOwner,
              }
            : s
        )
      )
      setEditingService(null)
    }
    setIsSubmitting(false)
  }

  async function handleDeleteService(id: number, name: string) {
    if (!confirm(`Are you sure you want to delete service "${name}"?`)) return
    const res = await deleteService(id)
    if (res.success) {
      setServices((prev) => prev.filter((s) => s.id !== id))
    }
  }

  function copyUrl(url: string, id: number) {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "operational":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          >
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Operational
          </Badge>
        )
      case "degraded":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          >
            <span className="size-1.5 rounded-full bg-amber-500" />
            Degraded
          </Badge>
        )
      case "maintenance":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400"
          >
            <span className="size-1.5 rounded-full bg-sky-500" />
            Maintenance
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        {/* Collapsible Sidebar */}
        <Sidebar collapsible="icon" className="border-r border-border">
          <SidebarHeader className="border-b border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                <Activity className="size-4" />
              </div>
              <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-bold tracking-tight">
                  Service Catalog
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  Enterprise Hub
                </span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {/* Environments Navigation */}
            <SidebarGroup>
              <SidebarGroupLabel>Environments</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {ENVIRONMENTS.map((env) => {
                    const Icon = env.icon
                    const isActive = selectedEnv === env.id
                    const count = envCounts[env.id] || 0
                    return (
                      <SidebarMenuItem key={env.id}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => handleEnvSelect(env.id)}
                          className="cursor-pointer justify-between"
                          tooltip={env.name}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="size-4" />
                            <span>{env.name}</span>
                          </div>
                          <span className="ml-auto font-mono text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                            {count}
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Neon Connection Info in Sidebar */}
            <SidebarGroup className="mt-auto">
              <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
                Neon Infrastructure
              </SidebarGroupLabel>
              <SidebarGroupContent className="space-y-2 px-3 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Database className="size-3 text-emerald-500" />
                    Branch:
                  </span>
                  <code className="font-mono font-semibold text-foreground">
                    {branchName}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="size-3 text-sky-500" />
                    Driver:
                  </span>
                  <span className="font-mono text-[11px] text-foreground">
                    drizzle-orm/neon-http
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3 text-primary" />
                    Status:
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                    Connected
                  </span>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* Clean Sidebar Footer with no overflow */}
          <SidebarFooter className="border-t border-border p-2">
            <div className="flex items-center justify-center group-data-[collapsible=icon]:p-0">
              <div
                className="hidden size-8 items-center justify-center rounded-md bg-muted/50 text-muted-foreground group-data-[collapsible=icon]:flex"
                title="Neon Active"
              >
                <Database className="size-4 text-emerald-500" />
              </div>
              <div className="flex w-full items-center justify-between px-2 py-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Neon Postgres
                </span>
                <span className="font-mono text-[11px] font-semibold text-foreground">
                  v16
                </span>
              </div>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        {/* Main Content Area */}
        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          {/* Top Sticky Navigation Header */}
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 sm:px-6 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="cursor-pointer shrink-0" />
              <Separator orientation="vertical" className="h-5 shrink-0" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setSelectedEnv("All")
                        setSelectedCategory("All")
                      }}
                      className="cursor-pointer text-xs"
                    >
                      Service Hub
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-xs font-semibold">
                      {selectedEnv}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                  {selectedCategory !== "All" && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-xs font-medium text-muted-foreground">
                          {selectedCategory}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOnboardingOpen(true)}
                className="hidden sm:inline-flex h-8 gap-1.5 text-xs font-medium cursor-pointer"
              >
                <Compass className="size-3.5 text-primary" />
                <span>Tour</span>
              </Button>

              <Link
                href="/onboarding"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "hidden md:inline-flex h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                )}
              >
                <BookOpen className="size-3.5 text-sky-500" />
                <span>Docs</span>
              </Link>

              <Separator orientation="vertical" className="h-5 hidden sm:block" />

              {/* Branch indicator */}
              <div className="hidden lg:flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground">
                <Database className="size-3 text-emerald-500" />
                <span>{branchName}</span>
              </div>

              {/* Team badge & logout */}
              {teamName && (
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="gap-1 px-2 py-0.5 text-xs font-medium">
                    <Users className="size-3 text-primary" />
                    <span>{teamName}</span>
                  </Badge>
                  <form action={logoutAction}>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive cursor-pointer"
                      title="Log out"
                    >
                      <LogOut className="size-4" />
                    </Button>
                  </form>
                </div>
              )}

              <Separator orientation="vertical" className="h-5" />
              <ThemeToggle />
            </div>
          </header>

          {/* Main Dashboard Body */}
          <main className="w-full max-w-7xl flex-1 space-y-6 p-4 sm:p-6">
            {/* Overview Stats Bar */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Total Registered</span>
                  <Server className="size-4 text-primary opacity-80" />
                </div>
                <div className="mt-2 text-2xl font-bold">{stats.total}</div>
                <div className="text-[11px] text-muted-foreground">
                  Across all microservices
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Operational</span>
                  <CheckCircle2 className="size-4 text-emerald-500" />
                </div>
                <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.operational}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  100% SLA target
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Degraded / Warning</span>
                  <AlertTriangle className="size-4 text-amber-500" />
                </div>
                <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {stats.degraded}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Investigating incident
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Under Maintenance</span>
                  <Clock className="size-4 text-sky-500" />
                </div>
                <div className="mt-2 text-2xl font-bold text-sky-600 dark:text-sky-400">
                  {stats.maintenance}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Scheduled deployments
                </div>
              </div>
            </div>

            {/* Filter and Search Controls (Replaced Chips with clean Select Box) */}
            <div className="flex flex-col items-stretch justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-xs sm:flex-row sm:items-center">
              <div className="flex flex-1 flex-col items-stretch gap-2.5 sm:flex-row sm:items-center">
                {/* Category Select Box */}
                <div className="relative w-full shrink-0 sm:w-56">
                  <Filter className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-border bg-background py-1.5 pr-8 pl-9 text-xs font-medium text-foreground transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === "All" ? "All Categories" : cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-2.5 right-3 size-4 text-muted-foreground opacity-70" />
                </div>

                {/* Instant Search Bar */}
                <div className="relative min-w-[200px] flex-1">
                  <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by service name, endpoint, owner..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="h-9 pl-9 text-xs"
                  />
                </div>
              </div>

              {/* Rows per page & Add Service */}
              <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border pt-2 sm:justify-end sm:border-t-0 sm:pt-0">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="h-9 cursor-pointer rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <Button
                  size="sm"
                  onClick={openAddModal}
                  className="h-9 cursor-pointer gap-1.5 shadow-xs"
                >
                  <Plus className="size-4" />
                  <span>Add Service</span>
                </Button>
              </div>
            </div>

            {/* Services Table */}
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[300px]">
                      Service & Description
                    </TableHead>
                    <TableHead>Environment</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedServices.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-48 text-center text-muted-foreground"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Server className="size-8 opacity-30" />
                          <p className="font-medium">
                            No services match the current filters.
                          </p>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => {
                              setSelectedEnv("All")
                              setSelectedCategory("All")
                              setSearchQuery("")
                              setCurrentPage(1)
                            }}
                          >
                            Reset Filters
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedServices.map((svc) => (
                      <TableRow
                        key={svc.id}
                        className="group transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2 font-semibold text-foreground">
                            <span>{svc.name}</span>
                          </div>
                          <div className="mt-0.5 line-clamp-1 max-w-[340px] text-xs text-muted-foreground">
                            {svc.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="text-[11px] font-normal"
                          >
                            {svc.environment}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-medium text-muted-foreground">
                            {svc.category}
                          </span>
                        </TableCell>
                        <TableCell>{renderStatusBadge(svc.status)}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {svc.owner || "Platform"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <a
                              href={svc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                            >
                              Open
                              <ExternalLink className="size-3" />
                            </a>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => copyUrl(svc.url, svc.id)}
                              className="opacity-0 transition-opacity group-hover:opacity-100"
                              title="Copy link"
                            >
                              {copiedId === svc.id ? (
                                <Check className="size-3 text-emerald-500" />
                              ) : (
                                <Copy className="size-3 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => openEditModal(svc)}
                              title="Edit service"
                              className="cursor-pointer text-muted-foreground hover:text-foreground"
                            >
                              <Edit2 className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() =>
                                handleDeleteService(svc.id, svc.name)
                              }
                              title="Delete service"
                              className="cursor-pointer text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col items-center justify-between gap-3 px-1 py-2 sm:flex-row">
              <div className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(currentPage * pageSize, totalItems)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {totalItems}
                </span>{" "}
                services
              </div>

              {totalPages > 1 && (
                <Pagination className="mx-0 w-auto justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((p) => Math.max(p - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-40"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {getPageNumbers(currentPage, totalPages).map((p, idx) => (
                      <PaginationItem key={idx}>
                        {p === "..." ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            isActive={currentPage === p}
                            onClick={() => setCurrentPage(p as number)}
                          >
                            {p}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((p) => Math.min(p + 1, totalPages))
                        }
                        disabled={currentPage === totalPages}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-40"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </main>
        </SidebarInset>

        {/* Add Service Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleCreateService}>
              <DialogHeader>
                <DialogTitle>Register New Service</DialogTitle>
                <DialogDescription>
                  Add a new service, microservice, or portal to the Neon
                  database catalog.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 py-4 text-xs">
                <div>
                  <label className="mb-1 block font-medium text-foreground">
                    Service Name *
                  </label>
                  <Input
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Orders Settlement API"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block font-medium text-foreground">
                      Environment *
                    </label>
                    <select
                      value={formEnvironment}
                      onChange={(e) => setFormEnvironment(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                    >
                      <option value="Develop">Develop</option>
                      <option value="Test">Test</option>
                      <option value="Stage">Stage</option>
                      <option value="DevOps & Tools">DevOps & Tools</option>
                      <option value="Portals & HR">Portals & HR</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-foreground">
                      Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                    >
                      {CATEGORIES.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-medium text-foreground">
                    Description *
                  </label>
                  <Input
                    required
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Short description of service responsibilities..."
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium text-foreground">
                    Endpoint URL *
                  </label>
                  <Input
                    required
                    type="url"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block font-medium text-foreground">
                      Status
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                    >
                      <option value="operational">Operational</option>
                      <option value="degraded">Degraded</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-foreground">
                      Owner Team
                    </label>
                    <Input
                      value={formOwner}
                      onChange={(e) => setFormOwner(e.target.value)}
                      placeholder="e.g. Commerce Squad"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save to Neon"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Service Dialog */}
        <Dialog
          open={!!editingService}
          onOpenChange={(open) => !open && setEditingService(null)}
        >
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleUpdateService}>
              <DialogHeader>
                <DialogTitle>Edit Service</DialogTitle>
                <DialogDescription>
                  Modify the configuration and links for this service in the
                  catalog.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 py-4 text-xs">
                <div>
                  <label className="mb-1 block font-medium text-foreground">
                    Service Name *
                  </label>
                  <Input
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block font-medium text-foreground">
                      Environment *
                    </label>
                    <select
                      value={formEnvironment}
                      onChange={(e) => setFormEnvironment(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                    >
                      <option value="Develop">Develop</option>
                      <option value="Test">Test</option>
                      <option value="Stage">Stage</option>
                      <option value="DevOps & Tools">DevOps & Tools</option>
                      <option value="Portals & HR">Portals & HR</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-foreground">
                      Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                    >
                      {CATEGORIES.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-medium text-foreground">
                    Description *
                  </label>
                  <Input
                    required
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium text-foreground">
                    Endpoint URL *
                  </label>
                  <Input
                    required
                    type="url"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block font-medium text-foreground">
                      Status
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                    >
                      <option value="operational">Operational</option>
                      <option value="degraded">Degraded</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-foreground">
                      Owner Team
                    </label>
                    <Input
                      value={formOwner}
                      onChange={(e) => setFormOwner(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingService(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Service"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Interactive App & Architecture Tour Modal */}
        <OnboardingModal
          open={isOnboardingOpen}
          onOpenChange={setIsOnboardingOpen}
        />
      </div>
    </SidebarProvider>
  )
}
