"use client"

import { AnnouncementBanner } from "@/components/announcement-banner"
import { CommandPalette } from "@/components/command-palette"
import { ForeignVpnWarningBanner } from "@/components/network-status-indicator"
import { RequestSubmitModal } from "@/components/requests/request-submit-modal"
import { ServiceDetailSheet } from "@/components/service-detail-sheet"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import type { Service } from "@/lib/db/schema"
import * as React from "react"

// Modular Dashboard Components & Custom Hook
import {
  getServiceTags,
  useServicesDashboard,
} from "@/hooks/use-services-dashboard"
export { getServiceTags }

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSettingsDialog } from "@/components/dashboard/dashboard-settings-dialog"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import {
  CONFIG_CHANGED_EVENT,
  decodeConfigFromUrlHash,
  GridConfig,
  loadGridConfig,
  saveGridConfig,
} from "@/components/dashboard/grid-view-config"
import { PinnedServices } from "@/components/dashboard/pinned-services"
import { ServiceFormDialogs } from "@/components/dashboard/service-form-dialogs"
import { ServicesCardsGrid } from "@/components/dashboard/services-cards-grid"
import { ServicesFilterBar } from "@/components/dashboard/services-filter-bar"
import { ServicesPagination } from "@/components/dashboard/services-pagination"
import { ServicesTable } from "@/components/dashboard/services-table"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { IranCalendarPanel } from "@/components/iran-calendar/iran-calendar-panel"

interface ServicesDashboardProps {
  initialServices: Service[]
  isLiveNeon: boolean
  branchName: string
  teamName?: string
}

