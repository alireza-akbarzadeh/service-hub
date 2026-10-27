"use client"

import * as React from "react"
import type { Service } from "@/lib/db/schema"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ForeignVpnWarningBanner } from "@/components/network-status-indicator"
import { AnnouncementBanner } from "@/components/announcement-banner"
import { CommandPalette } from "@/components/command-palette"
import { EnvGeneratorModal } from "@/components/env-generator-modal"
import { OnboardingModal } from "@/components/onboarding-modal"
import { ServiceDetailSheet } from "@/components/service-detail-sheet"

// Modular Dashboard Components & Custom Hook
import { useServicesDashboard, getServiceTags } from "@/hooks/use-services-dashboard"
export { getServiceTags }

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { PinnedServices } from "@/components/dashboard/pinned-services"
import { ServicesFilterBar } from "@/components/dashboard/services-filter-bar"
import { ServicesTable } from "@/components/dashboard/services-table"
import { ServicesCardsGrid } from "@/components/dashboard/services-cards-grid"
import {
  GridConfig,
  loadGridConfig,
  saveGridConfig,
} from "@/components/dashboard/grid-view-config"
import { ServicesPagination } from "@/components/dashboard/services-pagination"
import { ServiceFormDialogs } from "@/components/dashboard/service-form-dialogs"
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
    isOnboardingOpen,
    setIsOnboardingOpen,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isEnvModalOpen,
    setIsEnvModalOpen,
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
          onOpenEnvModal={() => setIsEnvModalOpen(true)}
          onOpenTour={() => setIsOnboardingOpen(true)}
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
          />

          {/* Body: Split View with Right-Side Iran Calendar & Meetings Panel */}
          <div className="flex flex-1 min-w-0">
            {/* Center/Left Content Area */}
            <main className="min-w-0 flex-1 space-y-6 p-4 sm:p-6">
              {/* Foreign Network / VPN Notice */}
              <ForeignVpnWarningBanner locationInfo={networkInfo} />

              {/* Team Announcement & Maintenance Banner */}
              <AnnouncementBanner teamName={teamName} />

              {/* Service Status Overview Metric Cards */}
              <StatsOverview stats={stats} />

              {/* Pinned Quick Launch Strip */}
              <PinnedServices
                favoriteServices={favoriteServices}
                showOnlyFavorites={showOnlyFavorites}
                onToggleShowOnlyFavorites={() => {
                  setShowOnlyFavorites(!showOnlyFavorites)
                  setCurrentPage(1)
                }}
                onToggleFavorite={toggleFavorite}
                onCopyUrl={copyUrl}
                copiedId={copiedId}
              />

              {/* Filter, Search & Tag Chips */}
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
              />

              {/* Services Data Table */}
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

            {/* Right Side: Iran Timezone & Calendar + Frontend Meeting Push Panel */}
            {isRightPanelOpen && (
              <IranCalendarPanel
                className="hidden xl:flex w-84 2xl:w-[410px] shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] shadow-lg"
                onClose={() => setIsRightPanelOpen(false)}
                isCollapsible={true}
              />
            )}
          </div>
        </SidebarInset>

        {/* Mobile / Tablet Drawer for Iran Calendar & Meetings Panel */}
        <Sheet open={isMobilePanelOpen} onOpenChange={setIsMobilePanelOpen}>
          <SheetContent side="right" className="w-[340px] sm:w-[400px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Iranian Calendar & Frontend Meeting</SheetTitle>
            </SheetHeader>
            <IranCalendarPanel
              className="h-full border-none"
              onClose={() => setIsMobilePanelOpen(false)}
              isCollapsible={true}
            />
          </SheetContent>
        </Sheet>

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

        {/* Global Guided Tour Modal */}
        <OnboardingModal
          open={isOnboardingOpen}
          onOpenChange={setIsOnboardingOpen}
        />

        {/* Global Command Palette (Ctrl+K) */}
        <CommandPalette
          open={isCommandPaletteOpen}
          onOpenChange={setIsCommandPaletteOpen}
          services={services}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onToggleRightPanel={toggleRightPanel}
        />

        {/* Frontend .env Generator Modal */}
        <EnvGeneratorModal
          open={isEnvModalOpen}
          onOpenChange={setIsEnvModalOpen}
          services={services}
        />

        {/* Service Quick-Inspect Slide-over Drawer */}
        <ServiceDetailSheet
          service={inspectingService}
          open={!!inspectingService}
          onOpenChange={(open) => !open && setInspectingService(null)}
          mirrors={
            inspectingService ? mirrorMap.get(inspectingService.id) || [] : []
          }
        />
      </div>
    </SidebarProvider>
  )
}
