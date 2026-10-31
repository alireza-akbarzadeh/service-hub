"use client"

import * as React from "react"
import type { Service } from "@/lib/db/schema"
import {
  addService,
  deleteService,
  updateService,
  checkEndpointHealth,
  batchCheckEndpointsHealth,
  recordServicePing,
  getAllServicesTelemetrySummary,
  type HealthCheckResult,
} from "@/app/actions/services"
import { useNetworkLocation } from "@/components/network-status-indicator"

export const ENVIRONMENTS = [
  { id: "All", name: "All Environments" },
  { id: "Develop", name: "Development" },
  { id: "Test", name: "QA & Testing" },
  { id: "Stage", name: "Staging Replica" },
  { id: "DevOps & Tools", name: "DevOps & CI/CD" },
  { id: "Portals & HR", name: "Portals & Enterprise" },
]

export const CATEGORIES = [
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

export const AVAILABLE_TAGS = [
  { id: "#all", label: "All Tags" },
  { id: "#swagger", label: "#swagger" },
  { id: "#gateway", label: "#gateway" },
  { id: "#auth", label: "#auth" },
  { id: "#payment", label: "#payment" },
  { id: "#observability", label: "#observability" },
  { id: "#jobs", label: "#jobs" },
  { id: "#intranet", label: "#intranet" },
  { id: "#portal", label: "#portal" },
]

export function getServiceTags(service: Service): string[] {
  const tags: string[] = []
  const name = service.name.toLowerCase()
  const cat = service.category.toLowerCase()
  const desc = service.description.toLowerCase()
  const url = service.url.toLowerCase()

  if (cat.includes("swagger") || name.includes("swagger") || url.includes("swagger")) {
    tags.push("#swagger")
  }
  if (name.includes("gateway") || cat.includes("gateway")) {
    tags.push("#gateway")
  }
  if (name.includes("auth") || desc.includes("auth") || desc.includes("sso") || desc.includes("identity")) {
    tags.push("#auth")
  }
  if (name.includes("payment") || desc.includes("payment") || desc.includes("wallet") || desc.includes("commerce")) {
    tags.push("#payment")
  }
  if (
    cat.includes("observability") ||
    name.includes("grafana") ||
    name.includes("prometheus") ||
    name.includes("loki") ||
    name.includes("alert")
  ) {
    tags.push("#observability")
  }
  if (
    cat.includes("messaging") ||
    cat.includes("jobs") ||
    name.includes("hangfire") ||
    name.includes("rabbit") ||
    name.includes("kafka")
  ) {
    tags.push("#jobs")
  }
  if (url.includes("172.31") || url.includes("10.") || url.includes(".hasti.co")) {
    tags.push("#intranet")
  }
  if (
    cat.includes("portals") ||
    cat.includes("web apps") ||
    name.includes("portal") ||
    name.includes("admin") ||
    name.includes("vendor")
  ) {
    tags.push("#portal")
  }

  return tags
}

export function useServicesDashboard(initialServices: Service[]) {
  const [services, setServices] = React.useState<Service[]>(initialServices)
  const [selectedEnv, setSelectedEnv] = React.useState("All")
  const [selectedCategory, setSelectedCategory] = React.useState("All")
  const [selectedTag, setSelectedTag] = React.useState<string>("#all")
  const [searchQuery, setSearchQuery] = React.useState("")

  // Pagination states
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  // Favorites / Pinned states with lazy initializer
  const [favorites, setFavorites] = React.useState<number[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const savedFavs = localStorage.getItem("service_hub_favorites")
      if (savedFavs) return JSON.parse(savedFavs)
    } catch {}
    return []
  })
  const [showOnlyFavorites, setShowOnlyFavorites] = React.useState(false)

  // Dialog and panel states
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false)
  const [isRightPanelOpen, setIsRightPanelOpen] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return true
    try {
      const savedPanel = localStorage.getItem("service_hub_right_panel")
      if (savedPanel !== null) return JSON.parse(savedPanel)
    } catch {}
    return true
  })
  const [inspectingService, setInspectingService] = React.useState<Service | null>(null)
  const [editingService, setEditingService] = React.useState<Service | null>(null)

  // Global Ctrl+K / Cmd+K listener ensuring search opens reliably across all keyboard layouts
  React.useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      const isKeyK = e.key?.toLowerCase() === "k" || e.code === "KeyK"
      if ((e.metaKey || e.ctrlKey) && isKeyK) {
        e.preventDefault()
        setIsCommandPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown)
    return () => window.removeEventListener("keydown", handleGlobalKeyDown)
  }, [])

  // Health check & Neon telemetry states
  const [healthMap, setHealthMap] = React.useState<Record<number, HealthCheckResult>>({})
  const [isCheckingAllHealth, setIsCheckingAllHealth] = React.useState(false)
  const [telemetryMap, setTelemetryMap] = React.useState<
    Record<number, { uptimeRate: number; avgLatency: number; sparkline: number[] }>
  >({})

  // Fetch telemetry summaries from Neon on mount
  React.useEffect(() => {
    let isMounted = true
    getAllServicesTelemetrySummary()
      .then((map) => {
        if (isMounted && map) {
          setTelemetryMap(map)
        }
      })
      .catch(() => {})
    return () => {
      isMounted = false
    }
  }, [])

  // Network / Location & VPN detection
  const {
    info: networkInfo,
    isRefreshing: isRefreshingNetwork,
    refresh: refreshNetwork,
  } = useNetworkLocation()

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [copiedId, setCopiedId] = React.useState<number | null>(null)

  const toggleRightPanel = React.useCallback(() => {
    setIsRightPanelOpen((prev) => {
      const next = !prev
      try {
        localStorage.setItem("service_hub_right_panel", JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const toggleFavorite = React.useCallback((id: number) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      try {
        localStorage.setItem("service_hub_favorites", JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const favoriteServices = React.useMemo(() => {
    return services.filter((svc) => favorites.includes(svc.id))
  }, [services, favorites])

  // Recently Opened / Used Services
  const [recentServiceIds, setRecentServiceIds] = React.useState<number[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const saved = localStorage.getItem("service_hub_recent_services")
      if (saved) return JSON.parse(saved)
    } catch {}
    return []
  })

  const markServiceOpened = React.useCallback((id: number) => {
    setRecentServiceIds((prev) => {
      const filtered = prev.filter((item) => item !== id)
      const updated = [id, ...filtered].slice(0, 8)
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("service_hub_recent_services", JSON.stringify(updated))
        } catch {}
      }
      return updated
    })
  }, [])

  const recentServices = React.useMemo(() => {
    return recentServiceIds
      .map((id) => services.find((s) => s.id === id))
      .filter((s): s is Service => s !== undefined)
  }, [recentServiceIds, services])

  // Form states for Add/Edit
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
      if (showOnlyFavorites && !favorites.includes(svc.id)) {
        return false
      }
      const matchesEnv = selectedEnv === "All" || svc.environment === selectedEnv
      const matchesCategory = selectedCategory === "All" || svc.category === selectedCategory
      const matchesTag = selectedTag === "#all" || getServiceTags(svc).includes(selectedTag)
      const matchesSearch =
        svc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        svc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (svc.owner && svc.owner.toLowerCase().includes(searchQuery.toLowerCase())) ||
        svc.url.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesEnv && matchesCategory && matchesTag && matchesSearch
    })
  }, [
    services,
    selectedEnv,
    selectedCategory,
    selectedTag,
    searchQuery,
    showOnlyFavorites,
    favorites,
  ])

  const tagCounts = React.useMemo(() => {
    const counts: Record<string, number> = { "#all": services.length }
    for (const s of services) {
      for (const t of getServiceTags(s)) {
        counts[t] = (counts[t] || 0) + 1
      }
    }
    return counts
  }, [services])

  // Pagination calculations
  const totalItems = filteredServices.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const effectivePage = Math.min(currentPage, totalPages)

  const paginatedServices = React.useMemo(() => {
    const start = (effectivePage - 1) * pageSize
    return filteredServices.slice(start, start + pageSize)
  }, [filteredServices, effectivePage, pageSize])

  // Statistics
  const stats = React.useMemo(() => {
    const total = services.length
    const operational = services.filter((s) => s.status === "operational").length
    const degraded = services.filter((s) => s.status === "degraded").length
    const maintenance = services.filter((s) => s.status === "maintenance").length
    return { total, operational, degraded, maintenance }
  }, [services])

  const envCounts = React.useMemo(() => {
    const map: Record<string, number> = { All: services.length }
    services.forEach((s) => {
      map[s.environment] = (map[s.environment] || 0) + 1
    })
    return map
  }, [services])

  // Memoized mirror map for hops (Dev/Test/Stage)
  const mirrorMap = React.useMemo(() => {
    const clean = (name: string) => {
      return name
        .replace(/\s*\((Dev|Test|Stage|QA|Production|Prod|172\.[^\)]+)\)\s*/gi, "")
        .replace(/\bapi gateway\b/gi, "gateway")
        .replace(/\btapsi shop web\b/gi, "commerce web")
        .replace(/\btapsi shop\b/gi, "commerce")
        .replace(/[-_:]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase()
    }

    const map = new Map<number, Service[]>()
    const grouped = new Map<string, Service[]>()

    for (const s of services) {
      const k = clean(s.name)
      if (!grouped.has(k)) {
        grouped.set(k, [])
      }
      grouped.get(k)!.push(s)
    }

    for (const s of services) {
      const k = clean(s.name)
      const siblings = (grouped.get(k) || []).filter(
        (sibling) => sibling.id !== s.id && sibling.environment !== s.environment
      )
      map.set(s.id, siblings)
    }

    return map
  }, [services])

  const handlePingSingle = React.useCallback(
    async (svc: Service, e?: React.MouseEvent) => {
      if (e) e.stopPropagation()
      setHealthMap((prev) => ({
        ...prev,
        [svc.id]: {
          url: svc.url,
          status: "online" as HealthCheckResult["status"],
          latencyMs: 0,
        },
      }))
      try {
        const res = await checkEndpointHealth(svc.url)
        setHealthMap((prev) => ({ ...prev, [svc.id]: res }))
        // Record telemetry to Neon Postgres
        recordServicePing(svc.id, svc.url, res)
          .then(() => {
            getAllServicesTelemetrySummary().then(setTelemetryMap).catch(() => {})
          })
          .catch(() => {})
      } catch {
        const failRes: HealthCheckResult = {
          url: svc.url,
          status: "offline",
          latencyMs: 3500,
          message: "Error",
        }
        setHealthMap((prev) => ({ ...prev, [svc.id]: failRes }))
        recordServicePing(svc.id, svc.url, failRes).catch(() => {})
      }
    },
    []
  )

  const handleCheckAllVisibleHealth = React.useCallback(async () => {
    if (paginatedServices.length === 0) return
    setIsCheckingAllHealth(true)
    const urls = paginatedServices.map((s) => s.url)
    try {
      const results = await batchCheckEndpointsHealth(urls)
      setHealthMap((prev) => {
        const next = { ...prev }
        paginatedServices.forEach((s) => {
          if (results[s.url]) {
            next[s.id] = results[s.url]
            // Record each ping to Neon Postgres
            recordServicePing(s.id, s.url, results[s.url]).catch(() => {})
          }
        })
        return next
      })
      getAllServicesTelemetrySummary().then(setTelemetryMap).catch(() => {})
    } finally {
      setIsCheckingAllHealth(false)
    }
  }, [paginatedServices])

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

  return {
    // Services state
    services,
    filteredServices,
    paginatedServices,
    favoriteServices,
    favorites,
    recentServices,
    markServiceOpened,
    showOnlyFavorites,
    setShowOnlyFavorites,
    toggleFavorite,
    // Filters & Pagination
    selectedEnv,
    setSelectedEnv,
    selectedCategory,
    setSelectedCategory,
    selectedTag,
    setSelectedTag,
    searchQuery,
    setSearchQuery,
    currentPage: effectivePage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalItems,
    totalPages,
    // Health & Network
    healthMap,
    telemetryMap,
    isCheckingAllHealth,
    handlePingSingle,
    handleCheckAllVisibleHealth,
    networkInfo,
    isRefreshingNetwork,
    refreshNetwork,
    // Modals & Panels
    isAddOpen,
    setIsAddOpen,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isRightPanelOpen,
    setIsRightPanelOpen,
    toggleRightPanel,
    inspectingService,
    setInspectingService,
    editingService,
    setEditingService,
    // Forms
    formName,
    setFormName,
    formDescription,
    setFormDescription,
    formCategory,
    setFormCategory,
    formEnvironment,
    setFormEnvironment,
    formStatus,
    setFormStatus,
    formUrl,
    setFormUrl,
    formOwner,
    setFormOwner,
    isSubmitting,
    openAddModal,
    openEditModal,
    handleCreateService,
    handleUpdateService,
    handleDeleteService,
    // Utilities & Maps
    stats,
    envCounts,
    tagCounts,
    mirrorMap,
    copiedId,
    copyUrl,
  }
}