export function ServicesDashboard({
  initialServices,
  isLiveNeon,
  branchName,
  teamName,
}: ServicesDashboardProps) {
  // Extract all states and actions from clean custom hook
  const {
    services,
    paginatedServices,
    favoriteServices,
    favorites,
    recentServices,
    markServiceOpened,
    showOnlyFavorites,
    setShowOnlyFavorites,
    toggleFavorite,
    selectedEnv,
    setSelectedEnv,
    selectedCategory,
    setSelectedCategory,
    selectedTag,
    setSelectedTag,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalItems,
    totalPages,
    healthMap,
    telemetryMap,
    isCheckingAllHealth,
    handlePingSingle,
    handleCheckAllVisibleHealth,
    networkInfo,
    isRefreshingNetwork,
    refreshNetwork,
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
    stats,
    envCounts,
    tagCounts,
    mirrorMap,
    copiedId,
    copyUrl,
  } = useServicesDashboard(initialServices)

  // Mobile drawer state for Iran Calendar & Sync panel
  const [isMobilePanelOpen, setIsMobilePanelOpen] = React.useState(false)

  // Dashboard Settings & JSON Config Modal State
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)

  // Coworker Feature Request & Bug Fix PR Modal State
  const [isSubmitRequestOpen, setIsSubmitRequestOpen] = React.useState(false)
  const [submitRequestType, setSubmitRequestType] = React.useState<
    "feature" | "bug" | "pull_request"
  >("feature")
  const [submitRequestTargetService, setSubmitRequestTargetService] =
    React.useState<string | undefined>(undefined)

  const handleOpenSubmitRequest = React.useCallback(
    (
      type: "feature" | "bug" | "pull_request" = "feature",
      serviceName?: string
    ) => {
      setSubmitRequestType(type)
      setSubmitRequestTargetService(serviceName)
      setIsSubmitRequestOpen(true)
    },
    []
  )

  // 3-Shape Display Mode & Preferences stored in localStorage
  const [gridConfig, setGridConfig] = React.useState<GridConfig>(() =>
    loadGridConfig()
  )

  const handleUpdateGridConfig = React.useCallback((newConfig: GridConfig) => {
    setGridConfig(newConfig)
    saveGridConfig(newConfig)
  }, [])

  // Client-side hydration & shared URL hash detection
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      // Check for shareable URL hash config
      if (window.location.hash) {
        const sharedConfig = decodeConfigFromUrlHash(window.location.hash)
        if (sharedConfig) {
          handleUpdateGridConfig(sharedConfig)
        }
      }

      // Sync across components on custom event
      const handleConfigEvent = (e: Event) => {
        const customEvent = e as CustomEvent<GridConfig>
        if (customEvent.detail) {
          setGridConfig(customEvent.detail)
        }
      }
      window.addEventListener(CONFIG_CHANGED_EVENT, handleConfigEvent)
      return () => {
        window.removeEventListener(CONFIG_CHANGED_EVENT, handleConfigEvent)
      }
    }
  }, [handleUpdateGridConfig])

  const handleTogglePanel = () => {
    // On large screens, toggle right dock
    toggleRightPanel()
    // On small screens, also open drawer if opening
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      setIsMobilePanelOpen(!isMobilePanelOpen)
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground antialiased selection:bg-primary/20">
        {/* Scrollable Shadcn Sidebar with Groups */}
        <DashboardSidebar
          selectedEnv={selectedEnv}
          onSelectEnv={(env) => {
            setSelectedEnv(env)
            setCurrentPage(1)
          }}
          envCounts={envCounts}
          branchName={branchName}
          teamName={teamName}
          networkInfo={networkInfo}
          isRefreshingNetwork={isRefreshingNetwork}
          onRefreshNetwork={refreshNetwork}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onPingVisibleServices={handleCheckAllVisibleHealth}
          isCheckingAllHealth={isCheckingAllHealth}
          visibleServicesCount={paginatedServices.length}
        />

        {/* Main Layout Area */}
        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          {/* Top Decluttered Header */}
          <DashboardHeader
            selectedEnv={selectedEnv}
            selectedCategory={selectedCategory}
            onResetFilters={() => {
              setSelectedEnv("All")
              setSelectedCategory("All")
              setSelectedTag("#all")
              setSearchQuery("")
              setCurrentPage(1)
            }}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            isRightPanelOpen={isRightPanelOpen}
            onToggleRightPanel={handleTogglePanel}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenSubmitRequest={handleOpenSubmitRequest}
          />

          {/* Body: Split View with Right-Side Iran Calendar & Meetings Panel */}
          <div className="flex min-w-0 flex-1">
            {/* Center/Left Content Area */}
            <main className="min-w-0 flex-1 space-y-6 p-4 sm:p-6">
              {/* Foreign Network / VPN Notice */}
              <ForeignVpnWarningBanner locationInfo={networkInfo} />

              {/* Team Announcement & Maintenance Banner */}
              <AnnouncementBanner teamName={teamName} />

              {/* Pinned Quick Launch & Recently Used Strip */}
              <PinnedServices
                favoriteServices={favoriteServices}
                recentServices={recentServices}
                onOpenService={markServiceOpened}
                showOnlyFavorites={showOnlyFavorites}
                onToggleShowOnlyFavorites={() => {
                  setShowOnlyFavorites(!showOnlyFavorites)
                  setCurrentPage(1)
                }}
                onToggleFavorite={toggleFavorite}
                onCopyUrl={copyUrl}
                copiedId={copiedId}
              />

              {/* Filter, Search, Tag Chips & View Style Configuration */}
              <ServicesFilterBar
                showOnlyFavorites={showOnlyFavorites}
                onToggleShowOnlyFavorites={() => {
                  setShowOnlyFavorites(!showOnlyFavorites)
                  setCurrentPage(1)
                }}
                favoritesCount={favorites.length}
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat)
                  setCurrentPage(1)
                }}
                searchQuery={searchQuery}
                onSearchChange={(q) => {
                  setSearchQuery(q)
                  setCurrentPage(1)
                }}
                selectedTag={selectedTag}
                onSelectTag={(t) => {
                  setSelectedTag(t)
                  setCurrentPage(1)
                }}
                tagCounts={tagCounts}
                onOpenAddModal={openAddModal}
                gridConfig={gridConfig}
                onChangeGridConfig={handleUpdateGridConfig}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />

              {/* Services List: Table View vs Row Cards vs Squared Cards */}
              {gridConfig.viewShape === "table" ? (
                <ServicesTable
                  services={paginatedServices}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onInspectService={setInspectingService}
                  onEditService={openEditModal}
                  onDeleteService={handleDeleteService}
                  onCopyUrl={copyUrl}
                  copiedId={copiedId}
                  healthMap={healthMap}
                  telemetryMap={telemetryMap}
                  onPingSingle={handlePingSingle}
                  mirrorMap={mirrorMap}
                  networkInfo={networkInfo}
                  selectedTag={selectedTag}
                  onSelectTag={(t) => {
                    setSelectedTag(t)
                    setCurrentPage(1)
                  }}
                  onResetFilters={() => {
                    setSelectedEnv("All")
                    setSelectedCategory("All")
                    setSelectedTag("#all")
                    setSearchQuery("")
                    setCurrentPage(1)
                  }}
                />
              ) : (
                <ServicesCardsGrid
                  services={paginatedServices}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onInspectService={setInspectingService}
                  onEditService={openEditModal}
                  onDeleteService={handleDeleteService}
                  onCopyUrl={copyUrl}
                  copiedId={copiedId}
                  healthMap={healthMap}
                  telemetryMap={telemetryMap}
                  onPingSingle={handlePingSingle}
                  mirrorMap={mirrorMap}
                  networkInfo={networkInfo}
                  selectedTag={selectedTag}
                  onSelectTag={(t) => {
                    setSelectedTag(t)
                    setCurrentPage(1)
                  }}
                  onResetFilters={() => {
                    setSelectedEnv("All")
                    setSelectedCategory("All")
                    setSelectedTag("#all")
                    setSearchQuery("")
                    setCurrentPage(1)
                  }}
                  gridConfig={gridConfig}
                  viewShape={gridConfig.viewShape}
                />
              )}

              {/* Pagination Controls */}
              <ServicesPagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pageSize={pageSize}
                setPageSize={setPageSize}
                totalItems={totalItems}
                totalPages={totalPages}
              />
            </main>
          </div>
        </SidebarInset>

        {/* Add & Edit Service Form Modals */}
        <ServiceFormDialogs
          isAddOpen={isAddOpen}
          setIsAddOpen={setIsAddOpen}
          editingService={editingService}
          setEditingService={setEditingService}
          formName={formName}
          setFormName={setFormName}
          formDescription={formDescription}
          setFormDescription={setFormDescription}
          formCategory={formCategory}
          setFormCategory={setFormCategory}
          formEnvironment={formEnvironment}
          setFormEnvironment={setFormEnvironment}
          formStatus={formStatus}
          setFormStatus={setFormStatus}
          formUrl={formUrl}
          setFormUrl={setFormUrl}
          formOwner={formOwner}
          setFormOwner={setFormOwner}
          isSubmitting={isSubmitting}
          onCreateService={handleCreateService}
          onUpdateService={handleUpdateService}
        />

        {/* Global Command Palette (Ctrl+K) */}
        <CommandPalette
          open={isCommandPaletteOpen}
          onOpenChange={setIsCommandPaletteOpen}
          services={services}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onToggleRightPanel={toggleRightPanel}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onSelectViewShape={(shape) =>
            handleUpdateGridConfig({
              ...gridConfig,
              viewShape: shape,
              viewMode: shape,
            })
          }
          onOpenSubmitRequest={handleOpenSubmitRequest}
        />

        {/* Dashboard Layout & LocalStorage JSON Settings Dialog */}
        <DashboardSettingsDialog
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          config={gridConfig}
          onSaveConfig={handleUpdateGridConfig}
        />

        {/* Service Quick-Inspect Slide-over Drawer */}
        <ServiceDetailSheet
          service={inspectingService}
          open={!!inspectingService}
          onOpenChange={(open) => !open && setInspectingService(null)}
          mirrors={
            inspectingService ? mirrorMap.get(inspectingService.id) || [] : []
          }
          onOpenSubmitRequest={handleOpenSubmitRequest}
        />

        {/* Coworker Feature Request & Bug Fix PR Submission Modal */}
        <RequestSubmitModal
          isOpen={isSubmitRequestOpen}
          onOpenChange={setIsSubmitRequestOpen}
          defaultType={submitRequestType}
          defaultService={submitRequestTargetService}
          servicesList={services.map((s) => s.name)}
        />
      </div>
    </SidebarProvider>
  )
}
